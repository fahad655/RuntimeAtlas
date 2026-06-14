'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/analytics'

export function CopyButton({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    trackEvent('code_copy', { label: label ?? 'unknown', length: code.length })
  }

  return (
    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copy} aria-label="Copy code">
      {copied
        ? <Check className="h-3.5 w-3.5 text-emerald-400" />
        : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
    </Button>
  )
}
