import { randomBytes, createHash } from 'crypto'

const PREFIX = 'sc_live_'

/** Generates a new raw token. Only ever held in memory / shown to the user once. */
export function generateMcpToken(): string {
  return PREFIX + randomBytes(24).toString('hex')
}

export function hashMcpToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}

export function maskMcpToken(rawToken: string): string {
  return `${PREFIX}${'•'.repeat(8)}${rawToken.slice(-4)}`
}
