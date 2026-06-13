'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { CircularRing } from './CircularRing'

interface StreakData {
  currentStreak: number
  longestStreak: number
}

export function StreakWidget() {
  const { isSignedIn, isLoaded } = useUser()
  const [data, setData] = useState<StreakData | null>(null)

  useEffect(() => {
    if (!isSignedIn) return
    fetch('/api/user/profile').then(r => r.json()).then(setData)
  }, [isSignedIn])

  if (!isLoaded || !isSignedIn || !data) return null

  const active = data.currentStreak > 0
  const max = Math.max(data.longestStreak, 7) // ring fills against either longest streak or 7 days

  return (
    <CircularRing
      value={data.currentStreak}
      max={max}
      size={32}
      strokeWidth={3}
      trackClass={active ? 'text-orange-900/50' : 'text-muted/30'}
      progressClass={active ? 'text-orange-400' : 'text-muted-foreground'}
    >
      <span className={`text-[10px] font-bold leading-none ${active ? 'text-orange-400' : 'text-muted-foreground'}`}>
        {data.currentStreak}
      </span>
    </CircularRing>
  )
}
