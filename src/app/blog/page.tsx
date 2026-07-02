import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'In-depth guides and references for iOS 27 developers — AI APIs, Liquid Glass, migration guides, spatial computing, and MCP setup.',
  alternates: { canonical: 'https://swiftchronicle.com/blog' },
  openGraph: { title: 'Blog — SwiftChronicle', description: 'iOS 27 developer guides: AI APIs, Liquid Glass, migration, spatial computing, and more.', url: 'https://swiftchronicle.com/blog' },
}

const POSTS = [
  {
    slug: 'ios-27-apple-intelligence-apis',
    title: 'iOS 27 On-Device AI & Apple Intelligence: Foundation Models and Beyond',
    description: 'Every AI capability in iOS 27 — Foundation Models for on-device LLM inference, Image Playground integration, Writing Tools APIs, and more from WWDC 2026.',
    tag: 'AI Guide',
    tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    slug: 'swiftui-ios-27-whats-new',
    title: 'SwiftUI & Liquid Glass in iOS 27: The Complete UI Change Reference',
    description: 'Liquid Glass, .glassEffect(), new SwiftUI controls, UIKit deprecations — complete reference for every UI API change in iOS 27.',
    tag: 'SwiftUI',
    tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    slug: 'wwdc-2026-complete-api-list',
    title: 'WWDC 2026: Complete iOS 27 SDK API Reference',
    description: 'Every new and updated capability from WWDC 2026 organized by category — the comprehensive reference Apple forgot to ship.',
    tag: 'Reference',
    tagColor: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
  },
  {
    slug: 'ios-26-to-ios-27-migration',
    title: 'iOS 26 to iOS 27 Migration: Complete Before/After API Reference',
    description: 'Every updated API from WWDC 2026 with before/after Swift code diffs — ordered by impact so you know what to fix first.',
    tag: 'Migration Guide',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    slug: 'ios-27-deprecations-breaking-changes',
    title: 'iOS 27 Breaking Changes & Deprecations: Complete Developer Reference',
    description: 'Every deprecated iOS 27 API from WWDC 2026, organized by impact score. Know what to remove before the first public beta.',
    tag: 'Breaking Changes',
    tagColor: 'text-red-400 bg-red-500/10 border-red-500/20',
  },
  {
    slug: 'realitykit-usdkit-ios-27-spatial-computing',
    title: 'RealityKit & USDKit in iOS 27: Spatial Computing for iOS Developers',
    description: 'Reality Composer Pro 3, USDKit expanding to iOS, RealityKit 4 — the full reference for spatial computing on iOS 27.',
    tag: 'Spatial Computing',
    tagColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  {
    slug: 'swiftchronicle-mcp-ai-coding-assistant-guide',
    title: 'Using SwiftChronicle MCP with Claude Code, Cursor, and Windsurf',
    description: 'Step-by-step guide to connecting your AI coding assistant to SwiftChronicle\'s MCP server — get iOS 27 API answers from inside your editor.',
    tag: 'MCP Guide',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
]

export default function BlogPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-6 py-16 animate-page-enter">
      <div className="mb-12">
        <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-4">Blog</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">iOS 27 Developer Guides</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          In-depth references and guides for adopting iOS 27 — from AI APIs and Liquid Glass to migration roundups and MCP setup.
        </p>
      </div>

      <div className="space-y-4">
        {POSTS.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-violet-500/20 hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <span className={`inline-flex items-center text-[10px] font-semibold border rounded-full px-2 py-0.5 mb-3 ${post.tagColor}`}>
                  {post.tag}
                </span>
                <h2 className="text-base font-semibold leading-snug mb-2 group-hover:text-violet-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{post.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
