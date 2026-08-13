import { useState } from 'react'
import { useVdData } from '../../context/VdDataContext'
import {
  KpiCard, MetaCell, MetaTag, PeriodoToggle,
  VD_IAF_METAS_DEFAULT, VD_MIX_METAS_DEFAULT,
  agregarIndicadores, calcIafIndicadores, fInt, groupBy, useVdIafMetas, useVdMixMetas,
} from './vdShared'

export default function IafGeralPage() {
  const { ciclo, equipes, equipesAno } = useVdData()
  const [periodo, setPeriodo] = useState<'ciclo' | 'ano'>('ciclo')
  const dados = periodo === 'ciclo' ? equipes : equipesAno

  const { metas: iafMetas, updateMeta: updateIafMeta } = useVdIafMetas()
  const { metas: mixMetas, updateMeta: updateMixMeta } = useVdMixMetas()

  const geral = calcIafIndicadores(agregarIndicadores(dados))
  const porTime = groupBy(dados, e => e.time).map(g => ({
    time: g.key,
    nEquipes: g.items.length,
    ind: calcIafIndicadores(agregarIndicadores(g.items)),
  }))

  return (
    <div className="page-content">
      <div className="page-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="page-title">IAF Geral</h2>
          <p className="page-subtitle">Todo o Canal VD no IAF — {periodo === 'ciclo' ? ciclo : 'Ano (exemplo)'}</p>
        </div>
        <PeriodoToggle value={periodo} onChange={setPeriodo} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <MetaTag label="Cabelos" value={mixMetas.cabelos} defaultValue={VD_MIX_METAS_DEFAULT.cabelos} onSave={v => updateMixMeta('cabelos', v)} />
        <MetaTag label="Make" value={mixMetas.make} defaultValue={VD_MIX_METAS_DEFAULT.make} onSave={v => updateMixMeta('make', v)} />
        <MetaTag label="Multimarcas" value={mixMetas.multimarca} defaultValue={VD_MIX_METAS_DEFAULT.multimarca} onSave={v => updateMixMeta('multimarca', v)} />
        <MetaTag label="VDI" value={iafMetas.vdi} defaultValue={VD_IAF_METAS_DEFAULT.vdi} onSave={v => updateIafMeta('vdi', v)} />
        <MetaTag label="Treinamentos" value={iafMetas.treinamento} defaultValue={VD_IAF_METAS_DEFAULT.treinamento} onSave={v => updateIafMeta('treinamento', v)} />
        <MetaTag label="Satisfação" value={iafMetas.satisfacao} defaultValue={VD_IAF_METAS_DEFAULT.satisfacao} onSave={v => updateIafMeta('satisfacao', v)} />
      </div>

      <div className="kpi-row">
        <KpiCard label="Equipes" value={String(dados.length)} />
        <KpiCard label="Receita" value={`${fInt(geral.receita * 100)}%`} sub="vs. meta própria" />
        <KpiCard label="Atividade" value={`${fInt(geral.atividade * 100)}%`} sub="vs. meta própria" />
        <KpiCard label="VDI" value={`${fInt(geral.vdi * 100)}%`} sub={`meta ${fInt(iafMetas.vdi)}%`} />
        <KpiCard label="Treinamentos" value={`${fInt(geral.treinamentos * 100)}%`} sub={`meta ${fInt(iafMetas.treinamento)}%`} />
        <KpiCard label="Satisfação" value={`${fInt(geral.satisfacao * 100)}%`} sub={`meta ${fInt(iafMetas.satisfacao)}% — definição pendente`} />
      </div>

      <h3 className="page-section-title">Time de Início vs. Time de Base</h3>
      <p className="page-subtitle" style={{ marginTop: -4, marginBottom: 12 }}>
        Detalhe por equipe em cada time: veja "IAF Time de Início" e "IAF Time de Base" no menu.
      </p>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Time</th>
              <th className="col-num">Equipes</th>
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
            {porTime.map(({ time, nEquipes, ind }) => (
              <tr key={time}>
                <td className="td-primary">Time de {time}</td>
                <td className="col-num">{nEquipes}</td>
                <MetaCell v={ind.receita} meta={100} />
                <MetaCell v={ind.atividade} meta={100} />
                <MetaCell v={ind.cabelos} meta={mixMetas.cabelos} />
                <MetaCell v={ind.make} meta={mixMetas.make} />
                <MetaCell v={ind.multimarcas} meta={mixMetas.multimarca} />
                <MetaCell v={ind.vdi} meta={iafMetas.vdi} />
                <MetaCell v={ind.treinamentos} meta={iafMetas.treinamento} />
                <MetaCell v={ind.satisfacao} meta={iafMetas.satisfacao} />
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="tfoot-total">
              <td>Total Geral</td>
              <td className="col-num">{dados.length}</td>
              <MetaCell v={geral.receita} meta={100} />
              <MetaCell v={geral.atividade} meta={100} />
              <MetaCell v={geral.cabelos} meta={mixMetas.cabelos} />
              <MetaCell v={geral.make} meta={mixMetas.make} />
              <MetaCell v={geral.multimarcas} meta={mixMetas.multimarca} />
              <MetaCell v={geral.vdi} meta={iafMetas.vdi} />
              <MetaCell v={geral.treinamentos} meta={iafMetas.treinamento} />
              <MetaCell v={geral.satisfacao} meta={iafMetas.satisfacao} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
