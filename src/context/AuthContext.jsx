import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' })
  const [pendingBooking, setPendingBooking] = useState(null)

  useEffect(() => {
    // 1. Detect OAuth redirect query parameters in URL
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')
    const urlUserStr = params.get('user')
    const oauthError = params.get('oauth_error')

    if (oauthError) {
      console.error('OAuth error from provider:', oauthError)
      alert(`🔑 Erreur d'authentification :\n${decodeURIComponent(oauthError)}`)
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    let initialUser = null

    // If OAuth token returned in URL and not on /verify-email page
    if (urlToken && !window.location.pathname.startsWith('/verify-email')) {
      localStorage.setItem('tcr_token', urlToken)
      if (urlUserStr) {
        try {
          initialUser = JSON.parse(decodeURIComponent(urlUserStr))
          localStorage.setItem('tcr_user', JSON.stringify(initialUser))
        } catch {
          try {
            initialUser = JSON.parse(urlUserStr)
            localStorage.setItem('tcr_user', JSON.stringify(initialUser))
          } catch (e) {
            console.error('Could not parse user from URL parameter:', e)
          }
        }
      }
      // Clean query string from browser URL bar without reloading
      window.history.replaceState({}, document.title, window.location.pathname)
    } else {
      initialUser = authService.getCurrentUser()
    }

    if (initialUser) {
      setUser(initialUser)
    }

    const currentToken = localStorage.getItem('tcr_token')
    if (!currentToken) {
      setUser(null)
      setLoading(false)
      return
    }

    // Validate/refresh session with backend in the background
    authService.getMe()
      .then(freshUser => {
        if (freshUser) {
          setUser(freshUser)
          localStorage.setItem('tcr_user', JSON.stringify(freshUser))
        }
      })
      .catch((err) => {
        // ONLY log out if backend returns 401 Unauthorized
        if (err?.response?.status === 401) {
          authService.logout()
          setUser(null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const { user: u } = await authService.login(email, password)
    setUser(u)
    return u
  }

  const register = async (data) => {
    const res = await authService.register(data)
    if (res.user) setUser(res.user)
    return res
  }

  const verifyEmail = async (token) => {
    const { user: u, message } = await authService.verifyEmail(token)
    if (u) setUser(u)
    return { user: u, message }
  }

  const resendVerification = async (email) => {
    return await authService.resendVerification(email)
  }

  const oauthLogin = async (oauthData) => {
    const { user: u } = await authService.oauthLogin(oauthData)
    setUser(u)
    return u
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const openAuthModal = useCallback((mode = 'login', booking = null) => {
    if (booking) setPendingBooking(booking)
    setAuthModal({ open: true, mode })
  }, [])

  const closeAuthModal = useCallback(() => {
    setAuthModal(prev => ({ ...prev, open: false }))
  }, [])

  const clearPendingBooking = useCallback(() => setPendingBooking(null), [])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      verifyEmail,
      resendVerification,
      oauthLogin,
      logout,
      authModal,
      openAuthModal,
      closeAuthModal,
      pendingBooking,
      setPendingBooking,
      clearPendingBooking,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
