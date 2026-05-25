import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { WorkBook, utils } from 'xlsx'

/* xlsx é importado dinamicamente para não inflar o bundle inicial (640 KB) */
let _xlsxMod: { read: typeof import('xlsx').read; utils: typeof import('xlsx').utils } | null = null
async function getXLSX() {
  if (!_xlsxMod) {
    const mod = await import('xlsx')
    _xlsxMod = { read: mod.read, utils: mod.utils }
  }
  return _xlsxMod
}

type XLSX_Utils = typeof utils

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

export interface ConsultorRow {
  pdv: string
  consultor: string
  // Colunas: A=PDV, B=Consultor, C=VF, D=QB, E=skipped, F=BM, G=skipped, H=IV, I=PM
  vf_atual: number
  qb_atual: number
  bm_atual: number
  iv_atual: number
  pm_atual: number
}

export interface FluxoConsultorRow {
  pdv: string
  consultor: string
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
  consultorRows: ConsultorRow[]
  fluxoConsultorRows: FluxoConsultorRow[]
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

function toConsultorRow(a: unknown[]): ConsultorRow {
  // A(0)=PDV, B(1)=Consultor, C(2)=VF, D(3)=QB, E(4)=skip, F(5)=BM, G(6)=skip, H(7)=IV, I(8)=PM
  return {
    pdv:       String(a[0]),
    consultor: String(a[1]),
    vf_atual:  toNum(a[2]),
    qb_atual:  toNum(a[3]),
    bm_atual:  toNum(a[5]),
    iv_atual:  toNum(a[7]),
    pm_atual:  toNum(a[8]),
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

function parseCPSheet(wb: WorkBook, utils: XLSX_Utils): CPData | null {
  const ws = wb.Sheets['CP']
  if (!ws) return null
  const raw = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })

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

function parseConsultorSheet(wb: WorkBook, utils: XLSX_Utils): ConsultorRow[] {
  const ws = wb.Sheets['CONSULTOR']
  if (!ws) return []
  const raw = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  return raw
    .filter(r => {
      const a = r as unknown[]
      const pdv = String(a[0] ?? '').trim()
      const con = String(a[1] ?? '').trim()
      return pdv && con && pdv.toUpperCase() !== 'PDV' && con.toUpperCase() !== 'CONSULTOR' && pdv.toUpperCase() !== 'TOTAL'
    })
    .map(r => toConsultorRow(r as unknown[]))
}

function parseFluxoConsultorSheet(wb: WorkBook, utils: XLSX_Utils): FluxoConsultorRow[] {
  const ws = wb.Sheets['CONSULTOR']
  if (!ws) return []
  const raw = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  return raw
    .filter(r => {
      const a = r as unknown[]
      const pdv = String(a[0] ?? '').trim()
      const con = String(a[1] ?? '').trim()
      return pdv && con && pdv.toUpperCase() !== 'PDV' && con.toUpperCase() !== 'CONSULTOR' && pdv.toUpperCase() !== 'TOTAL'
    })
    .map(r => {
      const a = r as unknown[]
      return {
        pdv:       String(a[0]),
        consultor: String(a[1]),
        resgates:  toNum(a[2]),
        conversoes: toNum(a[3]),
        conv_pct:  toNum(a[4]),
      }
    })
}

async function parseMainFile(file: File): Promise<{ rows: MainRow[]; total: MainTotal | null; cp: CPData | null; consultorRows: ConsultorRow[] }> {
  const buf = await file.arrayBuffer()
  const { read, utils } = await getXLSX()
  const wb = read(buf)

  const cp = parseCPSheet(wb, utils)
  const consultorRows = parseConsultorSheet(wb, utils)

  const ws = wb.Sheets['PDV']
  if (!ws) return { rows: [], total: null, cp, consultorRows }
  const raw = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
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
  return { rows, total, cp, consultorRows }
}

async function parseFluxoFile(file: File): Promise<{ rows: FluxoRow[]; total: FluxoTotal | null; fluxoConsultorRows: FluxoConsultorRow[] }> {
  const buf = await file.arrayBuffer()
  const { read, utils } = await getXLSX()
  const wb = read(buf)

  const fluxoConsultorRows = parseFluxoConsultorSheet(wb, utils)

  const ws = wb.Sheets['PDV']
  if (!ws) return { rows: [], total: null, fluxoConsultorRows }
  const raw = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  const toRow = (a: unknown[]): FluxoRow => ({
    pdv: String(a[0]), resgates: toNum(a[1]), conversoes: toNum(a[2]), conv_pct: toNum(a[3]),
  })
  let total: FluxoTotal | null = null
  const tr = raw[1] as unknown[]
  if (tr && String(tr[0]).toUpperCase() === 'TOTAL') {
    const t = toRow(tr); total = { resgates: t.resgates, conversoes: t.conversoes, conv_pct: t.conv_pct }
  }
  const rows = raw.slice(2).filter(r => (r as unknown[])[0]).map(r => toRow(r as unknown[]))
  return { rows, total, fluxoConsultorRows }
}

function tryParse<T>(key: string, fallback: T): T {
  try { const s = localStorage.getItem(key); return s ? (JSON.parse(s) as T) : fallback } catch { return fallback }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [mainRows, setMainRows]                       = useState<MainRow[]>(() => tryParse('prisma-data-main', []))
  const [mainTotal, setMainTotal]                     = useState<MainTotal | null>(() => tryParse('prisma-data-main-total', null))
  const [cpData, setCpData]                           = useState<CPData | null>(() => tryParse('prisma-data-cp', null))
  const [fluxoRows, setFluxoRows]                     = useState<FluxoRow[]>(() => tryParse('prisma-data-fluxo', []))
  const [fluxoTotal, setFluxoTotal]                   = useState<FluxoTotal | null>(() => tryParse('prisma-data-fluxo-total', null))
  const [consultorRows, setConsultorRows]             = useState<ConsultorRow[]>(() => tryParse('prisma-data-consultor', []))
  const [fluxoConsultorRows, setFluxoConsultorRows]   = useState<FluxoConsultorRow[]>(() => tryParse('prisma-data-fluxo-consultor', []))

  useEffect(() => { try { localStorage.setItem('prisma-data-main', JSON.stringify(mainRows)) } catch {} }, [mainRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-main-total', JSON.stringify(mainTotal)) } catch {} }, [mainTotal])
  useEffect(() => { try { localStorage.setItem('prisma-data-cp', JSON.stringify(cpData)) } catch {} }, [cpData])
  useEffect(() => { try { localStorage.setItem('prisma-data-fluxo', JSON.stringify(fluxoRows)) } catch {} }, [fluxoRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-fluxo-total', JSON.stringify(fluxoTotal)) } catch {} }, [fluxoTotal])
  useEffect(() => { try { localStorage.setItem('prisma-data-consultor', JSON.stringify(consultorRows)) } catch {} }, [consultorRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-fluxo-consultor', JSON.stringify(fluxoConsultorRows)) } catch {} }, [fluxoConsultorRows])

  async function loadFile(id: string, file: File) {
    if (id === 'main') {
      const { rows, total, cp, consultorRows: cr } = await parseMainFile(file)
      setMainRows(rows); setMainTotal(total); setCpData(cp); setConsultorRows(cr)
    } else if (id === 'fluxo') {
      const { rows, total, fluxoConsultorRows: fcr } = await parseFluxoFile(file)
      setFluxoRows(rows); setFluxoTotal(total); setFluxoConsultorRows(fcr)
    }
  }

  return (
    <DataCtx.Provider value={{ mainRows, mainTotal, cpData, fluxoRows, fluxoTotal, consultorRows, fluxoConsultorRows, loadFile }}>
      {children}
    </DataCtx.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataCtx)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
