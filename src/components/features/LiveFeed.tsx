import { db } from '@/db'
import { ingestionEvents, capabilities } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import Link from 'next/link'

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export async function LiveFeed() {
  const items = await db.select({
    id: ingestionEvents.id,
    topicInput: ingestionEvents.topicInput,
    createdAt: ingestionEvents.createdAt,
    capabilityName: capabilities.name,
    capabilitySlug: capabilities.slug,
  })
    .from(ingestionEvents)
    .leftJoin(capabilities, eq(ingestionEvents.capabilityId, capabilities.id))
    .where(eq(ingestionEvents.status, 'classified'))
    .orderBy(desc(ingestionEvents.createdAt))
    .limit(10)

  if (!items.length) return null

  return (
    <div className="border-y border-white/[0.06] bg-white/[0.02] py-2.5 mb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center gap-4 overflow-x-auto scrollbar-none">
        <span className="shrink-0 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
          Live
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
        </div>
        {items.map((item, idx) => (
          <div key={item.id} className="shrink-0 flex items-center gap-2 text-sm">
            {idx > 0 && <span className="text-border/60 mr-1">·</span>}
            {item.capabilitySlug ? (
              <Link
                href={`/features/${item.capabilitySlug}`}
                className="text-foreground/80 hover:text-violet-400 transition-colors whitespace-nowrap"
              >
                {item.capabilityName ?? item.topicInput}
              </Link>
            ) : (
              <span className="text-muted-foreground whitespace-nowrap">{item.topicInput}</span>
            )}
            <span className="text-muted-foreground/60 text-xs whitespace-nowrap">
              {timeAgo(new Date(item.createdAt))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
