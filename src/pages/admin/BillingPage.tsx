import { useState } from 'react'
import { useBilling, type Invoice } from '../../context/BillingContext'
import { useCompanies, PLAN_MONTHLY_PRICE } from '../../context/CompaniesContext'

const fBRL = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function BillingPage() {
  const { invoices, payInvoice } = useBilling()
  const { empresas } = useCompanies()
  const [filterEmpresa, setFilterEmpresa] = useState('')

  const filtered = filterEmpresa
    ? invoices.filter(i => i.empresaId === filterEmpresa)
    : invoices

  const totalPendente = filtered.filter(i => !i.pago).reduce((s, i) => s + i.valor, 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Cobrança</div>
          <div className="page-subtitle">Histórico de faturas e contas a pagar</div>
        </div>
        <select
          className="form-input"
          style={{ width: 'auto' }}
          value={filterEmpresa}
          onChange={e => setFilterEmpresa(e.target.value)}
        >
          <option value="">Todas as empresas</option>
          {empresas.map(e => (
            <option key={e.id} value={e.id}>{e.fantasia || e.razaoSocial}</option>
          ))}
        </select>
      </div>

      {/* Summary cards */}
      <div className="admin-stats-row" style={{ marginBottom: 20 }}>
        <div className="card" style={{ padding: '16px 20px', flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total em aberto</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>{fBRL(totalPendente)}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px', flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Faturas pagas</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>{filtered.filter(i => i.pago).length}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px', flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Faturas pendentes</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>{filtered.filter(i => !i.pago).length}</div>
        </div>
      </div>

      {/* Invoice table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Empresa</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => {
              const emp = empresas.find(e => e.id === inv.empresaId)
              return (
                <tr key={inv.id}>
                  <td>{inv.descricao}</td>
                  <td>{emp?.fantasia || emp?.razaoSocial || '-'}</td>
                  <td><strong>{fBRL(inv.valor)}</strong></td>
                  <td>{new Date(inv.vencimento).toLocaleDateString('pt-BR')}</td>
                  <td>
                    {inv.pago
                      ? <span className="admin-status-badge admin-status-badge--active">
                          Paga em {inv.dataPagamento ? new Date(inv.dataPagamento).toLocaleDateString('pt-BR') : '-'}
                        </span>
                      : <span className="admin-status-badge admin-status-badge--locked">Pendente</span>
                    }
                  </td>
                  <td>
                    {!inv.pago && (
                      <button className="btn btn-sm btn-primary" onClick={() => payInvoice(inv.id)}>
                        Marcar como paga
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Nenhuma fatura encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 20, padding: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>💡 Simulação</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Esta é uma representação fictícia para fins de protótipo. Os valores, planos e faturas são ilustrativos.
          O modelo de cobrança real será definido posteriormente (por assento/mês ou taxa fixa por empresa).
        </div>
      </div>
    </div>
  )
}
