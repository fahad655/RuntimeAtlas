import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { mcpTokens } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { generateMcpToken, hashMcpToken } from '@/lib/mcpToken'

// GET: whether the signed-in user has an active token (never returns the raw value).
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [row] = await db
    .select({ createdAt: mcpTokens.createdAt, lastUsedAt: mcpTokens.lastUsedAt })
    .from(mcpTokens)
    .where(and(eq(mcpTokens.clerkId, userId), isNull(mcpTokens.revokedAt)))
    .limit(1)

  return NextResponse.json({ hasToken: !!row, createdAt: row?.createdAt ?? null, lastUsedAt: row?.lastUsedAt ?? null })
}

// POST: generate a new token, revoking any existing one. Raw token is returned
// exactly once — the server only ever stores its SHA-256 hash.
export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rawToken = generateMcpToken()
  const tokenHash = hashMcpToken(rawToken)

  await db.delete(mcpTokens).where(eq(mcpTokens.clerkId, userId))
  await db.insert(mcpTokens).values({ clerkId: userId, tokenHash })

  return NextResponse.json({ token: rawToken })
}

// DELETE: revoke the signed-in user's token.
export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await db.delete(mcpTokens).where(eq(mcpTokens.clerkId, userId))
  return NextResponse.json({ ok: true })
}
