import Link from 'next/link'

const PRODUCT_LINKS = [
  { href: '/features', label: 'Capabilities' },
  { href: '/demos',    label: 'Demos' },
  { href: '/mcp',      label: 'MCP Server' },
  { href: '/blog',     label: 'Blog' },
  { href: '/launch',   label: 'What\'s New' },
]

const COMPANY_LINKS = [
  { href: '/about',   label: 'About' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms',   label: 'Terms' },
]

export function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-background mt-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-10">

          {/* Brand */}
          <div className="max-w-xs shrink-0">
            <span className="text-sm font-semibold text-foreground">SwiftChronicle</span>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Independent iOS SDK reference for WWDC 2026. Not affiliated with Apple.
            </p>
          </div>

          {/* Link groups */}
          <div className="flex gap-12 shrink-0">
            <div>
              <p className="text-xs font-semibold text-foreground mb-3 uppercase tracking-widest">Product</p>
              <nav className="flex flex-col gap-2.5">
                {PRODUCT_LINKS.map(l => (
                  <Link key={l.href} href={l.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-3 uppercase tracking-widest">Company</p>
              <nav className="flex flex-col gap-2.5">
                {COMPANY_LINKS.map(l => (
                  <Link key={l.href} href={l.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.04] text-xs text-muted-foreground">
          © {new Date().getFullYear()} SwiftChronicle. Not affiliated with Apple Inc.
        </div>
      </div>
    </footer>
  )
}
