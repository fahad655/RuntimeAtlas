import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { CapabilityCard } from '@/components/features/CapabilityCard'
import { LiveFeed } from '@/components/features/LiveFeed'
import Link from 'next/link'

export const revalidate = 60

async function getFeatured() {
  return db.select().from(capabilities)
    .where(eq(capabilities.status, 'ready'))
    .orderBy(desc(capabilities.rankScore))
    .limit(12)
}

export default async function HomePage() {
  const featured = await getFeatured()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative px-4 sm:px-6 pt-20 pb-14 max-w-7xl mx-auto">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-60 right-0 w-[600px] h-[600px] rounded-full bg-violet-600/8 blur-3xl" />
          <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/8 blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-sm text-violet-400 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
          </span>
          iOS 27 Beta — tracking live
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] max-w-4xl">
          Every new iOS SDK capability,{' '}
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            turned into a demo
          </span>{' '}
          you can actually use.
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
          RuntimeAtlas ingests Apple&apos;s scattered docs and WWDC sessions, then turns each iOS 27 capability into a scannable card with a plain-English explanation and runnable Swift code.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/features"
            className="inline-flex items-center rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium px-5 py-2.5 text-sm transition-colors"
          >
            Browse capabilities
          </Link>
          <Link
            href="/engine"
            className="inline-flex items-center rounded-lg border border-border hover:bg-accent text-foreground font-medium px-5 py-2.5 text-sm transition-colors"
          >
            See the engine
          </Link>
        </div>
      </section>

      {/* Live feed */}
      <LiveFeed />

      {/* Feature grid */}
      <section className="px-4 sm:px-6 pb-24 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">New in iOS 27</h2>
          <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            View all →
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="text-center py-32 text-muted-foreground">
            <p className="text-lg mb-2">No capabilities published yet.</p>
            <p className="text-sm">
              Head to{' '}
              <Link href="/admin" className="text-violet-400 hover:underline">/admin</Link>
              {' '}to run the first ingestion.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featured.map(cap => <CapabilityCard key={cap.id} capability={cap} />)}
          </div>
        )}
      </section>
    </div>
  )
}
