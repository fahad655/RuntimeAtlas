import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { userProgress, userStreaks } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

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

  // Idempotent — only insert if not already completed
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
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

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
      lastActivityDate: today,
    })
    return
  }

  if (current.lastActivityDate === today) return // already counted today

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  const newStreak = current.lastActivityDate === yesterdayStr ? current.currentStreak + 1 : 1
  const longest = Math.max(newStreak, current.longestStreak)

  await db
    .update(userStreaks)
    .set({ currentStreak: newStreak, longestStreak: longest, lastActivityDate: today, updatedAt: new Date() })
    .where(eq(userStreaks.clerkId, userId))
}
