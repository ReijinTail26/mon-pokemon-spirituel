import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type AuthUser = {
  id: string
  email: string
  email_verified: boolean
  display_name: string | null
  avatar_url: string | null
  username: string | null
}

type AuthContextValue = {
  loading: boolean
  user: AuthUser | null
  serviceUnavailable: boolean
  refresh: () => Promise<void>
  loginWithGoogle: () => void
  logout: () => Promise<void>
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [serviceUnavailable, setServiceUnavailable] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/me`, { credentials: 'include' })
      if (!response.ok) throw new Error(`AUTH_SERVICE_${response.status}`)
      const data = await response.json()
      setUser(data.authenticated ? data.user : null)
      setServiceUnavailable(false)
    } catch {
      // Une panne Render n'est pas une déconnexion. On conserve l'utilisateur
      // déjà connu et on propose une nouvelle vérification de la session.
      setServiceUnavailable(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  function loginWithGoogle() {
    if (serviceUnavailable) return
    window.location.href = `${API_URL}/api/v1/auth/google`
  }

  async function logout() {
    const response = await fetch(`${API_URL}/api/v1/auth/logout`, { method: 'POST', credentials: 'include' })
    if (!response.ok) {
      setServiceUnavailable(true)
      return
    }
    setUser(null)
    setServiceUnavailable(false)
    window.location.href = '/'
  }

  const value = useMemo(
    () => ({ loading, user, serviceUnavailable, refresh, loginWithGoogle, logout }),
    [loading, user, serviceUnavailable, refresh]
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return value
}
