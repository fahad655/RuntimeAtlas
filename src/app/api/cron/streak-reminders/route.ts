import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { userStreaks, userProfiles } from '@/db/schema'
import { eq, and, isNotNull, gt, lt, sql } from 'drizzle-orm'
import { sendStreakReminder } from '@/lib/email'
import { clerkClient } from '@clerk/nextjs/server'

function authorized(req: NextRequest) {
  return req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`
}

export const maxDuration = 60

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Users whose streak is at risk: active 47–71 hours ago (within 1 hour of 72h reset)
  const now = Date.now()
  const upperBound = new Date(now - 47 * 60 * 60 * 1000)  // 47h ago
  const lowerBound = new Date(now - 71 * 60 * 60 * 1000)  // 71h ago

  const atRisk = await db
    .select({
      clerkId: userStreaks.clerkId,
      currentStreak: userStreaks.currentStreak,
      lastActivityAt: userStreaks.lastActivityAt,
    })
    .from(userStreaks)
    .where(
      and(
        gt(userStreaks.currentStreak, 0),
        isNotNull(userStreaks.lastActivityAt),
        lt(userStreaks.lastActivityAt, upperBound),
        gt(userStreaks.lastActivityAt, lowerBound),
      )
    )

  if (atRisk.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No streaks at risk' })
  }

  // Get emails from our userProfiles table (synced on home page load)
  const profiles = await db
    .select({ clerkId: userProfiles.clerkId, email: userProfiles.email })
    .from(userProfiles)
    .where(
      and(
        isNotNull(userProfiles.email),
        sql`${userProfiles.clerkId} = ANY(${atRisk.map(r => r.clerkId)})`,
      )
    )

  const emailByClerkId = new Map(profiles.map(p => [p.clerkId, p.email!]))

  const results: { clerkId: string; ok: boolean; error?: string }[] = []

  console.log(`[streak-reminders] ${atRisk.length} streaks at risk, ${profiles.length} emails found`)

  for (const user of atRisk) {
    const email = emailByClerkId.get(user.clerkId)
    if (!email) {
      console.log(`[streak-reminders] no email for ${user.clerkId}, skipping`)
      continue
    }

    // Get first name from Clerk
    let firstName = 'there'
    try {
      const clerk = await clerkClient()
      const clerkUser = await clerk.users.getUser(user.clerkId)
      firstName = clerkUser.firstName ?? 'there'
    } catch (e) {
      console.warn(`[streak-reminders] failed to fetch Clerk user ${user.clerkId}:`, e)
    }

    try {
      await sendStreakReminder({ to: email, firstName, streak: user.currentStreak })
      console.log(`[streak-reminders] sent to ${email} (streak: ${user.currentStreak})`)
      results.push({ clerkId: user.clerkId, ok: true })
    } catch (e) {
      console.error(`[streak-reminders] failed to send to ${email}:`, e)
      results.push({ clerkId: user.clerkId, ok: false, error: String(e) })
    }
  }

  const sent = results.filter(r => r.ok).length
  console.log(`[streak-reminders] done — ${sent}/${atRisk.length} sent`)
  return NextResponse.json({ sent, total: atRisk.length, results })
}
