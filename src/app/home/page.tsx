import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { capabilities, userProgress, userStreaks, userProfiles } from '@/db/schema'
import { eq, and, notInArray, inArray } from 'drizzle-orm'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import { FrameworkPicker } from '@/components/user/FrameworkPicker'
import { CircularRing } from '@/components/user/CircularRing'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Dashboard' }

const CHANGE_COLORS: Record<string, string> = {
  new: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  updated: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  deprecated: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default async function HomePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()

  const [progressRows, streakRow, profileRow, totalRow] = await Promise.all([
    db.select({ capabilityId: userProgress.capabilityId }).from(userProgress).where(eq(userProgress.clerkId, userId)),
    db.select().from(userStreaks).where(eq(userStreaks.clerkId, userId)).limit(1),
    db.select().from(userProfiles).where(eq(userProfiles.clerkId, userId)).limit(1),
    db.select({ id: capabilities.id }).from(capabilities).where(eq(capabilities.status, 'ready')),
  ])

  const completedIds = progressRows.map(r => r.capabilityId)
  const streak = streakRow[0]
  const profile = profileRow[0]
  const subscribedFrameworks = profile?.subscribedFrameworks ?? []
  const totalCount = totalRow.length
  const completedCount = completedIds.length
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const baseConditions = [eq(capabilities.status, 'ready')]
  if (completedIds.length > 0) baseConditions.push(notInArray(capabilities.id, completedIds))

  let queue = await db.select({
    id: capabilities.id,
    slug: capabilities.slug,
    name: capabilities.name,
    summary: capabilities.summary,
    category: capabilities.category,
    frameworks: capabilities.frameworks,
    impactScore: capabilities.impactScore,
    changeType: capabilities.changeType,
  }).from(capabilities).where(and(...baseConditions))

  if (subscribedFrameworks.length > 0) {
    queue = queue.filter(cap => cap.frameworks.some(fw => subscribedFrameworks.includes(fw)))
  }
  queue.sort((a, b) => b.impactScore - a.impactScore)

  const completed = completedIds.length > 0
    ? await db.select({ id: capabilities.id, slug: capabilities.slug, name: capabilities.name, changeType: capabilities.changeType })
        .from(capabilities).where(inArray(capabilities.id, completedIds))
    : []

  const firstName = user?.firstName ?? 'there'
  const currentStreak = streak?.currentStreak ?? 0
  const longestStreak = streak?.longestStreak ?? 0
  const streakMax = Math.max(longestStreak, 7)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hey, {firstName}</h1>
        <p className="text-muted-foreground mt-1 text-sm">Your iOS 27 reading progress</p>
      </div>

      {/* Stats rings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Completion ring */}
        <Card className="p-6 border-border/50 flex items-center gap-5">
          <CircularRing
            value={completedCount}
            max={totalCount}
            size={80}
            strokeWidth={7}
            trackClass="text-emerald-900/40"
            progressClass="text-emerald-400"
          >
            <span className="text-xl font-bold text-emerald-400">{completionPct}%</span>
          </CircularRing>
          <div>
            <p className="font-semibold text-sm">Progress</p>
            <p className="text-2xl font-bold">{completedCount}<span className="text-muted-foreground text-base font-normal">/{totalCount}</span></p>
            <p className="text-xs text-muted-foreground mt-0.5">capabilities read</p>
          </div>
        </Card>

        {/* Streak ring */}
        <Card className="p-6 border-border/50 flex items-center gap-5">
          <CircularRing
            value={currentStreak}
            max={streakMax}
            size={80}
            strokeWidth={7}
            trackClass={currentStreak > 0 ? 'text-orange-900/40' : 'text-muted/30'}
            progressClass={currentStreak > 0 ? 'text-orange-400' : 'text-muted-foreground'}
          >
            <span className={cn('text-xl font-bold', currentStreak > 0 ? 'text-orange-400' : 'text-muted-foreground')}>
              {currentStreak}
            </span>
          </CircularRing>
          <div>
            <p className="font-semibold text-sm">Streak</p>
            <p className="text-2xl font-bold">{currentStreak}<span className="text-muted-foreground text-sm font-normal"> days</span></p>
            <p className="text-xs text-muted-foreground mt-0.5">best: {longestStreak} days</p>
          </div>
        </Card>

        {/* Queue ring */}
        <Card className="p-6 border-border/50 flex items-center gap-5">
          <CircularRing
            value={queue.length}
            max={totalCount}
            size={80}
            strokeWidth={7}
            trackClass="text-violet-900/30"
            progressClass="text-violet-400"
          >
            <span className="text-xl font-bold text-violet-400">{queue.length}</span>
          </CircularRing>
          <div>
            <p className="font-semibold text-sm">Queue</p>
            <p className="text-2xl font-bold">{queue.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">left to read</p>
          </div>
        </Card>
      </div>

      {/* Framework subscriptions */}
      <div className="border border-border/50 rounded-xl p-5 space-y-3">
        <div>
          <h2 className="font-semibold text-sm">Framework focus</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Pin frameworks to filter your reading queue</p>
        </div>
        <FrameworkPicker />
      </div>

      {/* Reading queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">
            {subscribedFrameworks.length > 0 ? 'Pinned queue' : 'Reading queue'}
          </h2>
          <span className="text-xs text-muted-foreground">{queue.length} remaining</span>
        </div>
        {queue.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm border border-border/50 rounded-xl">
            {subscribedFrameworks.length > 0
              ? 'All caught up with your pinned frameworks!'
              : 'All caught up — check back after the next beta drop.'}
          </div>
        ) : (
          <div className="grid gap-2">
            {queue.slice(0, 20).map((cap, i) => (
              <Link key={cap.id} href={`/features/${cap.slug}`}>
                <Card className="p-4 border-border/50 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground/50 font-mono w-4 shrink-0">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <Badge variant="outline" className={cn('text-xs', CHANGE_COLORS[cap.changeType])}>
                          {cap.changeType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{cap.category}</span>
                      </div>
                      <p className="font-medium text-sm group-hover:text-foreground truncate">{cap.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{cap.summary}</p>
                    </div>
                    <div className="shrink-0">
                      <CircularRing value={cap.impactScore} max={5} size={28} strokeWidth={3} trackClass="text-muted/20" progressClass="text-violet-400">
                        <span className="text-[9px] font-bold text-violet-400">{cap.impactScore}</span>
                      </CircularRing>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-muted-foreground text-sm">Completed ({completed.length})</h2>
          <div className="flex flex-wrap gap-2">
            {completed.map(cap => (
              <Link key={cap.id} href={`/features/${cap.slug}`}>
                <Badge variant="outline" className="text-xs text-muted-foreground hover:text-foreground transition-colors gap-1.5 py-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                  {cap.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
