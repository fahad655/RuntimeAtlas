'use client'
import { useState } from 'react'
import { ArrowRight, CheckCircle } from 'lucide-react'

interface Props {
  source?: string
  compact?: boolean
}

export function SubscribeForm({ source = 'landing', compact = false }: Props) {
  const [email, setEmail] = useState('')
  const [hp, setHp] = useState('')           // honeypot
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'loading' || state === 'done') return
    setState('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source, hp }),
      })
      setState(res.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className={`flex items-center gap-2 text-emerald-400 ${compact ? 'text-sm' : ''}`}>
        <CheckCircle className="h-4 w-4 shrink-0" />
        <span>You&apos;re in — we&apos;ll notify you when new APIs drop.</span>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 w-full">
      {/* Honeypot — hidden from users, bots fill it */}
      <input
        type="text"
        value={hp}
        onChange={e => setHp(e.target.value)}
        tabIndex={-1}
        aria-hidden
        className="absolute opacity-0 pointer-events-none"
      />
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        className={`flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 focus:outline-none focus:border-violet-500/50 text-foreground placeholder:text-muted-foreground/60 transition-colors ${compact ? 'h-9 text-sm' : 'h-11 text-sm'}`}
      />
      <button
        type="submit"
        disabled={state === 'loading'}
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all active:scale-[0.97] shrink-0 ${compact ? 'px-4 h-9 text-sm' : 'px-5 h-11 text-sm'}`}
      >
        {state === 'loading' ? 'Subscribing…' : <>Notify me <ArrowRight className="h-3.5 w-3.5" /></>}
      </button>
      {state === 'error' && (
        <p className="text-xs text-red-400 sm:col-span-2">Something went wrong — try again.</p>
      )}
    </form>
  )
}
