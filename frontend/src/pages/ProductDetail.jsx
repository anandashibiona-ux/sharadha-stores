import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProduct } from '../services/api'
import { useCart } from '../context/CartContext'
import StatusBadge from '../components/common/StatusBadge'
import { PageLoader, ErrorState } from '../components/common/StateComponents'
import { formatCurrency } from '../utils/validators'

export default function ProductDetail() {
  const { slug } = useParams()
  const { cart, addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    setLoading(true)
    getProduct(slug)
      .then(setProduct)
      .catch((err) => setError(err.response?.data?.error || 'Product not found'))
      .finally(() => setLoading(false))
  }, [slug])

  const handleAdd = async () => {
    setAdding(true)
    const result = await addToCart(product, quantity)
    setAdding(false)
    if (!result.success) {
      setFeedback({ type: 'error', message: result.message })
    } else {
      setFeedback({ type: 'success', message: 'Added to cart!' })
    }
    setTimeout(() => setFeedback(null), 3000)
  }

  if (loading) return <PageLoader />
  if (error) return (
    <div className="page-container py-12">
      <ErrorState message={error} />
      <div className="text-center mt-4">
        <Link to="/" className="btn-secondary text-sm">← Back to Shop</Link>
      </div>
    </div>
  )

  const isOutOfStock = product.stockStatus === 'out_of_stock'
  const inCart = cart?.items?.some(item => item.product?.id === product.id)

  return (
    <div className="page-container py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted mb-8">
        <Link to="/" className="hover:text-charcoal transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-charcoal">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="aspect-square rounded-xl overflow-hidden bg-background">
          <img src={product.imageUrl} alt={product.name}
            className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">{product.category}</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="font-semibold text-2xl text-charcoal">{formatCurrency(product.price)}</span>
            <StatusBadge status={product.stockStatus} />
          </div>

          <p className="text-muted leading-relaxed mb-8">{product.description}</p>

          {/* Quantity + Add */}
          {!isOutOfStock && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-border rounded-md overflow-hidden">
                <button
                   id="qty-decrease"
                   onClick={() => setQuantity(Math.max(1, quantity - 1))}
                   className="w-10 h-10 flex items-center justify-center text-muted hover:text-charcoal hover:bg-background transition-colors"
                >–</button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button
                   id="qty-increase"
                   onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                   className="w-10 h-10 flex items-center justify-center text-muted hover:text-charcoal hover:bg-background transition-colors"
                >+</button>
              </div>
              <button
                id="add-to-cart-detail"
                onClick={handleAdd}
                disabled={adding}
                className={`flex-1 py-3 font-semibold rounded-md transition-all flex items-center justify-center gap-2
                  ${adding || inCart 
                    ? 'bg-[#41b816] text-white hover:bg-[#3aa114] shadow-sm' 
                    : 'bg-white border border-orange-500 text-orange-500 hover:bg-orange-50'}`}
              >
                {adding ? 'Adding...' : inCart ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Added to Cart
                  </>
                ) : 'Add to Cart'}
              </button>
            </div>
          )}

          {isOutOfStock && (
            <div className="bg-error-light rounded-md p-4 mb-4">
              <p className="text-sm text-error font-medium">This product is currently out of stock.</p>
            </div>
          )}

          {feedback && (
            <p className={`text-sm mt-2 ${feedback.type === 'success' ? 'text-success' : 'text-error'}`}>
              {feedback.message}
            </p>
          )}

          {/* Info pills */}
          <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-3">
            {[
              { icon: '🏠', label: 'Homemade with care' },
              { icon: '🚚', label: 'Free delivery over ₹500' },
              { icon: '❌', label: 'No preservatives' },
              { icon: '📦', label: 'Sealed & hygienic' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-muted">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
