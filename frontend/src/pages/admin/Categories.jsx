import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import AdminHeader from '../../components/admin/AdminHeader'
import { PageLoader, ErrorState } from '../../components/common/StateComponents'

const ADMIN_KEY_STORAGE = 'sharadha_admin_key'

export default function AdminCategories() {
  const adminKey = sessionStorage.getItem(ADMIN_KEY_STORAGE)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Inline add category state
  const [newCategoryName, setNewCategoryName] = useState('')
  const [adding, setAdding] = useState(false)
  
  if (!adminKey) {
    return (
      <div className="page-container py-12 text-center">
        <p className="text-muted mb-4">You must be logged in to access categories.</p>
        <Link to="/admin" className="btn-primary text-sm">Go to Admin Login</Link>
      </div>
    )
  }

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await axios.get('https://sharadha-stores-u3sv.vercel.app/api/categories')
      setCategories(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await axios.delete(`https://sharadha-stores-u3sv.vercel.app/api/categories/${id}`)
      setCategories(categories.filter(c => c.id !== id))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete category')
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    setAdding(true)
    try {
      const res = await axios.post('https://sharadha-stores-u3sv.vercel.app/api/categories', { name: newCategoryName })
      setCategories(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewCategoryName('')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add category')
    } finally {
      setAdding(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <AdminHeader onSignOut={() => { sessionStorage.removeItem(ADMIN_KEY_STORAGE); window.location.reload() }} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-gray-900">Categories</h1>
        </div>

        {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={fetchCategories} /> : (
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 p-6 sm:p-8">
            
            {/* Inline Add Category Form */}
            <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-8">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New Category Name..."
                className="w-full sm:flex-1 px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
              <button
                type="submit"
                disabled={adding || !newCategoryName.trim()}
                className="w-full sm:w-auto bg-orange-400 hover:bg-orange-500 text-white text-sm font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {adding ? 'Adding...' : 'Add Category'}
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category Name</th>
                    <th className="text-center py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Count</th>
                    <th className="text-right py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-5 font-semibold text-gray-800">{cat.name}</td>
                      <td className="py-5 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 text-xs text-gray-500 font-medium">
                          {cat.product_count}
                        </span>
                      </td>
                      <td className="py-5 text-right">
                        <button 
                          onClick={() => handleDelete(cat.id, cat.name)} 
                          className="text-[#D05D5D] hover:text-red-700 p-1.5 transition-colors" 
                          title="Delete category"
                        >
                          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
