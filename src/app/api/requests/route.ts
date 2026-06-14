import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { userRequests } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  const rows = await db
    .select()
    .from(userRequests)
    .where(eq(userRequests.status, 'pending'))
    .orderBy(desc(userRequests.voteCount), desc(userRequests.createdAt))
    .limit(50)
  return NextResponse.json({ requests: rows })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Sign in to request a capability' }, { status: 401 })

  const { topic, url } = await req.json() as { topic?: string; url?: string }
  const topicInput = topic?.trim()
  if (!topicInput) return NextResponse.json({ error: 'topic is required' }, { status: 400 })

  const [row] = await db
    .insert(userRequests)
    .values({ clerkId: userId, topicInput, sourceUrl: url?.trim() || null })
    .returning()

  return NextResponse.json({ ok: true, id: row.id })
}
