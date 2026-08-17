'use client'
import { useEffect, useState } from 'react'
import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs'
import { Lock, KeyRound, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/features/CopyButton'

type Status =
  | { state: 'loading' }
  | { state: 'none' }
  | { state: 'active'; createdAt: string }
  | { state: 'revealed'; token: string }

export function McpTokenPanel() {
  const { isSignedIn, isLoaded } = useUser()
  const [status, setStatus] = useState<Status>({ state: 'loading' })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) { setStatus({ state: 'none' }); return }
    fetch('/api/user/mcp-token')
      .then(r => r.json())
      .then(d => setStatus(d.hasToken ? { state: 'active', createdAt: d.createdAt } : { state: 'none' }))
      .catch(() => setStatus({ state: 'none' }))
  }, [isLoaded, isSignedIn])

  async function generate() {
    setBusy(true)
    try {
      const res = await fetch('/api/user/mcp-token', { method: 'POST' })
      const d = await res.json()
      setStatus({ state: 'revealed', token: d.token })
    } finally {
      setBusy(false)
    }
  }

  async function revoke() {
    setBusy(true)
    try {
      await fetch('/api/user/mcp-token', { method: 'DELETE' })
      setStatus({ state: 'none' })
    } finally {
      setBusy(false)
    }
  }

  if (!isLoaded || status.state === 'loading') {
    return <div className="h-32 rounded-2xl border border-white/[0.07] bg-white/[0.02] animate-pulse" />
  }

  if (!isSignedIn) {
    return (
      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
            <Lock className="h-4.5 w-4.5 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold">Sign in to generate your access token</p>
            <p className="text-xs text-muted-foreground mt-0.5">The MCP server requires a personal token — free to sign up.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SignUpButton mode="modal">
            <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white border-0">Sign up free</Button>
          </SignUpButton>
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">Sign in</Button>
          </SignInButton>
        </div>
      </div>
    )
  }

  if (status.state === 'revealed') {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6">
        <p className="text-sm font-semibold mb-1">Your token — copy it now</p>
        <p className="text-xs text-muted-foreground mb-4">This is shown once. Paste it into the <code className="text-emerald-400">Authorization: Bearer</code> header in your editor config above.</p>
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
          <code className="flex-1 text-sm font-mono text-emerald-300 truncate">{status.token}</code>
          <CopyButton code={status.token} label="mcp_token" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
          <KeyRound className="h-4.5 w-4.5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold">
            {status.state === 'active' ? 'Access token active' : 'No access token yet'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {status.state === 'active'
              ? `Generated ${new Date(status.createdAt).toLocaleDateString()}. Regenerating replaces it everywhere it's used.`
              : 'Generate one to connect your editor to the MCP server.'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {status.state === 'active' && (
          <Button variant="ghost" size="sm" onClick={revoke} disabled={busy} className="text-red-400 hover:text-red-300">
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Revoke
          </Button>
        )}
        <Button size="sm" onClick={generate} disabled={busy} className="bg-violet-600 hover:bg-violet-500 text-white border-0">
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> {status.state === 'active' ? 'Regenerate' : 'Generate token'}
        </Button>
      </div>
    </div>
  )
}
