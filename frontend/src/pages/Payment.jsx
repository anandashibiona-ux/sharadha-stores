import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { initiateOrderPayment, verifyOrderPayment } from '../services/api'
import { useCart } from '../context/CartContext'

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}
import { PaymentOptions, AddressForm } from '../components/checkout/CheckoutComponents'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { EmptyState } from '../components/common/StateComponents'
import { formatCurrency, validateCheckoutForm } from '../utils/validators'

export default function Payment() {
  const navigate = useNavigate()
  const { cart, sessionId, fetchCart } = useCart()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [deliveryOption, setDeliveryOption] = useState('standard')

  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD')
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '', cardExpiry: '', cardCvv: '', cardName: '',
    upiId: '', bankName: ''
  })
  
  // Edit Address
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [editErrors, setEditErrors] = useState({})
  const [savingAddress, setSavingAddress] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState(null)

  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/cart', { replace: true })
      return
    }

    const savedAddress = localStorage.getItem('savedDeliveryAddress')
    const savedOption = localStorage.getItem('savedDeliveryOption') || 'standard'
    
    if (!savedAddress) {
      navigate('/checkout', { replace: true })
      return
    }

    try {
      const parsedAddress = JSON.parse(savedAddress)
      setCustomer(parsedAddress)
      setEditForm(parsedAddress)
      setDeliveryOption(savedOption)
      setLoading(false)
    } catch(e) {
      navigate('/checkout', { replace: true })
    }
  }, [cart, navigate])

  const handleEditChange = (name, value) => {
    setEditForm(prev => ({ ...prev, [name]: value }))
    if (editErrors[name]) setEditErrors(prev => ({ ...prev, [name]: null }))
  }

  const handleSaveAddress = async () => {
    const { errors: validationErrors, isValid } = validateCheckoutForm(editForm)
    if (!isValid) {
      setEditErrors(validationErrors)
      return
    }

    setSavingAddress(true)
    try {
      localStorage.setItem('savedDeliveryAddress', JSON.stringify(editForm))
      setCustomer(editForm)
      setIsEditingAddress(false)
    } catch (err) {
      setApiError('Failed to update address.')
    } finally {
      setSavingAddress(false)
    }
  }

  const processCOD = async () => {
    setSubmitting(true)
    setApiError(null)
    try {
      const order = await verifyOrderPayment('intent-cod', {
        sessionId,
        customer,
        deliveryOption,
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentData: { method: 'COD' }
      })
      
      const existingOrders = JSON.parse(localStorage.getItem('savedOrderNumbers') || '[]')
      if (!existingOrders.includes(order.orderNumber)) {
        existingOrders.push(order.orderNumber)
        localStorage.setItem('savedOrderNumbers', JSON.stringify(existingOrders))
      }
      await fetchCart() // clear cart in UI
      navigate(`/order/${order.orderNumber}`, { replace: true })
    } catch (err) {
      setApiError('Failed to confirm order. Please try again.')
      setSubmitting(false)
    }
  }

  const processPayment = async () => {
    if (paymentMethod === 'CASH_ON_DELIVERY') {
      return processCOD()
    }
    
    // Online validation
    if (paymentMethod === 'CREDIT_CARD') {
      if (!paymentDetails.cardNumber || !paymentDetails.cardExpiry || !paymentDetails.cardCvv || !paymentDetails.cardName) {
        setApiError('Please fill in all credit card details to proceed.')
        return
      }
    } else if (paymentMethod === 'NET_BANKING') {
      if (!paymentDetails.bankName) {
        setApiError('Please select a bank to proceed.')
        return
      }
    }

    setSubmitting(true)
    setApiError(null)

    try {
      // 1. Initiate secure payment intent
      const intent = await initiateOrderPayment('checkout-session', { 
        sessionId, 
        customer, 
        deliveryOption,
        paymentMethod 
      })

      if (intent.provider === 'RAZORPAY') {
        const res = await loadRazorpay()
        if (!res) throw new Error('Razorpay SDK failed to load. Please check your connection.')

        const options = {
          key: intent.key,
          amount: intent.amount,
          currency: intent.currency,
          name: 'Sharadha Stores',
          description: `Order ${intent.orderId}`,
          order_id: intent.orderId,
          prefill: {
            name: intent.customer.name,
            email: intent.customer.email,
            contact: intent.customer.phone
          },
          handler: async function (response) {
            try {
              setSubmitting(true)
              const order = await verifyOrderPayment('intent-online', {
                sessionId,
                customer,
                deliveryOption,
                paymentMethod,
                paymentData: response,
                paymentDetails
              })
              const existingOrders = JSON.parse(localStorage.getItem('savedOrderNumbers') || '[]')
              if (!existingOrders.includes(order.orderNumber)) {
                existingOrders.push(order.orderNumber)
                localStorage.setItem('savedOrderNumbers', JSON.stringify(existingOrders))
              }
              await fetchCart()
              navigate(`/order/${order.orderNumber}`, { replace: true })
            } catch (err) {
              setApiError('Payment verification failed. Please contact support.')
              setSubmitting(false)
            }
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false)
            }
          }
        }
        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', function (response) {
          setApiError(response.error.description || 'Payment failed.')
          setSubmitting(false)
        })
        rzp.open()
      } else if (intent.provider === 'MOCK') {
        // 2. Mock processing
        await new Promise(r => setTimeout(r, 800))
        const order = await verifyOrderPayment('intent-online', {
          sessionId,
          customer,
          deliveryOption,
          paymentMethod,
          paymentData: { mock_order_id: intent.orderId, mock_payment_id: `MOCK_TXN_${Date.now()}` },
          paymentDetails
        })
        const existingOrders = JSON.parse(localStorage.getItem('savedOrderNumbers') || '[]')
        if (!existingOrders.includes(order.orderNumber)) {
          existingOrders.push(order.orderNumber)
          localStorage.setItem('savedOrderNumbers', JSON.stringify(existingOrders))
        }
        await fetchCart()
        navigate(`/order/${order.orderNumber}`, { replace: true })
      }
    } catch (err) {
      setApiError(err.response?.data?.error || err.message || 'Payment processing failed. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="page-container py-12">
        <EmptyState title="Information missing" description="Customer details or cart is empty." />
      </div>
    )
  }

  const deliveryFee = deliveryOption === 'express' ? 100 : 50;
  const totalAmount = cart.subtotal + deliveryFee;

  return (
    <div className="page-container py-8 sm:py-12">
      <h1 className="section-title mb-8">Complete Your Payment</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Payment options */}
        <div className="lg:col-span-2 space-y-6">
          {apiError && (
            <div className="bg-error-light rounded-md p-4 mb-4">
              <p className="text-sm text-error">{apiError}</p>
            </div>
          )}
          <div className="card p-6">
            <PaymentOptions
              selected={paymentMethod}
              onChange={setPaymentMethod}
              details={paymentDetails}
              onDetailsChange={(key, value) => setPaymentDetails(prev => ({ ...prev, [key]: value }))}
              totalAmount={totalAmount}
              onSubmit={processPayment}
              isSubmitting={submitting}
            />
          </div>
        </div>

        {/* Right column - Summary and Address */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="card p-5 bg-surface border-border">
            <h3 className="font-medium text-charcoal mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted">{item.quantity}x {item.product.name}</span>
                  <span className="text-charcoal font-medium">{formatCurrency(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Delivery Fee</span>
                <span>{deliveryFee === 0 ? <span className="text-success">Free</span> : formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-medium text-base pt-2">
                <span className="text-charcoal">Total</span>
                <span className="text-accent">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="card p-5 bg-surface border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-charcoal">Delivery Address</h3>
              {!isEditingAddress && (
                <button 
                  onClick={() => setIsEditingAddress(true)}
                  className="text-xs font-medium text-accent underline"
                >
                  Change
                </button>
              )}
            </div>
            
            {isEditingAddress ? (
              <div className="space-y-4 animate-fade-in">
                <AddressForm values={editForm} errors={editErrors} onChange={handleEditChange} />
                <div className="flex gap-3">
                  <button onClick={() => setIsEditingAddress(false)} className="btn-secondary flex-1 py-2 text-sm">Cancel</button>
                  <button onClick={handleSaveAddress} disabled={savingAddress} className="btn-primary flex-1 py-2 text-sm">
                    {savingAddress ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted">
                <p className="font-medium text-charcoal">{customer.name}</p>
                <p>{customer.addressLine1}</p>
                {customer.addressLine2 && <p>{customer.addressLine2}</p>}
                <p>{customer.city}, {customer.state} {customer.pincode}</p>
                <p className="mt-2">📞 +91 {customer.phone}</p>
              </div>
            )}
          </div>

          <div className="text-center py-4 text-sm text-muted bg-surface rounded-md border border-border">
            Please complete your payment to finalize the order.
          </div>
        </div>
      </div>
    </div>
  )
}
