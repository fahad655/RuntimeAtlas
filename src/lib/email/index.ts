import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'RuntimeAtlas <hello@runtimeatlas.com>'
const BASE_URL = 'https://runtimeatlas.com'

export async function sendStreakReminder({
  to,
  firstName,
  streak,
}: {
  to: string
  firstName: string
  streak: number
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Your ${streak}-day streak is about to break 🔥`,
    html: streakReminderHtml({ firstName, streak }),
  })
}

export async function sendNewCapabilitiesBroadcast({
  to,
  count,
  capabilities,
}: {
  to: string
  count: number
  capabilities: { name: string; slug: string; summary: string }[]
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `${count} new iOS 27 ${count === 1 ? 'capability' : 'capabilities'} just dropped`,
    html: broadcastHtml({ count, capabilities }),
  })
}

function streakReminderHtml({ firstName, streak }: { firstName: string; streak: number }) {
  const caps = `${BASE_URL}/features`
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#0a0a0a;color:#e4e4e7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;padding:0 20px">
    <tr><td>
      <div style="background:#111113;border:1px solid #27272a;border-radius:16px;padding:32px">
        <div style="font-size:36px;margin-bottom:8px">🔥</div>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#fafafa">
          ${streak}-day streak — don't lose it, ${firstName}
        </h1>
        <p style="margin:0 0 24px;color:#a1a1aa;font-size:15px;line-height:1.6">
          You haven't marked any iOS 27 capabilities as done in the last 48 hours.
          Your streak resets at 72 hours — you still have time.
        </p>
        <a href="${caps}" style="display:inline-block;background:#7c3aed;color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:100px;text-decoration:none">
          Keep my streak →
        </a>
        <p style="margin:24px 0 0;color:#52525b;font-size:12px">
          You're getting this because you have an active streak on RuntimeAtlas.
          <a href="${BASE_URL}/home" style="color:#7c3aed">Manage notifications</a>
        </p>
      </div>
    </td></tr>
  </table>
</body>
</html>`
}

function broadcastHtml({ count, capabilities }: { count: number; capabilities: { name: string; slug: string; summary: string }[] }) {
  const capRows = capabilities.slice(0, 5).map(c => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #27272a">
        <a href="${BASE_URL}/features/${c.slug}" style="color:#a78bfa;font-size:14px;font-weight:600;text-decoration:none">${c.name}</a>
        <p style="margin:4px 0 0;color:#a1a1aa;font-size:13px;line-height:1.5">${c.summary}</p>
      </td>
    </tr>`).join('')

  const more = count > 5 ? `<p style="margin:16px 0 0;color:#71717a;font-size:13px">+ ${count - 5} more in the feed</p>` : ''

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#0a0a0a;color:#e4e4e7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;padding:0 20px">
    <tr><td>
      <div style="background:#111113;border:1px solid #27272a;border-radius:16px;padding:32px">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:0.1em">iOS 27 · WWDC 2026</p>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#fafafa">
          ${count} new ${count === 1 ? 'capability' : 'capabilities'} added
        </h1>
        <p style="margin:0 0 24px;color:#a1a1aa;font-size:15px;line-height:1.6">
          New iOS 27 APIs just landed in RuntimeAtlas with Swift code and implementation notes.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px">
          ${capRows}
        </table>
        ${more}
        <div style="margin-top:24px">
          <a href="${BASE_URL}/features" style="display:inline-block;background:#7c3aed;color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:100px;text-decoration:none">
            Browse all capabilities →
          </a>
        </div>
        <p style="margin:24px 0 0;color:#52525b;font-size:12px">
          You subscribed to RuntimeAtlas new API notifications.
          Reply to this email to unsubscribe.
        </p>
      </div>
    </td></tr>
  </table>
</body>
</html>`
}
