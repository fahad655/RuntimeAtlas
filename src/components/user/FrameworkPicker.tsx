'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function FrameworkPicker() {
  const { isSignedIn } = useUser()
  const [frameworks, setFrameworks] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/frameworks').then(r => r.json()).then(d => setFrameworks(d.groups ?? []))
  }, [])

  useEffect(() => {
    if (!isSignedIn) return
    fetch('/api/user/profile').then(r => r.json()).then(d => setSelected(d.subscribedFrameworks ?? []))
  }, [isSignedIn])

  async function toggle(fw: string) {
    const next = selected.includes(fw) ? selected.filter(f => f !== fw) : [...selected, fw]
    setSelected(next)
    setSaving(true)
    await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscribedFrameworks: next }),
    })
    setSaving(false)
  }

  if (!isSignedIn || frameworks.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {saving ? 'Saving…' : 'Track specific frameworks'}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {frameworks.map(fw => (
          <button key={fw} onClick={() => toggle(fw)}>
            <Badge
              variant="outline"
              className={cn(
                'cursor-pointer text-xs transition-colors',
                selected.includes(fw)
                  ? 'border-violet-500/50 bg-violet-500/10 text-violet-400'
                  : 'hover:border-border/80',
              )}
            >
              {fw}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  )
}
