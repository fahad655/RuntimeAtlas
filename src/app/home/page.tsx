import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { capabilities, userProgress, userStreaks, userProfiles } from '@/db/schema'
import { eq, and, notInArray, inArray } from 'drizzle-orm'
import { Card } from '@/components/ui/card'
import { Flame } from 'lucide-react'
import { CircularRing } from '@/components/user/CircularRing'
import { FrameworkPicker } from '@/components/user/FrameworkPicker'
import { HomeClient } from '@/components/user/HomeClient'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Dashboard' }

export default async function HomePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()

  const [progressRows, streakRow, profileRow] = await Promise.all([
    db.select({ capabilityId: userProgress.capabilityId }).from(userProgress).where(eq(userProgress.clerkId, userId)),
    db.select().from(userStreaks).where(eq(userStreaks.clerkId, userId)).limit(1),
    db.select().from(userProfiles).where(eq(userProfiles.clerkId, userId)).limit(1),
  ])

  const completedIds = progressRows.map(r => r.capabilityId)
  const streak = streakRow[0]
  const profile = profileRow[0]
  const subscribedFrameworks = profile?.subscribedFrameworks ?? []
  const currentStreak = streak?.currentStreak ?? 0
  const longestStreak = streak?.longestStreak ?? 0

  // Fetch all ready capabilities once
  const allCaps = await db.select({
    id: capabilities.id,
    slug: capabilities.slug,
    name: capabilities.name,
    summary: capabilities.summary,
    category: capabilities.category,
    frameworks: capabilities.frameworks,
    impactScore: capabilities.impactScore,
    changeType: capabilities.changeType,
  }).from(capabilities).where(eq(capabilities.status, 'ready'))

  const totalCount = allCaps.length
  const completedCount = completedIds.length
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Per-framework stats
  const allFrameworks = [...new Set(allCaps.flatMap(c => c.frameworks))].sort()
  const frameworkStats = allFrameworks
    .map(fw => {
      const fwCaps = allCaps.filter(c => c.frameworks.includes(fw))
      const fwDone = fwCaps.filter(c => completedIds.includes(c.id)).length
      return {
        name: fw,
        total: fwCaps.length,
        completed: fwDone,
        pct: fwCaps.length > 0 ? Math.round((fwDone / fwCaps.length) * 100) : 0,
        isSubscribed: subscribedFrameworks.includes(fw),
      }
    })
    .sort((a, b) => {
      if (a.isSubscribed !== b.isSubscribed) return a.isSubscribed ? -1 : 1
      return b.total - a.total
    })

  // Queue: incomplete, sorted by impact
  const queue = allCaps
    .filter(c => !completedIds.includes(c.id))
    .sort((a, b) => b.impactScore - a.impactScore)

  // Completed list
  const completed = completedIds.length > 0
    ? await db.select({ id: capabilities.id, slug: capabilities.slug, name: capabilities.name, changeType: capabilities.changeType })
        .from(capabilities).where(inArray(capabilities.id, completedIds))
    : []

  const firstName = user?.firstName ?? 'there'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hey, {firstName}</h1>
        <p className="text-muted-foreground mt-1 text-sm">Your iOS 27 reading progress</p>
      </div>

      {/* Global stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Global completion ring */}
        <Card className="p-5 border-border/50 flex items-center gap-4 sm:col-span-1">
          <CircularRing
            value={completedCount}
            max={totalCount}
            size={80}
            strokeWidth={7}
            trackClass="text-emerald-900/30"
            progressClass="text-emerald-400"
          >
            <span className="text-xl font-bold text-emerald-400">{completionPct}%</span>
          </CircularRing>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Overall</p>
            <p className="text-3xl font-bold mt-0.5">
              {completedCount}
              <span className="text-muted-foreground text-lg font-normal">/{totalCount}</span>
            </p>
            <p className="text-xs text-muted-foreground">capabilities read</p>
          </div>
        </Card>

        {/* Streak */}
        <Card className="p-5 border-border/50 flex items-center gap-4">
          <div className={cn(
            'h-20 w-20 rounded-full flex items-center justify-center shrink-0',
            currentStreak > 0 ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-muted/20 border border-border/30',
          )}>
            <div className="flex flex-col items-center">
              <Flame className={cn('h-6 w-6 mb-0.5', currentStreak > 0 ? 'text-orange-400' : 'text-muted-foreground')} />
              <span className={cn('text-xl font-bold leading-none', currentStreak > 0 ? 'text-orange-400' : 'text-muted-foreground')}>
                {currentStreak}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Streak</p>
            <p className="text-3xl font-bold mt-0.5">{currentStreak}<span className="text-muted-foreground text-base font-normal"> days</span></p>
            <p className="text-xs text-muted-foreground">best: {longestStreak} · resets after 72h</p>
          </div>
        </Card>

        {/* Queue size */}
        <Card className="p-5 border-border/50 flex items-center gap-4">
          <CircularRing
            value={totalCount - queue.length}
            max={totalCount}
            size={80}
            strokeWidth={7}
            trackClass="text-violet-900/20"
            progressClass="text-violet-400"
          >
            <span className="text-xl font-bold text-violet-400">{queue.length}</span>
          </CircularRing>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Queue</p>
            <p className="text-3xl font-bold mt-0.5">{queue.length}</p>
            <p className="text-xs text-muted-foreground">left to read</p>
          </div>
        </Card>
      </div>

      {/* Framework focus picker */}
      <div className="border border-border/50 rounded-xl p-4 space-y-2.5">
        <div>
          <h2 className="font-semibold text-sm">Framework focus</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Pin frameworks — they appear first in the grid below</p>
        </div>
        <FrameworkPicker />
      </div>

      {/* Interactive framework grid + filtered queue */}
      <HomeClient
        frameworks={frameworkStats}
        queue={queue}
        completed={completed}
      />
    </div>
  )
}
