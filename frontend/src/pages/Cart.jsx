import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CartItem from '../components/cart/CartItem'
import { EmptyState } from '../components/common/StateComponents'
import { formatCurrency } from '../utils/validators'

export default function Cart() {
  const { cart, clearCart } = useCart()
  const navigate = useNavigate()

  return (
    <div className="page-container py-8 sm:py-12">
      <h1 className="section-title mb-8">Shopping Cart</h1>

      {cart.items.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Browse our homemade foods and add something delicious."
          action={<Link to="/" className="btn-primary text-sm">Browse Products</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted">{cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''}</p>
                <button
                  id="clear-cart-btn"
                  onClick={clearCart}
                  className="text-xs text-muted hover:text-error transition-colors"
                >
                  Clear all
                </button>
              </div>
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
            <div className="mt-4">
              <Link to="/" className="btn-ghost text-sm">← Continue Shopping</Link>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="card p-5 space-y-4 sticky top-24">
              <h2 className="font-serif text-lg text-charcoal">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})</span>
                  <span>{formatCurrency(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Delivery</span>
                  <span>{cart.deliveryFee === 0
                    ? <span className="text-success font-medium">Free</span>
                    : formatCurrency(cart.deliveryFee)}
                  </span>
                </div>
                {cart.subtotal < 500 && (
                  <div className="bg-accent-light rounded-md px-3 py-2">
                    <p className="text-xs text-accent">
                      Add {formatCurrency(500 - cart.subtotal)} more for free delivery
                    </p>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-charcoal text-base pt-3 border-t border-border">
                  <span>Total</span>
                  <span>{formatCurrency(cart.total)}</span>
                </div>
              </div>
              <button
                id="cart-page-checkout-btn"
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full py-3"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
