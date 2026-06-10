import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const KEY_LEN = 64

/** scrypt hash stored as `salt:hex` — for CLI seed/passwd (auth wiring later). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, KEY_LEN).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, expected] = stored.split(':')
  if (!salt || !expected) return false
  const actual = scryptSync(password, salt, KEY_LEN).toString('hex')
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(actual, 'hex'))
  } catch {
    return false
  }
}
