import { createContext, useContext, useState, type ReactNode } from 'react'

interface User {
  name: string
  email: string
  initials: string
  provider: 'google' | 'apple' | 'email'
}

interface AuthContextType {
  user: User | null
  login: (provider: 'google' | 'apple' | 'email', email?: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = (provider: 'google' | 'apple' | 'email', email?: string) => {
    setUser({
      name: 'Maria Silva',
      email: email || 'maria.silva@empresa.com.br',
      initials: 'MS',
      provider,
    })
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
