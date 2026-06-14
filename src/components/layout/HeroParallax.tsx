'use client'
import { useEffect, useRef } from 'react'

/**
 * Wraps the hero text content. Translates UP slightly faster than scroll
 * and fades out as the user scrolls away — classic depth-of-field parallax.
 */
export function ParallaxContent({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = ref.current
    if (!el) return

    let id: number
    function onScroll() {
      id = requestAnimationFrame(() => {
        if (!el) return
        const y = window.scrollY
        // text drifts up 28% of scroll speed — noticeable depth
        el.style.transform = `translateY(${-y * 0.28}px)`
        // fades out over 700px of scroll
        el.style.opacity = String(Math.max(0, 1 - y / 700))
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(id) }
  }, [])

  return (
    <div ref={ref} style={{ willChange: 'transform, opacity' }}>
      {children}
    </div>
  )
}
