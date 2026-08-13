import { useState } from 'react'
import { useVdData } from '../../context/VdDataContext'
import { KpiCard, MetaCell, MetaTag, PeriodoToggle, VD_MIX_METAS_DEFAULT, fInt, fPct, useVdMixMetas } from './vdShared'

export default function MixProdutoPage() {
  const { ciclo, equipes, equipesAno } = useVdData()
  const [periodo, setPeriodo] = useState<'ciclo' | 'ano'>('ciclo')
  const dados = periodo === 'ciclo' ? equipes : equipesAno
  const { metas, updateMeta } = useVdMixMetas()

  const totalAtivas = dados.reduce((s, e) => s + e.ativasBase, 0)
  const totalSkin = dados.reduce((s, e) => s + e.skinQtd, 0)
  const totalMake = dados.reduce((s, e) => s + e.makeQtd, 0)
  const totalMulti = dados.reduce((s, e) => s + e.multimarcaQtd, 0)
  const totalCabelos = dados.reduce((s, e) => s + e.cabelosQtd, 0)

  return (
    <div className="page-content">
      <div className="page-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="page-title">Mix de Produto</h2>
          <p className="page-subtitle">{periodo === 'ciclo' ? ciclo : 'Ano (exemplo)'} — % de revendedoras ativas que compraram cada categoria</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <PeriodoToggle value={periodo} onChange={setPeriodo} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <MetaTag label="Meta Skin" value={metas.skin} defaultValue={VD_MIX_METAS_DEFAULT.skin} onSave={v => updateMeta('skin', v)} />
            <MetaTag label="Meta Cabelos" value={metas.cabelos} defaultValue={VD_MIX_METAS_DEFAULT.cabelos} onSave={v => updateMeta('cabelos', v)} />
            <MetaTag label="Meta Make" value={metas.make} defaultValue={VD_MIX_METAS_DEFAULT.make} onSave={v => updateMeta('make', v)} />
            <MetaTag label="Meta Multimarca" value={metas.multimarca} defaultValue={VD_MIX_METAS_DEFAULT.multimarca} onSave={v => updateMeta('multimarca', v)} />
          </div>
        </div>
      </div>

      <div className="kpi-row">
        <KpiCard label="Ativas no ciclo" value={fInt(totalAtivas)} />
        <KpiCard label="Skin" value={fPct(totalSkin / totalAtivas)} sub={`meta ${fInt(metas.skin)}%`} />
        <KpiCard label="Cabelos" value={fPct(totalCabelos / totalAtivas)} sub={`meta ${fInt(metas.cabelos)}%`} />
        <KpiCard label="Make" value={fPct(totalMake / totalAtivas)} sub={`meta ${fInt(metas.make)}%`} />
        <KpiCard label="Multimarca" value={fPct(totalMulti / totalAtivas)} sub={`meta ${fInt(metas.multimarca)}%`} />
      </div>

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Equipe</th>
              <th className="col-num">Ativas</th>
              <th className="col-num">Skin <span style={{ fontWeight: 400, opacity: .6 }}>meta {fInt(metas.skin)}%</span></th>
              <th className="col-num">Cabelos <span style={{ fontWeight: 400, opacity: .6 }}>meta {fInt(metas.cabelos)}%</span></th>
              <th className="col-num">Make <span style={{ fontWeight: 400, opacity: .6 }}>meta {fInt(metas.make)}%</span></th>
              <th className="col-num">Multimarca <span style={{ fontWeight: 400, opacity: .6 }}>meta {fInt(metas.multimarca)}%</span></th>
            </tr>
          </thead>
          <tbody>
            {dados.map(e => (
              <tr key={e.id}>
                <td>{e.time}</td>
                <td className="td-primary">{e.nome}</td>
                <td className="col-num">{fInt(e.ativasBase)}</td>
                <MetaCell v={e.skinQtd / e.ativasBase} meta={metas.skin} />
                <MetaCell v={e.cabelosQtd / e.ativasBase} meta={metas.cabelos} />
                <MetaCell v={e.makeQtd / e.ativasBase} meta={metas.make} />
                <MetaCell v={e.multimarcaQtd / e.ativasBase} meta={metas.multimarca} />
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="tfoot-total">
              <td colSpan={2}>Total Geral</td>
              <td className="col-num">{fInt(totalAtivas)}</td>
              <td className="col-num">{fPct(totalSkin / totalAtivas)}</td>
              <td className="col-num">{fPct(totalCabelos / totalAtivas)}</td>
              <td className="col-num">{fPct(totalMake / totalAtivas)}</td>
              <td className="col-num">{fPct(totalMulti / totalAtivas)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
