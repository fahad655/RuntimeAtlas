import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { FlaskConical, Clock } from 'lucide-react'
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
        'relative h-full p-5 rounded-2xl flex flex-col',
        'border border-white/[0.07] bg-white/[0.03]',
        'transition-all duration-200 ease-out',
        'hover:border-violet-500/25 hover:bg-white/[0.06]',
        'hover:shadow-[0_8px_32px_-8px_rgba(124,58,237,0.18)]',
        'hover:-translate-y-0.5',
        'active:scale-[0.96] active:brightness-110',
      )}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge
              variant="outline"
              className={cn('text-[11px] font-medium shrink-0 border', CATEGORY_COLORS[capability.category])}
            >
              {capability.category}
            </Badge>
            {capability.changeType !== 'new' && capability.changeType !== 'deprecated' ? null : (
              <Badge
                variant="outline"
                className={cn('text-[11px] font-medium shrink-0 border', CHANGE_COLORS[capability.changeType])}
              >
                {capability.changeType === 'new' ? 'New' : 'Deprecated'}
              </Badge>
            )}
            {capability.changeType === 'updated' && (
              <Badge variant="outline" className="text-[11px] font-medium shrink-0 border bg-amber-500/10 text-amber-400 border-amber-500/20">
                Updated
              </Badge>
            )}
          </div>

          {/* Impact bar */}
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
        <h3 className="font-semibold text-[13px] leading-snug mb-2 text-foreground group-hover:text-violet-300 transition-colors duration-150 line-clamp-2">
          {capability.name}
        </h3>

        {/* Summary */}
        <p className="text-[12px] text-muted-foreground line-clamp-2 mb-4 flex-1 leading-relaxed">
          {capability.summary}
        </p>

        {/* Beta */}
        {capability.verifiedOnBeta && (
          <p className="text-[10px] text-muted-foreground/50 mb-3 font-mono">
            ✓ {capability.verifiedOnBeta}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.06]">
          <div className="flex flex-wrap gap-1">
            {capability.frameworks.slice(0, 2).map(fw => (
              <span
                key={fw}
                className="text-[10px] bg-white/[0.05] text-muted-foreground/80 rounded-md px-1.5 py-0.5 font-mono border border-white/[0.06]"
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
