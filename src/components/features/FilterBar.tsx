'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'

const CATEGORIES = ['AI', 'UI', 'Performance', 'Safety', 'Store', 'System']
const CHANGE_TYPES = [
  { value: 'new',        label: 'New' },
  { value: 'updated',    label: 'Updated' },
  { value: 'deprecated', label: 'Deprecated' },
]
const SORT_OPTIONS = [
  { value: 'rank',     label: 'Most relevant' },
  { value: 'trending', label: 'Trending' },
  { value: 'impact',   label: 'Most impactful' },
  { value: 'newest',   label: 'Newest first' },
]

function Pill({
  active, onClick, children, mono = false,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode; mono?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-xs px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap',
        mono && 'font-mono',
        active
          ? 'bg-violet-600 border-violet-600 text-white'
          : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

export function FilterBar() {
  const router = useRouter()
  const params = useSearchParams()
  const [groups, setGroups] = useState<string[]>([])
  const [searchDraft, setSearchDraft] = useState(params.get('q') ?? '')

  useEffect(() => {
    fetch('/api/frameworks')
      .then(r => r.json())
      .then((d: { groups?: string[] }) => setGroups(d.groups ?? []))
      .catch(() => {})
  }, [])

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (!value || value === 'All') next.delete(key)
    else next.set(key, value)
    trackEvent('filter_apply', { filter: key, value })
    router.push(`/features?${next.toString()}`)
  }

  function toggle(key: string, value: string) {
    const current = params.get(key) ?? ''
    set(key, current === value ? '' : value)
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchDraft.trim()
    if (q) trackEvent('capability_search', { query: q })
    set('q', q)
  }

  function clearSearch() {
    setSearchDraft('')
    set('q', '')
  }

  const category   = params.get('category') ?? ''
  const changeType = params.get('changeType') ?? ''
  const framework  = params.get('framework') ?? ''
  const sort       = params.get('sort') ?? 'rank'
  const hasDemo    = params.get('hasDemo') === 'true'
  const q          = params.get('q') ?? ''
  const hasFilters = !!(category || changeType || framework || hasDemo || q)

  return (
    <div className="space-y-3 mb-8">
      {/* Search + sort */}
      <div className="flex gap-2 items-center">
        <form onSubmit={submitSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchDraft}
            onChange={e => setSearchDraft(e.target.value)}
            placeholder="Search capabilities…"
            className="pl-9 pr-9 h-9 text-sm"
          />
          {searchDraft && (
            <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </form>

        <select
          value={sort}
          onChange={e => set('sort', e.target.value)}
          className="h-9 text-sm bg-background border border-input rounded-md px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500 shrink-0"
        >
          {SORT_OPTIONS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Category + change type + has demo */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mr-1 shrink-0">Category</span>
        {CATEGORIES.map(c => (
          <Pill key={c} active={category === c} onClick={() => toggle('category', c)}>{c}</Pill>
        ))}
        <span className="text-border/40 mx-1">·</span>
        {CHANGE_TYPES.map(ct => (
          <Pill key={ct.value} active={changeType === ct.value} onClick={() => toggle('changeType', ct.value)}>{ct.label}</Pill>
        ))}
        <span className="text-border/40 mx-1">·</span>
        <Pill active={hasDemo} onClick={() => set('hasDemo', hasDemo ? '' : 'true')}>Has demo</Pill>
      </div>

      {/* Framework groups */}
      {groups.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mr-1 shrink-0">Framework</span>
          {groups.map(g => (
            <Pill key={g} active={framework === g} onClick={() => toggle('framework', g)}>{g}</Pill>
          ))}
        </div>
      )}

      {/* Active filter summary + clear */}
      {hasFilters && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {[
              category,
              changeType,
              framework,
              hasDemo && 'has demo',
              q && `"${q}"`,
            ].filter(Boolean).join(' · ')}
          </span>
          <button
            onClick={() => router.push('/features')}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
