import { useState } from 'react'
import { useCompanies, type Empresa, type PlanType, PLAN_LABELS } from '../../context/CompaniesContext'

/* ── Empty state for a new company ──────────────────── */
const EMPTY: Omit<Empresa, 'id' | 'createdAt'> = {
  razaoSocial: '',
  fantasia: '',
  cnpj: '',
  telefone: '',
  email: '',
  plan: 'gratuito',
  locked: false,
}

/* ── CompanyForm (add / edit) ────────────────────────── */
function CompanyForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Omit<Empresa, 'id' | 'createdAt'>
  onSave: (data: Omit<Empresa, 'id' | 'createdAt'>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState(initial)

  const set = (k: keyof typeof form, v: string | boolean | PlanType) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.razaoSocial || !form.cnpj) return
    onSave(form)
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form-grid">
        <div className="form-group">
          <label className="form-label">Razão Social *</label>
          <input className="form-input" value={form.razaoSocial} onChange={e => set('razaoSocial', e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Nome Fantasia</label>
          <input className="form-input" value={form.fantasia} onChange={e => set('fantasia', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">CNPJ *</label>
          <input className="form-input" value={form.cnpj} onChange={e => set('cnpj', e.target.value)} placeholder="00.000.000/0001-00" required />
        </div>
        <div className="form-group">
          <label className="form-label">Telefone</label>
          <input className="form-input" value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(11) 99999-8888" />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Plano</label>
          <select className="form-input" value={form.plan} onChange={e => set('plan', e.target.value as PlanType)}>
            {Object.entries(PLAN_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.locked} onChange={e => set('locked', e.target.checked)} />
            Empresa bloqueada (ninguém loga)
          </label>
        </div>
      </div>
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary">Salvar</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  )
}

/* ── CompaniesPage ───────────────────────────────────── */
export default function CompaniesPage() {
  const { empresas, addEmpresa, updateEmpresa, deleteEmpresa } = useCompanies()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  const handleAdd = (data: Omit<Empresa, 'id' | 'createdAt'>) => {
    addEmpresa(data)
    setAdding(false)
  }

  const handleEdit = (data: Omit<Empresa, 'id' | 'createdAt'>) => {
    if (editingId) {
      updateEmpresa(editingId, data)
      setEditingId(null)
    }
  }

  const editingEmpresa = editingId ? empresas.find(e => e.id === editingId) : undefined

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Empresas</div>
          <div className="page-subtitle">Gerencie as empresas cadastradas no sistema</div>
        </div>
        <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Nova empresa</button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-head"><div className="card-title">Nova empresa</div></div>
          <CompanyForm initial={EMPTY} onSave={handleAdd} onCancel={() => setAdding(false)} />
        </div>
      )}

      {/* Edit form */}
      {editingEmpresa && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-head"><div className="card-title">Editar: {editingEmpresa.fantasia || editingEmpresa.razaoSocial}</div></div>
          <CompanyForm
            initial={{
              razaoSocial: editingEmpresa.razaoSocial,
              fantasia: editingEmpresa.fantasia,
              cnpj: editingEmpresa.cnpj,
              telefone: editingEmpresa.telefone,
              email: editingEmpresa.email,
              plan: editingEmpresa.plan,
              locked: editingEmpresa.locked,
            }}
            onSave={handleEdit}
            onCancel={() => setEditingId(null)}
          />
        </div>
      )}

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Razão Social</th>
              <th>Fantasia</th>
              <th>CNPJ</th>
              <th>Plano</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map(e => (
              <tr key={e.id}>
                <td>{e.razaoSocial}</td>
                <td>{e.fantasia}</td>
                <td>{e.cnpj}</td>
                <td><span className="admin-plan-badge">{PLAN_LABELS[e.plan]}</span></td>
                <td>
                  {e.locked
                    ? <span className="admin-status-badge admin-status-badge--locked">Bloqueado</span>
                    : <span className="admin-status-badge admin-status-badge--active">Ativo</span>
                  }
                </td>
                <td>
                  <button className="btn btn-sm btn-ghost" onClick={() => setEditingId(e.id)}>Editar</button>
                  <button className="btn btn-sm btn-ghost" style={{ color: '#ef4444' }} onClick={() => deleteEmpresa(e.id)}>Excluir</button>
                </td>
              </tr>
            ))}
            {empresas.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Nenhuma empresa cadastrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
