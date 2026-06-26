import { useNavigate } from 'react-router-dom'
import CartItem from './CartItem'
import { useCart } from '../../context/CartContext'
import { formatCurrency } from '../../utils/validators'

export default function CartDrawer({ open, onClose }) {
  const { cart } = useCart()
  const navigate = useNavigate()

  const handleCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-charcoal/30 backdrop-blur-sm z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-surface z-50 flex flex-col
          shadow-modal transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0 animate-slide-in-right' : 'translate-x-full'}`}
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-serif text-lg text-charcoal">
            Your Cart {cart.itemCount > 0 && <span className="text-muted text-sm font-sans">({cart.itemCount} items)</span>}
          </h2>
          <button
            id="close-cart-drawer"
            onClick={onClose}
            className="btn-ghost p-1.5 rounded-md"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5">
          {(!cart.items || cart.items.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-5xl mb-4">🛒</div>
              <p className="font-serif text-lg text-charcoal mb-1">Your cart is empty</p>
              <p className="text-sm text-muted mb-6">Add some homemade goodness!</p>
              <button onClick={onClose} className="btn-secondary text-sm">Browse Products</button>
            </div>
          ) : (
            <div>
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items && cart.items.length > 0 && (
          <div className="border-t border-border px-5 py-4 space-y-3 bg-background/50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Delivery</span>
                <span>{cart.deliveryFee === 0 ? <span className="text-success font-medium">Free</span> : formatCurrency(cart.deliveryFee)}</span>
              </div>
              {cart.subtotal < 500 && (
                <p className="text-xs text-muted bg-accent-light rounded-md px-3 py-2">
                  Add {formatCurrency(500 - cart.subtotal)} more for free delivery
                </p>
              )}
              <div className="flex justify-between font-semibold text-charcoal pt-2 border-t border-border text-base">
                <span>Total</span>
                <span>{formatCurrency(cart.total)}</span>
              </div>
            </div>
            <button
              id="cart-checkout-btn"
              onClick={handleCheckout}
              className="btn-primary w-full py-3"
            >
              Proceed to Checkout
            </button>
            <button onClick={onClose} className="btn-ghost w-full text-sm">
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
