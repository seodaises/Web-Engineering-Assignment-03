import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './config'

/**
 * Creates a user document in Firestore if it doesn't exist,
 * or updates the lastLoginAt timestamp if it does.
 *
 * Called after every successful sign-in (email/password or Google)
 * and after every new account creation.
 *
 * @param {object} firebaseUser - The user object from Firebase Auth
 * @param {object} extras - Optional extra fields (e.g. displayName for email signup)
 */
export const upsertUserDoc = async (firebaseUser, extras = {}) => {
  if (!firebaseUser) return

  const userRef = doc(db, 'users', firebaseUser.uid)
  const existing = await getDoc(userRef)

  if (!existing.exists()) {
    // First time this user is seen - create their doc with default role
    await setDoc(userRef, {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: extras.displayName || firebaseUser.displayName || firebaseUser.email.split('@')[0],
      photoURL: firebaseUser.photoURL || null,
      role: 'user',  // default role - manually change to 'admin' in Firestore console
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    })
  } else {
    // Returning user - just update lastLoginAt (and photoURL in case it changed)
    await setDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      photoURL: firebaseUser.photoURL || existing.data().photoURL || null
    }, { merge: true })  // merge: true means "only update these fields, don't overwrite the doc"
  }
}

export const getUserDoc = async (uid) => {
  if (!uid) return null
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  return snap.exists() ? snap.data() : null
}