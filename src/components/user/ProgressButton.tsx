'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

interface Props {
  capabilityId: number
}

function ProgressButtonInner({ capabilityId }: Props) {
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

  if (!isLoaded || !isSignedIn || !fetched) return null

  async function toggle() {
    setLoading(true)
    await fetch('/api/user/progress', {
      method: done ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ capabilityId }),
    })
    setDone(d => !d)
    setHovered(false)
    setLoading(false)
  }

  if (done) {
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

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className="gap-2 text-sm rounded-full border border-white/[0.1] text-muted-foreground hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/[0.06] transition-all duration-150 active:scale-[0.97]"
    >
      <Circle className="h-3.5 w-3.5" />
      Mark as read
    </Button>
  )
}

export function ProgressButton({ capabilityId }: Props) {
  if (!hasClerk) return null
  return <ProgressButtonInner capabilityId={capabilityId} />
}
