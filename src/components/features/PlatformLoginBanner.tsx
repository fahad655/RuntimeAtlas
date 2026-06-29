'use client'
import { useUser } from '@clerk/nextjs'
import { LoginGate } from '@/components/features/LoginGate'

export function PlatformLoginBanner() {
  const { isSignedIn, isLoaded } = useUser()
  if (!isLoaded || isSignedIn) return null
  return (
    <LoginGate
      variant="banner"
      title="Sign in to track your progress"
      description="Mark capabilities complete, build streaks, and access Swift code demos and gotchas — free to sign up."
    />
  )
}
