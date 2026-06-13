'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './ThemeToggle'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { StreakWidget } from '@/components/user/StreakWidget'
import { Button } from '@/components/ui/button'

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

const PUBLIC_NAV = [
  { href: '/features', label: 'Features' },
  { href: '/demos', label: 'Demos' },
]

function AuthSection() {
  const { isSignedIn, isLoaded } = useUser()

  if (!isLoaded) return <div className="w-20" />

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <StreakWidget />
        <Link
          href="/home"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          My Progress
        </Link>
        <UserButton />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <SignInButton mode="modal">
        <Button variant="ghost" size="sm" className="text-sm">Sign in</Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button size="sm" className="text-sm bg-violet-600 hover:bg-violet-500 text-white">Sign up</Button>
      </SignUpButton>
    </div>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setIsAdmin(localStorage.getItem('ra-admin') === '1')
  }, [pathname]) // re-check whenever route changes (covers login/logout)

  const navItems = isAdmin
    ? [...PUBLIC_NAV, { href: '/engine', label: 'Engine' }]
    : PUBLIC_NAV

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="font-bold text-base tracking-tight">RuntimeAtlas</span>
          <span className="hidden sm:inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-400">
            iOS 27
          </span>
        </Link>

        <div className="flex items-center gap-0.5">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                pathname?.startsWith(item.href)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="ml-2 pl-2 border-l border-border/40 flex items-center gap-2">
            <ThemeToggle />
            {hasClerk && <AuthSection />}
          </div>
        </div>
      </div>
    </nav>
  )
}
