import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { userRequests } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const requestId = parseInt(id, 10)
  if (isNaN(requestId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  await db
    .update(userRequests)
    .set({ voteCount: sql`${userRequests.voteCount} + 1` })
    .where(eq(userRequests.id, requestId))

  return NextResponse.json({ ok: true })
}
