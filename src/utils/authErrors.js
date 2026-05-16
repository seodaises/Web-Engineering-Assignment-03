// Convert Firebase Auth error codes to user-friendly messages
export const getAuthErrorMessage = (error) => {
  const code = error?.code || ''

  const messages = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/too-many-requests': 'Too many failed attempts. Try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/popup-closed-by-user': 'Sign-in cancelled.',
    'auth/requires-recent-login': 'Please log out and log back in to perform this action.',
    'auth/missing-password': 'Please enter your password.',
  }

  return messages[code] || error?.message || 'Something went wrong. Please try again.'
}