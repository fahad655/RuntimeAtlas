import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { FlaskConical, Clock, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InferSelectModel } from 'drizzle-orm'
import type { capabilities } from '@/db/schema'

type Capability = InferSelectModel<typeof capabilities>

const CATEGORY_COLORS: Record<string, string> = {
  AI:          'bg-purple-500/10 text-purple-400 border-purple-500/20',
  UI:          'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Performance: 'bg-green-500/10 text-green-400 border-green-500/20',
  Safety:      'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Store:       'bg-teal-500/10 text-teal-400 border-teal-500/20',
  System:      'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
}

const CHANGE_COLORS: Record<string, string> = {
  new:        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  updated:    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  deprecated: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export function CapabilityCard({ capability }: { capability: Capability }) {
  return (
    <Link href={`/features/${capability.slug}`} className="block h-full group">
      <div className={cn(
        'relative h-full p-5 rounded-2xl flex flex-col overflow-hidden',
        'border border-black/[0.07] bg-black/[0.02] dark:border-white/[0.07] dark:bg-white/[0.025]',
        'transition-all duration-300 ease-out',
        'hover:border-violet-400/50 hover:bg-violet-50/60 dark:hover:border-violet-500/40 dark:hover:bg-white/[0.07]',
        'hover:shadow-[0_20px_60px_-10px_rgba(124,58,237,0.2)] dark:hover:shadow-[0_20px_60px_-10px_rgba(124,58,237,0.35),0_0_0_1px_rgba(124,58,237,0.15)]',
        'hover:-translate-y-1.5',
        'active:scale-[0.97] active:brightness-95 active:shadow-none active:translate-y-0',
      )}>
        {/* Hover glow overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)' }}
          aria-hidden
        />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge
              variant="outline"
              className={cn('text-[11px] font-medium shrink-0 border', CATEGORY_COLORS[capability.category])}
            >
              {capability.category}
            </Badge>
            {capability.changeType === 'new' && (
              <Badge variant="outline" className={cn('text-[11px] font-medium shrink-0 border', CHANGE_COLORS['new'])}>
                New
              </Badge>
            )}
            {capability.changeType === 'deprecated' && (
              <Badge variant="outline" className={cn('text-[11px] font-medium shrink-0 border', CHANGE_COLORS['deprecated'])}>
                Deprecated
              </Badge>
            )}
            {capability.changeType === 'updated' && (
              <Badge variant="outline" className="text-[11px] font-medium shrink-0 border bg-amber-500/10 text-amber-400 border-amber-500/20">
                Updated
              </Badge>
            )}
          </div>

          {/* Impact dots */}
          <div className="flex items-center gap-[3px] pt-0.5 shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-[5px] w-[5px] rounded-full transition-colors',
                  i < capability.impactScore ? 'bg-violet-400' : 'bg-white/10',
                )}
              />
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-[13px] leading-snug text-foreground group-hover:text-violet-200 transition-colors duration-200 line-clamp-2">
            {capability.name}
          </h3>
          <ArrowUpRight className="h-3.5 w-3.5 text-violet-400 shrink-0 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
        </div>

        {/* Summary */}
        <p className="text-[12px] text-muted-foreground line-clamp-2 mb-4 flex-1 leading-relaxed">
          {capability.summary}
        </p>

        {/* Beta verified */}
        {capability.verifiedOnBeta && (
          <p className="text-[10px] text-muted-foreground/50 mb-3 font-mono">
            ✓ {capability.verifiedOnBeta}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex flex-wrap gap-1">
            {capability.frameworks.slice(0, 2).map(fw => (
              <span
                key={fw}
                className="text-[10px] bg-black/[0.04] dark:bg-white/[0.05] text-muted-foreground/80 rounded-md px-1.5 py-0.5 font-mono border border-black/[0.08] dark:border-white/[0.06]"
              >
                {fw}
              </span>
            ))}
            {capability.frameworks.length > 2 && (
              <span className="text-[10px] text-muted-foreground/50 self-center">
                +{capability.frameworks.length - 2}
              </span>
            )}
          </div>

          {capability.demoId ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium shrink-0">
              <FlaskConical className="h-3 w-3" /> Demo
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60 shrink-0">
              <Clock className="h-3 w-3" /> Brief
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
