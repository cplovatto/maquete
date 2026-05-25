import { useState } from 'react'
import { useUsers, type AppUser } from '../../context/UsersContext'
import { useCompanies, PLAN_MAX_USERS } from '../../context/CompaniesContext'

const EMPTY_USER: Omit<AppUser, 'id'> = {
  email: '',
  nome: '',
  perfil: 'user',
  empresaId: '',
  enabled: true,
}

function UserForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Omit<AppUser, 'id'>
  onSave: (data: Omit<AppUser, 'id'>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState(initial)

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.nome || !form.empresaId) return
    onSave(form)
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form-grid">
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Nome *</label>
          <input className="form-input" value={form.nome} onChange={e => set('nome', e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Perfil</label>
          <select className="form-input" value={form.perfil} onChange={e => set('perfil', e.target.value)}>
            <option value="user">Usuário</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.enabled} onChange={e => set('enabled', e.target.checked)} />
            Ativo
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

export default function UsersPage() {
  const { users, addUser, updateUser, deleteUser } = useUsers()
  const { empresas, getEmpresa } = useCompanies()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [filterEmpresa, setFilterEmpresa] = useState('')

  const filtered = filterEmpresa
    ? users.filter(u => u.empresaId === filterEmpresa)
    : users

  const empresaFilter = filterEmpresa ? getEmpresa(filterEmpresa) : null

  const handleAdd = (data: Omit<AppUser, 'id'>) => {
    const max = PLAN_MAX_USERS[getEmpresa(data.empresaId)?.plan ?? 'gratuito']
    const current = users.filter(u => u.empresaId === data.empresaId).length
    if (current >= max) {
      setError(`Limite de ${max} usuário(s) atingido para o plano desta empresa.`)
      return
    }
    const result = addUser(data)
    if (!result.ok) {
      setError(result.error ?? 'Erro ao adicionar usuário.')
      return
    }
    setAdding(false)
    setError('')
  }

  const handleEdit = (data: Omit<AppUser, 'id'>) => {
    if (editingId) {
      // preserva o email (chave)
      updateUser(editingId, { nome: data.nome, perfil: data.perfil, enabled: data.enabled, empresaId: data.empresaId })
      setEditingId(null)
    }
  }

  const editingUser = editingId ? users.find(u => u.id === editingId) : undefined

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Usuários</div>
          <div className="page-subtitle">Gerencie os usuários por empresa</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
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
          <button className="btn btn-primary" onClick={() => { setAdding(true); setError('') }}>+ Novo usuário</button>
        </div>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      {/* Add form */}
      {adding && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-head"><div className="card-title">Novo usuário</div></div>
          <UserForm
            initial={{ ...EMPTY_USER, empresaId: filterEmpresa || '' }}
            onSave={handleAdd}
            onCancel={() => { setAdding(false); setError('') }}
          />
        </div>
      )}

      {/* Edit form */}
      {editingUser && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-head"><div className="card-title">Editar: {editingUser.nome} ({editingUser.email})</div></div>
          <UserForm
            initial={{
              email: editingUser.email,
              nome: editingUser.nome,
              perfil: editingUser.perfil,
              empresaId: editingUser.empresaId,
              enabled: editingUser.enabled,
            }}
            onSave={handleEdit}
            onCancel={() => setEditingId(null)}
          />
        </div>
      )}

      {/* Stats summary */}
      {empresaFilter && (
        <div className="admin-stats-row" style={{ marginBottom: 16 }}>
          <span>Empresa: <strong>{empresaFilter.fantasia || empresaFilter.razaoSocial}</strong></span>
          <span>Usuários: <strong>{filtered.length}</strong></span>
          <span>Plano: <strong>{empresaFilter.plan}</strong></span>
        </div>
      )}

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Nome</th>
              <th>Empresa</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const emp = getEmpresa(u.empresaId)
              return (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.nome}</td>
                  <td>{emp?.fantasia || emp?.razaoSocial || '-'}</td>
                  <td>{u.perfil === 'admin' ? 'Admin' : 'Usuário'}</td>
                  <td>
                    {u.enabled
                      ? <span className="admin-status-badge admin-status-badge--active">Ativo</span>
                      : <span className="admin-status-badge admin-status-badge--locked">Inativo</span>
                    }
                  </td>
                  <td>
                    <button className="btn btn-sm btn-ghost" onClick={() => setEditingId(u.id)}>Editar</button>
                    <button className="btn btn-sm btn-ghost" style={{ color: '#ef4444' }} onClick={() => deleteUser(u.id)}>Excluir</button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Nenhum usuário encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
