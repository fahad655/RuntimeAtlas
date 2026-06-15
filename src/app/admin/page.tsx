'use client'
import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { IngestTrigger } from '@/components/admin/IngestTrigger'
import { BatchIngest } from '@/components/admin/BatchIngest'
import { ReviewCard } from '@/components/admin/ReviewCard'
import { SuggestionsPanel } from '@/components/admin/SuggestionsPanel'
import { MissingDiffPanel } from '@/components/admin/MissingDiffPanel'
import { Lock } from 'lucide-react'
import type { InferSelectModel } from 'drizzle-orm'
import type { capabilities } from '@/db/schema'

type Capability = InferSelectModel<typeof capabilities>

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [pending, setPending] = useState<Capability[]>([])
  const [loading, setLoading] = useState(false)

  const fetchPending = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/capabilities?status=needs_review&sort=newest', {
      headers: { 'x-admin-secret': secret },
    })
    const data = await res.json() as { capabilities: Capability[] }
    setPending(data.capabilities ?? [])
    setLoading(false)
  }, [secret])

  useEffect(() => {
    if (authed) fetchPending()
  }, [authed, fetchPending])

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-32 flex flex-col items-center gap-6 text-center">
        <div className="h-12 w-12 rounded-full border border-border/50 flex items-center justify-center">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold mb-1">Admin access</h1>
          <p className="text-sm text-muted-foreground">Enter your admin secret to continue</p>
        </div>
        <form
          className="w-full flex gap-2"
          onSubmit={e => {
            e.preventDefault()
            localStorage.setItem('ra-admin', '1')
            localStorage.setItem('ra-admin-secret', secret)
            setAuthed(true)
          }}
        >
          <Input
            type="password"
            placeholder="Admin secret"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!secret} className="bg-violet-600 hover:bg-violet-500 text-white">
            Enter
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold">Admin</h1>
        <Button
          variant="ghost" size="sm"
          onClick={() => { localStorage.removeItem('ra-admin'); localStorage.removeItem('ra-admin-secret'); setAuthed(false) }}
          className="text-muted-foreground"
        >
          Lock
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: ingest + suggestions */}
        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              New ingestion
            </h2>
            <div className="rounded-xl border border-border/50 p-5">
              <IngestTrigger secret={secret} onSuccess={fetchPending} />
            </div>
          </div>

          <BatchIngest secret={secret} onSuccess={fetchPending} />

          <MissingDiffPanel secret={secret} />

          <div className="rounded-xl border border-border/50 p-5">
            <SuggestionsPanel secret={secret} onIngestStarted={fetchPending} />
          </div>
        </div>

        {/* Review queue */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Review queue
            </h2>
            <span className="text-xs text-muted-foreground">{pending.length} pending</span>
          </div>

          {loading ? (
            <div className="text-center py-16 text-muted-foreground text-sm">Loading…</div>
          ) : pending.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm rounded-xl border border-border/30 border-dashed">
              Queue is empty. Run an ingestion or use suggestions above.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pending.map(cap => (
                <ReviewCard key={cap.id} capability={cap} secret={secret} onUpdate={fetchPending} showRefresh />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
