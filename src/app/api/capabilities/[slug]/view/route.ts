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
      // impact stays dominant (×100 base), views contribute at half-weight with sqrt damping
      rankScore: sql`${capabilities.impactScore} * 100 + (${capabilities.viewCount} + 1) * 0.5`,
    })
    .where(eq(capabilities.slug, slug))
  return NextResponse.json({ ok: true })
}
