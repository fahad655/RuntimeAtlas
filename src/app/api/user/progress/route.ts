import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { userProgress, userStreaks } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

// Streak rule: increments once per calendar day when a capability is marked complete.
// Missing one day is OK (streak holds). Missing two or more consecutive days resets to 1.
// Streak is ONLY driven by mark-complete actions — never by logins or page visits.

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

function toUTCDateStr(d: Date): string {
  return d.toISOString().slice(0, 10) // "YYYY-MM-DD"
}

async function updateStreak(userId: string) {
  const now = new Date()
  const todayStr = toUTCDateStr(now)

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

  const lastStr = current.lastActivityAt ? toUTCDateStr(current.lastActivityAt) : null

  // Already marked something complete today — no change
  if (lastStr === todayStr) return

  // Was active yesterday → increment; 2+ days ago → reset to 1
  const yesterday = new Date(now)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const yesterdayStr = toUTCDateStr(yesterday)

  const newStreak = lastStr === yesterdayStr ? current.currentStreak + 1 : 1
  const longest = Math.max(newStreak, current.longestStreak)

  await db
    .update(userStreaks)
    .set({ currentStreak: newStreak, longestStreak: longest, lastActivityAt: now, updatedAt: now })
    .where(eq(userStreaks.clerkId, userId))
}
