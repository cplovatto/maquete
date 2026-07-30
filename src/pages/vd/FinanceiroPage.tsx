import { useVdData } from '../../context/VdDataContext'
import { KpiCard, MetaBar, fBRLR, fPct } from './vdShared'

export default function FinanceiroPage() {
  const { ciclo, equipes } = useVdData()

  const totalMeta = equipes.reduce((s, e) => s + e.metaFinanceira, 0)
  const totalRealizado = equipes.reduce((s, e) => s + e.realizadoFinanceiro, 0)
  const bateram = equipes.filter(e => e.realizadoFinanceiro >= e.metaFinanceira).length

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Financeiro</h2>
          <p className="page-subtitle">{ciclo}</p>
        </div>
      </div>

      <div className="kpi-row">
        <KpiCard label="Meta financeira" value={fBRLR(totalMeta)} />
        <KpiCard label="Realizado" value={fBRLR(totalRealizado)} sub={fPct(totalRealizado / totalMeta)} />
        <KpiCard label="Gap" value={fBRLR(Math.max(0, totalMeta - totalRealizado))} />
        <KpiCard label="Equipes na meta" value={`${bateram}/${equipes.length}`} />
      </div>

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Gerente</th>
              <th>Equipe</th>
              <th className="col-num">Meta financeira</th>
              <th className="col-num">Realizado</th>
              <th>% da meta</th>
            </tr>
          </thead>
          <tbody>
            {equipes.map(e => {
              const pct = e.realizadoFinanceiro / e.metaFinanceira
              return (
                <tr key={e.id}>
                  <td>{e.gerente}</td>
                  <td className="td-primary">{e.nome}</td>
                  <td className="col-num">{fBRLR(e.metaFinanceira)}</td>
                  <td className="col-num">{fBRLR(e.realizadoFinanceiro)}</td>
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
              <td className="col-num">{fBRLR(totalMeta)}</td>
              <td className="col-num">{fBRLR(totalRealizado)}</td>
              <td>{fPct(totalRealizado / totalMeta)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
