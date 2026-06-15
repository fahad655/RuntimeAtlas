import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Zap, Code2, TrendingUp, CheckCircle, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Launching on Product Hunt',
  description: 'RuntimeAtlas — the fastest way for iOS developers to track and implement every new API from WWDC 2026.',
  openGraph: {
    title: 'RuntimeAtlas is launching on Product Hunt',
    description: 'Every iOS 27 API. Real Swift code. Before/after diffs. Track your progress.',
  },
}

export default function LaunchPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-16 animate-page-enter">

      {/* PH badge area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
        <div>
          <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-2">🚀 We&apos;re launching</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            RuntimeAtlas<br />
            <span className="text-muted-foreground font-normal text-3xl">on Product Hunt</span>
          </h1>
        </div>
        <a
          href="https://www.producthunt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#FF6154] hover:bg-[#ff4f3f] text-white font-semibold px-5 py-3 text-sm transition-all active:scale-[0.97]"
        >
          <ExternalLink className="h-4 w-4" />
          Upvote on Product Hunt
        </a>
      </div>

      {/* Tagline */}
      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-8 mb-12">
        <p className="text-2xl font-bold leading-snug mb-3">
          Apple ships 250+ new APIs at WWDC.<br />
          Most developers miss 80% of them.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          RuntimeAtlas ingests every WWDC session and Apple doc the moment they drop — turning them into scannable capability cards with real Swift code, before/after diffs for updated APIs, and a progress tracker so you know exactly what you&apos;ve shipped.
        </p>
      </div>

      {/* What you get */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-6">What you get</h2>
        <div className="space-y-4">
          {[
            {
              icon: <Zap className="h-5 w-5 text-violet-400" />,
              title: 'Live capability feed',
              desc: 'Every new API, framework change, and deprecation from WWDC 2026 — ingested automatically and classified by impact.',
            },
            {
              icon: <Code2 className="h-5 w-5 text-emerald-400" />,
              title: 'Real Swift code, not pseudocode',
              desc: 'Every card ships with a compilable Swift/SwiftUI snippet you can drop straight into Xcode. For updated APIs, a syntax-highlighted diff shows exactly what changed from iOS 26.',
            },
            {
              icon: <TrendingUp className="h-5 w-5 text-pink-400" />,
              title: 'Personal progress tracking',
              desc: 'Mark capabilities as done, build a daily learning streak, and track your real implementation coverage — not just "things you vaguely watched at WWDC."',
            },
            {
              icon: <CheckCircle className="h-5 w-5 text-blue-400" />,
              title: 'Curated, not firehosed',
              desc: 'Every capability is reviewed before publishing. Spam, duplicates, and pre-existing APIs get filtered out so the feed stays signal-only.',
            },
          ].map(item => (
            <div key={item.title} className="flex gap-4 p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.07] flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Numbers */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-6">By the numbers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { stat: '114', label: 'WWDC 2026 sessions tracked' },
            { stat: '40+', label: 'Frameworks covered' },
            { stat: '5 min', label: 'From WWDC drop to card' },
            { stat: '100%', label: 'Real Swift code, no pseudocode' },
            { stat: 'Free', label: 'No paywall, no waitlist' },
            { stat: 'Open', label: 'Capability requests welcome' },
          ].map(item => (
            <div key={item.stat} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div className="text-2xl font-bold tabular-nums">{item.stat}</div>
              <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Maker comment */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Hey, I&apos;m the maker 👋</h2>
        <div className="p-5 rounded-xl border border-white/[0.07] bg-white/[0.02] space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            I built RuntimeAtlas because I kept missing new iOS APIs until I stumbled on them six months after WWDC. The keynote covers maybe 10% of what actually shipped. The rest is buried across 100+ session videos and thousands of doc pages.
          </p>
          <p>
            RuntimeAtlas fixes that by auto-ingesting every session and turning it into something you can actually scan in 60 seconds per card. If a session introduces a new API, you get the summary, the Swift code, and a before/after diff — without watching the whole video.
          </p>
          <p>
            It&apos;s free, it&apos;s live today with WWDC 2026 content, and it will keep updating as Apple drops documentation through the beta cycle.
          </p>
          <p className="text-foreground font-medium">— Fahad</p>
        </div>
      </section>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/features"
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold px-7 py-3 text-sm transition-all duration-200 shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] active:scale-[0.97]"
        >
          Browse capabilities
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <a
          href="https://www.producthunt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF6154] hover:bg-[#ff4f3f] text-white font-semibold px-7 py-3 text-sm transition-all active:scale-[0.97]"
        >
          <ExternalLink className="h-4 w-4" />
          Upvote on Product Hunt
        </a>
      </div>
    </div>
  )
}
