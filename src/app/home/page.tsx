import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { capabilities, userProgress, userStreaks, userProfiles } from '@/db/schema'
import { eq, and, notInArray, inArray } from 'drizzle-orm'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Flame, BookOpen, CheckCircle } from 'lucide-react'
import { FrameworkPicker } from '@/components/user/FrameworkPicker'
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

  // Load user data in parallel
  const [progressRows, streakRow, profileRow] = await Promise.all([
    db.select({ capabilityId: userProgress.capabilityId }).from(userProgress).where(eq(userProgress.clerkId, userId)),
    db.select().from(userStreaks).where(eq(userStreaks.clerkId, userId)).limit(1),
    db.select().from(userProfiles).where(eq(userProfiles.clerkId, userId)).limit(1),
  ])

  const completedIds = progressRows.map(r => r.capabilityId)
  const streak = streakRow[0]
  const profile = profileRow[0]
  const subscribedFrameworks = profile?.subscribedFrameworks ?? []

  // Build reading queue: ready capabilities not yet completed, filtered by subscribed frameworks
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

  // Filter to subscribed frameworks when the user has subscriptions
  if (subscribedFrameworks.length > 0) {
    queue = queue.filter(cap =>
      cap.frameworks.some(fw => subscribedFrameworks.includes(fw))
    )
  }

  // Sort by impact desc
  queue.sort((a, b) => b.impactScore - a.impactScore)

  // Completed capabilities for the "done" section
  const completed = completedIds.length > 0
    ? await db.select({ id: capabilities.id, slug: capabilities.slug, name: capabilities.name, changeType: capabilities.changeType })
        .from(capabilities).where(inArray(capabilities.id, completedIds))
    : []

  const firstName = user?.firstName ?? 'there'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hey, {firstName}</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your iOS 27 reading progress</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <Flame className={cn('h-5 w-5', (streak?.currentStreak ?? 0) > 0 ? 'text-orange-400' : 'text-muted-foreground')} />
              <span className={cn('text-2xl font-bold', (streak?.currentStreak ?? 0) > 0 ? 'text-orange-400' : 'text-foreground')}>
                {streak?.currentStreak ?? 0}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">day streak</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span className="text-2xl font-bold">{completedIds.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">completed</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <BookOpen className="h-5 w-5 text-violet-400" />
              <span className="text-2xl font-bold">{queue.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">in queue</p>
          </div>
        </div>
      </div>

      {/* Framework subscriptions */}
      <div className="border border-border/50 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-sm">Framework subscriptions</h2>
        <FrameworkPicker />
      </div>

      {/* Reading queue */}
      <div className="space-y-4">
        <h2 className="font-semibold">
          {subscribedFrameworks.length > 0 ? `${subscribedFrameworks.join(', ')} queue` : 'Reading queue'}
          <span className="ml-2 text-muted-foreground font-normal text-sm">({queue.length})</span>
        </h2>
        {queue.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm border border-border/50 rounded-xl">
            {subscribedFrameworks.length > 0
              ? 'All caught up with your subscribed frameworks!'
              : 'All capabilities completed — check back after the next beta drop.'}
          </div>
        ) : (
          <div className="grid gap-3">
            {queue.slice(0, 20).map(cap => (
              <Link key={cap.id} href={`/features/${cap.slug}`}>
                <Card className="p-4 border-border/50 hover:border-border transition-colors group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className={cn('text-xs', CHANGE_COLORS[cap.changeType])}>
                          {cap.changeType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{cap.category}</span>
                      </div>
                      <p className="font-medium text-sm group-hover:text-foreground truncate">{cap.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{cap.summary}</p>
                    </div>
                    <div className="shrink-0 text-xs text-muted-foreground mt-1">
                      {cap.impactScore}/5
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
                <Badge variant="outline" className="text-xs text-muted-foreground hover:text-foreground transition-colors gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
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
