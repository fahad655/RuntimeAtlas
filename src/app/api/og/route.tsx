import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  AI:          { bg: '#3b1d6e', text: '#c084fc' },
  UI:          { bg: '#1d3a6e', text: '#60a5fa' },
  Performance: { bg: '#1d4a2e', text: '#4ade80' },
  Safety:      { bg: '#4a2e1d', text: '#fb923c' },
  Store:       { bg: '#1d4a4a', text: '#2dd4bf' },
  System:      { bg: '#2e2e2e', text: '#9ca3af' },
}

const CHANGE_LABELS: Record<string, string> = {
  new:        '✦ New in iOS 27',
  updated:    '↑ Updated in iOS 27',
  deprecated: '✕ Deprecated',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name       = searchParams.get('name') ?? 'SwiftChronicle'
  const summary    = searchParams.get('summary') ?? ''
  const category   = searchParams.get('category') ?? 'AI'
  const impact     = parseInt(searchParams.get('impact') ?? '3')
  const changeType = searchParams.get('changeType') ?? 'new'

  const cat = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.AI
  const changeLabel = CHANGE_LABELS[changeType] ?? CHANGE_LABELS.new

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px', height: '630px',
          background: '#0a0a0f',
          display: 'flex', flexDirection: 'column',
          padding: '64px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#ffffff', fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px' }}>
              SwiftChronicle
            </span>
            <span style={{ background: '#1a1a2e', border: '1px solid #7c3aed44', color: '#a78bfa', fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '999px' }}>
              iOS 27
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: i <= impact ? '#7c3aed' : '#1f1f2e' }} />
            ))}
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
          <span style={{ background: cat.bg, color: cat.text, fontSize: '14px', fontWeight: '600', padding: '6px 14px', borderRadius: '8px' }}>
            {category}
          </span>
          <span style={{ background: changeType === 'new' ? '#0d2b1d' : '#2b1d0d', color: changeType === 'new' ? '#4ade80' : '#fb923c', fontSize: '14px', fontWeight: '500', padding: '6px 14px', borderRadius: '8px' }}>
            {changeLabel}
          </span>
        </div>

        {/* Name */}
        <div style={{ color: '#ffffff', fontSize: name.length > 40 ? '42px' : '52px', fontWeight: '800', lineHeight: '1.1', letterSpacing: '-1px', marginBottom: '20px', flex: '0 0 auto' }}>
          {name}
        </div>

        {/* Summary */}
        <div style={{ color: '#6b7280', fontSize: '20px', lineHeight: '1.5', flex: '1', overflow: 'hidden', display: 'flex', alignItems: 'flex-start' }}>
          {summary.length > 140 ? summary.slice(0, 140) + '…' : summary}
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
          <span style={{ color: '#374151', fontSize: '14px' }}>swiftchronicle.com</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
