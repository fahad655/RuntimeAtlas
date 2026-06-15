'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, ExternalLink, ChevronDown, ChevronUp, GitCompare } from 'lucide-react'

interface Cap { id: number; name: string; slug: string }

interface Props {
  secret: string
}

export function MissingDiffPanel({ secret }: Props) {
  const [open, setOpen] = useState(false)
  const [caps, setCaps] = useState<Cap[]>([])
  const [loading, setLoading] = useState(false)
  const [rerunning, setRerunning] = useState<number | null>(null)
  const [done, setDone] = useState<Set<number>>(new Set())

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/capabilities/missing-diff', {
      headers: { 'x-admin-secret': secret },
    })
    const data = await res.json() as { capabilities: Cap[] }
    setCaps(data.capabilities ?? [])
    setLoading(false)
  }

  useEffect(() => { if (open) load() }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  async function rerun(id: number) {
    setRerunning(id)
    await fetch(`/api/admin/capabilities/${id}/refresh`, {
      method: 'POST',
      headers: { 'x-admin-secret': secret },
    })
    setRerunning(null)
    setDone(prev => new Set([...prev, id]))
  }

  const remaining = caps.filter(c => !done.has(c.id))

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-left hover:bg-muted/20 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className="flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-amber-400" />
          Missing before/after diff
          {open && remaining.length > 0 && (
            <span className="text-xs font-normal text-amber-400 tabular-nums">({remaining.length})</span>
          )}
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-border/40">
          <p className="text-xs text-muted-foreground pt-3 pb-3">
            Published "Updated in iOS 27" capabilities missing the before/after code diff. Re-run LLM to generate it.
          </p>

          {loading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
            </div>
          ) : remaining.length === 0 ? (
            <p className="text-xs text-emerald-400 py-2">All caught up — no missing diffs.</p>
          ) : (
            <div className="space-y-2">
              {remaining.map(cap => (
                <div key={cap.id} className="flex items-center justify-between gap-3 py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <a
                      href={`/features/${cap.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate"
                    >
                      {cap.name}
                    </a>
                    <ExternalLink className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs shrink-0 gap-1.5"
                    onClick={() => rerun(cap.id)}
                    disabled={rerunning === cap.id}
                  >
                    <RefreshCw className={`h-3 w-3 ${rerunning === cap.id ? 'animate-spin' : ''}`} />
                    {rerunning === cap.id ? 'Re-running…' : 'Re-run'}
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                className="w-full h-7 text-xs mt-2 gap-1.5"
                onClick={() => remaining.forEach(c => rerun(c.id))}
                disabled={rerunning !== null}
              >
                <RefreshCw className="h-3 w-3" />
                Re-run all ({remaining.length})
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
