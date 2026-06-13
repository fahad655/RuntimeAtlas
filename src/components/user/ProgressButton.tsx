'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  capabilityId: number
}

export function ProgressButton({ capabilityId }: Props) {
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
          'gap-2 transition-all',
          hovered
            ? 'border-red-500/40 text-red-400 bg-red-500/5'
            : 'border-emerald-500/40 text-emerald-400',
        )}
      >
        {hovered
          ? <><X className="h-4 w-4" /> Unmark</>
          : <><CheckCircle className="h-4 w-4" /> Completed</>}
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className="gap-2 transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
    >
      <Circle className="h-4 w-4" />
      Mark as read
    </Button>
  )
}
