import { useState } from 'react'
import { useVdData } from '../../context/VdDataContext'
import type { VdTime } from '../../context/VdDataContext'
import {
  KpiCard, MetaCell, MetaTag, PeriodoToggle,
  VD_IAF_METAS_DEFAULT, VD_MIX_METAS_DEFAULT,
  agregarIndicadores, calcIafIndicadores, fInt, useVdIafMetas, useVdMixMetas,
} from './vdShared'

export default function IafTimePage({ time }: { time: VdTime }) {
  const { ciclo, equipes, equipesAno } = useVdData()
  const [periodo, setPeriodo] = useState<'ciclo' | 'ano'>('ciclo')
  const dados = (periodo === 'ciclo' ? equipes : equipesAno).filter(e => e.time === time)

  const { metas: iafMetas, updateMeta: updateIafMeta } = useVdIafMetas()
  const { metas: mixMetas, updateMeta: updateMixMeta } = useVdMixMetas()

  const linhas = dados.map(e => ({ equipe: e, ind: calcIafIndicadores(e) }))
  const totalInd = calcIafIndicadores(agregarIndicadores(dados))

  return (
    <div className="page-content">
      <div className="page-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="page-title">IAF Time de {time}</h2>
          <p className="page-subtitle">{dados.length} equipes — {periodo === 'ciclo' ? ciclo : 'Ano (exemplo)'}</p>
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
        <KpiCard label="Receita" value={`${fInt(totalInd.receita * 100)}%`} sub="vs. meta própria" />
        <KpiCard label="Atividade" value={`${fInt(totalInd.atividade * 100)}%`} sub="vs. meta própria" />
        <KpiCard label="VDI" value={`${fInt(totalInd.vdi * 100)}%`} sub={`meta ${fInt(iafMetas.vdi)}%`} />
      </div>

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Equipe</th>
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
            {linhas.map(({ equipe: e, ind }) => (
              <tr key={e.id}>
                <td className="td-primary">{e.nome}</td>
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
              <td>Total Time de {time}</td>
              <MetaCell v={totalInd.receita} meta={100} />
              <MetaCell v={totalInd.atividade} meta={100} />
              <MetaCell v={totalInd.cabelos} meta={mixMetas.cabelos} />
              <MetaCell v={totalInd.make} meta={mixMetas.make} />
              <MetaCell v={totalInd.multimarcas} meta={mixMetas.multimarca} />
              <MetaCell v={totalInd.vdi} meta={iafMetas.vdi} />
              <MetaCell v={totalInd.treinamentos} meta={iafMetas.treinamento} />
              <MetaCell v={totalInd.satisfacao} meta={iafMetas.satisfacao} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
