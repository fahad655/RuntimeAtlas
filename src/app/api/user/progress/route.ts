import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { userProgress, userStreaks } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

const HOUR_MS = 60 * 60 * 1000
const STREAK_BREAK_MS  = 72 * HOUR_MS  // streak resets after 72h of inactivity
const STREAK_WINDOW_MS = 24 * HOUR_MS  // must wait 24h before incrementing again

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select({ capabilityId: userProgress.capabilityId })
    .from(userProgress)
    .where(eq(userProgress.clerkId, userId))

  return NextResponse.json({ completedIds: rows.map(r => r.capabilityId) })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { capabilityId } = await req.json()
  if (!capabilityId) return NextResponse.json({ error: 'capabilityId required' }, { status: 400 })

  const [existing] = await db
    .select({ id: userProgress.id })
    .from(userProgress)
    .where(and(eq(userProgress.clerkId, userId), eq(userProgress.capabilityId, capabilityId)))
    .limit(1)

  if (!existing) {
    await db.insert(userProgress).values({ clerkId: userId, capabilityId })
    await updateStreak(userId)
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { capabilityId } = await req.json()
  await db
    .delete(userProgress)
    .where(and(eq(userProgress.clerkId, userId), eq(userProgress.capabilityId, capabilityId)))

  return NextResponse.json({ ok: true })
}

async function updateStreak(userId: string) {
  const now = new Date()

  const [current] = await db
    .select()
    .from(userStreaks)
    .where(eq(userStreaks.clerkId, userId))
    .limit(1)

  if (!current) {
    await db.insert(userStreaks).values({
      clerkId: userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActivityAt: now,
    })
    return
  }

  const last = current.lastActivityAt
  if (!last) {
    // first activity on upgraded schema
    await db.update(userStreaks).set({ currentStreak: 1, longestStreak: Math.max(1, current.longestStreak), lastActivityAt: now, updatedAt: now }).where(eq(userStreaks.clerkId, userId))
    return
  }

  const elapsed = now.getTime() - last.getTime()

  if (elapsed < STREAK_WINDOW_MS) return // same window, already counted

  const newStreak = elapsed < STREAK_BREAK_MS ? current.currentStreak + 1 : 1
  const longest = Math.max(newStreak, current.longestStreak)

  await db
    .update(userStreaks)
    .set({ currentStreak: newStreak, longestStreak: longest, lastActivityAt: now, updatedAt: now })
    .where(eq(userStreaks.clerkId, userId))
}
