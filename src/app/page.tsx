import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { CapabilityCard } from '@/components/features/CapabilityCard'
import { LiveFeed } from '@/components/features/LiveFeed'
import { AnimatedBlobs } from '@/components/layout/AnimatedBlobs'
import { ParallaxContent } from '@/components/layout/HeroParallax'
import Link from 'next/link'
import { ArrowRight, Bell, TrendingUp, Code2, CheckCircle, ChevronRight } from 'lucide-react'

export const revalidate = 60

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

export default async function LandingPage() {
  const { featured, total } = await getData()

  return (
    <div className="min-h-screen animate-page-enter">

      {/* ── Hero ── */}
      <section className="relative min-h-[calc(100dvh-4rem)] flex items-center overflow-hidden">

        {/* Mesh grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.30] dark:opacity-[0.15]"
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

        {/* Bottom vignette */}
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-56 bg-gradient-to-t from-background to-transparent" aria-hidden />

        <div className="relative w-full max-w-7xl mx-auto px-5 sm:px-8 py-24 sm:py-32">
          <ParallaxContent>

            {/* Live badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-violet-500/30 bg-violet-500/[0.1] px-4 py-1.5 text-sm text-violet-300 mb-10 backdrop-blur-sm">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
              </span>
              iOS 27 — updated as Apple releases
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-7xl lg:text-[82px] font-bold tracking-tight leading-[1.05] max-w-4xl">
              <span className="text-foreground">Know what dropped.</span>
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #c084fc 0%, #f472b6 55%, #fb923c 100%)' }}
              >
                Track what you&apos;ve shipped.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-7 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              RuntimeAtlas monitors every iOS&nbsp;27 API and SDK change the moment Apple releases it — distilled into scannable cards with runnable Swift code. Mark what you&apos;ve explored, build a streak, and always know exactly where you stand.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-10 mt-9">
              {[
                { value: total > 0 ? `${total}+` : '200+', label: 'capabilities tracked' },
                { value: 'Live',  label: 'updates as Apple ships' },
                { value: '12',    label: 'frameworks covered' },
              ].map(s => (
                <div key={s.label} className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">{s.value}</span>
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mt-10">
              <Link
                href="/features"
                className="group inline-flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold px-7 py-3 text-sm transition-all duration-200 shadow-[0_0_28px_rgba(124,58,237,0.55)] hover:shadow-[0_0_40px_rgba(124,58,237,0.75)] active:scale-[0.97]"
              >
                See what&apos;s new
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
      <section className="py-20 border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">

          <div className="mb-12 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Never fall behind on a release again.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              WWDC drops hundreds of changes. RuntimeAtlas turns that firehose into a structured, trackable feed you can work through at your own pace.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/[0.05] rounded-2xl overflow-hidden">
            {[
              {
                icon: <Bell className="h-5 w-5 text-violet-400" />,
                step: '01',
                title: 'Live capability feed',
                desc: 'Every new API, framework change, and deprecation is ingested automatically from WWDC sessions and Apple developer docs as they go live.',
                accent: 'text-violet-400',
                glow: 'group-hover:text-violet-300',
              },
              {
                icon: <TrendingUp className="h-5 w-5 text-pink-400" />,
                step: '02',
                title: 'Track your learning',
                desc: 'Mark capabilities as done. Build a daily streak. See how much of iOS 27 you\'ve actually covered — not just browsed.',
                accent: 'text-pink-400',
                glow: 'group-hover:text-pink-300',
              },
              {
                icon: <Code2 className="h-5 w-5 text-emerald-400" />,
                step: '03',
                title: 'Ship-ready Swift code',
                desc: 'Every card ships with a real, compilable Swift snippet — not pseudocode. Copy it directly into Xcode, with a link back to the WWDC source.',
                accent: 'text-emerald-400',
                glow: 'group-hover:text-emerald-300',
              },
            ].map(item => (
              <div key={item.step} className="group relative bg-background/80 p-8 sm:p-10 space-y-4 transition-colors duration-200 hover:bg-white/[0.04] overflow-hidden">
                {/* Step number watermark */}
                <span className="absolute top-4 right-5 text-[64px] font-black text-white/[0.03] leading-none select-none pointer-events-none">
                  {item.step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </div>
                <h3 className={`font-semibold text-foreground transition-colors duration-200 ${item.glow}`}>{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Progress teaser ── */}
      <section className="py-16 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="relative rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] overflow-hidden p-8 sm:p-12">
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/[0.06] via-transparent to-pink-500/[0.04]" aria-hidden />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-lg">
              <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-2">Progress tracking</p>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                How much of iOS 27 have you actually shipped?
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Sign in to mark capabilities as done, build a learning streak, and see your real coverage across all {total > 0 ? total : ''} iOS&nbsp;27 APIs — not just the ones you vaguely remember watching at WWDC.
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

      {/* ── Live feed ── */}
      <LiveFeed />

      {/* ── Latest capabilities ── */}
      <section className="pb-32 pt-8 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Latest in iOS 27</h2>
            <p className="text-sm text-muted-foreground mt-1">Highest-impact capabilities added most recently</p>
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
    </div>
  )
}
