import { db } from '@/db'
import { demos, capabilities } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { FlaskConical, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'

export const revalidate = 60
export const metadata: Metadata = { title: 'Demos' }

const COMPLEXITY_COLORS: Record<string, string> = {
  Simple:   'bg-green-500/10 text-green-400 border-green-500/20',
  Medium:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
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
    codeSnippet: demos.codeSnippet,
    capabilityId: demos.capabilityId,
    capabilityName: capabilities.name,
    capabilitySlug: capabilities.slug,
    capabilityCategory: capabilities.category,
  })
    .from(demos)
    .leftJoin(capabilities, eq(demos.capabilityId, capabilities.id))
    .where(eq(capabilities.status, 'ready'))
    .orderBy(desc(demos.id))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Demo Library</h1>
        <p className="text-muted-foreground">
          Minimal, focused Swift demos for every tracked iOS 27 capability.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-32 text-muted-foreground">
          No demos yet. Approve capabilities in <Link href="/admin" className="text-violet-400 hover:underline">/admin</Link> to populate this page.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map(demo => (
            <Card key={demo.id} className="p-5 border-border/50 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="outline" className={cn('text-xs', COMPLEXITY_COLORS[demo.complexity])}>
                  {demo.complexity}
                </Badge>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <FlaskConical className="h-3 w-3" />
                  {demo.status === 'implemented' ? 'Live' : 'Planned'}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-1">{demo.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{demo.description}</p>
              </div>

              {demo.capabilitySlug && (
                <Link
                  href={`/features/${demo.capabilitySlug}`}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors mt-auto"
                >
                  ← {demo.capabilityName}
                </Link>
              )}

              {demo.repoUrl && (
                <a
                  href={demo.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  GitHub repo <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
