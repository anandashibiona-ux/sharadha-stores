import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import CartDrawer from '../cart/CartDrawer'

export default function Navbar() {
  const { cart, cartOpen, setCartOpen } = useCart()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Case-insensitive check to hide customer navbar on admin routes
  if (location.pathname.toLowerCase().startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <nav className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 py-0' 
          : 'bg-white border-b border-gray-100 shadow-none py-1'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* LEFT — Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Sharadha Stores Logo" className="w-9 h-9 object-contain drop-shadow-sm flex-shrink-0 rounded-md" />
              <div className="leading-none">
                <p className="font-serif text-xl font-bold tracking-tight">
                  <span className="text-gray-900">Sharadha</span> <span className="text-orange-500">Stores</span>
                </p>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1 font-medium">Homemade &amp; Traditional</p>
              </div>
            </Link>

            {/* RIGHT — Track Order + Profile + Cart grouped together */}
            <div className="flex items-center gap-6">
              <Link
                to="/track"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="hidden sm:inline">Track Order</span>
              </Link>
              <Link
                to="/profile"
                title="Profile"
                className="p-2 text-gray-600 hover:text-orange-500 rounded-full hover:ring-2 hover:ring-orange-500/30 transition-all flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
              <button
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-2 text-sm text-gray-600
                           hover:text-orange-500 font-medium transition-colors relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor"
                     strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 19a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z"/>
                </svg>
                <span className="hidden sm:inline">Cart</span>
                {cart.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white
                                   text-[10px] rounded-full w-4 h-4 flex items-center
                                   justify-center font-bold">
                    {cart.itemCount}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
