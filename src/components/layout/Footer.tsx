import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-background mt-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground">SwiftChronicle</span>
          <span className="text-muted-foreground/40 text-sm">·</span>
          <span className="text-xs text-muted-foreground">Independent iOS SDK reference. Not affiliated with Apple.</span>
        </div>
        <nav className="flex items-center gap-5">
          <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/terms"   className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
        </nav>
      </div>
    </footer>
  )
}
