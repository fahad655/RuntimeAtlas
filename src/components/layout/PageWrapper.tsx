'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Skip if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.animate(
      [
        { opacity: '0', transform: 'translateY(14px) scale(0.985)' },
        { opacity: '1', transform: 'translateY(0) scale(1)' },
      ],
      { duration: 380, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' },
    )
  }, [pathname])

  return <div ref={ref}>{children}</div>
}
