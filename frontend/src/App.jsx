import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import AIChatWidget from './components/AIChatWidget'
import Home from './pages/Home'
import Brands from './pages/Brands'
import BrandPage from './pages/BrandPage'
import Category from './pages/Category'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Gallery from './pages/Gallery'
import BecomeAVendor from './pages/BecomeAVendor'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'

// Redirect /vendor/:id → /brand/:id for backwards compatibility
function VendorRedirect() {
  const { id } = useParams()
  return <Navigate to={`/brand/${id}`} replace />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Brand / vendor routes */}
            <Route path="/brands" element={<Brands />} />
            <Route path="/brand/:id" element={<BrandPage />} />

            {/* Legacy redirects */}
            <Route path="/vendors" element={<Navigate to="/brands" replace />} />
            <Route path="/vendor/:id" element={<VendorRedirect />} />

            {/* Category and product routes */}
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/product/:id" element={<ProductDetail />} />

            {/* Cart */}
            <Route path="/cart" element={<Cart />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected — customer */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/order-confirmation/:id" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />

            {/* Protected — admin only */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

            {/* Utility routes */}
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/become-a-vendor" element={<BecomeAVendor />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
          <AIChatWidget />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
