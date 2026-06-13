'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Flame } from 'lucide-react'

export function StreakWidget() {
  const { isSignedIn, isLoaded } = useUser()
  const [streak, setStreak] = useState<number | null>(null)

  useEffect(() => {
    if (!isSignedIn) return
    fetch('/api/user/profile').then(r => r.json()).then(d => setStreak(d.currentStreak ?? 0))
  }, [isSignedIn])

  if (!isLoaded || !isSignedIn || streak === null) return null

  const active = streak > 0

  return (
    <div className="flex items-center gap-1 text-sm" title={`${streak}-day streak`}>
      <Flame className={active ? 'h-4 w-4 text-orange-400' : 'h-4 w-4 text-muted-foreground'} />
      <span className={active ? 'font-semibold text-orange-400' : 'text-muted-foreground'}>
        {streak}
      </span>
    </div>
  )
}
