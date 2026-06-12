'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (!value || value === 'All') next.delete(key)
    else next.set(key, value)
    router.push(`/features?${next.toString()}`)
  }

  const categoryValue = params.get('category') ?? 'All'
  const sortValue = params.get('sort') ?? 'rank'

  return (
    <div className="flex flex-wrap gap-3 items-center mb-6">
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
          checked={params.get('hasDemo') === 'true'}
          onChange={e => set('hasDemo', e.target.checked ? 'true' : '')}
          className="rounded border-border h-4 w-4 accent-violet-500"
        />
        Has demo
      </label>
    </div>
  )
}
