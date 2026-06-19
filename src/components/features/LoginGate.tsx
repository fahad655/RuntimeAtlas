'use client'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Lock, Code2, FlaskConical, TrendingUp, Flame, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  description: string
  /** 'inline' = detail page card, 'banner' = full-width listing gate */
  variant?: 'inline' | 'banner'
}

export function LoginGate({ title, description, variant = 'inline' }: Props) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border overflow-hidden',
        variant === 'banner'
          ? 'border-white/[0.07] bg-white/[0.02]'
          : 'border-violet-500/20 bg-violet-500/[0.04]',
      )}
    >
      {/* Subtle top gradient accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      <div className={cn(
        'flex flex-col items-center text-center',
        variant === 'banner' ? 'px-6 py-12 sm:py-16' : 'px-6 py-10',
      )}>
        {/* Lock icon */}
        <div className="w-11 h-11 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
          <Lock className="h-5 w-5 text-violet-400" />
        </div>

        <h3 className="text-base font-semibold mb-1.5">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-5">{description}</p>

        {/* Feature highlights */}
        <div className="flex flex-col gap-2 mb-6 text-left w-full max-w-xs">
          {[
            { icon: <Code2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />, text: 'Runnable Swift code for every API' },
            { icon: <FlaskConical className="h-3.5 w-3.5 text-violet-400 shrink-0" />, text: 'Before/after diffs and gotchas' },
            { icon: <TrendingUp className="h-3.5 w-3.5 text-blue-400 shrink-0" />, text: 'Track which APIs you\'ve shipped' },
            { icon: <Flame className="h-3.5 w-3.5 text-orange-400 shrink-0" />, text: 'Streak that holds if you skip one day' },
            { icon: <Terminal className="h-3.5 w-3.5 text-zinc-400 shrink-0" />, text: 'MCP server for AI coding assistants' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-xs text-muted-foreground">
              {icon}
              {text}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <SignUpButton mode="modal">
            <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white border-0 shadow-lg shadow-violet-900/30">
              Sign up free
            </Button>
          </SignUpButton>
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Sign in
            </Button>
          </SignInButton>
        </div>
      </div>
    </div>
  )
}
