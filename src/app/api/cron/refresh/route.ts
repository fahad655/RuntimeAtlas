import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { capabilities } from '@/db/schema'
import { eq, asc, isNull } from 'drizzle-orm'
import { refreshCapability } from '@/lib/pipeline/orchestrator'

// Vercel Cron calls this with Authorization: Bearer <CRON_SECRET>
function authorized(req: NextRequest) {
  const auth = req.headers.get('authorization')
  return auth === `Bearer ${process.env.CRON_SECRET}`
}

export const maxDuration = 300

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Pick up to 5 ready capabilities that have never been refreshed (no updatedAt change)
  // or whose demo has no code snippet yet — low-hanging fruit for data quality
  const stale = await db
    .select({ id: capabilities.id, name: capabilities.name })
    .from(capabilities)
    .where(eq(capabilities.status, 'ready'))
    .orderBy(asc(capabilities.updatedAt))
    .limit(5)

  const results: { id: number; name: string; ok: boolean; error?: string }[] = []

  for (const cap of stale) {
    try {
      await refreshCapability(cap.id)
      results.push({ id: cap.id, name: cap.name, ok: true })
    } catch (e) {
      results.push({ id: cap.id, name: cap.name, ok: false, error: String(e) })
    }
  }

  return NextResponse.json({ refreshed: results.length, results })
}
