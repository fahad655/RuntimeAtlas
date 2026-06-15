import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { capabilities, demos } from '@/db/schema'
import { and, eq, isNull } from 'drizzle-orm'

function authorized(req: NextRequest) {
  return req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET
}

// Returns published "updated" capabilities that are missing previousCodeSnippet
export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select({
      id: capabilities.id,
      name: capabilities.name,
      slug: capabilities.slug,
      demoId: capabilities.demoId,
    })
    .from(capabilities)
    .where(and(eq(capabilities.status, 'ready'), eq(capabilities.changeType, 'updated')))

  // Filter to those whose demo is missing previousCodeSnippet
  const missing = []
  for (const row of rows) {
    if (!row.demoId) { missing.push(row); continue }
    const [demo] = await db.select({ prev: demos.previousCodeSnippet })
      .from(demos).where(eq(demos.id, row.demoId)).limit(1)
    if (!demo?.prev) missing.push(row)
  }

  return NextResponse.json({ capabilities: missing })
}
