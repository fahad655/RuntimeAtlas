import { NextRequest, NextResponse } from 'next/server'
import { runIngestionPipeline } from '@/lib/pipeline/orchestrator'

function authorized(req: NextRequest) {
  return req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as { topic?: string; url?: string }
  const topic = body.topic?.trim()
  const url = body.url?.trim()

  if (!topic) {
    return NextResponse.json({ error: 'topic is required' }, { status: 400 })
  }

  try {
    const result = await runIngestionPipeline(topic, url || undefined)
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    const code = err instanceof Error ? (err as Error & { code?: string }).code : undefined

    if (code === 'DUPLICATE') {
      const e = err as Error & { existingSlug: string; existingName: string }
      return NextResponse.json(
        { error: (err as Error).message, existingSlug: e.existingSlug, existingName: e.existingName },
        { status: 409 },
      )
    }

    if (code === 'NOT_IOS27') {
      const e = err as Error & { rejectionReason?: string }
      return NextResponse.json(
        { error: 'Topic rejected: not iOS 27 / WWDC 2026 specific', reason: e.rejectionReason ?? (err as Error).message },
        { status: 422 },
      )
    }

    throw err
  }
}
