import { useState } from 'react'
import { useVdData } from '../../context/VdDataContext'
import { ErEquipesModal } from './ErEquipesModal'
import {
  KpiCard, LupaButton, MetaTag, PeriodoToggle, ValueMetaCell,
  VD_DESEMPENHO_METAS_DEFAULT,
  agregarPorEr, fBRLR, fDec, fInt, fPct, useVdDesempenhoMetas,
} from './vdShared'

export default function ErPage() {
  const { ciclo, equipes, equipesAno } = useVdData()
  const [periodo, setPeriodo] = useState<'ciclo' | 'ano'>('ciclo')
  const dados = periodo === 'ciclo' ? equipes : equipesAno

  const { metas, updateMeta } = useVdDesempenhoMetas()
  const linhas = agregarPorEr(dados)
  const [erAberto, setErAberto] = useState<string | null>(null)

  return (
    <div className="page-content">
      <div className="page-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="page-title">ER — Desempenho</h2>
          <p className="page-subtitle">{periodo === 'ciclo' ? ciclo : 'Ano (exemplo)'} — desempenho geral de cada um dos 4 Espaços do Revendedor</p>
        </div>
        <PeriodoToggle value={periodo} onChange={setPeriodo} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <MetaTag label="Meta RPA" value={metas.rpa} defaultValue={VD_DESEMPENHO_METAS_DEFAULT.rpa} onSave={v => updateMeta('rpa', v)} />
        <MetaTag label="Meta UPA" value={metas.upa} defaultValue={VD_DESEMPENHO_METAS_DEFAULT.upa} onSave={v => updateMeta('upa', v)} />
      </div>

      <div className="kpi-row">
        {linhas.map(l => (
          <KpiCard key={l.er} label={l.er} value={`${fInt(l.baseTotal)} revendedoras`} sub={`${l.nEquipes} equipes`} />
        ))}
      </div>

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
              <th className="col-num">RPA <span style={{ fontWeight: 400, opacity: .6 }}>(Boleto médio) meta {fBRLR(metas.rpa)}</span></th>
              <th className="col-num">UPA <span style={{ fontWeight: 400, opacity: .6 }}>(Itens/venda) meta {fDec(metas.upa)}</span></th>
              <th className="col-num">Ver equipes</th>
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
                <ValueMetaCell v={l.rpaValor} meta={metas.rpa} format={fBRLR} />
                <ValueMetaCell v={l.upaValor} meta={metas.upa} format={fDec} />
                <td className="col-num">
                  <LupaButton title={`Ver desempenho por equipe — ${l.er}`} onClick={() => setErAberto(l.er)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {erAberto && (
        <ErEquipesModal
          er={erAberto}
          equipes={dados.filter(e => e.er === erAberto)}
          mode="desempenho"
          onClose={() => setErAberto(null)}
        />
      )}
    </div>
  )
}
