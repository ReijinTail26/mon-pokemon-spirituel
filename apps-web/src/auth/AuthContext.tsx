import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

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
  refresh: () => Promise<void>
  loginWithGoogle: () => void
  logout: () => Promise<void>
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)

  async function refresh() {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/me`, { credentials: 'include' })
      const data = await response.json()
      setUser(data.authenticated ? data.user : null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  function loginWithGoogle() {
    window.location.href = `${API_URL}/api/v1/auth/google`
  }

  async function logout() {
    await fetch(`${API_URL}/api/v1/auth/logout`, { method: 'POST', credentials: 'include' })
    setUser(null)
    window.location.href = '/'
  }

  const value = useMemo(() => ({ loading, user, refresh, loginWithGoogle, logout }), [loading, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return value
}
