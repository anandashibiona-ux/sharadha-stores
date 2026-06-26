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

  useEffect(() => {
    // Fetch categories for the dropdown
    axios.get('https://sharadha-stores-u3sv.vercel.app/api/categories')
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

      const res = await axios.post('https://sharadha-stores-u3sv.vercel.app/api/admin/products', data, {
        headers: {
          'Authorization': `Bearer ${adminKey}`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-serif text-xl text-gray-900">Add New Product</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="add-product-form" onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Product Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required
                placeholder="e.g. Mango Pickle"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white">
                <option value="">Select a category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Short Description</label>
              <input type="text" name="shortDescription" value={formData.shortDescription} onChange={handleChange} required
                placeholder="e.g. Traditional homemade mango pickle"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3"
                placeholder="Detailed product description (optional, defaults to short description)"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Item Price (MRP) ₹</label>
                <input type="number" name="itemPrice" value={formData.itemPrice} onChange={handleChange} min="0" required
                  placeholder="1000"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Selling Price ₹</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" required
                  placeholder="799"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Stock Quantity</label>
              <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} min="0" required
                placeholder="e.g. 50"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
            </div>

            <div>
              <div className="flex items-center gap-4 mb-3">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input type="radio" name="imageType" value="url" checked={formData.imageType === 'url'} onChange={handleChange} className="accent-orange-500" />
                  Paste Image URL
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input type="radio" name="imageType" value="upload" checked={formData.imageType === 'upload'} onChange={handleChange} className="accent-orange-500" />
                  Upload File
                </label>
              </div>

              {formData.imageType === 'url' ? (
                <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required
                  placeholder="https://example.com/product-image.jpg"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
              ) : (
                <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl p-6 text-center hover:bg-gray-100 transition-colors relative">
                  <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} required
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium text-orange-500">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP</p>
                  {formData.imageFile && <p className="text-xs font-semibold text-gray-700 mt-2">{formData.imageFile.name}</p>}
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white">
          <button type="submit" form="add-product-form" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Adding...' : 'Add Product to Store'}
          </button>
        </div>

      </div>
    </div>
  )
}

