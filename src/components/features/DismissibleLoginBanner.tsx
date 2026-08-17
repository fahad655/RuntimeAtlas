'use client'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { LoginGate } from '@/components/features/LoginGate'

interface Props {
  storageKey: string
  title: string
  description: string
}

/** Non-blocking sign-in nudge. Content around it is always public — this is
 *  purely a soft CTA that the visitor can permanently dismiss. */
export function DismissibleLoginBanner({ storageKey, title, description }: Props) {
  const { isSignedIn, isLoaded } = useUser()
  const [dismissed, setDismissed] = useState(true) // default hidden until we check localStorage, avoids flash

  useEffect(() => {
    setDismissed(localStorage.getItem(storageKey) === '1')
  }, [storageKey])

  if (!isLoaded || isSignedIn || dismissed) return null

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(storageKey, '1')
          setDismissed(true)
        }}
        aria-label="Dismiss"
        className="absolute right-3 top-3 z-10 rounded-full p-1 text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.06] transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      <LoginGate title={title} description={description} variant="banner" />
    </div>
  )
}
