import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getAuthErrorMessage } from '../utils/authErrors'

const Account = () => {
  const { user, updateUserProfile, resetPassword, logout, deleteAccount } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [savingName, setSavingName] = useState(false)
  const [nameMessage, setNameMessage] = useState('')
  const [nameError, setNameError] = useState('')

  const [resetSent, setResetSent] = useState(false)
  const [resetError, setResetError] = useState('')

  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleUpdateName = async (e) => {
    e.preventDefault()
    setNameError('')
    setNameMessage('')
    setSavingName(true)

    try {
      await updateUserProfile({ displayName })
      setNameMessage('Display name updated.')
    } catch (err) {
      setNameError(getAuthErrorMessage(err))
    } finally {
      setSavingName(false)
    }
  }

  const handleResetPassword = async () => {
    setResetError('')
    setResetSent(false)

    try {
      await resetPassword(user.email)
      setResetSent(true)
    } catch (err) {
      setResetError(getAuthErrorMessage(err))
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      `Delete your account permanently? This cannot be undone. Your profiles will remain but become unmanageable.`
    )
    if (!confirmed) return

    setDeleting(true)
    setDeleteError('')
    try {
      await deleteAccount()
      navigate('/')
    } catch (err) {
      setDeleteError(getAuthErrorMessage(err))
      setDeleting(false)
    }
  }

  if (!user) {
    return <p className="text-gray-600 dark:text-gray-400">Loading account...</p>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Account Settings</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Manage your RoomSync account.</p>

      {/* User info card */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile</h2>
        <div className="space-y-2 mb-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">Email:</strong> {user.email}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">User ID:</strong>{' '}
            <span className="font-mono text-xs">{user.uid}</span>
          </p>
        </div>

        {nameError && (
          <div className="mb-3 p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
            {nameError}
          </div>
        )}
        {nameMessage && (
          <div className="mb-3 p-3 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
            {nameMessage}
          </div>
        )}

        <form onSubmit={handleUpdateName} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <button
            type="submit"
            disabled={savingName}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
          >
            {savingName ? 'Saving...' : 'Update Name'}
          </button>
        </form>
      </section>

      {/* Password reset */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Password</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Send a password reset link to your email.
        </p>

        {resetError && (
          <div className="mb-3 p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
            {resetError}
          </div>
        )}
        {resetSent && (
          <div className="mb-3 p-3 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
            Reset link sent to {user.email}.
          </div>
        )}

        <button
          onClick={handleResetPassword}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
        >
          Send Reset Email
        </button>
      </section>

      {/* Sign out */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sign Out</h2>
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-lg transition"
        >
          Sign Out
        </button>
      </section>

      {/* Danger zone */}
      <section className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">Danger Zone</h2>
        <p className="text-sm text-red-700 dark:text-red-400 mb-4">
          Permanently delete your account. This cannot be undone.
        </p>

        {deleteError && (
          <div className="mb-3 p-3 text-sm text-red-800 bg-red-100 border border-red-300 rounded-lg dark:bg-red-900/40 dark:text-red-200">
            {deleteError}
          </div>
        )}

        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : 'Delete Account'}
        </button>
      </section>
    </div>
  )
}

export default Account