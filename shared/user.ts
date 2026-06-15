/** Firestore document shape for `users` collection (auth wiring comes later). */
export interface FirestoreUser {
  email: string
  nome: string
  perfil: 'admin' | 'user'
  empresaId: string
  enabled: boolean
  /** scrypt hash (`salt:hex`) — set via `task db:users:passwd` */
  passwordHash?: string
  createdAt: string
  updatedAt: string
}

export const USERS_COLLECTION = 'users'

export function emailToDocId(email: string): string {
  return email.trim().toLowerCase()
}
