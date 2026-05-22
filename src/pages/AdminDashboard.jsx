import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'

const AdminDashboard = () => {
  const { user, userDoc } = useAuth()
  const [users, setUsers] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        setUsers(docs)
      },
      (err) => {
        console.error('Error fetching users:', err)
        setError('Failed to load users.')
      }
    )

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const profilesRef = collection(db, 'profiles')

    const unsubscribe = onSnapshot(
      profilesRef,
      (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        setProfiles(docs)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching profiles:', err)
        setError('Failed to load profiles.')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const totalUsers = users.length
  const adminCount = users.filter(u => u.role === 'admin').length
  const regularUserCount = totalUsers - adminCount
  const totalProfiles = profiles.length

  const lifestyleCounts = profiles.reduce((acc, p) => {
    const key = p.lifestyle || 'Unknown'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const lifestyleData = Object.entries(lifestyleCounts)
    .map(([label, count]) => ({
      label,
      count,
      percent: totalProfiles > 0 ? Math.round((count / totalProfiles) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)

  const recentUsers = users.slice(0, 5)

  // === Role flip handler ===
  const handleRoleFlip = async (targetUser) => {
    if (targetUser.uid === user.uid) {
      alert("You can't change your own role. Use Firebase Console if needed.")
      return
    }

    const newRole = targetUser.role === 'admin' ? 'user' : 'admin'
    const action = newRole === 'admin' ? 'Promote' : 'Demote'
    const confirmed = window.confirm(
      `${action} ${targetUser.displayName || targetUser.email} to "${newRole}"?`
    )
    if (!confirmed) return

    try {
      await updateDoc(doc(db, 'users', targetUser.uid), { role: newRole })
      // No manual UI update needed - onSnapshot will pick it up live
    } catch (err) {
      console.error('Error updating role:', err)
      alert('Failed to update role. Please try again.')
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return '—'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Color for the lifestyle bar
  const lifestyleBarColor = (label) => {
    if (label === 'Quiet & Studious') return 'bg-purple-500'
    if (label === 'Social') return 'bg-pink-500'
    if (label === 'Balanced') return 'bg-blue-500'
    return 'bg-gray-400'
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header with admin badge */}
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <span className="px-2.5 py-1 text-xs font-semibold text-white bg-red-600 rounded-full">
          ADMIN
        </span>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Welcome back, {userDoc?.displayName || user?.email}. Here's your system overview.
      </p>

      {error && (
        <div className="mb-6 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
          {error}
        </div>
      )}

      {/* === Stat cards === */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-1">Total Users</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalUsers}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">registered accounts</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-1">Admins</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{adminCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">with admin access</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-1">Regular Users</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{regularUserCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">standard accounts</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-1">Total Profiles</p>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{totalProfiles}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">roommate listings</p>
        </div>
      </div>

      {/* === Lifestyle breakdown chart === */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Lifestyle Breakdown
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Distribution of {totalProfiles} {totalProfiles === 1 ? 'profile' : 'profiles'} by lifestyle preference
        </p>

        {lifestyleData.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No profiles yet.</p>
        ) : (
          <div className="space-y-4">
            {lifestyleData.map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {item.count} ({item.percent}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${lifestyleBarColor(item.label)}`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* === Recent users table with role-flip === */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Recent Users
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Last 5 sign-ups. Click a button to change a user's role.
        </p>

        {recentUsers.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No users yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 pr-3 font-semibold">User</th>
                  <th className="py-2 pr-3 font-semibold">Role</th>
                  <th className="py-2 pr-3 font-semibold">Joined</th>
                  <th className="py-2 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(u => {
                  const isSelf = u.uid === user.uid
                  return (
                    <tr key={u.uid} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {(u.displayName || u.email || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-900 dark:text-white font-medium truncate">
                              {u.displayName || '—'}
                              {isSelf && <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">(You)</span>}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          u.role === 'admin'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-gray-600 dark:text-gray-400 text-xs">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="py-3 text-right">
                        {isSelf ? (
                          <span className="text-xs text-gray-400 italic">—</span>
                        ) : (
                          <button
                            onClick={() => handleRoleFlip(u)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                              u.role === 'admin'
                                ? 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50'
                                : 'text-red-700 bg-red-50 hover:bg-red-100 dark:text-red-300 dark:bg-red-900/30 dark:hover:bg-red-900/50'
                            }`}
                          >
                            {u.role === 'admin' ? 'Demote' : 'Promote'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard