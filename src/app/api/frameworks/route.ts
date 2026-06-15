import { NextResponse } from 'next/server'
import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getGroupName } from '@/lib/frameworkGroups'

export async function GET() {
  const rows = await db
    .select({ frameworks: capabilities.frameworks })
    .from(capabilities)
    .where(eq(capabilities.status, 'ready'))

  const rawFws = [...new Set(rows.flatMap(r => r.frameworks))]
  const groups = [...new Set(rawFws.map(getGroupName))].sort()

  return NextResponse.json({ frameworks: rawFws.sort(), groups })
}
