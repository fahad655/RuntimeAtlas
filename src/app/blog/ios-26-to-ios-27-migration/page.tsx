import type { Metadata } from 'next'
import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import Link from 'next/link'
import { RefreshCw, ChevronLeft, ArrowRight } from 'lucide-react'

export const revalidate = 3600

const BASE = 'https://swiftchronicle.com'
const PAGE_URL = `${BASE}/blog/ios-26-to-ios-27-migration`
const OG_IMG = `/api/og?name=iOS+26+to+iOS+27+Migration+Guide&summary=Every+updated+API+with+before%2Fafter+Swift+code+diffs+%E2%80%94+prioritized+by+impact+so+you+can+ship+on+day+one.&category=System&impact=4&changeType=updated`
const PUBLISHED = '2026-07-01'

export const metadata: Metadata = {
  title: 'iOS 26 to iOS 27 Migration: Complete Before/After API Reference',
  description: 'Every updated API from WWDC 2026 with before/after Swift code — ordered by impact score so you know what to fix first before shipping on iOS 27.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'iOS 26 → iOS 27 Migration Guide — SwiftChronicle',
    description: 'Every updated iOS 27 API with before/after diffs — prioritized by impact so you can ship on day one.',
    url: PAGE_URL,
    images: [{ url: OG_IMG, width: 1200, height: 630, alt: 'iOS 26 to iOS 27 Migration Guide' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'iOS 26 → iOS 27 Migration Guide',
    description: 'Every updated iOS 27 API with before/after Swift code, ordered by impact.',
    images: [OG_IMG],
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  AI:          'bg-purple-500/10 text-purple-400 border-purple-500/20',
  UI:          'bg-blue-500/10   text-blue-400   border-blue-500/20',
  Performance: 'bg-green-500/10  text-green-400  border-green-500/20',
  Safety:      'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Store:       'bg-teal-500/10   text-teal-400   border-teal-500/20',
  System:      'bg-zinc-500/10   text-zinc-400   border-zinc-500/20',
}

export default async function MigrationPage() {
  const updated = await db
    .select({
      slug: capabilities.slug,
      name: capabilities.name,
      summary: capabilities.summary,
      changesSince: capabilities.changesSince,
      frameworks: capabilities.frameworks,
      category: capabilities.category,
      impactScore: capabilities.impactScore,
      availability: capabilities.availability,
    })
    .from(capabilities)
    .where(and(eq(capabilities.status, 'ready'), eq(capabilities.changeType, 'updated')))
    .orderBy(desc(capabilities.impactScore))

  const highImpact = updated.filter(c => c.impactScore >= 4)
  const midImpact  = updated.filter(c => c.impactScore === 3)
  const lowImpact  = updated.filter(c => c.impactScore <= 2)

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': PAGE_URL,
      headline: 'iOS 26 to iOS 27 Migration: Complete Before/After API Reference',
      description: 'Every updated API from WWDC 2026 with before/after Swift code diffs.',
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
        { '@type': 'ListItem', position: 3, name: 'iOS 26 → iOS 27 Migration Guide', item: PAGE_URL },
      ],
    },
  ]

  const CapCard = ({ cap }: { cap: typeof updated[number] }) => {
    const catColor = CATEGORY_COLORS[cap.category] ?? CATEGORY_COLORS.System
    const firstChange = cap.changesSince?.split('\n').find(l => l.trim()) ?? null
    return (
      <Link
        href={`/features/${cap.slug}`}
        className="group flex items-start gap-4 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-amber-500/20 hover:bg-amber-500/[0.03] transition-all"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold group-hover:text-amber-400 transition-colors">{cap.name}</span>
            <span className={`text-[10px] font-semibold border rounded-full px-1.5 py-0.5 ${catColor}`}>{cap.category}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-1.5">{cap.summary}</p>
          {firstChange && (
            <p className="text-xs text-amber-400/70 leading-relaxed">
              {firstChange.replace(/^[•\-\*]\s*/, '↳ ')}
            </p>
          )}
          {cap.frameworks.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {cap.frameworks.slice(0, 3).map(fw => (
                <span key={fw} className="text-[10px] text-muted-foreground/40 border border-white/[0.05] rounded px-1.5 py-0.5">{fw}</span>
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2 mt-0.5">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => (
              <span key={i} className={`inline-block w-1.5 h-1.5 rounded-full ${i <= cap.impactScore ? 'bg-amber-400' : 'bg-white/[0.08]'}`} />
            ))}
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-amber-400 transition-colors" />
        </div>
      </Link>
    )
  }

  const Section = ({ title, items, accent }: { title: string; items: typeof updated; accent: string }) =>
    items.length === 0 ? null : (
      <div className="mb-12">
        <h2 className={`text-sm font-semibold uppercase tracking-widest mb-5 ${accent}`}>{title}</h2>
        <div className="space-y-3">
          {items.map(cap => <CapCard key={cap.slug} cap={cap} />)}
        </div>
      </div>
    )

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-6 py-16 animate-page-enter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 group">
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Blog
      </Link>

      <div className="mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/[0.08] px-3 py-1 text-xs font-medium text-amber-400 mb-6">
          <RefreshCw className="h-3 w-3" /> Migration Guide · iOS 27
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5 leading-tight">
          iOS 26 to iOS 27 Migration: Complete Before/After API Reference
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          Your iOS 26 app will run on iOS 27, but several high-impact APIs have changed behaviour, signatures, or default values. WWDC 2026 introduced {updated.length} updated capabilities — APIs that exist in iOS 26 but work differently in iOS 27. This reference covers all of them, ordered by impact score, with a summary of exactly what changed and a link to the full detail page showing the before/after Swift code.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          High-impact changes are APIs used by most apps and are likely to cause build warnings, unexpected behaviour, or failed tests when upgrading. Address these before the first public beta.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: 'Total updated', count: updated.length,      color: 'text-amber-400' },
            { label: 'High impact',   count: highImpact.length,   color: 'text-red-400' },
            { label: 'Lower impact',  count: midImpact.length + lowImpact.length, color: 'text-muted-foreground' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-center">
              <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.count}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-12" />

      <Section title="High impact — update before beta" items={highImpact} accent="text-red-400" />
      <Section title="Medium impact" items={midImpact} accent="text-amber-400" />
      <Section title="Lower impact" items={lowImpact} accent="text-muted-foreground" />

      {updated.length === 0 && (
        <p className="text-muted-foreground text-sm">Updated capabilities are being added. Check back soon.</p>
      )}

      <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6">
        <p className="text-sm font-semibold mb-1">See before/after Swift diffs</p>
        <p className="text-xs text-muted-foreground mb-4">Each capability detail page shows the complete iOS 26 vs iOS 27 Swift code side-by-side.</p>
        <Link href="/features?changeType=updated" className="inline-flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium">
          Updated APIs in SwiftChronicle <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
