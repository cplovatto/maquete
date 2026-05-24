import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface Loja {
  id: string
  apelido: string
  cidade: string
  estado: string
}

interface LojasCtxType {
  lojas: Loja[]
  addLoja: (loja: Loja) => void
  updateLoja: (id: string, data: Partial<Omit<Loja, 'id'>>) => void
  deleteLoja: (id: string) => void
  importIds: (ids: string[]) => { added: number; skipped: number }
}

const LojasCtx = createContext<LojasCtxType | null>(null)

export function LojasProvider({ children }: { children: ReactNode }) {
  const [lojas, setLojas] = useState<Loja[]>(() => {
    try {
      const saved = localStorage.getItem('prisma-lojas')
      return saved ? (JSON.parse(saved) as Loja[]) : []
    } catch { return [] }
  })

  useEffect(() => {
    try { localStorage.setItem('prisma-lojas', JSON.stringify(lojas)) } catch {}
  }, [lojas])

  const addLoja = (loja: Loja) =>
    setLojas(prev => [...prev, loja])

  const updateLoja = (id: string, data: Partial<Omit<Loja, 'id'>>) =>
    setLojas(prev => prev.map(l => l.id === id ? { ...l, ...data } : l))

  const deleteLoja = (id: string) =>
    setLojas(prev => prev.filter(l => l.id !== id))

  const importIds = (ids: string[]): { added: number; skipped: number } => {
    const existing = new Set(lojas.map(l => l.id))
    const toAdd = ids.filter(id => id && !existing.has(id))
    setLojas(prev => [...prev, ...toAdd.map(id => ({ id, apelido: '', cidade: '', estado: '' }))])
    return { added: toAdd.length, skipped: ids.length - toAdd.length }
  }

  return (
    <LojasCtx.Provider value={{ lojas, addLoja, updateLoja, deleteLoja, importIds }}>
      {children}
    </LojasCtx.Provider>
  )
}

export function useLojas() {
  const ctx = useContext(LojasCtx)
  if (!ctx) throw new Error('useLojas must be used within LojasProvider')
  return ctx
}
