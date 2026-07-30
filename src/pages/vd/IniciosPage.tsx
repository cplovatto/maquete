import { Fragment } from 'react'
import { useVdData } from '../../context/VdDataContext'
import { KpiCard, MetaBar, fBRLR, fInt, fPct, groupByGerente } from './vdShared'

export default function IniciosPage() {
  const { ciclo, equipes } = useVdData()
  const groups = groupByGerente(equipes)

  const totalMeta = equipes.reduce((s, e) => s + e.metaCadastro, 0)
  const totalRealizado = equipes.reduce((s, e) => s + e.iniciosReinicios, 0)
  const totalLiquidas = equipes.reduce((s, e) => s + e.liquidas, 0)
  const totalPremiacao = equipes.reduce((s, e) => s + (e.premiacao ?? 0), 0)
  const totalFalta = totalMeta - totalRealizado
  const bateram = equipes.filter(e => e.iniciosReinicios >= e.metaCadastro).length

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Inícios</h2>
          <p className="page-subtitle">{ciclo} — Responsável: Jaila</p>
        </div>
      </div>
      <p className="page-subtitle" style={{ marginTop: -8, marginBottom: 12 }}>
        Líquidas e Premiação só são acompanhadas por Grupo — não têm apuração por equipe/supervisora.
      </p>

      <div className="kpi-row">
        <KpiCard label="Meta de cadastro" value={fInt(totalMeta)} />
        <KpiCard label="Inícios + Reinícios" value={fInt(totalRealizado)} sub={fPct(totalRealizado / totalMeta)} />
        <KpiCard label="Falta meta" value={totalFalta > 0 ? fInt(totalFalta) : '0'} sub={totalFalta <= 0 ? 'meta batida' : undefined} />
        <KpiCard label="Líquidas" value={`${totalLiquidas > 0 ? '+' : ''}${fInt(totalLiquidas)}`} />
        <KpiCard label="Equipes na meta" value={`${bateram}/${equipes.length}`} />
      </div>

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Gerente</th>
              <th>Equipe</th>
              <th className="col-num">Meta cadastro</th>
              <th className="col-num">Inícios + Reinícios</th>
              <th className="col-num">Falta meta</th>
              <th>% da meta</th>
              <th className="col-num">Líquidas</th>
              <th className="col-num">Premiação</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(g => {
              const gMeta = g.items.reduce((s, e) => s + e.metaCadastro, 0)
              const gRealizado = g.items.reduce((s, e) => s + e.iniciosReinicios, 0)
              const gLiquidas = g.items.reduce((s, e) => s + e.liquidas, 0)
              const gFalta = gMeta - gRealizado
              return (
                <Fragment key={g.gerente}>
                  {g.items.map(e => {
                    const pct = e.iniciosReinicios / e.metaCadastro
                    const falta = e.metaCadastro - e.iniciosReinicios
                    return (
                      <tr key={e.id}>
                        <td>{e.gerente}</td>
                        <td className="td-primary">{e.nome}</td>
                        <td className="col-num">{fInt(e.metaCadastro)}</td>
                        <td className="col-num">{fInt(e.iniciosReinicios)}</td>
                        <td className="col-num" style={{ color: falta > 0 ? '#dc2626' : '#059669' }}>
                          {fInt(falta)}
                        </td>
                        <td style={{ minWidth: 140 }}>
                          <MetaBar pct={pct} />
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fPct(pct)}</span>
                        </td>
                        <td className="col-num" style={{ color: 'var(--text-muted)' }}>—</td>
                        <td className="col-num" style={{ color: 'var(--text-muted)' }}>—</td>
                      </tr>
                    )
                  })}
                  <tr className="tfoot-total">
                    <td colSpan={2}>Total {g.gerente}</td>
                    <td className="col-num">{fInt(gMeta)}</td>
                    <td className="col-num">{fInt(gRealizado)}</td>
                    <td className="col-num" style={{ color: gFalta > 0 ? '#dc2626' : '#059669' }}>{fInt(gFalta)}</td>
                    <td>{fPct(gRealizado / gMeta)}</td>
                    <td className="col-num" style={{ color: gLiquidas < 0 ? '#dc2626' : '#059669' }}>{gLiquidas > 0 ? '+' : ''}{fInt(gLiquidas)}</td>
                    <td className="col-num">{fBRLR(g.items.reduce((s, e) => s + (e.premiacao ?? 0), 0))}</td>
                  </tr>
                </Fragment>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="tfoot-total">
              <td colSpan={2}>Total Geral</td>
              <td className="col-num">{fInt(totalMeta)}</td>
              <td className="col-num">{fInt(totalRealizado)}</td>
              <td className="col-num" style={{ color: totalFalta > 0 ? '#dc2626' : '#059669' }}>{fInt(totalFalta)}</td>
              <td>{fPct(totalRealizado / totalMeta)}</td>
              <td className="col-num">{totalLiquidas > 0 ? '+' : ''}{fInt(totalLiquidas)}</td>
              <td className="col-num">{fBRLR(totalPremiacao)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
