import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAdminOrders, updateOrderStatus, updateAdminOrderPayment } from '../../services/api'
import StatusBadge from '../../components/common/StatusBadge'
import { PageLoader, ErrorState } from '../../components/common/StateComponents'
import { formatCurrency } from '../../utils/validators'
import AdminHeader from '../../components/admin/AdminHeader'

const ADMIN_KEY_STORAGE = 'sharadha_admin_key'

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'DISPATCHED', 'DELIVERED', 'CANCELLED']

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem(ADMIN_KEY_STORAGE) || '')
  const [inputKey, setInputKey] = useState('')
  const [authenticated, setAuthenticated] = useState(!!sessionStorage.getItem(ADMIN_KEY_STORAGE))

  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null)

  const fetchOrders = async (key = adminKey) => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      if (dateFilter) params.date = dateFilter
      const data = await getAdminOrders(key, params)
      setOrders(data.orders)
      setTotal(data.total)
    } catch (err) {
      if (err.response?.status === 401) {
        setAuthenticated(false)
        sessionStorage.removeItem(ADMIN_KEY_STORAGE)
        setError('Invalid admin key. Please log in again.')
      } else {
        setError(err.response?.data?.error || 'Failed to load orders')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authenticated) fetchOrders()
  }, [authenticated, statusFilter, dateFilter])

  const handleLogin = async (e) => {
    e.preventDefault()
    sessionStorage.setItem(ADMIN_KEY_STORAGE, inputKey)
    setAdminKey(inputKey)
    setAuthenticated(true)
  }

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      const updated = await updateOrderStatus(adminKey, orderId, newStatus)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    setUpdatingPaymentId(orderId)
    try {
      const updated = await updateAdminOrderPayment(adminKey, orderId, newStatus)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: updated.paymentStatus } : o)))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update payment status')
    } finally {
      setUpdatingPaymentId(null)
    }
  }

  // ── Login wall ───────────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="page-container py-12 max-w-sm">
        <div className="card p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="font-serif text-2xl text-charcoal">Admin Access</h1>
            <p className="text-xs text-muted mt-1">Enter your admin key to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-key-input" className="label">Admin Key</label>
              <input
                id="admin-key-input"
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Enter admin key"
                className="input"
                required
              />
              {error && <p className="field-error mt-1">{error}</p>}
            </div>
            <button type="submit" id="admin-login-btn" className="btn-primary w-full py-2.5">
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <AdminHeader onSignOut={() => { sessionStorage.removeItem(ADMIN_KEY_STORAGE); setAuthenticated(false) }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl text-gray-900">Orders Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total orders</p>
        </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-full sm:w-auto"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
        </select>
        <input
          id="date-filter"
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="input w-full sm:w-auto"
        />
        {(statusFilter || dateFilter) && (
          <button
            id="clear-filters-btn"
            onClick={() => { setStatusFilter(''); setDateFilter('') }}
            className="btn-ghost text-sm"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={() => fetchOrders()} /> : (
        <div className="card overflow-hidden">
          {orders.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted text-sm">No orders found for the selected filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Order #</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Items</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Total</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Payment</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-background transition-colors">
                      <td className="px-4 py-3.5">
                        <Link to={`/order/${order.orderNumber}`} target="_blank"
                          className="font-mono text-xs text-accent hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link to={`/admin/customer/${order.customer.phone}`} className="font-medium text-charcoal hover:text-orange-500 hover:underline transition-colors block">
                          {order.customer.name}
                        </Link>
                        <p className="text-xs text-muted mt-0.5">{order.customer.phone}</p>
                      </td>
                      <td className="px-4 py-3.5 text-muted">{order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}</td>
                      <td className="px-4 py-3.5 text-right font-semibold text-charcoal">{formatCurrency(order.total)}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3.5">
                        {order.paymentStatus === 'VERIFICATION_PENDING' ? (
                          <button
                            onClick={() => handlePaymentStatusChange(order.id, 'PAID')}
                            disabled={updatingPaymentId === order.id}
                            className="bg-orange-100 text-orange-700 hover:bg-orange-200 text-xs font-bold px-3 py-1.5 rounded-md border border-orange-200 shadow-sm transition-colors"
                          >
                            {updatingPaymentId === order.id ? 'Verifying...' : 'Verify Payment'}
                          </button>
                        ) : (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                            order.paymentStatus === 'PAID' || order.paymentStatus === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                            order.paymentStatus === 'PENDING' ? 'bg-gray-100 text-gray-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {order.paymentStatus.replace('_', ' ')}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted whitespace-nowrap">
                        <div className="font-medium text-gray-700">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <select
                          id={`order-status-${order.id}`}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className="input py-1 text-xs w-auto"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  )
}
