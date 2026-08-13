import { useState } from 'react'
import { useVdData } from '../../context/VdDataContext'
import { ErConsultorasModal } from './ErConsultorasModal'
import {
  LupaButton, MetaCell, MetaTag, PeriodoToggle,
  VD_IAF_METAS_DEFAULT, VD_MIX_METAS_DEFAULT,
  agregarPorEr, calcIafIndicadores, useVdIafMetas, useVdMixMetas,
} from './vdShared'

export default function ErIafPage() {
  const { ciclo, consultoras, consultorasAno } = useVdData()
  const [periodo, setPeriodo] = useState<'ciclo' | 'ano'>('ciclo')
  const dados = periodo === 'ciclo' ? consultoras : consultorasAno

  const { metas: iafMetas, updateMeta: updateIafMeta } = useVdIafMetas()
  const { metas: mixMetas, updateMeta: updateMixMeta } = useVdMixMetas()
  const [erAberto, setErAberto] = useState<string | null>(null)

  const linhas = agregarPorEr(dados).map(er => ({ ...er, ind: calcIafIndicadores(er) }))

  return (
    <div className="page-content">
      <div className="page-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="page-title">IAF ER</h2>
          <p className="page-subtitle">{periodo === 'ciclo' ? ciclo : 'Ano (exemplo)'} — IAF total das consultoras de cada um dos 4 Espaços do Revendedor</p>
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
              <th className="col-num">Ver consultoras</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(l => (
              <tr key={l.er} onClick={() => setErAberto(l.er)} style={{ cursor: 'pointer' }} title={`Ver IAF por consultora — ${l.er}`}>
                <td className="td-primary">{l.er}</td>
                <MetaCell v={l.ind.receita} meta={100} />
                <MetaCell v={l.ind.atividade} meta={100} />
                <MetaCell v={l.ind.cabelos} meta={mixMetas.cabelos} />
                <MetaCell v={l.ind.make} meta={mixMetas.make} />
                <MetaCell v={l.ind.multimarcas} meta={mixMetas.multimarca} />
                <MetaCell v={l.ind.vdi} meta={iafMetas.vdi} />
                <MetaCell v={l.ind.treinamentos} meta={iafMetas.treinamento} />
                <MetaCell v={l.ind.satisfacao} meta={iafMetas.satisfacao} />
                <td className="col-num">
                  <LupaButton title={`Ver IAF por consultora — ${l.er}`} onClick={() => setErAberto(l.er)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {erAberto && (
        <ErConsultorasModal
          er={erAberto}
          consultoras={dados.filter(c => c.er === erAberto)}
          mode="iaf"
          onClose={() => setErAberto(null)}
        />
      )}
    </div>
  )
}
