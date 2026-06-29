import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { CapabilityCard } from '@/components/features/CapabilityCard'
import { LiveFeed } from '@/components/features/LiveFeed'
import { AnimatedBlobs } from '@/components/layout/AnimatedBlobs'
import { ParallaxContent } from '@/components/layout/HeroParallax'
import Link from 'next/link'
import { ArrowRight, Bell, TrendingUp, Code2, CheckCircle, ChevronRight, Calendar, Users, Layers, Zap } from 'lucide-react'
import { SubscribeForm } from '@/components/layout/SubscribeForm'
import type { Metadata } from 'next'

export const revalidate = 60

const HOME_OG_IMG = '/api/og?name=SwiftChronicle&summary=Every+iOS+27+SDK+capability+from+WWDC+2026.+Real+Swift+code%2C+before%2Fafter+diffs%2C+and+progress+tracking.&category=System&impact=5'

export const metadata: Metadata = {
  title: 'SwiftChronicle — iOS 27 SDK Reference',
  description: 'Every new Swift & Apple platform capability from WWDC 2026 — real compilable Swift code, before/after diffs, and progress tracking.',
  openGraph: {
    title: 'SwiftChronicle — iOS 27 SDK Reference',
    description: 'Every new Swift & Apple platform capability from WWDC 2026 — real compilable Swift code, before/after diffs, and progress tracking.',
    url: 'https://swiftchronicle.com',
    images: [{ url: HOME_OG_IMG, width: 1200, height: 630, alt: 'SwiftChronicle — iOS 27 SDK Reference' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SwiftChronicle — iOS 27 SDK Reference',
    description: 'Every new Swift & Apple platform capability from WWDC 2026 — real compilable Swift code, before/after diffs, and progress tracking.',
    images: [HOME_OG_IMG],
  },
}

async function getData() {
  const [featured, countRow] = await Promise.all([
    db.select().from(capabilities)
      .where(eq(capabilities.status, 'ready'))
      .orderBy(desc(capabilities.rankScore))
      .limit(8),
    db.select({ count: sql<number>`count(*)` }).from(capabilities).where(eq(capabilities.status, 'ready')),
  ])
  return { featured, total: Number(countRow[0]?.count ?? 0) }
}

const homepageJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://swiftchronicle.com/#website',
    name: 'SwiftChronicle',
    url: 'https://swiftchronicle.com',
    description: 'Every new Swift & Apple platform capability from WWDC — real code, before/after diffs, and progress tracking.',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: 'https://swiftchronicle.com/features?q={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://swiftchronicle.com/#org',
    name: 'SwiftChronicle',
    url: 'https://swiftchronicle.com',
    logo: { '@type': 'ImageObject', url: 'https://swiftchronicle.com/apple-touch-icon.png', width: 180, height: 180 },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://swiftchronicle.com/#app',
    name: 'SwiftChronicle',
    url: 'https://swiftchronicle.com',
    description: 'Every new Swift & Apple platform capability from WWDC — real code, before/after diffs, and progress tracking.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    publisher: { '@id': 'https://swiftchronicle.com/#org' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  },
]

export default async function LandingPage() {
  const { featured, total } = await getData()

  return (
    <div className="min-h-screen animate-page-enter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }} />

      {/* ── Hero ── */}
      <section className="relative min-h-[calc(100dvh-4rem)] flex items-center overflow-hidden">

        {/* Mesh grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.28] dark:opacity-[0.13]"
          aria-hidden
          style={{
            backgroundImage: `
              linear-gradient(rgba(124, 58, 237, 0.6) 1px, transparent 1px),
              linear-gradient(90deg, rgba(124, 58, 237, 0.6) 1px, transparent 1px)
            `,
            backgroundSize: '52px 52px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)',
          }}
        />

        <AnimatedBlobs />

        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-56 bg-gradient-to-t from-background to-transparent" aria-hidden />

        <div className="relative w-full max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <ParallaxContent>

            {/* Current release badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-violet-500/30 bg-violet-500/[0.1] px-4 py-1.5 text-sm text-violet-300 mb-10 backdrop-blur-sm">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
              </span>
              Now tracking: iOS 27 · WWDC 2026
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-7xl lg:text-[82px] font-bold tracking-tight leading-[1.05] max-w-4xl">
              <span className="text-foreground">Apple never stops shipping.</span>
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #c084fc 0%, #f472b6 50%, #fb923c 100%)' }}
              >
                Stay ahead of it.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-7 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Every WWDC, Apple ships hundreds of new APIs across dozens of frameworks. SwiftChronicle ingests them the moment they drop — distilled into scannable cards with runnable Swift code — and lets you track exactly which ones you&apos;ve implemented.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mt-10">
              <Link
                href="/features"
                className="group inline-flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold px-7 py-3 text-sm transition-all duration-200 shadow-[0_0_28px_rgba(124,58,237,0.55)] hover:shadow-[0_0_40px_rgba(124,58,237,0.75)] active:scale-[0.97]"
              >
                Browse what&apos;s new
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/home"
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.15] bg-white/[0.06] hover:bg-white/[0.11] text-foreground font-medium px-7 py-3 text-sm transition-all duration-200 backdrop-blur-sm active:scale-[0.97]"
              >
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                Track my progress
              </Link>
            </div>


          </ParallaxContent>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 border-b border-border/50 dark:border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">

          <div className="mb-12 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              From WWDC firehose to your personal progress tracker.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              SwiftChronicle turns Apple&apos;s annual SDK release into a structured, trackable feed. Know what dropped, learn what matters, ship what sticks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border/40 dark:bg-white/[0.05] rounded-2xl overflow-hidden">
            {[
              {
                icon: <Bell className="h-5 w-5 text-violet-400" />,
                step: '01',
                title: 'Live capability feed',
                desc: 'Every new API, framework change, and deprecation ingested automatically from WWDC sessions and Apple developer docs as they go live.',
                glow: 'group-hover:text-violet-300',
              },
              {
                icon: <Code2 className="h-5 w-5 text-emerald-400" />,
                step: '02',
                title: 'Ship-ready Swift code',
                desc: 'Every card ships with a real, compilable Swift snippet — not pseudocode. Copy directly into Xcode with a link back to the WWDC source.',
                glow: 'group-hover:text-emerald-300',
              },
              {
                icon: <TrendingUp className="h-5 w-5 text-pink-400" />,
                step: '03',
                title: 'Track your implementation',
                desc: 'Mark capabilities as done, build a daily streak, and see your real coverage across each release — not just what you vaguely watched at WWDC.',
                glow: 'group-hover:text-pink-300',
              },
            ].map(item => (
              <div key={item.step} className="group relative bg-background/80 p-8 sm:p-10 space-y-4 transition-colors duration-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] overflow-hidden">
                <span className="absolute top-4 right-5 text-[64px] font-black text-black/[0.06] dark:text-white/[0.025] leading-none select-none pointer-events-none">
                  {item.step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </div>
                <h3 className={`font-semibold text-foreground transition-colors duration-200 ${item.glow}`}>{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Progress CTA ── */}
      <section className="py-16 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="relative rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] overflow-hidden p-8 sm:p-12">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/[0.07] via-transparent to-pink-500/[0.04]" aria-hidden />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-lg">
              <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-2">Progress tracking</p>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                How much of this release have you actually shipped?
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Sign in to mark capabilities as done, build a learning streak, and see your real coverage across{total > 0 ? ` all ${total}` : ''} tracked APIs — not just the ones you vaguely remember watching at WWDC.
              </p>
            </div>
            <Link
              href="/home"
              className="group shrink-0 inline-flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-2.5 text-sm transition-all duration-200 shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] active:scale-[0.97] whitespace-nowrap"
            >
              Start tracking
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Latest capabilities ── */}
      <section className="pb-16 pt-4 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-1">iOS 27 · WWDC 2026</p>
            <h2 className="text-2xl font-bold tracking-tight">Latest capabilities</h2>
            <p className="text-sm text-muted-foreground mt-1">Highest-impact APIs added most recently</p>
          </div>
          <Link
            href="/features"
            className="group inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium"
          >
            Browse all
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="text-center py-40 text-muted-foreground">
            <p className="text-base mb-2">No capabilities published yet.</p>
            <p className="text-sm">
              Head to{' '}
              <Link href="/admin" className="text-violet-400 hover:underline">/admin</Link>
              {' '}to run the first ingestion.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {featured.map(cap => <CapabilityCard key={cap.id} capability={cap} />)}
          </div>
        )}
      </section>

      {/* ── Apple by the numbers ── */}
      <section className="border-y border-border/50 dark:border-white/[0.05] bg-muted/20 dark:bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-8">
            Why keeping up is hard
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                icon: <Zap className="h-4 w-4 text-violet-400" />,
                stat: '250+',
                label: 'new APIs per WWDC',
                note: 'Across frameworks, Swift packages, and platform updates',
              },
              {
                icon: <Layers className="h-4 w-4 text-blue-400" />,
                stat: '40+',
                label: 'frameworks updated',
                note: 'UIKit, SwiftUI, Foundation, ARKit, Core ML, and more',
              },
              {
                icon: <Calendar className="h-4 w-4 text-emerald-400" />,
                stat: '16 yrs',
                label: 'of annual releases',
                note: 'Apple has shipped a major SDK update every June since 2008',
              },
              {
                icon: <Users className="h-4 w-4 text-orange-400" />,
                stat: '34M+',
                label: 'Apple developers',
                note: 'All competing to learn and implement the same new APIs first',
              },
            ].map(item => (
              <div key={item.stat} className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  {item.icon}
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-foreground tabular-nums">{item.stat}</div>
                <div className="text-sm font-medium text-foreground/80">{item.label}</div>
                <div className="text-xs text-muted-foreground leading-relaxed hidden sm:block">{item.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Email capture ── */}
      <section className="py-16 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="relative rounded-2xl border border-violet-500/15 bg-violet-500/[0.03] overflow-hidden p-8 sm:p-12">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/[0.05] via-transparent to-pink-500/[0.03]" aria-hidden />
          <div className="relative max-w-lg">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-2">Stay current</p>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">New APIs drop throughout the beta cycle.</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Get notified when we add new iOS 27 capabilities — no noise, just signal when something worth your attention lands.
            </p>
            <SubscribeForm source="landing" />
          </div>
        </div>
      </section>

      {/* ── About + Launch ── */}
      <section className="py-12 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/about"
            className="group relative rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] p-6 transition-all duration-200"
          >
            <div className="text-2xl mb-3">📖</div>
            <h3 className="font-semibold text-sm mb-1.5 group-hover:text-violet-400 transition-colors">About SwiftChronicle</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              How the ingestion pipeline works, what the team built it with, and why it exists — for developers who want to understand what&apos;s under the hood.
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-violet-400 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              Learn more <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
          <Link
            href="/launch"
            className="group relative rounded-2xl border border-orange-500/20 bg-orange-500/[0.03] hover:bg-orange-500/[0.06] hover:border-orange-500/30 p-6 transition-all duration-200"
          >
            <div className="text-2xl mb-3">🚀</div>
            <h3 className="font-semibold text-sm mb-1.5 group-hover:text-orange-400 transition-colors">Launching on Product Hunt</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              SwiftChronicle is live on Product Hunt. If this saves you time every WWDC, an upvote helps more developers find it.
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-orange-400 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              See the launch <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        </div>
      </section>

      {/* ── Live feed — below the capability grid ── */}
      <LiveFeed />
    </div>
  )
}
