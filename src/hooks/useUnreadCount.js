import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from './useAuth'

export const useUnreadCount = () => {
  const { user } = useAuth()
  const [totalUnread, setTotalUnread] = useState(0)

  useEffect(() => {
    if (!user) {
      setTotalUnread(0)
      return
    }

    const chatsRef = collection(db, 'chats')
    const q = query(chatsRef, where('participants', 'array-contains', user.uid))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const total = snapshot.docs.reduce((sum, d) => {
          const data = d.data()
          return sum + (data.unreadCount?.[user.uid] || 0)
        }, 0)
        setTotalUnread(total)
      },
      (err) => {
        console.error('Error counting unreads:', err)
        setTotalUnread(0)
      }
    )

    return () => unsubscribe()
  }, [user])

  return totalUnread
}