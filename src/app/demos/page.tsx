import { db } from '@/db'
import { demos, capabilities } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Badge } from '@/components/ui/badge'
import { FlaskConical, ExternalLink, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'

export const revalidate = 60
export const metadata: Metadata = { title: 'Demos' }

const COMPLEXITY_COLORS: Record<string, string> = {
  Simple:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Advanced: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default async function DemosPage() {
  const rows = await db.select({
    id: demos.id,
    title: demos.title,
    description: demos.description,
    complexity: demos.complexity,
    repoUrl: demos.repoUrl,
    status: demos.status,
    capabilityName: capabilities.name,
    capabilitySlug: capabilities.slug,
    capabilityCategory: capabilities.category,
  })
    .from(demos)
    .leftJoin(capabilities, eq(demos.capabilityId, capabilities.id))
    .where(eq(capabilities.status, 'ready'))
    .orderBy(desc(demos.id))

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 animate-page-enter">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Demo Library</h1>
        <p className="text-muted-foreground text-base">
          Minimal, focused Swift demos for every tracked iOS&nbsp;27 capability.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-40 text-muted-foreground">
          <FlaskConical className="h-10 w-10 mx-auto mb-4 opacity-30" />
          <p className="text-base mb-1">No demos yet.</p>
          <p className="text-sm">
            Approve capabilities in{' '}
            <Link href="/admin" className="text-violet-400 hover:underline">/admin</Link>{' '}
            to populate this page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rows.map(demo => {
            const href = demo.capabilitySlug ? `/features/${demo.capabilitySlug}` : (demo.repoUrl ?? '#')
            const isExternal = !demo.capabilitySlug && !!demo.repoUrl

            return (
              <Link
                key={demo.id}
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="group block"
              >
                <div className={cn(
                  'relative h-full p-5 rounded-2xl flex flex-col gap-3 overflow-hidden',
                  'border border-white/[0.07] bg-white/[0.025]',
                  'transition-all duration-300 ease-out',
                  'hover:border-emerald-500/30 hover:bg-white/[0.07]',
                  'hover:shadow-[0_20px_60px_-10px_rgba(16,185,129,0.25),0_0_0_1px_rgba(16,185,129,0.12)]',
                  'hover:-translate-y-1.5',
                  'active:scale-[0.97] active:translate-y-0',
                )}>
                  {/* Hover glow */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.1) 0%, transparent 70%)' }}
                    aria-hidden
                  />

                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className={cn('text-[11px] border shrink-0', COMPLEXITY_COLORS[demo.complexity])}>
                      {demo.complexity}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        'flex items-center gap-1 text-[11px] font-medium',
                        demo.status === 'implemented' ? 'text-emerald-400' : 'text-muted-foreground/60',
                      )}>
                        <FlaskConical className="h-3 w-3" />
                        {demo.status === 'implemented' ? 'Live' : 'Planned'}
                      </span>
                      {isExternal
                        ? <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-emerald-400 transition-colors" />
                        : <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-emerald-400 -translate-y-0.5 translate-x-0.5 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                      }
                    </div>
                  </div>

                  {/* Title & description */}
                  <div>
                    <h3 className="font-semibold text-[13px] leading-snug mb-1.5 text-foreground group-hover:text-emerald-200 transition-colors duration-200">
                      {demo.title}
                    </h3>
                    <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {demo.description}
                    </p>
                  </div>

                  {/* Footer */}
                  {demo.capabilityName && (
                    <div className="mt-auto pt-3 border-t border-white/[0.06]">
                      <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500/60 inline-block" />
                        {demo.capabilityName}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
