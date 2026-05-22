import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'

const UserDashboard = () => {
  const { user, userDoc } = useAuth()
  const [myProfiles, setMyProfiles] = useState([])
  const [recentChats, setRecentChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    const profilesRef = collection(db, 'profiles')

    const q = query(
      profilesRef,
      where('createdBy', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        setMyProfiles(docs)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching my profiles:', err)
        // If composite index is missing, give a helpful hint
        if (err.code === 'failed-precondition') {
          setError('Firestore needs an index. Check the browser console for a link to create it.')
        } else {
          setError('Failed to load your profiles.')
        }
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  // Subscribe to my 3 most recent chats for the preview card
  useEffect(() => {
    if (!user) return

    const chatsRef = collection(db, 'chats')
    const q = query(
      chatsRef,
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc'),
      limit(3)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        setRecentChats(docs)
      },
      (err) => {
        console.error('Error fetching recent chats:', err)
      }
    )

    return () => unsubscribe()
  }, [user])

  // === Derived stats ===
  const myProfileCount = myProfiles.length
  const totalBudgetPosted = myProfiles.reduce((sum, p) => sum + (Number(p.budget) || 0), 0)

  // Days since signup
  const daysActive = (() => {
    if (!userDoc?.createdAt) return 0
    const created = userDoc.createdAt.toDate ? userDoc.createdAt.toDate() : new Date(userDoc.createdAt)
    const now = new Date()
    const ms = now - created
    return Math.max(1, Math.floor(ms / (1000 * 60 * 60 * 24)))
  })()

  const formatBudget = (amount) => `PKR ${Number(amount).toLocaleString('en-PK')}`

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">My Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        My Dashboard
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Welcome back, {userDoc?.displayName || user?.email}.
      </p>

      {error && (
        <div className="mb-6 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
          {error}
        </div>
      )}

      {/* === Stat cards === */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-1">My Profiles</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{myProfileCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {myProfileCount === 1 ? 'profile' : 'profiles'} posted
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-1">Total Budget Posted</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatBudget(totalBudgetPosted)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">across all your listings</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold mb-1">Days Active</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{daysActive}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">since you joined</p>
        </div>
      </div>

      {/* === Two-column section: My Profiles list + Chat preview === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* My profiles list */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Profiles</h2>
            <Link
              to="/create"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              + Add
            </Link>
          </div>

          {myProfiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                You haven't posted any profiles yet.
              </p>
              <Link
                to="/create"
                className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Create your first profile
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {myProfiles.slice(0, 5).map(p => (
                <li key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {p.lifestyle} · {formatBudget(p.budget)}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      to={`/view/${p.id}`}
                      className="text-xs px-3 py-1.5 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      to={`/edit/${p.id}`}
                      className="text-xs px-3 py-1.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
              {myProfiles.length > 5 && (
                <li className="pt-3 text-center">
                  <Link to="/all" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    View all your profiles in All Profiles →
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Recent chats card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              💬 Recent Chats
            </h2>
            <Link
              to="/chats"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </Link>
          </div>

          {recentChats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                No conversations yet.
              </p>
              <Link
                to="/chats/new"
                className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Start a chat
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentChats.map(chat => {
                const otherUid = chat.participants.find(uid => uid !== user.uid)
                const otherName = chat.participantNames?.[otherUid] || 'User'
                const unread = chat.unreadCount?.[user.uid] || 0
                return (
                  <li key={chat.id} className="py-3">
                    <Link
                      to={`/chats/${chat.id}`}
                      className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 -mx-2 px-2 py-1 rounded-lg transition"
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {otherName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${
                          unread > 0
                            ? 'font-bold text-gray-900 dark:text-white'
                            : 'font-medium text-gray-900 dark:text-white'
                        }`}>
                          {otherName}
                        </p>
                        <p className={`text-xs truncate ${
                          unread > 0
                            ? 'text-gray-900 dark:text-gray-200'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {chat.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                      {unread > 0 && (
                        <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center text-xs font-semibold text-white bg-blue-600 rounded-full">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard