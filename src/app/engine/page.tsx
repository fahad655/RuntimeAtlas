import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = { title: 'Engine' }

const STEPS = [
  {
    num: '01',
    label: 'Trigger',
    detail: 'You provide a topic name or Apple URL (doc page or WWDC session). Both inputs are accepted.',
    color: 'text-violet-400',
  },
  {
    num: '02',
    label: 'Scrape',
    detail: 'The ingestion service fetches the relevant Apple developer documentation pages and the WWDC session transcript for that topic.',
    color: 'text-blue-400',
  },
  {
    num: '03',
    label: 'Classify',
    detail: 'Claude reads the scraped content and extracts a structured capability: name, summary, frameworks, availability, gotchas, and impact score.',
    color: 'text-indigo-400',
  },
  {
    num: '04',
    label: 'Demo brief',
    detail: 'Claude generates a real, compilable Swift/SwiftUI code snippet demonstrating the core API — not pseudocode, not a kitchen-sink project.',
    color: 'text-emerald-400',
  },
  {
    num: '05',
    label: 'Review',
    detail: 'The capability lands in the admin queue with status "needs_review". You test the Swift snippet in Xcode, then approve to publish.',
    color: 'text-amber-400',
  },
  {
    num: '06',
    label: 'Publish',
    detail: 'The capability goes live. View counts feed into a rank score that surfaces the most-read topics higher in the grid automatically.',
    color: 'text-rose-400',
  },
]

const STACK = [
  { label: 'Frontend', value: 'Next.js 16 App Router + Tailwind + shadcn/ui' },
  { label: 'Database', value: 'Postgres via Neon + Drizzle ORM' },
  { label: 'AI',       value: 'Claude via Vercel AI Gateway (claude-sonnet-4.6)' },
  { label: 'Scraping', value: 'Cheerio — Apple docs + WWDC transcript pages' },
  { label: 'Ranking',  value: 'impact_score × 10 + view_count (updates on every page hit)' },
  { label: 'Hosting',  value: 'Vercel — Fluid Compute, no cold-start overhead' },
]

export default function EnginePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-3">The Engine</h1>
        <p className="text-muted-foreground text-lg">
          How RuntimeAtlas turns scattered Apple docs and WWDC sessions into scannable capability cards with working Swift demos.
        </p>
      </div>

      {/* Pipeline steps */}
      <section className="mb-16">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">Pipeline</h2>
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-6 top-8 bottom-8 w-px bg-border/50" aria-hidden />

          <div className="space-y-8">
            {STEPS.map((step, idx) => (
              <div key={step.num} className="flex gap-5 relative">
                <div className={`shrink-0 h-12 w-12 rounded-full border border-border/50 bg-background flex items-center justify-center text-sm font-bold font-mono ${step.color} z-10`}>
                  {step.num}
                </div>
                <div className="pt-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{step.label}</span>
                    {idx < STEPS.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">Tech stack</h2>
        <div className="rounded-xl border border-border/50 overflow-hidden divide-y divide-border/30">
          {STACK.map(item => (
            <div key={item.label} className="flex items-baseline gap-4 px-5 py-3.5">
              <span className="text-xs font-semibold text-muted-foreground w-24 shrink-0">{item.label}</span>
              <span className="text-sm">{item.value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
