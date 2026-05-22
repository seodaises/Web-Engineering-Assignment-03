import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './config'
export const getChatId = (uid1, uid2) => {
  return [uid1, uid2].sort().join('_')
}

/**
 * Ensures a chat document exists between two users.
 * Creates it on first use, does nothing if it already exists.
 *
 * @param {object} currentUser - { uid, displayName } of the person starting the chat
 * @param {object} otherUser - { uid, displayName } of the person being chatted with
 * @returns {string} the chatId
 */
export const ensureChatExists = async (currentUser, otherUser) => {
  const chatId = getChatId(currentUser.uid, otherUser.uid)
  const chatRef = doc(db, 'chats', chatId)
  const existing = await getDoc(chatRef)

  if (!existing.exists()) {
    await setDoc(chatRef, {
      participants: [currentUser.uid, otherUser.uid],
      participantNames: {
        [currentUser.uid]: currentUser.displayName || 'User',
        [otherUser.uid]: otherUser.displayName || 'User'
      },
      participantPhotos: {
        [currentUser.uid]: currentUser.photoURL || null,
        [otherUser.uid]: otherUser.photoURL || null
      },
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      // Unread counts per user. Both start at 0.
      unreadCount: {
        [currentUser.uid]: 0,
        [otherUser.uid]: 0
      },
      createdAt: serverTimestamp()
    })
  }

  return chatId
}