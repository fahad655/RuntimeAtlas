'use client'
import { useLayoutEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useLayoutEffect(() => {
    // Skip the very first mount — content is already visible from SSR
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    el.animate(
      [
        { opacity: '0', transform: 'translateY(16px) scale(0.982)' },
        { opacity: '1', transform: 'translateY(0px) scale(1)' },
      ],
      {
        duration: 400,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'backwards',
      },
    )
  }, [pathname])

  return <div ref={ref}>{children}</div>
}
