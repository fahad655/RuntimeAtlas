import { NextRequest } from 'next/server'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { z } from 'zod'
import { db } from '@/db'
import { capabilities, demos } from '@/db/schema'
import { and, eq, or, ilike } from 'drizzle-orm'
import type { Category } from '@/types'

function buildServer() {
  const server = new McpServer({
    name: 'RuntimeAtlas',
    version: '1.0.0',
  })

  // ── list_capabilities ───────────────────────────────────────────
  server.tool(
    'list_capabilities',
    'List iOS 27 SDK capabilities. Filter by category, framework, or changeType (new/updated/deprecated).',
    {
      category:   z.enum(['AI', 'UI', 'Performance', 'Safety', 'Store', 'System']).optional(),
      framework:  z.string().optional().describe('e.g. "FoundationModels", "SwiftUI", "ActivityKit"'),
      changeType: z.enum(['new', 'updated', 'deprecated']).optional(),
      q:          z.string().optional().describe('Full-text search across name and summary'),
    },
    async ({ category, framework, changeType, q }) => {
      const conditions = [eq(capabilities.status, 'ready')]
      if (category) conditions.push(eq(capabilities.category, category as Category))
      if (changeType) conditions.push(eq(capabilities.changeType, changeType))
      if (q) conditions.push(or(ilike(capabilities.name, `%${q}%`), ilike(capabilities.summary, `%${q}%`))!)

      let rows = await db
        .select({
          slug: capabilities.slug, name: capabilities.name, category: capabilities.category,
          summary: capabilities.summary, frameworks: capabilities.frameworks,
          impactScore: capabilities.impactScore, changeType: capabilities.changeType,
          availability: capabilities.availability,
        })
        .from(capabilities)
        .where(and(...conditions))
        .orderBy()

      if (framework) rows = rows.filter(r => r.frameworks.includes(framework))

      const text = rows.map(r =>
        `[${r.changeType.toUpperCase()}] ${r.name} (${r.category}, impact ${r.impactScore}/5)\n  slug: ${r.slug}\n  ${r.summary}`
      ).join('\n\n')

      return { content: [{ type: 'text', text: text || 'No capabilities found.' }] }
    },
  )

  // ── get_capability ───────────────────────────────────────────────
  server.tool(
    'get_capability',
    'Get full details for a specific iOS 27 capability: summary, why it matters, gotchas, hardware requirements, and code demo.',
    { slug: z.string().describe('The capability slug from list_capabilities') },
    async ({ slug }) => {
      const [cap] = await db.select().from(capabilities).where(eq(capabilities.slug, slug)).limit(1)
      if (!cap) return { content: [{ type: 'text', text: `Capability "${slug}" not found.` }] }

      const [demo] = cap.demoId
        ? await db.select().from(demos).where(eq(demos.id, cap.demoId)).limit(1)
        : []

      const lines = [
        `# ${cap.name}`,
        `**Status**: ${cap.changeType === 'new' ? 'New in iOS 27' : cap.changeType === 'updated' ? 'Updated in iOS 27' : 'Deprecated'}`,
        `**Category**: ${cap.category}  |  **Impact**: ${cap.impactScore}/5  |  **Availability**: ${cap.availability}`,
        cap.frameworks.length ? `**Frameworks**: ${cap.frameworks.join(', ')}` : '',
        '',
        `## Summary\n${cap.summary}`,
        cap.whyItMatters ? `\n## Why it matters\n${cap.whyItMatters}` : '',
        cap.changesSince ? `\n## What changed from iOS 26\n${cap.changesSince}` : '',
        cap.gotchas ? `\n## Gotchas\n${cap.gotchas}` : '',
        cap.hardwareConstraints ? `\n## Hardware requirements\n${cap.hardwareConstraints}` : '',
        cap.verifiedOnBeta ? `\n**Verified on**: ${cap.verifiedOnBeta}` : '',
        demo?.codeSnippet ? `\n## Code Demo (${demo.complexity})\n\`\`\`swift\n${demo.codeSnippet}\n\`\`\`` : '',
      ].filter(Boolean).join('\n')

      return { content: [{ type: 'text', text: lines }] }
    },
  )

  // ── find_affected_apis ───────────────────────────────────────────
  server.tool(
    'find_affected_apis',
    'Given Apple framework names or API symbols used in a project, find which iOS 27 capabilities are relevant for migration.',
    {
      symbols: z.array(z.string()).describe('Framework names, class names, or API symbols from the project (e.g. ["ObservableObject", "ActivityKit", "HealthKit"])'),
    },
    async ({ symbols }) => {
      const allCaps = await db
        .select({ slug: capabilities.slug, name: capabilities.name, frameworks: capabilities.frameworks, changeType: capabilities.changeType, summary: capabilities.summary })
        .from(capabilities)
        .where(eq(capabilities.status, 'ready'))

      const lower = symbols.map(s => s.toLowerCase())
      const matches = allCaps.filter(cap => {
        const fwLower = cap.frameworks.map(f => f.toLowerCase())
        const nameLower = cap.name.toLowerCase()
        return lower.some(sym => fwLower.some(fw => fw.includes(sym) || sym.includes(fw)) || nameLower.includes(sym))
      })

      if (!matches.length) return { content: [{ type: 'text', text: 'No matching iOS 27 capabilities found for the provided symbols.' }] }

      const text = matches.map(m =>
        `• [${m.changeType.toUpperCase()}] **${m.name}** (slug: \`${m.slug}\`)\n  ${m.summary}`
      ).join('\n\n')

      return { content: [{ type: 'text', text: `Found ${matches.length} relevant capability/capabilities:\n\n${text}` }] }
    },
  )

  // ── get_migration_diff ───────────────────────────────────────────
  server.tool(
    'get_migration_diff',
    'For an "updated" capability, get the before (iOS 26) and after (iOS 27) code showing what needs to change.',
    { slug: z.string() },
    async ({ slug }) => {
      const [cap] = await db.select({ demoId: capabilities.demoId, name: capabilities.name, changeType: capabilities.changeType })
        .from(capabilities).where(eq(capabilities.slug, slug)).limit(1)

      if (!cap) return { content: [{ type: 'text', text: `Capability "${slug}" not found.` }] }
      if (cap.changeType !== 'updated') return { content: [{ type: 'text', text: `"${cap.name}" is not an updated API — no migration diff available.` }] }
      if (!cap.demoId) return { content: [{ type: 'text', text: 'No demo available for this capability.' }] }

      const [demo] = await db.select().from(demos).where(eq(demos.id, cap.demoId)).limit(1)
      if (!demo?.previousCodeSnippet) return { content: [{ type: 'text', text: 'Migration diff not available for this capability yet.' }] }

      const text = [
        `# Migration Diff: ${cap.name}`,
        `\n## Before (iOS 26)\n\`\`\`swift\n${demo.previousCodeSnippet}\n\`\`\``,
        `\n## After (iOS 27)\n\`\`\`swift\n${demo.codeSnippet}\n\`\`\``,
      ].join('\n')

      return { content: [{ type: 'text', text: text }] }
    },
  )

  // ── estimate_migration ───────────────────────────────────────────
  server.tool(
    'estimate_migration',
    'Estimate viability, risk, and effort to adopt a specific iOS 27 capability in a project.',
    {
      slug:            z.string(),
      project_context: z.string().optional().describe('Describe the project or paste relevant code/architecture details'),
    },
    async ({ slug, project_context }) => {
      const [cap] = await db.select().from(capabilities).where(eq(capabilities.slug, slug)).limit(1)
      if (!cap) return { content: [{ type: 'text', text: `Capability "${slug}" not found.` }] }

      const [demo] = cap.demoId
        ? await db.select({ complexity: demos.complexity }).from(demos).where(eq(demos.id, cap.demoId)).limit(1)
        : []

      const effortMap: Record<string, string> = { Simple: '1–4 hours', Medium: '1–3 days', Advanced: '1–2 weeks' }
      const riskFactors: string[] = []
      if (cap.hardwareConstraints) riskFactors.push(`Hardware gate: ${cap.hardwareConstraints}`)
      if (cap.gotchas) riskFactors.push(`Known gotchas: ${cap.gotchas}`)
      if (cap.changeType === 'updated') riskFactors.push('API changed from previous version — review migration diff with get_migration_diff')

      const lines = [
        `# Migration Estimate: ${cap.name}`,
        `\n**Viability**: ${cap.hardwareConstraints ? 'Conditional (hardware/region gate)' : 'Available to all apps on iOS 27+'}`,
        `**Risk**: ${riskFactors.length === 0 ? 'Low — no known blockers' : 'Medium'}`,
        `**Effort**: ${demo ? effortMap[demo.complexity] ?? demo.complexity : 'Unknown — no demo data'}`,
        riskFactors.length ? `\n**Risk factors**:\n${riskFactors.map(r => `• ${r}`).join('\n')}` : '',
        project_context ? `\n**Project context**: ${project_context}\n\n*Use \`get_capability\` and \`get_migration_diff\` for the full code details, then apply to your specific project.*` : '',
      ].filter(Boolean).join('\n')

      return { content: [{ type: 'text', text: lines }] }
    },
  )

  return server
}

// Next.js App Router handler
export async function POST(req: NextRequest) {
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined })
  const server = buildServer()
  await server.connect(transport)
  return transport.handleRequest(req)
}

export async function GET(req: NextRequest) {
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined })
  const server = buildServer()
  await server.connect(transport)
  return transport.handleRequest(req)
}

export async function DELETE(req: NextRequest) {
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined })
  const server = buildServer()
  await server.connect(transport)
  return transport.handleRequest(req)
}
