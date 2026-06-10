import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type PlanType = 'gratuito' | 'basico' | 'profissional' | 'enterprise'

export const PLAN_LABELS: Record<PlanType, string> = {
  gratuito: 'Gratuito (1 usuário)',
  basico: 'Básico (até 5 usuários)',
  profissional: 'Profissional (até 20 usuários)',
  enterprise: 'Enterprise (ilimitado)',
}

export const PLAN_MAX_USERS: Record<PlanType, number> = {
  gratuito: 1,
  basico: 5,
  profissional: 20,
  enterprise: Infinity,
}

export const PLAN_MONTHLY_PRICE: Record<PlanType, number> = {
  gratuito: 0,
  basico: 97,
  profissional: 297,
  enterprise: 997,
}

export interface Empresa {
  id: string
  razaoSocial: string
  fantasia: string
  cnpj: string
  telefone: string
  email: string
  plan: PlanType
  locked: boolean
  createdAt: string
}

interface CompaniesCtxType {
  empresas: Empresa[]
  addEmpresa: (e: Omit<Empresa, 'id' | 'createdAt'>) => void
  updateEmpresa: (id: string, data: Partial<Omit<Empresa, 'id'>>) => void
  deleteEmpresa: (id: string) => void
  getEmpresa: (id: string) => Empresa | undefined
}

const CompaniesCtx = createContext<CompaniesCtxType | null>(null)

const SEED: Empresa[] = [
  {
    id: 'velo',
    razaoSocial: 'Velo Cosméticos Ltda',
    fantasia: 'Velo Retail',
    cnpj: '12.345.678/0001-90',
    telefone: '(11) 99999-8888',
    email: 'contato@velo.io',
    plan: 'enterprise',
    locked: false,
    createdAt: '2026-01-15',
  },
]

export function CompaniesProvider({ children }: { children: ReactNode }) {
  const [empresas, setEmpresas] = useState<Empresa[]>(() => {
    try {
      const saved = localStorage.getItem('prisma-empresas')
      if (saved) return JSON.parse(saved) as Empresa[]
    } catch {}
    return SEED
  })

  useEffect(() => {
    try { localStorage.setItem('prisma-empresas', JSON.stringify(empresas)) } catch {}
  }, [empresas])

  const addEmpresa = (e: Omit<Empresa, 'id' | 'createdAt'>) =>
    setEmpresas(prev => [...prev, {
      ...e,
      id: `emp-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    }])

  const updateEmpresa = (id: string, data: Partial<Omit<Empresa, 'id'>>) =>
    setEmpresas(prev => prev.map(e => e.id === id ? { ...e, ...data } : e))

  const deleteEmpresa = (id: string) =>
    setEmpresas(prev => prev.filter(e => e.id !== id))

  const getEmpresa = (id: string) => empresas.find(e => e.id === id)

  return (
    <CompaniesCtx.Provider value={{ empresas, addEmpresa, updateEmpresa, deleteEmpresa, getEmpresa }}>
      {children}
    </CompaniesCtx.Provider>
  )
}

export function useCompanies() {
  const ctx = useContext(CompaniesCtx)
  if (!ctx) throw new Error('useCompanies must be used within CompaniesProvider')
  return ctx
}
