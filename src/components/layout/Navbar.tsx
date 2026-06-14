'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { StreakWidget } from '@/components/user/StreakWidget'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { Menu, X } from 'lucide-react'

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

const PUBLIC_NAV = [
  { href: '/features', label: 'Capabilities' },
  { href: '/demos', label: 'Demos' },
  { href: '/mcp', label: 'MCP' },
]

function AuthSection() {
  const { isSignedIn, isLoaded } = useUser()
  if (!isLoaded) return <div className="w-20" />
  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <StreakWidget />
        <Link href="/home" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150">
          My Progress
        </Link>
        <UserButton />
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2">
      <SignInButton mode="modal">
        <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button size="sm" className="text-sm bg-violet-600 hover:bg-violet-500 text-white border-0 shadow-lg shadow-violet-900/30">Sign up</Button>
      </SignUpButton>
    </div>
  )
}

function MobileAuth({ onClose }: { onClose: () => void }) {
  const { isSignedIn, isLoaded } = useUser()
  if (!isLoaded) return null
  if (isSignedIn) {
    return (
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3">
          <StreakWidget />
          <Link
            href="/home"
            onClick={onClose}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            My Progress
          </Link>
        </div>
        <UserButton />
      </div>
    )
  }
  return (
    <div className="flex gap-2 pt-4 border-t border-white/[0.06]">
      <SignInButton mode="modal">
        <Button variant="ghost" size="sm" className="flex-1 text-sm text-muted-foreground">Sign in</Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button size="sm" className="flex-1 text-sm bg-violet-600 hover:bg-violet-500 text-white border-0">Sign up</Button>
      </SignUpButton>
    </div>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setIsAdmin(localStorage.getItem('ra-admin') === '1')
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const navItems = isAdmin
    ? [...PUBLIC_NAV, { href: '/engine', label: 'Engine' }]
    : PUBLIC_NAV

  return (
    <nav className={cn(
      'fixed top-0 inset-x-0 z-50 transition-all duration-300',
      scrolled || mobileOpen
        ? 'bg-background/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_1px_0_0_rgba(255,255,255,0.04)]'
        : 'bg-transparent border-b border-transparent',
    )}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex h-16 items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMobileOpen(false)}>
          <span className="font-bold text-[15px] tracking-tight text-foreground">RuntimeAtlas</span>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-400 tracking-wide uppercase">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500" />
            </span>
            iOS 27
          </span>
        </Link>

        {/* Desktop nav links — hidden below md */}
        <div className="hidden md:flex items-center gap-0.5 mr-3">
          {navItems.map(item => {
            const active = pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-white/[0.09] text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05]',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle — always visible */}
          <div className="hidden md:flex">
            <ThemeToggle />
          </div>
          {/* Desktop auth */}
          <div className="hidden md:flex">
            {hasClerk && <AuthSection />}
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen
              ? <X className="h-5 w-5" />
              : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-background/95 backdrop-blur-xl px-5 pt-4 pb-6 space-y-1">
          {navItems.map(item => {
            const active = pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-white/[0.09] text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05]',
                )}
              >
                {item.label}
              </Link>
            )
          })}
          {hasClerk && <MobileAuth onClose={() => setMobileOpen(false)} />}
          <div className="flex items-center gap-2 pt-4 border-t border-white/[0.06]">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </nav>
  )
}
