import { db } from '@/db'
import { capabilities, sources, demos } from '@/db/schema'
import { eq, ne, and, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, FlaskConical, Zap, BookOpen, Video, Code2, Sparkles, RefreshCw, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ViewTracker } from '@/components/features/ViewTracker'
import { ProgressButton } from '@/components/user/ProgressButton'
import { ReportIssueLink } from '@/components/layout/FeedbackButton'
import { ShareButtons } from '@/components/features/ShareButtons'
import { AdminEditButton } from '@/components/admin/AdminEditButton'
import { highlightSwift } from '@/lib/highlighter'
import { SlugGatedContent } from '@/components/features/SlugGatedContent'
import { cache } from 'react'
import type { Metadata } from 'next'

export const revalidate = 300

const SPATIAL_KWS = ['RealityKit', 'Reality Composer', 'USDKit', 'ARKit', 'RealityFoundation']

function getClusterGuide(category: string, frameworks: string[], changeType: string): { url: string; title: string } | null {
  if (frameworks.some(f => SPATIAL_KWS.some(kw => f.includes(kw)))) {
    return { url: '/blog/realitykit-usdkit-ios-27-spatial-computing', title: 'RealityKit & USDKit in iOS 27' }
  }
  if (category === 'AI') return { url: '/blog/ios-27-apple-intelligence-apis', title: 'iOS 27 On-Device AI & Apple Intelligence' }
  if (category === 'UI') return { url: '/blog/swiftui-ios-27-whats-new', title: 'SwiftUI & Liquid Glass in iOS 27' }
  if (changeType === 'deprecated') return { url: '/blog/ios-27-deprecations-breaking-changes', title: 'iOS 27 Breaking Changes & Deprecations' }
  if (changeType === 'updated') return { url: '/blog/ios-26-to-ios-27-migration', title: 'iOS 26 → iOS 27 Migration Guide' }
  return null
}

const CATEGORY_COLORS: Record<string, string> = {
  AI:          'bg-purple-500/10 text-purple-400 border-purple-500/20',
  UI:          'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Performance: 'bg-green-500/10 text-green-400 border-green-500/20',
  Safety:      'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Store:       'bg-teal-500/10 text-teal-400 border-teal-500/20',
  System:      'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
}

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  wwdc_session:  <Video className="h-4 w-4" />,
  sample_code:   <Code2 className="h-4 w-4" />,
  what_new_page: <BookOpen className="h-4 w-4" />,
  doc_page:      <BookOpen className="h-4 w-4" />,
}

const getData = cache(async function getData(slug: string) {
  const [cap] = await db.select().from(capabilities).where(eq(capabilities.slug, slug)).limit(1)
  if (!cap) return null
  const [capSources, capDemos] = await Promise.all([
    db.select().from(sources).where(eq(sources.capabilityId, cap.id)),
    cap.demoId ? db.select().from(demos).where(eq(demos.id, cap.demoId)) : Promise.resolve([]),
  ])
  return { cap, sources: capSources, demo: capDemos[0] ?? null }
})

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) return {}
  const { cap } = data
  const ogUrl = `/api/og?name=${encodeURIComponent(cap.name)}&summary=${encodeURIComponent(cap.summary)}&category=${cap.category}&impact=${cap.impactScore}&changeType=${cap.changeType}`
  return {
    title: cap.name,
    description: cap.summary,
    openGraph: {
      title: cap.name,
      description: cap.summary,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: cap.name,
      description: cap.summary,
      images: [ogUrl],
    },
  }
}

export default async function FeatureDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) notFound()

  const { cap, sources: capSources, demo } = data
  const wwdcSources = capSources.filter(s => s.type === 'wwdc_session')
  const docSources = capSources.filter(s => s.type !== 'wwdc_session')
  const allSources = [...wwdcSources, ...docSources]

  const [newCodeHtml, oldCodeHtml, related] = await Promise.all([
    demo?.codeSnippet ? highlightSwift(demo.codeSnippet) : null,
    demo?.previousCodeSnippet && cap.changeType === 'updated'
      ? highlightSwift(demo.previousCodeSnippet)
      : null,
    db
      .select({ slug: capabilities.slug, name: capabilities.name, summary: capabilities.summary, category: capabilities.category, changeType: capabilities.changeType })
      .from(capabilities)
      .where(and(eq(capabilities.status, 'ready'), eq(capabilities.category, cap.category), ne(capabilities.slug, cap.slug)))
      .orderBy(desc(capabilities.impactScore))
      .limit(4),
  ])

  const ogImageUrl = `https://swiftchronicle.com/api/og?name=${encodeURIComponent(cap.name)}&summary=${encodeURIComponent(cap.summary)}&category=${cap.category}&impact=${cap.impactScore}&changeType=${cap.changeType}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: cap.name,
    description: cap.summary,
    url: `https://swiftchronicle.com/features/${cap.slug}`,
    keywords: [...cap.frameworks, 'iOS 27', 'WWDC 2026', 'Swift', cap.category].join(', '),
    datePublished: cap.createdAt.toISOString(),
    dateModified: cap.updatedAt.toISOString(),
    image: { '@type': 'ImageObject', url: ogImageUrl, width: 1200, height: 630 },
    author: { '@type': 'Organization', name: 'SwiftChronicle', url: 'https://swiftchronicle.com' },
    publisher: {
      '@type': 'Organization',
      name: 'SwiftChronicle',
      url: 'https://swiftchronicle.com',
      logo: { '@type': 'ImageObject', url: 'https://swiftchronicle.com/apple-touch-icon.png', width: 180, height: 180 },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://swiftchronicle.com/features/${cap.slug}` },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://swiftchronicle.com' },
      { '@type': 'ListItem', position: 2, name: 'Capabilities', item: 'https://swiftchronicle.com/features' },
      { '@type': 'ListItem', position: 3, name: cap.name, item: `https://swiftchronicle.com/features/${cap.slug}` },
    ],
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-12 animate-page-enter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ViewTracker slug={slug} />

      {/* Back */}
      <Link
        href="/features"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 group"
      >
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Capabilities
      </Link>

      {/* ── Header ── */}
      <header className="mb-12">
        <div className="flex flex-wrap gap-1.5 mb-5">
          <Badge variant="outline" className={cn('text-xs border', CATEGORY_COLORS[cap.category])}>
            {cap.category}
          </Badge>
          {cap.changeType === 'new' && (
            <Badge variant="outline" className="text-xs border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <Sparkles className="h-3 w-3 mr-1" /> New in iOS 27
            </Badge>
          )}
          {cap.changeType === 'updated' && (
            <Badge variant="outline" className="text-xs border bg-amber-500/10 text-amber-400 border-amber-500/20">
              <RefreshCw className="h-3 w-3 mr-1" /> Updated in iOS 27
            </Badge>
          )}
          {cap.changeType === 'deprecated' && (
            <Badge variant="outline" className="text-xs border bg-red-500/10 text-red-400 border-red-500/20">
              Deprecated
            </Badge>
          )}
          <Badge variant="outline" className="text-xs border border-white/[0.1] text-muted-foreground">
            {cap.availability}
          </Badge>
          {cap.verifiedOnBeta && (
            <Badge variant="outline" className="text-xs border bg-sky-500/10 text-sky-400 border-sky-500/20">
              ✓ {cap.verifiedOnBeta}
            </Badge>
          )}
          {demo && (
            <Badge variant="outline" className="text-xs border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <FlaskConical className="h-3 w-3 mr-1" /> Demo
            </Badge>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4">
          {cap.name}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">{cap.summary}</p>

        {/* Frameworks */}
        <div className="flex flex-wrap gap-1.5 mt-5">
          {cap.frameworks.map(fw => (
            <span
              key={fw}
              className="text-xs font-mono bg-white/[0.04] text-muted-foreground/80 rounded-lg px-2.5 py-1 border border-white/[0.07]"
            >
              {fw}
            </span>
          ))}
        </div>

        {/* Impact + CTA */}
        <div className="flex items-center justify-between gap-4 mt-6 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Impact</span>
            <div className="flex items-center gap-[3px] ml-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={cn('h-[5px] w-[5px] rounded-full', i < cap.impactScore ? 'bg-violet-400' : 'bg-white/10')}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1">{cap.impactScore}/5</span>
          </div>
          <ProgressButton capabilityId={cap.id} />
        </div>
      </header>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-12" />

      {/* ── What changed ── */}
      {cap.changesSince && (
        <section className="mb-12">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold">What changed from iOS 26</h2>
          </div>
          <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-5 space-y-2.5">
            {cap.changesSince.split('\n').filter(Boolean).map((line, i) => (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                {line.replace(/^[•\-\*]\s*/, '• ')}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* ── Why it matters ── */}
      {cap.whyItMatters && (
        <section className="mb-12">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
              <Zap className="h-3.5 w-3.5 text-violet-400" />
            </div>
            <h2 className="text-lg font-semibold">Why you should care</h2>
          </div>
          <div className="space-y-2.5 pl-[calc(1.75rem+0.625rem)]">
            {cap.whyItMatters.split('\n').filter(Boolean).map((line, i) => (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                {line.replace(/^[•\-\*]\s*/, '• ')}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* ── Sources (public — helps Googlebot find Apple docs) ── */}
      {allSources.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <BookOpen className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold">Source map</h2>
          </div>
          <div className="space-y-2">
            {allSources.map(src => (
              <a
                key={src.id}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-violet-500/20 hover:bg-white/[0.05] transition-all group"
              >
                <span className="text-muted-foreground shrink-0">
                  {SOURCE_ICONS[src.type] ?? <BookOpen className="h-4 w-4" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium group-hover:text-violet-400 transition-colors truncate">
                    {src.title}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize mt-0.5">
                    {src.type.replace(/_/g, ' ')}{src.official ? ' · Official' : ''}
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── Gated content: Demo, Gotchas, Requirements ── */}
      <SlugGatedContent
        demo={demo ? {
          title: demo.title,
          description: demo.description,
          complexity: demo.complexity,
          repoUrl: demo.repoUrl ?? null,
        } : null}
        newCodeHtml={newCodeHtml}
        oldCodeHtml={oldCodeHtml}
        rawNewCode={demo?.codeSnippet ?? null}
        rawOldCode={demo?.previousCodeSnippet ?? null}
        gotchas={cap.gotchas ?? null}
        hardwareConstraints={cap.hardwareConstraints ?? null}
        changeType={cap.changeType}
      />

      {/* Related capabilities */}
      {related.length >= 2 && (
        <section className="mt-14 pt-10 border-t border-white/[0.05]">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
            More in {cap.category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {related.map(r => (
              <Link
                key={r.slug}
                href={`/features/${r.slug}`}
                className="group p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-violet-500/20 hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-sm font-semibold group-hover:text-violet-400 transition-colors leading-snug">{r.name}</span>
                  {r.changeType === 'new' && (
                    <span className="shrink-0 text-[10px] font-semibold text-emerald-400 border border-emerald-500/25 bg-emerald-500/10 rounded-full px-1.5 py-0.5 mt-0.5">New</span>
                  )}
                  {r.changeType === 'deprecated' && (
                    <span className="shrink-0 text-[10px] font-semibold text-red-400 border border-red-500/25 bg-red-500/10 rounded-full px-1.5 py-0.5 mt-0.5">Deprecated</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{r.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Cluster guide — spoke-to-pillar link */}
      {(() => {
        const guide = getClusterGuide(cap.category, cap.frameworks, cap.changeType)
        if (!guide) return null
        return (
          <div className="mt-12">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.07] bg-white/[0.01] hover:border-violet-500/15 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold mb-0.5">In-depth guide</p>
                <Link href={guide.url} className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors">
                  {guide.title} →
                </Link>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Footer actions */}
      <div className="mt-6 pt-4 border-t border-white/[0.05] space-y-4">
        {/* Mark as completed — bottom CTA */}
        <ProgressButton capabilityId={cap.id} placement="bottom" />

        <ShareButtons name={cap.name} summary={cap.summary} slug={cap.slug} />
        <div className="flex items-center justify-between">
          <Link
            href="/features"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            All capabilities
          </Link>
          <div className="flex items-center gap-3">
            <AdminEditButton
              capabilityId={cap.id}
              demoId={cap.demoId}
              initial={{
                name: cap.name,
                summary: cap.summary,
                whyItMatters: cap.whyItMatters ?? null,
                changesSince: cap.changesSince ?? null,
                gotchas: cap.gotchas ?? null,
                hardwareConstraints: cap.hardwareConstraints ?? null,
                impactScore: cap.impactScore,
                status: cap.status,
                verifiedOnBeta: cap.verifiedOnBeta ?? null,
              }}
              initialDemo={demo ? {
                title: demo.title,
                description: demo.description,
                codeSnippet: demo.codeSnippet ?? null,
                previousCodeSnippet: demo.previousCodeSnippet ?? null,
                repoUrl: demo.repoUrl ?? null,
              } : null}
            />
            <ReportIssueLink capabilityName={cap.name} />
          </div>
        </div>
      </div>
    </div>
  )
}
