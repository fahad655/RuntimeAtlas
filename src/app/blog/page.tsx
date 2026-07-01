import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'In-depth guides and references for iOS 27 developers — deprecation roundups, API migration guides, and framework deep-dives.',
  alternates: { canonical: 'https://swiftchronicle.com/blog' },
}

const POSTS = [
  {
    slug: 'ios-27-deprecations-breaking-changes',
    title: 'iOS 27 Breaking Changes & Deprecations: Complete Developer Reference',
    description: 'Every deprecated iOS 27 API from WWDC 2026, organized by impact score. Know what to remove from your codebase before the first public beta.',
    tag: 'Breaking Changes',
    tagColor: 'text-red-400 bg-red-500/10 border-red-500/20',
  },
  {
    slug: 'wwdc-2026-complete-api-list',
    title: 'WWDC 2026: Complete iOS 27 SDK API Reference',
    description: 'Every new and updated capability from WWDC 2026 organized by category — the comprehensive reference Apple forgot to ship.',
    tag: 'Reference',
    tagColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
]

export default function BlogPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-6 py-16 animate-page-enter">
      <div className="mb-12">
        <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-4">Blog</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">iOS 27 Developer Guides</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          In-depth references and guides for adopting iOS 27 — from migration roundups to framework deep-dives.
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
