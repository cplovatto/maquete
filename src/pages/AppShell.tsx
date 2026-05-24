import { useState, createContext, useContext, useEffect, useRef, useMemo } from 'react'
import type { ReactNode, Dispatch, SetStateAction } from 'react'
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useLojas, type Loja } from '../context/LojasContext'
import { useLabels, LABEL_COLORS } from '../context/LabelsContext'
import { useData, type MainRow, type FluxoRow, type MainTotal, type FluxoTotal } from '../context/DataContext'

/* ── File status context ────────────────────────────── */
type FileStatus = 'embedded' | 'loaded' | 'pending'
interface FileStatusCtxType {
  statuses: Record<string, FileStatus>
  setStatuses: Dispatch<SetStateAction<Record<string, FileStatus>>>
  onFileLoaded: (id: string, filename: string) => void
  openImport: () => void
  lastLoaded: Record<string, Date>
  fileDates: Record<string, Date | null>
  lastParcialUpload: Date | null
  alertEnabled: boolean
  setAlertEnabled: Dispatch<SetStateAction<boolean>>
  alertIntervalMinutes: number
  setAlertIntervalMinutes: Dispatch<SetStateAction<number>>
  alertActive: boolean
  toastVisible: boolean
  setToastVisible: Dispatch<SetStateAction<boolean>>
}
const FileStatusCtx = createContext<FileStatusCtxType | null>(null)
function useFileStatus() { return useContext(FileStatusCtx)! }

/* ── Fake data ──────────────────────────────────────── */
const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const CHART_H = [38, 52, 44, 65, 72, 58, 80, 70, 88, 95, 100, 82]

const ORDERS = [
  { id: '#4521', cliente: 'Maria Fonseca',    itens: 'Batom Matte + Sérum',           valor: 'R$ 287,90', status: 'Concluído',           badge: 'badge-green' },
  { id: '#4520', cliente: 'João Pinheiro',    itens: 'Kit Skincare Premium',           valor: 'R$ 459,00', status: 'Em andamento',        badge: 'badge-blue'  },
  { id: '#4519', cliente: 'Ana Sousa',        itens: 'Paleta de Sombras',             valor: 'R$ 189,50', status: 'Aguard. pagamento',    badge: 'badge-yellow'},
  { id: '#4518', cliente: 'Carla Mesquita',   itens: 'Shampoo + Condicionador',       valor: 'R$ 124,90', status: 'Concluído',           badge: 'badge-green' },
  { id: '#4517', cliente: 'Pedro Alves',      itens: 'Creme Anti-idade',              valor: 'R$ 329,00', status: 'Concluído',           badge: 'badge-green' },
]

const ACTIVITY = [
  { av: 'MS', alt: '',     text: <><strong>Maria Silva</strong> fez login no sistema</>,               time: 'agora mesmo' },
  { av: 'JA', alt: 'alt',  text: <><strong>João Alves</strong> adicionou 12 itens ao estoque</>,       time: '4 min atrás' },
  { av: 'CP', alt: 'alt2', text: <><strong>Carla Pinto</strong> fechou pedido <strong>#4521</strong></>, time: '18 min atrás' },
  { av: 'AM', alt: '',     text: <><strong>Ana Mesquita</strong> se cadastrou como consultora VD</>,    time: '42 min atrás' },
  { av: 'RB', alt: 'alt',  text: <><strong>Roberto Braga</strong> emitiu NF-e #001.547</>,             time: '1 h atrás'   },
]

/* ── Sub-pages ──────────────────────────────────────── */
function DashboardPage() {
  const [activeBar, setActiveBar] = useState(10)

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Painel Geral</div>
        <div className="page-subtitle">Segunda-feira, 19 de maio de 2025</div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Vendas Hoje', value: 'R$ 3.847', delta: '+12,3%', dir: 'up', icon: '💰', bg: 'icon-bg-purple' },
          { label: 'Pedidos Abertos', value: '48', delta: '+5 novos', dir: 'up', icon: '🛒', bg: 'icon-bg-blue' },
          { label: 'Clientes Ativos', value: '1.234', delta: '+8 esta semana', dir: 'up', icon: '👥', bg: 'icon-bg-green' },
          { label: 'Ticket Médio', value: 'R$ 218', delta: '-2,1%', dir: 'down', icon: '📈', bg: 'icon-bg-orange' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-head">
              <span className="stat-card-label">{s.label}</span>
              <div className={`stat-card-icon ${s.bg}`}>{s.icon}</div>
            </div>
            <div className="stat-card-value">{s.value}</div>
            <div className={`stat-card-delta delta-${s.dir}`}>
              {s.dir === 'up' ? '▲' : '▼'} {s.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        {/* Chart + orders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Vendas — Últimos 12 Meses</div>
                <div className="card-subtitle">Em reais (R$)</div>
              </div>
              <span className="card-action">Exportar</span>
            </div>
            <div className="chart-bars">
              {CHART_H.map((h, i) => (
                <div
                  key={i}
                  className={`chart-bar${activeBar === i ? ' active' : ''}`}
                  style={{ height: `${h}%` }}
                  onClick={() => setActiveBar(i)}
                />
              ))}
            </div>
            <div className="chart-months">
              {MONTHS.map(m => <span key={m} className="chart-month-label">{m}</span>)}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Pedidos Recentes</div>
                <div className="card-subtitle">Últimas 24 horas</div>
              </div>
              <span className="card-action">Ver todos</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Itens</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ORDERS.map(o => (
                  <tr key={o.id}>
                    <td className="td-primary">{o.id}</td>
                    <td>{o.cliente}</td>
                    <td>{o.itens}</td>
                    <td className="td-primary">{o.valor}</td>
                    <td><span className={`badge ${o.badge}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Atividade Recente</div>
              <div className="card-subtitle">Atualizações em tempo real</div>
            </div>
          </div>
          <div className="activity-list">
            {ACTIVITY.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className={`activity-av${a.alt ? ` ${a.alt}` : ''}`}>{a.av}</div>
                <div>
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LojaPage() {
  return (
    <div className="placeholder-page">
      <div className="page-header">
        <div className="page-title">Prisma Loja</div>
        <div className="page-subtitle">Gestão do ponto de venda e operações da loja</div>
      </div>
      <div className="wip-banner">
        <span style={{ fontSize: 20 }}>🏗️</span>
        <span><strong>Módulo em construção</strong> — Esta seção está sendo desenvolvida. A seguir, veja o que estará disponível.</span>
      </div>
      <div className="placeholder-grid">
        {[
          { icon: '🖥️', title: 'PDV — Frente de Caixa', desc: 'Atendimento rápido com leitura de código de barras, formas de pagamento e emissão de NFC-e.' },
          { icon: '📦', title: 'Estoque', desc: 'Controle de entradas, saídas, inventário e alertas de ponto de pedido automáticos.' },
          { icon: '🛒', title: 'Pedidos', desc: 'Gestão de pedidos de venda, orçamentos, devoluções e histórico de cada cliente.' },
          { icon: '👥', title: 'Clientes', desc: 'Cadastro completo com histórico de compras, programa de fidelidade e CRM básico.' },
          { icon: '🏭', title: 'Fornecedores', desc: 'Cadastro, pedidos de compra e recebimento de mercadorias com conciliação fiscal.' },
          { icon: '📄', title: 'Fiscal', desc: 'Emissão de NF-e, NFC-e e SAT. Integração com certificado digital A1 e A3.' },
        ].map(c => (
          <div className="placeholder-card" key={c.title}>
            <div className="placeholder-card-icon">{c.icon}</div>
            <div className="placeholder-card-title">{c.title}</div>
            <div className="placeholder-card-desc">{c.desc}</div>
            <div className="placeholder-tag">Em breve</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VDPage() {
  return (
    <div className="placeholder-page">
      <div className="page-header">
        <div className="page-title">Prisma VD</div>
        <div className="page-subtitle">Gestão de venda direta e rede de consultoras</div>
      </div>
      <div className="wip-banner">
        <span style={{ fontSize: 20 }}>🏗️</span>
        <span><strong>Módulo em construção</strong> — Esta seção está sendo desenvolvida. A seguir, veja o que estará disponível.</span>
      </div>
      <div className="placeholder-grid">
        {[
          { icon: '👩‍💼', title: 'Consultoras', desc: 'Cadastro, hierarquia de equipes, metas individuais e coletivas com painel de desempenho.' },
          { icon: '📱', title: 'Catálogo Digital', desc: 'Catálogo interativo compartilhável por WhatsApp e redes sociais, com estoque em tempo real.' },
          { icon: '📋', title: 'Pedidos VD', desc: 'Recebimento e processamento de pedidos das consultoras com rastreamento de entrega.' },
          { icon: '💰', title: 'Comissões', desc: 'Cálculo automático de comissões, bonificações e prêmios por metas atingidas.' },
          { icon: '🎯', title: 'Metas e Gamificação', desc: 'Sistema de pontos, rankings e recompensas para motivar a equipe de consultoras.' },
          { icon: '📊', title: 'Relatórios VD', desc: 'Análise de desempenho por consultora, região, produto e período.' },
        ].map(c => (
          <div className="placeholder-card" key={c.title}>
            <div className="placeholder-card-icon">{c.icon}</div>
            <div className="placeholder-card-title">{c.title}</div>
            <div className="placeholder-card-desc">{c.desc}</div>
            <div className="placeholder-tag">Em breve</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RelatoriosPage() {
  return (
    <div className="placeholder-page">
      <div className="page-header">
        <div className="page-title">Relatórios</div>
        <div className="page-subtitle">Análises e exportações de dados</div>
      </div>
      <div className="placeholder-grid">
        {[
          { icon: '📈', title: 'Vendas por Período',      desc: 'Analise vendas diárias, semanais, mensais e anuais com gráficos interativos.' },
          { icon: '🏆', title: 'Ranking de Produtos',     desc: 'Top produtos mais vendidos, com margem, giro e curva ABC.' },
          { icon: '👤', title: 'Análise de Clientes',     desc: 'RFM, LTV, taxa de recompra e segmentação por perfil de consumo.' },
          { icon: '📦', title: 'Posição de Estoque',      desc: 'Inventário valorizado com custo médio, FIFO e movimentações.' },
          { icon: '🧾', title: 'Resultados Financeiros',  desc: 'DRE simplificado com receitas, custos, despesas e margem de contribuição.' },
          { icon: '📤', title: 'Exportações',             desc: 'Export para Excel, CSV e PDF. Integração com contabilidade e BI externo.' },
        ].map(c => (
          <div className="placeholder-card" key={c.title}>
            <div className="placeholder-card-icon">{c.icon}</div>
            <div className="placeholder-card-title">{c.title}</div>
            <div className="placeholder-card-desc">{c.desc}</div>
            <div className="placeholder-tag">Em breve</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConfigPage() {
  return (
    <div className="placeholder-page">
      <div className="page-header">
        <div className="page-title">Configurações</div>
        <div className="page-subtitle">Parâmetros do sistema e da empresa</div>
      </div>
      <div className="placeholder-grid">
        {[
          { icon: '🏢', title: 'Dados da Empresa',    desc: 'Razão social, CNPJ, endereço, logo e informações fiscais da empresa.' },
          { icon: '👤', title: 'Usuários e Acessos',  desc: 'Cadastro de usuários, perfis de permissão e controle de acesso por módulo.' },
          { icon: '💳', title: 'Pagamentos',          desc: 'Formas de pagamento, integrações com TEF, PIX e parcelamentos.' },
          { icon: '🔔', title: 'Notificações',        desc: 'Configure alertas de estoque, pedidos, metas e comunicações automáticas.' },
          { icon: '🔗', title: 'Integrações',         desc: 'APIs, webhooks, e-commerce, marketplaces e sistemas de contabilidade.' },
          { icon: '🛡️', title: 'Segurança',          desc: 'Autenticação em dois fatores, log de auditoria e política de senhas.' },
        ].map(c => (
          <div className="placeholder-card" key={c.title}>
            <div className="placeholder-card-icon">{c.icon}</div>
            <div className="placeholder-card-title">{c.title}</div>
            <div className="placeholder-card-desc">{c.desc}</div>
            <div className="placeholder-tag">Em breve</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── SVG icons (copied from prototipo01) ─────────────── */
const IC = {
  target:   <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>,
  clock:    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a10 10 0 1 0-10-10"/><path d="M12 6v6l4 2"/></svg>,
  calendar: <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  grid:     <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>,
  mapPin:   <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  chart:    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-7 4 4 5-9"/></svg>,
  store:    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1.5-5h15L21 9"/><path d="M3 9v11h18V9"/><path d="M9 13h6"/></svg>,
  users:    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  scatter:  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="6" cy="6" r="1"/><circle cx="18" cy="6" r="1"/><circle cx="6" cy="18" r="1"/><circle cx="18" cy="18" r="1"/><line x1="12" y1="12" x2="6" y2="6"/><line x1="12" y1="12" x2="18" y2="6"/><line x1="12" y1="12" x2="6" y2="18"/><line x1="12" y1="12" x2="18" y2="18"/></svg>,
  check:    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>,
  search:   <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
  arrows:   <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>,
  skin:     <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a9 9 0 0 1 9 9c0 4.17-2.84 7.67-6.69 8.69A9 9 0 1 1 12 2z"/><path d="M12 8c-1.5 1.5-2 3-2 4s.5 2.5 2 4"/><path d="M12 8c1.5 1.5 2 3 2 4s-.5 2.5-2 4"/></svg>,
  doc:      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>,
  dollar:   <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
}

/* ── Lojas ──────────────────────────────────────────── */
const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

function LojasModal({ onClose }: { onClose: () => void }) {
  const { lojas, addLoja, updateLoja, deleteLoja, importIds } = useLojas()
  const { labels, addLabel, updateLabel, deleteLabel } = useLabels()
  const [tab, setTab] = useState<'lista' | 'labels' | 'importar'>('lista')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ apelido: '', cidade: '', estado: '', labels: [] as string[] })
  const [adding, setAdding] = useState(false)
  const [newForm, setNewForm] = useState<Loja>({ id: '', apelido: '', cidade: '', estado: '', labels: [] })
  const [addError, setAddError] = useState('')
  const [importText, setImportText] = useState('')
  const [importResult, setImportResult] = useState<{ added: number; skipped: number } | null>(null)
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null)
  const [labelEditForm, setLabelEditForm] = useState({ name: '', color: LABEL_COLORS[0] })
  const [newLabelForm, setNewLabelForm] = useState({ name: '', color: LABEL_COLORS[0] })
  const [addingLabel, setAddingLabel] = useState(false)

  function startEdit(l: Loja) {
    setEditingId(l.id)
    setEditForm({ apelido: l.apelido, cidade: l.cidade, estado: l.estado, labels: l.labels ?? [] })
    setAdding(false)
  }

  function saveEdit() {
    if (editingId) { updateLoja(editingId, editForm); setEditingId(null) }
  }

  function startAdd() {
    setAdding(true)
    setNewForm({ id: '', apelido: '', cidade: '', estado: '', labels: [] })
    setAddError('')
    setEditingId(null)
  }

  function saveAdd() {
    const id = newForm.id.trim()
    if (!id) { setAddError('ID é obrigatório'); return }
    if (lojas.some(l => l.id === id)) { setAddError(`ID "${id}" já existe`); return }
    addLoja({ ...newForm, id })
    setAdding(false)
    setAddError('')
  }

  function handleImport() {
    const ids = importText.split(/[\n,;\t]/).map(s => s.trim()).filter(Boolean)
    const result = importIds(ids)
    setImportResult(result)
    setImportText('')
  }

  function toggleLabel(current: string[], id: string): string[] {
    return current.includes(id) ? current.filter(x => x !== id) : [...current, id]
  }

  function saveLabelEdit() {
    if (editingLabelId && labelEditForm.name.trim()) {
      updateLabel(editingLabelId, labelEditForm.name.trim(), labelEditForm.color)
      setEditingLabelId(null)
    }
  }

  function saveNewLabel() {
    if (newLabelForm.name.trim()) {
      addLabel(newLabelForm.name.trim(), newLabelForm.color)
      setNewLabelForm({ name: '', color: LABEL_COLORS[0] })
      setAddingLabel(false)
    }
  }

  const UfSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <select className="lojas-input lojas-uf" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">—</option>
      {UFS.map(uf => <option key={uf}>{uf}</option>)}
    </select>
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Cadastro de Lojas</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-tabs">
          <button className={`modal-tab${tab === 'lista' ? ' active' : ''}`} onClick={() => setTab('lista')}>
            Lojas{lojas.length > 0 && <span className="lojas-count">{lojas.length}</span>}
          </button>
          <button className={`modal-tab${tab === 'labels' ? ' active' : ''}`} onClick={() => setTab('labels')}>
            Labels{labels.length > 0 && <span className="lojas-count">{labels.length}</span>}
          </button>
          <button className={`modal-tab${tab === 'importar' ? ' active' : ''}`} onClick={() => setTab('importar')}>Importar IDs</button>
        </div>

        {tab === 'lista' && (
          <div className="modal-body">
            {(lojas.length > 0 || adding) && (
              <table className="lojas-table">
                <thead>
                  <tr><th>ID</th><th>Apelido</th><th>Cidade</th><th>UF</th><th>Labels</th><th /></tr>
                </thead>
                <tbody>
                  {lojas.map(l => editingId === l.id ? (
                    <tr key={l.id} className="lojas-row-editing">
                      <td className="lojas-id-cell">{l.id}</td>
                      <td><input className="lojas-input" value={editForm.apelido} onChange={e => setEditForm(f => ({ ...f, apelido: e.target.value }))} placeholder="Apelido" /></td>
                      <td><input className="lojas-input" value={editForm.cidade}  onChange={e => setEditForm(f => ({ ...f, cidade:  e.target.value }))} placeholder="Cidade"  /></td>
                      <td><UfSelect value={editForm.estado} onChange={v => setEditForm(f => ({ ...f, estado: v }))} /></td>
                      <td>
                        {labels.length > 0 ? (
                          <div className="label-chips-group">
                            {labels.map(lb => (
                              <button key={lb.id} type="button"
                                className={`label-chip label-chip--toggle${editForm.labels.includes(lb.id) ? ' selected' : ''}`}
                                style={{ '--chip-color': lb.color } as React.CSSProperties}
                                onClick={() => setEditForm(f => ({ ...f, labels: toggleLabel(f.labels, lb.id) }))}
                              >{lb.name}</button>
                            ))}
                          </div>
                        ) : <span className="lojas-empty-cell">—</span>}
                      </td>
                      <td className="lojas-actions">
                        <button className="lojas-btn-save"   onClick={saveEdit}>✓</button>
                        <button className="lojas-btn-cancel" onClick={() => setEditingId(null)}>✕</button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={l.id}>
                      <td className="lojas-id-cell">{l.id}</td>
                      <td>{l.apelido || <span className="lojas-empty-cell">—</span>}</td>
                      <td>{l.cidade  || <span className="lojas-empty-cell">—</span>}</td>
                      <td>{l.estado  || <span className="lojas-empty-cell">—</span>}</td>
                      <td>
                        <div className="label-chips-group">
                          {(l.labels ?? []).map(lid => {
                            const lb = labels.find(x => x.id === lid)
                            return lb ? (
                              <span key={lid} className="label-chip" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span>
                            ) : null
                          })}
                        </div>
                      </td>
                      <td className="lojas-actions">
                        <button className="lojas-btn-icon" onClick={() => startEdit(l)} title="Editar">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="lojas-btn-icon lojas-btn-delete" onClick={() => deleteLoja(l.id)} title="Excluir">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {adding && (
                    <tr className="lojas-row-editing">
                      <td><input className="lojas-input" value={newForm.id}      onChange={e => setNewForm(f => ({ ...f, id:      e.target.value }))} placeholder="ID *"    autoFocus /></td>
                      <td><input className="lojas-input" value={newForm.apelido} onChange={e => setNewForm(f => ({ ...f, apelido: e.target.value }))} placeholder="Apelido" /></td>
                      <td><input className="lojas-input" value={newForm.cidade}  onChange={e => setNewForm(f => ({ ...f, cidade:  e.target.value }))} placeholder="Cidade"  /></td>
                      <td><UfSelect value={newForm.estado} onChange={v => setNewForm(f => ({ ...f, estado: v }))} /></td>
                      <td>
                        {labels.length > 0 ? (
                          <div className="label-chips-group">
                            {labels.map(lb => (
                              <button key={lb.id} type="button"
                                className={`label-chip label-chip--toggle${newForm.labels.includes(lb.id) ? ' selected' : ''}`}
                                style={{ '--chip-color': lb.color } as React.CSSProperties}
                                onClick={() => setNewForm(f => ({ ...f, labels: toggleLabel(f.labels, lb.id) }))}
                              >{lb.name}</button>
                            ))}
                          </div>
                        ) : <span className="lojas-empty-cell">—</span>}
                      </td>
                      <td className="lojas-actions">
                        <button className="lojas-btn-save"   onClick={saveAdd}>✓</button>
                        <button className="lojas-btn-cancel" onClick={() => { setAdding(false); setAddError('') }}>✕</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            {lojas.length === 0 && !adding && (
              <div className="lojas-empty">Nenhuma loja cadastrada ainda.<br/><span style={{ fontSize: 12 }}>Use "Importar IDs" para cadastrar em massa a partir de uma planilha.</span></div>
            )}
            {addError && <p className="lojas-error">{addError}</p>}
            {!adding && <button className="lojas-add-btn" onClick={startAdd}>+ Adicionar loja</button>}
          </div>
        )}

        {tab === 'labels' && (
          <div className="modal-body">
            <div className="labels-list">
              {labels.map(lb => editingLabelId === lb.id ? (
                <div key={lb.id} className="label-list-row label-list-row--editing">
                  <input
                    className="lojas-input"
                    value={labelEditForm.name}
                    onChange={e => setLabelEditForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nome da label"
                    autoFocus
                  />
                  <div className="label-color-palette">
                    {LABEL_COLORS.map(c => (
                      <button key={c} type="button"
                        className={`label-color-swatch${labelEditForm.color === c ? ' selected' : ''}`}
                        style={{ background: c }}
                        onClick={() => setLabelEditForm(f => ({ ...f, color: c }))}
                      />
                    ))}
                  </div>
                  <button className="lojas-btn-save" onClick={saveLabelEdit}>✓</button>
                  <button className="lojas-btn-cancel" onClick={() => setEditingLabelId(null)}>✕</button>
                </div>
              ) : (
                <div key={lb.id} className="label-list-row">
                  <span className="label-color-dot" style={{ background: lb.color }} />
                  <span className="label-list-name">{lb.name}</span>
                  <div className="lojas-actions" style={{ marginLeft: 'auto' }}>
                    <button className="lojas-btn-icon" onClick={() => { setEditingLabelId(lb.id); setLabelEditForm({ name: lb.name, color: lb.color }); setAddingLabel(false) }} title="Editar">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="lojas-btn-icon lojas-btn-delete" onClick={() => deleteLabel(lb.id)} title="Excluir">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
              {labels.length === 0 && !addingLabel && (
                <div className="lojas-empty">Nenhuma label criada ainda.</div>
              )}
            </div>
            {addingLabel ? (
              <div className="label-list-row label-list-row--editing" style={{ marginTop: 12 }}>
                <input
                  className="lojas-input"
                  value={newLabelForm.name}
                  onChange={e => setNewLabelForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nome da label"
                  autoFocus
                />
                <div className="label-color-palette">
                  {LABEL_COLORS.map(c => (
                    <button key={c} type="button"
                      className={`label-color-swatch${newLabelForm.color === c ? ' selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => setNewLabelForm(f => ({ ...f, color: c }))}
                    />
                  ))}
                </div>
                <button className="lojas-btn-save" onClick={saveNewLabel}>✓</button>
                <button className="lojas-btn-cancel" onClick={() => setAddingLabel(false)}>✕</button>
              </div>
            ) : (
              <button className="lojas-add-btn" style={{ marginTop: 12 }} onClick={() => { setAddingLabel(true); setEditingLabelId(null) }}>+ Nova label</button>
            )}
          </div>
        )}

        {tab === 'importar' && (
          <div className="modal-body">
            <p className="lojas-import-desc">Cole abaixo os IDs das lojas — um por linha, ou separados por vírgula/ponto-e-vírgula. As lojas são criadas sem apelido, cidade ou estado; edite-as depois na aba Lojas. IDs já cadastrados são ignorados.</p>
            <textarea
              className="lojas-import-textarea"
              rows={8}
              placeholder={"001\n002\nSP-003\n..."}
              value={importText}
              onChange={e => { setImportText(e.target.value); setImportResult(null) }}
            />
            {importResult && (
              <div className="lojas-import-result">
                {importResult.added} loja{importResult.added !== 1 ? 's' : ''} adicionada{importResult.added !== 1 ? 's' : ''}
                {importResult.skipped > 0 && ` · ${importResult.skipped} ignorada${importResult.skipped !== 1 ? 's' : ''} (ID já existe)`}.
              </div>
            )}
            <button className="lojas-import-btn" onClick={handleImport} disabled={!importText.trim()}>Importar</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Alert settings modal ───────────────────────────── */
const ALERT_INTERVALS = [
  { value: 15,  label: '15 minutos' },
  { value: 30,  label: '30 minutos' },
  { value: 60,  label: '1 hora'     },
  { value: 120, label: '2 horas'    },
  { value: 240, label: '4 horas'    },
]

function AlertSettingsModal({ onClose }: { onClose: () => void }) {
  const { alertEnabled, setAlertEnabled, alertIntervalMinutes, setAlertIntervalMinutes, lastParcialUpload } = useFileStatus()
  const minutesSince = lastParcialUpload ? Math.floor((Date.now() - lastParcialUpload.getTime()) / 60000) : null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Configurações de alerta</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="alert-settings-body">
          <div className="alert-setting-row">
            <div>
              <div className="alert-setting-name">Alerta — Parcial do Dia</div>
              <div className="alert-setting-desc">Avisa quando é hora de carregar nova planilha</div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={alertEnabled} onChange={e => setAlertEnabled(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>

          {alertEnabled && (
            <>
              <div className="alert-intervals-label">Frequência</div>
              <div className="alert-intervals">
                {ALERT_INTERVALS.map(i => (
                  <button
                    key={i.value}
                    className={`alert-interval-btn${alertIntervalMinutes === i.value ? ' active' : ''}`}
                    onClick={() => setAlertIntervalMinutes(i.value)}
                  >{i.label}</button>
                ))}
              </div>
              <div className="alert-last-import">
                {minutesSince === null
                  ? 'Parcial do dia ainda não importada nesta sessão'
                  : minutesSince === 0
                    ? 'Última importação: agora mesmo'
                    : `Última importação: ${minutesSince} min atrás`}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Parcial alert toast ─────────────────────────────── */
function ParcialAlertToast({ onDismiss, onImport }: { onDismiss: () => void; onImport: () => void }) {
  return (
    <div className="parcial-toast">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 22a10 10 0 1 0-10-10"/><path d="M12 6v6l4 2"/></svg>
      <div className="parcial-toast-text">
        <div className="parcial-toast-title">Hora de atualizar o Parcial do Dia</div>
        <div className="parcial-toast-sub">Importe a planilha para manter os dados em tempo real.</div>
      </div>
      <button className="parcial-toast-import" onClick={onImport}>Importar agora</button>
      <button className="parcial-toast-dismiss" onClick={onDismiss}>✕</button>
    </div>
  )
}

/* ── Import modal data ──────────────────────────────── */
interface DataSource { id: string; name: string; format: 'XLSX' | 'CSV'; icon: ReactNode; defaultStatus: FileStatus; section: string }

const MENSAL_SOURCES: DataSource[] = [
  // Gestão Instantânea
  { id: 'meta',         name: 'Meta do dia',             format: 'XLSX', icon: IC.target,   defaultStatus: 'embedded', section: 'Gestão Instantânea' },
  { id: 'parcial',      name: 'Parcial do dia',          format: 'CSV',  icon: IC.clock,    defaultStatus: 'pending',  section: 'Gestão Instantânea' },
  { id: 'dia-ant',      name: 'Dia anterior',            format: 'CSV',  icon: IC.calendar, defaultStatus: 'pending',  section: 'Gestão Instantânea' },
  { id: 'meta-diaant',  name: 'Meta — Dia anterior',     format: 'XLSX', icon: IC.calendar, defaultStatus: 'pending',  section: 'Gestão Instantânea' },
  { id: 'parcial-skin', name: 'Parcial Skin',            format: 'XLSX', icon: IC.skin,     defaultStatus: 'pending',  section: 'Gestão Instantânea' },
  // Lojas
  { id: 'main',         name: 'Indicadores principais',  format: 'XLSX', icon: IC.grid,     defaultStatus: 'pending',  section: 'Lojas' },
  { id: 'fluxo',        name: 'Ação de Fluxo',           format: 'XLSX', icon: IC.arrows,   defaultStatus: 'pending',  section: 'Lojas' },
  // IAF
  { id: 'iaf',          name: 'Relatório IAF',           format: 'XLSX', icon: IC.check,    defaultStatus: 'embedded', section: 'IAF' },
  { id: 'skin',         name: 'Skin (Cuidados Faciais)', format: 'XLSX', icon: IC.skin,     defaultStatus: 'pending',  section: 'IAF' },
  { id: 'servicos',     name: 'Serviços',                format: 'XLSX', icon: IC.doc,      defaultStatus: 'pending',  section: 'IAF' },
]

const ANUAL_SOURCES: DataSource[] = [
  { id: 'anual-main',  name: 'Indicadores anuais',  format: 'XLSX', icon: IC.grid,   defaultStatus: 'pending', section: 'Lojas' },
  { id: 'anual-fluxo', name: 'Ação de Fluxo anual', format: 'XLSX', icon: IC.arrows, defaultStatus: 'pending', section: 'Lojas' },
  { id: 'anual-pef',   name: 'Parcial PEF',         format: 'XLSX', icon: IC.dollar, defaultStatus: 'pending', section: 'IAF'   },
]

function extractDateFromFilename(name: string): Date | null {
  // YYYYMMDD_ no início: 20260416_Loja_...
  const m1 = name.match(/^(\d{4})(\d{2})(\d{2})_/)
  if (m1) { const d = new Date(+m1[1], +m1[2] - 1, +m1[3]); if (!isNaN(d.getTime())) return d }
  // DD-MM-YYYY em qualquer posição: GerencialVendas-02-05-2026
  const m2 = name.match(/(\d{2})-(\d{2})-(\d{4})/)
  if (m2) { const d = new Date(+m2[3], +m2[2] - 1, +m2[1]); if (!isNaN(d.getTime())) return d }
  // YYYY-MM-DD em qualquer posição
  const m3 = name.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (m3) { const d = new Date(+m3[1], +m3[2] - 1, +m3[3]); if (!isNaN(d.getTime())) return d }
  // DDMMYYYY compacto
  const m4 = name.match(/(\d{2})(\d{2})(\d{4})/)
  if (m4) { const d = new Date(+m4[3], +m4[2] - 1, +m4[1]); if (!isNaN(d.getTime())) return d }
  return null
}

function formatImportDate(fileDate: Date | null, loadedAt: Date): { text: string; stale: boolean } {
  const refDate = fileDate ?? loadedAt
  const isToday = refDate.toDateString() === new Date().toDateString()
  const d = refDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const t = loadedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return { text: `${d} às ${t}`, stale: !isToday }
}

function ImportModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'mensal' | 'anual'>('mensal')
  const { statuses, onFileLoaded, lastLoaded, fileDates } = useFileStatus()
  const { loadFile } = useData()

  const sources = tab === 'mensal' ? MENSAL_SOURCES : ANUAL_SOURCES
  const sections = Array.from(new Set(sources.map(s => s.section)))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Fontes de Dados</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-tabs">
          <button className={`modal-tab${tab === 'mensal' ? ' active' : ''}`} onClick={() => setTab('mensal')}>Mensal</button>
          <button className={`modal-tab${tab === 'anual'  ? ' active' : ''}`} onClick={() => setTab('anual')}>Anual</button>
        </div>

        <div className="modal-body">
          {sections.map(section => (
            <div key={section}>
              <div className="import-section-title">{section}</div>
              {sources.filter(s => s.section === section).map(source => (
                <label key={source.id} className="import-row">
                  <input
                    type="file"
                    accept={source.format === 'CSV' ? '.csv' : '.xlsx,.xls'}
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      onFileLoaded(source.id, file.name)
                      loadFile(source.id, file)
                    }}
                  />
                  <span className="import-icon">{source.icon}</span>
                  <span className="import-meta">
                    <span className="import-name">{source.name}</span>
                    {lastLoaded[source.id]
                      ? (() => { const { text, stale } = formatImportDate(fileDates[source.id] ?? null, lastLoaded[source.id]); return (
                          <span className={`import-status ok${stale ? ' stale' : ''}`}>{text}</span>
                        )})()
                      : <span className="import-status">Não carregado</span>
                    }
                  </span>
                  <span className={`import-format-badge format-${source.format.toLowerCase()}`}>{source.format}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Sidebar nav item ───────────────────────────────── */
interface SideItemProps { to: string; icon: ReactNode; label: string; requires?: string[] }
function SideItem({ to, icon, label, requires }: SideItemProps) {
  const { statuses, alertActive } = useFileStatus()
  const hasMissing = requires?.some(id => statuses[id] === 'pending') ?? false
  const isParcial = requires?.includes('parcial') ?? false
  const showPulse = isParcial && alertActive

  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
    >
      {icon}
      {label}
      {showPulse
        ? <span className="nav-warn-dot nav-warn-dot--pulse" title="Hora de atualizar o Parcial do Dia" />
        : hasMissing && <span className="nav-warn-dot" title="Arquivo necessário não carregado" />}
    </NavLink>
  )
}

/* ── Dashboard utilities ────────────────────────────── */
const META_PADRAO = 100_000

const fBRL  = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const fBRLR = (v: number) => `R$ ${fBRL(v)}`
const fInt  = (v: number) => Math.round(v).toLocaleString('pt-BR')
const fDec  = (v: number, d = 2) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d })
const fPct  = (v: number) => (v * 100).toFixed(1).replace('.', ',') + '%'
const fVar  = (v: number) => (v > 0 ? '+' : '') + v.toFixed(1).replace('.', ',') + '%'

function VarBadge({ v }: { v: number }) {
  return <span className={`var-badge${v > 0.05 ? ' var-pos' : v < -0.05 ? ' var-neg' : ''}`}>{fVar(v)}</span>
}

function KpiCard({ label, value, var: varV, varNote, efc }: { label: string; value: string; var?: number; varNote?: string; efc?: string }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {varV !== undefined && (
        <div className={`kpi-var${varV > 0.05 ? ' pos' : varV < -0.05 ? ' neg' : ''}`}>
          {fVar(varV)}{varNote && <span className="kpi-var-note">{varNote}</span>}
        </div>
      )}
      {efc && <div className="kpi-efc">EFC {efc}</div>}
    </div>
  )
}

function LojasEmptyState() {
  const { openImport } = useFileStatus()
  return (
    <div className="page-empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6M9 15l3 3 3-3"/></svg>
      <div className="page-empty-title">Dados de Lojas não carregados</div>
      <div className="page-empty-desc">Importe as planilhas para visualizar este relatório</div>
      <div className="page-empty-chips">
        <span className="missing-file-chip">Indicadores principais <span className="import-format-badge format-xlsx">XLSX</span></span>
        <span className="missing-file-chip">Ação de Fluxo <span className="import-format-badge format-xlsx">XLSX</span></span>
      </div>
      <button className="page-empty-btn" onClick={openImport}>Importar planilhas</button>
    </div>
  )
}

type SortKey = keyof MainRow | 'conv_pct'

function useStoreTableData(sortKey: SortKey, sortDir: 'asc' | 'desc') {
  const { mainRows, fluxoRows } = useData()
  const { lojas } = useLojas()
  const { labels } = useLabels()
  return useMemo(() => {
    const fluxoMap = new Map(fluxoRows.map(r => [r.pdv, r]))
    const lojaMap  = new Map(lojas.map(l => [l.id, l]))
    const rows = mainRows.map(r => ({
      main: r,
      loja: lojaMap.get(r.pdv),
      fluxo: fluxoMap.get(r.pdv),
    }))
    rows.sort((a, b) => {
      let va = 0, vb = 0
      if (sortKey === 'conv_pct') { va = a.fluxo?.conv_pct ?? -1; vb = b.fluxo?.conv_pct ?? -1 }
      else { va = (a.main as unknown as Record<string, number>)[sortKey] ?? 0; vb = (b.main as unknown as Record<string, number>)[sortKey] ?? 0 }
      return sortDir === 'desc' ? vb - va : va - vb
    })
    return { rows, labels }
  }, [mainRows, fluxoRows, lojas, labels, sortKey, sortDir])
}

function StoreRow({ rank, main, loja, fluxo, labels: allLabels }: {
  rank: number
  main: MainRow
  loja: ReturnType<typeof useLojas>['lojas'][0] | undefined
  fluxo: FluxoRow | undefined
  labels: ReturnType<typeof useLabels>['labels']
}) {
  return (
    <tr>
      <td className="col-rank">{rank}</td>
      <td className="col-pdv">{main.pdv}</td>
      <td>
        <div className="label-chips-group">
          {(loja?.labels ?? []).map(lid => {
            const lb = allLabels.find(x => x.id === lid)
            return lb ? <span key={lid} className="label-chip" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span> : null
          })}
        </div>
      </td>
      <td className="col-num">{fBRL(main.vf_atual)}</td>
      <td className="col-var"><VarBadge v={main.vf_var} /></td>
      <td className="col-num">{fInt(main.qb_atual)}</td>
      <td className="col-var"><VarBadge v={main.qb_var} /></td>
      <td className="col-num">{fBRL(main.bm_atual)}</td>
      <td className="col-var"><VarBadge v={main.bm_var} /></td>
      <td className="col-num">{fDec(main.iv_atual)}</td>
      <td className="col-var"><VarBadge v={main.iv_var} /></td>
      <td className="col-num">{fBRLR(main.pm_atual)}</td>
      <td className="col-var"><VarBadge v={main.pm_var} /></td>
      <td className="col-num">{fluxo ? fPct(fluxo.conv_pct) : <span className="dash-muted">—</span>}</td>
    </tr>
  )
}

function StoreTableHead({ sortKey, sortDir, onSort }: { sortKey: SortKey; sortDir: 'asc' | 'desc'; onSort: (k: SortKey) => void }) {
  const Th = ({ k, children, right }: { k: SortKey; children: React.ReactNode; right?: boolean }) => {
    const active = sortKey === k
    return (
      <th className={`${right ? 'col-num' : ''} sort-th${active ? ' sort-active' : ''}`} onClick={() => onSort(k)}>
        {children} <span className="sort-arrow">{active ? (sortDir === 'desc' ? '▼' : '▲') : '⇅'}</span>
      </th>
    )
  }
  return (
    <thead>
      <tr>
        <th className="col-rank">#</th>
        <th className="col-pdv">PDV</th>
        <th>Labels</th>
        <Th k="vf_atual" right>VF Atual</Th>
        <th className="col-var">Var.</th>
        <Th k="qb_atual" right>QB</Th>
        <th className="col-var">Var.</th>
        <Th k="bm_atual" right>BM</Th>
        <th className="col-var">Var.</th>
        <Th k="iv_atual" right>IV</Th>
        <th className="col-var">Var.</th>
        <Th k="pm_atual" right>PM</Th>
        <th className="col-var">Var.</th>
        <Th k="conv_pct" right>Conv.%</Th>
      </tr>
    </thead>
  )
}

/* ── Lojas — Visão Geral ─────────────────────────────── */
function VisaoGeralPage() {
  const { mainRows, mainTotal, cpData, fluxoRows, fluxoTotal } = useData()
  const { lojas } = useLojas()
  const { labels } = useLabels()
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [selectedImpactLabels, setSelectedImpactLabels] = useState<string[]>([])

  if (mainRows.length === 0) return <LojasEmptyState />

  const vfValor   = cpData?.vf_valor  ?? mainTotal?.vf_atual ?? 0
  const qbValor   = cpData?.qb_valor  ?? mainTotal?.qb_atual ?? 0
  const bmValor   = cpData?.bm_valor  ?? mainTotal?.bm_atual ?? 0
  const ivValor   = cpData?.iv_valor  ?? mainTotal?.iv_atual ?? 0
  const pmValor   = cpData?.pm_valor  ?? mainTotal?.pm_atual ?? 0
  const convTotal = fluxoTotal?.conv_pct ?? (fluxoRows.length > 0
    ? fluxoRows.reduce((s, r) => s + r.conversoes, 0) / Math.max(fluxoRows.reduce((s, r) => s + r.resgates, 0), 1)
    : 0)

  const lojaMap = useMemo(() => new Map(lojas.map(l => [l.id, l])), [lojas])

  // BM médio do grupo (rede toda, independente do filtro)
  const totalVF = mainRows.reduce((s, r) => s + r.vf_atual, 0)
  const totalQB = mainRows.reduce((s, r) => s + r.qb_atual, 0)
  const groupBM = totalQB > 0 ? totalVF / totalQB : 0

  function toggleLabel(id: string) {
    setSelectedLabels(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const gapRows = useMemo(() => {
    const rows = mainRows
      .filter(r => r.bm_atual < groupBM)
      .map(r => ({
        ...r,
        loja: lojaMap.get(r.pdv),
        gapBM: groupBM - r.bm_atual,
        gapRevenue: (groupBM - r.bm_atual) * r.qb_atual,
      }))
      .sort((a, b) => b.gapRevenue - a.gapRevenue)

    if (selectedLabels.length === 0) return rows
    return rows.filter(r =>
      selectedLabels.some(lid => (r.loja?.labels ?? []).includes(lid))
    )
  }, [mainRows, groupBM, lojaMap, selectedLabels])

  const totalGap = gapRows.reduce((s, r) => s + r.gapRevenue, 0)

  const regionRevenue = useMemo(() => {
    const map = new Map<string, { label: typeof labels[0] | null; vf: number }>()
    labels.forEach(lb => map.set(lb.id, { label: lb, vf: 0 }))
    map.set('__none__', { label: null, vf: 0 })
    mainRows.forEach(r => {
      const loja = lojaMap.get(r.pdv)
      const lids = loja?.labels ?? []
      if (lids.length === 0) { map.get('__none__')!.vf += r.vf_atual }
      else { lids.forEach(lid => { const e = map.get(lid); if (e) e.vf += r.vf_atual }) }
    })
    return [...map.values()].filter(g => g.vf > 0).sort((a, b) => b.vf - a.vf)
  }, [mainRows, labels, lojaMap])

  const totalRegionVF = regionRevenue.reduce((s, g) => s + g.vf, 0)

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Lojas — Visão Geral</h2>
          <p className="page-subtitle">{mainRows.length} lojas</p>
        </div>
      </div>
      <div className="kpi-row">
        <KpiCard label="Receita"      value={fBRLR(vfValor)} var={mainTotal?.vf_var} varNote="vs LY" />
        <KpiCard label="Qtd. Boletos" value={fInt(qbValor)}  var={mainTotal?.qb_var} varNote="vs LY" />
        <KpiCard label="Boleto Médio" value={fBRLR(bmValor)} var={mainTotal?.bm_var} varNote="vs LY" efc={cpData?.bm_efc ? fBRLR(cpData.bm_efc) : undefined} />
        <KpiCard label="Itens/Boleto" value={fDec(ivValor)}  var={mainTotal?.iv_var} varNote="vs LY" efc={cpData?.iv_efc ? fDec(cpData.iv_efc)  : undefined} />
        <KpiCard label="Preço Médio"  value={fBRLR(pmValor)} var={mainTotal?.pm_var} varNote="vs LY" efc={cpData?.pm_efc ? fBRLR(cpData.pm_efc) : undefined} />
        <KpiCard label="Conv. Fluxo"  value={fPct(convTotal)} />
      </div>

      {labels.length > 0 && (
        <div className="region-filter-bar">
          <span className="region-filter-label">Região</span>
          <button
            className={`region-filter-btn${selectedLabels.length === 0 ? ' active' : ''}`}
            onClick={() => setSelectedLabels([])}
          >Todas</button>
          {labels.map(lb => (
            <button
              key={lb.id}
              className={`region-filter-btn${selectedLabels.includes(lb.id) ? ' active' : ''}`}
              style={selectedLabels.includes(lb.id) ? { '--chip-color': lb.color, background: lb.color + '22', borderColor: lb.color, color: lb.color } as React.CSSProperties : undefined}
              onClick={() => toggleLabel(lb.id)}
            >{lb.name}</button>
          ))}
        </div>
      )}

      <div className="gap-section-header">
        <div>
          <h3 className="gap-section-title">Receita deixada na mesa — BM abaixo da média do grupo</h3>
          <p className="gap-section-sub">
            {gapRows.length} loja{gapRows.length !== 1 ? 's' : ''} com BM abaixo de {fBRLR(groupBM)} (média do grupo)
            {selectedLabels.length > 0 && ' · filtrado por região'}
          </p>
        </div>
        <div className="gap-section-total">
          <span className="gap-section-total-label">Total deixado na mesa</span>
          <span className="gap-section-total-value">{fBRLR(totalGap)}</span>
        </div>
      </div>

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th className="col-rank">#</th>
              <th className="col-pdv">PDV</th>
              <th>Labels</th>
              <th className="col-num">BM Loja</th>
              <th className="col-num">BM Grupo</th>
              <th className="col-num">Gap BM</th>
              <th className="col-num">Clientes (QB)</th>
              <th className="col-num col-gap-head">Receita na Mesa</th>
            </tr>
          </thead>
          <tbody>
            {gapRows.map((r, i) => (
              <tr key={r.pdv}>
                <td className="col-rank">{i + 1}</td>
                <td className="col-pdv">{r.pdv}</td>
                <td>
                  <div className="label-chips-group">
                    {(r.loja?.labels ?? []).map(lid => {
                      const lb = labels.find(x => x.id === lid)
                      return lb ? <span key={lid} className="label-chip" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span> : null
                    })}
                  </div>
                </td>
                <td className="col-num">{fBRLR(r.bm_atual)}</td>
                <td className="col-num col-muted-val">{fBRLR(groupBM)}</td>
                <td className="col-num col-neg-val">-{fBRLR(r.gapBM)}</td>
                <td className="col-num">{fInt(r.qb_atual)}</td>
                <td className="col-num col-gap-val">{fBRLR(r.gapRevenue)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="gap-table-total">
              <td colSpan={7} className="gap-total-label">Total deixado na mesa</td>
              <td className="col-num col-gap-val">{fBRLR(totalGap)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {regionRevenue.length > 1 && (() => {
        const R = 46, CX = 50, CY = 50
        let angle = -Math.PI / 2
        const segs = regionRevenue.map(g => {
          const pct = totalRegionVF > 0 ? g.vf / totalRegionVF : 0
          const sweep = pct * 2 * Math.PI
          const a0 = angle
          const a1 = angle + sweep
          angle = a1
          const x0 = CX + R * Math.cos(a0)
          const y0 = CY + R * Math.sin(a0)
          const x1 = CX + R * Math.cos(a1)
          const y1 = CY + R * Math.sin(a1)
          const large = sweep > Math.PI ? 1 : 0
          const path = pct >= 1
            ? `M ${CX} ${CY} m -${R} 0 a ${R} ${R} 0 1 0 ${R * 2} 0 a ${R} ${R} 0 1 0 -${R * 2} 0`
            : `M ${CX} ${CY} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`
          return { g, pct, path }
        })
        return (
          <div className="rev-chart-card">
            <div className="rev-chart-title">Receita por Região</div>
            <div className="rev-chart-layout">
              <svg viewBox="0 0 100 100" className="pie-svg">
                {segs.map(({ g, path }, i) => (
                  <path key={i} d={path} fill={g.label?.color ?? '#94a3b8'}
                    stroke="var(--bg-surface)" strokeWidth="1.5" strokeLinejoin="round" />
                ))}
              </svg>
              <div className="pie-legend">
                {segs.map(({ g, pct }, i) => (
                  <div key={i} className="pie-legend-row">
                    <span className="pie-legend-dot" style={{ background: g.label?.color ?? '#94a3b8' }} />
                    <span className="pie-legend-name">{g.label ? g.label.name : 'Sem região'}</span>
                    <span className="pie-legend-pct">{(pct * 100).toFixed(1).replace('.', ',')}%</span>
                    <span className="pie-legend-val">{fBRLR(g.vf)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      {(() => {
        const totalVFAnt = mainRows.reduce((s, r) => s + r.vf_ant, 0)
        if (totalVFAnt === 0) return null

        const impactRows = mainRows
          .map(r => ({
            ...r,
            loja: lojaMap.get(r.pdv),
            pp: (r.vf_ant / totalVFAnt) * r.vf_var,
          }))
          .filter(r => selectedImpactLabels.length === 0 || selectedImpactLabels.some(lid => (r.loja?.labels ?? []).includes(lid)))
          .sort((a, b) => a.pp - b.pp)

        if (impactRows.length === 0) return null

        const maxAbsPP = Math.max(...impactRows.map(r => Math.abs(r.pp)))
        const totalPP = impactRows.reduce((s, r) => s + r.pp, 0)

        return (
          <div className="impact-table-card">
            <div className="impact-table-header">
              <div className="impact-table-title">Impacto de Cada Loja no Resultado do Grupo</div>
              {labels.length > 0 && (
                <div className="region-filter-bar" style={{ marginBottom: 0 }}>
                  <span className="region-filter-label">Região</span>
                  <button
                    className={`region-filter-btn${selectedImpactLabels.length === 0 ? ' active' : ''}`}
                    onClick={() => setSelectedImpactLabels([])}
                  >Todas</button>
                  {labels.map(lb => (
                    <button
                      key={lb.id}
                      className={`region-filter-btn${selectedImpactLabels.includes(lb.id) ? ' active' : ''}`}
                      style={selectedImpactLabels.includes(lb.id) ? { background: lb.color + '22', borderColor: lb.color, color: lb.color } as React.CSSProperties : undefined}
                      onClick={() => setSelectedImpactLabels(prev => prev.includes(lb.id) ? prev.filter(x => x !== lb.id) : [...prev, lb.id])}
                    >{lb.name}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th className="col-rank">#</th>
                    <th className="col-pdv">PDV</th>
                    <th>Região</th>
                    <th className="col-num">VF Ano Ant.</th>
                    <th className="col-var">Var. LY</th>
                    <th className="impact-bar-th">Magnitude</th>
                    <th className="col-num">Impacto (pp)</th>
                  </tr>
                </thead>
                <tbody>
                  {impactRows.map((r, i) => {
                    const isPos = r.pp >= 0
                    const barColor = isPos ? '#059669' : '#dc2626'
                    return (
                      <tr key={r.pdv}>
                        <td className="col-rank">{i + 1}</td>
                        <td className="col-pdv">{r.pdv}</td>
                        <td>
                          <div className="label-chips-group">
                            {(r.loja?.labels ?? []).map(lid => {
                              const lb = labels.find(x => x.id === lid)
                              return lb ? <span key={lid} className="label-chip" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span> : null
                            })}
                          </div>
                        </td>
                        <td className="col-num">{fBRLR(r.vf_ant)}</td>
                        <td className="col-var"><VarBadge v={r.vf_var} /></td>
                        <td className="impact-bar-cell">
                          <div className="impact-bar-track">
                            <div className="impact-bar-fill" style={{ width: `${(Math.abs(r.pp) / maxAbsPP) * 100}%`, background: barColor }} />
                          </div>
                        </td>
                        <td className="col-num" style={{ color: barColor, fontWeight: 700 }}>
                          {isPos ? '+' : ''}{r.pp.toFixed(2).replace('.', ',')} pp
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="gap-table-total">
                    <td colSpan={6} className="gap-total-label">Resultado consolidado do grupo</td>
                    <td className="col-num" style={{ fontWeight: 700, color: totalPP >= 0 ? '#059669' : '#dc2626' }}>
                      {totalPP >= 0 ? '+' : ''}{totalPP.toFixed(2).replace('.', ',')} pp
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

/* ── Lojas — Ranking ─────────────────────────────────── */
function RankingPage() {
  const { mainRows } = useData()
  const [sortKey, setSortKey] = useState<SortKey>('vf_atual')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const { rows, labels } = useStoreTableData(sortKey, sortDir)

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(k); setSortDir('desc') }
  }

  if (mainRows.length === 0) return <LojasEmptyState />

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Ranking de Lojas</h2>
          <p className="page-subtitle">{mainRows.length} lojas · ordenadas por {sortKey === 'vf_atual' ? 'receita' : sortKey}</p>
        </div>
      </div>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <StoreTableHead sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
          <tbody>
            {rows.map((r, i) => <StoreRow key={r.main.pdv} rank={i + 1} {...r} labels={labels} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Lojas — Análise Regional ────────────────────────── */
function RegioesPage() {
  const { mainRows, fluxoRows } = useData()
  const { lojas } = useLojas()
  const { labels } = useLabels()

  if (mainRows.length === 0) return <LojasEmptyState />

  const fluxoMap = useMemo(() => new Map(fluxoRows.map(r => [r.pdv, r])), [fluxoRows])
  const lojaMap  = useMemo(() => new Map(lojas.map(l => [l.id, l])), [lojas])

  type RegionGroup = { label: ReturnType<typeof useLabels>['labels'][0] | null; rows: MainRow[] }
  const groups = useMemo((): RegionGroup[] => {
    if (labels.length === 0) return [{ label: null, rows: mainRows }]
    const map = new Map<string | '__none__', MainRow[]>()
    map.set('__none__', [])
    labels.forEach(lb => map.set(lb.id, []))
    mainRows.forEach(r => {
      const loja = lojaMap.get(r.pdv)
      const lids = loja?.labels ?? []
      if (lids.length === 0) { map.get('__none__')!.push(r) }
      else { lids.forEach(lid => map.get(lid)?.push(r)) }
    })
    const result: RegionGroup[] = labels
      .filter(lb => (map.get(lb.id)?.length ?? 0) > 0)
      .map(lb => ({ label: lb, rows: map.get(lb.id)! }))
    const noneRows = map.get('__none__')!
    if (noneRows.length > 0) result.push({ label: null, rows: noneRows })
    return result
  }, [mainRows, labels, lojaMap])

  function groupKpis(rows: MainRow[]) {
    const vf = rows.reduce((s, r) => s + r.vf_atual, 0)
    const qb = rows.reduce((s, r) => s + r.qb_atual, 0)
    const bm = qb > 0 ? vf / qb : 0
    const iv = rows.length > 0 ? rows.reduce((s, r) => s + r.iv_atual, 0) / rows.length : 0
    const fl = fluxoRows.filter(r => rows.some(mr => mr.pdv === r.pdv))
    const conv = fl.length > 0
      ? fl.reduce((s, r) => s + r.conversoes, 0) / Math.max(fl.reduce((s, r) => s + r.resgates, 0), 1)
      : null
    return { vf, qb, bm, iv, conv }
  }

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Análise Regional</h2>
          <p className="page-subtitle">{labels.length > 0 ? `${groups.length} regiões · ` : ''}{mainRows.length} lojas</p>
        </div>
      </div>
      {groups.map(({ label: lb, rows: groupRows }) => {
        const k = groupKpis(groupRows)
        return (
          <div key={lb?.id ?? '__none__'} className="region-block">
            <div className="region-header">
              {lb
                ? <span className="label-chip region-label-chip" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span>
                : <span className="region-label-chip region-label-chip--none">Sem região</span>}
              <span className="region-count">{groupRows.length} loja{groupRows.length !== 1 ? 's' : ''}</span>
              <div className="region-kpis">
                <span className="region-kpi"><span className="region-kpi-label">VF</span> <b>{fBRLR(k.vf)}</b></span>
                <span className="region-kpi"><span className="region-kpi-label">QB</span> <b>{fInt(k.qb)}</b></span>
                <span className="region-kpi"><span className="region-kpi-label">BM</span> <b>{fBRLR(k.bm)}</b></span>
                <span className="region-kpi"><span className="region-kpi-label">IV</span> <b>{fDec(k.iv)}</b></span>
                {k.conv !== null && <span className="region-kpi"><span className="region-kpi-label">Conv.</span> <b>{fPct(k.conv)}</b></span>}
              </div>
            </div>
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th className="col-rank">#</th>
                    <th className="col-pdv">PDV</th>
                    <th className="col-num">VF Atual</th>
                    <th className="col-var">Var.</th>
                    <th className="col-num">QB</th>
                    <th className="col-var">Var.</th>
                    <th className="col-num">BM</th>
                    <th className="col-var">Var.</th>
                    <th className="col-num">IV</th>
                    <th className="col-var">Var.</th>
                    <th className="col-num">PM</th>
                    <th className="col-var">Var.</th>
                    <th className="col-num">Conv.%</th>
                  </tr>
                </thead>
                <tbody>
                  {[...groupRows].sort((a, b) => b.vf_atual - a.vf_atual).map((r, i) => {
                    const loja  = lojaMap.get(r.pdv)
                    const fluxo = fluxoMap.get(r.pdv)
                    return (
                      <tr key={r.pdv}>
                        <td className="col-rank">{i + 1}</td>
                        <td className="col-pdv">{r.pdv}</td>
                        <td className="col-num">{fBRL(r.vf_atual)}</td>
                        <td className="col-var"><VarBadge v={r.vf_var} /></td>
                        <td className="col-num">{fInt(r.qb_atual)}</td>
                        <td className="col-var"><VarBadge v={r.qb_var} /></td>
                        <td className="col-num">{fBRL(r.bm_atual)}</td>
                        <td className="col-var"><VarBadge v={r.bm_var} /></td>
                        <td className="col-num">{fDec(r.iv_atual)}</td>
                        <td className="col-var"><VarBadge v={r.iv_var} /></td>
                        <td className="col-num">{fBRLR(r.pm_atual)}</td>
                        <td className="col-var"><VarBadge v={r.pm_var} /></td>
                        <td className="col-num">{fluxo ? fPct(fluxo.conv_pct) : <span className="dash-muted">—</span>}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Placeholder page ───────────────────────────────── */
function WipPage({ title, requires }: { title: string; requires?: string[] }) {
  const { statuses, openImport } = useFileStatus()
  const missing = (requires ?? [])
    .map(id => [...MENSAL_SOURCES, ...ANUAL_SOURCES].find(s => s.id === id))
    .filter((s): s is DataSource => !!s && statuses[s.id] === 'pending')

  if (missing.length > 0) {
    return (
      <div className="page-empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6M9 15l3 3 3-3"/></svg>
        <div className="page-empty-title">{title}</div>
        <div className="page-empty-desc">
          Para visualizar esta página, importe {missing.length === 1 ? 'a planilha' : 'as planilhas'}:
        </div>
        <div className="page-empty-chips">
          {missing.map(s => (
            <span key={s.id} className="missing-file-chip">
              {s.name}
              <span className={`import-format-badge format-${s.format.toLowerCase()}`}>{s.format}</span>
            </span>
          ))}
        </div>
        <button className="page-empty-btn" onClick={openImport}>Importar planilhas</button>
      </div>
    )
  }

  return (
    <div className="placeholder-page">
      <div className="page-header">
        <div className="page-title">{title}</div>
        <div className="page-subtitle">Em construção</div>
      </div>
      <div className="wip-banner">
        <span style={{ fontSize: 20 }}>🏗️</span>
        <span><strong>Módulo em construção</strong> — Esta seção está sendo desenvolvida.</span>
      </div>
    </div>
  )
}

/* ── Sidebar ────────────────────────────────────────── */
function Sidebar() {
  const [periodo, setPeriodo] = useState<'mensal' | 'anual'>('mensal')

  return (
    <aside className="sidebar">
      <div className="sidebar-period-toggle">
        <button
          className={`period-btn${periodo === 'mensal' ? ' active' : ''}`}
          onClick={() => setPeriodo('mensal')}
        >Mensal</button>
        <button
          className={`period-btn${periodo === 'anual' ? ' active' : ''}`}
          onClick={() => setPeriodo('anual')}
        >Anual</button>
      </div>

      {periodo === 'mensal' && (
        <nav className="nav-sections">
          <div className="nav-group">
            <div className="nav-group-title">Gestão Instantânea</div>
            <SideItem to="/app/meta"          icon={IC.target}   label="Meta do Dia" />
            <SideItem to="/app/parcial"       icon={IC.clock}    label="Parcial do Dia"  requires={['parcial']} />
            <SideItem to="/app/dia-anterior"  icon={IC.calendar} label="Dia Anterior"    requires={['dia-ant','meta-diaant']} />
          </div>
          <div className="nav-group">
            <div className="nav-group-title">Lojas</div>
            <SideItem to="/app/lojas"              icon={IC.grid}    label="Visão Geral"      requires={['main','fluxo']} />
            <SideItem to="/app/lojas/regioes"      icon={IC.mapPin}  label="Análise Regional" requires={['main','fluxo']} />
            <SideItem to="/app/lojas/ranking"      icon={IC.chart}   label="Ranking de Lojas" requires={['main','fluxo']} />
            <SideItem to="/app/lojas/detalhe"      icon={IC.store}   label="Detalhe da Loja"  requires={['main','fluxo']} />
            <SideItem to="/app/lojas/consultores"  icon={IC.users}   label="Consultores"      requires={['main','fluxo']} />
            <SideItem to="/app/lojas/dispersao"    icon={IC.scatter} label="Dispersão"        requires={['main','fluxo']} />
          </div>
          <div className="nav-group">
            <div className="nav-group-title">IAF</div>
            <SideItem to="/app/iaf"            icon={IC.check}   label="Indicadores" />
            <SideItem to="/app/iaf/detalhe"    icon={IC.search}  label="Detalhe" />
            <SideItem to="/app/iaf/fluxo"      icon={IC.arrows}  label="Ação de Fluxo" />
            <SideItem to="/app/iaf/skin"       icon={IC.skin}    label="Skin"     requires={['skin','parcial-skin']} />
            <SideItem to="/app/iaf/servicos"   icon={IC.doc}     label="Serviços" requires={['servicos']} />
          </div>
        </nav>
      )}

      {periodo === 'anual' && (
        <nav className="nav-sections">
          <div className="nav-group">
            <div className="nav-group-title">Lojas</div>
            <SideItem to="/app/anual/lojas"    icon={IC.grid}   label="Visão Geral"       requires={['anual-main']} />
            <SideItem to="/app/anual/regioes"  icon={IC.mapPin} label="Análise Regional"  requires={['anual-main']} />
            <SideItem to="/app/anual/ranking"  icon={IC.chart}  label="Ranking de Lojas"  requires={['anual-main']} />
            <SideItem to="/app/anual/detalhe"  icon={IC.store}  label="Detalhe da Loja"   requires={['anual-main']} />
            <SideItem to="/app/anual/fluxo"    icon={IC.arrows} label="Ação de Fluxo"     requires={['anual-fluxo']} />
          </div>
          <div className="nav-group">
            <div className="nav-group-title">IAF</div>
            <SideItem to="/app/anual/iaf"  icon={IC.check}  label="Indicadores" requires={['anual-main']} />
            <SideItem to="/app/anual/pef"  icon={IC.dollar} label="Parcial PEF" requires={['anual-pef']} />
          </div>
        </nav>
      )}

    </aside>
  )
}

/* ── App Shell ──────────────────────────────────────── */
export default function AppShell() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [alertSettingsOpen, setAlertSettingsOpen] = useState(false)
  const [lojasOpen, setLojasOpen] = useState(false)
  const [fileStatuses, setFileStatuses] = useState<Record<string, FileStatus>>(() => {
    const defaults: Record<string, FileStatus> = {}
    ;[...MENSAL_SOURCES, ...ANUAL_SOURCES].forEach(s => { defaults[s.id] = s.defaultStatus })
    try {
      const saved = localStorage.getItem('prisma-file-statuses')
      if (saved) return { ...defaults, ...(JSON.parse(saved) as Record<string, FileStatus>) }
    } catch {}
    return defaults
  })
  const [lastLoaded, setLastLoaded] = useState<Record<string, Date>>(() => {
    try {
      const saved = localStorage.getItem('prisma-file-lastloaded')
      if (saved) {
        const raw = JSON.parse(saved) as Record<string, string>
        const out: Record<string, Date> = {}
        for (const [k, v] of Object.entries(raw)) { const d = new Date(v); if (!isNaN(d.getTime())) out[k] = d }
        return out
      }
    } catch {}
    return {}
  })
  const [fileDates, setFileDates] = useState<Record<string, Date | null>>(() => {
    try {
      const saved = localStorage.getItem('prisma-file-dates')
      if (saved) {
        const raw = JSON.parse(saved) as Record<string, string | null>
        const out: Record<string, Date | null> = {}
        for (const [k, v] of Object.entries(raw)) { if (!v) { out[k] = null } else { const d = new Date(v); out[k] = isNaN(d.getTime()) ? null : d } }
        return out
      }
    } catch {}
    return {}
  })
  const [lastParcialUpload, setLastParcialUpload] = useState<Date | null>(() => {
    try {
      const saved = localStorage.getItem('prisma-parcial-upload')
      if (saved) { const d = new Date(saved); return isNaN(d.getTime()) ? null : d }
    } catch {}
    return null
  })
  const [alertEnabled, setAlertEnabled] = useState(() => {
    try {
      const v = localStorage.getItem('prisma-prefs-alertEnabled')
      return v !== null ? v === 'true' : true
    } catch { return true }
  })
  const [alertIntervalMinutes, setAlertIntervalMinutes] = useState(() => {
    try {
      const n = parseInt(localStorage.getItem('prisma-prefs-alertInterval') ?? '', 10)
      return [15, 30, 60, 120, 240].includes(n) ? n : 60
    } catch { return 60 }
  })
  const [alertActive, setAlertActive] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const loginTime = useRef(new Date())

  const onFileLoaded = (id: string, filename: string) => {
    const now = new Date()
    setFileStatuses(prev => ({ ...prev, [id]: 'loaded' }))
    setLastLoaded(prev => ({ ...prev, [id]: now }))
    setFileDates(prev => ({ ...prev, [id]: extractDateFromFilename(filename) }))
    if (id === 'parcial') {
      setLastParcialUpload(now)
      setAlertActive(false)
      setToastVisible(false)
    }
  }

  useEffect(() => {
    if (!alertEnabled) { setAlertActive(false); setToastVisible(false); return }
    const check = () => {
      const baseline = lastParcialUpload ?? loginTime.current
      const elapsed = (Date.now() - baseline.getTime()) / 60000
      if (elapsed >= alertIntervalMinutes) {
        setAlertActive(true)
        setToastVisible(true)
      }
    }
    check()
    const id = setInterval(check, 60000)
    return () => clearInterval(id)
  }, [alertEnabled, alertIntervalMinutes, lastParcialUpload])

  useEffect(() => {
    try { localStorage.setItem('prisma-prefs-alertEnabled', String(alertEnabled)) } catch {}
  }, [alertEnabled])

  useEffect(() => {
    try { localStorage.setItem('prisma-prefs-alertInterval', String(alertIntervalMinutes)) } catch {}
  }, [alertIntervalMinutes])

  useEffect(() => {
    try { localStorage.setItem('prisma-file-statuses', JSON.stringify(fileStatuses)) } catch {}
  }, [fileStatuses])

  useEffect(() => {
    try {
      const s: Record<string, string> = {}
      for (const [k, v] of Object.entries(lastLoaded)) s[k] = v.toISOString()
      localStorage.setItem('prisma-file-lastloaded', JSON.stringify(s))
    } catch {}
  }, [lastLoaded])

  useEffect(() => {
    try {
      const s: Record<string, string | null> = {}
      for (const [k, v] of Object.entries(fileDates)) s[k] = v ? v.toISOString() : null
      localStorage.setItem('prisma-file-dates', JSON.stringify(s))
    } catch {}
  }, [fileDates])

  useEffect(() => {
    try {
      if (lastParcialUpload) localStorage.setItem('prisma-parcial-upload', lastParcialUpload.toISOString())
      else localStorage.removeItem('prisma-parcial-upload')
    } catch {}
  }, [lastParcialUpload])

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <FileStatusCtx.Provider value={{
      statuses: fileStatuses, setStatuses: setFileStatuses, onFileLoaded,
      openImport: () => setImportOpen(true),
      lastLoaded, fileDates, lastParcialUpload, alertEnabled, setAlertEnabled,
      alertIntervalMinutes, setAlertIntervalMinutes,
      alertActive, toastVisible, setToastVisible,
    }}>
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <NavLink to="/app/dashboard" className="app-header-logo">
          <div className="app-header-logo-icon">💎</div>
          <span className="app-header-logo-text">Prisma Retail</span>
        </NavLink>

        <div className="app-header-search">
          <span className="app-header-search-icon">🔍</span>
          <input type="search" placeholder="Buscar pedidos, produtos, clientes…" />
        </div>

        <div className="app-header-spacer" />

        <div className="app-header-actions">
          <button className="app-header-icon-btn" title="Notificações">
            🔔
            <span className="notif-dot">3</span>
          </button>
          <button className="app-header-icon-btn" title="Ajuda">❓</button>
          <button className="theme-toggle" onClick={toggleTheme} title="Alternar tema">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <div className="profile-menu">
            <button
              className="app-header-avatar"
              title={user?.name}
              onClick={() => setProfileOpen(o => !o)}
            >
              {user?.initials}
            </button>
            {profileOpen && (
              <>
                <div className="profile-backdrop" onClick={() => setProfileOpen(false)} />
                <div className="profile-dropdown">
                  <button className="profile-dropdown-item" onClick={() => { setLojasOpen(true); setProfileOpen(false) }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M3 9l1.5-5h15L21 9"/><path d="M3 9v11h18V9"/><path d="M9 13h6"/></svg>
                    Cadastro de lojas
                  </button>
                  <button className="profile-dropdown-item" onClick={() => { setImportOpen(true); setProfileOpen(false) }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Importar planilhas
                  </button>
                  <button className="profile-dropdown-item" onClick={() => { setAlertSettingsOpen(true); setProfileOpen(false) }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    Configurações de alerta
                  </button>
                  <div className="profile-dropdown-divider" />
                  <button className="profile-dropdown-item profile-dropdown-item--danger" onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {lojasOpen && <LojasModal onClose={() => setLojasOpen(false)} />}
      {importOpen && <ImportModal onClose={() => setImportOpen(false)} />}
      {alertSettingsOpen && <AlertSettingsModal onClose={() => setAlertSettingsOpen(false)} />}
      {toastVisible && (
        <ParcialAlertToast
          onDismiss={() => setToastVisible(false)}
          onImport={() => { setToastVisible(false); setImportOpen(true) }}
        />
      )}

      <div className="app-body">
        {/* Sidebar */}
        <Sidebar />

        {/* Main */}
        <main className="app-main">
          <Routes>
            <Route index element={<Navigate to="meta" replace />} />
            {/* Mensal – Gestão Instantânea */}
            <Route path="meta"          element={<WipPage title="Meta do Dia" />} />
            <Route path="parcial"       element={<WipPage title="Parcial do Dia"  requires={['parcial']} />} />
            <Route path="dia-anterior"  element={<WipPage title="Dia Anterior"    requires={['dia-ant','meta-diaant']} />} />
            {/* Mensal – Lojas */}
            <Route path="lojas"               element={<VisaoGeralPage />} />
            <Route path="lojas/regioes"       element={<RegioesPage />} />
            <Route path="lojas/ranking"       element={<RankingPage />} />
            <Route path="lojas/detalhe"       element={<WipPage title="Detalhe da Loja"        requires={['main','fluxo']} />} />
            <Route path="lojas/consultores"   element={<WipPage title="Consultores"            requires={['main','fluxo']} />} />
            <Route path="lojas/dispersao"     element={<WipPage title="Dispersão"              requires={['main','fluxo']} />} />
            {/* Mensal – IAF */}
            <Route path="iaf"          element={<WipPage title="IAF — Indicadores" />} />
            <Route path="iaf/detalhe"  element={<WipPage title="IAF — Detalhe" />} />
            <Route path="iaf/fluxo"    element={<WipPage title="Ação de Fluxo" />} />
            <Route path="iaf/skin"     element={<WipPage title="Skin"     requires={['skin','parcial-skin']} />} />
            <Route path="iaf/servicos" element={<WipPage title="Serviços" requires={['servicos']} />} />
            {/* Anual – Lojas */}
            <Route path="anual/lojas"    element={<WipPage title="Anual — Lojas"              requires={['anual-main']} />} />
            <Route path="anual/regioes"  element={<WipPage title="Anual — Análise Regional"   requires={['anual-main']} />} />
            <Route path="anual/ranking"  element={<WipPage title="Anual — Ranking de Lojas"   requires={['anual-main']} />} />
            <Route path="anual/detalhe"  element={<WipPage title="Anual — Detalhe da Loja"    requires={['anual-main']} />} />
            <Route path="anual/fluxo"    element={<WipPage title="Anual — Ação de Fluxo"      requires={['anual-fluxo']} />} />
            {/* Anual – IAF */}
            <Route path="anual/iaf"  element={<WipPage title="Anual — Indicadores" requires={['anual-main']} />} />
            <Route path="anual/pef"  element={<WipPage title="Anual — Parcial PEF" requires={['anual-pef']} />} />
            {/* legado */}
            <Route path="dashboard"      element={<DashboardPage />} />
            <Route path="loja"           element={<LojaPage />} />
            <Route path="vd"             element={<VDPage />} />
            <Route path="relatorios"     element={<RelatoriosPage />} />
            <Route path="configuracoes"  element={<ConfigPage />} />
            <Route path="*"              element={<Navigate to="meta" replace />} />
          </Routes>
        </main>
      </div>
    </div>
    </FileStatusCtx.Provider>
  )
}
