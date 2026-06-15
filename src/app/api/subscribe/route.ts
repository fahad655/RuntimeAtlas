import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { emailSignups } from '@/db/schema'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { email?: string; source?: string; hp?: string }

  // Honeypot — bots fill this hidden field
  if (body.hp) return NextResponse.json({ ok: true })

  const email = body.email?.trim().toLowerCase()
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const source = body.source ?? 'landing'

  try {
    await db.insert(emailSignups).values({ email, source })
    return NextResponse.json({ ok: true })
  } catch {
    // Unique constraint violation = already subscribed
    return NextResponse.json({ ok: true, existing: true })
  }
}
