import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'

const ViewAll = () => {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const profilesRef = collection(db, 'profiles')
    const q = query(profilesRef, orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setProfiles(items)
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

  const formatBudget = (amount) => `PKR ${Number(amount).toLocaleString('en-PK')}`

  // Color tag for lifestyle
  const lifestyleColor = (lifestyle) => {
    if (lifestyle === 'Quiet & Studious') return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    if (lifestyle === 'Social') return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">All Profiles</h1>
        <p className="text-gray-600 dark:text-gray-400">Loading profiles...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">All Profiles</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'} available
          </p>
        </div>
        <Link
          to="/create"
          className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          + Add Profile
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
          {error}
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="text-center py-16 px-8 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No profiles yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-5">Be the first to add a roommate profile.</p>
          <Link
            to="/create"
            className="inline-block px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Add Your First Profile
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {profiles.map(profile => (
            <article
              key={profile.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
            >
              {profile.imageUrl ? (
                <div className="w-full h-44 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <img
                    src={profile.imageUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.parentElement.style.display = 'none'}
                  />
                </div>
              ) : (
                <div className="w-full h-44 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">
                    {profile.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}

              <div className="p-5 flex flex-col gap-2 flex-1">
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${lifestyleColor(profile.lifestyle)}`}>
                    {profile.lifestyle}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {profile.gender}, {profile.age}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {profile.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  🎓 {profile.university}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  📍 {profile.preferredArea}
                </p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formatBudget(profile.budget)}
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400"> /month</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                  {profile.bio?.length > 90 ? profile.bio.substring(0, 90) + '...' : profile.bio}
                </p>

                <div className="flex gap-2 pt-3 mt-2 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to={`/view/${profile.id}`}
                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/edit/${profile.id}`}
                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default ViewAll