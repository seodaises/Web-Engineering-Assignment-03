import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'

const ChatList = () => {
  const { user } = useAuth()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    const chatsRef = collection(db, 'chats')
    // Find all chats where I'm a participant, sorted by most recent activity
    const q = query(
      chatsRef,
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        setChats(docs)
        setLoading(false)
      },
      (err) => {
        console.error('Error loading chats:', err)
        if (err.code === 'failed-precondition') {
          setError('Firestore needs an index. Check the browser console for a one-click link to create it.')
        } else {
          setError('Failed to load chats.')
        }
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  // Helper: given a chat, who's the OTHER person?
  const getOtherUserInfo = (chat) => {
    const otherUid = chat.participants.find(uid => uid !== user.uid)
    return {
      uid: otherUid,
      name: chat.participantNames?.[otherUid] || 'Unknown User',
      photo: chat.participantPhotos?.[otherUid] || null
    }
  }

  // Format the timestamp in a friendly way (e.g. "2:30 PM" if today, "Yesterday", or date)
  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()

    if (isToday) {
      return date.toLocaleTimeString('en-PK', { hour: 'numeric', minute: '2-digit' })
    }
    if (isYesterday) return 'Yesterday'
    return date.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">My Chats</h1>
        <p className="text-gray-600 dark:text-gray-400">Loading conversations...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
            My Chats
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {chats.length} {chats.length === 1 ? 'conversation' : 'conversations'}
          </p>
        </div>
        <Link
          to="/chats/new"
          className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          + New Chat
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
          {error}
        </div>
      )}

      {chats.length === 0 ? (
        <div className="text-center py-16 px-8 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
          <div className="text-5xl mb-3">💬</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No conversations yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-5">
            Start a chat with another user to begin messaging.
          </p>
          <Link
            to="/chats/new"
            className="inline-block px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Start a Chat
          </Link>
        </div>
      ) : (
        <ul className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
          {chats.map(chat => {
            const other = getOtherUserInfo(chat)
            const unread = chat.unreadCount?.[user.uid] || 0
            const hasUnread = unread > 0

            return (
              <li key={chat.id}>
                <Link
                  to={`/chats/${chat.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  {/* Avatar */}
                  {other.photo ? (
                    <img
                      src={other.photo}
                      alt={other.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {other.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Name + last message */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate ${
                        hasUnread
                          ? 'font-bold text-gray-900 dark:text-white'
                          : 'font-medium text-gray-900 dark:text-white'
                      }`}>
                        {other.name}
                      </p>
                      <span className={`text-xs flex-shrink-0 ${
                        hasUnread
                          ? 'text-blue-600 dark:text-blue-400 font-semibold'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatTime(chat.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className={`text-sm truncate ${
                        hasUnread
                          ? 'text-gray-900 dark:text-gray-200 font-medium'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                      {/* Unread badge */}
                      {hasUnread && (
                        <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center text-xs font-semibold text-white bg-blue-600 rounded-full">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default ChatList