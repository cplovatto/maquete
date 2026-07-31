import { useState } from 'react'
import { useVdData } from '../../context/VdDataContext'
import { KpiCard, fBRLR, fInt, fPct, riscoBadge, useClickOutside } from './vdShared'

export default function DetalheEquipePage() {
  const { ciclo, equipes, getRevendedorasAmostra } = useVdData()
  const [selectedId, setSelectedId] = useState(equipes[0]?.id)
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useClickOutside<HTMLDivElement>(() => setPickerOpen(false))

  const equipe = equipes.find(e => e.id === selectedId) ?? equipes[0]
  if (!equipe) return null
  const amostra = getRevendedorasAmostra(equipe.id)
  const emRisco = equipe.base[4] + equipe.base[5] + equipe.base[6]

  return (
    <div className="page-content">
      <div className="page-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="page-title">Raio-X da Equipe</h2>
          <p className="page-subtitle">{ciclo} — Time de {equipe.time}</p>
        </div>
        <div className="store-picker" ref={pickerRef}>
          <span className="detalhe-selector-label">Equipe</span>
          <button className="store-picker-btn" onClick={() => setPickerOpen(o => !o)}>
            {equipe.nome}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {pickerOpen && (
            <div className="store-picker-dropdown">
              {equipes.map(e => (
                <button
                  key={e.id}
                  className={`store-picker-option${e.id === equipe.id ? ' selected' : ''}`}
                  onClick={() => { setSelectedId(e.id); setPickerOpen(false) }}
                >
                  {e.nome} <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>· Time de {e.time}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="kpi-row">
        <KpiCard label="Base total" value={fInt(equipe.baseTotal)} sub="revendedoras" />
        <KpiCard label="Líquidas" value="—" sub="só por Time" />
        <KpiCard label="Financeiro" value={fPct(equipe.realizadoFinanceiro / equipe.metaFinanceira)} sub={`${fBRLR(equipe.realizadoFinanceiro)} de ${fBRLR(equipe.metaFinanceira)}`} />
        <KpiCard label="Ativos" value={fPct(equipe.realizadoAtivos / equipe.metaAtivos)} sub={`${fInt(equipe.realizadoAtivos)} de ${fInt(equipe.metaAtivos)}`} />
        <KpiCard label="Em risco (4-6 ciclos)" value={fInt(emRisco)} sub={fPct(emRisco / equipe.baseTotal)} />
      </div>

      <h3 className="page-section-title">Mix de produto entre ativas</h3>
      <div className="kpi-row">
        <KpiCard label="Skin" value={fPct(equipe.skinQtd / equipe.ativasBase)} />
        <KpiCard label="Make" value={fPct(equipe.makeQtd / equipe.ativasBase)} />
        <KpiCard label="Multimarca" value={fPct(equipe.multimarcaQtd / equipe.ativasBase)} />
      </div>

      <h3 className="page-section-title">Amostra de revendedoras (exemplo)</h3>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Revendedora</th>
              <th>Nível</th>
              <th>Situação</th>
              <th className="col-num">Ciclos sem comprar</th>
            </tr>
          </thead>
          <tbody>
            {amostra.map(r => {
              const risco = riscoBadge(r.ciclosInatividade)
              return (
                <tr key={r.id}>
                  <td className="td-primary">{r.nome}</td>
                  <td>{r.papel}</td>
                  <td>
                    <span className={`badge ${r.situacao === 'Ativo' ? 'badge-green' : 'badge-red'}`}>{r.situacao}</span>
                  </td>
                  <td className="col-num">
                    <span className={risco.cls}>{risco.label}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
