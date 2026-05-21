import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import AIChatWidget from './components/AIChatWidget'
import AnnouncementPopup from './components/AnnouncementBanner'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Brands from './pages/Brands'
import BrandPage from './pages/BrandPage'
import Category from './pages/Category'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Gallery from './pages/Gallery'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Returns from './pages/Returns'
import Shipping from './pages/Shipping'
import Support from './pages/Support'
import Schools from './pages/Schools'
import SchoolPage from './pages/SchoolPage'


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <AnnouncementPopup />
          <Navbar />
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Brand routes */}
            <Route path="/brands" element={<Brands />} />
            <Route path="/brand/:id" element={<BrandPage />} />
            <Route path="/vendors" element={<Navigate to="/brands" replace />} />

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
            {/* Checkout + confirmation are guest-accessible */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />

            {/* Protected — admin only */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

            {/* Utility routes */}
            <Route path="/gallery" element={<Gallery />} />

            {/* Schools */}
            <Route path="/schools" element={<Schools />} />
            <Route path="/school/:id" element={<SchoolPage />} />

            {/* Support */}
            <Route path="/support" element={<Support />} />

            {/* Legal */}
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/shipping" element={<Shipping />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ErrorBoundary>
          <Footer />
          <AIChatWidget />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
