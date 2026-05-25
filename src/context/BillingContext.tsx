import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface Invoice {
  id: string
  empresaId: string
  descricao: string
  valor: number
  vencimento: string
  pago: boolean
  dataPagamento?: string
}

interface BillingCtxType {
  invoices: Invoice[]
  payInvoice: (id: string) => void
  getInvoicesByEmpresa: (empresaId: string) => Invoice[]
}

const BillingCtx = createContext<BillingCtxType | null>(null)

function generateInvoices(): Invoice[] {
  const now = new Date()
  const list: Invoice[] = []
  for (let m = 0; m < 6; m++) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 10)
    const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    const venc = d.toISOString().slice(0, 10)
    const pago = m > 0  // mês atual não pago, anteriores pagos
    list.push({
      id: `inv-${m}`,
      empresaId: 'empresa-demo',
      descricao: `Assinatura ${label} — Plano Enterprise`,
      valor: 997,
      vencimento: venc,
      pago,
      dataPagamento: pago ? d.toISOString().slice(0, 10) : undefined,
    })
  }
  return list
}

export function BillingProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem('prisma-invoices')
      if (saved) return JSON.parse(saved) as Invoice[]
    } catch {}
    return generateInvoices()
  })

  useEffect(() => {
    try { localStorage.setItem('prisma-invoices', JSON.stringify(invoices)) } catch {}
  }, [invoices])

  const payInvoice = (id: string) =>
    setInvoices(prev => prev.map(i =>
      i.id === id ? { ...i, pago: true, dataPagamento: new Date().toISOString().slice(0, 10) } : i
    ))

  const getInvoicesByEmpresa = (empresaId: string) =>
    invoices.filter(i => i.empresaId === empresaId)

  return (
    <BillingCtx.Provider value={{ invoices, payInvoice, getInvoicesByEmpresa }}>
      {children}
    </BillingCtx.Provider>
  )
}

export function useBilling() {
  const ctx = useContext(BillingCtx)
  if (!ctx) throw new Error('useBilling must be used within BillingProvider')
  return ctx
}
