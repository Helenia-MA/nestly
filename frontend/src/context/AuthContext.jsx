// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // checking if user is already logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('nestly_token')
    if (token) {
      authAPI.me()
        .then(response => {
          setUser(response.data.User)
        })
        .catch(() => {
          // token invalid or expired
          localStorage.removeItem('nestly_token')
          setUser(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (identifier, password) => {
    const response = await authAPI.login({ identifier, password })
    const { token, user } = response.data
    localStorage.setItem('nestly_token', token)
    setUser(user)
    return user
  }

  const signup = async (name, email, phone, password) => {
    const response = await authAPI.signup({ name, email, phone, password })
    const { token, user } = response.data
    localStorage.setItem('nestly_token', token)
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('nestly_token')
    setUser(null)
    window.location.href = '/login'
  }

  const value = {
    user,
    setUser,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isBusinessOwner: user?.is_business_owner || false,
    isAdmin: user?.is_admin || false
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}