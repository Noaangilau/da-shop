import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Brands from './pages/Brands'
import BrandPage from './pages/BrandPage'
import Category from './pages/Category'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Gallery from './pages/Gallery'
import BecomeAVendor from './pages/BecomeAVendor'
import NotFound from './pages/NotFound'

// Redirect /vendor/:id → /brand/:id for backwards compatibility
function VendorRedirect() {
  const { id } = useParams()
  return <Navigate to={`/brand/${id}`} replace />
}

function App() {
  return (
    <BrowserRouter>
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

          {/* Utility routes */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/become-a-vendor" element={<BecomeAVendor />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </CartProvider>
    </BrowserRouter>
  )
}

export default App
