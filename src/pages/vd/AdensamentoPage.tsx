import { useVdData } from '../../context/VdDataContext'
import { KpiCard, fDec, fInt, tendenciaBadgeClass } from './vdShared'

export default function AdensamentoPage() {
  const { ciclo, municipios } = useVdData()

  const totalBase = municipios.reduce((s, m) => s + m.base, 0)
  const totalPop = municipios.reduce((s, m) => s + m.populacao, 0)
  const adensamentoGeral = (totalBase / totalPop) * 10000
  const crescendo = municipios.filter(m => m.tendencia === 'CRESCEU').length

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Adensamento</h2>
          <p className="page-subtitle">{ciclo} — penetração da rede de revendedoras por município</p>
        </div>
      </div>

      <div className="kpi-row">
        <KpiCard label="Municípios" value={String(municipios.length)} />
        <KpiCard label="Base total" value={fInt(totalBase)} />
        <KpiCard label="Adensamento geral" value={fDec(adensamentoGeral)} sub="por 10 mil habitantes" />
        <KpiCard label="Municípios crescendo" value={`${crescendo}/${municipios.length}`} />
      </div>

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Município</th>
              <th className="col-num">População</th>
              <th className="col-num">Base</th>
              <th className="col-num">Adensamento atual</th>
              <th className="col-num">Meta anual</th>
              <th>Tendência</th>
            </tr>
          </thead>
          <tbody>
            {[...municipios].sort((a, b) => b.populacao - a.populacao).map(m => (
              <tr key={m.municipio}>
                <td className="td-primary">{m.municipio}</td>
                <td className="col-num">{fInt(m.populacao)}</td>
                <td className="col-num">{fInt(m.base)}</td>
                <td className="col-num">{fDec(m.adensamentoAtual)}</td>
                <td className="col-num">{fDec(m.metaAnual)}</td>
                <td><span className={tendenciaBadgeClass(m.tendencia)}>{m.tendencia}</span></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="tfoot-total">
              <td>Total Geral</td>
              <td className="col-num">{fInt(totalPop)}</td>
              <td className="col-num">{fInt(totalBase)}</td>
              <td className="col-num">{fDec(adensamentoGeral)}</td>
              <td className="col-num">—</td>
              <td>—</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
