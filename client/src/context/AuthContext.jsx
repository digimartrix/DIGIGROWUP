import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async (authToken = token) => {
    if (!authToken) return
    try {
      const res = await api.get('/auth/me')
      if (res.data?.success && res.data.user) {
        setUser(res.data.user)
        localStorage.setItem('digi_user', JSON.stringify(res.data.user))
      }
    } catch (err) {
      console.warn('Failed to refresh user profile from server:', err.message)
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('digi_token')
    const storedUser = localStorage.getItem('digi_user')
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
        refreshUser(storedToken)
      } catch (e) {
        console.error('Failed to parse stored user data:', e)
      }
    }
    setLoading(false)
  }, [])

  const login = (tokenVal, userData) => {
    setToken(tokenVal)
    setUser(userData)
    localStorage.setItem('digi_token', tokenVal)
    localStorage.setItem('digi_user', JSON.stringify(userData))
    refreshUser(tokenVal)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('digi_token')
    localStorage.removeItem('digi_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
