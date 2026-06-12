import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  await db.update(capabilities)
    .set({
      viewCount: sql`${capabilities.viewCount} + 1`,
      rankScore: sql`${capabilities.impactScore} * 10 + ${capabilities.viewCount} + 1`,
    })
    .where(eq(capabilities.slug, slug))
  return NextResponse.json({ ok: true })
}
