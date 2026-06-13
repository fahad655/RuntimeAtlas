import { NextResponse } from 'next/server'
import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const rows = await db
    .select({ frameworks: capabilities.frameworks })
    .from(capabilities)
    .where(eq(capabilities.status, 'ready'))

  const unique = [...new Set(rows.flatMap(r => r.frameworks))].sort()
  return NextResponse.json({ frameworks: unique })
}
