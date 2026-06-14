import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { CapabilityCard } from '@/components/features/CapabilityCard'
import { LiveFeed } from '@/components/features/LiveFeed'
import { AnimatedBlobs } from '@/components/layout/AnimatedBlobs'
import { ParallaxContent } from '@/components/layout/HeroParallax'
import Link from 'next/link'
import { ArrowRight, Zap, BookOpen, FlaskConical } from 'lucide-react'

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

        {/* Mesh grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
          aria-hidden
          style={{
            backgroundImage: `
              linear-gradient(rgba(124, 58, 237, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(124, 58, 237, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '52px 52px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)',
          }}
        />

        {/* Animated ambient blobs */}
        <AnimatedBlobs />

        {/* Vignette bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" aria-hidden />

        {/* Hero content with parallax scroll */}
        <div className="relative w-full max-w-7xl mx-auto px-5 sm:px-8 py-24 sm:py-32">
          <ParallaxContent>

            {/* Live badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-violet-500/30 bg-violet-500/[0.1] px-4 py-1.5 text-sm text-violet-300 mb-12 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
              </span>
              iOS 27 Beta — tracking live
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-7xl lg:text-[88px] font-bold tracking-tight leading-[1.0] max-w-5xl text-foreground">
              Every iOS 27 API,{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 40%, #c084fc 70%, #e879f9 100%)',
                  backgroundSize: '200% auto',
                  animation: 'shimmer 4s linear infinite',
                }}
              >
                explained and{' '}
                <br className="hidden sm:block" />
                ready to ship.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              RuntimeAtlas ingests Apple&apos;s WWDC sessions and developer docs, then distills each iOS&nbsp;27 capability into a scannable card with plain-English context and runnable Swift code.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-8 sm:gap-12 mt-10">
              {[
                { value: total > 0 ? `${total}+` : '200+', label: 'capabilities tracked' },
                { value: '12', label: 'frameworks covered' },
                { value: 'Live', label: 'beta updates' },
              ].map(stat => (
                <div key={stat.label} className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-bold text-foreground tabular-nums">{stat.value}</span>
                  <span className="text-muted-foreground text-sm">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mt-12">
              <Link
                href="/features"
                className="group inline-flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold px-7 py-3 text-sm transition-all duration-200 shadow-[0_0_24px_rgba(124,58,237,0.5)] hover:shadow-[0_0_36px_rgba(124,58,237,0.7)] active:scale-[0.97]"
              >
                Browse capabilities
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/demos"
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.15] bg-white/[0.06] hover:bg-white/[0.11] text-foreground font-medium px-7 py-3 text-sm transition-all duration-200 backdrop-blur-sm active:scale-[0.97]"
              >
                <FlaskConical className="h-4 w-4 text-emerald-400" />
                See demos
              </Link>
            </div>

          </ParallaxContent>
        </div>
      </section>

      {/* ── Value props ── */}
      <section className="py-20 border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/[0.05] rounded-2xl overflow-hidden">
            {[
              {
                icon: <Zap className="h-5 w-5 text-violet-400" />,
                title: 'Impact-ranked',
                desc: 'Every capability rated by real-world adoption impact so you know what to learn first.',
                glow: 'group-hover:text-violet-300',
              },
              {
                icon: <FlaskConical className="h-5 w-5 text-emerald-400" />,
                title: 'Runnable demos',
                desc: 'Copy-paste Swift snippets that actually compile, with before/after diffs for updated APIs.',
                glow: 'group-hover:text-emerald-300',
              },
              {
                icon: <BookOpen className="h-5 w-5 text-blue-400" />,
                title: 'Source-mapped',
                desc: 'Linked back to the WWDC session or developer doc behind each feature — follow the trail to first principles.',
                glow: 'group-hover:text-blue-300',
              },
            ].map(item => (
              <div key={item.title} className="group bg-background/80 p-8 sm:p-10 space-y-3 transition-colors duration-200 hover:bg-white/[0.04]">
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

      {/* ── Live feed ── */}
      <LiveFeed />

      {/* ── Featured capabilities ── */}
      <section className="pb-32 pt-8 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">New in iOS 27</h2>
            <p className="text-sm text-muted-foreground mt-1">Highest-impact capabilities, sorted by relevance</p>
          </div>
          <Link
            href="/features"
            className="group inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="text-center py-40 text-muted-foreground">
            <p className="text-lg mb-2">No capabilities published yet.</p>
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
