import type { VdConsultoraRow } from '../../context/VdDataContext'
import { MetaCell, ValueMetaCell, calcIafIndicadores, fBRLR, fDec, fPct, useVdDesempenhoMetas, useVdIafMetas, useVdMixMetas } from './vdShared'

export function ErConsultorasModal({ er, consultoras, mode, onClose }: {
  er: string
  consultoras: VdConsultoraRow[]
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
          <span className="modal-title">{er} — {mode === 'desempenho' ? 'Desempenho' : 'IAF'} por consultora</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
            {mode === 'desempenho' ? (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Consultora</th>
                    <th className="col-num">Meta financeira</th>
                    <th className="col-num">Realizado</th>
                    <th className="col-num">% Ativos</th>
                    <th className="col-num">RPA</th>
                    <th className="col-num">UPA</th>
                  </tr>
                </thead>
                <tbody>
                  {consultoras.map(c => (
                    <tr key={c.id}>
                      <td className="td-primary">{c.nome}</td>
                      <td className="col-num">{fBRLR(c.metaFinanceira)}</td>
                      <td className="col-num">{fBRLR(c.realizadoFinanceiro)}</td>
                      <td className="col-num">{fPct(c.realizadoAtivos / c.metaAtivos)}</td>
                      <ValueMetaCell v={c.rpaValor} meta={desempenhoMetas.rpa} format={fBRLR} />
                      <ValueMetaCell v={c.upaValor} meta={desempenhoMetas.upa} format={fDec} />
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Consultora</th>
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
                  {consultoras.map(c => {
                    const ind = calcIafIndicadores(c)
                    return (
                      <tr key={c.id}>
                        <td className="td-primary">{c.nome}</td>
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
