import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  doc,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  increment
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'

const ChatWindow = () => {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const { user, userDoc } = useAuth()

  const [chat, setChat] = useState(null)        // chat doc metadata
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)

  const messagesEndRef = useRef(null)  // for auto-scrolling to bottom

  // Subscribe to the chat metadata doc
  useEffect(() => {
    if (!chatId) return

    const chatRef = doc(db, 'chats', chatId)
    const unsubscribe = onSnapshot(
      chatRef,
      (snap) => {
        if (!snap.exists()) {
          setNotFound(true)
          setLoading(false)
          return
        }
        const data = snap.data()
        // Security: make sure current user is a participant
        if (!data.participants?.includes(user.uid)) {
          setUnauthorized(true)
          setLoading(false)
          return
        }
        setChat({ id: snap.id, ...data })
        setLoading(false)
      },
      (err) => {
        console.error('Error loading chat:', err)
        setError('Failed to load chat.')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [chatId, user])


  useEffect(() => {
    if (!chatId || unauthorized || notFound) return

    const messagesRef = collection(db, 'chats', chatId, 'messages')
    const q = query(messagesRef, orderBy('sentAt', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        setMessages(msgs)
      },
      (err) => {
        console.error('Error loading messages:', err)
      }
    )

    return () => unsubscribe()
  }, [chatId, unauthorized, notFound])

  useEffect(() => {
    if (!chat || !user) return
    const myUnread = chat.unreadCount?.[user.uid] || 0
    if (myUnread > 0) {
      const chatRef = doc(db, 'chats', chatId)
      updateDoc(chatRef, {
        [`unreadCount.${user.uid}`]: 0
      }).catch(err => console.error('Failed to mark as read:', err))
    }
  }, [chat, user, chatId])

  // Auto-scroll to the latest message whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send a message
  const handleSend = async (e) => {
    e.preventDefault()
    const text = newMessage.trim()
    if (!text || !chat) return

    // Find the other participant
    const otherUid = chat.participants.find(uid => uid !== user.uid)

    // Clear input immediately for snappy feel
    setNewMessage('')

    try {
      // 1) Add the message to the subcollection
      const messagesRef = collection(db, 'chats', chatId, 'messages')
      await addDoc(messagesRef, {
        text,
        senderId: user.uid,
        senderName: userDoc?.displayName || user.displayName || user.email,
        sentAt: serverTimestamp()
      })

      const chatRef = doc(db, 'chats', chatId)
      await updateDoc(chatRef, {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        [`unreadCount.${otherUid}`]: increment(1),
        [`unreadCount.${user.uid}`]: 0  // mine stays at 0 since I'm viewing
      })
    } catch (err) {
      console.error('Failed to send:', err)
      setError('Message failed to send. Try again.')
      setNewMessage(text)  // restore the text so user doesn't lose it
    }
  }

  // === Helpers ===
  const getOtherUserInfo = () => {
    if (!chat) return { name: 'User', photo: null }
    const otherUid = chat.participants.find(uid => uid !== user.uid)
    return {
      uid: otherUid,
      name: chat.participantNames?.[otherUid] || 'User',
      photo: chat.participantPhotos?.[otherUid] || null
    }
  }

  const myInfo = {
    name: userDoc?.displayName || user?.displayName || 'You',
    photo: user?.photoURL || null
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString('en-PK', { hour: 'numeric', minute: '2-digit' })
  }

  const Avatar = ({ name, photo, mine }) => {
    if (photo) {
      return <img src={photo} alt={name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
    }
    return (
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${
        mine ? 'bg-blue-600' : 'bg-gray-500'
      }`}>
        {(name || '?').charAt(0).toUpperCase()}
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div>
        <div className="mb-4 p-4 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800">
          Chat not found.
        </div>
        <Link
          to="/chats"
          className="inline-block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
        >
          ← Back to My Chats
        </Link>
      </div>
    )
  }

  if (unauthorized) {
    return (
      <div>
        <div className="mb-4 p-4 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800">
          <p className="font-semibold mb-1">Not authorized</p>
          <p>You don't have access to this conversation.</p>
        </div>
        <Link
          to="/chats"
          className="inline-block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
        >
          ← Back to My Chats
        </Link>
      </div>
    )
  }

  const other = getOtherUserInfo()

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate('/chats')}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 sm:hidden"
          aria-label="Back"
        >
          ←
        </button>
        {other.photo ? (
          <img src={other.photo} alt={other.name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            {other.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white truncate">{other.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/30 space-y-2">
        {error && (
          <div className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <p className="text-4xl mb-2">👋</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No messages yet. Say hi!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const mine = msg.senderId === user.uid
            // Group consecutive messages from same sender (avatar only on first of group)
            const prev = messages[idx - 1]
            const showAvatar = !prev || prev.senderId !== msg.senderId

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar on left for THEIR messages */}
                {!mine && (
                  showAvatar ? (
                    <Avatar name={other.name} photo={other.photo} mine={false} />
                  ) : (
                    <div className="w-7 flex-shrink-0" />  // spacer to align with bubbles above
                  )
                )}

                <div className={`flex flex-col max-w-[75%] ${mine ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-3.5 py-2 rounded-2xl break-words ${
                      mine
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 px-1">
                    {formatTime(msg.sentAt)}
                  </span>
                </div>

                {/* Avatar on right for MY messages */}
                {mine && (
                  showAvatar ? (
                    <Avatar name={myInfo.name} photo={myInfo.photo} mine={true} />
                  ) : (
                    <div className="w-7 flex-shrink-0" />
                  )
                )}
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default ChatWindow