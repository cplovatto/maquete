import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import * as XLSX from 'xlsx'

export interface MainRow {
  pdv: string
  vf_ant: number; vf_atual: number; vf_var: number
  qb_ant: number; qb_atual: number; qb_var: number
  bm_ant: number; bm_atual: number; bm_var: number
  qi_ant: number; qi_atual: number; qi_var: number
  iv_ant: number; iv_atual: number; iv_var: number
  pm_ant: number; pm_atual: number; pm_var: number
}

export interface FluxoRow {
  pdv: string
  resgates: number
  conversoes: number
  conv_pct: number
}

export interface MainTotal {
  vf_ant: number; vf_atual: number; vf_var: number
  qb_ant: number; qb_atual: number; qb_var: number
  bm_ant: number; bm_atual: number; bm_var: number
  iv_ant: number; iv_atual: number; iv_var: number
  pm_ant: number; pm_atual: number; pm_var: number
}

export interface FluxoTotal {
  resgates: number
  conversoes: number
  conv_pct: number
}

// Valores consolidados da aba CP, coluna B (RESULTADO) e coluna F (EFC)
export interface CPData {
  vf_valor: number    // Receita GMV (R$)
  vf_var_aa: number   // Receita (%) — variação vs. ano anterior, em pontos percentuais ex: -1.24
  qb_valor: number    // Quantidade de Boletos
  bm_valor: number    // Boleto Médio (R$)
  iv_valor: number    // Itens por Boleto
  pm_valor: number    // Preço Médio (R$)
  bm_efc: number      // Boleto Médio EFC (col F)
  iv_efc: number      // Itens por Boleto EFC (col F)
  pm_efc: number      // Preço Médio EFC (col F)
}

interface DataCtxType {
  mainRows: MainRow[]
  mainTotal: MainTotal | null
  cpData: CPData | null
  fluxoRows: FluxoRow[]
  fluxoTotal: FluxoTotal | null
  loadFile: (id: string, file: File) => Promise<void>
}

const DataCtx = createContext<DataCtxType | null>(null)

// Números no formato brasileiro: "5.484.610,37" → 5484610.37
function parseBRL(v: unknown): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/\./g, '').replace(',', '.').replace('%', '').trim())
    return isNaN(n) ? 0 : n
  }
  return 0
}

function parseVar(v: unknown): number {
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(',', '.').replace('+', '').replace('%', '').trim())
    return isNaN(n) ? 0 : n
  }
  if (typeof v === 'number') return Math.abs(v) <= 10 ? v * 100 : v
  return 0
}

function toNum(v: unknown): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string') { const n = parseFloat(v.replace(',', '.')); return isNaN(n) ? 0 : n }
  return 0
}

function toMainRow(a: unknown[]): MainRow {
  return {
    pdv: String(a[0]),
    vf_ant: toNum(a[1]), vf_atual: toNum(a[2]), vf_var: parseVar(a[3]),
    qb_ant: toNum(a[4]), qb_atual: toNum(a[5]), qb_var: parseVar(a[6]),
    bm_ant: toNum(a[7]), bm_atual: toNum(a[8]), bm_var: parseVar(a[9]),
    qi_ant: toNum(a[10]), qi_atual: toNum(a[11]), qi_var: parseVar(a[12]),
    iv_ant: toNum(a[13]), iv_atual: toNum(a[14]), iv_var: parseVar(a[15]),
    pm_ant: toNum(a[16]), pm_atual: toNum(a[17]), pm_var: parseVar(a[18]),
  }
}

// Localiza uma linha da aba CP pelo nome do indicador (col A)
function findCPRow(raw: unknown[][], name: string): unknown[] | null {
  const row = raw.find(r => {
    const cell = (r as unknown[])[0]
    return typeof cell === 'string' && cell.toLowerCase().includes(name.toLowerCase())
  })
  return (row as unknown[] | undefined) ?? null
}

function parseCPSheet(wb: XLSX.WorkBook): CPData | null {
  const ws = wb.Sheets['CP']
  if (!ws) return null
  const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })

  const rowReceita    = findCPRow(raw, 'Receita GMV (R$)')
  const rowReceitaPct = findCPRow(raw, 'Receita (%)')
  const rowQB         = findCPRow(raw, 'Quantidade de Boletos')
  const rowBM         = findCPRow(raw, 'Boleto Médio (R$)')
  const rowIV         = findCPRow(raw, 'Itens por Boleto')
  const rowPM         = findCPRow(raw, 'Preço Médio (R$)')

  if (!rowReceita) return null

  return {
    vf_valor:  parseBRL(rowReceita?.[1]),
    vf_var_aa: parseBRL(rowReceitaPct?.[1] ?? 0),
    qb_valor:  parseBRL(rowQB?.[1] ?? 0),
    bm_valor:  parseBRL(rowBM?.[1] ?? 0),
    iv_valor:  parseBRL(rowIV?.[1] ?? 0),
    pm_valor:  parseBRL(rowPM?.[1] ?? 0),
    bm_efc:    parseBRL(rowBM?.[5] ?? 0),
    iv_efc:    parseBRL(rowIV?.[5] ?? 0),
    pm_efc:    parseBRL(rowPM?.[5] ?? 0),
  }
}

async function parseMainFile(file: File): Promise<{ rows: MainRow[]; total: MainTotal | null; cp: CPData | null }> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf)

  const cp = parseCPSheet(wb)

  const ws = wb.Sheets['PDV']
  if (!ws) return { rows: [], total: null, cp }
  const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  let total: MainTotal | null = null
  const tr = raw[2] as unknown[]
  if (tr && String(tr[0]).toUpperCase() === 'TOTAL') {
    const t = toMainRow(tr)
    total = {
      vf_ant: t.vf_ant, vf_atual: t.vf_atual, vf_var: t.vf_var,
      qb_ant: t.qb_ant, qb_atual: t.qb_atual, qb_var: t.qb_var,
      bm_ant: t.bm_ant, bm_atual: t.bm_atual, bm_var: t.bm_var,
      iv_ant: t.iv_ant, iv_atual: t.iv_atual, iv_var: t.iv_var,
      pm_ant: t.pm_ant, pm_atual: t.pm_atual, pm_var: t.pm_var,
    }
  }
  const rows = raw.slice(3).filter(r => (r as unknown[])[0]).map(r => toMainRow(r as unknown[]))
  return { rows, total, cp }
}

async function parseFluxoFile(file: File): Promise<{ rows: FluxoRow[]; total: FluxoTotal | null }> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf)
  const ws = wb.Sheets['PDV']
  if (!ws) return { rows: [], total: null }
  const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  const toRow = (a: unknown[]): FluxoRow => ({
    pdv: String(a[0]), resgates: toNum(a[1]), conversoes: toNum(a[2]), conv_pct: toNum(a[3]),
  })
  let total: FluxoTotal | null = null
  const tr = raw[1] as unknown[]
  if (tr && String(tr[0]).toUpperCase() === 'TOTAL') {
    const t = toRow(tr); total = { resgates: t.resgates, conversoes: t.conversoes, conv_pct: t.conv_pct }
  }
  const rows = raw.slice(2).filter(r => (r as unknown[])[0]).map(r => toRow(r as unknown[]))
  return { rows, total }
}

function tryParse<T>(key: string, fallback: T): T {
  try { const s = localStorage.getItem(key); return s ? (JSON.parse(s) as T) : fallback } catch { return fallback }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [mainRows, setMainRows]     = useState<MainRow[]>(() => tryParse('prisma-data-main', []))
  const [mainTotal, setMainTotal]   = useState<MainTotal | null>(() => tryParse('prisma-data-main-total', null))
  const [cpData, setCpData]         = useState<CPData | null>(() => tryParse('prisma-data-cp', null))
  const [fluxoRows, setFluxoRows]   = useState<FluxoRow[]>(() => tryParse('prisma-data-fluxo', []))
  const [fluxoTotal, setFluxoTotal] = useState<FluxoTotal | null>(() => tryParse('prisma-data-fluxo-total', null))

  useEffect(() => { try { localStorage.setItem('prisma-data-main', JSON.stringify(mainRows)) } catch {} }, [mainRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-main-total', JSON.stringify(mainTotal)) } catch {} }, [mainTotal])
  useEffect(() => { try { localStorage.setItem('prisma-data-cp', JSON.stringify(cpData)) } catch {} }, [cpData])
  useEffect(() => { try { localStorage.setItem('prisma-data-fluxo', JSON.stringify(fluxoRows)) } catch {} }, [fluxoRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-fluxo-total', JSON.stringify(fluxoTotal)) } catch {} }, [fluxoTotal])

  async function loadFile(id: string, file: File) {
    if (id === 'main') {
      const { rows, total, cp } = await parseMainFile(file)
      setMainRows(rows); setMainTotal(total); setCpData(cp)
    } else if (id === 'fluxo') {
      const { rows, total } = await parseFluxoFile(file)
      setFluxoRows(rows); setFluxoTotal(total)
    }
  }

  return (
    <DataCtx.Provider value={{ mainRows, mainTotal, cpData, fluxoRows, fluxoTotal, loadFile }}>
      {children}
    </DataCtx.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataCtx)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
