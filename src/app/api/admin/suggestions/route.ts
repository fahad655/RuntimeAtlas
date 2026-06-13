import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { capabilities } from '@/db/schema'

function authorized(req: NextRequest) {
  return req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET
}

interface ReleaseNotesContent {
  type: string
  level?: number
  text?: string
  inlineContent?: { type: string; text?: string }[]
}

interface ReleaseNotesJson {
  primaryContentSections?: { content?: ReleaseNotesContent[] }[]
}

async function fetchSuggestionsFromApple(): Promise<{ framework: string; description: string }[]> {
  const url = 'https://developer.apple.com/tutorials/data/documentation/iOS-iPadOS-Release-Notes/ios-ipados-27-release-notes.json'
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return []
  const data = await res.json() as ReleaseNotesJson
  const content = data.primaryContentSections?.[0]?.content ?? []

  const results: { framework: string; description: string }[] = []
  let currentFramework: string | null = null
  let nextIsNew = false
  let descLines: string[] = []

  for (const item of content) {
    if (item.type === 'heading') {
      if (item.level === 3) {
        currentFramework = item.text ?? null
        nextIsNew = false
        descLines = []
      } else if (item.level === 4 && (item.text === 'New Features' || item.text === 'New APIs' || item.text === 'New API')) {
        nextIsNew = true
        descLines = []
      } else if (item.level === 4) {
        if (nextIsNew && currentFramework && descLines.length > 0) {
          results.push({ framework: currentFramework, description: descLines.join(' ').slice(0, 200) })
        }
        nextIsNew = false
        descLines = []
      }
    } else if (item.type === 'paragraph' && nextIsNew) {
      const text = (item.inlineContent ?? []).map(ic => ic.text ?? '').join('').trim()
      if (text) descLines.push(text)
    }
  }

  // catch last one
  if (nextIsNew && currentFramework && descLines.length > 0) {
    results.push({ framework: currentFramework, description: descLines.join(' ').slice(0, 200) })
  }

  return results
}

function normalize(text: string): Set<string> {
  const STOP = new Set(['the', 'and', 'for', 'with', 'api', 'ios', 'apple', 'new', 'via', 'using'])
  return new Set(text.toLowerCase().split(/\W+/).filter(w => w.length >= 3 && !STOP.has(w)))
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [suggestions, existing] = await Promise.all([
    fetchSuggestionsFromApple(),
    db.select({ name: capabilities.name, slug: capabilities.slug }).from(capabilities),
  ])

  const filtered = suggestions.filter(s => {
    const sWords = normalize(s.framework)
    return !existing.some(cap => {
      const cWords = normalize(cap.name)
      const overlap = [...sWords].filter(w => cWords.has(w)).length
      return sWords.size > 0 && overlap / sWords.size >= 0.6
    })
  })

  return NextResponse.json({ suggestions: filtered })
}
