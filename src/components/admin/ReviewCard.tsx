'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, X, ExternalLink, Pencil, RefreshCw, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InferSelectModel } from 'drizzle-orm'
import type { capabilities } from '@/db/schema'
import type { Category } from '@/types'

type Capability = InferSelectModel<typeof capabilities>

const CATEGORY_COLORS: Record<string, string> = {
  AI:          'bg-purple-500/10 text-purple-400 border-purple-500/20',
  UI:          'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Performance: 'bg-green-500/10 text-green-400 border-green-500/20',
  Safety:      'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Store:       'bg-teal-500/10 text-teal-400 border-teal-500/20',
  System:      'bg-gray-500/10 text-gray-400 border-gray-500/20',
}
const CATEGORIES = ['AI', 'UI', 'Performance', 'Safety', 'Store', 'System']

interface Props {
  capability: Capability
  secret: string
  onUpdate: () => void
  showRefresh?: boolean
}

export function ReviewCard({ capability, secret, onUpdate, showRefresh }: Props) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({
    name: capability.name,
    summary: capability.summary,
    category: capability.category,
    impactScore: capability.impactScore,
    gotchas: capability.gotchas ?? '',
    hardwareConstraints: capability.hardwareConstraints ?? '',
    frameworks: capability.frameworks.join(', '),
    verifiedOnBeta: capability.verifiedOnBeta ?? '',
  })

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/capabilities/${capability.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify(body),
    })
    return res.ok
  }

  async function approve() {
    setActionLoading('approve')
    await patch({ status: 'ready' })
    setActionLoading(null)
    onUpdate()
  }

  async function reject() {
    setActionLoading('reject')
    await patch({ status: 'deprecated' })
    setActionLoading(null)
    onUpdate()
  }

  async function refresh() {
    setActionLoading('refresh')
    await fetch(`/api/admin/capabilities/${capability.id}/refresh`, {
      method: 'POST',
      headers: { 'x-admin-secret': secret },
    })
    setActionLoading(null)
    onUpdate()
  }

  async function saveEdits() {
    setActionLoading('save')
    await patch({
      name: draft.name,
      summary: draft.summary,
      category: draft.category,
      impactScore: Number(draft.impactScore),
      gotchas: draft.gotchas || null,
      hardwareConstraints: draft.hardwareConstraints || null,
      frameworks: draft.frameworks.split(',').map(f => f.trim()).filter(Boolean),
      verifiedOnBeta: draft.verifiedOnBeta || null,
    })
    setActionLoading(null)
    setEditing(false)
    onUpdate()
  }

  return (
    <Card className="p-4 border-border/50">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={cn('text-xs', CATEGORY_COLORS[capability.category])}>
            {capability.category}
          </Badge>
          {capability.changeType === 'updated' && (
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/20">Updated</Badge>
          )}
          <span className="text-xs text-muted-foreground">{capability.availability}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setEditing(e => !e)}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <a
            href={`/features/${capability.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {editing ? (
        <div className="space-y-2 mb-3">
          <Input
            value={draft.name}
            onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
            className="h-8 text-sm font-semibold"
            placeholder="Name"
          />
          <textarea
            value={draft.summary}
            onChange={e => setDraft(d => ({ ...d, summary: e.target.value }))}
            className="w-full text-xs text-muted-foreground bg-transparent border border-border rounded-md p-2 resize-none h-20 focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Summary"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={draft.category}
              onChange={e => setDraft(d => ({ ...d, category: e.target.value as Category }))}
              className="h-8 text-xs bg-background border border-border rounded-md px-2 focus:outline-none"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground shrink-0">Impact</span>
              <select
                value={draft.impactScore}
                onChange={e => setDraft(d => ({ ...d, impactScore: Number(e.target.value) }))}
                className="h-8 text-xs bg-background border border-border rounded-md px-2 flex-1 focus:outline-none"
              >
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}/5</option>)}
              </select>
            </div>
          </div>
          <Input
            value={draft.frameworks}
            onChange={e => setDraft(d => ({ ...d, frameworks: e.target.value }))}
            className="h-8 text-xs font-mono"
            placeholder="Frameworks (comma-separated)"
          />
          <Input
            value={draft.verifiedOnBeta}
            onChange={e => setDraft(d => ({ ...d, verifiedOnBeta: e.target.value }))}
            className="h-8 text-xs"
            placeholder="Verified on beta (e.g. Beta 1)"
          />
          <textarea
            value={draft.gotchas}
            onChange={e => setDraft(d => ({ ...d, gotchas: e.target.value }))}
            className="w-full text-xs text-muted-foreground bg-transparent border border-border rounded-md p-2 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Gotchas (optional)"
          />
        </div>
      ) : (
        <>
          <h3 className="font-semibold text-sm mb-1">{capability.name}</h3>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{capability.summary}</p>
        </>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <Button
              size="sm"
              className="flex-1 h-8 bg-violet-600 hover:bg-violet-500 text-white text-xs"
              onClick={saveEdits}
              disabled={!!actionLoading}
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              {actionLoading === 'save' ? 'Saving…' : 'Save'}
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
              onClick={approve}
              disabled={!!actionLoading}
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              {actionLoading === 'approve' ? 'Approving…' : 'Approve'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs hover:border-destructive hover:text-destructive"
              onClick={reject}
              disabled={!!actionLoading}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              {actionLoading === 'reject' ? 'Rejecting…' : 'Reject'}
            </Button>
            {showRefresh && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={refresh}
                disabled={!!actionLoading}
                title="Re-scrape and re-classify"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', actionLoading === 'refresh' && 'animate-spin')} />
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  )
}
