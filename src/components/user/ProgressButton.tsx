'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
const PROGRESS_EVENT = 'ra:progress'

interface Props {
  capabilityId: number
  placement?: 'top' | 'bottom'
}

function ProgressButtonInner({ capabilityId, placement = 'top' }: Props) {
  const { isSignedIn, isLoaded } = useUser()
  const [done, setDone] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    if (!isSignedIn) return
    fetch('/api/user/progress')
      .then(r => r.json())
      .then(d => {
        setDone((d.completedIds ?? []).includes(capabilityId))
        setFetched(true)
      })
  }, [isSignedIn, capabilityId])

  // Sync state between top and bottom instances on the same page
  useEffect(() => {
    function handler(e: Event) {
      const ev = e as CustomEvent<{ id: number; done: boolean }>
      if (ev.detail.id === capabilityId) setDone(ev.detail.done)
    }
    window.addEventListener(PROGRESS_EVENT, handler)
    return () => window.removeEventListener(PROGRESS_EVENT, handler)
  }, [capabilityId])

  if (!isLoaded || !isSignedIn || !fetched) return null

  async function toggle() {
    setLoading(true)
    const marking = !done
    await fetch('/api/user/progress', {
      method: marking ? 'POST' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ capabilityId }),
    })
    if (marking) trackEvent('progress_mark', { capability_id: capabilityId })
    const next = !done
    setDone(next)
    setHovered(false)
    setLoading(false)
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: { id: capabilityId, done: next } }))
  }

  // Top: compact indicator, only shows when completed
  if (placement === 'top') {
    if (!done) return null
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={toggle}
        disabled={loading}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'gap-2 text-sm rounded-full border transition-all duration-150 active:scale-[0.97]',
          hovered
            ? 'border-red-500/30 text-red-400 bg-red-500/[0.06]'
            : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/[0.06]',
        )}
      >
        {hovered
          ? <><X className="h-3.5 w-3.5" /> Unmark</>
          : <><CheckCircle className="h-3.5 w-3.5" /> Completed</>}
      </Button>
    )
  }

  // Bottom: prominent CTA
  if (done) {
    return (
      <div className="flex items-center justify-between w-full px-1">
        <div className="flex items-center gap-2 text-sm text-emerald-400">
          <CheckCircle className="h-4 w-4" />
          Marked as completed
        </div>
        <button
          onClick={toggle}
          disabled={loading}
          className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
        >
          Unmark
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400 text-sm font-medium hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all active:scale-[0.99]"
    >
      <Circle className="h-4 w-4" />
      Mark as completed
    </button>
  )
}

export function ProgressButton({ capabilityId, placement = 'top' }: Props) {
  if (!hasClerk) return null
  return <ProgressButtonInner capabilityId={capabilityId} placement={placement} />
}
