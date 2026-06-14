'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Zap, RefreshCw, Users } from 'lucide-react'

interface Suggestion {
  framework: string
  description: string
}

interface UserRequest {
  id: number
  topicInput: string
  sourceUrl: string | null
  voteCount: number
  createdAt: string
}

interface Props {
  secret: string
  onIngestStarted: () => void
}

export function SuggestionsPanel({ secret, onIngestStarted }: Props) {
  const [tab, setTab] = useState<'apple' | 'users'>('apple')

  // Apple suggestions
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loadingSugg, setLoadingSugg] = useState(true)
  const [ingestingApple, setIngestingApple] = useState<string | null>(null)
  const [doneApple, setDoneApple] = useState<Set<string>>(new Set())

  // User requests
  const [requests, setRequests] = useState<UserRequest[]>([])
  const [loadingReqs, setLoadingReqs] = useState(false)
  const [ingestingReq, setIngestingReq] = useState<number | null>(null)
  const [doneReqs, setDoneReqs] = useState<Set<number>>(new Set())

  async function fetchSuggestions() {
    setLoadingSugg(true)
    try {
      const res = await fetch('/api/admin/suggestions', { headers: { 'x-admin-secret': secret } })
      const data = await res.json() as { suggestions: Suggestion[] }
      setSuggestions(data.suggestions ?? [])
    } finally {
      setLoadingSugg(false)
    }
  }

  async function fetchRequests() {
    setLoadingReqs(true)
    try {
      const res = await fetch('/api/admin/requests', { headers: { 'x-admin-secret': secret } })
      const data = await res.json() as { requests: UserRequest[] }
      setRequests(data.requests ?? [])
    } finally {
      setLoadingReqs(false)
    }
  }

  useEffect(() => { fetchSuggestions() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (tab === 'users' && requests.length === 0) fetchRequests()
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  async function ingestApple(framework: string) {
    setIngestingApple(framework)
    try {
      await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ topic: framework }),
      })
      setDoneApple(prev => new Set([...prev, framework]))
      onIngestStarted()
    } finally {
      setIngestingApple(null)
    }
  }

  async function ingestRequest(req: UserRequest) {
    setIngestingReq(req.id)
    try {
      await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ topic: req.topicInput, url: req.sourceUrl ?? undefined }),
      })
      // Mark as ingested
      await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ id: req.id, status: 'ingested' }),
      })
      setDoneReqs(prev => new Set([...prev, req.id]))
      onIngestStarted()
    } finally {
      setIngestingReq(null)
    }
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-4 border-b border-border/40 pb-2">
        <button
          onClick={() => setTab('apple')}
          className={`text-xs font-semibold uppercase tracking-widest px-2 py-1 rounded transition-colors ${tab === 'apple' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          iOS 27 suggestions
        </button>
        <button
          onClick={() => setTab('users')}
          className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-widest px-2 py-1 rounded transition-colors ${tab === 'users' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Users className="h-3 w-3" /> User requests
        </button>
        <button
          onClick={() => tab === 'apple' ? fetchSuggestions() : fetchRequests()}
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Apple suggestions tab */}
      {tab === 'apple' && (
        loadingSugg ? (
          <div className="flex items-center gap-2 text-muted-foreground text-xs py-4">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Scanning Apple release notes…
          </div>
        ) : suggestions.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4">All detected frameworks already ingested.</p>
        ) : (
          <div className="space-y-2">
            {suggestions.map(s => (
              <div key={s.framework} className="flex items-start justify-between gap-3 rounded-lg border border-border/40 p-3 bg-muted/10">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{s.framework}</p>
                  {s.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.description}</p>}
                </div>
                <Button
                  size="sm"
                  variant={doneApple.has(s.framework) ? 'outline' : 'default'}
                  disabled={ingestingApple === s.framework || doneApple.has(s.framework)}
                  onClick={() => ingestApple(s.framework)}
                  className="shrink-0 h-7 text-xs"
                >
                  {ingestingApple === s.framework
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : doneApple.has(s.framework)
                    ? '✓ Queued'
                    : <><Zap className="h-3 w-3 mr-1" />Ingest</>}
                </Button>
              </div>
            ))}
          </div>
        )
      )}

      {/* User requests tab */}
      {tab === 'users' && (
        loadingReqs ? (
          <div className="flex items-center gap-2 text-muted-foreground text-xs py-4">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
          </div>
        ) : requests.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4">No user requests yet.</p>
        ) : (
          <div className="space-y-2">
            {requests.map(r => (
              <div key={r.id} className="flex items-start justify-between gap-3 rounded-lg border border-border/40 p-3 bg-muted/10">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium truncate">{r.topicInput}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">↑{r.voteCount}</span>
                  </div>
                  {r.sourceUrl && (
                    <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:underline truncate block max-w-full">
                      {r.sourceUrl}
                    </a>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={doneReqs.has(r.id) ? 'outline' : 'default'}
                  disabled={ingestingReq === r.id || doneReqs.has(r.id)}
                  onClick={() => ingestRequest(r)}
                  className="shrink-0 h-7 text-xs"
                >
                  {ingestingReq === r.id
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : doneReqs.has(r.id)
                    ? '✓ Queued'
                    : <><Zap className="h-3 w-3 mr-1" />Ingest</>}
                </Button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
