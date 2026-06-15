'use client'
import { useState } from 'react'
import { diffLines } from 'diff'
import { cn } from '@/lib/utils'
import { CopyButton } from './CopyButton'

interface Props {
  title: string
  description: string
  complexity: string
  changeType: string
  newCodeHtml: string | null
  oldCodeHtml: string | null
  rawNewCode: string | null
  rawOldCode: string | null
}

type Tab = 'diff' | 'new' | 'old'

export function DemoSection({
  title, description, complexity,
  changeType, newCodeHtml, oldCodeHtml, rawNewCode, rawOldCode,
}: Props) {
  const isUpdated = changeType === 'updated' && rawOldCode && rawNewCode
  const [tab, setTab] = useState<Tab>(isUpdated ? 'diff' : 'new')

  const tabs: { id: Tab; label: string }[] = [
    ...(isUpdated ? [
      { id: 'diff' as Tab, label: 'Diff' },
      { id: 'old' as Tab, label: 'Before (iOS 26)' },
    ] : []),
    { id: 'new' as Tab, label: isUpdated ? 'After (iOS 27)' : 'iOS 27' },
  ]

  const diff = isUpdated ? diffLines(rawOldCode!, rawNewCode!) : []

  return (
    <div className="rounded-xl overflow-hidden border border-[#3a3a3c] bg-[#282c34]">
      {/* Xcode-style title bar */}
      <div className="flex items-center gap-0 bg-[#21252b] border-b border-[#3a3a3c]">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-r border-[#3a3a3c] shrink-0">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <div className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>

        {/* Tabs */}
        <div className="flex items-end gap-0 px-2 pt-2 flex-1 min-w-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'px-4 py-1.5 text-xs font-medium rounded-t-md border border-b-0 transition-colors shrink-0',
                tab === t.id
                  ? 'bg-[#282c34] border-[#3a3a3c] text-white'
                  : 'bg-transparent border-transparent text-[#888] hover:text-[#bbb]',
              )}
            >
              {t.id === 'diff' && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-red-400 font-mono">-</span>
                  <span className="text-emerald-400 font-mono">+</span>
                  {t.label}
                </span>
              )}
              {t.id !== 'diff' && t.label}
            </button>
          ))}
        </div>

        {/* Filename + copy */}
        <div className="flex items-center gap-3 px-4 shrink-0">
          <span className="text-[11px] text-[#666] border border-[#3a3a3c] rounded px-1.5 py-0.5">
            {complexity}
          </span>
          {tab !== 'diff' && (
            <CopyButton code={tab === 'new' ? (rawNewCode ?? '') : (rawOldCode ?? '')} />
          )}
        </div>
      </div>

      {/* Description bar */}
      <div className="px-5 py-2.5 border-b border-[#2a2a2c] bg-[#1d2026]">
        <p className="text-xs text-[#888]">{description}</p>
      </div>

      {/* Content */}
      {tab === 'diff' && isUpdated && (
        <div className="overflow-x-auto">
          <pre className="text-xs font-mono leading-relaxed p-0 m-0 bg-transparent">
            {diff.map((change, i) => {
              const lines = change.value.split('\n')
              if (lines[lines.length - 1] === '') lines.pop()
              return lines.map((line, j) => (
                <div
                  key={`${i}-${j}`}
                  className={cn(
                    'flex gap-0 min-w-0 pl-0',
                    change.added && 'bg-[#0d2b1d]',
                    change.removed && 'bg-[#2b0d0d]',
                  )}
                >
                  <span className={cn(
                    'select-none w-8 shrink-0 text-center py-0.5 border-r border-[#2a2a2c] text-[11px]',
                    change.added ? 'bg-[#0a3d20] text-emerald-400' : change.removed ? 'bg-[#3d0a0a] text-red-400' : 'text-[#444]',
                  )}>
                    {change.added ? '+' : change.removed ? '−' : ' '}
                  </span>
                  <span className={cn(
                    'px-4 py-0.5 whitespace-pre',
                    change.added ? 'text-emerald-100' : change.removed ? 'text-red-200' : 'text-[#c7c7cc]',
                  )}>
                    {line}
                  </span>
                </div>
              ))
            })}
          </pre>
        </div>
      )}

      {tab === 'new' && newCodeHtml && (
        <div
          className="overflow-x-auto [&>pre]:!p-5 [&>pre]:!m-0 [&>pre]:!bg-transparent [&>pre]:text-xs [&>pre]:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: newCodeHtml }}
        />
      )}

      {tab === 'old' && oldCodeHtml && (
        <div
          className="overflow-x-auto [&>pre]:!p-5 [&>pre]:!m-0 [&>pre]:!bg-transparent [&>pre]:text-xs [&>pre]:leading-relaxed opacity-80"
          dangerouslySetInnerHTML={{ __html: oldCodeHtml }}
        />
      )}
    </div>
  )
}
