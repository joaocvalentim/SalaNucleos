import { initializeApp, type FirebaseApp } from 'firebase/app'
import { browserLocalPersistence, getAuth, setPersistence, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean) && Boolean(import.meta.env.VITE_SHARED_AUTH_EMAIL)

let auth: Auth | null = null
let db: Firestore | null = null

if (isFirebaseConfigured) {
  const app: FirebaseApp = initializeApp(firebaseConfig)
  auth = getAuth(app)
  void setPersistence(auth, browserLocalPersistence)
  db = getFirestore(app)
}

export function requireAuth() {
  if (!auth) throw new Error('APP:O Firebase ainda não está configurado.')
  return auth
}

export function requireDb() {
  if (!db) throw new Error('APP:O Firebase ainda não está configurado.')
  return db
}

export const sharedAuthEmail = import.meta.env.VITE_SHARED_AUTH_EMAIL || ''
