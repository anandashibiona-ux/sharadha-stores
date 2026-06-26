import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrder } from '../services/api'
import StatusBadge from '../components/common/StatusBadge'
import { PageLoader, ErrorState } from '../components/common/StateComponents'
import { formatCurrency } from '../utils/validators'

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'DISPATCHED', 'DELIVERED']

export default function OrderConfirmation() {
  const { orderNumber } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getOrder(orderNumber)
      .then(setOrder)
      .catch((err) => setError(err.response?.data?.error || 'Order not found'))
      .finally(() => setLoading(false))
  }, [orderNumber])

  if (loading) return <PageLoader />
  if (error) return (
    <div className="page-container py-12">
      <ErrorState message={error} />
    </div>
  )

  const stepIndex = STATUS_STEPS.indexOf(order.status)

  let parsedDetails = null
  if (order.payment?.paymentDetails) {
    try { parsedDetails = JSON.parse(order.payment.paymentDetails) } catch(e){}
  }

  return (
    <div className="page-container py-8 sm:py-12 max-w-2xl">
      <div className="text-center mb-10 print:hidden">
        <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl text-charcoal mb-2">Order Confirmed!</h1>
        <p className="text-muted">Thank you, {order.customer.name}. Your payment was successful and we've received your order.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <div className="inline-flex items-center gap-2 bg-background rounded-full px-4 py-2 border border-border">
            <span className="text-xs text-muted uppercase tracking-wider font-semibold">Order ID</span>
            <span className="text-sm font-bold text-charcoal font-mono">{order.orderNumber}</span>
          </div>
          {order.payment?.transactionId && (
            <div className="inline-flex items-center gap-2 bg-orange-50 rounded-full px-4 py-2 border border-orange-100">
              <span className="text-xs text-orange-600 uppercase tracking-wider font-semibold">Transaction ID</span>
              <span className="text-sm font-bold text-orange-900 font-mono">{order.payment.transactionId}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted mt-3">Placed on {new Date(order.createdAt).toLocaleString()}</p>
      </div>

      {/* Invoice Header (Print Only) */}
      <div className="hidden print:block mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-serif text-charcoal mb-2">Sharadha Stores</h1>
        <h2 className="text-xl font-medium text-muted mb-4">Invoice / Receipt</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><span className="font-semibold">Order ID:</span> {order.orderNumber}</p>
            {order.payment?.transactionId && <p><span className="font-semibold">Transaction ID:</span> {order.payment.transactionId}</p>}
          </div>
          <div className="text-right">
            <p><span className="font-semibold">Date:</span> {new Date(order.createdAt).toLocaleString()}</p>
            <p><span className="font-semibold">Status:</span> {order.status}</p>
          </div>
        </div>
      </div>

      {/* Progress tracker */}
      {order.status !== 'CANCELLED' && (
        <div className="card p-6 mb-6 print:hidden">
          <h2 className="font-serif text-lg text-charcoal mb-5">Order Status</h2>
          <div className="relative">
            {/* Progress bar */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border" />
            <div
              className="absolute left-4 top-4 w-0.5 bg-accent transition-all duration-500"
              style={{ height: `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
            />

            <div className="space-y-6 relative">
              {STATUS_STEPS.map((step, i) => {
                const done = i <= stepIndex
                return (
                  <div key={step} className="flex items-start gap-4 pl-0">
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center z-10
                      ${done ? 'bg-accent text-white' : 'bg-surface border-2 border-border text-muted'}`}>
                      {done ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs font-medium">{i + 1}</span>
                      )}
                    </div>
                    <div className="pt-1">
                      <p className={`text-sm font-medium ${done ? 'text-charcoal' : 'text-muted'}`}>
                        {step.charAt(0) + step.slice(1).toLowerCase()}
                      </p>
                      {i === stepIndex && (
                        <p className="text-xs text-accent font-medium">Current status</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Order items */}
      <div className="card p-6 mb-6">
        <h2 className="font-serif text-lg text-charcoal mb-4">Items Ordered</h2>
        <div className="space-y-3">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <img
                src={item.product?.imageUrl}
                alt={item.productName}
                className="w-12 h-12 rounded-md object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal truncate">{item.productName}</p>
                <p className="text-xs text-muted">Qty: {item.quantity} × {formatCurrency(item.unitPrice)}</p>
              </div>
              <span className="text-sm font-semibold text-charcoal">{formatCurrency(item.lineTotal)}</span>
            </div>
          ))}
        </div>

        <div className="divider" />

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Delivery</span>
            <span>{Number(order.deliveryFee) === 0 ? 'Free' : formatCurrency(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-semibold text-charcoal text-base pt-2 border-t border-border">
            <span>Total</span><span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Address & Payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {/* Delivery address */}
        <div className="card p-6">
          <h2 className="font-serif text-lg text-charcoal mb-3">Delivery Address</h2>
          <address className="not-italic text-sm text-muted leading-relaxed">
            <strong className="text-charcoal">{order.customer.name}</strong><br />
            {order.customer.addressLine1}<br />
            {order.customer.addressLine2 && <>{order.customer.addressLine2}<br /></>}
            {order.customer.city}, {order.customer.state} – {order.customer.pincode}<br />
            📞 {order.customer.phone}
          </address>
        </div>

        {/* Payment Details */}
        <div className="card p-6">
          <h2 className="font-serif text-lg text-charcoal mb-3">Payment Details</h2>
          <div className="text-sm text-muted leading-relaxed space-y-2">
            <p>
              <span className="text-charcoal font-medium block">Method</span>
              {order.paymentMethod === 'CREDIT_CARD' ? 'Credit/Debit Card' :
               order.paymentMethod === 'NET_BANKING' ? 'Net Banking' :
               order.paymentMethod === 'UPI' ? 'UPI' :
               'Cash on Delivery'}
            </p>
            <p>
              <span className="text-charcoal font-medium block">Status</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                ['PAID', 'CONFIRMED'].includes(order.paymentStatus) 
                  ? 'bg-success-light text-success-dark' 
                  : order.paymentStatus === 'FAILED'
                    ? 'bg-error-light text-error-dark'
                    : 'bg-warning-light text-warning-dark'
              }`}>
                {order.paymentStatus}
              </span>
            </p>
            {order.payment?.transactionId && (
              <p>
                <span className="text-charcoal font-medium block mt-3">Transaction ID</span>
                <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{order.payment.transactionId}</span>
              </p>
            )}
            {parsedDetails && parsedDetails.cardNumber && (
              <p>
                <span className="text-charcoal font-medium block mt-3">Card Number</span>
                <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">**** **** **** {parsedDetails.cardNumber.slice(-4)}</span>
              </p>
            )}
            {parsedDetails && parsedDetails.upiId && (
              <p>
                <span className="text-charcoal font-medium block mt-3">UPI ID</span>
                <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{parsedDetails.upiId}</span>
              </p>
            )}
            {parsedDetails && parsedDetails.bankName && (
              <p>
                <span className="text-charcoal font-medium block mt-3">Bank Name</span>
                <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{parsedDetails.bankName}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 print:hidden">
        <button onClick={() => window.print()} className="btn-secondary flex-1 py-3 border-border hover:bg-gray-50 flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Download Invoice
        </button>
        <Link to="/profile" className="btn-secondary flex-1 text-center py-3">View Order History</Link>
        <Link to="/" className="btn-primary flex-1 text-center py-3">Continue Shopping</Link>
      </div>
    </div>
  )
}
