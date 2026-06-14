'use client'
import { MessageSquarePlus } from 'lucide-react'

const FEEDBACK_ID = process.env.NEXT_PUBLIC_TALLY_FEEDBACK_ID

export function FeedbackButton() {
  if (!FEEDBACK_ID) return null

  return (
    <button
      data-tally-open={FEEDBACK_ID}
      data-tally-layout="modal"
      data-tally-emoji-text="👋"
      data-tally-emoji-animation="wave"
      aria-label="Give feedback"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-white/[0.1] bg-background/90 backdrop-blur-xl px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-lg hover:text-foreground hover:border-white/[0.2] transition-all duration-150 active:scale-[0.97]"
    >
      <MessageSquarePlus className="h-3.5 w-3.5 shrink-0" />
      Feedback
    </button>
  )
}

// Used on capability detail pages to pre-fill the capability name
export function ReportIssueLink({ capabilityName }: { capabilityName: string }) {
  const REPORT_ID = process.env.NEXT_PUBLIC_TALLY_REPORT_ID
  if (!REPORT_ID) return null

  return (
    <button
      data-tally-open={REPORT_ID}
      data-tally-layout="modal"
      data-tally-hide-title="1"
      data-tally-custom-answer-1={capabilityName}
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      <MessageSquarePlus className="h-3 w-3" />
      Report an issue
    </button>
  )
}
