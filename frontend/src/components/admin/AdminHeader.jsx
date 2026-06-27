import { Link, useLocation } from 'react-router-dom'

export default function AdminHeader({ onSignOut }) {
  const location = useLocation()
  
  const navLinks = [
    { name: 'Orders', path: '/admin' },
    { name: 'Stock', path: '/admin/stock' },
    { name: 'Categories', path: '/admin/categories' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT — Logo */}
          <Link to="/admin" className="flex items-center gap-2 sm:gap-3 w-auto">
            <img src="/logo.png" alt="Sharadha Stores Logo" className="w-9 h-9 object-contain drop-shadow-sm flex-shrink-0 rounded-md" />
            <div className="leading-none hidden sm:block">
              <p className="font-serif text-xl font-bold tracking-tight">
                <span className="text-gray-900">Sharadha</span> <span className="text-orange-500">Stores</span>
              </p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1 font-medium">Admin Panel</p>
            </div>
          </Link>

          {/* CENTER — Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 flex-1 justify-center overflow-x-auto px-2 mx-2 scrollbar-hide">
            {navLinks.map((link) => {
              // Case-insensitive active check
              const isActive = location.pathname.toLowerCase() === link.path.toLowerCase()
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-orange-50 text-orange-500' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  {link.name}
                </Link>
              )
            })}
          </nav>

          {/* RIGHT — Actions */}
          <div className="flex items-center justify-end gap-4 sm:gap-6 w-auto">
            <button className="text-gray-400 hover:text-gray-600 transition-colors hidden sm:block">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
              </svg>
            </button>
            <button
              onClick={onSignOut}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center"
              title="Sign out"
            >
              <span className="hidden sm:inline">Sign out</span>
              <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </header>
  )
}
