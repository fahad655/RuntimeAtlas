'use client'
import { useState } from 'react'
import { XIcon, Link2, Check } from 'lucide-react'

interface Props {
  name: string
  summary: string
  slug: string
}

const BASE_URL = 'https://runtimeatlas.com'

export function ShareButtons({ name, summary, slug }: Props) {
  const [copied, setCopied] = useState(false)

  const url = `${BASE_URL}/features/${slug}`
  const tweetText = `${name} just landed in iOS 27 — ${summary.slice(0, 100)}${summary.length > 100 ? '…' : ''}\n\n${url}\n\nvia @RuntimeAtlas #WWDC26 #iOS27 #iOSDev`

  function shareOnX() {
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
      '_blank',
      'noopener,noreferrer,width=550,height=420',
    )
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={shareOnX}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-white/[0.1] hover:border-white/[0.2] rounded-lg px-3 py-1.5 transition-all"
        aria-label="Share on X"
      >
        <XIcon className="h-3.5 w-3.5" />
        Share
      </button>
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-white/[0.1] hover:border-white/[0.2] rounded-lg px-3 py-1.5 transition-all"
        aria-label="Copy link"
      >
        {copied
          ? <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied</>
          : <><Link2 className="h-3.5 w-3.5" /> Copy link</>
        }
      </button>
    </div>
  )
}
