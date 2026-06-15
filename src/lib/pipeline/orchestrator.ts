import { db } from '@/db'
import { capabilities, sources, demos, ingestionEvents } from '@/db/schema'
import { scrapeForTopic } from '@/lib/ingestion/scraper'
import { classifyAndBrief } from '@/lib/ingestion/classifier'
import { eq, desc, sql } from 'drizzle-orm'

const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'api', 'ios', 'apple', 'new', 'using', 'via'])

function wordSet(text: string): Set<string> {
  return new Set(
    text.toLowerCase().split(/\W+/).filter(w => w.length >= 3 && !STOP_WORDS.has(w))
  )
}

async function findDuplicate(topicInput: string): Promise<{ slug: string; name: string } | null> {
  const existing = await db
    .select({ slug: capabilities.slug, name: capabilities.name, status: capabilities.status })
    .from(capabilities)
  const topicWords = wordSet(topicInput)
  if (topicWords.size === 0) return null

  for (const cap of existing) {
    if (cap.status === 'deprecated') continue
    const nameWords = wordSet(cap.name)
    const overlap = [...topicWords].filter(w => nameWords.has(w)).length
    // Flag if ≥60% of topic words appear in the existing capability name
    if (overlap / topicWords.size >= 0.6) return cap
  }
  return null
}

export async function runIngestionPipeline(
  topicInput: string,
  providedUrl?: string,
): Promise<{ eventId: number; capabilityId?: number }> {
  // Duplicate pre-flight check before creating any DB records
  const duplicate = await findDuplicate(topicInput)
  if (duplicate) {
    throw Object.assign(
      new Error(`Duplicate detected: "${topicInput}" likely matches existing capability "${duplicate.name}"`),
      { code: 'DUPLICATE', existingSlug: duplicate.slug, existingName: duplicate.name },
    )
  }

  const [event] = await db.insert(ingestionEvents).values({
    topicInput,
    sourceUrl: providedUrl ?? null,
    status: 'running',
  }).returning()

  try {
    // Step 1: Scrape Apple docs + WWDC session
    const scraped = await scrapeForTopic(topicInput, providedUrl)

    await db.update(ingestionEvents)
      .set({ status: 'parsed' })
      .where(eq(ingestionEvents.id, event.id))

    // Step 2: LLM classification + demo brief
    const classified = await classifyAndBrief(
      topicInput,
      scraped.docsContent,
      scraped.wwdcSession?.transcript ?? '',
      scraped.wwdcSession?.title,
    )

    // iOS 27 relevance gate — reject topics the LLM flagged as not iOS 27-specific
    if (!classified.isNewOrChangedInIOS27) {
      throw Object.assign(
        new Error(classified.rejectionReason ?? `"${topicInput}" does not appear to be new or changed in iOS 27 / WWDC 2026`),
        { code: 'NOT_IOS27', rejectionReason: classified.rejectionReason },
      )
    }

    // Post-LLM slug dedup (catches cases where LLM normalises to an existing slug)
    const [slugConflict] = await db
      .select({ id: capabilities.id, name: capabilities.name })
      .from(capabilities)
      .where(eq(capabilities.slug, classified.slug))
      .limit(1)

    if (slugConflict) {
      throw Object.assign(
        new Error(`Slug conflict: "${classified.slug}" already exists as "${slugConflict.name}"`),
        { code: 'DUPLICATE', existingSlug: classified.slug, existingName: slugConflict.name },
      )
    }

    // Step 3: Write capability
    const [cap] = await db.insert(capabilities).values({
      slug: classified.slug,
      name: classified.name,
      summary: classified.summary,
      whyItMatters: classified.whyItMatters,
      category: classified.category,
      frameworks: classified.frameworks,
      availability: classified.availability,
      hardwareConstraints: classified.hardwareConstraints ?? null,
      gotchas: classified.gotchas ?? null,
      impactScore: classified.impactScore,
      rankScore: classified.impactScore * 100,
      changeType: classified.changeType,
      changesSince: classified.changesSince ?? null,
      status: 'needs_review',
    }).returning()

    // Step 4: Write sources
    type SourceInsert = { capabilityId: number; type: 'doc_page' | 'wwdc_session'; title: string; url: string; official: boolean; summary?: string }
    const sourceInserts: SourceInsert[] = scraped.docsContent.map(doc => ({
      capabilityId: cap.id,
      type: 'doc_page' as const,
      title: doc.title,
      url: doc.url,
      official: true,
    }))

    if (scraped.wwdcSession) {
      sourceInserts.push({
        capabilityId: cap.id,
        type: 'wwdc_session' as const,
        title: scraped.wwdcSession.title,
        url: scraped.wwdcSession.url,
        official: true,
      })
    }

    if (sourceInserts.length) await db.insert(sources).values(sourceInserts)

    // Step 5: Write demo brief
    const [demo] = await db.insert(demos).values({
      capabilityId: cap.id,
      title: classified.demo.title,
      description: classified.demo.description,
      complexity: classified.demo.complexity,
      codeSnippet: classified.demo.codeSnippet,
      previousCodeSnippet: classified.demo.previousCodeSnippet ?? null,
      status: 'planned',
    }).returning()

    // Link demo back to capability
    await db.update(capabilities)
      .set({ demoId: demo.id, updatedAt: new Date() })
      .where(eq(capabilities.id, cap.id))

    // Step 6: Mark ingestion event complete
    await db.update(ingestionEvents)
      .set({ status: 'classified', parsedPayload: classified as unknown as Record<string, unknown>, capabilityId: cap.id })
      .where(eq(ingestionEvents.id, event.id))

    return { eventId: event.id, capabilityId: cap.id }
  } catch (err) {
    await db.update(ingestionEvents)
      .set({
        status: 'failed',
        errorMessage: err instanceof Error ? err.message : String(err),
      })
      .where(eq(ingestionEvents.id, event.id))
    throw err
  }
}

export async function refreshCapability(capabilityId: number): Promise<void> {
  // Find original topic from ingestion events
  const [event] = await db
    .select({ topicInput: ingestionEvents.topicInput, sourceUrl: ingestionEvents.sourceUrl })
    .from(ingestionEvents)
    .where(eq(ingestionEvents.capabilityId, capabilityId))
    .orderBy(desc(ingestionEvents.createdAt))
    .limit(1)

  if (!event) throw new Error(`No ingestion event found for capability ${capabilityId}`)

  const scraped = await scrapeForTopic(event.topicInput, event.sourceUrl ?? undefined)
  const classified = await classifyAndBrief(
    event.topicInput,
    scraped.docsContent,
    scraped.wwdcSession?.transcript ?? '',
    scraped.wwdcSession?.title,
  )

  // Update capability fields (preserve status, verifiedOnBeta)
  const newImpact = classified.impactScore
  await db.update(capabilities).set({
    name: classified.name,
    summary: classified.summary,
    whyItMatters: classified.whyItMatters,
    category: classified.category,
    frameworks: classified.frameworks,
    availability: classified.availability,
    hardwareConstraints: classified.hardwareConstraints ?? null,
    gotchas: classified.gotchas ?? null,
    impactScore: newImpact,
    rankScore: sql`${newImpact} * 100 + ${capabilities.viewCount} * 0.5`,
    changeType: classified.changeType,
    changesSince: classified.changesSince ?? null,
    status: 'needs_review',
    updatedAt: new Date(),
  }).where(eq(capabilities.id, capabilityId))

  // Update linked demo
  const [cap] = await db.select({ demoId: capabilities.demoId }).from(capabilities).where(eq(capabilities.id, capabilityId))
  if (cap?.demoId) {
    await db.update(demos).set({
      title: classified.demo.title,
      description: classified.demo.description,
      complexity: classified.demo.complexity,
      codeSnippet: classified.demo.codeSnippet,
      previousCodeSnippet: classified.demo.previousCodeSnippet ?? null,
    }).where(eq(demos.id, cap.demoId))
  }
}
