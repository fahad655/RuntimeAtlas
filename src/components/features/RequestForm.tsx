'use client'
import { useState } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, X, SendHorizonal } from 'lucide-react'
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
      setTopic('')
      setUrl('')
    } catch {
      setError('Network error — try again')
    } finally {
      setLoading(false)
    }
  }

  if (!hasClerk) return null

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => { setOpen(o => !o); setDone(false); setError('') }}
        className="gap-1.5 text-sm border-white/[0.1] text-muted-foreground hover:text-foreground"
      >
        {open ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        Request a capability
      </Button>

      {open && (
        <div className="absolute right-0 top-10 z-20 w-80 rounded-xl border border-white/[0.1] bg-background/95 backdrop-blur-xl shadow-2xl p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold mb-0.5">Request a capability</p>
            <p className="text-xs text-muted-foreground">Missing an iOS 27 feature? We&apos;ll ingest it.</p>
          </div>

          {!isLoaded ? null : !isSignedIn ? (
            <div className="text-center py-3">
              <p className="text-xs text-muted-foreground mb-3">Sign in to submit a request</p>
              <SignInButton mode="modal">
                <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white text-xs">Sign in</Button>
              </SignInButton>
            </div>
          ) : done ? (
            <div className="text-center py-4">
              <p className="text-emerald-400 text-sm font-medium">Request submitted ✓</p>
              <p className="text-xs text-muted-foreground mt-1">We&apos;ll ingest it in the next pass.</p>
              <button onClick={() => setDone(false)} className="text-xs text-muted-foreground hover:text-foreground mt-2 underline underline-offset-2">
                Submit another
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-2">
              <Input
                placeholder="e.g. App Intents, Liquid Glass slider"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                disabled={loading}
                className="h-8 text-sm"
                autoFocus
              />
              <Input
                placeholder="Apple URL (optional)"
                value={url}
                onChange={e => setUrl(e.target.value)}
                disabled={loading}
                className="h-8 text-sm"
                type="url"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button
                type="submit"
                disabled={loading || !topic.trim()}
                className="w-full h-8 text-xs bg-violet-600 hover:bg-violet-500 text-white"
              >
                {loading
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <><SendHorizonal className="h-3.5 w-3.5 mr-1.5" />Submit request</>}
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
