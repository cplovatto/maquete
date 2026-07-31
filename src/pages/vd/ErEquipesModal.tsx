import type { VdEquipeRow } from '../../context/VdDataContext'
import { MetaCell, ValueMetaCell, calcIafIndicadores, fBRLR, fDec, fInt, fPct, useVdDesempenhoMetas, useVdIafMetas, useVdMixMetas } from './vdShared'

export function ErEquipesModal({ er, equipes, mode, onClose }: {
  er: string
  equipes: VdEquipeRow[]
  mode: 'desempenho' | 'iaf'
  onClose: () => void
}) {
  const { metas: iafMetas } = useVdIafMetas()
  const { metas: mixMetas } = useVdMixMetas()
  const { metas: desempenhoMetas } = useVdDesempenhoMetas()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{er} — {mode === 'desempenho' ? 'Desempenho' : 'IAF'} por equipe</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
            {mode === 'desempenho' ? (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Equipe</th>
                    <th>Time</th>
                    <th className="col-num">Base</th>
                    <th className="col-num">Meta financeira</th>
                    <th className="col-num">Realizado</th>
                    <th className="col-num">% Ativos</th>
                    <th className="col-num">RPA</th>
                    <th className="col-num">UPA</th>
                  </tr>
                </thead>
                <tbody>
                  {equipes.map(e => (
                    <tr key={e.id}>
                      <td className="td-primary">{e.nome}</td>
                      <td>{e.time}</td>
                      <td className="col-num">{fInt(e.baseTotal)}</td>
                      <td className="col-num">{fBRLR(e.metaFinanceira)}</td>
                      <td className="col-num">{fBRLR(e.realizadoFinanceiro)}</td>
                      <td className="col-num">{fPct(e.realizadoAtivos / e.metaAtivos)}</td>
                      <ValueMetaCell v={e.rpaValor} meta={desempenhoMetas.rpa} format={fBRLR} />
                      <ValueMetaCell v={e.upaValor} meta={desempenhoMetas.upa} format={fDec} />
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
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
                  {equipes.map(e => {
                    const ind = calcIafIndicadores(e)
                    return (
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
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
