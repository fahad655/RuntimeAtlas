import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { capabilities, sources, demos } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const [cap] = await db.select().from(capabilities).where(eq(capabilities.slug, slug)).limit(1)
  if (!cap) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [capSources, capDemos] = await Promise.all([
    db.select().from(sources).where(eq(sources.capabilityId, cap.id)),
    cap.demoId ? db.select().from(demos).where(eq(demos.id, cap.demoId)) : Promise.resolve([]),
  ])

  return NextResponse.json({ capability: cap, sources: capSources, demo: capDemos[0] ?? null })
}
