import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { Navbar } from '@/components/layout/Navbar'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Toaster } from '@/components/ui/sonner'
import { FeedbackButton } from '@/components/layout/FeedbackButton'
import Script from 'next/script'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'RuntimeAtlas', template: '%s — RuntimeAtlas' },
  description: 'Every new iOS SDK capability, turned into a tiny demo you can actually use.',
  openGraph: {
    title: 'RuntimeAtlas',
    description: 'Every new iOS SDK capability, turned into a tiny demo you can actually use.',
    type: 'website',
  },
}

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const inner = (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased">
        {/* Google Analytics */}
        {GA_ID && <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script
            id="ga-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: `
              window.dataLayer=window.dataLayer||[];
              window.gtag=function(){window.dataLayer.push(arguments);};
              window.gtag('js',new Date());
              window.gtag('config','${GA_ID}');
            ` }}
          />
        </>}
        {/* Tally feedback widget */}
        <Script src="https://tally.so/widgets/embed.js" strategy="lazyOnload" />

        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Navbar />
          <main className="pt-16"><PageWrapper>{children}</PageWrapper></main>
          <Toaster richColors position="bottom-right" />
          <FeedbackButton />
        </ThemeProvider>
      </body>
    </html>
  )

  return hasClerk ? <ClerkProvider>{inner}</ClerkProvider> : inner
}
