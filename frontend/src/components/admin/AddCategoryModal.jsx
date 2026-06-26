import { useState } from 'react'
import axios from 'axios'

export default function AddCategoryModal({ onClose, onSuccess }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // The admin route might need admin authentication or maybe it is public?
      // Based on categories.routes.js, it's not protected by adminAuth yet, but we should hit it anyway.
      const res = await axios.post('http://localhost:3001/api/categories', { name })
      onSuccess(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-serif text-xl text-gray-900">Add Category</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <form id="add-category-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required
                autoFocus
                placeholder="e.g. Sweets"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
              />
              {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white pt-0">
          <button type="submit" form="add-category-form" disabled={loading || !name.trim()}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 mt-4">
            {loading ? 'Adding...' : 'Save Category'}
          </button>
        </div>

      </div>
    </div>
  )
}
