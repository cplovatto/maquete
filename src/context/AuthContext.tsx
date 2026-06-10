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
  login: (provider: 'google' | 'email', username?: string, password?: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const ADMIN_CRED = { username: 'admin', password: 'admin' }
const DEMO_CRED = { username: 'demo', password: 'demo' }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = (provider: 'google' | 'email', username?: string, password?: string): boolean => {
    if (provider !== 'email') return false

    // Admin login (temporary — will be replaced by user-based admin)
    if (username === ADMIN_CRED.username && password === ADMIN_CRED.password) {
      setUser({
        name: 'Administrador',
        email: 'admin@veloretail.io',
        initials: 'AD',
        provider: 'email',
        perfil: 'admin',
      })
      return true
    }

    // Demo login (regular user)
    if (username === DEMO_CRED.username && password === DEMO_CRED.password) {
      setUser({
        name: 'Demo',
        email: 'demo',
        initials: 'DM',
        provider: 'email',
        perfil: 'user',
        empresaId: 'empresa-demo',
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
