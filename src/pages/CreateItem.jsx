import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

const CreateItem = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Female',
    university: '',
    budget: '',
    preferredArea: '',
    lifestyle: 'Balanced',
    bio: '',
    contactEmail: '',
    imageUrl: ''
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const profilesRef = collection(db, 'profiles')

      await addDoc(profilesRef, {
        ...formData,
        age: Number(formData.age),
        budget: Number(formData.budget),
        createdAt: serverTimestamp()
      })

      navigate('/all')
    } catch (err) {
      console.error('Error adding profile:', err)
      setError('Failed to save profile. Please try again.')
      setSubmitting(false)
    }
  }

  // Reusable Tailwind classes for inputs
  const inputClass = "w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
  const labelClass = "block mb-2 text-sm font-medium text-gray-900 dark:text-white"

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Add a Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Tell potential roommates about yourself.</p>
      </div>

      {error && (
        <div className="mb-4 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8 shadow-sm max-w-3xl">

        {/* Name */}
        <div className="mb-5">
          <label htmlFor="name" className={labelClass}>Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Sara Khan"
            className={inputClass}
            required
          />
        </div>

        {/* Age + Gender row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label htmlFor="age" className={labelClass}>Age *</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="21"
              min="16"
              max="60"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="gender" className={labelClass}>Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* University */}
        <div className="mb-5">
          <label htmlFor="university" className={labelClass}>University *</label>
          <input
            type="text"
            id="university"
            name="university"
            value={formData.university}
            onChange={handleChange}
            placeholder="e.g., University of Lahore"
            className={inputClass}
            required
          />
        </div>

        {/* Budget + Preferred Area row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label htmlFor="budget" className={labelClass}>Monthly Budget (PKR) *</label>
            <input
              type="number"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="25000"
              min="0"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="preferredArea" className={labelClass}>Preferred Area *</label>
            <input
              type="text"
              id="preferredArea"
              name="preferredArea"
              value={formData.preferredArea}
              onChange={handleChange}
              placeholder="e.g., DHA, Lahore"
              className={inputClass}
              required
            />
          </div>
        </div>

        {/* Lifestyle */}
        <div className="mb-5">
          <label htmlFor="lifestyle" className={labelClass}>Lifestyle</label>
          <select
            id="lifestyle"
            name="lifestyle"
            value={formData.lifestyle}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="Quiet & Studious">Quiet & Studious</option>
            <option value="Balanced">Balanced</option>
            <option value="Social">Social</option>
          </select>
        </div>

        {/* Bio */}
        <div className="mb-5">
          <label htmlFor="bio" className={labelClass}>Short Bio *</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell roommates about your routine, interests, and what you're looking for..."
            rows="4"
            className={inputClass}
            required
          />
        </div>

        {/* Contact Email */}
        <div className="mb-5">
          <label htmlFor="contactEmail" className={labelClass}>Contact Email *</label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="you@example.com"
            className={inputClass}
            required
          />
        </div>

        {/* Image URL */}
        <div className="mb-5">
          <label htmlFor="imageUrl" className={labelClass}>Profile Image URL (optional)</label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/photo.jpg"
            className={inputClass}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate('/all')}
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : 'Add Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateItem