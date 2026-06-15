import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { emailSignups, capabilities } from '@/db/schema'
import { eq, desc, gte } from 'drizzle-orm'
import { sendNewCapabilitiesBroadcast } from '@/lib/email'

function authorized(req: NextRequest) {
  return req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET
}

// POST /api/notify/broadcast
// Body: { since?: ISO date string } — defaults to last 7 days
// Sends the latest ready capabilities to all emailSignups subscribers.
export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as { since?: string }
  const since = body.since ? new Date(body.since) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [newCaps, subscribers] = await Promise.all([
    db.select({ name: capabilities.name, slug: capabilities.slug, summary: capabilities.summary })
      .from(capabilities)
      .where(eq(capabilities.status, 'ready'))
      .orderBy(desc(capabilities.createdAt))
      .limit(10),
    db.select({ email: emailSignups.email }).from(emailSignups),
  ])

  if (newCaps.length === 0) {
    return NextResponse.json({ error: 'No capabilities to broadcast' }, { status: 400 })
  }
  if (subscribers.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No subscribers yet' })
  }

  console.log(`[broadcast] ${newCaps.length} caps → ${subscribers.length} subscribers`)

  let sent = 0
  const errors: string[] = []

  for (const sub of subscribers) {
    try {
      await sendNewCapabilitiesBroadcast({ to: sub.email, count: newCaps.length, capabilities: newCaps })
      sent++
    } catch (e) {
      console.error(`[broadcast] failed for ${sub.email}:`, e)
      errors.push(sub.email)
    }
  }

  console.log(`[broadcast] done — ${sent}/${subscribers.length} sent`)
  return NextResponse.json({ sent, total: subscribers.length, errors })
}
