import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, getDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'
import { ensureChatExists } from '../firebase/chats'

const ViewSingle = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, userDoc, isAdmin } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'profiles', id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setProfile({ id: docSnap.id, ...docSnap.data() })
        } else {
          setError('Profile not found.')
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [id])

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete profile of "${profile.name}"? This cannot be undone.`
    )
    if (!confirmed) return

    setDeleting(true)
    try {
      await deleteDoc(doc(db, 'profiles', id))
      navigate('/all')
    } catch (err) {
      console.error('Error deleting profile:', err)
      setError('Failed to delete profile.')
      setDeleting(false)
    }
  }

  // Start a chat with the profile creator
  const handleStartChat = async () => {
    if (!user || !profile?.createdBy) return
    try {
      const chatId = await ensureChatExists(
        {
          uid: user.uid,
          displayName: userDoc?.displayName || user.displayName || user.email,
          photoURL: user.photoURL
        },
        {
          uid: profile.createdBy,
          displayName: profile.creatorName || 'User',
          photoURL: null  // we don't store creator photo on profile docs
        }
      )
      navigate(`/chats/${chatId}`)
    } catch (err) {
      console.error('Failed to start chat:', err)
      setError('Could not start chat. Please try again.')
    }
  }

  const formatBudget = (amount) => `PKR ${Number(amount).toLocaleString('en-PK')}`

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-PK', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  const lifestyleColor = (lifestyle) => {
    if (lifestyle === 'Quiet & Studious') return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    if (lifestyle === 'Social') return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  }

  if (loading) {
    return <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
  }

  if (error || !profile) {
    return (
      <div>
        <div className="mb-4 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
          {error || 'Profile not found.'}
        </div>
        <Link
          to="/all"
          className="inline-block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
        >
          ← Back to All Profiles
        </Link>
      </div>
    )
  }
// Check if current user owns this profile
const isOwner = user && profile.createdBy === user.uid
  return (
    <div>
      <Link
        to="/all"
        className="inline-block mb-5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
      >
        ← Back to All Profiles
      </Link>

      <article className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md overflow-hidden max-w-4xl">
        {/* Header section */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 flex items-center gap-6">
          {profile.imageUrl ? (
            <img
              src={profile.imageUrl}
              alt={profile.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextElementSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div
            className="w-28 h-28 rounded-full bg-white/20 backdrop-blur border-4 border-white shadow-lg flex items-center justify-center"
            style={{ display: profile.imageUrl ? 'none' : 'flex' }}
          >
            <span className="text-4xl font-bold text-white">
              {profile.name?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>

          <div className="text-white">
            <h1 className="text-3xl font-bold mb-1">{profile.name}</h1>
            <p className="text-blue-100">{profile.gender}, {profile.age} years</p>
          </div>
        </div>
    
        {/* Body section */}
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-5">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${lifestyleColor(profile.lifestyle)}`}>
              {profile.lifestyle}
            </span>
          </div>

          {/* Quick info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">University</p>
              <p className="text-gray-900 dark:text-white font-medium">🎓 {profile.university}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">Preferred Area</p>
              <p className="text-gray-900 dark:text-white font-medium">📍 {profile.preferredArea}</p>
            </div>
          </div>

          {/* Budget */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-5 rounded-lg mb-6">
            <p className="text-xs uppercase text-blue-700 dark:text-blue-300 font-medium mb-1">Monthly Budget</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {formatBudget(profile.budget)}
            </p>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2">About</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profile.bio}</p>
          </div>

          {/* Contact */}
          <div className="mb-6">
            <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2">Contact</h2>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex flex-wrap items-center justify-between gap-3">
              <a href={`mailto:${profile.contactEmail}`}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                ✉️ {profile.contactEmail}
              </a>
              {/* Chat button - only for logged-in users who are NOT the owner */}
              {user && !isOwner && profile.createdBy && (
                <button
                  onClick={handleStartChat}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition inline-flex items-center gap-2"
                >
                  💬 Chat with {profile.creatorName || 'creator'}
                </button>
              )}
            </div>
            {!user && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Sign in
                </Link>{' '}to chat directly with the creator.
              </p>
            )}
          </div>

          {/* Creator + Meta */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
           {profile.creatorName && (
           <div className="flex items-center gap-2 mb-2">
      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
        {profile.creatorName.charAt(0).toUpperCase()}
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Posted by <strong>{profile.creatorName}</strong>
        {isOwner && <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(You)</span>}
      </p>
    </div>
  )}
  <div className="flex flex-wrap justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
    <span>Listed on {formatDate(profile.createdAt)}</span>
    <span className="font-mono">ID: {profile.id}</span>
  </div>
</div>

          {/* Action buttons */}
          {/* Action buttons - only visible to owner */}
{isOwner && (
  <div className="flex gap-3 pt-5 mt-5 border-t border-gray-200 dark:border-gray-700">
    <Link
      to={`/edit/${profile.id}`}
      className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
    >
      Edit Profile
    </Link>
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {deleting ? 'Deleting...' : 'Delete Profile'}
    </button>
  </div>
)}

{/* Admin-only: delete button on others' profiles */}
{isAdmin && !isOwner && (
  <div className="flex items-center gap-3 pt-5 mt-5 border-t border-gray-200 dark:border-gray-700">
    <span className="px-2 py-0.5 text-xs font-semibold text-white bg-red-600 rounded-full">
      ADMIN
    </span>
    <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
      You can moderate this profile.
    </span>
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {deleting ? 'Deleting...' : 'Delete Profile'}
    </button>
  </div>
)}
        </div>
      </article>
    </div>
  )
}

export default ViewSingle