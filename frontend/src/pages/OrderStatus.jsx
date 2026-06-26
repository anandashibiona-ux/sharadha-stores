import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getOrder } from '../services/api'
import StatusBadge from '../components/common/StatusBadge'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { formatCurrency } from '../utils/validators'

export default function OrderStatus() {
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!orderNumber.trim()) return
    setLoading(true)
    setError(null)
    setOrder(null)
    try {
      const data = await getOrder(orderNumber.trim().toUpperCase())
      setOrder(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Order not found. Please check the order number.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container py-8 sm:py-12 max-w-lg">
      <div className="text-center mb-10">
        <div className="text-4xl mb-4">📦</div>
        <h1 className="section-title text-3xl mb-2">Track Your Order</h1>
        <p className="text-muted text-sm">Enter your order number to check the latest status.</p>
      </div>

      <form onSubmit={handleSearch} className="card p-6 mb-6">
        <label htmlFor="order-number-input" className="label">Order Number</label>
        <div className="flex gap-3">
          <input
            id="order-number-input"
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. SS-20240619-A3F2"
            className="input font-mono"
          />
          <button
            type="submit"
            id="track-order-btn"
            disabled={loading || !orderNumber.trim()}
            className="btn-primary px-5 flex-shrink-0"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Track'}
          </button>
        </div>
        {error && <p className="field-error mt-3">{error}</p>}
      </form>

      {order && (
        <div className="card p-6 space-y-5 animate-slide-up">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted">Order</p>
              <p className="font-mono font-semibold text-charcoal">{order.orderNumber}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="text-sm text-muted">
            <p>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="mt-0.5">{order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''} · {formatCurrency(order.total)}</p>
          </div>

          <div className="space-y-2">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-charcoal">{item.productName} <span className="text-muted">× {item.quantity}</span></span>
                <span className="text-muted">{formatCurrency(item.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div className="bg-background rounded-md p-4">
            <p className="text-xs text-muted mb-1">Delivering to</p>
            <p className="text-sm text-charcoal font-medium">{order.customer.name}</p>
            <p className="text-xs text-muted">{order.customer.city}, {order.customer.state} – {order.customer.pincode}</p>
          </div>

          <Link
            to={`/order/${order.orderNumber}`}
            className="btn-secondary text-sm w-full text-center py-2.5 block"
          >
            View Full Order Details
          </Link>
        </div>
      )}
    </div>
  )
}
