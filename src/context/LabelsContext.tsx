import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface Label {
  id: string
  name: string
  color: string
}

interface LabelsCtxType {
  labels: Label[]
  addLabel: (name: string, color: string) => void
  updateLabel: (id: string, name: string, color: string) => void
  deleteLabel: (id: string) => void
}

const LabelsCtx = createContext<LabelsCtxType | null>(null)

export const LABEL_COLORS = [
  '#7c3aed', // roxo
  '#2563eb', // azul
  '#059669', // verde
  '#d97706', // âmbar
  '#dc2626', // vermelho
  '#0891b2', // ciano
  '#db2777', // rosa
  '#65a30d', // lima
]

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

export function LabelsProvider({ children }: { children: ReactNode }) {
  const [labels, setLabels] = useState<Label[]>(() => {
    try {
      const saved = localStorage.getItem('prisma-labels')
      return saved ? (JSON.parse(saved) as Label[]) : []
    } catch { return [] }
  })

  useEffect(() => {
    try { localStorage.setItem('prisma-labels', JSON.stringify(labels)) } catch {}
  }, [labels])

  const addLabel = (name: string, color: string) =>
    setLabels(prev => [...prev, { id: genId(), name, color }])

  const updateLabel = (id: string, name: string, color: string) =>
    setLabels(prev => prev.map(l => l.id === id ? { ...l, name, color } : l))

  const deleteLabel = (id: string) =>
    setLabels(prev => prev.filter(l => l.id !== id))

  return (
    <LabelsCtx.Provider value={{ labels, addLabel, updateLabel, deleteLabel }}>
      {children}
    </LabelsCtx.Provider>
  )
}

export function useLabels() {
  const ctx = useContext(LabelsCtx)
  if (!ctx) throw new Error('useLabels must be used within LabelsProvider')
  return ctx
}
