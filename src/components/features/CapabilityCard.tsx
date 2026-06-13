import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
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
  System:      'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

export function CapabilityCard({ capability }: { capability: Capability }) {
  return (
    <Link href={`/features/${capability.slug}`} className="block h-full">
      <Card className="group h-full p-5 border-border/50 bg-card/50 hover:bg-card hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-200 cursor-pointer flex flex-col">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge
              variant="outline"
              className={cn('text-xs font-medium shrink-0', CATEGORY_COLORS[capability.category])}
            >
              {capability.category}
            </Badge>
            {capability.changeType === 'new' && (
              <Badge variant="outline" className="text-xs font-medium shrink-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                New
              </Badge>
            )}
            {capability.changeType === 'updated' && (
              <Badge variant="outline" className="text-xs font-medium shrink-0 bg-amber-500/10 text-amber-400 border-amber-500/20">
                Updated
              </Badge>
            )}
            {capability.changeType === 'deprecated' && (
              <Badge variant="outline" className="text-xs font-medium shrink-0 bg-red-500/10 text-red-400 border-red-500/20">
                Deprecated
              </Badge>
            )}
          </div>
          {/* Impact dots */}
          <div className="flex items-center gap-1 pt-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-colors',
                  i < capability.impactScore ? 'bg-violet-400' : 'bg-muted',
                )}
              />
            ))}
          </div>
        </div>

        {/* Name */}
        <h3 className="font-semibold text-sm leading-snug mb-1.5 group-hover:text-violet-400 transition-colors line-clamp-2">
          {capability.name}
        </h3>

        {/* Summary */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
          {capability.summary}
        </p>

        {/* Beta badge */}
        {capability.verifiedOnBeta && (
          <p className="text-[10px] text-muted-foreground/60 mb-3">
            Verified on {capability.verifiedOnBeta}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/30">
          <div className="flex flex-wrap gap-1">
            {capability.frameworks.slice(0, 2).map(fw => (
              <span key={fw} className="text-[11px] bg-muted/50 text-muted-foreground rounded px-1.5 py-0.5 font-mono">
                {fw}
              </span>
            ))}
            {capability.frameworks.length > 2 && (
              <span className="text-[11px] text-muted-foreground self-center">
                +{capability.frameworks.length - 2}
              </span>
            )}
          </div>
          {capability.demoId ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium shrink-0">
              <FlaskConical className="h-3 w-3" /> Demo
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
              <Clock className="h-3 w-3" /> Brief
            </span>
          )}
        </div>
      </Card>
    </Link>
  )
}
