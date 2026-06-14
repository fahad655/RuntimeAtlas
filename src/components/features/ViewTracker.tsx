'use client'
import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`/api/capabilities/${slug}/view`, { method: 'POST' }).catch(() => {})
    trackEvent('capability_view', { slug })
  }, [slug])
  return null
}
