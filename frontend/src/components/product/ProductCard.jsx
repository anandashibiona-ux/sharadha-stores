import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

export default function ProductCard({ product }) {
  const { cart, addToCart } = useCart()

  const inCart = cart?.items?.some(item => item.product?.id === product.id)

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Image */}
      <Link to={`/products/${product.slug}`} className="relative aspect-[4/3] overflow-hidden block">
        <img
          src={product.imageUrl || product.image_url || product.imageData || product.image_data}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {/* Stock badge */}
        <span className={`absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-1 rounded-full
          ${product.stockQuantity === 0
            ? 'bg-red-100 text-red-600'
            : product.stockQuantity <= 5
            ? 'bg-amber-100 text-amber-600'
            : 'bg-green-100 text-green-600'}`}>
          {product.stockQuantity === 0 ? 'Out of Stock'
            : product.stockQuantity <= 5 ? 'Low Stock'
            : 'In Stock'}
        </span>
        {/* Discount badge */}
        {product.itemPrice && product.price && product.itemPrice > product.price && (
          <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {Math.round(((product.itemPrice - product.price) / product.itemPrice) * 100)}% OFF
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mb-1">
          {product.category?.name || product.categoryName || product.category || ''}
        </p>
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 text-[15px] mb-1.5 leading-snug line-clamp-2 hover:text-orange-500 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-[13px] text-gray-500 mb-4 line-clamp-2 flex-1">
          {product.shortDescription || product.description}
        </p>
        
        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[17px] font-bold text-gray-900 tracking-tight">
            ₹{product.price}
          </span>
          {product.itemPrice && product.itemPrice > product.price && (
            <span className="text-[13px] text-gray-400 line-through">₹{product.itemPrice}</span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            if (!inCart) addToCart(product, 1);
          }}
          disabled={product.stockQuantity === 0}
          className={`w-full text-[14px] font-semibold py-2.5 rounded-md
                     disabled:opacity-40 disabled:cursor-not-allowed
                     active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                       inCart 
                         ? 'bg-[#41b816] text-white hover:bg-[#3aa114] shadow-sm' 
                         : 'bg-white border border-orange-500 text-orange-500 hover:bg-orange-50'
                     }`}
        >
          {product.stockQuantity === 0 ? 'Out of Stock' : inCart ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              In Cart
            </>
          ) : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
