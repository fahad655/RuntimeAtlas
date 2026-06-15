import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { demos } from '@/db/schema'
import { eq } from 'drizzle-orm'

function authorized(req: NextRequest) {
  return req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json() as {
    title?: string
    description?: string
    codeSnippet?: string
    previousCodeSnippet?: string | null
    repoUrl?: string | null
  }

  const updates: Record<string, unknown> = {}
  if (body.title !== undefined) updates.title = body.title
  if (body.description !== undefined) updates.description = body.description
  if (body.codeSnippet !== undefined) updates.codeSnippet = body.codeSnippet
  if (body.previousCodeSnippet !== undefined) updates.previousCodeSnippet = body.previousCodeSnippet
  if (body.repoUrl !== undefined) updates.repoUrl = body.repoUrl

  if (Object.keys(updates).length === 0)
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })

  const [updated] = await db.update(demos)
    .set(updates)
    .where(eq(demos.id, parseInt(id)))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ demo: updated })
}
