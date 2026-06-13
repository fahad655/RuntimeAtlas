'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIES = ['All', 'AI', 'UI', 'Performance', 'Safety', 'Store', 'System']
const SORT_OPTIONS = [
  { value: 'rank',     label: 'Most Relevant' },
  { value: 'trending', label: 'Trending' },
  { value: 'impact',   label: 'Most Impactful' },
  { value: 'newest',   label: 'Newest First' },
]

export function FilterBar() {
  const router = useRouter()
  const params = useSearchParams()
  const [frameworks, setFrameworks] = useState<string[]>([])
  const [searchDraft, setSearchDraft] = useState(params.get('q') ?? '')

  useEffect(() => {
    fetch('/api/frameworks')
      .then(r => r.json())
      .then((d: { frameworks: string[] }) => setFrameworks(d.frameworks))
      .catch(() => {})
  }, [])

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (!value || value === 'All') next.delete(key)
    else next.set(key, value)
    router.push(`/features?${next.toString()}`)
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    set('q', searchDraft.trim())
  }

  function clearSearch() {
    setSearchDraft('')
    set('q', '')
  }

  const categoryValue  = params.get('category') ?? 'All'
  const sortValue      = params.get('sort') ?? 'rank'
  const frameworkValue = params.get('framework') ?? ''
  const hasDemo        = params.get('hasDemo') === 'true'
  const q              = params.get('q') ?? ''

  return (
    <div className="space-y-3 mb-6">
      {/* Row 1: search */}
      <form onSubmit={submitSearch} className="relative">
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

      {/* Row 2: dropdowns + hasDemo */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={categoryValue} onValueChange={v => set('category', v ?? '')}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={sortValue} onValueChange={v => set('sort', v ?? 'rank')}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hasDemo}
            onChange={e => set('hasDemo', e.target.checked ? 'true' : '')}
            className="rounded border-border h-4 w-4 accent-violet-500"
          />
          Has demo
        </label>

        {q && (
          <span className="text-xs text-muted-foreground">
            Results for <span className="text-foreground font-medium">"{q}"</span>
          </span>
        )}
      </div>

      {/* Row 3: framework pills */}
      {frameworks.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => set('framework', '')}
            className={cn(
              'text-xs px-2.5 py-1 rounded-full border transition-colors',
              !frameworkValue
                ? 'bg-violet-600 border-violet-600 text-white'
                : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground',
            )}
          >
            All frameworks
          </button>
          {frameworks.map(fw => (
            <button
              key={fw}
              onClick={() => set('framework', fw === frameworkValue ? '' : fw)}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full border font-mono transition-colors',
                fw === frameworkValue
                  ? 'bg-violet-600 border-violet-600 text-white'
                  : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground',
              )}
            >
              {fw}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
