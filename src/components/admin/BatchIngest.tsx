'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Zap, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  secret: string
  onSuccess: () => void
}

type JobStatus = 'pending' | 'running' | 'done' | 'error' | 'duplicate' | 'rejected'

interface Job {
  topic: string
  url?: string
  status: JobStatus
  capabilityId?: number
  rejectionReason?: string
}

export function BatchIngest({ secret, onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [raw, setRaw] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [running, setRunning] = useState(false)

  function parseJobs(): Job[] {
    return raw
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(line => {
        const [topic, url] = line.split('|').map(s => s.trim())
        return { topic, url: url || undefined, status: 'pending' as JobStatus }
      })
  }

  async function run() {
    const parsed = parseJobs()
    if (!parsed.length) return
    setJobs(parsed)
    setRunning(true)

    for (let i = 0; i < parsed.length; i++) {
      setJobs(prev => prev.map((j, idx) => idx === i ? { ...j, status: 'running' } : j))
      try {
        const res = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
          body: JSON.stringify({ topic: parsed[i].topic, url: parsed[i].url }),
        })
        const data = await res.json() as { error?: string; reason?: string; capabilityId?: number; existingSlug?: string }
        if (res.status === 422) {
          setJobs(prev => prev.map((j, idx) => idx === i ? { ...j, status: 'rejected', rejectionReason: data.reason } : j))
        } else if (data.existingSlug) {
          setJobs(prev => prev.map((j, idx) => idx === i ? { ...j, status: 'duplicate' } : j))
        } else if (data.error) {
          setJobs(prev => prev.map((j, idx) => idx === i ? { ...j, status: 'error' } : j))
        } else {
          setJobs(prev => prev.map((j, idx) => idx === i ? { ...j, status: 'done', capabilityId: data.capabilityId } : j))
          onSuccess()
        }
      } catch {
        setJobs(prev => prev.map((j, idx) => idx === i ? { ...j, status: 'error' } : j))
      }
    }

    setRunning(false)
  }

  const done = jobs.filter(j => j.status === 'done').length
  const errors = jobs.filter(j => j.status === 'error').length
  const dupes = jobs.filter(j => j.status === 'duplicate').length
  const rejected = jobs.filter(j => j.status === 'rejected').length

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-left hover:bg-muted/20 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-400" />
          Batch ingest
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-border/40">
          <p className="text-xs text-muted-foreground pt-3">
            One topic per line. Optionally append a URL with a pipe: <code className="bg-muted/30 px-1 rounded">Foundation Models | https://developer.apple.com/…</code>
          </p>

          <Textarea
            placeholder={"Foundation Models\nApp Intents\nLiquid Glass\nVisual Intelligence | https://developer.apple.com/videos/play/wwdc2026/..."}
            value={raw}
            onChange={e => setRaw(e.target.value)}
            disabled={running}
            className="font-mono text-xs min-h-[140px] resize-y bg-muted/10"
          />

          <Button
            onClick={run}
            disabled={running || !raw.trim()}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold"
          >
            {running
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Ingesting {jobs.filter(j => j.status === 'running').map(j => j.topic)[0] ?? '…'}</>
              : <><Zap className="h-4 w-4 mr-2" /> Run {parseJobs().length || 0} ingestions</>}
          </Button>

          {/* Progress list */}
          {jobs.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {done > 0 || errors > 0 || dupes > 0 || rejected > 0 ? (
                <p className="text-xs text-muted-foreground pb-1">
                  {done} queued · {dupes} already exist · {rejected} not iOS 27 · {errors} failed
                </p>
              ) : null}
              {jobs.map((job, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 text-xs">
                    {job.status === 'pending'   && <div className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" />}
                    {job.status === 'running'   && <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400 shrink-0" />}
                    {job.status === 'done'      && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    {job.status === 'duplicate' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    {job.status === 'rejected'  && <XCircle className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
                    {job.status === 'error'     && <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                    <span className={
                      job.status === 'done'      ? 'text-emerald-400' :
                      job.status === 'duplicate' ? 'text-amber-400' :
                      job.status === 'rejected'  ? 'text-orange-400' :
                      job.status === 'error'     ? 'text-red-400' :
                      job.status === 'running'   ? 'text-foreground' :
                      'text-muted-foreground'
                    }>
                      {job.topic}
                      {job.status === 'duplicate' && ' (already exists)'}
                      {job.status === 'done' && job.capabilityId && ` → #${job.capabilityId}`}
                    </span>
                  </div>
                  {job.status === 'rejected' && job.rejectionReason && (
                    <p className="text-[11px] text-orange-400/70 pl-5">{job.rejectionReason}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
