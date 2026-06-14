'use client'
import { useEffect, useRef } from 'react'

interface BlobConfig {
  xAmp: number
  yAmp: number
  scaleAmp: number
  opacityMin: number
  opacityMax: number
  period: number
  xOffset: number
  yOffset: number
}

const BLOBS: BlobConfig[] = [
  { xAmp: 240, yAmp: 160, scaleAmp: 0.12, opacityMin: 0.30, opacityMax: 0.60, period: 18000, xOffset: 0,     yOffset: 3000 },
  { xAmp: 180, yAmp: 200, scaleAmp: 0.16, opacityMin: 0.22, opacityMax: 0.50, period: 24000, xOffset: 8000,  yOffset: 0    },
  { xAmp: 100, yAmp: 80,  scaleAmp: 0.22, opacityMin: 0.15, opacityMax: 0.38, period: 15000, xOffset: 4000,  yOffset: 7000 },
  { xAmp: 160, yAmp: 130, scaleAmp: 0.20, opacityMin: 0.12, opacityMax: 0.30, period: 21000, xOffset: 12000, yOffset: 5000 },
]

export function AnimatedBlobs() {
  const refs = [
    useRef<HTMLDivElement>(null),
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
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* blob 1 – upper-right violet */}
      <div
        ref={refs[0]}
        className="absolute -top-[5%] right-[-2%] w-[900px] h-[900px] rounded-full"
        style={{
          background: 'radial-gradient(circle, #7C3AED 0%, #6D28D9 30%, transparent 65%)',
          filter: 'blur(90px)',
          willChange: 'transform, opacity',
        }}
      />
      {/* blob 2 – lower-left indigo */}
      <div
        ref={refs[1]}
        className="absolute bottom-[-5%] left-[-5%] w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, #4338CA 0%, #3730A3 30%, transparent 65%)',
          filter: 'blur(80px)',
          willChange: 'transform, opacity',
        }}
      />
      {/* blob 3 – center purple (large, atmospheric) */}
      <div
        ref={refs[2]}
        className="absolute top-[15%] left-[15%] w-[1200px] h-[900px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse, #5B21B6 0%, transparent 60%)',
          filter: 'blur(130px)',
          willChange: 'transform, opacity',
        }}
      />
      {/* blob 4 – accent teal/cyan upper-left */}
      <div
        ref={refs[3]}
        className="absolute top-[5%] left-[5%] w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, #0EA5E9 0%, #0284C7 30%, transparent 65%)',
          filter: 'blur(110px)',
          willChange: 'transform, opacity',
        }}
      />
    </div>
  )
}
