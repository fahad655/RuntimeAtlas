'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
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
    <div className="space-y-10">
      {/* Framework grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold tracking-tight">By framework</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Tap to filter your queue</p>
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
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
                <div className={cn(
                  'p-3.5 rounded-2xl border transition-all duration-150',
                  isSelected
                    ? 'border-violet-500/40 bg-violet-500/[0.08] ring-1 ring-violet-500/20'
                    : done
                      ? 'border-emerald-500/20 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.07]'
                      : 'border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12]',
                  !fw.isSubscribed && !isSelected && 'opacity-50',
                )}>
                  <div className="flex items-center gap-3">
                    <CircularRing
                      value={fw.completed}
                      max={fw.total}
                      size={42}
                      strokeWidth={4}
                      trackClass="text-white/[0.08]"
                      progressClass={done ? 'text-emerald-400' : color}
                    >
                      <span className={cn('text-[9px] font-bold leading-none', done ? 'text-emerald-400' : color)}>
                        {fw.pct}%
                      </span>
                    </CircularRing>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate leading-tight">{fw.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                        {fw.completed}/{fw.total}
                        {done && <span className="ml-1 text-emerald-400">✓</span>}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Reading queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold tracking-tight">
            {activeFramework ? (
              <span>
                {activeFramework.name}{' '}
                <span className="text-muted-foreground font-normal">queue</span>
              </span>
            ) : 'Reading queue'}
          </h2>
          <span className="text-xs text-muted-foreground tabular-nums">{filteredQueue.length} remaining</span>
        </div>

        {filteredQueue.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            {selected
              ? `All ${selected} capabilities completed ✓`
              : 'All caught up — check back after the next beta drop.'}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredQueue.slice(0, 25).map((cap, i) => (
              <Link key={cap.id} href={`/features/${cap.slug}`}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-violet-500/20 hover:bg-white/[0.05] transition-all duration-150 group">
                  <span className="text-xs text-muted-foreground/30 font-mono w-5 shrink-0 text-right tabular-nums">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <Badge variant="outline" className={cn('text-[10px] py-0 px-1.5 h-4 border', CHANGE_COLORS[cap.changeType])}>
                        {cap.changeType}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground/60">{cap.category}</span>
                      {cap.frameworks.slice(0, 2).map(fw => (
                        <span key={fw} className="text-[10px] font-mono text-muted-foreground/40">{fw}</span>
                      ))}
                    </div>
                    <p className="font-medium text-sm group-hover:text-violet-300 transition-colors duration-150 truncate">
                      {cap.name}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <CircularRing
                      value={cap.impactScore}
                      max={5}
                      size={26}
                      strokeWidth={3}
                      trackClass="text-white/[0.08]"
                      progressClass="text-violet-400"
                    >
                      <span className="text-[8px] font-bold text-violet-400">{cap.impactScore}</span>
                    </CircularRing>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-muted-foreground text-sm tracking-tight">
            Completed ({completed.length})
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {completed.map(cap => (
              <Link key={cap.id} href={`/features/${cap.slug}`}>
                <Badge
                  variant="outline"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors gap-1.5 py-1 border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]"
                >
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
