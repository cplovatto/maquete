import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { ERS } from '../../context/VdDataContext'
import type { VdEquipeRow } from '../../context/VdDataContext'

/* ── Formatadores (mesma convenção de AppShell.tsx) ────────────────── */
export const fBRL  = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
export const fBRLR = (v: number) => `R$ ${fBRL(v)}`
export const fInt  = (v: number) => Math.round(v).toLocaleString('pt-BR')
export const fDec  = (v: number, d = 1) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d })
export const fPct  = (v: number) => (v * 100).toFixed(1).replace('.', ',') + '%'

/* ── KPI card / badge de variação (duplicados de AppShell.tsx, que não os exporta) ── */
export function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-var-note" style={{ marginLeft: 0 }}>{sub}</div>}
    </div>
  )
}

export function VarBadge({ v }: { v: number }) {
  return <span className={`var-badge${v > 0.05 ? ' var-pos' : v < -0.05 ? ' var-neg' : ''}`}>{fPct(v)}</span>
}

/** Barra meta vs. realizado — reaproveita .pace-bar-* de src/index.css */
export function MetaBar({ pct }: { pct: number }) {
  const color = pct >= 1 ? '#059669' : pct >= 0.7 ? '#f59e0b' : '#dc2626'
  return (
    <div className="pace-bar-wrap">
      <div className="pace-bar-track">
        <div className="pace-bar-fill" style={{ width: `${Math.min(100, pct * 100)}%`, background: color }} />
      </div>
    </div>
  )
}

/* ── Hook de ordenação de tabela (mesmo padrão de RankingPage em AppShell.tsx) ── */
export function useSort<T>(rows: T[], key: (r: T, k: string) => number, defaultKey: string) {
  const [sortKey, setSortKey] = useState(defaultKey)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      const va = key(a, sortKey), vb = key(b, sortKey)
      return sortDir === 'desc' ? vb - va : va - vb
    })
    return copy
  }, [rows, key, sortKey, sortDir])
  const toggleSort = (k: string) => {
    if (k === sortKey) setSortDir(d => (d === 'desc' ? 'asc' : 'desc'))
    else { setSortKey(k); setSortDir('desc') }
  }
  return { sorted, sortKey, sortDir, toggleSort }
}

export function SortTh({ label, sortKeyName, active, dir, onSort, right }: {
  label: string; sortKeyName: string; active: boolean; dir: 'asc' | 'desc'; onSort: (k: string) => void; right?: boolean
}) {
  return (
    <th className={`${right ? 'col-num' : ''} sort-th${active ? ' sort-active' : ''}`} onClick={() => onSort(sortKeyName)}>
      {label} <span className="sort-arrow">{active ? (dir === 'desc' ? '▼' : '▲') : '⇅'}</span>
    </th>
  )
}

/* ── Ícones (mesma fonte que AppShell.tsx: prototipo/prototipo01.html) ── */
export const VIC = {
  grid: <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>,
  users: <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  bolt: <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  check: <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>,
  dollar: <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  alert: <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  mapPin: <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  pieChart: <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  store: <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1.5-5h15L21 9"/><path d="M3 9v11h18V9"/><path d="M9 13h6"/></svg>,
}

/* ── Item de navegação da sidebar VD (sem sistema de import/warn dots — dados são mock) ── */
export function VdSideItem({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink to={to} end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
      {icon}
      {label}
    </NavLink>
  )
}

export function tendenciaBadgeClass(t: 'CRESCEU' | 'CAIU' | 'MANTEVE'): string {
  return t === 'CRESCEU' ? 'badge badge-green' : t === 'CAIU' ? 'badge badge-red' : 'badge badge-yellow'
}

/** Fecha um dropdown ao clicar fora dele (mesmo padrão do store-picker em AppShell.tsx) */
export function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = useRef<T>(null)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onOutside])
  return ref
}

export function riscoBadge(ciclos: number): { cls: string; label: string } {
  if (ciclos >= 6) return { cls: 'badge badge-red', label: `${ciclos} ciclos — saindo` }
  if (ciclos >= 4) return { cls: 'badge badge-yellow', label: `${ciclos} ciclos` }
  return { cls: 'badge badge-green', label: `${ciclos} ciclos` }
}

/* ── Meta editável inline (mesmo padrão de MetaTag/useIafMetas em AppShell.tsx) ── */
export function MetaTag({ label, value, defaultValue, onSave }: { label: string; value: number; defaultValue: number; onSave: (v: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const isCustom = value !== defaultValue
  function save() {
    const v = parseFloat(input.replace(',', '.'))
    if (!isNaN(v) && v > 0) { onSave(v); setEditing(false) }
  }
  if (editing) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <input value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
        autoFocus placeholder={String(defaultValue)} style={{ width: 56, fontSize: 13, padding: '2px 6px', borderRadius: 6, border: '1px solid var(--bg-border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }} />
      <button onClick={save} style={{ cursor: 'pointer' }}>✓</button>
      <button onClick={() => setEditing(false)} style={{ cursor: 'pointer' }}>✕</button>
    </span>
  )
  return (
    <span
      onClick={() => { setInput(String(value)); setEditing(true) }}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 13,
        color: isCustom ? 'var(--brand-primary)' : 'var(--text-secondary)',
        background: isCustom ? 'rgba(124,58,237,.08)' : 'transparent',
        border: `1px solid ${isCustom ? 'rgba(124,58,237,.25)' : 'var(--bg-border)'}`,
        borderRadius: 6, padding: '2px 8px', userSelect: 'none' }}
      title="Clique para editar a meta"
    >
      {label}: <strong>{fDec(value, 1)}%</strong>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    </span>
  )
}

export const VD_MIX_METAS_DEFAULT = { skin: 14, make: 46, multimarca: 32, cabelos: 20 }
export type VdMixMetasKey = keyof typeof VD_MIX_METAS_DEFAULT

export function useVdMixMetas() {
  const [metas, setMetas] = useState<typeof VD_MIX_METAS_DEFAULT>(() => {
    try { return { ...VD_MIX_METAS_DEFAULT, ...JSON.parse(localStorage.getItem('prisma-prefs-vd-mix-metas') ?? '{}') } }
    catch { return { ...VD_MIX_METAS_DEFAULT } }
  })
  function updateMeta(key: VdMixMetasKey, value: number) {
    const next = { ...metas, [key]: value }
    setMetas(next)
    localStorage.setItem('prisma-prefs-vd-mix-metas', JSON.stringify(next))
  }
  return { metas, updateMeta }
}

/** Célula de % colorida conforme meta (mesmo padrão do ICell em IafIndicadoresPage) */
export function MetaCell({ v, meta }: { v: number; meta: number }) {
  const ok = v * 100 >= meta
  return (
    <td className="col-num" style={{ fontWeight: ok ? undefined : 700, color: ok ? '#059669' : '#dc2626' }}>
      {fDec(v * 100, 1)}%
    </td>
  )
}

/* ── Agrupamento por Gerente (mesma estrutura de "TOTAL EQUIPE X" da planilha real) ── */
export function groupByGerente<T extends { gerente: string }>(rows: T[]): { gerente: string; items: T[] }[] {
  const groups: { gerente: string; items: T[] }[] = []
  const byGerente = new Map<string, T[]>()
  for (const r of rows) {
    if (!byGerente.has(r.gerente)) { byGerente.set(r.gerente, []); groups.push({ gerente: r.gerente, items: byGerente.get(r.gerente)! }) }
    byGerente.get(r.gerente)!.push(r)
  }
  return groups
}

/**
 * Peso estimado de reativação por ciclo sem comprar — usado só para projetar
 * quantas revendedoras devem voltar a ficar ativas até o fim do ciclo.
 * Bucket 0 = já está ativa (peso 1). Os demais são uma curva de exemplo
 * (decrescente: quanto mais ciclos sem comprar, menor a chance de reativação).
 */
export const REATIVACAO_WEIGHTS = [1, 0.55, 0.35, 0.25, 0.15, 0.08, 0.03]

export function projecaoAtivasPorBucket(base: number[]): number[] {
  return base.map((v, i) => v * (REATIVACAO_WEIGHTS[i] ?? 0))
}

/* ── IAF (Indicadores) do Canal VD ──────────────────────────────────
 * Consolida 8 indicadores por equipe: PEF, Atividade, Base, Cabelos,
 * Make, Multimarcas, VDI, Treinamentos. PEF e Atividade comparam contra
 * a própria meta da equipe (1 = 100% do alvo); os demais comparam
 * contra uma meta única da rede, editável (useVdIafMetas/useVdMixMetas).
 */
export interface VdIafIndicadores {
  pef: number
  atividade: number
  base: number
  cabelos: number
  make: number
  multimarcas: number
  vdi: number
  treinamentos: number
}

export function calcIafIndicadores(e: VdEquipeRow): VdIafIndicadores {
  const emRisco = e.base[4] + e.base[5] + e.base[6]
  return {
    pef: e.realizadoFinanceiro / e.metaFinanceira,
    atividade: e.realizadoAtivos / e.metaAtivos,
    base: (e.baseTotal - emRisco) / e.baseTotal,
    cabelos: e.cabelosQtd / e.ativasBase,
    make: e.makeQtd / e.ativasBase,
    multimarcas: e.multimarcaQtd / e.ativasBase,
    vdi: e.vdiUsoPct / 100,
    treinamentos: e.treinamentoPct / 100,
  }
}

export const VD_IAF_METAS_DEFAULT = { base: 90, vdi: 90, treinamento: 95 }
export type VdIafMetasKey = keyof typeof VD_IAF_METAS_DEFAULT

export function useVdIafMetas() {
  const [metas, setMetas] = useState<typeof VD_IAF_METAS_DEFAULT>(() => {
    try { return { ...VD_IAF_METAS_DEFAULT, ...JSON.parse(localStorage.getItem('prisma-prefs-vd-iaf-metas') ?? '{}') } }
    catch { return { ...VD_IAF_METAS_DEFAULT } }
  })
  function updateMeta(key: VdIafMetasKey, value: number) {
    const next = { ...metas, [key]: value }
    setMetas(next)
    localStorage.setItem('prisma-prefs-vd-iaf-metas', JSON.stringify(next))
  }
  return { metas, updateMeta }
}

/** Agrega as equipes de um Espaço do Revendedor (ER) num "equipe-like" consolidado, pra reusar calcIafIndicadores. */
export function agregarPorEr(equipes: VdEquipeRow[]): { er: string; equipes: number; consolidado: VdEquipeRow }[] {
  return ERS.map(er => {
    const items = equipes.filter(e => e.er === er)
    const sum = (f: (e: VdEquipeRow) => number) => items.reduce((s, e) => s + f(e), 0)
    const sumBuckets = (idx: number) => items.reduce((s, e) => s + e.base[idx], 0)
    const consolidado: VdEquipeRow = {
      id: `er-${er}`,
      nome: er,
      gerente: '',
      er,
      base: [0, 1, 2, 3, 4, 5, 6].map(sumBuckets),
      baseTotal: sum(e => e.baseTotal),
      metaCadastro: sum(e => e.metaCadastro),
      iniciosReinicios: sum(e => e.iniciosReinicios),
      liquidas: sum(e => e.liquidas),
      premiacao: null,
      metaFinanceira: sum(e => e.metaFinanceira),
      realizadoFinanceiro: sum(e => e.realizadoFinanceiro),
      metaAtivos: sum(e => e.metaAtivos),
      realizadoAtivos: sum(e => e.realizadoAtivos),
      ativasBase: sum(e => e.ativasBase),
      skinQtd: sum(e => e.skinQtd),
      makeQtd: sum(e => e.makeQtd),
      multimarcaQtd: sum(e => e.multimarcaQtd),
      cabelosQtd: sum(e => e.cabelosQtd),
      vdiUsoPct: items.length ? sum(e => e.vdiUsoPct) / items.length : 0,
      treinamentoPct: items.length ? sum(e => e.treinamentoPct) / items.length : 0,
    }
    return { er, equipes: items.length, consolidado }
  })
}
