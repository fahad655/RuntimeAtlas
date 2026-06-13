'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Flame } from 'lucide-react'

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

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Flame className={data.currentStreak > 0 ? 'h-4 w-4 text-orange-400' : 'h-4 w-4 text-muted-foreground'} />
      <span className={data.currentStreak > 0 ? 'font-semibold text-orange-400' : 'text-muted-foreground'}>
        {data.currentStreak}
      </span>
      <span className="text-muted-foreground text-xs">day streak</span>
    </div>
  )
}
