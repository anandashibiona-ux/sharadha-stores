import { useState, useEffect } from 'react'
import axios from 'axios'

export default function AddProductModal({ onClose, onSuccess, adminKey }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    shortDescription: '',
    description: '',
    itemPrice: '',
    price: '',
    stockQuantity: '',
    imageType: 'url', // 'url' or 'upload'
    imageUrl: '',
    imageFile: null
  })

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

  useEffect(() => {
    // Fetch categories for the dropdown
    axios.get(`${API_BASE_URL}/api/categories`)
      .then(res => setCategories(res.data))
      .catch(err => console.error("Failed to load categories", err))
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'radio') {
      setFormData(prev => ({ ...prev, [name]: value }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, imageFile: e.target.files[0] }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = new FormData()
      data.append('name', formData.name)
      // Pass category name to create the slug, and the ID for relation
      data.append('categoryName', formData.category)
      data.append('shortDescription', formData.shortDescription)
      data.append('description', formData.description || formData.shortDescription)
      data.append('itemPrice', formData.itemPrice)
      data.append('price', formData.price)
      data.append('stockQuantity', formData.stockQuantity)
      data.append('imageType', formData.imageType)
      
      if (formData.imageType === 'url') {
        data.append('imageUrl', formData.imageUrl)
      } else if (formData.imageFile) {
        data.append('image', formData.imageFile)
      }

      const res = await axios.post(`${API_BASE_URL}/api/admin/products`, data, {
        headers: {
          'x-admin-key': adminKey,
          'Content-Type': 'multipart/form-data'
        }
      })

      onSuccess(res.data)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-serif text-xl text-gray-900">Add New Product</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <form id="add-product-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Grid for Name and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Product Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                  placeholder="e.g. Homemade Ghee"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Short Description</label>
              <input type="text" name="shortDescription" value={formData.shortDescription} onChange={handleChange} required
                placeholder="Brief tagline for the card view"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Detailed Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3"
                placeholder="Full details, ingredients, etc."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"></textarea>
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Compare Price (Item Price)</label>
                <input type="number" name="itemPrice" value={formData.itemPrice} onChange={handleChange} min="0" required
                  placeholder="Original Price"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Selling Price</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" required
                  placeholder="Discounted Price"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Stock Quantity</label>
                <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} min="0" required
                  placeholder="Initial stock"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              </div>
            </div>

            {/* Image Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Image Source</label>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center text-xs font-medium text-gray-600 gap-1.5">
                  <input type="radio" name="imageType" value="url" checked={formData.imageType === 'url'} onChange={handleChange} />
                  Image URL
                </label>
                <label className="flex items-center text-xs font-medium text-gray-600 gap-1.5">
                  <input type="radio" name="imageType" value="upload" checked={formData.imageType === 'upload'} onChange={handleChange} />
                  Upload Image File
                </label>
              </div>

              {formData.imageType === 'url' ? (
                <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              ) : (
                <input type="file" accept="image/*" onChange={handleFileChange} required
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100" />
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex-shrink-0">
          <button type="submit" form="add-product-form" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Adding Product...' : 'Save Product'}
          </button>
        </div>

      </div>
    </div>
  )
}
