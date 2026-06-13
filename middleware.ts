import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { type NextFetchEvent, type NextRequest, NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/home(.*)'])

// clerkMiddleware() factory runs at import time without validating keys.
// Key validation only happens when the returned handler is invoked.
const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (!process.env.CLERK_SECRET_KEY) return NextResponse.next()
  return clerkHandler(req, event)
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
