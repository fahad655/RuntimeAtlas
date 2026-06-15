import * as cheerio from 'cheerio'

export interface ScrapedDoc {
  title: string
  url: string
  bodyText: string
  sections: { heading: string; content: string }[]
}

export interface WWDCSession {
  title: string
  url: string
  sessionId: string
  description: string
  transcript: string
}

export interface ScrapedContent {
  docsContent: ScrapedDoc[]
  wwdcSession: WWDCSession | null
}

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: FETCH_HEADERS })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  return res.text()
}

async function searchAppleDocs(query: string, type = 'Documentation'): Promise<{ title: string; url: string; description: string }[]> {
  const url = `https://developer.apple.com/search/search_data.php?q=${encodeURIComponent(query)}&locale=en_US&hits_per_page=8&type=${type}`
  try {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!res.ok) return []
    const data = await res.json() as { results?: { title?: string; url?: string; description?: string }[] }
    return (data.results ?? []).slice(0, 3).map(r => ({
      title: r.title ?? '',
      url: (r.url ?? '').startsWith('http') ? (r.url ?? '') : `https://developer.apple.com${r.url ?? ''}`,
      description: r.description ?? '',
    }))
  } catch {
    return []
  }
}

async function scrapeDocPage(url: string): Promise<ScrapedDoc> {
  const html = await fetchHtml(url)
  const $ = cheerio.load(html)

  const title = $('h1').first().text().trim() || $('title').text().trim()
  const sections: ScrapedDoc['sections'] = []

  $('h2, h3').each((_, el) => {
    const heading = $(el).text().trim()
    const content = $(el).nextUntil('h2, h3').text().trim().slice(0, 1200)
    if (heading && content.length > 20) sections.push({ heading, content })
  })

  const bodyText = $('main, article, .content, #content, [role="main"]')
    .first()
    .text()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8000) || $('body').text().replace(/\s+/g, ' ').trim().slice(0, 8000)

  return { title, url, bodyText, sections }
}

async function findWWDCSession(query: string): Promise<Omit<WWDCSession, 'transcript'> | null> {
  const results = await searchAppleDocs(query, 'Videos')
  const sessions = results.filter(r =>
    r.url.includes('/videos/play/') &&
    (r.url.includes('wwdc2026') || r.url.includes('wwdc2025'))
  )
  if (!sessions.length) return null

  const s = sessions[0]
  const sessionId = s.url.split('/').pop() ?? ''
  return { title: s.title, url: s.url, sessionId, description: s.description }
}

async function fetchWWDCTranscript(sessionUrl: string): Promise<string> {
  try {
    const html = await fetchHtml(sessionUrl)
    const $ = cheerio.load(html)

    // Strategy 1: dedicated transcript container
    const direct = $('.transcript, [data-transcript], .video-transcript, #transcript').text().replace(/\s+/g, ' ').trim()
    if (direct.length > 300) return direct.slice(0, 14000)

    // Strategy 2: time-coded paragraphs
    const paras: string[] = []
    $('[data-start], .transcript-text p, .subtitles p, [class*="transcript"] p').each((_, el) => {
      paras.push($(el).text().trim())
    })
    if (paras.length > 10) return paras.join(' ').slice(0, 14000)

    // Strategy 3: embedded JSON transcript in <script>
    let jsonText = ''
    $('script[type="application/json"], script').each((_, el) => {
      const src = $(el).html() ?? ''
      if (src.includes('"transcript"') || src.includes('"subtitles"')) {
        const match = src.match(/"(?:transcript|subtitles)":\s*(\[[\s\S]*?\])/)?.[1]
        if (match) {
          try {
            const parsed = JSON.parse(match) as { text?: string }[]
            jsonText = parsed.map(t => t.text ?? '').join(' ').slice(0, 14000)
          } catch { /* skip */ }
        }
      }
    })
    if (jsonText.length > 300) return jsonText

    // Fallback: body text
    return $('body').text().replace(/\s+/g, ' ').trim().slice(0, 8000)
  } catch {
    return ''
  }
}

export async function scrapeForTopic(topicInput: string, providedUrl?: string): Promise<ScrapedContent> {
  const docsContent: ScrapedDoc[] = []

  let explicitWWDCUrl: string | null = null

  // If user gave a specific URL, determine what it is
  if (providedUrl) {
    const isWWDC = providedUrl.includes('/videos/play/')
    if (isWWDC) {
      explicitWWDCUrl = providedUrl
    } else {
      // It's a doc page
      try {
        docsContent.push(await scrapeDocPage(providedUrl))
      } catch { /* continue to search fallback */ }
    }
  }

  // Always search Apple docs for supplementary context
  const searchResults = await searchAppleDocs(topicInput)
  for (const result of searchResults.slice(0, 2)) {
    if (docsContent.some(d => d.url === result.url)) continue
    try {
      docsContent.push(await scrapeDocPage(result.url))
    } catch { /* skip failed pages */ }
  }

  // WWDC session: use the explicit URL if provided, otherwise search
  let wwdcSession: WWDCSession | null = null
  if (explicitWWDCUrl) {
    const transcript = await fetchWWDCTranscript(explicitWWDCUrl)
    const html = await fetchHtml(explicitWWDCUrl)
    const $ = cheerio.load(html)
    const title = $('h1').first().text().trim() || topicInput
    const description = $('meta[name="description"]').attr('content') ?? ''
    const sessionId = explicitWWDCUrl.split('/').filter(Boolean).pop() ?? ''
    wwdcSession = { title, url: explicitWWDCUrl, sessionId, description, transcript }
  } else {
    const sessionMeta = await findWWDCSession(topicInput)
    if (sessionMeta) {
      const transcript = await fetchWWDCTranscript(sessionMeta.url)
      wwdcSession = { ...sessionMeta, transcript }
    }
  }

  return { docsContent, wwdcSession }
}
