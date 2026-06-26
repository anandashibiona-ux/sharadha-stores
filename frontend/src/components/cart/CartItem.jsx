import { useCart } from '../../context/CartContext'
import { formatCurrency } from '../../utils/validators'

export default function CartItem({ item }) {
  const { updateItem, removeItem, loading } = useCart()

  return (
    <div className="flex gap-3 py-4 border-b border-border last:border-0">
      {/* Image */}
      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-background">
        <img src={item.product.imageUrl} alt={item.product.name}
          className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal leading-snug truncate">{item.product.name}</p>
        <p className="text-xs text-muted mt-0.5">{formatCurrency(item.product.price)} each</p>

        {/* Quantity stepper */}
        <div className="flex items-center gap-2 mt-2">
          <button
            id={`decrease-qty-${item.id}`}
            onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
            disabled={loading}
            className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted hover:text-charcoal hover:border-charcoal transition-colors disabled:opacity-50"
            aria-label="Decrease quantity"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
          <button
            id={`increase-qty-${item.id}`}
            onClick={() => updateItem(item.id, item.quantity + 1)}
            disabled={loading || item.quantity >= item.product.stockQuantity}
            className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted hover:text-charcoal hover:border-charcoal transition-colors disabled:opacity-50"
            aria-label="Increase quantity"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Line total + remove */}
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <span className="text-sm font-semibold text-charcoal">{formatCurrency(item.lineTotal)}</span>
        <button
          id={`remove-item-${item.id}`}
          onClick={() => removeItem(item.id)}
          className="text-xs text-muted hover:text-error transition-colors"
          aria-label="Remove item"
        >
          Remove
        </button>
      </div>
    </div>
  )
}
