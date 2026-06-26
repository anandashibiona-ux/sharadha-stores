import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { AddressForm, DeliveryOptions, OrderSummary } from '../components/checkout/CheckoutComponents'
import { validateCheckoutForm } from '../utils/validators'
import { placeOrder } from '../services/api'
import { EmptyState } from '../components/common/StateComponents'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

const INITIAL_FORM = {
  name: '', phone: '', email: '',
  addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
  deliveryNotes: '',
}

export default function Checkout() {
  const { cart, sessionId, fetchCart } = useCart()
  const navigate = useNavigate()
  
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [deliveryOption, setDeliveryOption] = useState('standard')
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState(null)

  useEffect(() => {
    // Load saved address
    const savedAddress = localStorage.getItem('savedDeliveryAddress')
    if (savedAddress) {
      try {
        setForm(JSON.parse(savedAddress))
      } catch(e) {}
    }
  }, [])

  if (cart.items.length === 0) {
    return (
      <div className="page-container py-12">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Add some products before checking out."
          action={<Link to="/" className="btn-primary text-sm">Browse Products</Link>}
        />
      </div>
    )
  }

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { errors: validationErrors, isValid } = validateCheckoutForm(form)
    if (!isValid) {
      setErrors(validationErrors)
      // Scroll to first error
      const firstKey = Object.keys(validationErrors)[0]
      document.getElementById(firstKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSubmitting(true)
    setApiError(null)

    try {
      // Save address and delivery option to localStorage
      localStorage.setItem('savedDeliveryAddress', JSON.stringify(form))
      localStorage.setItem('savedDeliveryOption', deliveryOption)
      
      // Redirect to payment page directly (Order is NOT created yet)
      navigate(`/payment`)
    } catch (err) {
      setApiError('Failed to process checkout. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="page-container py-8 sm:py-12">
      <h1 className="section-title mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — address + delivery */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <AddressForm values={form} errors={errors} onChange={handleChange} />
            </div>

            <div className="card p-6">
              <DeliveryOptions
                selected={deliveryOption}
                onChange={setDeliveryOption}
                subtotal={cart.subtotal}
              />
            </div>
          </div>

          {/* Right — order summary + place order */}
          <div className="space-y-4">
            <OrderSummary cart={cart} deliveryOption={deliveryOption} />

            {apiError && (
              <div className="bg-error-light rounded-md p-4">
                <p className="text-sm text-error">{apiError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3.5 text-base"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  Saving Details...
                </span>
              ) : 'Save & Continue to Payment'}
            </button>

            <p className="text-xs text-center text-muted">
              You will be able to review your order and select a payment method on the next page.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
