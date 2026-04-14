import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import VendorStorefront from './pages/VendorStorefront'
import ProductDetail from './pages/ProductDetail'
import BecomeAVendor from './pages/BecomeAVendor'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vendor/:id" element={<VendorStorefront />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/become-a-vendor" element={<BecomeAVendor />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
