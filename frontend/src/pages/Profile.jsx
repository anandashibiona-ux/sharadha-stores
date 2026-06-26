import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getOrdersByPhone } from '../services/api'
import StatusBadge from '../components/common/StatusBadge'
import { PageLoader, EmptyState } from '../components/common/StateComponents'
import { formatCurrency } from '../utils/validators'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

export default function Profile() {
  const [address, setAddress] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Phone entry state for users who cleared storage / new device
  const [phoneInput, setPhoneInput] = useState('')
  const [fetchingByPhone, setFetchingByPhone] = useState(false)
  const [phoneError, setPhoneError] = useState('')

  useEffect(() => {
    // Load Address from device
    const savedAddress = localStorage.getItem('savedDeliveryAddress')
    let currentAddress = null
    if (savedAddress) {
      try {
        currentAddress = JSON.parse(savedAddress)
        setAddress(currentAddress)
      } catch (e) {
        console.error("Failed to parse saved address")
      }
    }

    if (currentAddress && currentAddress.phone) {
      fetchOrdersForPhone(currentAddress.phone)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchOrdersForPhone = async (phoneToFetch) => {
    setLoading(true)
    setPhoneError('')
    try {
      // Backend handles fetching ALL orders for this phone number directly!
      const fetchedOrders = await getOrdersByPhone(phoneToFetch)
      setOrders(fetchedOrders)
      
      // If we found orders but don't have an address stored locally, save their latest address
      if (fetchedOrders.length > 0 && !address) {
        const latestAddress = {
          name: fetchedOrders[0].customer.name,
          phone: fetchedOrders[0].customer.phone,
          email: fetchedOrders[0].customer.email,
          addressLine1: fetchedOrders[0].customer.addressLine1,
          addressLine2: fetchedOrders[0].customer.addressLine2,
          city: fetchedOrders[0].customer.city,
          state: fetchedOrders[0].customer.state,
          pincode: fetchedOrders[0].customer.pincode,
        }
        setAddress(latestAddress)
        localStorage.setItem('savedDeliveryAddress', JSON.stringify(latestAddress))
      }
    } catch (err) {
      console.error("Failed to load orders from backend")
      setPhoneError("Could not find any orders for this number.")
    } finally {
      setLoading(false)
      setFetchingByPhone(false)
    }
  }

  const handlePhoneSubmit = (e) => {
    e.preventDefault()
    if (phoneInput.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number')
      return
    }
    setFetchingByPhone(true)
    fetchOrdersForPhone(phoneInput)
  }

  if (loading && !fetchingByPhone) return <PageLoader />

  return (
    <div className="bg-background min-h-screen pb-12">
      {/* Premium Header Banner */}
      <div className="bg-charcoal text-white pt-10 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-2xl shadow-lg border-2 border-charcoal flex-shrink-0">
            👤
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-2xl sm:text-3xl mb-1 truncate">{address ? `Welcome, ${address.name}` : 'My Account'}</h1>
            <p className="text-muted text-sm tracking-wide">Manage your details and track your orders</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar - Account Details */}
          <div className="lg:col-span-4 space-y-6">
            <div className="card p-6 bg-white shadow-lg border border-border/50 rounded-xl">
              <h2 className="font-serif text-lg text-charcoal mb-5 pb-3 border-b border-border flex items-center justify-between">
                <span>Account Details</span>
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </h2>
              
              {address ? (
                <div className="space-y-4 text-sm text-charcoal">
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider mb-1 font-semibold">Primary Address</p>
                    <p className="font-medium">{address.name}</p>
                    <p className="text-muted mt-0.5">{address.addressLine1}</p>
                    {address.addressLine2 && <p className="text-muted">{address.addressLine2}</p>}
                    <p className="text-muted">{address.city}, {address.state} – {address.pincode}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-border/50 space-y-3">
                    <p className="text-xs text-muted uppercase tracking-wider mb-1 font-semibold">Contact Info</p>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      <span>+91 {address.phone}</span>
                    </div>
                    {address.email && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <span>{address.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  <p className="text-sm text-muted mb-4 leading-relaxed">
                    We securely load your details from the server based on your phone number.
                  </p>
                  <form onSubmit={handlePhoneSubmit}>
                    <label className="label text-xs">Enter Mobile Number</label>
                    <input 
                      type="tel" 
                      className="input py-2.5 mb-2" 
                      placeholder="10-digit mobile number" 
                      value={phoneInput}
                      onChange={e => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                      maxLength="10"
                    />
                    {phoneError && <p className="text-error text-xs mb-3">{phoneError}</p>}
                    <button type="submit" disabled={fetchingByPhone} className="btn-primary w-full py-2.5">
                      {fetchingByPhone ? <><LoadingSpinner size="sm"/> Loading Profile...</> : 'Sync My Profile'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Orders List */}
          <div className="lg:col-span-8">
            <h2 className="font-serif text-xl text-charcoal mb-5 flex items-center gap-2">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Order History
            </h2>
            
            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.orderNumber} className="card bg-white shadow-md border border-border/50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    
                    {/* Order Header */}
                    <div className="bg-surface/50 border-b border-border/50 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:gap-8 gap-2">
                        <div>
                          <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-0.5">Order Placed</p>
                          <p className="text-sm font-medium text-charcoal">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-0.5">Total</p>
                          <p className="text-sm font-medium text-charcoal">{formatCurrency(order.total)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-0.5">Order #</p>
                          <p className="text-sm font-medium text-charcoal font-mono">{order.orderNumber}</p>
                        </div>
                        {order.payment?.transactionId && (
                          <div>
                            <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-0.5">Txn ID</p>
                            <p className="text-xs font-medium text-charcoal font-mono bg-gray-100 px-1 py-0.5 rounded inline-block">{order.payment.transactionId}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                    
                    {/* Order Products */}
                    <div className="p-4 sm:px-6">
                      <div className="flex flex-wrap gap-4 mb-5">
                        {order.orderItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 w-full sm:w-[calc(50%-1rem)] p-3 rounded-lg border border-border/30 bg-surface/30">
                            <img 
                              src={item.product?.imageUrl} 
                              alt={item.productName} 
                              className="w-16 h-16 object-cover rounded-md border border-border shadow-sm"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-charcoal truncate">{item.productName}</p>
                              <p className="text-xs text-muted mt-1">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Order Footer Actions */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            ['PAID', 'CONFIRMED'].includes(order.paymentStatus) 
                              ? 'bg-success-light text-success-dark' 
                              : 'bg-warning-light text-warning-dark'
                          }`}>
                            {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : 'Paid Online'}
                          </span>
                        </div>
                        <Link 
                          to={`/order/${order.orderNumber}`}
                          className="btn-primary py-2 px-6 text-sm w-full sm:w-auto shadow-sm"
                        >
                          Track Package
                        </Link>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md border border-border/50">
                <EmptyState 
                  icon="📦" 
                  title="No orders yet" 
                  description="You haven't placed any orders. Discover our traditional homemade products!" 
                  action={<Link to="/" className="btn-primary">Start Shopping</Link>}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
