interface Props {
  value: number
  max: number
  size: number
  strokeWidth: number
  trackClass?: string
  progressClass?: string
  children?: React.ReactNode
}

export function CircularRing({ value, max, size, strokeWidth, trackClass = 'text-muted/30', progressClass, children }: Props) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  const offset = circumference * (1 - pct)
  const cx = size / 2
  const cy = size / 2

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle cx={cx} cy={cy} r={radius} fill="none" strokeWidth={strokeWidth} className={trackClass} stroke="currentColor" />
        <circle
          cx={cx} cy={cy} r={radius} fill="none" strokeWidth={strokeWidth}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={progressClass}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}
