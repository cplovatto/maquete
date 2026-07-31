import { useVdData } from '../../context/VdDataContext'
import { KpiCard, agregarPorEr, fBRLR, fInt, fPct } from './vdShared'

export default function ErPage() {
  const { ciclo, equipes } = useVdData()
  const linhas = agregarPorEr(equipes)

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <h2 className="page-title">ER — Desempenho</h2>
          <p className="page-subtitle">{ciclo} — desempenho geral de cada um dos 4 Espaços do Revendedor</p>
        </div>
      </div>

      <div className="kpi-row">
        {linhas.map(l => (
          <KpiCard key={l.er} label={l.er} value={`${fInt(l.baseTotal)} revendedoras`} sub={`${l.nEquipes} equipes`} />
        ))}
      </div>

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>ER</th>
              <th className="col-num">Equipes</th>
              <th className="col-num">Base</th>
              <th className="col-num">Líquidas</th>
              <th className="col-num">Meta financeira</th>
              <th className="col-num">Realizado financeiro</th>
              <th className="col-num">% Ativos</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(l => (
              <tr key={l.er}>
                <td className="td-primary">{l.er}</td>
                <td className="col-num">{l.nEquipes}</td>
                <td className="col-num">{fInt(l.baseTotal)}</td>
                <td className="col-num" style={{ color: l.liquidas < 0 ? '#dc2626' : '#059669', fontWeight: 600 }}>
                  {l.liquidas > 0 ? '+' : ''}{fInt(l.liquidas)}
                </td>
                <td className="col-num">{fBRLR(l.metaFinanceira)}</td>
                <td className="col-num">{fBRLR(l.realizadoFinanceiro)}</td>
                <td className="col-num">{fPct(l.realizadoAtivos / l.metaAtivos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
