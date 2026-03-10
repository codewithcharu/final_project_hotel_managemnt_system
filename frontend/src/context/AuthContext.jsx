import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('royalHotelToken'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    async function fetchUser() {
      if (!token) {
        if (isMounted) {
          setUser(null)
          setLoading(false)
        }
        return
      }

      setLoading(true)
      setError('')
      try {
        const response = await getCurrentUser()
        if (isMounted) {
          const userData = response?.data || response
          setUser(userData)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load user')
          logout()
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchUser()
    return () => {
      isMounted = false
    }
  }, [token])

  const login = async (tokenValue, userPayload) => {
    localStorage.setItem('royalHotelToken', tokenValue)
    setToken(tokenValue)
    if (userPayload) {
      setUser(userPayload)
      setLoading(false)
    } else {
      setLoading(true)
      try {
        const response = await getCurrentUser()
        setUser(response?.data || response)
      } finally {
        setLoading(false)
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('royalHotelToken')
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    if (!token) return
    const response = await getCurrentUser()
    setUser(response?.data || response)
    const userData = response?.data || response
    setUser(userData)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      error,
      login,
      logout,
      refreshUser,
    }),
    [token, user, loading, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

