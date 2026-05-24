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

interface DataCtxType {
  mainRows: MainRow[]
  mainTotal: MainTotal | null
  fluxoRows: FluxoRow[]
  fluxoTotal: FluxoTotal | null
  loadFile: (id: string, file: File) => Promise<void>
}

const DataCtx = createContext<DataCtxType | null>(null)

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

async function parseMainFile(file: File): Promise<{ rows: MainRow[]; total: MainTotal | null }> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf)
  const ws = wb.Sheets['PDV']
  if (!ws) return { rows: [], total: null }
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
  return { rows, total }
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
  const [mainRows, setMainRows]   = useState<MainRow[]>(() => tryParse('prisma-data-main', []))
  const [mainTotal, setMainTotal] = useState<MainTotal | null>(() => tryParse('prisma-data-main-total', null))
  const [fluxoRows, setFluxoRows] = useState<FluxoRow[]>(() => tryParse('prisma-data-fluxo', []))
  const [fluxoTotal, setFluxoTotal] = useState<FluxoTotal | null>(() => tryParse('prisma-data-fluxo-total', null))

  useEffect(() => { try { localStorage.setItem('prisma-data-main', JSON.stringify(mainRows)) } catch {} }, [mainRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-main-total', JSON.stringify(mainTotal)) } catch {} }, [mainTotal])
  useEffect(() => { try { localStorage.setItem('prisma-data-fluxo', JSON.stringify(fluxoRows)) } catch {} }, [fluxoRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-fluxo-total', JSON.stringify(fluxoTotal)) } catch {} }, [fluxoTotal])

  async function loadFile(id: string, file: File) {
    if (id === 'main') {
      const { rows, total } = await parseMainFile(file)
      setMainRows(rows); setMainTotal(total)
    } else if (id === 'fluxo') {
      const { rows, total } = await parseFluxoFile(file)
      setFluxoRows(rows); setFluxoTotal(total)
    }
  }

  return (
    <DataCtx.Provider value={{ mainRows, mainTotal, fluxoRows, fluxoTotal, loadFile }}>
      {children}
    </DataCtx.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataCtx)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
