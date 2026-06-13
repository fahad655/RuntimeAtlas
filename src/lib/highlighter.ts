import { createHighlighter, type Highlighter } from 'shiki'

let instance: Highlighter | null = null
let pending: Promise<Highlighter> | null = null

export async function getHighlighter(): Promise<Highlighter> {
  if (instance) return instance
  if (!pending) {
    pending = createHighlighter({ themes: ['one-dark-pro'], langs: ['swift'] })
      .then(h => { instance = h; return h })
  }
  return pending
}

export async function highlightSwift(code: string): Promise<string> {
  const h = await getHighlighter()
  return h.codeToHtml(code, { lang: 'swift', theme: 'one-dark-pro' })
}
