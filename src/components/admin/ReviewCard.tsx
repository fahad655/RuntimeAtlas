'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InferSelectModel } from 'drizzle-orm'
import type { capabilities } from '@/db/schema'

type Capability = InferSelectModel<typeof capabilities>

const CATEGORY_COLORS: Record<string, string> = {
  AI: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  UI: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Performance: 'bg-green-500/10 text-green-400 border-green-500/20',
  Safety: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Store: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  System: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

interface Props {
  capability: Capability
  secret: string
  onUpdate: () => void
}

export function ReviewCard({ capability, secret, onUpdate }: Props) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/capabilities/${capability.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify(body),
    })
    return res.ok
  }

  async function approve() {
    setLoading('approve')
    await patch({ status: 'ready' })
    setLoading(null)
    onUpdate()
  }

  async function reject() {
    setLoading('reject')
    await patch({ status: 'deprecated' })
    setLoading(null)
    onUpdate()
  }

  return (
    <Card className="p-4 border-border/50">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={cn('text-xs', CATEGORY_COLORS[capability.category])}>
            {capability.category}
          </Badge>
          <span className="text-xs text-muted-foreground">{capability.availability}</span>
        </div>
        <a
          href={`/features/${capability.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <h3 className="font-semibold text-sm mb-1">{capability.name}</h3>
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{capability.summary}</p>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
          onClick={approve}
          disabled={!!loading}
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          {loading === 'approve' ? 'Approving...' : 'Approve'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-8 text-xs hover:border-destructive hover:text-destructive"
          onClick={reject}
          disabled={!!loading}
        >
          <X className="h-3.5 w-3.5 mr-1" />
          {loading === 'reject' ? 'Rejecting...' : 'Reject'}
        </Button>
      </div>
    </Card>
  )
}
