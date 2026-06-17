import { auth, currentUser } from '@clerk/nextjs/server'
import { getGroupName } from '@/lib/frameworkGroups'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { capabilities, userProgress, userStreaks, userProfiles } from '@/db/schema'
import { eq, inArray, sql } from 'drizzle-orm'
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

  // Sync Clerk email into our DB so we can send streak reminders
  const clerkEmail = user?.emailAddresses[0]?.emailAddress
  if (clerkEmail && clerkEmail !== profile?.email) {
    await db.insert(userProfiles)
      .values({ clerkId: userId, email: clerkEmail })
      .onConflictDoUpdate({ target: userProfiles.clerkId, set: { email: clerkEmail, updatedAt: sql`now()` } })
  }

  const streakExpired = streak?.lastActivityAt
    ? Math.floor((Date.now() - streak.lastActivityAt.getTime()) / 86_400_000) >= 2
    : true
  const currentStreak = streakExpired ? 0 : (streak?.currentStreak ?? 0)
  const longestStreak = streak?.longestStreak ?? 0

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

  // Group individual framework strings into broader categories
  const groupCapIds = new Map<string, Set<number>>()
  const groupFws = new Map<string, Set<string>>()
  const groupSubscribed = new Map<string, boolean>()

  for (const cap of allCaps) {
    for (const fw of cap.frameworks) {
      const group = getGroupName(fw)
      if (!groupCapIds.has(group)) {
        groupCapIds.set(group, new Set())
        groupFws.set(group, new Set())
        groupSubscribed.set(group, false)
      }
      groupCapIds.get(group)!.add(cap.id)
      groupFws.get(group)!.add(fw)
      if (subscribedFrameworks.includes(group) || subscribedFrameworks.includes(fw)) groupSubscribed.set(group, true)
    }
  }

  const frameworkStats = [...groupCapIds.entries()].map(([name, capIdSet]) => {
    const groupCaps = allCaps.filter(c => capIdSet.has(c.id))
    const done = groupCaps.filter(c => completedIds.includes(c.id)).length
    const total = groupCaps.length
    return {
      name,
      frameworks: [...(groupFws.get(name) ?? [])],
      total,
      completed: done,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
      isSubscribed: groupSubscribed.get(name) ?? false,
    }
  }).sort((a, b) => {
    if (a.isSubscribed !== b.isSubscribed) return a.isSubscribed ? -1 : 1
    return b.total - a.total
  })

  const queue = allCaps
    .filter(c => !completedIds.includes(c.id))
    .sort((a, b) => b.impactScore - a.impactScore)

  const completed = completedIds.length > 0
    ? await db.select({ id: capabilities.id, slug: capabilities.slug, name: capabilities.name, changeType: capabilities.changeType })
        .from(capabilities).where(inArray(capabilities.id, completedIds))
    : []

  const firstName = user?.firstName ?? 'there'

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12 space-y-10 animate-page-enter">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hey, {firstName}</h1>
        <p className="text-muted-foreground mt-1 text-sm">Your iOS 27 reading progress</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Overall */}
        <div className="rounded-2xl border border-border/60 dark:border-white/[0.07] bg-muted/30 dark:bg-white/[0.03] p-5 flex items-center gap-4 sm:col-span-1">
          <CircularRing
            value={completedCount}
            max={totalCount}
            size={80}
            strokeWidth={6}
            trackClass="text-emerald-900/30"
            progressClass="text-emerald-400"
          >
            <span className="text-xl font-bold text-emerald-400">{completionPct}%</span>
          </CircularRing>
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">Overall</p>
            <p className="text-3xl font-bold mt-1 tabular-nums">
              {completedCount}
              <span className="text-muted-foreground text-lg font-normal">/{totalCount}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">capabilities read</p>
          </div>
        </div>

        {/* Streak */}
        <div className="rounded-2xl border border-border/60 dark:border-white/[0.07] bg-muted/30 dark:bg-white/[0.03] p-5 flex items-center gap-4">
          <div className={cn(
            'h-20 w-20 rounded-2xl flex items-center justify-center shrink-0',
            currentStreak > 0
              ? 'bg-orange-500/[0.08] border border-orange-500/20'
              : 'bg-muted/30 dark:bg-white/[0.03] border border-border/60 dark:border-white/[0.07]',
          )}>
            <div className="flex flex-col items-center gap-0.5">
              <Flame className={cn('h-6 w-6', currentStreak > 0 ? 'text-orange-400' : 'text-muted-foreground')} />
              <span className={cn('text-xl font-bold leading-none tabular-nums', currentStreak > 0 ? 'text-orange-400' : 'text-muted-foreground')}>
                {currentStreak}
              </span>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">Streak</p>
            <p className="text-3xl font-bold mt-1 tabular-nums">
              {currentStreak}
              <span className="text-muted-foreground text-base font-normal"> days</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">best: {longestStreak} · resets 72h</p>
          </div>
        </div>

        {/* Queue */}
        <div className="rounded-2xl border border-border/60 dark:border-white/[0.07] bg-muted/30 dark:bg-white/[0.03] p-5 flex items-center gap-4">
          <CircularRing
            value={totalCount - queue.length}
            max={totalCount}
            size={80}
            strokeWidth={6}
            trackClass="text-violet-900/20"
            progressClass="text-violet-400"
          >
            <span className="text-xl font-bold text-violet-400">{queue.length}</span>
          </CircularRing>
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">Queue</p>
            <p className="text-3xl font-bold mt-1 tabular-nums">{queue.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">left to read</p>
          </div>
        </div>
      </div>

      {/* Framework focus */}
      <div className="rounded-2xl border border-border/60 dark:border-white/[0.07] bg-muted/30 dark:bg-white/[0.03] p-5 space-y-3">
        <div>
          <h2 className="font-semibold text-sm">Framework focus</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Pin frameworks — they appear first in the grid below</p>
        </div>
        <FrameworkPicker />
      </div>

      {/* Interactive grid + queue */}
      <HomeClient
        frameworks={frameworkStats}
        queue={queue}
        completed={completed}
      />
    </div>
  )
}
