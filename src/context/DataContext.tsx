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

export interface SkinRow {
  pdv: string
  share: number         // decimal, e.g. 0.0259 = 2.59%
  receita_atual: number
  receita_ant: number
  var_pct: number       // decimal
  botik_atual: number
  botik_ant: number
  demais_atual: number
  demais_ant: number
}

export interface SkinConsultorRow {
  consultor: string
  pdv: string
  share: number
  receita_atual: number
  receita_ant: number
}

export interface SkinCP {
  share: number
  receita_ant: number
  receita_atual: number
  var_pct: number
  botik_share: number
  botik_atual: number
  demais_share: number
  demais_atual: number
}

export interface IDClienteRow {
  pdv: string
  atend_id_ant: number
  atend_id_atual: number
  atend_cpf_atual: number
  pct_cpf_ant: number
  pct_cpf_atual: number
  uso_indevido_atual: number
  pct_uso_atual: number
  boletos_total_atual: number
  boletos_id_atual: number
  pct_boletos_validos_ant: number
  pct_boletos_validos_atual: number
}

export interface IDClienteConsultorRow {
  pdv: string
  consultor: string
  atend_id: number
  pct_cpf: number
  uso_indevido: number
  pct_boletos_validos: number
}

export interface IDClienteCP {
  atend_id: number
  pct_cpf: number
  uso_indevido: number
  pct_boletos_validos: number
}

interface DataCtxType {
  mainRows: MainRow[]
  mainTotal: MainTotal | null
  cpData: CPData | null
  fluxoRows: FluxoRow[]
  fluxoTotal: FluxoTotal | null
  consultorRows: ConsultorRow[]
  fluxoConsultorRows: FluxoConsultorRow[]
  skinRows: SkinRow[]
  skinConsultorRows: SkinConsultorRow[]
  skinCP: SkinCP | null
  idClienteRows: IDClienteRow[]
  idClienteConsultorRows: IDClienteConsultorRow[]
  idClienteCP: IDClienteCP | null
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

function parseConsultorSheet(wb: XLSX.WorkBook): ConsultorRow[] {
  const ws = wb.Sheets['CONSULTOR']
  if (!ws) return []
  const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  return raw
    .filter(r => {
      const a = r as unknown[]
      const pdv = String(a[0] ?? '').trim()
      const con = String(a[1] ?? '').trim()
      return pdv && con && pdv.toUpperCase() !== 'PDV' && con.toUpperCase() !== 'CONSULTOR' && pdv.toUpperCase() !== 'TOTAL'
    })
    .map(r => toConsultorRow(r as unknown[]))
}

function parseFluxoConsultorSheet(wb: XLSX.WorkBook): FluxoConsultorRow[] {
  const ws = wb.Sheets['CONSULTOR']
  if (!ws) return []
  const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
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
  const wb = XLSX.read(buf)

  const cp = parseCPSheet(wb)
  const consultorRows = parseConsultorSheet(wb)

  const ws = wb.Sheets['PDV']
  if (!ws) return { rows: [], total: null, cp, consultorRows }
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
  return { rows, total, cp, consultorRows }
}

async function parseFluxoFile(file: File): Promise<{ rows: FluxoRow[]; total: FluxoTotal | null; fluxoConsultorRows: FluxoConsultorRow[] }> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf)

  const fluxoConsultorRows = parseFluxoConsultorSheet(wb)

  const ws = wb.Sheets['PDV']
  if (!ws) return { rows: [], total: null, fluxoConsultorRows }
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
  return { rows, total, fluxoConsultorRows }
}

function parseSkinPdvSheet(wb: XLSX.WorkBook): SkinRow[] {
  const ws = wb.Sheets['PDV']
  if (!ws) return []
  const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  return raw.slice(4).filter(r => {
    const a = r as unknown[]
    const pdv = String(a[0] ?? '').trim()
    return pdv && pdv.toUpperCase() !== 'PDV' && pdv.toUpperCase() !== 'TOTAL'
  }).map(r => {
    const a = r as unknown[]
    return {
      pdv: String(a[0]),
      share: toNum(a[1]),
      receita_atual: toNum(a[2]), receita_ant: toNum(a[3]), var_pct: toNum(a[4]),
      botik_atual: toNum(a[5]),   botik_ant: toNum(a[6]),
      demais_atual: toNum(a[8]),  demais_ant: toNum(a[9]),
    }
  })
}

function parseSkinConsultorSheet(wb: XLSX.WorkBook): SkinConsultorRow[] {
  const ws = wb.Sheets['CONSULTOR']
  if (!ws) return []
  const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  return raw.slice(4).filter(r => {
    const a = r as unknown[]
    const con = String(a[0] ?? '').trim()
    const pdv = String(a[1] ?? '').trim()
    return con && pdv && con.toUpperCase() !== 'CONSULTOR' && pdv.toUpperCase() !== 'PDV'
  }).map(r => {
    const a = r as unknown[]
    return { consultor: String(a[0]), pdv: String(a[1]), share: toNum(a[2]), receita_atual: toNum(a[3]), receita_ant: toNum(a[4]) }
  })
}

function parseSkinCPSheet(wb: XLSX.WorkBook): SkinCP | null {
  const ws = wb.Sheets['CP']
  if (!ws) return null
  const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  // Skin total: "RECEITA CUIDADOS FACIAIS + BOTIK"
  const rowSkin = raw.find(r => { const c = String((r as unknown[])[0] ?? '').toLowerCase(); return c.includes('cuidados') || c.includes('facial') })
  // BOTIK total: row where col A = 'BOTIK' and col B = '' (not a subcategory)
  const rowBotik = raw.find(r => { const a = r as unknown[]; return String(a[0] ?? '').toLowerCase() === 'botik' && String(a[1] ?? '').trim() === '' })
  // Demais Marcas
  const rowDemais = raw.find(r => String((r as unknown[])[0] ?? '').toLowerCase().includes('demais'))
  if (!rowSkin) return null
  const a = rowSkin as unknown[]
  const b = rowBotik as unknown[] | undefined
  const d = rowDemais as unknown[] | undefined
  return {
    share: toNum(a[2]), receita_ant: toNum(a[3]), receita_atual: toNum(a[4]), var_pct: toNum(a[6]),
    botik_share: b ? toNum(b[2]) : 0, botik_atual: b ? toNum(b[4]) : 0,
    demais_share: d ? toNum(d[2]) : 0, demais_atual: d ? toNum(d[4]) : 0,
  }
}

async function parseSkinFile(file: File): Promise<{ rows: SkinRow[]; consultorRows: SkinConsultorRow[]; cp: SkinCP | null }> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf)
  return { rows: parseSkinPdvSheet(wb), consultorRows: parseSkinConsultorSheet(wb), cp: parseSkinCPSheet(wb) }
}

function parseIDClientePdvSheet(wb: XLSX.WorkBook): IDClienteRow[] {
  const ws = wb.Sheets['PDV']
  if (!ws) return []
  const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  return raw.slice(2).filter(r => {
    const a = r as unknown[]
    const pdv = String(a[0] ?? '').trim()
    return pdv && pdv.toUpperCase() !== 'PDV' && pdv.toUpperCase() !== 'TOTAL'
  }).map(r => {
    const a = r as unknown[]
    return {
      pdv: String(a[0]),
      atend_id_ant:              toNum(a[1]),  atend_id_atual:              toNum(a[2]),
      atend_cpf_atual:           toNum(a[5]),
      pct_cpf_ant:               toNum(a[10]), pct_cpf_atual:               toNum(a[11]),
      uso_indevido_atual:        toNum(a[8]),
      pct_uso_atual:             toNum(a[14]),
      boletos_total_atual:       toNum(a[20]),
      boletos_id_atual:          toNum(a[23]),
      pct_boletos_validos_ant:   toNum(a[31]), pct_boletos_validos_atual:   toNum(a[32]),
    }
  })
}

function parseIDClienteConsultorSheet(wb: XLSX.WorkBook): IDClienteConsultorRow[] {
  const ws = wb.Sheets['CONSULTOR']
  if (!ws) return []
  const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  return raw.slice(1).filter(r => {
    const a = r as unknown[]
    const pdv = String(a[0] ?? '').trim()
    const con = String(a[1] ?? '').trim()
    return pdv && con && pdv.toUpperCase() !== 'PDV' && con.toUpperCase() !== 'CONSULTOR' && pdv.toUpperCase() !== 'TOTAL'
  }).map(r => {
    const a = r as unknown[]
    return {
      pdv:       String(a[0]),
      consultor: String(a[1]),
      atend_id:           toNum(a[2]),
      uso_indevido:       toNum(a[3]),
      pct_cpf:            toNum(a[4]),
      pct_boletos_validos: toNum(a[11]),
    }
  })
}

function parseIDClienteCPSheet(wb: XLSX.WorkBook): IDClienteCP | null {
  const ws = wb.Sheets['CP']
  if (!ws) return null
  const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  const find = (test: (s: string) => boolean) =>
    raw.find(r => test(String((r as unknown[])[0] ?? '').toLowerCase())) as unknown[] | undefined
  const rowAtend    = find(s => s.includes('atend') && !s.includes('%') && !s.includes('cpf'))
  const rowCpf      = find(s => s.startsWith('%') && s.includes('cpf'))
  const rowIndevido = find(s => s.includes('indevido') && !s.includes('%'))
  const rowBolVal   = find(s => s.includes('válid') || s.includes('valid'))
  if (!rowAtend && !rowCpf) return null
  return {
    atend_id:           parseBRL(rowAtend?.[1] ?? 0),
    pct_cpf:            parseBRL(rowCpf?.[1]   ?? 0),
    uso_indevido:       parseBRL(rowIndevido?.[1] ?? 0),
    pct_boletos_validos: parseBRL(rowBolVal?.[1] ?? 0),
  }
}

async function parseIDClienteFile(file: File): Promise<{ rows: IDClienteRow[]; consultorRows: IDClienteConsultorRow[]; cp: IDClienteCP | null }> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf)
  return { rows: parseIDClientePdvSheet(wb), consultorRows: parseIDClienteConsultorSheet(wb), cp: parseIDClienteCPSheet(wb) }
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
  const [skinRows, setSkinRows]                       = useState<SkinRow[]>(() => tryParse('prisma-data-skin', []))
  const [skinConsultorRows, setSkinConsultorRows]     = useState<SkinConsultorRow[]>(() => tryParse('prisma-data-skin-consultor', []))
  const [skinCP, setSkinCP]                           = useState<SkinCP | null>(() => tryParse('prisma-data-skin-cp', null))
  const [idClienteRows, setIdClienteRows]                           = useState<IDClienteRow[]>(() => tryParse('prisma-data-idcliente', []))
  const [idClienteConsultorRows, setIdClienteConsultorRows]         = useState<IDClienteConsultorRow[]>(() => tryParse('prisma-data-idcliente-consultor', []))
  const [idClienteCP, setIdClienteCP]                               = useState<IDClienteCP | null>(() => tryParse('prisma-data-idcliente-cp', null))

  useEffect(() => { try { localStorage.setItem('prisma-data-main', JSON.stringify(mainRows)) } catch {} }, [mainRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-main-total', JSON.stringify(mainTotal)) } catch {} }, [mainTotal])
  useEffect(() => { try { localStorage.setItem('prisma-data-cp', JSON.stringify(cpData)) } catch {} }, [cpData])
  useEffect(() => { try { localStorage.setItem('prisma-data-fluxo', JSON.stringify(fluxoRows)) } catch {} }, [fluxoRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-fluxo-total', JSON.stringify(fluxoTotal)) } catch {} }, [fluxoTotal])
  useEffect(() => { try { localStorage.setItem('prisma-data-consultor', JSON.stringify(consultorRows)) } catch {} }, [consultorRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-fluxo-consultor', JSON.stringify(fluxoConsultorRows)) } catch {} }, [fluxoConsultorRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-skin', JSON.stringify(skinRows)) } catch {} }, [skinRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-skin-consultor', JSON.stringify(skinConsultorRows)) } catch {} }, [skinConsultorRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-skin-cp', JSON.stringify(skinCP)) } catch {} }, [skinCP])
  useEffect(() => { try { localStorage.setItem('prisma-data-idcliente', JSON.stringify(idClienteRows)) } catch {} }, [idClienteRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-idcliente-consultor', JSON.stringify(idClienteConsultorRows)) } catch {} }, [idClienteConsultorRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-idcliente-cp', JSON.stringify(idClienteCP)) } catch {} }, [idClienteCP])

  async function loadFile(id: string, file: File) {
    if (id === 'main') {
      const { rows, total, cp, consultorRows: cr } = await parseMainFile(file)
      setMainRows(rows); setMainTotal(total); setCpData(cp); setConsultorRows(cr)
    } else if (id === 'fluxo') {
      const { rows, total, fluxoConsultorRows: fcr } = await parseFluxoFile(file)
      setFluxoRows(rows); setFluxoTotal(total); setFluxoConsultorRows(fcr)
    } else if (id === 'skin') {
      const { rows, consultorRows: cr, cp } = await parseSkinFile(file)
      setSkinRows(rows); setSkinConsultorRows(cr); setSkinCP(cp)
    } else if (id === 'id-cliente') {
      const { rows, consultorRows: cr, cp } = await parseIDClienteFile(file)
      setIdClienteRows(rows); setIdClienteConsultorRows(cr); setIdClienteCP(cp)
    }
  }

  return (
    <DataCtx.Provider value={{ mainRows, mainTotal, cpData, fluxoRows, fluxoTotal, consultorRows, fluxoConsultorRows, skinRows, skinConsultorRows, skinCP, idClienteRows, idClienteConsultorRows, idClienteCP, loadFile }}>
      {children}
    </DataCtx.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataCtx)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
