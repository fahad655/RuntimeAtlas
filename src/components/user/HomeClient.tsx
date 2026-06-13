'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import { CircularRing } from './CircularRing'
import { cn } from '@/lib/utils'

export interface FrameworkStat {
  name: string
  total: number
  completed: number
  pct: number
  isSubscribed: boolean
}

export interface QueueCap {
  id: number
  slug: string
  name: string
  summary: string
  category: string
  frameworks: string[]
  impactScore: number
  changeType: string
}

const CHANGE_COLORS: Record<string, string> = {
  new:        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  updated:    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  deprecated: 'bg-red-500/10 text-red-400 border-red-500/20',
}

// Cycles through distinct accent colors for framework rings
const RING_COLORS = [
  'text-violet-400', 'text-blue-400', 'text-emerald-400',
  'text-amber-400', 'text-pink-400', 'text-teal-400',
  'text-orange-400', 'text-cyan-400',
]

interface Props {
  frameworks: FrameworkStat[]
  queue: QueueCap[]
  completed: { id: number; slug: string; name: string; changeType: string }[]
}

export function HomeClient({ frameworks, queue, completed }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  function toggleFw(name: string) {
    setSelected(s => s === name ? null : name)
  }

  const filteredQueue = selected
    ? queue.filter(c => c.frameworks.includes(selected))
    : queue

  const activeFramework = selected ? frameworks.find(f => f.name === selected) : null

  return (
    <div className="space-y-8">
      {/* Framework grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">By framework</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Click to filter your queue</p>
          </div>
          {selected && (
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Show all
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {frameworks.map((fw, i) => {
            const color = RING_COLORS[i % RING_COLORS.length]
            const isSelected = selected === fw.name
            const done = fw.pct === 100

            return (
              <button
                key={fw.name}
                onClick={() => toggleFw(fw.name)}
                className="text-left"
              >
                <Card className={cn(
                  'p-3.5 border-border/50 transition-all hover:shadow-sm',
                  isSelected && 'ring-1 ring-violet-500/50 border-violet-500/30 bg-violet-500/5',
                  done && !isSelected && 'border-emerald-500/20 bg-emerald-500/5',
                  !fw.isSubscribed && !isSelected && 'opacity-55',
                )}>
                  <div className="flex items-center gap-3">
                    <CircularRing
                      value={fw.completed}
                      max={fw.total}
                      size={44}
                      strokeWidth={4}
                      trackClass="text-muted/20"
                      progressClass={done ? 'text-emerald-400' : color}
                    >
                      <span className={cn('text-[10px] font-bold leading-none', done ? 'text-emerald-400' : color)}>
                        {fw.pct}%
                      </span>
                    </CircularRing>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate leading-tight">{fw.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {fw.completed}/{fw.total}
                        {done && <span className="ml-1 text-emerald-400">✓</span>}
                      </p>
                    </div>
                  </div>
                </Card>
              </button>
            )
          })}
        </div>
      </div>

      {/* Reading queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">
            {activeFramework ? (
              <span>{activeFramework.name} <span className="text-muted-foreground font-normal">queue</span></span>
            ) : 'Reading queue'}
          </h2>
          <span className="text-xs text-muted-foreground">{filteredQueue.length} remaining</span>
        </div>

        {filteredQueue.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm border border-border/50 rounded-xl">
            {selected
              ? `All ${selected} capabilities completed!`
              : 'All caught up — check back after the next beta drop.'}
          </div>
        ) : (
          <div className="grid gap-2">
            {filteredQueue.slice(0, 25).map((cap, i) => (
              <Link key={cap.id} href={`/features/${cap.slug}`}>
                <Card className="p-3.5 border-border/50 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground/40 font-mono w-5 shrink-0 text-right">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <Badge variant="outline" className={cn('text-xs py-0', CHANGE_COLORS[cap.changeType])}>
                          {cap.changeType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{cap.category}</span>
                        {cap.frameworks.slice(0, 2).map(fw => (
                          <span key={fw} className="text-xs font-mono text-muted-foreground/60">{fw}</span>
                        ))}
                      </div>
                      <p className="font-medium text-sm group-hover:text-foreground truncate">{cap.name}</p>
                    </div>
                    <div className="shrink-0">
                      <CircularRing value={cap.impactScore} max={5} size={28} strokeWidth={3} trackClass="text-muted/20" progressClass="text-violet-400">
                        <span className="text-[9px] font-bold text-violet-400">{cap.impactScore}</span>
                      </CircularRing>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-muted-foreground text-sm">Completed ({completed.length})</h2>
          <div className="flex flex-wrap gap-2">
            {completed.map(cap => (
              <Link key={cap.id} href={`/features/${cap.slug}`}>
                <Badge variant="outline" className="text-xs text-muted-foreground hover:text-foreground transition-colors gap-1.5 py-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                  {cap.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
