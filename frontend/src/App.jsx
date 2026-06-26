import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/common/Navbar'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Payment from './pages/Payment'
import Profile from './pages/Profile'
import OrderConfirmation from './pages/OrderConfirmation'
import OrderStatus from './pages/OrderStatus'
import AdminDashboard from './pages/admin/Dashboard'
import AdminStock from './pages/admin/StockManagement'
import AdminCategories from './pages/admin/Categories'
import CustomerDetails from './pages/admin/CustomerDetails'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/order/:orderNumber" element={<OrderConfirmation />} />
              <Route path="/track" element={<OrderStatus />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/stock" element={<AdminStock />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/customer/:phone" element={<CustomerDetails />} />
              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </BrowserRouter>
  )
}
