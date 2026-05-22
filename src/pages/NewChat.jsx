import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'
import { ensureChatExists } from '../firebase/chats'
const NewChat = () => {
  const { user, userDoc } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [startingChat, setStartingChat] = useState(null)  // uid currently being clicked

  useEffect(() => {
    const usersRef = collection(db, 'users')

    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        // Exclude myself from the list
        const allUsers = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(u => u.uid !== user?.uid)
        setUsers(allUsers)
        setLoading(false)
      },
      (err) => {
        console.error('Error loading users:', err)
        setError('Failed to load users.')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  // Filter users by search term (matches name or email)
  const filteredUsers = users.filter(u => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      u.displayName?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    )
  })

  const handleStartChat = async (otherUser) => {
    if (startingChat) return  // prevent double-clicks

    setStartingChat(otherUser.uid)
    try {
      const chatId = await ensureChatExists(
        {
          uid: user.uid,
          displayName: userDoc?.displayName || user.displayName || user.email,
          photoURL: user.photoURL
        },
        {
          uid: otherUser.uid,
          displayName: otherUser.displayName,
          photoURL: otherUser.photoURL
        }
      )
      navigate(`/chats/${chatId}`)
    } catch (err) {
      console.error('Error starting chat:', err)
      setError('Failed to start chat. Please try again.')
      setStartingChat(null)
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Start a Chat</h1>
        <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/chats"
        className="inline-block mb-5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
      >
        ← Back to My Chats
      </Link>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Start a Chat
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Choose a user to begin a conversation.
      </p>

      {error && (
        <div className="mb-4 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Search input */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by name or email..."
        className="w-full mb-5 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
      />

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? `No users match "${searchTerm}"` : 'No other users registered yet.'}
          </p>
        </div>
      ) : (
        <ul className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
          {filteredUsers.map(u => (
            <li key={u.uid}>
              <button
                onClick={() => handleStartChat(u)}
                disabled={startingChat === u.uid}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition disabled:opacity-50"
              >
                {/* Avatar */}
                {u.photoURL ? (
                  <img
                    src={u.photoURL}
                    alt={u.displayName}
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {(u.displayName || u.email || '?').charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Name + email */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {u.displayName || 'Unknown'}
                    </p>
                    {u.role === 'admin' && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                </div>

                {/* Arrow */}
                <span className="text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {startingChat === u.uid ? '...' : '→'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default NewChat