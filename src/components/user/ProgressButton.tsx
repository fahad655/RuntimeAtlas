'use client'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  capabilityId: number
  initialDone?: boolean
}

export function ProgressButton({ capabilityId, initialDone = false }: Props) {
  const { isSignedIn, isLoaded } = useUser()
  const [done, setDone] = useState(initialDone)
  const [loading, setLoading] = useState(false)

  if (!isLoaded || !isSignedIn) return null

  async function toggle() {
    setLoading(true)
    const method = done ? 'DELETE' : 'POST'
    await fetch('/api/user/progress', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ capabilityId }),
    })
    setDone(d => !d)
    setLoading(false)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={cn(
        'gap-2 transition-colors',
        done && 'border-emerald-500/50 text-emerald-400 hover:border-red-500/50 hover:text-red-400',
      )}
    >
      {done
        ? <CheckCircle className="h-4 w-4" />
        : <Circle className="h-4 w-4" />}
      {done ? 'Marked as read' : 'Mark as read'}
    </Button>
  )
}
