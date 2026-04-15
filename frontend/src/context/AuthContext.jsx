import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null)
  const [token, setToken]       = useState(() => localStorage.getItem('da_shop_token'))
  const [loading, setLoading]   = useState(true)

  // Validate stored token on mount
  useEffect(() => {
    if (!token) { setLoading(false); return }
    axios
      .get(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setCustomer(res.data))
      .catch(() => {
        localStorage.removeItem('da_shop_token')
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])   // eslint-disable-line

  function _store(token, customer) {
    localStorage.setItem('da_shop_token', token)
    setToken(token)
    setCustomer(customer)
  }

  async function login(email, password) {
    const { data } = await axios.post(`${API_URL}/auth/login`, { email, password })
    _store(data.token, data.customer)
    return data.customer
  }

  async function register(formData) {
    const { data } = await axios.post(`${API_URL}/auth/register`, formData)
    _store(data.token, data.customer)
    return data.customer
  }

  async function updateProfile(updates) {
    const { data } = await axios.put(`${API_URL}/customers/me`, updates, {
      headers: { Authorization: `Bearer ${token}` },
    })
    setCustomer(data)
    return data
  }

  async function saveCartToBackend(cartItems) {
    if (!token) return
    try {
      await axios.put(
        `${API_URL}/customers/me/cart`,
        { cart_data: JSON.stringify(cartItems) },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    } catch { /* silent */ }
  }

  function logout() {
    localStorage.removeItem('da_shop_token')
    setToken(null)
    setCustomer(null)
  }

  return (
    <AuthContext.Provider
      value={{ customer, token, loading, login, register, updateProfile, saveCartToBackend, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
