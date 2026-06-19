import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { userProfiles, userStreaks } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.clerkId, userId)).limit(1)
  const [streak] = await db.select().from(userStreaks).where(eq(userStreaks.clerkId, userId)).limit(1)

  // Streak expires if last mark-complete was 2+ calendar days ago (UTC date strings)
  function calendarDayDiff(last: Date, now: Date): number {
    const lastStr = last.toISOString().slice(0, 10)
    const nowStr = now.toISOString().slice(0, 10)
    const msPerDay = 86_400_000
    return Math.round((new Date(nowStr).getTime() - new Date(lastStr).getTime()) / msPerDay)
  }
  const now = new Date()
  const streakExpired = streak?.lastActivityAt
    ? calendarDayDiff(streak.lastActivityAt, now) >= 2
    : true
  const currentStreak = streakExpired ? 0 : (streak?.currentStreak ?? 0)

  return NextResponse.json({
    subscribedFrameworks: profile?.subscribedFrameworks ?? [],
    currentStreak,
    longestStreak: streak?.longestStreak ?? 0,
    lastActivityDate: streak?.lastActivityDate ?? null,
  })
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subscribedFrameworks } = await req.json()

  await db
    .insert(userProfiles)
    .values({ clerkId: userId, subscribedFrameworks })
    .onConflictDoUpdate({
      target: userProfiles.clerkId,
      set: { subscribedFrameworks, updatedAt: new Date() },
    })

  return NextResponse.json({ ok: true })
}
