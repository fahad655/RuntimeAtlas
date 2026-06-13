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

  return NextResponse.json({
    subscribedFrameworks: profile?.subscribedFrameworks ?? [],
    currentStreak: streak?.currentStreak ?? 0,
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
