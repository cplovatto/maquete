import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { assertFirebaseConfig, firebaseConfig } from './firebase-config'

let app: FirebaseApp
let db: Firestore

/** Lazily initialized Firebase app + Firestore (for future app use). */
export function getFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    assertFirebaseConfig()
    app = initializeApp(firebaseConfig)
  }
  return app ?? getApps()[0]
}

export function getFirestoreDb(): Firestore {
  if (!db) db = getFirestore(getFirebaseApp())
  return db
}
