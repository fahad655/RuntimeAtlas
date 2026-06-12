import { db } from '@/db'
import { capabilities, sources, demos } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ExternalLink, FlaskConical, AlertTriangle, Zap, BookOpen, Video, Code2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CopyButton } from '@/components/features/CopyButton'
import { ViewTracker } from '@/components/features/ViewTracker'
import type { Metadata } from 'next'

export const revalidate = 300

const CATEGORY_COLORS: Record<string, string> = {
  AI:          'bg-purple-500/10 text-purple-400 border-purple-500/20',
  UI:          'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Performance: 'bg-green-500/10 text-green-400 border-green-500/20',
  Safety:      'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Store:       'bg-teal-500/10 text-teal-400 border-teal-500/20',
  System:      'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  wwdc_session: <Video className="h-4 w-4" />,
  sample_code:  <Code2 className="h-4 w-4" />,
  what_new_page: <BookOpen className="h-4 w-4" />,
  doc_page:     <BookOpen className="h-4 w-4" />,
}

async function getData(slug: string) {
  const [cap] = await db.select().from(capabilities).where(eq(capabilities.slug, slug)).limit(1)
  if (!cap) return null
  const [capSources, capDemos] = await Promise.all([
    db.select().from(sources).where(eq(sources.capabilityId, cap.id)),
    cap.demoId ? db.select().from(demos).where(eq(demos.id, cap.demoId)) : Promise.resolve([]),
  ])
  return { cap, sources: capSources, demo: capDemos[0] ?? null }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) return {}
  return {
    title: data.cap.name,
    description: data.cap.summary,
  }
}

export default async function FeatureDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) notFound()

  const { cap, sources: capSources, demo } = data
  const wwdcSources = capSources.filter(s => s.type === 'wwdc_session')
  const docSources = capSources.filter(s => s.type !== 'wwdc_session')
  const allSources = [...wwdcSources, ...docSources]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <ViewTracker slug={slug} />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/features" className="hover:text-foreground transition-colors">Features</Link>
        <span>/</span>
        <span className="text-foreground truncate">{cap.name}</span>
      </div>

      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className={cn('text-xs', CATEGORY_COLORS[cap.category])}>
            {cap.category}
          </Badge>
          <Badge variant="outline" className="text-xs">{cap.availability}</Badge>
          {demo && (
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <FlaskConical className="h-3 w-3 mr-1" /> Demo available
            </Badge>
          )}
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">{cap.name}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{cap.summary}</p>

        <div className="flex flex-wrap gap-1.5 mt-5">
          {cap.frameworks.map(fw => (
            <span key={fw} className="text-xs font-mono bg-muted/50 text-muted-foreground rounded-md px-2 py-1">
              {fw}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5 mt-4">
          <span className="text-xs text-muted-foreground mr-1">Impact</span>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={cn('h-2 w-2 rounded-full', i < cap.impactScore ? 'bg-violet-400' : 'bg-muted')} />
          ))}
          <span className="text-xs text-muted-foreground ml-1">{cap.impactScore}/5</span>
        </div>
      </header>

      <Separator className="mb-10" />

      {/* Why it matters */}
      {cap.whyItMatters && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-violet-400 shrink-0" />
            <h2 className="text-xl font-semibold">Why you should care</h2>
          </div>
          <div className="space-y-2 pl-7">
            {cap.whyItMatters.split('\n').filter(Boolean).map((line, i) => (
              <p key={i} className="text-muted-foreground text-sm leading-relaxed">
                {line.replace(/^[•\-\*]\s*/, '• ')}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Demo */}
      {demo && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical className="h-5 w-5 text-emerald-400 shrink-0" />
            <h2 className="text-xl font-semibold">Tiny Demo</h2>
            <Badge variant="outline" className="text-xs ml-auto">{demo.complexity}</Badge>
          </div>

          <div className="rounded-xl border border-border/50 overflow-hidden">
            <div className="px-5 py-4 border-b border-border/30 bg-muted/20">
              <h3 className="font-semibold text-sm">{demo.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{demo.description}</p>
            </div>

            {demo.codeSnippet && (
              <div>
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-muted/30">
                  <span className="text-xs text-muted-foreground font-mono">Swift</span>
                  <CopyButton code={demo.codeSnippet} />
                </div>
                <pre className="overflow-x-auto p-5 text-xs font-mono leading-relaxed bg-muted/10">
                  <code>{demo.codeSnippet}</code>
                </pre>
              </div>
            )}

            {demo.repoUrl && (
              <div className="px-5 py-3 border-t border-border/30 bg-muted/10">
                <a
                  href={demo.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                >
                  View full repo <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Source map */}
      {allSources.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Source map</h2>
          <div className="space-y-2">
            {allSources.map(src => (
              <a
                key={src.id}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 transition-all group"
              >
                <span className="text-muted-foreground shrink-0">
                  {SOURCE_ICONS[src.type] ?? <BookOpen className="h-4 w-4" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium group-hover:text-violet-400 transition-colors truncate">
                    {src.title}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize mt-0.5">
                    {src.type.replace(/_/g, ' ')}{src.official ? ' · Official' : ''}
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Gotchas */}
      {cap.gotchas && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
            <h2 className="text-xl font-semibold">Gotchas</h2>
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-5">
            <p className="text-sm text-muted-foreground leading-relaxed">{cap.gotchas}</p>
          </div>
        </section>
      )}

      {/* Hardware constraints */}
      {cap.hardwareConstraints && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Requirements</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{cap.hardwareConstraints}</p>
        </section>
      )}
    </div>
  )
}
