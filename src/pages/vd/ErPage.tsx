import { useVdData } from '../../context/VdDataContext'
import {
  KpiCard, MetaCell, MetaTag,
  VD_IAF_METAS_DEFAULT, VD_MIX_METAS_DEFAULT,
  agregarPorEr, calcIafIndicadores, fBRLR, fInt, fPct, useVdIafMetas, useVdMixMetas,
} from './vdShared'

export default function ErPage() {
  const { ciclo, equipes } = useVdData()
  const { metas: iafMetas, updateMeta: updateIafMeta } = useVdIafMetas()
  const { metas: mixMetas, updateMeta: updateMixMeta } = useVdMixMetas()

  const linhas = agregarPorEr(equipes).map(er => ({ ...er, ind: calcIafIndicadores(er) }))

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <h2 className="page-title">ER — Espaço do Revendedor</h2>
          <p className="page-subtitle">{ciclo} — desempenho e IAF total de cada um dos 4 Espaços do Revendedor</p>
        </div>
      </div>

      <div className="kpi-row">
        {linhas.map(l => (
          <KpiCard key={l.er} label={l.er} value={`${fInt(l.baseTotal)} revendedoras`} sub={`${l.nEquipes} equipes`} />
        ))}
      </div>

      <h3 className="page-section-title">Desempenho geral</h3>
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

      <h3 className="page-section-title">IAF total por ER</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <MetaTag label="Cabelos" value={mixMetas.cabelos} defaultValue={VD_MIX_METAS_DEFAULT.cabelos} onSave={v => updateMixMeta('cabelos', v)} />
        <MetaTag label="Make" value={mixMetas.make} defaultValue={VD_MIX_METAS_DEFAULT.make} onSave={v => updateMixMeta('make', v)} />
        <MetaTag label="Multimarcas" value={mixMetas.multimarca} defaultValue={VD_MIX_METAS_DEFAULT.multimarca} onSave={v => updateMixMeta('multimarca', v)} />
        <MetaTag label="VDI" value={iafMetas.vdi} defaultValue={VD_IAF_METAS_DEFAULT.vdi} onSave={v => updateIafMeta('vdi', v)} />
        <MetaTag label="Treinamentos" value={iafMetas.treinamento} defaultValue={VD_IAF_METAS_DEFAULT.treinamento} onSave={v => updateIafMeta('treinamento', v)} />
        <MetaTag label="Satisfação" value={iafMetas.satisfacao} defaultValue={VD_IAF_METAS_DEFAULT.satisfacao} onSave={v => updateIafMeta('satisfacao', v)} />
      </div>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>ER</th>
              <th className="col-num">Receita</th>
              <th className="col-num">Atividade</th>
              <th className="col-num">Cabelos</th>
              <th className="col-num">Make</th>
              <th className="col-num">Multimarcas</th>
              <th className="col-num">VDI</th>
              <th className="col-num">Treinamentos</th>
              <th className="col-num">Satisfação</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(l => (
              <tr key={l.er}>
                <td className="td-primary">{l.er}</td>
                <MetaCell v={l.ind.receita} meta={100} />
                <MetaCell v={l.ind.atividade} meta={100} />
                <MetaCell v={l.ind.cabelos} meta={mixMetas.cabelos} />
                <MetaCell v={l.ind.make} meta={mixMetas.make} />
                <MetaCell v={l.ind.multimarcas} meta={mixMetas.multimarca} />
                <MetaCell v={l.ind.vdi} meta={iafMetas.vdi} />
                <MetaCell v={l.ind.treinamentos} meta={iafMetas.treinamento} />
                <MetaCell v={l.ind.satisfacao} meta={iafMetas.satisfacao} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
