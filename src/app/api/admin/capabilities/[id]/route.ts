import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import type { Category, CapabilityStatus } from '@/types'

function authorized(req: NextRequest) {
  return req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json() as {
    status?: CapabilityStatus
    impactScore?: number
    name?: string
    summary?: string
    category?: Category
    frameworks?: string[]
    gotchas?: string
    hardwareConstraints?: string
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (body.status !== undefined) updates.status = body.status
  if (body.impactScore !== undefined) {
    updates.impactScore = body.impactScore
    updates.rankScore = sql`${body.impactScore} * 10 + ${capabilities.viewCount}`
  }
  if (body.name !== undefined) updates.name = body.name
  if (body.summary !== undefined) updates.summary = body.summary
  if (body.category !== undefined) updates.category = body.category
  if (body.frameworks !== undefined) updates.frameworks = body.frameworks
  if (body.gotchas !== undefined) updates.gotchas = body.gotchas
  if (body.hardwareConstraints !== undefined) updates.hardwareConstraints = body.hardwareConstraints

  const [updated] = await db.update(capabilities)
    .set(updates)
    .where(eq(capabilities.id, parseInt(id)))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ capability: updated })
}
