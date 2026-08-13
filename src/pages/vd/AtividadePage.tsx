import { useState } from 'react'
import { useVdData } from '../../context/VdDataContext'
import { KpiCard, MetaBar, PeriodoToggle, fInt, fPct } from './vdShared'

export default function AtividadePage() {
  const { ciclo, equipes, equipesAno } = useVdData()
  const [periodo, setPeriodo] = useState<'ciclo' | 'ano'>('ciclo')
  const dados = periodo === 'ciclo' ? equipes : equipesAno

  const totalMeta = dados.reduce((s, e) => s + e.metaAtivos, 0)
  const totalRealizado = dados.reduce((s, e) => s + e.realizadoAtivos, 0)
  const totalBase = dados.reduce((s, e) => s + e.baseTotal, 0)
  const bateram = dados.filter(e => e.realizadoAtivos >= e.metaAtivos).length

  return (
    <div className="page-content">
      <div className="page-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="page-title">Atividade</h2>
          <p className="page-subtitle">{periodo === 'ciclo' ? ciclo : 'Ano (exemplo)'} — Responsável: Josi</p>
        </div>
        <PeriodoToggle value={periodo} onChange={setPeriodo} />
      </div>

      <div className="kpi-row">
        <KpiCard label="Meta de ativas" value={fInt(totalMeta)} />
        <KpiCard label="Ativas no ciclo" value={fInt(totalRealizado)} sub={fPct(totalRealizado / totalMeta)} />
        <KpiCard label="% da base ativa" value={fPct(totalRealizado / totalBase)} />
        <KpiCard label="Equipes na meta" value={`${bateram}/${dados.length}`} />
      </div>

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Equipe</th>
              <th className="col-num">Base</th>
              <th className="col-num">Meta ativas</th>
              <th className="col-num">Realizado</th>
              <th>% da meta</th>
            </tr>
          </thead>
          <tbody>
            {dados.map(e => {
              const pct = e.realizadoAtivos / e.metaAtivos
              return (
                <tr key={e.id}>
                  <td>{e.time}</td>
                  <td className="td-primary">{e.nome}</td>
                  <td className="col-num">{fInt(e.baseTotal)}</td>
                  <td className="col-num">{fInt(e.metaAtivos)}</td>
                  <td className="col-num">{fInt(e.realizadoAtivos)}</td>
                  <td style={{ minWidth: 140 }}>
                    <MetaBar pct={pct} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fPct(pct)}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="tfoot-total">
              <td colSpan={2}>Total Geral</td>
              <td className="col-num">{fInt(totalBase)}</td>
              <td className="col-num">{fInt(totalMeta)}</td>
              <td className="col-num">{fInt(totalRealizado)}</td>
              <td>{fPct(totalRealizado / totalMeta)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
