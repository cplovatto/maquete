import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface AppUser {
  id: string
  email: string        // chave para login
  nome: string
  perfil: 'admin' | 'user'
  empresaId: string
  enabled: boolean     // se false, não pode logar (empresa locked ou desativado manualmente)
}

interface UsersCtxType {
  users: AppUser[]
  addUser: (u: Omit<AppUser, 'id'>) => { ok: boolean; error?: string }
  updateUser: (id: string, data: Partial<Omit<AppUser, 'id' | 'email'>>) => void
  deleteUser: (id: string) => void
  getUsersByEmpresa: (empresaId: string) => AppUser[]
  getUserByEmail: (email: string) => AppUser | undefined
}

const UsersCtx = createContext<UsersCtxType | null>(null)

const SEED: AppUser[] = [
  {
    id: 'user-demo',
    email: 'demo',
    nome: 'Usuário Demo',
    perfil: 'user',
    empresaId: 'empresa-demo',
    enabled: true,
  },
  {
    id: 'user-admin',
    email: 'admin@prisma.io',
    nome: 'Administrador',
    perfil: 'admin',
    empresaId: 'empresa-demo',
    enabled: true,
  },
]

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AppUser[]>(() => {
    try {
      const saved = localStorage.getItem('prisma-users')
      if (saved) return JSON.parse(saved) as AppUser[]
    } catch {}
    return SEED
  })

  useEffect(() => {
    try { localStorage.setItem('prisma-users', JSON.stringify(users)) } catch {}
  }, [users])

  const addUser = (u: Omit<AppUser, 'id'>): { ok: boolean; error?: string } => {
    // Email deve ser único
    if (users.some(ex => ex.email === u.email)) {
      return { ok: false, error: 'Já existe um usuário com este email.' }
    }
    setUsers(prev => [...prev, { ...u, id: `usr-${Date.now()}` }])
    return { ok: true }
  }

  const updateUser = (id: string, data: Partial<Omit<AppUser, 'id' | 'email'>>) =>
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u))

  const deleteUser = (id: string) =>
    setUsers(prev => prev.filter(u => u.id !== id))

  const getUsersByEmpresa = (empresaId: string) =>
    users.filter(u => u.empresaId === empresaId)

  const getUserByEmail = (email: string) =>
    users.find(u => u.email === email)

  return (
    <UsersCtx.Provider value={{ users, addUser, updateUser, deleteUser, getUsersByEmpresa, getUserByEmail }}>
      {children}
    </UsersCtx.Provider>
  )
}

export function useUsers() {
  const ctx = useContext(UsersCtx)
  if (!ctx) throw new Error('useUsers must be used within UsersProvider')
  return ctx
}
