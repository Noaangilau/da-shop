import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Vendors from './pages/Vendors'
import VendorStorefront from './pages/VendorStorefront'
import ProductDetail from './pages/ProductDetail'
import BecomeAVendor from './pages/BecomeAVendor'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/vendor/:id" element={<VendorStorefront />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/become-a-vendor" element={<BecomeAVendor />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
