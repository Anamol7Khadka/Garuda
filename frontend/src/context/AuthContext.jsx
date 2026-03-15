import { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/client'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize from localStorage SYNCHRONOUSLY
    // This prevents flash of logged-out state on refresh
    try {
      const savedUser = localStorage.getItem('user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setLoading(false)
        return
      }
      try {
        // Verify token is still valid with backend
        const res = await client.get('/api/auth/me')
        const userData = res.data?.data || res.data
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      } catch (err) {
        // Token invalid — try refresh first
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          try {
            const res = await client.post('/api/auth/refresh', {}, {
              headers: { Authorization: `Bearer ${refreshToken}` }
            })
            const newToken = res.data?.data?.access_token || res.data?.access_token
            localStorage.setItem('access_token', newToken)
            // Retry /me with new token
            const meRes = await client.get('/api/auth/me')
            const userData = meRes.data?.data || meRes.data
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
          } catch {
            // Refresh failed — clear everything
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            setUser(null)
          }
        } else {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }
    verifyToken()
  }, [])

  const login = async (email, password) => {
    const res = await client.post('/api/auth/login', { email, password })
    const data = res.data?.data || res.data
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const register = async (name, email, password, role = 'customer', gender = null, city = null, skills = null) => {
    const payload = {
      name,
      email,
      password,
      role,
      gender,
      city
    }
    if (skills && skills.length > 0) {
      payload.skills = skills
    }
    const res = await client.post('/api/auth/register', payload)
    const data = res.data?.data || res.data
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
      updateUser
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
