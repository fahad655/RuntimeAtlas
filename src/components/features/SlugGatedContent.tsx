'use client'
import { useUser } from '@clerk/nextjs'
import { FlaskConical, AlertTriangle, ExternalLink } from 'lucide-react'
import { LoginGate } from '@/components/features/LoginGate'
import { DemoSection } from '@/components/features/DemoSection'
import { SubscribeForm } from '@/components/layout/SubscribeForm'

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
  const { isSignedIn, isLoaded } = useUser()

  if (!isLoaded || !isSignedIn) {
    return (
      <>
        <div className="mb-12">
          {/* Blurred teaser */}
          <div className="relative mb-4 rounded-2xl overflow-hidden pointer-events-none select-none">
            <div className="p-5 space-y-3 opacity-40 blur-[3px]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20" />
                <div className="h-4 w-24 rounded bg-white/10" />
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 space-y-2">
                <div className="h-3 w-3/4 rounded bg-white/10" />
                <div className="h-3 w-full rounded bg-white/10" />
                <div className="h-3 w-2/3 rounded bg-white/10" />
                <div className="h-3 w-5/6 rounded bg-white/10" />
                <div className="h-3 w-1/2 rounded bg-white/10" />
              </div>
              <div className="flex items-center gap-2.5 mt-5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20" />
                <div className="h-4 w-16 rounded bg-white/10" />
              </div>
              <div className="rounded-xl border border-amber-500/15 p-4 space-y-2">
                <div className="h-3 w-full rounded bg-white/10" />
                <div className="h-3 w-4/5 rounded bg-white/10" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
          </div>

          {isLoaded && !isSignedIn && (
            <LoginGate
              title="Sign in to unlock the full breakdown"
              description="Compilable Swift code demos and implementation gotchas are available to registered users — free to sign up."
            />
          )}
        </div>

        {isLoaded && !isSignedIn && (
          <section className="mb-8 rounded-2xl border border-violet-500/15 bg-violet-500/[0.03] p-5">
            <p className="text-sm font-semibold mb-0.5">More iOS 27 APIs land every week.</p>
            <p className="text-xs text-muted-foreground mb-4">Get notified when new capabilities are published — no noise, just signal.</p>
            <SubscribeForm source="capability-detail" compact />
          </section>
        )}
      </>
    )
  }

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
          <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-5">
            <p className="text-sm text-muted-foreground leading-relaxed">{gotchas}</p>
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
    </>
  )
}
