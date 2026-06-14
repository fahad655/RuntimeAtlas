export default function CapabilityLoading() {
  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-12 animate-pulse">
      {/* Back */}
      <div className="h-4 w-24 bg-white/[0.06] rounded-full mb-10" />

      {/* Badges */}
      <div className="flex gap-2 mb-5">
        <div className="h-5 w-16 bg-white/[0.06] rounded-full" />
        <div className="h-5 w-12 bg-white/[0.06] rounded-full" />
      </div>

      {/* Title */}
      <div className="h-8 w-3/4 bg-white/[0.08] rounded-xl mb-3" />
      <div className="h-8 w-1/2 bg-white/[0.06] rounded-xl mb-8" />

      {/* Summary */}
      <div className="space-y-2 mb-10">
        <div className="h-4 w-full bg-white/[0.05] rounded" />
        <div className="h-4 w-5/6 bg-white/[0.05] rounded" />
        <div className="h-4 w-4/6 bg-white/[0.05] rounded" />
      </div>

      {/* Code block */}
      <div className="h-48 w-full bg-white/[0.04] rounded-2xl border border-white/[0.06]" />
    </div>
  )
}
