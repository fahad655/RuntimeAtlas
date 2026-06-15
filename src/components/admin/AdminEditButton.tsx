'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  capabilityId: number
  demoId: number | null
  initial: {
    name: string
    summary: string
    whyItMatters: string | null
    changesSince: string | null
    gotchas: string | null
    hardwareConstraints: string | null
    impactScore: number
    status: string
    verifiedOnBeta: string | null
  }
  initialDemo: {
    title: string
    description: string
    codeSnippet: string | null
    previousCodeSnippet: string | null
    repoUrl: string | null
  } | null
}

export function AdminEditButton({ capabilityId, demoId, initial, initialDemo }: Props) {
  const router = useRouter()
  const [secret, setSecret] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Capability fields
  const [name, setName] = useState(initial.name)
  const [summary, setSummary] = useState(initial.summary)
  const [whyItMatters, setWhyItMatters] = useState(initial.whyItMatters ?? '')
  const [changesSince, setChangesSince] = useState(initial.changesSince ?? '')
  const [gotchas, setGotchas] = useState(initial.gotchas ?? '')
  const [hardwareConstraints, setHardwareConstraints] = useState(initial.hardwareConstraints ?? '')
  const [impactScore, setImpactScore] = useState(initial.impactScore)
  const [status, setStatus] = useState(initial.status)
  const [verifiedOnBeta, setVerifiedOnBeta] = useState(initial.verifiedOnBeta ?? '')

  // Demo fields
  const [demoTitle, setDemoTitle] = useState(initialDemo?.title ?? '')
  const [demoDesc, setDemoDesc] = useState(initialDemo?.description ?? '')
  const [codeSnippet, setCodeSnippet] = useState(initialDemo?.codeSnippet ?? '')
  const [prevCodeSnippet, setPrevCodeSnippet] = useState(initialDemo?.previousCodeSnippet ?? '')
  const [repoUrl, setRepoUrl] = useState(initialDemo?.repoUrl ?? '')

  useEffect(() => {
    const s = localStorage.getItem('ra-admin-secret')
    if (s) setSecret(s)
  }, [])

  if (!secret) return null

  async function save() {
    setSaving(true)
    const headers = { 'Content-Type': 'application/json', 'x-admin-secret': secret! }

    await fetch(`/api/admin/capabilities/${capabilityId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        name,
        summary,
        whyItMatters: whyItMatters || null,
        changesSince: changesSince || null,
        gotchas: gotchas || null,
        hardwareConstraints: hardwareConstraints || null,
        impactScore,
        status,
        verifiedOnBeta: verifiedOnBeta || null,
      }),
    })

    if (demoId && initialDemo) {
      await fetch(`/api/admin/demos/${demoId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          title: demoTitle,
          description: demoDesc,
          codeSnippet: codeSnippet || null,
          previousCodeSnippet: prevCodeSnippet || null,
          repoUrl: repoUrl || null,
        }),
      })
    }

    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-violet-400 transition-colors border border-white/[0.08] hover:border-violet-500/30 rounded-lg px-2.5 py-1.5"
        title="Edit capability (admin)"
      >
        <Pencil className="h-3 w-3" />
        Edit
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Slide-over */}
          <div className="relative ml-auto w-full max-w-lg h-full bg-[#0a0a0f] border-l border-white/[0.08] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] shrink-0">
              <h2 className="font-semibold text-sm">Edit capability</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable fields */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              <Field label="Status">
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-violet-500/50"
                >
                  <option value="needs_review">needs_review</option>
                  <option value="ready">ready</option>
                  <option value="deprecated">deprecated</option>
                  <option value="draft">draft</option>
                </select>
              </Field>

              <Field label="Impact score">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setImpactScore(n)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                        impactScore === n
                          ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                          : 'bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:border-white/[0.2]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Name">
                <Input value={name} onChange={e => setName(e.target.value)} className="bg-white/[0.04] border-white/[0.08]" />
              </Field>

              <Field label="Summary">
                <Textarea value={summary} onChange={e => setSummary(e.target.value)} rows={3} className="bg-white/[0.04] border-white/[0.08] text-sm resize-none" />
              </Field>

              <Field label="Why it matters">
                <Textarea value={whyItMatters} onChange={e => setWhyItMatters(e.target.value)} rows={4} className="bg-white/[0.04] border-white/[0.08] text-sm resize-none" placeholder="One bullet point per line" />
              </Field>

              <Field label="What changed from iOS 26">
                <Textarea value={changesSince} onChange={e => setChangesSince(e.target.value)} rows={4} className="bg-white/[0.04] border-white/[0.08] text-sm resize-none" placeholder="One bullet point per line" />
              </Field>

              <Field label="Gotchas">
                <Textarea value={gotchas} onChange={e => setGotchas(e.target.value)} rows={3} className="bg-white/[0.04] border-white/[0.08] text-sm resize-none" />
              </Field>

              <Field label="Hardware constraints">
                <Textarea value={hardwareConstraints} onChange={e => setHardwareConstraints(e.target.value)} rows={2} className="bg-white/[0.04] border-white/[0.08] text-sm resize-none" />
              </Field>

              <Field label="Verified on beta">
                <Input value={verifiedOnBeta} onChange={e => setVerifiedOnBeta(e.target.value)} placeholder="e.g. iOS 27 beta 2" className="bg-white/[0.04] border-white/[0.08]" />
              </Field>

              {initialDemo && (
                <>
                  <div className="border-t border-white/[0.06] pt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Demo</p>
                  </div>

                  <Field label="Demo title">
                    <Input value={demoTitle} onChange={e => setDemoTitle(e.target.value)} className="bg-white/[0.04] border-white/[0.08]" />
                  </Field>

                  <Field label="Demo description">
                    <Textarea value={demoDesc} onChange={e => setDemoDesc(e.target.value)} rows={2} className="bg-white/[0.04] border-white/[0.08] text-sm resize-none" />
                  </Field>

                  <Field label="Code snippet (iOS 27)">
                    <Textarea value={codeSnippet} onChange={e => setCodeSnippet(e.target.value)} rows={8} className="bg-white/[0.04] border-white/[0.08] text-xs font-mono resize-y" />
                  </Field>

                  <Field label="Previous code snippet (iOS 26)">
                    <Textarea value={prevCodeSnippet} onChange={e => setPrevCodeSnippet(e.target.value)} rows={8} className="bg-white/[0.04] border-white/[0.08] text-xs font-mono resize-y" />
                  </Field>

                  <Field label="Repo URL">
                    <Input value={repoUrl} onChange={e => setRepoUrl(e.target.value)} placeholder="https://github.com/…" className="bg-white/[0.04] border-white/[0.08]" />
                  </Field>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-white/[0.07]">
              <Button
                onClick={save}
                disabled={saving}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}
