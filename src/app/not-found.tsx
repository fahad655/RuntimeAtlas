import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-sm font-mono text-muted-foreground mb-4">404</p>
      <h1 className="text-3xl font-bold mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-8">This capability may have been moved or doesn&apos;t exist yet.</p>
      <Link
        href="/features"
        className="inline-flex items-center rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium px-5 py-2.5 text-sm transition-colors"
      >
        Browse features
      </Link>
    </div>
  )
}
