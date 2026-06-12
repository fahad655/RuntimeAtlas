import { NextResponse } from 'next/server'
import { db } from '@/db'
import { ingestionEvents, capabilities } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

export async function GET() {
  const feed = await db.select({
    id: ingestionEvents.id,
    topicInput: ingestionEvents.topicInput,
    status: ingestionEvents.status,
    createdAt: ingestionEvents.createdAt,
    capabilityId: ingestionEvents.capabilityId,
    capabilityName: capabilities.name,
    capabilitySlug: capabilities.slug,
    capabilityCategory: capabilities.category,
  })
    .from(ingestionEvents)
    .leftJoin(capabilities, eq(ingestionEvents.capabilityId, capabilities.id))
    .where(eq(ingestionEvents.status, 'classified'))
    .orderBy(desc(ingestionEvents.createdAt))
    .limit(20)

  return NextResponse.json({ feed })
}
