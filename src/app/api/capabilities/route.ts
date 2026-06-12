import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { and, eq, desc, sql } from 'drizzle-orm'
import type { Category } from '@/types'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') as Category | null
  const framework = searchParams.get('framework')
  const hasDemo = searchParams.get('hasDemo')
  const sort = searchParams.get('sort') ?? 'rank'
  const status = (searchParams.get('status') ?? 'ready') as 'ready' | 'needs_review'

  const conditions = [eq(capabilities.status, status)]
  if (category) conditions.push(eq(capabilities.category, category))

  const orderCol =
    sort === 'trending' ? desc(capabilities.viewCount) :
    sort === 'impact'   ? desc(capabilities.impactScore) :
    sort === 'newest'   ? desc(capabilities.createdAt) :
                          desc(capabilities.rankScore)

  let rows = await db.select().from(capabilities)
    .where(and(...conditions))
    .orderBy(orderCol)
    .limit(200)

  // Post-filter for array fields (framework) and boolean (hasDemo)
  if (framework) rows = rows.filter(c => c.frameworks.includes(framework))
  if (hasDemo === 'true') rows = rows.filter(c => c.demoId != null)

  return NextResponse.json({ capabilities: rows })
}
