import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for RuntimeAtlas.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-16 animate-page-enter">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-12">Effective date: 15 June 2026</p>

      <Section title="1. Acceptance">
        <p>
          By accessing or using RuntimeAtlas ("the Service") at runtimeatlas.tech, you agree to be
          bound by these Terms of Service. If you do not agree, please do not use the Service.
        </p>
      </Section>

      <Section title="2. What RuntimeAtlas is">
        <p>
          RuntimeAtlas is an independent iOS SDK reference tool that aggregates and summarises
          capability information from publicly available Apple developer documentation and WWDC
          sessions. It is not affiliated with, endorsed by, or sponsored by Apple Inc.
        </p>
        <p>
          All Apple product names, trademarks, and documentation are the property of Apple Inc.
          Swift and Xcode are trademarks of Apple Inc.
        </p>
      </Section>

      <Section title="3. Use of the Service">
        <p>You agree to use the Service only for lawful purposes. You must not:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Scrape or bulk-download content from the Service in an automated manner</li>
          <li>Attempt to reverse-engineer, disrupt, or overload the Service</li>
          <li>Use the Service to distribute spam or malicious content</li>
          <li>Misrepresent yourself or your affiliation with any person or organisation</li>
        </ul>
      </Section>

      <Section title="4. User accounts">
        <p>
          Account authentication is handled by Clerk. By creating an account you also agree to
          Clerk's Terms of Service. Your progress data (capabilities you have marked as read) is
          stored and associated with your account.
        </p>
        <p>
          You may delete your account at any time by contacting us at{' '}
          <a href="mailto:fahad655@gmail.com" className="text-violet-400 hover:text-violet-300 transition-colors">
            fahad655@gmail.com
          </a>
          . We will delete your data within 30 days.
        </p>
      </Section>

      <Section title="5. Content accuracy">
        <p>
          Capability summaries and Swift code snippets on RuntimeAtlas are generated with the
          assistance of AI and reviewed before publication. We make reasonable efforts to ensure
          accuracy but cannot guarantee that all content is error-free, complete, or up to date.
        </p>
        <p>
          Always refer to{' '}
          <a
            href="https://developer.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            Apple's official developer documentation
          </a>{' '}
          before shipping production code.
        </p>
      </Section>

      <Section title="6. Intellectual property">
        <p>
          The RuntimeAtlas name, logo, design, and original written content are owned by the
          creator. Summaries derived from Apple documentation are produced under fair use for
          educational and informational purposes.
        </p>
        <p>
          Swift code examples published on RuntimeAtlas are provided for educational use. You may
          use them freely in your own projects.
        </p>
      </Section>

      <Section title="7. Disclaimer of warranties">
        <p>
          The Service is provided "as is" without warranties of any kind, express or implied. We do
          not warrant that the Service will be uninterrupted, error-free, or that defects will be
          corrected.
        </p>
      </Section>

      <Section title="8. Limitation of liability">
        <p>
          To the fullest extent permitted by law, RuntimeAtlas and its creator shall not be liable
          for any indirect, incidental, special, or consequential damages arising from your use of
          the Service, even if advised of the possibility of such damages.
        </p>
      </Section>

      <Section title="9. Changes to these terms">
        <p>
          We may update these Terms from time to time. When we do, we will update the effective date
          above. Continued use of the Service after changes constitutes acceptance of the revised
          Terms.
        </p>
      </Section>

      <Section title="10. Governing law">
        <p>
          These Terms are governed by the laws of the jurisdiction in which the creator is
          established, without regard to conflict of law principles.
        </p>
      </Section>

      <Section title="11. Contact">
        <p>
          Questions about these Terms?{' '}
          <a href="mailto:fahad655@gmail.com" className="text-violet-400 hover:text-violet-300 transition-colors">
            fahad655@gmail.com
          </a>
        </p>
      </Section>

      <div className="pt-6 border-t border-white/[0.05] flex gap-4 text-xs text-muted-foreground">
        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
        <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
      </div>
    </div>
  )
}
