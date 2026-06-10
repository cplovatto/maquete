import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

const DEFAULT_KEY_PATH = resolve(process.cwd(), 'firebase-service-account.json')

function resolveServiceAccountPath(): string {
  return process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : DEFAULT_KEY_PATH
}

function initAdminApp(): App {
  if (getApps().length) return getApps()[0]

  const keyPath = resolveServiceAccountPath()
  if (!existsSync(keyPath)) {
    console.error(`
Firestore admin scripts need a service account JSON file.

1. Firebase Console → Project Settings → Service accounts
2. Generate new private key → save as firebase-service-account.json (repo root)
   or set GOOGLE_APPLICATION_CREDENTIALS to its path.

This file is gitignored. The Web SDK config in .env is not enough for CLI writes.
`)
    process.exit(1)
  }

  const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'))
  return initializeApp({ credential: cert(serviceAccount) })
}

let db: Firestore

export function getAdminDb(): Firestore {
  if (!db) db = getFirestore(initAdminApp())
  return db
}
