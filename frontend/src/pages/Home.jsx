import { useState, useEffect } from 'react'
import { getProducts } from '../services/api'
import ProductGrid from '../components/product/ProductGrid'
import { PageLoader, ErrorState, EmptyState } from '../components/common/StateComponents'

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (search) params.search = search
      if (activeCategory) params.category = activeCategory
      if (inStockOnly) params.inStock = 'true'
      const data = await getProducts(params)
      setProducts(data?.products || [])
      if (data?.categories && data.categories.length) setCategories(data.categories)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300)
    return () => clearTimeout(timer)
  }, [search, activeCategory, inStockOnly])

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Hero */}
        <div className="pt-14 pb-10">
          <p className="text-xs font-semibold tracking-[0.2em] text-orange-500 uppercase mb-3">
            Freshly Made · Delivered To You
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 tracking-tight leading-tight mb-4">
            Homemade &amp; Traditional Foods
          </h1>
          <p className="text-gray-500 text-base max-w-lg leading-relaxed">
            From our kitchen to yours — pickles, sweets, snacks, and spice blends
            made with recipes passed down through generations.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl
                         text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25
                         focus:border-orange-500 transition"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={e => setInStockOnly(e.target.checked)}
              className="accent-orange-500 w-4 h-4"
            />
            In stock only
          </label>
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap
                ${activeCategory === ''
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
            >
              All
            </button>
            {categories.map((cat, idx) => {
              const catName = cat.name || cat;
              return (
                <button
                  key={cat.id || idx}
                  onClick={() => setActiveCategory(activeCategory === catName ? '' : catName)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap
                    ${activeCategory === catName
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                >
                  {catName}
                </button>
              )
            })}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <PageLoader />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchProducts} />
        ) : products.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No products found"
            description="Try adjusting your search or category filter."
            action={<button onClick={() => { setSearch(''); setActiveCategory(''); setInStockOnly(false) }} className="btn-secondary text-sm">Clear filters</button>}
          />
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-5 font-medium">
              {products.length} products
            </p>
            <ProductGrid products={products} />
          </>
        )}
      </div>
    </div>
  )
}
