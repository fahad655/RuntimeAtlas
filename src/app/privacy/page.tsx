import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'RuntimeAtlas privacy policy — what data we collect, how we use it, and how to delete it.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-16 animate-page-enter">
      <div className="mb-12">
        <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-4">Legal</p>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Effective date: 15 June 2026 · Last updated: 15 June 2026</p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-12" />

      <Section title="Overview">
        <p>
          RuntimeAtlas (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a reference tool for iOS developers. This policy explains what personal data we collect, why we collect it, and what your rights are. We do not sell your data. We do not run ads.
        </p>
      </Section>

      <Section title="Data we collect">
        <p><strong className="text-foreground">Account information</strong> — When you sign in, we use Clerk to handle authentication. Clerk collects your email address and, optionally, your name and profile picture. You may sign in via email/password or OAuth providers (e.g. Google, GitHub). Clerk's own privacy policy governs their data handling.</p>
        <p><strong className="text-foreground">Progress data</strong> — If you mark capabilities as done or build a learning streak, that data is stored in our database (Neon Postgres, hosted on AWS) and linked to your Clerk user ID. This is the data that powers your personal progress view.</p>
        <p><strong className="text-foreground">Capability requests</strong> — If you submit a capability request, we store the topic text and your user ID so we can process the request and prevent duplicates.</p>
        <p><strong className="text-foreground">Usage analytics</strong> — We use Google Analytics to understand how pages are used (page views, session length, traffic sources). This data is anonymous and aggregated. No personally identifiable information is sent to Google Analytics.</p>
        <p><strong className="text-foreground">Server logs</strong> — Vercel (our hosting provider) may retain standard HTTP request logs (IP address, user agent, timestamp) for a limited period for security and reliability purposes.</p>
      </Section>

      <Section title="What we don't collect">
        <p>We do not collect payment information. We do not track your activity across other websites. We do not use advertising trackers or sell data to third parties.</p>
      </Section>

      <Section title="How we use your data">
        <p>Account and progress data is used solely to provide the core product — your streak, your done list, your capability requests. We do not use it for marketing, profiling, or any purpose beyond the product itself.</p>
        <p>We may use aggregate, anonymised usage data (from Google Analytics) to decide which features to build next.</p>
      </Section>

      <Section title="Third-party services">
        <p>RuntimeAtlas relies on the following third-party services, each with their own privacy policies:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong className="text-foreground">Clerk</strong> — Authentication (clerk.com)</li>
          <li><strong className="text-foreground">Neon</strong> — Database hosting (neon.tech)</li>
          <li><strong className="text-foreground">Vercel</strong> — Application hosting (vercel.com)</li>
          <li><strong className="text-foreground">Google Analytics</strong> — Anonymous usage analytics (google.com/analytics)</li>
          <li><strong className="text-foreground">Anthropic</strong> — AI classification of capability content (anthropic.com). No user-identifiable data is sent to Anthropic — only Apple documentation text.</li>
        </ul>
      </Section>

      <Section title="Data retention">
        <p>Your account and progress data is retained for as long as your account is active. If you delete your account via Clerk, your progress data is deleted from our database within 30 days.</p>
        <p>Google Analytics data is retained per Google's standard retention settings (default 14 months).</p>
      </Section>

      <Section title="Your rights">
        <p>You may request a copy of, correction of, or deletion of your personal data at any time. To do so, email us at the address below or delete your account directly via your profile settings.</p>
        <p>If you are in the European Economic Area (EEA) or UK, you have additional rights under GDPR/UK GDPR, including the right to data portability and the right to lodge a complaint with your local supervisory authority.</p>
      </Section>

      <Section title="Cookies">
        <p>We use strictly necessary cookies for authentication (session management via Clerk). We use Google Analytics cookies to measure anonymous usage. No advertising cookies are used.</p>
        <p>You can disable cookies in your browser settings. Disabling Clerk session cookies will prevent you from signing in.</p>
      </Section>

      <Section title="Changes to this policy">
        <p>We may update this policy occasionally. When we do, we will update the &quot;Last updated&quot; date at the top of the page. Continued use of RuntimeAtlas after changes are posted constitutes acceptance of the revised policy.</p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about this policy?{' '}
          <a
            href="mailto:fahad655@gmail.com"
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            fahad655@gmail.com
          </a>
        </p>
      </Section>
    </div>
  )
}
