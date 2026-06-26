import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import AdminHeader from '../../components/admin/AdminHeader'
import { PageLoader, ErrorState } from '../../components/common/StateComponents'
import { formatCurrency } from '../../utils/validators'
import StatusBadge from '../../components/common/StatusBadge'

const ADMIN_KEY_STORAGE = 'sharadha_admin_key'

export default function CustomerDetails() {
  const { phone } = useParams()
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem(ADMIN_KEY_STORAGE))
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  if (!adminKey) {
    return (
      <div className="page-container py-12 text-center">
        <p className="text-muted mb-4">You must be logged in to access customer details.</p>
        <Link to="/admin" className="btn-primary text-sm">Go to Admin Login</Link>
      </div>
    )
  }

  const fetchCustomerData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`http://localhost:3001/api/orders/customer/${phone}`)
      setOrders(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load customer details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomerData()
  }, [phone])

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <AdminHeader onSignOut={() => { sessionStorage.removeItem(ADMIN_KEY_STORAGE); window.location.href='/admin' }} />
      <PageLoader />
    </div>
  )
  
  if (error) return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <AdminHeader onSignOut={() => { sessionStorage.removeItem(ADMIN_KEY_STORAGE); window.location.href='/admin' }} />
      <ErrorState message={error} onRetry={fetchCustomerData} />
    </div>
  )

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <AdminHeader onSignOut={() => { sessionStorage.removeItem(ADMIN_KEY_STORAGE); window.location.href='/admin' }} />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">No orders found for this customer.</p>
          <Link to="/admin" className="text-orange-500 hover:underline mt-4 inline-block">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  const customer = orders[0].customer
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <AdminHeader onSignOut={() => { sessionStorage.removeItem(ADMIN_KEY_STORAGE); window.location.href='/admin' }} />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Link to="/admin" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-orange-500 mb-6 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Customer Profile Card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div>
              <h1 className="font-serif text-3xl text-gray-900 mb-2">{customer.name}</h1>
              <div className="flex items-center text-gray-500 gap-4 mb-6">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {customer.phone}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {customer.email}
                  </span>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 max-w-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Delivery Address</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {customer.addressLine1}<br />
                  {customer.addressLine2 && <>{customer.addressLine2}<br /></>}
                  {customer.city}, {customer.state} {customer.pincode}
                </p>
              </div>
            </div>
            
            <div className="flex flex-row md:flex-col gap-4">
              <div className="bg-orange-50 rounded-xl p-5 border border-orange-200 min-w-[140px]">
                <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Total Orders</h3>
                <p className="font-serif text-3xl text-orange-500">{orders.length}</p>
              </div>
              <div className="bg-teal-50 rounded-xl p-5 border border-teal-100 min-w-[140px]">
                <h3 className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">Total Spent</h3>
                <p className="font-serif text-3xl text-teal-800">{formatCurrency(totalSpent)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <h2 className="font-serif text-xl text-gray-900 mb-6">Order History</h2>
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order #</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Items</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5">
                      <Link to={`/order/${order.orderNumber}`} target="_blank" className="font-mono text-sm text-orange-500 hover:underline font-medium">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-sm">
                      <div className="font-medium text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        {order.orderItems.map((item, idx) => (
                          <span key={idx} className="text-gray-700 text-sm">
                            {item.quantity}x {item.productName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-5 text-right font-semibold text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
