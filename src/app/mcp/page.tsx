import type { Metadata } from 'next'
import { CopyButton } from '@/components/features/CopyButton'
import { LoginGate } from '@/components/features/LoginGate'
import { auth } from '@clerk/nextjs/server'

export const metadata: Metadata = {
  title: 'MCP Server',
  description: 'Connect your AI coding assistant to SwiftChronicle — query iOS 27 capabilities, get Swift code, and estimate migration effort directly from your editor.',
}

const MCP_URL = 'https://swiftchronicle.com/api/mcp'

const MCP_JSON = `{
  "mcpServers": {
    "swiftchronicle": {
      "type": "http",
      "url": "https://swiftchronicle.com/api/mcp"
    }
  }
}`

const TOOLS = [
  {
    name: 'list_capabilities',
    description: 'List and search iOS 27 SDK capabilities. Returns all matching capabilities with name, summary, category, frameworks, and impact score.',
    params: [
      { name: 'category', type: 'string?', desc: 'AI | UI | Performance | Safety | Store | System' },
      { name: 'framework', type: 'string?', desc: 'e.g. "FoundationModels", "SwiftUI", "ActivityKit"' },
      { name: 'changeType', type: 'string?', desc: 'new | updated | deprecated' },
      { name: 'q', type: 'string?', desc: 'Full-text search across name and summary' },
    ],
    example: 'List all new AI capabilities in iOS 27',
  },
  {
    name: 'get_capability',
    description: 'Get full details for a specific capability: summary, why it matters, gotchas, hardware requirements, and a compilable Swift code demo.',
    params: [
      { name: 'slug', type: 'string', desc: 'The capability slug from list_capabilities' },
    ],
    example: 'Get the Foundation Models capability with its Swift code example',
  },
  {
    name: 'find_affected_apis',
    description: 'Given framework names or API symbols used in your project, find which iOS 27 capabilities are relevant for you to review.',
    params: [
      { name: 'symbols', type: 'string[]', desc: 'Framework names, class names, or API symbols (e.g. ["ObservableObject", "ActivityKit"])' },
    ],
    example: 'My app uses ActivityKit and HealthKit — what changed in iOS 27?',
  },
  {
    name: 'get_migration_diff',
    description: 'For updated APIs, get side-by-side Swift code showing the old iOS 26 pattern versus the new iOS 27 pattern.',
    params: [
      { name: 'slug', type: 'string', desc: 'Slug of a capability with changeType "updated"' },
    ],
    example: 'Show me what changed in the App Intents API and how to update my code',
  },
  {
    name: 'estimate_migration',
    description: 'Estimate the viability, risk level, and effort (hours/days) to adopt a capability in your project. Optionally provide project context for a tailored assessment.',
    params: [
      { name: 'slug', type: 'string', desc: 'The capability slug' },
      { name: 'project_context', type: 'string?', desc: 'Describe your project or paste relevant code/architecture' },
    ],
    example: 'How hard would it be to add Foundation Models to my notes app?',
  },
]

const INTEGRATIONS = [
  {
    name: 'Claude Code',
    description: 'Add to your project\'s mcp.json or your global Claude settings.',
    code: MCP_JSON,
  },
  {
    name: 'Cursor',
    description: 'Go to Settings → MCP → Add Server, paste the URL.',
    code: MCP_URL,
  },
  {
    name: 'Windsurf',
    description: 'Open the MCP panel and add a new HTTP server with the URL.',
    code: MCP_URL,
  },
  {
    name: 'Zed',
    description: 'Add to your Zed settings under assistant.context_servers.',
    code: `{
  "swiftchronicle": {
    "command": {
      "path": "npx",
      "args": ["-y", "mcp-remote", "${MCP_URL}"]
    }
  }
}`,
  },
]

export default async function McpPage() {
  const { userId } = await auth()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 animate-page-enter">

      {/* Hero */}
      <div className="mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/[0.08] px-3 py-1 text-xs font-medium text-violet-400 mb-6">
          MCP Server · Streamable HTTP
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">SwiftChronicle MCP</h1>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
          Connect your AI coding assistant directly to SwiftChronicle. Query iOS 27 capabilities, pull real Swift code demos, and get migration estimates — without leaving your editor.
        </p>

        {/* Connection URL — only shown to logged-in users */}
        {userId && (
          <>
            <div className="mt-8 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
              <code className="flex-1 text-sm font-mono text-violet-300 truncate">{MCP_URL}</code>
              <CopyButton code={MCP_URL} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">No authentication required · Public read access · Stateless</p>
          </>
        )}
      </div>

      {/* Gated content */}
      {userId ? (
        <>
          {/* Tools */}
          <section className="mb-16">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">5 tools available</h2>
            <div className="space-y-4">
              {TOOLS.map(tool => (
                <div key={tool.name} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <code className="text-sm font-mono font-semibold text-violet-300">{tool.name}</code>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{tool.description}</p>

                  {/* Parameters */}
                  <div className="space-y-1.5 mb-4">
                    {tool.params.map(p => (
                      <div key={p.name} className="flex items-start gap-3 text-xs">
                        <code className="text-emerald-400 shrink-0 w-36">{p.name}</code>
                        <span className="text-muted-foreground/50 shrink-0 font-mono">{p.type}</span>
                        <span className="text-muted-foreground">{p.desc}</span>
                      </div>
                    ))}
                  </div>

                  {/* Example */}
                  <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2">
                    <p className="text-[11px] text-muted-foreground/50 uppercase tracking-wider mb-1">Example prompt</p>
                    <p className="text-xs text-muted-foreground italic">&ldquo;{tool.example}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Integrations */}
          <section className="mb-16">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">Connect your editor</h2>
            <div className="space-y-4">
              {INTEGRATIONS.map(int => (
                <div key={int.name} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm">{int.name}</h3>
                    <CopyButton code={int.code} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{int.description}</p>
                  <pre className="text-xs font-mono bg-white/[0.03] rounded-lg p-3 overflow-x-auto text-muted-foreground whitespace-pre-wrap break-all">
                    {int.code}
                  </pre>
                </div>
              ))}
            </div>
          </section>

          {/* What you can ask */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">What you can ask</h2>
            <div className="rounded-xl border border-white/[0.07] overflow-hidden divide-y divide-white/[0.05]">
              {[
                'What are the highest-impact new APIs in iOS 27 for a notes app?',
                'Show me how to use the Foundation Models framework with a Swift code example.',
                'My app uses ObservableObject and ActivityKit. What changed in iOS 27?',
                'What\'s the before/after diff for the updated App Intents API?',
                'How long would it take to add Liquid Glass controls to my app?',
                'List all deprecated APIs in iOS 27 that I need to remove.',
              ].map((q, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <span className="text-muted-foreground/30 font-mono text-xs shrink-0 mt-0.5 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <p className="text-sm text-muted-foreground italic">&ldquo;{q}&rdquo;</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <LoginGate
          title="Sign in to access the MCP server"
          description="Connect Claude Code, Cursor, or Windsurf directly to SwiftChronicle — query iOS 27 capabilities and get Swift code without leaving your editor."
        />
      )}
    </div>
  )
}
