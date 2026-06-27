import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAdminStock, updateStock } from '../../services/api'
import StatusBadge from '../../components/common/StatusBadge'
import { PageLoader, ErrorState } from '../../components/common/StateComponents'
import { formatCurrency } from '../../utils/validators'
import AdminHeader from '../../components/admin/AdminHeader'
import AddProductModal from '../../components/admin/AddProductModal'

const ADMIN_KEY_STORAGE = 'sharadha_admin_key'

export default function StockManagement() {
  const adminKey = sessionStorage.getItem(ADMIN_KEY_STORAGE)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState({}) // { productId: newQty }
  const [saving, setSaving] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!adminKey) {
    return (
      <div className="page-container py-12 text-center">
        <p className="text-muted mb-4">You must be logged in to access stock management.</p>
        <Link to="/admin" className="btn-primary text-sm">Go to Admin Login</Link>
      </div>
    )
  }

  const fetchStock = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminStock(adminKey)
      setProducts(data.products)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load stock')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStock() }, [])

  const handleSave = async (productId) => {
    const qty = editing[productId]
    if (qty === undefined || qty === '') return
    setSaving(productId)
    try {
      await updateStock(adminKey, productId, parseInt(qty))
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                stockQuantity: parseInt(qty),
                stockStatus: parseInt(qty) === 0 ? 'out_of_stock' : parseInt(qty) <= p.lowStockThreshold ? 'low_stock' : 'in_stock',
              }
            : p
        )
      )
      setEditing((prev) => { const n = { ...prev }; delete n[productId]; return n })
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update stock')
    } finally {
      setSaving(null)
    }
  }

  const handleDelete = async (productId, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
      await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey }
      })
      setProducts(products.filter(p => p.id !== productId))
    } catch (err) {
      alert('Failed to delete product')
    }
  }

  const groupedByCategory = products.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <AdminHeader onSignOut={() => { sessionStorage.removeItem(ADMIN_KEY_STORAGE); window.location.reload() }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-2xl text-gray-900">Stock Management</h1>
            <p className="text-sm text-gray-500 mt-1">{products.length} products</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors"
          >
            + Add Product
          </button>
        </div>

        {/* Summary pills */}
        {!loading && !error && (
          <div className="flex flex-wrap gap-3 mb-10">
            {[
              { label: 'In Stock', count: products.filter((p) => p.stockStatus === 'in_stock').length, cls: 'bg-teal-50 text-teal-700' },
              { label: 'Low Stock', count: products.filter((p) => p.stockStatus === 'low_stock').length, cls: 'bg-amber-50 text-amber-700' },
              { label: 'Out of Stock', count: products.filter((p) => p.stockStatus === 'out_of_stock').length, cls: 'bg-rose-50 text-rose-700' },
            ].map((s) => (
              <div key={s.label} className={`${s.cls} px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide`}>
                {s.count} {s.label}
              </div>
            ))}
          </div>
        )}

      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={fetchStock} /> : (
        <div className="space-y-12">
          {Object.entries(groupedByCategory).map(([category, items]) => (
            <div key={category}>
              <h2 className="font-serif text-[13px] font-bold uppercase tracking-widest text-gray-500 mb-4">{category}</h2>
              <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden mb-12">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Product</th>
                        <th className="text-center px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Price</th>
                        <th className="text-center px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Stock Status</th>
                        <th className="text-center px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Quantity</th>
                        <th className="text-center px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Adjust</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((product) => (
                        <tr key={product.id} className="relative border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img src={product.imageUrl || product.image_url} alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                              <span className="font-semibold text-gray-900 text-sm">{product.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-medium text-gray-900">₹{product.price}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide
                              ${product.stockStatus === 'in_stock' ? 'bg-teal-50 text-teal-700' :
                                product.stockStatus === 'low_stock' ? 'bg-[#FFF4E5] text-[#D97706]' :
                                'bg-rose-50 text-rose-700'}`}>
                              {product.stockStatus === 'in_stock' ? 'In Stock' :
                               product.stockStatus === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-gray-900">
                            {product.stockQuantity}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-4">
                              <input
                                id={`stock-qty-${product.id}`}
                                type="number"
                                min="0"
                                placeholder={product.stockQuantity.toString()}
                                value={editing[product.id] ?? ''}
                                onChange={(e) =>
                                  setEditing((prev) => ({ ...prev, [product.id]: e.target.value }))
                                }
                                className="w-16 px-3 py-1.5 text-xs text-center text-gray-400 placeholder-gray-300 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                              />
                              {editing[product.id] !== undefined && editing[product.id] !== '' && (
                                <button
                                  id={`save-stock-${product.id}`}
                                  onClick={() => handleSave(product.id)}
                                  disabled={saving === product.id}
                                  className="text-orange-500 hover:text-orange-600 text-sm font-semibold px-2"
                                >
                                  {saving === product.id ? '...' : 'Save'}
                                </button>
                              )}
                              <button onClick={() => handleDelete(product.id, product.name)} className="text-gray-300 hover:text-red-500 p-1.5 transition-colors absolute right-6" title="Delete product">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isModalOpen && (
        <AddProductModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={(newProduct) => {
            fetchStock();
            setIsModalOpen(false);
          }}
          adminKey={adminKey}
        />
      )}
      </div>
    </div>
  )
}
