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

/* Deduplica linhas de consultor pelo par (pdv, nome normalizado), mantendo a 1ª ocorrência */
function dedupConsultores<T>(rows: T[], key: (r: T) => string): T[] {
  const seen = new Set<string>()
  return rows.filter(r => {
    const k = key(r).trim().replace(/\s+/g, ' ').toUpperCase()
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

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
  bm_atual: number
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
  bm_atual: number
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

export interface LojaDigitalPdvRow {
  pdv: string
  clientes_enc: number
  clientes_ate: number
  tme: string
  convertidos: number
  conv_pct: number
  receita: number
  boleto_medio: number
}

export interface LojaDigitalTotal {
  clientes_enc: number
  clientes_ate: number
  tme: string
  convertidos: number
  conv_pct: number
  receita: number
  boleto_medio: number
}

export interface ShareCategoriasRow {
  pdv: string
  total_receita: number
  cabelos_r: number; cabelos_pct: number
  pele_r: number;    pele_pct: number
  gifts_r: number;   gifts_pct: number
  make_r: number;    make_pct: number
  perf_r: number;    perf_pct: number
  outros_r: number;  outros_pct: number
}

export interface ShareCategoriasCP {
  total_receita: number
  cabelos_r: number; cabelos_pct: number
  pele_r: number;    pele_pct: number
  gifts_r: number;   gifts_pct: number
  make_r: number;    make_pct: number
  perf_r: number;    perf_pct: number
  outros_r: number;  outros_pct: number
}

export interface ServicosRow {
  pdv: string
  servicos_totais: number
  servicos_completos: number
  pct_completos: number
}

export interface ServicosTotal {
  servicos_totais: number
  servicos_completos: number
  pct_completos: number
}

export interface MetaDiaRow {
  pdv: string
  venda_ly: number
}

export interface ParcialRow {
  pdv: string
  venda_parcial: number
  qb_atual: number
  iv_atual: number
}

export interface PefChannelData {
  receita_ant: number
  receita_atual: number
  meta_pef: number
  gap_r: number
  gap_pct: number | null
  realizado_pct: number | null
}
export interface PefRow {
  un: string
  pdv: string
  cidade: string
  local: string
  loja: PefChannelData
  cr: PefChannelData
  total: PefChannelData
}
export interface PefTotal { loja: PefChannelData; cr: PefChannelData; total: PefChannelData }
export interface PefFiltros { periodo_atual: string; periodo_anterior: string; cp: string }

export interface ParcialSkinRow {
  pdv: string
  share: number       // participação skin no GMV total (decimal)
  receita: number     // receita skin hoje
  receita_ant: number // receita skin mesmo dia LY
}

export interface ResgatesPdvRow {
  pdv: string
  pct_anterior: number
  pct_atual: number
  qtd_resgate_anterior: number
  qtd_resgate_atual: number
  qtd_boletos_anterior: number
  qtd_boletos_atual: number
}

export interface ResgatesTotal {
  pct_anterior: number
  pct_atual: number
  qtd_resgate_anterior: number
  qtd_resgate_atual: number
  qtd_boletos_anterior: number
  qtd_boletos_atual: number
}

export interface ResgatesConsultorRow {
  nome: string
  pct_atual: number
  qtd_resgate_atual: number
  qtd_boletos_atual: number
}

export interface BoletoPromoPdvRow {
  pdv: string
  total_boletos: number
  elegiveis_qtd: number
  elegiveis_pct: number
  convertidos_qtd: number
  convertidos_pct: number
  oficiais_qtd: number
  oficiais_pct: number
}

export interface BoletoPromoTotal {
  total_boletos: number
  elegiveis_qtd: number
  elegiveis_pct: number
  convertidos_qtd: number
  convertidos_pct: number
  oficiais_qtd: number
  oficiais_pct: number
}

export interface BoletoPromoConsultorRow {
  nome: string
  total_boletos: number
  elegiveis_qtd: number
  elegiveis_pct: number
  convertidos_qtd: number
  convertidos_pct: number
  oficiais_qtd: number
  oficiais_pct: number
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
  lojaDigitalRows: LojaDigitalPdvRow[]
  lojaDigitalTotal: LojaDigitalTotal | null
  shareCatRows: ShareCategoriasRow[]
  shareCatCP: ShareCategoriasCP | null
  servicosRows: ServicosRow[]
  servicosTotal: ServicosTotal | null
  resgatesPdvRows: ResgatesPdvRow[]
  resgatesTotal: ResgatesTotal | null
  resgatesConsultorRows: ResgatesConsultorRow[]
  boletoPromoPdvRows: BoletoPromoPdvRow[]
  boletoPromoTotal: BoletoPromoTotal | null
  boletoPromoConsultorRows: BoletoPromoConsultorRow[]
  metaDiaRows: MetaDiaRow[]
  parcialRows: ParcialRow[]
  parcialSkinRows: ParcialSkinRow[]
  // Anual — mesma forma dos dados mensais, espelhados por período
  anualMainRows: MainRow[]
  anualMainTotal: MainTotal | null
  anualCpData: CPData | null
  anualConsultorRows: ConsultorRow[]
  anualFluxoRows: FluxoRow[]
  anualFluxoTotal: FluxoTotal | null
  anualFluxoConsultorRows: FluxoConsultorRow[]
  anualSkinRows: SkinRow[]
  anualSkinConsultorRows: SkinConsultorRow[]
  anualSkinCP: SkinCP | null
  anualIdClienteRows: IDClienteRow[]
  anualIdClienteConsultorRows: IDClienteConsultorRow[]
  anualIdClienteCP: IDClienteCP | null
  anualLojaDigitalRows: LojaDigitalPdvRow[]
  anualLojaDigitalTotal: LojaDigitalTotal | null
  anualServicosRows: ServicosRow[]
  anualServicosTotal: ServicosTotal | null
  anualResgatesPdvRows: ResgatesPdvRow[]
  anualResgatesTotal: ResgatesTotal | null
  anualResgatesConsultorRows: ResgatesConsultorRow[]
  anualBoletoPromoPdvRows: BoletoPromoPdvRow[]
  anualBoletoPromoTotal: BoletoPromoTotal | null
  anualBoletoPromoConsultorRows: BoletoPromoConsultorRow[]
  pefRows: PefRow[]
  pefTotal: PefTotal | null
  pefFiltros: PefFiltros | null
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
    pdv:       String(a[0]).trim(),
    consultor: String(a[1]).trim(),
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
  const rows = raw
    .filter(r => {
      const a = r as unknown[]
      const pdv = String(a[0] ?? '').trim()
      const con = String(a[1] ?? '').trim()
      return pdv && con && pdv.toUpperCase() !== 'PDV' && con.toUpperCase() !== 'CONSULTOR' && pdv.toUpperCase() !== 'TOTAL'
    })
    .map(r => toConsultorRow(r as unknown[]))
  return dedupConsultores(rows, r => `${r.pdv}|${r.consultor}`)
}

function parseFluxoConsultorSheet(wb: WorkBook, utils: XLSX_Utils): FluxoConsultorRow[] {
  const ws = wb.Sheets['CONSULTOR']
  if (!ws) return []
  const raw = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  const rows = raw
    .filter(r => {
      const a = r as unknown[]
      const pdv = String(a[0] ?? '').trim()
      const con = String(a[1] ?? '').trim()
      return pdv && con && pdv.toUpperCase() !== 'PDV' && con.toUpperCase() !== 'CONSULTOR' && pdv.toUpperCase() !== 'TOTAL'
    })
    .map(r => {
      const a = r as unknown[]
      return {
        pdv:       String(a[0]).trim(),
        consultor: String(a[1]).trim(),
        resgates:  toNum(a[2]),
        conversoes: toNum(a[3]),
        conv_pct:  toNum(a[4]),
      }
    })
  return dedupConsultores(rows, r => `${r.pdv}|${r.consultor}`)
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
    pdv: String(a[0]), resgates: toNum(a[1]), conversoes: toNum(a[2]), conv_pct: toNum(a[3]), bm_atual: toNum(a[5]),
  })
  let total: FluxoTotal | null = null
  const tr = raw[1] as unknown[]
  if (tr && String(tr[0]).toUpperCase() === 'TOTAL') {
    const t = toRow(tr); total = { resgates: t.resgates, conversoes: t.conversoes, conv_pct: t.conv_pct, bm_atual: t.bm_atual }
  }
  const rows = raw.slice(2).filter(r => (r as unknown[])[0]).map(r => toRow(r as unknown[]))
  return { rows, total, fluxoConsultorRows }
}

function parseSkinPdvSheet(wb: WorkBook, utils: XLSX_Utils): SkinRow[] {
  const ws = wb.Sheets['PDV']
  if (!ws) return []
  const raw = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
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

function parseSkinConsultorSheet(wb: WorkBook, utils: XLSX_Utils): SkinConsultorRow[] {
  const ws = wb.Sheets['CONSULTOR']
  if (!ws) return []
  const raw = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  const rows = raw.slice(4).filter(r => {
    const a = r as unknown[]
    const con = String(a[0] ?? '').trim()
    const pdv = String(a[1] ?? '').trim()
    return con && pdv && con.toUpperCase() !== 'CONSULTOR' && pdv.toUpperCase() !== 'PDV'
  }).map(r => {
    const a = r as unknown[]
    return { consultor: String(a[0]).trim(), pdv: String(a[1]).trim(), share: toNum(a[2]), receita_atual: toNum(a[3]), receita_ant: toNum(a[4]) }
  })
  return dedupConsultores(rows, r => `${r.pdv}|${r.consultor}`)
}

function parseSkinCPSheet(wb: WorkBook, utils: XLSX_Utils): SkinCP | null {
  const ws = wb.Sheets['CP']
  if (!ws) return null
  const raw = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
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
  const { read, utils } = await getXLSX()
  const wb = read(buf)
  return { rows: parseSkinPdvSheet(wb, utils), consultorRows: parseSkinConsultorSheet(wb, utils), cp: parseSkinCPSheet(wb, utils) }
}

function parseIDClientePdvSheet(wb: WorkBook, utils: XLSX_Utils): IDClienteRow[] {
  const ws = wb.Sheets['PDV']
  if (!ws) return []
  const raw = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  return raw.slice(2).filter(r => {
    const a = r as unknown[]
    const pdv = String(a[0] ?? '').trim()
    return pdv && pdv.toUpperCase() !== 'PDV' && pdv.toUpperCase() !== 'TOTAL'
  }).map(r => {
    const a = r as unknown[]
    return {
      pdv: String(a[0]).trim(),
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

function parseIDClienteConsultorSheet(wb: WorkBook, utils: XLSX_Utils): IDClienteConsultorRow[] {
  const ws = wb.Sheets['CONSULTOR']
  if (!ws) return []
  const raw = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  const rows = raw.slice(1).filter(r => {
    const a = r as unknown[]
    const pdv = String(a[0] ?? '').trim()
    const con = String(a[1] ?? '').trim()
    return pdv && con && pdv.toUpperCase() !== 'PDV' && con.toUpperCase() !== 'CONSULTOR' && pdv.toUpperCase() !== 'TOTAL'
  }).map(r => {
    const a = r as unknown[]
    return {
      pdv:       String(a[0]).trim(),
      consultor: String(a[1]).trim(),
      atend_id:           toNum(a[2]),
      uso_indevido:       toNum(a[3]),
      pct_cpf:            toNum(a[4]),
      pct_boletos_validos: toNum(a[11]),
    }
  })
  return dedupConsultores(rows, r => `${r.pdv}|${r.consultor}`)
}

function parseIDClienteCPSheet(wb: WorkBook, utils: XLSX_Utils): IDClienteCP | null {
  const ws = wb.Sheets['CP']
  if (!ws) return null
  const raw = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
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
  const { read, utils } = await getXLSX()
  const wb = read(buf)
  return { rows: parseIDClientePdvSheet(wb, utils), consultorRows: parseIDClienteConsultorSheet(wb, utils), cp: parseIDClienteCPSheet(wb, utils) }
}

function parseLojaDigitalPdvSheet(wb: WorkBook, utils: XLSX_Utils): { rows: LojaDigitalPdvRow[]; total: LojaDigitalTotal | null } {
  const ws = wb.Sheets['PDV']
  if (!ws) return { rows: [], total: null }
  const raw = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
  const toRow = (a: unknown[]): LojaDigitalPdvRow => ({
    pdv: String(a[0]),
    clientes_enc: toNum(a[1]),
    clientes_ate: toNum(a[2]),
    tme: String(a[3] ?? ''),
    convertidos: toNum(a[4]),
    conv_pct: toNum(a[5]),
    receita: toNum(a[6]),
    boleto_medio: toNum(a[7]),
  })
  const tr = raw[1] as unknown[]
  const total: LojaDigitalTotal | null = tr ? {
    clientes_enc: toNum(tr[1]),
    clientes_ate: toNum(tr[2]),
    tme: String(tr[3] ?? ''),
    convertidos: toNum(tr[4]),
    conv_pct: toNum(tr[5]),
    receita: toNum(tr[6]),
    boleto_medio: toNum(tr[7]),
  } : null
  const rows = raw.slice(2).filter(r => (r as unknown[])[0]).map(r => toRow(r as unknown[]))
  return { rows, total }
}

async function parseLojaDigitalFile(file: File): Promise<{ rows: LojaDigitalPdvRow[]; total: LojaDigitalTotal | null }> {
  const buf = await file.arrayBuffer()
  const { read, utils } = await getXLSX()
  const wb = read(buf)
  return parseLojaDigitalPdvSheet(wb, utils)
}

function parseShareCatRow(a: unknown[]): ShareCategoriasRow {
  return {
    pdv: String(a[0]),
    total_receita: toNum(a[1]),
    cabelos_r: toNum(a[2]),  cabelos_pct: parseBRL(a[3]),
    pele_r:    toNum(a[4]),  pele_pct:    parseBRL(a[5]),
    gifts_r:   toNum(a[6]),  gifts_pct:   parseBRL(a[7]),
    make_r:    toNum(a[8]),  make_pct:    parseBRL(a[9]),
    perf_r:    toNum(a[10]), perf_pct:    parseBRL(a[11]),
    outros_r:  toNum(a[12]), outros_pct:  parseBRL(a[13]),
  }
}

async function parseShareCategoriasFile(file: File): Promise<{ rows: ShareCategoriasRow[]; cp: ShareCategoriasCP | null }> {
  const buf = await file.arrayBuffer()
  const { read, utils } = await getXLSX()
  const wb = read(buf)

  const wsPdv = wb.Sheets['PDV']
  const rows: ShareCategoriasRow[] = wsPdv
    ? utils.sheet_to_json<unknown[]>(wsPdv, { header: 1, defval: '' })
        .slice(2)
        .filter(r => (r as unknown[])[0])
        .map(r => parseShareCatRow(r as unknown[]))
    : []

  const wsCP = wb.Sheets['CP']
  let cp: ShareCategoriasCP | null = null
  if (wsCP) {
    const rawCP = utils.sheet_to_json<unknown[]>(wsCP, { header: 1, defval: '' })
    const a = rawCP[2] as unknown[] | undefined
    if (a) cp = { total_receita: toNum(a[1]), cabelos_r: toNum(a[2]), cabelos_pct: parseBRL(a[3]), pele_r: toNum(a[4]), pele_pct: parseBRL(a[5]), gifts_r: toNum(a[6]), gifts_pct: parseBRL(a[7]), make_r: toNum(a[8]), make_pct: parseBRL(a[9]), perf_r: toNum(a[10]), perf_pct: parseBRL(a[11]), outros_r: toNum(a[12]), outros_pct: parseBRL(a[13]) }
  }

  return { rows, cp }
}

async function parseServicosFile(file: File): Promise<{ rows: ServicosRow[]; total: ServicosTotal | null }> {
  const buf = await file.arrayBuffer()
  const { read, utils } = await getXLSX()
  const wb = read(buf)
  const ws = wb.Sheets['PDV']
  if (!ws) return { rows: [], total: null }
  const raw = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })

  // linha 1 = Total (valores vêm como strings com aspas: "\"563.5\"")
  const tr = raw[1] as unknown[] | undefined
  const parseQ = (v: unknown): number => {
    if (typeof v === 'number') return v
    return parseFloat(String(v ?? '').replace(/"/g, '').trim()) || 0
  }
  const total: ServicosTotal | null = tr ? {
    servicos_totais:   parseQ(tr[2]),
    servicos_completos: parseQ(tr[3]),
    pct_completos:     toNum(tr[4]),
  } : null

  const rows: ServicosRow[] = raw.slice(2).filter(r => (r as unknown[])[1]).map(r => {
    const a = r as unknown[]
    return {
      pdv:                String(a[1]),
      servicos_totais:    toNum(a[2]),
      servicos_completos: toNum(a[3]),
      pct_completos:      toNum(a[4]),
    }
  })

  return { rows, total }
}

async function parseBoletoPromoFile(file: File): Promise<{ rows: BoletoPromoPdvRow[]; total: BoletoPromoTotal | null; consultores: BoletoPromoConsultorRow[] }> {
  const buf = await file.arrayBuffer()
  const { read, utils } = await getXLSX()
  const wb = read(buf)
  const toNum = (v: unknown) => { const n = Number(v); return isNaN(n) ? 0 : n }
  const toPct = (v: unknown) => parseBRL(v) / 100

  function parseSheet<T>(sheetName: string, makeRow: (a: unknown[]) => T | null): T[] {
    const ws = wb.Sheets[sheetName]
    if (!ws) return []
    const data = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
    const result: T[] = []
    for (let i = 2; i < data.length; i++) {
      const row = makeRow(data[i] as unknown[])
      if (row) result.push(row)
    }
    return result
  }

  const makeBoletRow = (a: unknown[]): Omit<BoletoPromoPdvRow, 'pdv'> | null => {
    const convertidos_qtd = toNum(a[4])
    if (convertidos_qtd === 0) return null
    return {
      total_boletos: toNum(a[1]),
      elegiveis_qtd: toNum(a[2]),
      elegiveis_pct: toPct(a[3]),
      convertidos_qtd,
      convertidos_pct: toPct(a[5]),
      oficiais_qtd:  toNum(a[6]),
      oficiais_pct:  toPct(a[7]),
    }
  }

  const rows: BoletoPromoPdvRow[] = parseSheet('PDV', (a) => {
    const pdv = String(a[0]).trim()
    if (!pdv) return null
    const rest = makeBoletRow(a)
    return rest ? { pdv, ...rest } : null
  })

  const consultores: BoletoPromoConsultorRow[] = parseSheet('CONSULTOR', (a) => {
    const nome = String(a[0]).trim()
    if (!nome) return null
    const rest = makeBoletRow(a)
    return rest ? { nome, ...rest } : null
  })

  let total: BoletoPromoTotal | null = null
  const cpWs = wb.Sheets['CP']
  if (cpWs) {
    const cpData = utils.sheet_to_json<unknown[]>(cpWs, { header: 1, defval: '' })
    const a = cpData[2] as unknown[]
    if (a?.[0]) {
      total = {
        total_boletos: toNum(a[1]),
        elegiveis_qtd: toNum(a[2]),
        elegiveis_pct: toPct(a[3]),
        convertidos_qtd: toNum(a[4]),
        convertidos_pct: toPct(a[5]),
        oficiais_qtd:  toNum(a[6]),
        oficiais_pct:  toPct(a[7]),
      }
    }
  }

  return { rows, total, consultores }
}

async function parseResgatesFile(file: File): Promise<{ rows: ResgatesPdvRow[]; total: ResgatesTotal | null; consultores: ResgatesConsultorRow[] }> {
  const buf = await file.arrayBuffer()
  const { read, utils } = await getXLSX()
  const wb = read(buf)

  const rows: ResgatesPdvRow[] = []
  let total: ResgatesTotal | null = null

  const wsPdv = wb.Sheets['PDV']
  if (wsPdv) {
    const raw = utils.sheet_to_json<unknown[]>(wsPdv, { header: 1, defval: 0 })
    for (let i = 2; i < raw.length; i++) {
      const a = raw[i] as unknown[]
      if (a[0] === null || a[0] === undefined || a[0] === '') continue
      const obj = {
        pct_anterior:         toNum(a[2]),
        pct_atual:            toNum(a[3]),
        qtd_resgate_anterior: toNum(a[5]),
        qtd_resgate_atual:    toNum(a[6]),
        qtd_boletos_anterior: toNum(a[8]),
        qtd_boletos_atual:    toNum(a[9]),
      }
      if (String(a[0]) === 'TOTAL') { total = obj } else if (obj.pct_atual > 0) { rows.push({ pdv: String(a[0]), ...obj }) }
    }
  }

  const consultores: ResgatesConsultorRow[] = []
  const wsConsultor = wb.Sheets['CONSULTOR']
  if (wsConsultor) {
    const raw = utils.sheet_to_json<unknown[]>(wsConsultor, { header: 1, defval: 0 })
    for (let i = 3; i < raw.length; i++) {
      const a = raw[i] as unknown[]
      if (!a[0] || String(a[0]) === 'TOTAL') continue
      const pct = toNum(a[2])
      if (pct === 0) continue
      consultores.push({
        nome:              String(a[0]),
        pct_atual:         pct,
        qtd_resgate_atual: toNum(a[4]),
        qtd_boletos_atual: toNum(a[6]),
      })
    }
  }

  return { rows, total, consultores }
}

async function parsePefFile(file: File): Promise<{ rows: PefRow[]; total: PefTotal; filtros: PefFiltros }> {
  const { read, utils } = await getXLSX()
  const ab = await file.arrayBuffer()
  const wb = read(ab, { type: 'array' })

  const filtrosWs = wb.Sheets['FILTROS']
  const filtrosData = utils.sheet_to_json<(string | number)[]>(filtrosWs, { header: 1, defval: '' })
  const filtros: PefFiltros = {
    periodo_atual:    String(filtrosData[2]?.[1] ?? ''),
    periodo_anterior: String(filtrosData[3]?.[1] ?? ''),
    cp:               String(filtrosData[4]?.[1] ?? ''),
  }

  const ws = wb.Sheets['PERFORMANCE POR PDV']
  const data = utils.sheet_to_json<(string | number)[]>(ws, { header: 1, defval: '' })

  function parseChannel(row: (string | number)[], offset: number): PefChannelData {
    const toNum = (v: string | number) => typeof v === 'number' ? v : 0
    const toNullable = (v: string | number) => typeof v === 'number' ? v : null
    return {
      receita_ant:    toNum(row[offset]),
      receita_atual:  toNum(row[offset + 1]),
      meta_pef:       toNum(row[offset + 2]),
      gap_r:          toNum(row[offset + 3]),
      gap_pct:        toNullable(row[offset + 4]),
      realizado_pct:  toNullable(row[offset + 5]),
    }
  }

  const totalRow = data[3] ?? []
  const total: PefTotal = {
    loja:  parseChannel(totalRow, 4),
    cr:    parseChannel(totalRow, 10),
    total: parseChannel(totalRow, 16),
  }

  const rows: PefRow[] = []
  for (let i = 4; i < data.length; i++) {
    const row = data[i]
    if (!row[1] && row[1] !== 0) continue
    rows.push({
      un:     String(row[0]),
      pdv:    String(row[1]),
      cidade: String(row[2]),
      local:  String(row[3]),
      loja:   parseChannel(row, 4),
      cr:     parseChannel(row, 10),
      total:  parseChannel(row, 16),
    })
  }

  return { rows, total, filtros }
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
  const [lojaDigitalRows, setLojaDigitalRows]                       = useState<LojaDigitalPdvRow[]>(() => tryParse('prisma-data-lojadigital', []))
  const [lojaDigitalTotal, setLojaDigitalTotal]                     = useState<LojaDigitalTotal | null>(() => tryParse('prisma-data-lojadigital-total', null))
  const [shareCatRows, setShareCatRows]                             = useState<ShareCategoriasRow[]>(() => tryParse('prisma-data-sharecat', []))
  const [shareCatCP, setShareCatCP]                                 = useState<ShareCategoriasCP | null>(() => tryParse('prisma-data-sharecat-cp', null))
  const [servicosRows, setServicosRows]                             = useState<ServicosRow[]>(() => tryParse('prisma-data-servicos', []))
  const [servicosTotal, setServicosTotal]                           = useState<ServicosTotal | null>(() => tryParse('prisma-data-servicos-total', null))
  const [resgatesPdvRows, setResgatesPdvRows]                       = useState<ResgatesPdvRow[]>(() => tryParse('prisma-data-resgates', []))
  const [resgatesTotal, setResgatesTotal]                           = useState<ResgatesTotal | null>(() => tryParse('prisma-data-resgates-total', null))
  const [resgatesConsultorRows, setResgatesConsultorRows]           = useState<ResgatesConsultorRow[]>(() => tryParse('prisma-data-resgates-consultor', []))
  const [boletoPromoPdvRows, setBoletoPromoPdvRows]                 = useState<BoletoPromoPdvRow[]>(() => tryParse('prisma-data-boleto-promo', []))
  const [boletoPromoTotal, setBoletoPromoTotal]                     = useState<BoletoPromoTotal | null>(() => tryParse('prisma-data-boleto-promo-total', null))
  const [boletoPromoConsultorRows, setBoletoPromoConsultorRows]     = useState<BoletoPromoConsultorRow[]>(() => tryParse('prisma-data-boleto-promo-consultor', []))
  const [metaDiaRows, setMetaDiaRows]                               = useState<MetaDiaRow[]>(() => tryParse('prisma-data-meta-dia', []))
  const [parcialRows, setParcialRows]                               = useState<ParcialRow[]>(() => tryParse('prisma-data-parcial', []))
  const [parcialSkinRows, setParcialSkinRows]                       = useState<ParcialSkinRow[]>(() => tryParse('prisma-data-parcial-skin', []))

  // Anual
  const [anualMainRows, setAnualMainRows]                           = useState<MainRow[]>(() => tryParse('prisma-data-anual-main', []))
  const [anualMainTotal, setAnualMainTotal]                         = useState<MainTotal | null>(() => tryParse('prisma-data-anual-main-total', null))
  const [anualCpData, setAnualCpData]                               = useState<CPData | null>(() => tryParse('prisma-data-anual-cp', null))
  const [anualConsultorRows, setAnualConsultorRows]                 = useState<ConsultorRow[]>(() => tryParse('prisma-data-anual-consultor', []))
  const [anualFluxoRows, setAnualFluxoRows]                         = useState<FluxoRow[]>(() => tryParse('prisma-data-anual-fluxo', []))
  const [anualFluxoTotal, setAnualFluxoTotal]                       = useState<FluxoTotal | null>(() => tryParse('prisma-data-anual-fluxo-total', null))
  const [anualFluxoConsultorRows, setAnualFluxoConsultorRows]       = useState<FluxoConsultorRow[]>(() => tryParse('prisma-data-anual-fluxo-consultor', []))
  const [anualSkinRows, setAnualSkinRows]                           = useState<SkinRow[]>(() => tryParse('prisma-data-anual-skin', []))
  const [anualSkinConsultorRows, setAnualSkinConsultorRows]         = useState<SkinConsultorRow[]>(() => tryParse('prisma-data-anual-skin-consultor', []))
  const [anualSkinCP, setAnualSkinCP]                               = useState<SkinCP | null>(() => tryParse('prisma-data-anual-skin-cp', null))
  const [anualIdClienteRows, setAnualIdClienteRows]                 = useState<IDClienteRow[]>(() => tryParse('prisma-data-anual-idcliente', []))
  const [anualIdClienteConsultorRows, setAnualIdClienteConsultorRows] = useState<IDClienteConsultorRow[]>(() => tryParse('prisma-data-anual-idcliente-consultor', []))
  const [anualIdClienteCP, setAnualIdClienteCP]                     = useState<IDClienteCP | null>(() => tryParse('prisma-data-anual-idcliente-cp', null))
  const [anualLojaDigitalRows, setAnualLojaDigitalRows]             = useState<LojaDigitalPdvRow[]>(() => tryParse('prisma-data-anual-lojadigital', []))
  const [anualLojaDigitalTotal, setAnualLojaDigitalTotal]           = useState<LojaDigitalTotal | null>(() => tryParse('prisma-data-anual-lojadigital-total', null))
  const [anualServicosRows, setAnualServicosRows]                   = useState<ServicosRow[]>(() => tryParse('prisma-data-anual-servicos', []))
  const [anualServicosTotal, setAnualServicosTotal]                 = useState<ServicosTotal | null>(() => tryParse('prisma-data-anual-servicos-total', null))
  const [anualResgatesPdvRows, setAnualResgatesPdvRows]             = useState<ResgatesPdvRow[]>(() => tryParse('prisma-data-anual-resgates', []))
  const [anualResgatesTotal, setAnualResgatesTotal]                 = useState<ResgatesTotal | null>(() => tryParse('prisma-data-anual-resgates-total', null))
  const [anualResgatesConsultorRows, setAnualResgatesConsultorRows] = useState<ResgatesConsultorRow[]>(() => tryParse('prisma-data-anual-resgates-consultor', []))
  const [anualBoletoPromoPdvRows, setAnualBoletoPromoPdvRows]       = useState<BoletoPromoPdvRow[]>(() => tryParse('prisma-data-anual-boleto-promo', []))
  const [anualBoletoPromoTotal, setAnualBoletoPromoTotal]           = useState<BoletoPromoTotal | null>(() => tryParse('prisma-data-anual-boleto-promo-total', null))
  const [anualBoletoPromoConsultorRows, setAnualBoletoPromoConsultorRows] = useState<BoletoPromoConsultorRow[]>(() => tryParse('prisma-data-anual-boleto-promo-consultor', []))

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
  useEffect(() => { try { localStorage.setItem('prisma-data-lojadigital', JSON.stringify(lojaDigitalRows)) } catch {} }, [lojaDigitalRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-lojadigital-total', JSON.stringify(lojaDigitalTotal)) } catch {} }, [lojaDigitalTotal])
  useEffect(() => { try { localStorage.setItem('prisma-data-sharecat', JSON.stringify(shareCatRows)) } catch {} }, [shareCatRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-sharecat-cp', JSON.stringify(shareCatCP)) } catch {} }, [shareCatCP])
  useEffect(() => { try { localStorage.setItem('prisma-data-servicos', JSON.stringify(servicosRows)) } catch {} }, [servicosRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-servicos-total', JSON.stringify(servicosTotal)) } catch {} }, [servicosTotal])
  useEffect(() => { try { localStorage.setItem('prisma-data-resgates', JSON.stringify(resgatesPdvRows)) } catch {} }, [resgatesPdvRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-resgates-total', JSON.stringify(resgatesTotal)) } catch {} }, [resgatesTotal])
  useEffect(() => { try { localStorage.setItem('prisma-data-resgates-consultor', JSON.stringify(resgatesConsultorRows)) } catch {} }, [resgatesConsultorRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-meta-dia', JSON.stringify(metaDiaRows)) } catch {} }, [metaDiaRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-parcial', JSON.stringify(parcialRows)) } catch {} }, [parcialRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-parcial-skin', JSON.stringify(parcialSkinRows)) } catch {} }, [parcialSkinRows])

  useEffect(() => { try { localStorage.setItem('prisma-data-anual-main', JSON.stringify(anualMainRows)) } catch {} }, [anualMainRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-main-total', JSON.stringify(anualMainTotal)) } catch {} }, [anualMainTotal])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-cp', JSON.stringify(anualCpData)) } catch {} }, [anualCpData])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-consultor', JSON.stringify(anualConsultorRows)) } catch {} }, [anualConsultorRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-fluxo', JSON.stringify(anualFluxoRows)) } catch {} }, [anualFluxoRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-fluxo-total', JSON.stringify(anualFluxoTotal)) } catch {} }, [anualFluxoTotal])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-fluxo-consultor', JSON.stringify(anualFluxoConsultorRows)) } catch {} }, [anualFluxoConsultorRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-skin', JSON.stringify(anualSkinRows)) } catch {} }, [anualSkinRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-skin-consultor', JSON.stringify(anualSkinConsultorRows)) } catch {} }, [anualSkinConsultorRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-skin-cp', JSON.stringify(anualSkinCP)) } catch {} }, [anualSkinCP])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-idcliente', JSON.stringify(anualIdClienteRows)) } catch {} }, [anualIdClienteRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-idcliente-consultor', JSON.stringify(anualIdClienteConsultorRows)) } catch {} }, [anualIdClienteConsultorRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-idcliente-cp', JSON.stringify(anualIdClienteCP)) } catch {} }, [anualIdClienteCP])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-lojadigital', JSON.stringify(anualLojaDigitalRows)) } catch {} }, [anualLojaDigitalRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-lojadigital-total', JSON.stringify(anualLojaDigitalTotal)) } catch {} }, [anualLojaDigitalTotal])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-servicos', JSON.stringify(anualServicosRows)) } catch {} }, [anualServicosRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-servicos-total', JSON.stringify(anualServicosTotal)) } catch {} }, [anualServicosTotal])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-resgates', JSON.stringify(anualResgatesPdvRows)) } catch {} }, [anualResgatesPdvRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-resgates-total', JSON.stringify(anualResgatesTotal)) } catch {} }, [anualResgatesTotal])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-resgates-consultor', JSON.stringify(anualResgatesConsultorRows)) } catch {} }, [anualResgatesConsultorRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-boleto-promo', JSON.stringify(anualBoletoPromoPdvRows)) } catch {} }, [anualBoletoPromoPdvRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-boleto-promo-total', JSON.stringify(anualBoletoPromoTotal)) } catch {} }, [anualBoletoPromoTotal])
  useEffect(() => { try { localStorage.setItem('prisma-data-anual-boleto-promo-consultor', JSON.stringify(anualBoletoPromoConsultorRows)) } catch {} }, [anualBoletoPromoConsultorRows])
  const [pefRows, setPefRows]         = useState<PefRow[]>(() => tryParse('prisma-data-pef', []))
  const [pefTotal, setPefTotal]       = useState<PefTotal | null>(() => tryParse('prisma-data-pef-total', null))
  const [pefFiltros, setPefFiltros]   = useState<PefFiltros | null>(() => tryParse('prisma-data-pef-filtros', null))
  useEffect(() => { try { localStorage.setItem('prisma-data-pef', JSON.stringify(pefRows)) } catch {} }, [pefRows])
  useEffect(() => { try { localStorage.setItem('prisma-data-pef-total', JSON.stringify(pefTotal)) } catch {} }, [pefTotal])
  useEffect(() => { try { localStorage.setItem('prisma-data-pef-filtros', JSON.stringify(pefFiltros)) } catch {} }, [pefFiltros])

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
    } else if (id === 'loja-digital') {
      const { rows, total } = await parseLojaDigitalFile(file)
      setLojaDigitalRows(rows); setLojaDigitalTotal(total)
    } else if (id === 'share-categorias') {
      const { rows, cp } = await parseShareCategoriasFile(file)
      setShareCatRows(rows); setShareCatCP(cp)
    } else if (id === 'servicos') {
      const { rows, total } = await parseServicosFile(file)
      setServicosRows(rows); setServicosTotal(total)
    } else if (id === 'resgates') {
      const { rows, total, consultores } = await parseResgatesFile(file)
      setResgatesPdvRows(rows); setResgatesTotal(total); setResgatesConsultorRows(consultores)
    } else if (id === 'boleto-promo') {
      const { rows, total, consultores } = await parseBoletoPromoFile(file)
      setBoletoPromoPdvRows(rows); setBoletoPromoTotal(total); setBoletoPromoConsultorRows(consultores)
      localStorage.setItem('prisma-data-boleto-promo', JSON.stringify(rows))
      localStorage.setItem('prisma-data-boleto-promo-total', JSON.stringify(total))
      localStorage.setItem('prisma-data-boleto-promo-consultor', JSON.stringify(consultores))
    } else if (id === 'parcial') {
      // Formato: GerencialVendas-DD-MM-YYYY.csv
      // Separador ponto-e-vírgula, encoding UTF-8 com BOM
      // Col 0: "12904 - Nome da Loja" → PDV = dígitos antes do " - "
      // Col 2: GMV parcial do dia (formato BRL: "2.203,43")
      const text = await file.text()
      const lines = text.replace(/^﻿/, '').split('\n').map(l => l.trim()).filter(Boolean)
      const rows: ParcialRow[] = lines
        .slice(1) // pula cabeçalho
        .map(line => {
          const cols = line.split(';')
          const pdvRaw = String(cols[0] ?? '').trim()
          const match = pdvRaw.match(/^(\d+)\s*-/)
          const pdv = match ? match[1] : ''
          const venda_parcial = parseBRL(cols[2])
          const qb_atual      = parseBRL(cols[4])
          const iv_atual      = parseBRL(cols[5])
          return { pdv, venda_parcial, qb_atual, iv_atual }
        })
        .filter(r => r.pdv && r.venda_parcial > 0)
      setParcialRows(rows)
    } else if (id === 'parcial-skin') {
      const { read, utils } = await getXLSX()
      const data = await file.arrayBuffer()
      const wb = read(data, { type: 'array' })
      const ws = wb.Sheets['PDV'] ?? wb.Sheets[wb.SheetNames[0]]
      const raw = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
      // Linhas 0-1: cabeçalhos; linhas 2-3: totais — pular tudo até PDV numérico
      const rows: ParcialSkinRow[] = raw
        .filter(r => {
          const pdv = String((r as unknown[])[0] ?? '').trim()
          return /^\d{4,6}$/.test(pdv)
        })
        .map(r => {
          const a = r as unknown[]
          return {
            pdv:         String(a[0]).trim(),
            share:       toNum(a[1]),      // (%) receita
            receita:     toNum(a[2]),      // receita atual
            receita_ant: toNum(a[3]),      // receita LY
          }
        })
      setParcialSkinRows(rows)
    } else if (id === 'meta') {
      const { read, utils } = await getXLSX()
      const data = await file.arrayBuffer()
      const wb = read(data, { type: 'array' })
      // Usa aba PDV se existir, senão primeira aba
      const ws = wb.Sheets['PDV'] ?? wb.Sheets[wb.SheetNames[0]]
      const raw = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
      const rows: MetaDiaRow[] = raw
        .filter(r => {
          const a = r as unknown[]
          const pdv = String(a[0] ?? '').trim()
          // Pula cabeçalhos e total
          return pdv && !isNaN(Number(pdv.replace(/\D/g, ''))) && pdv.toUpperCase() !== 'TOTAL'
        })
        .map(r => {
          const a = r as unknown[]
          // Col 0 = PDV, col 2 = PERÍODO ATUAL (= mesmo dia ano passado)
          return { pdv: String(a[0]).trim(), venda_ly: parseBRL(a[2]) }
        })
        .filter(r => r.venda_ly > 0)
      setMetaDiaRows(rows)
    } else if (id === 'anual-main') {
      const { rows, total, cp, consultorRows: cr } = await parseMainFile(file)
      setAnualMainRows(rows); setAnualMainTotal(total); setAnualCpData(cp); setAnualConsultorRows(cr)
    } else if (id === 'anual-fluxo') {
      const { rows, total, fluxoConsultorRows: fcr } = await parseFluxoFile(file)
      setAnualFluxoRows(rows); setAnualFluxoTotal(total); setAnualFluxoConsultorRows(fcr)
    } else if (id === 'anual-skin') {
      const { rows, consultorRows: cr, cp } = await parseSkinFile(file)
      setAnualSkinRows(rows); setAnualSkinConsultorRows(cr); setAnualSkinCP(cp)
    } else if (id === 'anual-id-cliente') {
      const { rows, consultorRows: cr, cp } = await parseIDClienteFile(file)
      setAnualIdClienteRows(rows); setAnualIdClienteConsultorRows(cr); setAnualIdClienteCP(cp)
    } else if (id === 'anual-loja-digital') {
      const { rows, total } = await parseLojaDigitalFile(file)
      setAnualLojaDigitalRows(rows); setAnualLojaDigitalTotal(total)
    } else if (id === 'anual-servicos') {
      const { rows, total } = await parseServicosFile(file)
      setAnualServicosRows(rows); setAnualServicosTotal(total)
    } else if (id === 'anual-resgates') {
      const { rows, total, consultores } = await parseResgatesFile(file)
      setAnualResgatesPdvRows(rows); setAnualResgatesTotal(total); setAnualResgatesConsultorRows(consultores)
    } else if (id === 'anual-boleto-promo') {
      const { rows, total, consultores } = await parseBoletoPromoFile(file)
      setAnualBoletoPromoPdvRows(rows); setAnualBoletoPromoTotal(total); setAnualBoletoPromoConsultorRows(consultores)
    } else if (id === 'anual-pef') {
      const { rows, total, filtros } = await parsePefFile(file)
      setPefRows(rows); setPefTotal(total); setPefFiltros(filtros)
    }
  }

  return (
    <DataCtx.Provider value={{ mainRows, mainTotal, cpData, fluxoRows, fluxoTotal, consultorRows, fluxoConsultorRows, skinRows, skinConsultorRows, skinCP, idClienteRows, idClienteConsultorRows, idClienteCP, lojaDigitalRows, lojaDigitalTotal, shareCatRows, shareCatCP, servicosRows, servicosTotal, resgatesPdvRows, resgatesTotal, resgatesConsultorRows, boletoPromoPdvRows, boletoPromoTotal, boletoPromoConsultorRows, metaDiaRows, parcialRows, parcialSkinRows,
      anualMainRows, anualMainTotal, anualCpData, anualConsultorRows, anualFluxoRows, anualFluxoTotal, anualFluxoConsultorRows, anualSkinRows, anualSkinConsultorRows, anualSkinCP, anualIdClienteRows, anualIdClienteConsultorRows, anualIdClienteCP, anualLojaDigitalRows, anualLojaDigitalTotal, anualServicosRows, anualServicosTotal, anualResgatesPdvRows, anualResgatesTotal, anualResgatesConsultorRows, anualBoletoPromoPdvRows, anualBoletoPromoTotal, anualBoletoPromoConsultorRows,
      pefRows, pefTotal, pefFiltros,
      loadFile }}>
      {children}
    </DataCtx.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataCtx)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
