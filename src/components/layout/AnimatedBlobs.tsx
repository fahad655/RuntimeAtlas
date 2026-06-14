'use client'
import { useEffect, useRef } from 'react'

interface BlobConfig {
  xAmp: number
  yAmp: number
  scaleAmp: number
  opacityMin: number
  opacityMax: number
  period: number     // ms for one full cycle
  xOffset: number   // phase offset in ms
  yOffset: number
}

const BLOBS: BlobConfig[] = [
  { xAmp: 220, yAmp: 140, scaleAmp: 0.14, opacityMin: 0.08, opacityMax: 0.24, period: 20000, xOffset: 0,     yOffset: 3000 },
  { xAmp: 160, yAmp: 180, scaleAmp: 0.18, opacityMin: 0.05, opacityMax: 0.16, period: 26000, xOffset: 8000,  yOffset: 0    },
  { xAmp: 80,  yAmp: 60,  scaleAmp: 0.28, opacityMin: 0.03, opacityMax: 0.11, period: 16000, xOffset: 4000,  yOffset: 7000 },
]

export function AnimatedBlobs() {
  const refs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ]

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const start = performance.now()
    let id: number

    function tick(now: number) {
      const t = now - start
      BLOBS.forEach((cfg, i) => {
        const el = refs[i].current
        if (!el) return
        const TAU = Math.PI * 2
        const x  = Math.sin((t + cfg.xOffset) / cfg.period * TAU) * cfg.xAmp
        const y  = Math.sin((t + cfg.yOffset) / cfg.period * TAU * 1.31) * cfg.yAmp
        const sc = 1 + Math.sin((t + cfg.xOffset) / cfg.period * TAU * 0.71) * cfg.scaleAmp
        const op = cfg.opacityMin + (cfg.opacityMax - cfg.opacityMin) *
                   (0.5 + 0.5 * Math.sin((t + cfg.yOffset) / cfg.period * TAU * 0.53))
        el.style.transform = `translate(${x}px,${y}px) scale(${sc})`
        el.style.opacity   = op.toFixed(3)
      })
      id = requestAnimationFrame(tick)
    }

    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* blob 1 – upper-right violet */}
      <div
        ref={refs[0]}
        className="absolute top-[8%] right-[4%] w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, #7C3AED 0%, transparent 65%)',
          filter: 'blur(120px)',
          willChange: 'transform, opacity',
        }}
      />
      {/* blob 2 – lower-left indigo */}
      <div
        ref={refs[1]}
        className="absolute bottom-[4%] left-[2%] w-[650px] h-[650px] rounded-full"
        style={{
          background: 'radial-gradient(circle, #4338CA 0%, transparent 65%)',
          filter: 'blur(110px)',
          willChange: 'transform, opacity',
        }}
      />
      {/* blob 3 – center purple (large, very soft) */}
      <div
        ref={refs[2]}
        className="absolute top-[30%] left-[25%] w-[1000px] h-[700px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse, #6D28D9 0%, transparent 55%)',
          filter: 'blur(150px)',
          willChange: 'transform, opacity',
        }}
      />
    </div>
  )
}
