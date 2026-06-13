'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Zap } from 'lucide-react'

interface Props {
  secret: string
  onSuccess: () => void
}

export function IngestTrigger({ secret, onSuccess }: Props) {
  const [topic, setTopic] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ error?: string; capabilityId?: number; existingSlug?: string; existingName?: string } | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!topic.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ topic: topic.trim(), url: url.trim() || undefined }),
      })
      const data = await res.json() as { error?: string; capabilityId?: number; existingSlug?: string; existingName?: string }
      setResult(data)
      if (!data.error) {
        setTopic('')
        setUrl('')
        onSuccess()
      }
    } catch {
      setResult({ error: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Topic name <span className="text-muted-foreground/50">(required)</span>
        </label>
        <Input
          placeholder="e.g. Foundation Models framework"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          disabled={loading}
          className="h-9"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Specific URL <span className="text-muted-foreground/50">(optional — Apple doc or WWDC session)</span>
        </label>
        <Input
          placeholder="https://developer.apple.com/..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          disabled={loading}
          className="h-9"
          type="url"
        />
      </div>
      <Button type="submit" disabled={loading || !topic.trim()} className="w-full bg-violet-600 hover:bg-violet-500 text-white">
        {loading
          ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Ingesting...</>
          : <><Zap className="h-4 w-4 mr-2" /> Run ingestion</>}
      </Button>
      {result?.error && (
        <div className="text-sm text-destructive space-y-1">
          <p>{result.error}</p>
          {result.existingSlug && (
            <a
              href={`/features/${result.existingSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-400 underline underline-offset-2"
            >
              View: {result.existingName}
            </a>
          )}
        </div>
      )}
      {result?.capabilityId && !result.error && (
        <p className="text-sm text-emerald-400">
          Done — capability #{result.capabilityId} is in the review queue.
        </p>
      )}
    </form>
  )
}
