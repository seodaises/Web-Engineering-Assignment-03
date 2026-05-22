import { createContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  deleteUser,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, onSnapshot, deleteDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '../firebase/config'
import { upsertUserDoc } from '../firebase/users'

// Create the context (a "container" for shared data)
export const AuthContext = createContext(null)

// Provider component - wraps the whole app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)         // Firebase Auth user (email, uid, displayName)
  const [userDoc, setUserDoc] = useState(null)   // Firestore user doc (role, timestamps, etc.)
  const [loading, setLoading] = useState(true)

  // Listen for auth state changes (login/logout)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (!currentUser) {
        // Logged out - clear the Firestore user doc too
        setUserDoc(null)
        setLoading(false)
      }
      // If logged in, the second useEffect will fetch the user doc
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return

    const userRef = doc(db, 'users', user.uid)
    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          setUserDoc(snap.data())
        } else {
          setUserDoc(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error('Error subscribing to user doc:', err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  // === Auth methods - components will call these ===

  const signup = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    // Set the display name immediately after creation
    if (displayName) {
      await updateProfile(result.user, { displayName })
    }
    // Create the user doc in Firestore with default role='user'
    await upsertUserDoc(result.user, { displayName })
    return result
  }

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    // Update lastLoginAt (creates doc if somehow missing)
    await upsertUserDoc(result.user)
    return result
  }

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    // Create user doc on first Google sign-in, update on returning visits
    await upsertUserDoc(result.user)
    return result
  }

  const logout = () => {
    return signOut(auth)
  }

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email)
  }

  const updateUserProfile = (updates) => {
    return updateProfile(auth.currentUser, updates)
  }

  const deleteAccount = async () => {
    if (auth.currentUser) {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid))
    }
    return deleteUser(auth.currentUser)
  }

  // Convenience: is this user an admin?
  const isAdmin = userDoc?.role === 'admin'

  // Values exposed to all components via context
  const value = {
    user,           // Firebase Auth user
    userDoc,        // Firestore user doc (with role)
    isAdmin,        // shortcut boolean
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    deleteAccount
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}