import { useVdData } from '../../context/VdDataContext'
import {
  KpiCard, MetaCell, MetaTag,
  VD_IAF_METAS_DEFAULT, VD_MIX_METAS_DEFAULT,
  agregarPorEr, calcIafIndicadores, fInt, useVdIafMetas, useVdMixMetas,
} from './vdShared'

export default function IafErsPage() {
  const { ciclo, equipes } = useVdData()
  const { metas: iafMetas, updateMeta: updateIafMeta } = useVdIafMetas()
  const { metas: mixMetas, updateMeta: updateMixMeta } = useVdMixMetas()

  const linhas = agregarPorEr(equipes).map(({ er, equipes: nEquipes, consolidado }) => ({
    er, nEquipes, ind: calcIafIndicadores(consolidado), baseTotal: consolidado.baseTotal,
  }))

  return (
    <div className="page-content">
      <div className="page-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="page-title">IAF ERS</h2>
          <p className="page-subtitle">{ciclo} — os mesmos indicadores do IAF Geral, agregados pelos 4 Espaços do Revendedor</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 480 }}>
          <MetaTag label="Base" value={iafMetas.base} defaultValue={VD_IAF_METAS_DEFAULT.base} onSave={v => updateIafMeta('base', v)} />
          <MetaTag label="Cabelos" value={mixMetas.cabelos} defaultValue={VD_MIX_METAS_DEFAULT.cabelos} onSave={v => updateMixMeta('cabelos', v)} />
          <MetaTag label="Make" value={mixMetas.make} defaultValue={VD_MIX_METAS_DEFAULT.make} onSave={v => updateMixMeta('make', v)} />
          <MetaTag label="Multimarcas" value={mixMetas.multimarca} defaultValue={VD_MIX_METAS_DEFAULT.multimarca} onSave={v => updateMixMeta('multimarca', v)} />
          <MetaTag label="VDI" value={iafMetas.vdi} defaultValue={VD_IAF_METAS_DEFAULT.vdi} onSave={v => updateIafMeta('vdi', v)} />
          <MetaTag label="Treinamentos" value={iafMetas.treinamento} defaultValue={VD_IAF_METAS_DEFAULT.treinamento} onSave={v => updateIafMeta('treinamento', v)} />
        </div>
      </div>

      <div className="kpi-row">
        {linhas.map(l => (
          <KpiCard key={l.er} label={l.er} value={`${l.nEquipes} equipes`} sub={`${fInt(l.baseTotal)} revendedoras`} />
        ))}
      </div>

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Espaço do Revendedor</th>
              <th className="col-num">Equipes</th>
              <th className="col-num">PEF</th>
              <th className="col-num">Atividade</th>
              <th className="col-num">Base</th>
              <th className="col-num">Cabelos</th>
              <th className="col-num">Make</th>
              <th className="col-num">Multimarcas</th>
              <th className="col-num">VDI</th>
              <th className="col-num">Treinamentos</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(({ er, nEquipes, ind }) => (
              <tr key={er}>
                <td className="td-primary">{er}</td>
                <td className="col-num">{nEquipes}</td>
                <MetaCell v={ind.pef} meta={100} />
                <MetaCell v={ind.atividade} meta={100} />
                <MetaCell v={ind.base} meta={iafMetas.base} />
                <MetaCell v={ind.cabelos} meta={mixMetas.cabelos} />
                <MetaCell v={ind.make} meta={mixMetas.make} />
                <MetaCell v={ind.multimarcas} meta={mixMetas.multimarca} />
                <MetaCell v={ind.vdi} meta={iafMetas.vdi} />
                <MetaCell v={ind.treinamentos} meta={iafMetas.treinamento} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
