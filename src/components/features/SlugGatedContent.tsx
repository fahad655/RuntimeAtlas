import { FlaskConical, AlertTriangle, ExternalLink } from 'lucide-react'
import { DemoSection } from '@/components/features/DemoSection'
import { DismissibleLoginBanner } from '@/components/features/DismissibleLoginBanner'

interface DemoData {
  title: string
  description: string
  complexity: string
  repoUrl: string | null
}

interface Props {
  demo: DemoData | null
  newCodeHtml: string | null
  oldCodeHtml: string | null
  rawNewCode: string | null
  rawOldCode: string | null
  gotchas: string | null
  hardwareConstraints: string | null
  changeType: string
}

// Public — every visitor (and Googlebot) sees the full demo code, gotchas,
// and requirements. Sign-in is only needed to track progress/streaks, not
// to read content, so this now just renders the sections plus a dismissible
// nudge instead of blocking anything behind a login wall.
export function SlugGatedContent({
  demo,
  newCodeHtml,
  oldCodeHtml,
  rawNewCode,
  rawOldCode,
  gotchas,
  hardwareConstraints,
  changeType,
}: Props) {
  return (
    <>
      {/* Demo */}
      {demo && (
        <section className="mb-12">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <FlaskConical className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold">Tiny Demo</h2>
          </div>

          <DemoSection
            title={demo.title}
            description={demo.description}
            complexity={demo.complexity}
            changeType={changeType}
            newCodeHtml={newCodeHtml}
            oldCodeHtml={oldCodeHtml}
            rawNewCode={rawNewCode}
            rawOldCode={rawOldCode}
          />

          {demo.repoUrl && (
            <div className="mt-3 px-1">
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
        </section>
      )}

      {/* Gotchas */}
      {gotchas && (
        <section className="mb-12">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold">Gotchas</h2>
          </div>
          <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-5 space-y-2.5">
            {gotchas.split('\n').filter(Boolean).map((line, i) => (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                {line.replace(/^[•\-\*]\s*/, '• ')}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Requirements */}
      {hardwareConstraints && (
        <section className="mb-12">
          <h2 className="text-lg font-semibold mb-3">Requirements</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{hardwareConstraints}</p>
        </section>
      )}

      <DismissibleLoginBanner
        storageKey="sc_dismissed_detail_banner"
        title="Sign in to track your progress"
        description="Mark capabilities complete, build a streak, and get notified about new APIs — free to sign up."
      />
    </>
  )
}
