import { db } from '@/db'
import { capabilities, sources, demos, ingestionEvents } from '@/db/schema'
import { scrapeForTopic } from '@/lib/ingestion/scraper'
import { classifyAndBrief } from '@/lib/ingestion/classifier'
import { eq } from 'drizzle-orm'

export async function runIngestionPipeline(
  topicInput: string,
  providedUrl?: string,
): Promise<{ eventId: number; capabilityId?: number }> {
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
      rankScore: classified.impactScore * 10,
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
