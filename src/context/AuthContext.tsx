import { createContext, useContext, useState, type ReactNode } from 'react'

export type Perfil = 'admin' | 'user'

export interface User {
  name: string
  email: string
  initials: string
  provider: 'google' | 'email'
  perfil: Perfil
  empresaId?: string
}

interface AuthContextType {
  user: User | null
  login: (provider: 'google' | 'email', email?: string, password?: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const ADMIN_CRED = { email: 'admin@velo.io', password: 'admin' }
const DEMO_CRED = { email: 'demo@velo.io', password: 'demo' }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = (provider: 'google' | 'email', email?: string, password?: string): boolean => {
    if (provider !== 'email') return false

    const normalized = email?.trim().toLowerCase()

    if (normalized === ADMIN_CRED.email && password === ADMIN_CRED.password) {
      setUser({
        name: 'Administrador',
        email: ADMIN_CRED.email,
        initials: 'AD',
        provider: 'email',
        perfil: 'admin',
      })
      return true
    }

    if (normalized === DEMO_CRED.email && password === DEMO_CRED.password) {
      setUser({
        name: 'Demo',
        email: DEMO_CRED.email,
        initials: 'DM',
        provider: 'email',
        perfil: 'user',
        empresaId: 'velo',
      })
      return true
    }

    return false
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
