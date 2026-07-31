import { Fragment } from 'react'
import { useVdData } from '../../context/VdDataContext'
import { KpiCard, SortTh, fBRLR, fInt, fPct, groupBy, useSort } from './vdShared'
import type { VdEquipeRow } from '../../context/VdDataContext'

export default function RankingEquipesPage() {
  const { ciclo, equipes } = useVdData()

  const totalBase = equipes.reduce((s, e) => s + e.baseTotal, 0)
  const totalLiquidas = equipes.reduce((s, e) => s + e.liquidas, 0)
  const totalMetaFin = equipes.reduce((s, e) => s + e.metaFinanceira, 0)
  const totalRealFin = equipes.reduce((s, e) => s + e.realizadoFinanceiro, 0)
  const totalMetaAtivos = equipes.reduce((s, e) => s + e.metaAtivos, 0)
  const totalRealAtivos = equipes.reduce((s, e) => s + e.realizadoAtivos, 0)
  const pctFinanceiroGeral = totalRealFin / totalMetaFin
  const pctAtivosGeral = totalRealAtivos / totalMetaAtivos

  const keyOf = (e: VdEquipeRow, k: string): number => {
    switch (k) {
      case 'baseTotal': return e.baseTotal
      case 'financeiro': return e.realizadoFinanceiro / e.metaFinanceira
      case 'ativos': return e.realizadoAtivos / e.metaAtivos
      default: return 0
    }
  }
  const { sortKey, sortDir, toggleSort } = useSort(equipes, keyOf, 'baseTotal')

  const groups = groupBy(equipes, e => e.time).map(g => ({
    time: g.key,
    items: [...g.items].sort((a, b) => {
      const va = keyOf(a, sortKey), vb = keyOf(b, sortKey)
      return sortDir === 'desc' ? vb - va : va - vb
    }),
  }))

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Ranking de Equipes</h2>
          <p className="page-subtitle">{ciclo} — {equipes.length} equipes</p>
        </div>
      </div>

      <div className="kpi-row">
        <KpiCard label="Base total" value={fInt(totalBase)} sub="revendedoras" />
        <KpiCard label="Líquidas no ciclo" value={fInt(totalLiquidas)} />
        <KpiCard label="Financeiro" value={fPct(pctFinanceiroGeral)} sub="vs. meta" />
        <KpiCard label="Ativos" value={fPct(pctAtivosGeral)} sub="vs. meta" />
      </div>

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Equipe</th>
              <SortTh label="Base" sortKeyName="baseTotal" active={sortKey === 'baseTotal'} dir={sortDir} onSort={toggleSort} right />
              <th className="col-num">Líquidas</th>
              <SortTh label="% Financeiro" sortKeyName="financeiro" active={sortKey === 'financeiro'} dir={sortDir} onSort={toggleSort} right />
              <SortTh label="% Ativos" sortKeyName="ativos" active={sortKey === 'ativos'} dir={sortDir} onSort={toggleSort} right />
            </tr>
          </thead>
          <tbody>
            {groups.map(g => {
              const gBase = g.items.reduce((s, e) => s + e.baseTotal, 0)
              const gLiquidas = g.items.reduce((s, e) => s + e.liquidas, 0)
              const gMetaFin = g.items.reduce((s, e) => s + e.metaFinanceira, 0)
              const gRealFin = g.items.reduce((s, e) => s + e.realizadoFinanceiro, 0)
              const gMetaAtivos = g.items.reduce((s, e) => s + e.metaAtivos, 0)
              const gRealAtivos = g.items.reduce((s, e) => s + e.realizadoAtivos, 0)
              return (
                <Fragment key={g.time}>
                  {g.items.map(e => (
                    <tr key={e.id}>
                      <td>{e.time}</td>
                      <td className="td-primary">{e.nome}</td>
                      <td className="col-num">{fInt(e.baseTotal)}</td>
                      <td className="col-num" style={{ color: 'var(--text-muted)' }}>—</td>
                      <td className="col-num">{fPct(e.realizadoFinanceiro / e.metaFinanceira)}</td>
                      <td className="col-num">{fPct(e.realizadoAtivos / e.metaAtivos)}</td>
                    </tr>
                  ))}
                  <tr className="tfoot-total">
                    <td colSpan={2}>Total Time de {g.time}</td>
                    <td className="col-num">{fInt(gBase)}</td>
                    <td className="col-num" style={{ color: gLiquidas < 0 ? '#dc2626' : '#059669' }}>{gLiquidas > 0 ? '+' : ''}{fInt(gLiquidas)}</td>
                    <td className="col-num">{fPct(gRealFin / gMetaFin)}</td>
                    <td className="col-num">{fPct(gRealAtivos / gMetaAtivos)}</td>
                  </tr>
                </Fragment>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="tfoot-total">
              <td colSpan={2}>Total Geral</td>
              <td className="col-num">{fInt(totalBase)}</td>
              <td className="col-num">{totalLiquidas > 0 ? '+' : ''}{fInt(totalLiquidas)}</td>
              <td className="col-num">{fPct(pctFinanceiroGeral)}</td>
              <td className="col-num">{fPct(pctAtivosGeral)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="page-subtitle" style={{ marginTop: 8 }}>
        Líquidas só é acompanhada por Time — não tem apuração por equipe/supervisora. Meta financeira média: {fBRLR(equipes.reduce((s, e) => s + e.metaFinanceira, 0) / equipes.length)} por equipe.
      </p>
    </div>
  )
}
