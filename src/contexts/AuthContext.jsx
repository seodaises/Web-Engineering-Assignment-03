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
import { auth, googleProvider } from '../firebase/config'

// Create the context (a "container" for shared data)
export const AuthContext = createContext(null)

// Provider component - wraps the whole app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Listen for auth state changes (login/logout)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    // Cleanup listener when component unmounts
    return () => unsubscribe()
  }, [])

  // === Auth methods - components will call these ===

  const signup = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    // Set the display name immediately after creation
    if (displayName) {
      await updateProfile(result.user, { displayName })
    }
    return result
  }

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider)
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

  const deleteAccount = () => {
    return deleteUser(auth.currentUser)
  }

  // Values exposed to all components via context
  const value = {
    user,
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