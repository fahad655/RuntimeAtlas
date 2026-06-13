'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Zap, RefreshCw } from 'lucide-react'

interface Suggestion {
  framework: string
  description: string
}

interface Props {
  secret: string
  onIngestStarted: () => void
}

export function SuggestionsPanel({ secret, onIngestStarted }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [ingesting, setIngesting] = useState<string | null>(null)
  const [done, setDone] = useState<Set<string>>(new Set())

  async function fetchSuggestions() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/suggestions', {
        headers: { 'x-admin-secret': secret },
      })
      const data = await res.json() as { suggestions: Suggestion[] }
      setSuggestions(data.suggestions ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSuggestions() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function ingest(framework: string) {
    setIngesting(framework)
    try {
      await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ topic: framework }),
      })
      setDone(prev => new Set([...prev, framework]))
      onIngestStarted()
    } finally {
      setIngesting(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          iOS 27 suggestions
        </h2>
        <button onClick={fetchSuggestions} className="text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {loading ? (
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
                {s.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.description}</p>
                )}
              </div>
              <Button
                size="sm"
                variant={done.has(s.framework) ? 'outline' : 'default'}
                disabled={ingesting === s.framework || done.has(s.framework)}
                onClick={() => ingest(s.framework)}
                className="shrink-0 h-7 text-xs"
              >
                {ingesting === s.framework
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : done.has(s.framework)
                  ? '✓ Queued'
                  : <><Zap className="h-3 w-3 mr-1" />Ingest</>}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
