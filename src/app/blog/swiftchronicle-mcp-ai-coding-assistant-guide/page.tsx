import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ArrowRight, Terminal, Zap } from 'lucide-react'

const BASE = 'https://swiftchronicle.com'
const PAGE_URL = `${BASE}/blog/swiftchronicle-mcp-ai-coding-assistant-guide`
const OG_IMG = `/api/og?name=SwiftChronicle+MCP+Guide&summary=Connect+Claude+Code%2C+Cursor%2C+or+Windsurf+to+SwiftChronicle+to+get+iOS+27+API+answers+inside+your+editor.&category=System&impact=4`
const PUBLISHED = '2026-07-01'

export const metadata: Metadata = {
  title: 'Using SwiftChronicle MCP with Claude Code, Cursor, and Windsurf',
  description: 'Step-by-step guide to connecting your AI coding assistant to SwiftChronicle\'s MCP server — get iOS 27 API answers, Swift code demos, and migration estimates from inside your editor.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'SwiftChronicle MCP Guide — Claude Code, Cursor, Windsurf',
    description: 'Connect your AI assistant to SwiftChronicle to query iOS 27 APIs from inside your editor.',
    url: PAGE_URL,
    images: [{ url: OG_IMG, width: 1200, height: 630, alt: 'SwiftChronicle MCP Guide' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SwiftChronicle MCP with Claude Code, Cursor & Windsurf',
    description: 'Connect your AI coding assistant to SwiftChronicle for instant iOS 27 API answers.',
    images: [OG_IMG],
  },
}

const TOOLS = [
  { name: 'list_capabilities', desc: 'Search and filter iOS 27 capabilities by category, framework, change type, or keyword' },
  { name: 'get_capability',    desc: 'Get full details, compilable Swift code demo, and gotchas for a specific capability' },
  { name: 'find_affected_apis', desc: 'Given framework names or API symbols, find which iOS 27 capabilities are relevant' },
  { name: 'get_migration_diff', desc: 'Get side-by-side before/after Swift code for updated APIs' },
  { name: 'estimate_migration', desc: 'Estimate the effort and risk to adopt a capability in a given project context' },
]

const EXAMPLES = [
  'List all new AI capabilities in iOS 27 that use FoundationModels',
  'Show me the Swift code for Foundation Models streaming generation',
  'What APIs changed in iOS 27 that affect my StoreKit integration?',
  'Get the before/after migration diff for App Intents in iOS 27',
  'Which deprecated APIs in iOS 27 have no direct replacement?',
  'Estimate how much work it would be to adopt RealityKit 4 in a shopping AR app',
  'Show me all Liquid Glass-related SwiftUI capabilities',
]

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': PAGE_URL,
    headline: 'Using SwiftChronicle MCP with Claude Code, Cursor, and Windsurf',
    description: 'Guide to connecting AI coding assistants to the SwiftChronicle MCP server.',
    url: PAGE_URL,
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    author: { '@type': 'Person', name: 'Fahad Shafique' },
    publisher: { '@type': 'Organization', name: 'SwiftChronicle', url: BASE },
    mainEntityOfPage: { '@type': 'WebPage', '@id': PAGE_URL },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE}/blog` },
      { '@type': 'ListItem', position: 3, name: 'SwiftChronicle MCP Guide', item: PAGE_URL },
    ],
  },
]

export default function MCPGuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-6 py-16 animate-page-enter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 group">
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Blog
      </Link>

      <div className="mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-1 text-xs font-medium text-emerald-400 mb-6">
          <Terminal className="h-3 w-3" /> MCP Guide
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5 leading-tight">
          Using SwiftChronicle MCP with Claude Code, Cursor, and Windsurf
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          SwiftChronicle's MCP server lets your AI coding assistant query iOS 27 APIs in real time — without leaving your editor. Ask your assistant to find the Swift code for a capability, check which APIs changed in iOS 27, estimate migration effort, or list all deprecated UIKit methods. It speaks directly to the SwiftChronicle database via the Model Context Protocol.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Setup takes under two minutes in any MCP-compatible editor. Here's how.
        </p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-12" />

      {/* Tools section */}
      <section className="mb-14">
        <h2 className="text-lg font-semibold mb-6">What you can do</h2>
        <div className="space-y-3">
          {TOOLS.map(tool => (
            <div key={tool.name} className="flex items-start gap-3 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div>
                <code className="text-xs font-mono text-emerald-400">{tool.name}</code>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tool.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Setup section */}
      <section className="mb-14">
        <h2 className="text-lg font-semibold mb-6">Quick setup</h2>

        <div className="space-y-8">
          {/* Claude Code */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-violet-500/15 flex items-center justify-center text-[10px] font-bold text-violet-400">1</span>
              Claude Code
            </h3>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              Add the following to your <code className="text-xs bg-white/[0.07] rounded px-1.5 py-0.5">.claude/mcp.json</code> (project-level) or <code className="text-xs bg-white/[0.07] rounded px-1.5 py-0.5">~/.claude/mcp.json</code> (global):
            </p>
            <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs text-muted-foreground font-mono leading-relaxed whitespace-pre">{`{
  "mcpServers": {
    "swiftchronicle": {
      "type": "http",
      "url": "https://swiftchronicle.com/api/mcp"
    }
  }
}`}</pre>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Then restart Claude Code. The five SwiftChronicle tools will appear in <code className="text-xs bg-white/[0.07] rounded px-1 py-0.5">/mcp</code>.
            </p>
          </div>

          {/* Cursor */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-violet-500/15 flex items-center justify-center text-[10px] font-bold text-violet-400">2</span>
              Cursor
            </h3>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              Open <strong>Settings → Cursor Settings → MCP</strong> and add a new server:
            </p>
            <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs text-muted-foreground font-mono leading-relaxed whitespace-pre">{`Name: SwiftChronicle
Type: Streamable HTTP
URL:  https://swiftchronicle.com/api/mcp`}</pre>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Cursor will auto-discover tools on save. Ask anything in Composer with <code className="text-xs bg-white/[0.07] rounded px-1 py-0.5">@SwiftChronicle</code>.
            </p>
          </div>

          {/* Windsurf */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-violet-500/15 flex items-center justify-center text-[10px] font-bold text-violet-400">3</span>
              Windsurf
            </h3>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              Open the MCP panel in Cascade and click <strong>Add Server</strong>:
            </p>
            <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs text-muted-foreground font-mono leading-relaxed whitespace-pre">{`Server URL: https://swiftchronicle.com/api/mcp
Transport:  Streamable HTTP`}</pre>
            </div>
          </div>

          {/* Zed */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-violet-500/15 flex items-center justify-center text-[10px] font-bold text-violet-400">4</span>
              Zed
            </h3>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              In <code className="text-xs bg-white/[0.07] rounded px-1.5 py-0.5">~/.config/zed/settings.json</code>:
            </p>
            <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 overflow-x-auto">
              <pre className="text-xs text-muted-foreground font-mono leading-relaxed whitespace-pre">{`{
  "context_servers": {
    "swiftchronicle": {
      "settings": {
        "url": "https://swiftchronicle.com/api/mcp"
      }
    }
  }
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Example prompts */}
      <section className="mb-14">
        <h2 className="text-lg font-semibold mb-6">Example prompts</h2>
        <div className="space-y-2">
          {EXAMPLES.map((ex, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.01]">
              <span className="text-xs text-violet-400/60 font-mono shrink-0 mt-0.5 w-4">{i + 1}.</span>
              <p className="text-sm text-muted-foreground leading-relaxed">{ex}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6">
        <p className="text-sm font-semibold mb-1">View full setup instructions</p>
        <p className="text-xs text-muted-foreground mb-4">The MCP page has the latest endpoint URL and editor-specific deep-links.</p>
        <Link href="/mcp" className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
          SwiftChronicle MCP page <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
