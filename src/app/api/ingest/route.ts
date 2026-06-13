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
    if (err instanceof Error && (err as NodeJS.ErrnoException & { code?: string }).code === 'DUPLICATE') {
      const e = err as Error & { existingSlug: string; existingName: string }
      return NextResponse.json(
        { error: err.message, existingSlug: e.existingSlug, existingName: e.existingName },
        { status: 409 },
      )
    }
    throw err
  }
}
