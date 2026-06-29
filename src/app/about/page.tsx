import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Zap, BookOpen, CheckCircle, Code2, RefreshCw } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About',
  description: 'SwiftChronicle turns Apple\'s annual SDK release into a structured, searchable reference — with real Swift code for every capability.',
  authors: [{ name: 'Fahad Shafique' }],
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-16 animate-page-enter">

      {/* Hero */}
      <div className="mb-14">
        <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-4">About SwiftChronicle</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
          Built for developers who can&apos;t afford to miss a release.
        </h1>
        <p className="text-xs text-muted-foreground mb-5">By Fahad Shafique</p>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Every WWDC, Apple ships 250+ new APIs across dozens of frameworks. Most developers catch 20% of it in the keynote and spend the rest of the year discovering things they missed. SwiftChronicle exists to fix that.
        </p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-14" />

      {/* Mission */}
      <section className="mb-14">
        <h2 className="text-xl font-bold mb-4">What we do</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          SwiftChronicle ingests Apple&apos;s WWDC sessions and developer documentation the moment they go live, then uses Claude to classify every new and updated API into a scannable capability card — complete with a real, compilable Swift code snippet, an impact score, and for updated APIs, a before/after diff showing exactly what changed.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          You can browse by framework, filter by category, and mark capabilities as done to track your own implementation progress. Think of it as the index Apple forgot to ship.
        </p>
      </section>

      {/* How it works */}
      <section className="mb-14">
        <h2 className="text-xl font-bold mb-6">How the pipeline works</h2>
        <div className="space-y-4">
          {[
            {
              icon: <Zap className="h-4 w-4 text-violet-400" />,
              step: '01',
              title: 'Ingest',
              desc: 'WWDC session transcripts and Apple developer documentation are scraped the moment a topic is queued. A WWDC video URL can be supplied directly to anchor the context.',
            },
            {
              icon: <BookOpen className="h-4 w-4 text-blue-400" />,
              step: '02',
              title: 'Classify',
              desc: 'Claude reads the transcript and docs, then decides: is this genuinely new or changed in this iOS release? If not, it\'s rejected before touching the database. If yes, it generates the capability card — name, summary, category, frameworks, impact score, Swift code.',
            },
            {
              icon: <CheckCircle className="h-4 w-4 text-emerald-400" />,
              step: '03',
              title: 'Review',
              desc: 'Every classification goes through a human review queue before going live. We check the code, the summary, and the impact score before publishing.',
            },
            {
              icon: <Code2 className="h-4 w-4 text-amber-400" />,
              step: '04',
              title: 'Ship',
              desc: 'Published capabilities are immediately searchable and filterable. For updated APIs, a syntax-highlighted diff shows exactly what changed between versions.',
            },
            {
              icon: <RefreshCw className="h-4 w-4 text-pink-400" />,
              step: '05',
              title: 'Refresh',
              desc: 'As Apple releases updated documentation and beta builds, capabilities are re-ingested and re-classified. The verifiedOnBeta field tracks which capabilities have been confirmed against real builds.',
            },
          ].map(item => (
            <div key={item.step} className="flex gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.07] flex items-center justify-center shrink-0 mt-0.5">
                {item.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-muted-foreground/50">{item.step}</span>
                  <span className="text-sm font-semibold">{item.title}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Built with */}
      <section className="mb-14">
        <h2 className="text-xl font-bold mb-4">Built with</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { name: 'Next.js 15', note: 'App Router' },
            { name: 'Claude', note: 'Classification & code gen' },
            { name: 'Neon Postgres', note: 'Database' },
            { name: 'Drizzle ORM', note: 'Type-safe queries' },
            { name: 'Clerk', note: 'Authentication' },
            { name: 'Vercel', note: 'Hosting & edge' },
          ].map(item => (
            <div key={item.name} className="p-3 rounded-lg border border-white/[0.07] bg-white/[0.02]">
              <div className="text-sm font-medium">{item.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{item.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Source */}
      <section className="mb-14">
        <h2 className="text-xl font-bold mb-4">Sources</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          All capability content is derived from Apple&apos;s official WWDC session videos and developer documentation at{' '}
          <a href="https://developer.apple.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 transition-colors">
            developer.apple.com
          </a>
          . SwiftChronicle is an independent project and is not affiliated with or endorsed by Apple Inc.
        </p>
      </section>

      {/* CTA */}
      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-8">
        <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-2">Start now</p>
        <h2 className="text-xl font-bold mb-2">Explore what shipped in iOS 27</h2>
        <p className="text-sm text-muted-foreground mb-5">Browse every capability from WWDC 2026, filtered by framework and impact.</p>
        <Link
          href="/features"
          className="inline-flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-2.5 text-sm transition-all duration-200 shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] active:scale-[0.97]"
        >
          Browse capabilities
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
