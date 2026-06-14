import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { CapabilityCard } from '@/components/features/CapabilityCard'
import { LiveFeed } from '@/components/features/LiveFeed'
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
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
        {/* Animated ambient light blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[15%] right-[10%] w-[700px] h-[700px] rounded-full opacity-[0.13] blur-[140px]"
            style={{
              background: 'radial-gradient(circle, #7C3AED, transparent 70%)',
              animation: 'blob-drift-1 22s ease-in-out infinite',
            }}
          />
          <div
            className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] rounded-full opacity-[0.09] blur-[120px]"
            style={{
              background: 'radial-gradient(circle, #4F46E5, transparent 70%)',
              animation: 'blob-drift-2 28s ease-in-out infinite',
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-[1000px] h-[600px] rounded-full opacity-[0.05] blur-[180px]"
            style={{
              background: 'radial-gradient(ellipse, #8B5CF6, transparent 60%)',
              animation: 'blob-drift-3 18s ease-in-out infinite',
            }}
          />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-5 sm:px-8 py-24 sm:py-32">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/[0.08] px-3.5 py-1.5 text-sm text-violet-400 mb-10">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500" />
            </span>
            iOS 27 Beta — tracking live
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-[80px] font-bold tracking-tight leading-[1.0] max-w-5xl text-foreground">
            Every iOS 27 API,{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #c084fc 100%)' }}
            >
              explained and
              <br className="hidden sm:block" />
              ready to ship.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-7 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            RuntimeAtlas ingests Apple&apos;s WWDC sessions and developer docs, then distills each iOS 27 capability into a scannable card with plain-English context and runnable Swift code.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-10 mt-8 text-sm">
            {[
              { value: total > 0 ? `${total}+` : '200+', label: 'capabilities tracked' },
              { value: '12', label: 'frameworks covered' },
              { value: 'Live', label: 'beta updates' },
            ].map(stat => (
              <div key={stat.label} className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</span>
                <span className="text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mt-10">
            <Link
              href="/features"
              className="inline-flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-medium px-6 py-2.5 text-sm transition-all duration-150 shadow-lg shadow-violet-900/30 active:scale-[0.97]"
            >
              Browse capabilities
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/demos"
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-foreground font-medium px-6 py-2.5 text-sm transition-all duration-150 backdrop-blur-sm active:scale-[0.97]"
            >
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
              See demos
            </Link>
          </div>
        </div>
      </section>

      {/* ── Value props ── */}
      <section className="py-16 border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/[0.05] rounded-2xl overflow-hidden">
            {[
              {
                icon: <Zap className="h-5 w-5 text-violet-400" />,
                title: 'Impact-ranked',
                desc: 'Every capability rated by real-world adoption impact so you know what to learn first.',
              },
              {
                icon: <FlaskConical className="h-5 w-5 text-emerald-400" />,
                title: 'Runnable demos',
                desc: 'Copy-paste Swift snippets that actually compile, with before/after diffs for updated APIs.',
              },
              {
                icon: <BookOpen className="h-5 w-5 text-blue-400" />,
                title: 'Source-mapped',
                desc: 'Linked back to the WWDC session or developer doc behind each feature — follow the trail to first principles.',
              },
            ].map(item => (
              <div key={item.title} className="bg-background/80 p-8 sm:p-10 space-y-3">
                <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
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
            className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
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
