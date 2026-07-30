import { useVdData } from '../../context/VdDataContext'
import {
  KpiCard, MetaCell, MetaTag,
  VD_IAF_METAS_DEFAULT, VD_MIX_METAS_DEFAULT,
  calcIafIndicadores, fInt, useVdIafMetas, useVdMixMetas,
} from './vdShared'

export default function IafGeralPage() {
  const { ciclo, equipes } = useVdData()
  const { metas: iafMetas, updateMeta: updateIafMeta } = useVdIafMetas()
  const { metas: mixMetas, updateMeta: updateMixMeta } = useVdMixMetas()

  const linhas = equipes.map(e => ({ equipe: e, ind: calcIafIndicadores(e) }))

  const abaixoDaMeta = (chave: keyof ReturnType<typeof calcIafIndicadores>, meta: number) =>
    linhas.filter(l => l.ind[chave] * 100 < meta).length

  return (
    <div className="page-content">
      <div className="page-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="page-title">IAF Geral</h2>
          <p className="page-subtitle">{ciclo} — todo o Canal VD, indicador por indicador, equipe por equipe</p>
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
      <p className="page-subtitle" style={{ marginTop: -8, marginBottom: 12 }}>
        PEF e Atividade comparam com a meta da própria equipe (100% = bateu o combinado). Os demais comparam com a meta única da rede — clique pra editar.
      </p>

      <div className="kpi-row">
        <KpiCard label="Equipes" value={String(equipes.length)} />
        <KpiCard label="Abaixo em Base" value={fInt(abaixoDaMeta('base', iafMetas.base))} />
        <KpiCard label="Abaixo em VDI" value={fInt(abaixoDaMeta('vdi', iafMetas.vdi))} />
        <KpiCard label="Abaixo em Treinamentos" value={fInt(abaixoDaMeta('treinamentos', iafMetas.treinamento))} />
      </div>

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Gerente</th>
              <th>Equipe</th>
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
            {linhas.map(({ equipe: e, ind }) => (
              <tr key={e.id}>
                <td>{e.gerente}</td>
                <td className="td-primary">{e.nome}</td>
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
