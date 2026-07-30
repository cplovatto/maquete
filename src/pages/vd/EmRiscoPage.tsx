import { Fragment } from 'react'
import { useVdData } from '../../context/VdDataContext'
import { KpiCard, fInt, fPct, groupByGerente, projecaoAtivasPorBucket } from './vdShared'

const BUCKET_LABELS = ['0', '1', '2', '3', '4', '5', '6']

function sumBuckets(rows: { base: number[] }[]): number[] {
  const totais = [0, 0, 0, 0, 0, 0, 0]
  rows.forEach(r => r.base.forEach((v, i) => { totais[i] += v }))
  return totais
}

export default function EmRiscoPage() {
  const { ciclo, equipes } = useVdData()
  const groups = groupByGerente(equipes)

  const totais = sumBuckets(equipes)
  const totalBase = totais.reduce((a, b) => a + b, 0)
  const emRisco = totais[4] + totais[5] + totais[6]
  const saindo = totais[6]

  const projecaoTotais = [0, 0, 0, 0, 0, 0, 0]
  equipes.forEach(e => projecaoAtivasPorBucket(e.base).forEach((v, i) => { projecaoTotais[i] += v }))
  const projecaoTotal = projecaoTotais.reduce((a, b) => a + b, 0)

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Em Risco</h2>
          <p className="page-subtitle">{ciclo} — distribuição por ciclos consecutivos sem comprar. Com 6 ciclos, a revendedora sai da base.</p>
        </div>
      </div>

      <div className="kpi-row">
        <KpiCard label="Base total" value={fInt(totalBase)} />
        <KpiCard label="Em risco (4-6 ciclos)" value={fInt(emRisco)} sub={fPct(emRisco / totalBase)} />
        <KpiCard label="Saindo (6 ciclos)" value={fInt(saindo)} sub={fPct(saindo / totalBase)} />
      </div>

      <h3 className="page-section-title">Base por ciclos sem comprar</h3>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Gerente</th>
              <th>Equipe</th>
              {BUCKET_LABELS.map(b => (
                <th key={b} className="col-num" style={{ color: Number(b) >= 4 ? '#dc2626' : undefined }}>{b} ciclos</th>
              ))}
              <th className="col-num">Total</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(g => {
              const subtotal = sumBuckets(g.items)
              const subtotalBase = subtotal.reduce((a, b) => a + b, 0)
              return (
                <Fragment key={g.gerente}>
                  {g.items.map(e => (
                    <tr key={e.id}>
                      <td>{e.gerente}</td>
                      <td className="td-primary">{e.nome}</td>
                      {e.base.map((v, i) => (
                        <td key={i} className="col-num" style={{ color: i >= 4 ? '#dc2626' : undefined, fontWeight: i === 6 ? 700 : undefined }}>
                          {fInt(v)}
                        </td>
                      ))}
                      <td className="col-num" style={{ fontWeight: 600 }}>{fInt(e.baseTotal)}</td>
                    </tr>
                  ))}
                  <tr className="tfoot-total">
                    <td colSpan={2}>Total {g.gerente}</td>
                    {subtotal.map((v, i) => (
                      <td key={i} className="col-num" style={{ color: i >= 4 ? '#dc2626' : undefined }}>{fInt(v)}</td>
                    ))}
                    <td className="col-num">{fInt(subtotalBase)}</td>
                  </tr>
                </Fragment>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="tfoot-total">
              <td colSpan={2}>Total Geral</td>
              {totais.map((v, i) => (
                <td key={i} className="col-num" style={{ color: i >= 4 ? '#dc2626' : undefined }}>{fInt(v)}</td>
              ))}
              <td className="col-num">{fInt(totalBase)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <h3 className="page-section-title">Projeção de ativas até o fim do ciclo</h3>
      <p className="page-subtitle" style={{ marginTop: -4, marginBottom: 12 }}>
        Estimativa (exemplo): quantas revendedoras de cada bucket devem voltar a comprar até o fechamento do ciclo,
        com base numa curva de reativação decrescente conforme o número de ciclos sem comprar.
      </p>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Gerente</th>
              <th>Equipe</th>
              {BUCKET_LABELS.map(b => <th key={b} className="col-num">{b} ciclos</th>)}
              <th className="col-num">Total projetado</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(g => {
              const projGroup = [0, 0, 0, 0, 0, 0, 0]
              g.items.forEach(e => projecaoAtivasPorBucket(e.base).forEach((v, i) => { projGroup[i] += v }))
              const projGroupTotal = projGroup.reduce((a, b) => a + b, 0)
              return (
                <Fragment key={g.gerente}>
                  {g.items.map(e => {
                    const proj = projecaoAtivasPorBucket(e.base)
                    const projTotal = proj.reduce((a, b) => a + b, 0)
                    return (
                      <tr key={e.id}>
                        <td>{e.gerente}</td>
                        <td className="td-primary">{e.nome}</td>
                        {proj.map((v, i) => <td key={i} className="col-num">{fInt(v)}</td>)}
                        <td className="col-num" style={{ fontWeight: 600 }}>{fInt(projTotal)}</td>
                      </tr>
                    )
                  })}
                  <tr className="tfoot-total">
                    <td colSpan={2}>Total {g.gerente}</td>
                    {projGroup.map((v, i) => <td key={i} className="col-num">{fInt(v)}</td>)}
                    <td className="col-num">{fInt(projGroupTotal)}</td>
                  </tr>
                </Fragment>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="tfoot-total">
              <td colSpan={2}>Total Geral</td>
              {projecaoTotais.map((v, i) => <td key={i} className="col-num">{fInt(v)}</td>)}
              <td className="col-num">{fInt(projecaoTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
