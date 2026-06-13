import { NextRequest, NextResponse } from 'next/server'
import { refreshCapability } from '@/lib/pipeline/orchestrator'

function authorized(req: NextRequest) {
  return req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await refreshCapability(parseInt(id))
  return NextResponse.json({ success: true })
}
