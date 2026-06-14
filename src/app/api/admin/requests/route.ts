import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { userRequests } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

function authorized(req: NextRequest) {
  return req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select()
    .from(userRequests)
    .orderBy(desc(userRequests.voteCount), desc(userRequests.createdAt))
    .limit(100)

  return NextResponse.json({ requests: rows })
}

export async function PATCH(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status, notes } = await req.json() as { id: number; status: string; notes?: string }
  await db
    .update(userRequests)
    .set({ status: status as 'approved' | 'rejected' | 'ingested', notes: notes ?? null })
    .where(eq(userRequests.id, id))

  return NextResponse.json({ ok: true })
}
