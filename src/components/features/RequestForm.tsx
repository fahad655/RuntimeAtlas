'use client'
import { useState, useEffect, useRef } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, X, SendHorizonal, Sparkles, CheckCircle2, Link2 } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export function RequestForm() {
  const { isSignedIn, isLoaded } = useUser()
  const [open, setOpen] = useState(false)
  const [topic, setTopic] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Auto-focus topic input when modal opens
  useEffect(() => {
    if (open && isSignedIn && !done) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, isSignedIn, done])

  function close() {
    setOpen(false)
    setError('')
  }

  function openFresh() {
    setDone(false)
    setError('')
    setTopic('')
    setUrl('')
    setOpen(true)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!topic.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), url: url.trim() || undefined }),
      })
      const data = await res.json() as { error?: string }
      if (data.error) { setError(data.error); return }
      trackEvent('user_ingest_request', { topic: topic.trim() })
      setDone(true)
    } catch {
      setError('Network error — try again')
    } finally {
      setLoading(false)
    }
  }

  if (!hasClerk) return null

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={openFresh}
        className="gap-1.5 text-sm border-white/[0.1] text-muted-foreground hover:text-foreground hover:border-violet-500/30 hover:text-violet-300 transition-all"
      >
        <Plus className="h-3.5 w-3.5" />
        Request a capability
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
            aria-hidden
          />

          <div className="flex min-h-full items-end sm:items-center justify-center p-4 sm:p-6">
          {/* Modal */}
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0a0a0f]/95 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden">

            {/* Top accent line */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base leading-tight">Request a capability</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Missing an iOS 27 feature? We&apos;ll ingest it.
                    </p>
                  </div>
                </div>
                <button
                  onClick={close}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors -mr-1 -mt-1"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              {!isLoaded ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : !isSignedIn ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto">
                    <Sparkles className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Sign in to request</p>
                    <p className="text-xs text-muted-foreground">Create a free account to submit capability requests and vote on others.</p>
                  </div>
                  <SignInButton mode="modal">
                    <Button className="bg-violet-600 hover:bg-violet-500 text-white w-full">
                      Sign in to continue
                    </Button>
                  </SignInButton>
                </div>
              ) : done ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-base mb-1">Request submitted</p>
                    <p className="text-sm text-muted-foreground">We&apos;ll ingest it in the next pass. High-voted requests get priority.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-white/[0.1] text-muted-foreground hover:text-foreground"
                      onClick={() => { setDone(false); setTopic(''); setUrl('') }}
                    >
                      Submit another
                    </Button>
                    <Button
                      className="flex-1 bg-violet-600 hover:bg-violet-500 text-white"
                      onClick={close}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Capability name <span className="text-muted-foreground/50">required</span>
                    </label>
                    <Input
                      ref={inputRef}
                      placeholder="e.g. Foundation Models, Liquid Glass slider, App Intents"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      disabled={loading}
                      className="h-10 text-sm bg-white/[0.03] border-white/[0.1] focus:border-violet-500/50 focus:bg-white/[0.05]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Link2 className="h-3 w-3" />
                      Apple URL <span className="text-muted-foreground/50">optional</span>
                    </label>
                    <Input
                      placeholder="https://developer.apple.com/…"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      disabled={loading}
                      className="h-10 text-sm bg-white/[0.03] border-white/[0.1] focus:border-violet-500/50 focus:bg-white/[0.05] font-mono text-xs"
                      type="url"
                    />
                    <p className="text-[11px] text-muted-foreground/60">Paste a doc page or WWDC session URL to guide the ingestion.</p>
                  </div>

                  {error && (
                    <p className="text-xs text-red-400 bg-red-500/[0.08] border border-red-500/20 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={close}
                      className="flex-1 border-white/[0.1] text-muted-foreground hover:text-foreground"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !topic.trim()}
                      className="flex-1 bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/30 disabled:opacity-40"
                    >
                      {loading
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <><SendHorizonal className="h-4 w-4 mr-1.5" />Submit</>}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
          </div>
        </div>
      )}
    </>
  )
}
