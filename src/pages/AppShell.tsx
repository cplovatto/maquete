import { useState, createContext, useContext, useEffect, useRef, useMemo } from 'react'
import type { ReactNode, Dispatch, SetStateAction } from 'react'
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useLojas, type Loja } from '../context/LojasContext'
import { useLabels, LABEL_COLORS } from '../context/LabelsContext'
import { useData, type MainRow, type FluxoRow, type MainTotal, type FluxoTotal, type ConsultorRow, type FluxoConsultorRow } from '../context/DataContext'

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
  idCard:   <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="7.5" cy="12" r="2.5"/><path d="M13 10h5M13 14h5"/></svg>,
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
  { id: 'id-cliente',   name: 'ID do Cliente',           format: 'XLSX', icon: IC.idCard,   defaultStatus: 'pending',  section: 'IAF' },
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
      end
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

      {/* ── Progresso do Mês ── */}
      {(() => {
        // TODO: substituir META_PADRAO pela meta mensal real de cada loja
        // quando o módulo de metas for implementado.
        // progressoRows precisará cruzar com a fonte "parcial" do mês corrente.
        const progressoRows = mainRows
          .map(r => ({
            ...r,
            loja: lojaMap.get(r.pdv),
            meta: META_PADRAO,                          // <- trocar pela meta real
            realizado: r.vf_atual,                      // <- trocar pelo parcial do mês
            pct: r.vf_atual / META_PADRAO,
          }))
          .sort((a, b) => b.pct - a.pct)

        const totalRealizado = progressoRows.reduce((s, r) => s + r.realizado, 0)
        const totalMeta      = progressoRows.reduce((s, r) => s + r.meta, 0)
        const totalPct       = totalMeta > 0 ? totalRealizado / totalMeta : 0

        return (
          <div className="impact-table-card">
            <div className="impact-table-header">
              <div className="impact-table-title">Progresso do Mês</div>
              <span className="progresso-placeholder-badge">Meta provisória · R$ 100k / loja</span>
            </div>
            <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th className="col-rank">#</th>
                    <th className="col-pdv">PDV</th>
                    <th>Região</th>
                    <th className="col-num">Realizado</th>
                    <th className="col-num">Meta</th>
                    <th className="impact-bar-th">Progresso</th>
                    <th className="col-num">%</th>
                  </tr>
                </thead>
                <tbody>
                  {progressoRows.map((r, i) => {
                    const pct     = r.pct
                    const barW    = Math.min(pct, 1) * 100
                    const color   = pct >= 1 ? '#059669' : pct >= 0.7 ? '#f59e0b' : '#dc2626'
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
                        <td className="col-num">{fBRLR(r.realizado)}</td>
                        <td className="col-num col-muted-val">{fBRLR(r.meta)}</td>
                        <td className="impact-bar-cell">
                          <div className="impact-bar-track">
                            <div className="impact-bar-fill" style={{ width: `${barW}%`, background: color }} />
                          </div>
                        </td>
                        <td className="col-num" style={{ fontWeight: 700, color }}>
                          {(pct * 100).toFixed(1).replace('.', ',')}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="gap-table-total">
                    <td colSpan={3} className="gap-total-label" style={{ textAlign: 'left', paddingLeft: 12 }}>
                      Total do grupo
                    </td>
                    <td className="col-num">{fBRLR(totalRealizado)}</td>
                    <td className="col-num col-muted-val">{fBRLR(totalMeta)}</td>
                    <td className="impact-bar-cell">
                      <div className="impact-bar-track">
                        <div className="impact-bar-fill" style={{
                          width: `${Math.min(totalPct, 1) * 100}%`,
                          background: totalPct >= 1 ? '#059669' : totalPct >= 0.7 ? '#f59e0b' : '#dc2626'
                        }} />
                      </div>
                    </td>
                    <td className="col-num" style={{ fontWeight: 700, color: totalPct >= 1 ? '#059669' : totalPct >= 0.7 ? '#f59e0b' : '#dc2626' }}>
                      {(totalPct * 100).toFixed(1).replace('.', ',')}%
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
type ChartMetric = 'vf_var' | 'vf_atual' | 'bm_atual' | 'iv_atual' | 'pm_atual' | 'conv_pct'
const CHART_METRICS: { key: ChartMetric; label: string }[] = [
  { key: 'vf_var',   label: '% Receita' },
  { key: 'vf_atual', label: 'Maior Receita' },
  { key: 'bm_atual', label: 'Boleto Médio' },
  { key: 'iv_atual', label: 'IV' },
  { key: 'pm_atual', label: 'Preço Médio' },
  { key: 'conv_pct', label: 'Ação de Fluxo' },
]

/* ── Referência de indicadores (reutilizável) ────────── */
function IndicadoresRef() {
  const { cpData } = useData()
  if (!cpData) return null
  const items = [
    { label: 'Boleto Médio', grupo: fBRLR(cpData.bm_valor), efc: fBRLR(cpData.bm_efc) },
    { label: 'Itens/Boleto', grupo: fDec(cpData.iv_valor),  efc: fDec(cpData.iv_efc)  },
    { label: 'Preço Médio',  grupo: fBRLR(cpData.pm_valor), efc: fBRLR(cpData.pm_efc) },
  ]
  return (
    <div className="indicadores-ref">
      <span className="indicadores-ref-title">Referência</span>
      {items.map(item => (
        <div key={item.label} className="indicadores-ref-item">
          <span className="indicadores-ref-name">{item.label}</span>
          <span className="indicadores-ref-val">
            <span className="indicadores-ref-tag indicadores-ref-tag--grupo">Grupo</span>
            {item.grupo}
          </span>
          <span className="indicadores-ref-sep">·</span>
          <span className="indicadores-ref-val">
            <span className="indicadores-ref-tag indicadores-ref-tag--efc">EFC</span>
            {item.efc}
          </span>
        </div>
      ))}
    </div>
  )
}

function RankingPage() {
  const { mainRows, fluxoRows } = useData()
  const [sortKey, setSortKey] = useState<SortKey>('vf_atual')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [chartMetric, setChartMetric] = useState<ChartMetric>('vf_var')
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const { rows, labels } = useStoreTableData(sortKey, sortDir)

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(k); setSortDir('desc') }
  }

  if (mainRows.length === 0) return <LojasEmptyState />

  const fluxoMap = new Map(fluxoRows.map(r => [r.pdv, r]))

  const chartData = useMemo(() => {
    return [...mainRows].map(r => {
      const fl = fluxoMap.get(r.pdv)
      let value = 0
      switch (chartMetric) {
        case 'vf_var':   value = r.vf_var;          break
        case 'vf_atual': value = r.vf_atual;         break
        case 'bm_atual': value = r.bm_atual;         break
        case 'iv_atual': value = r.iv_atual;         break
        case 'pm_atual': value = r.pm_atual;         break
        case 'conv_pct': value = (fl?.conv_pct ?? 0) * 100; break
      }
      return { pdv: r.pdv, value }
    }).sort((a, b) => b.value - a.value)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainRows, fluxoRows, chartMetric])

  const maxAbs = Math.max(...chartData.map(r => Math.abs(r.value)), 1)
  const isVar  = chartMetric === 'vf_var'
  const avg    = chartData.length > 0 ? chartData.reduce((s, r) => s + r.value, 0) / chartData.length : 0
  const avgPct = (avg / maxAbs) * 100

  function fChartVal(v: number): string {
    switch (chartMetric) {
      case 'vf_var':   return (v > 0 ? '+' : '') + v.toFixed(1).replace('.', ',') + '%'
      case 'vf_atual': return fBRLR(v)
      case 'bm_atual': return fBRLR(v)
      case 'iv_atual': return fDec(v)
      case 'pm_atual': return fBRLR(v)
      case 'conv_pct': return v.toFixed(1).replace('.', ',') + '%'
    }
  }

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Ranking de Lojas</h2>
          <p className="page-subtitle">{mainRows.length} lojas</p>
        </div>
      </div>
      <IndicadoresRef />

      {/* Chart */}
      <div className="ranking-chart-card">
        <div className="ranking-chart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="ranking-chart-title">Performance por Loja</span>
            {!isVar && (
              <span className="ranking-chart-legend">
                <span className="ranking-chart-legend-line" />
                Média do grupo: {fChartVal(avg)}
              </span>
            )}
          </div>
          <div className="ranking-chart-metrics">
            {CHART_METRICS.map(m => (
              <button
                key={m.key}
                className={`ranking-metric-btn${chartMetric === m.key ? ' active' : ''}`}
                onClick={() => setChartMetric(m.key)}
              >{m.label}</button>
            ))}
          </div>
        </div>
        <div className="ranking-chart-body">
          {isVar ? (
            // Diverging chart — zero no centro
            chartData.map(({ pdv, value }) => {
              const isPos  = value >= 0
              const barPct = (Math.abs(value) / maxAbs) * 50
              const color  = isPos ? '#059669' : '#dc2626'
              return (
                <div key={pdv} className="ranking-chart-row">
                  <span className="ranking-chart-pdv">{pdv}</span>
                  <div className="ranking-chart-bar-wrap">
                    <div className="ranking-chart-zero-line" />
                    <div className="ranking-chart-bar ranking-chart-bar--diverging" style={{
                      left:       isPos ? '50%'                     : `${50 - barPct}%`,
                      width:      `${barPct}%`,
                      background: color,
                    }} />
                  </div>
                  <span className="ranking-chart-val" style={{ color }}>{fChartVal(value)}</span>
                </div>
              )
            })
          ) : (
            // Barra normal + linha de referência (média do grupo)
            chartData.map(({ pdv, value }) => {
              const barW = (value / maxAbs) * 100
              const isAbove = value >= avg
              return (
                <div key={pdv} className="ranking-chart-row">
                  <span className="ranking-chart-pdv">{pdv}</span>
                  <div className="ranking-chart-bar-wrap">
                    <div className="ranking-chart-bar" style={{
                      width: `${barW}%`,
                      background: isAbove ? '#7c3aed' : '#a78bfa',
                    }} />
                    <div className="ranking-chart-avg-line" style={{ left: `${avgPct}%` }} />
                  </div>
                  <span className="ranking-chart-val">{fChartVal(value)}</span>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Table filters */}
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
              style={selectedLabels.includes(lb.id) ? { background: lb.color + '22', borderColor: lb.color, color: lb.color } as React.CSSProperties : undefined}
              onClick={() => setSelectedLabels(prev => prev.includes(lb.id) ? prev.filter(x => x !== lb.id) : [...prev, lb.id])}
            >{lb.name}</button>
          ))}
        </div>
      )}
      <div className="region-filter-bar">
        <span className="region-filter-label">Ordenar</span>
        {([
          { label: 'Maior Receita',     key: 'vf_atual'  as SortKey },
          { label: 'Maior Crescimento', key: 'vf_var'    as SortKey },
          { label: 'Maior BM',          key: 'bm_atual'  as SortKey },
          { label: 'Maior IV',          key: 'iv_atual'  as SortKey },
          { label: 'Maior PM',          key: 'pm_atual'  as SortKey },
          { label: 'Maior AF',          key: 'conv_pct'  as SortKey },
        ] as { label: string; key: SortKey }[]).map(({ label, key }) => (
          <button
            key={key}
            className={`region-filter-btn${sortKey === key && sortDir === 'desc' ? ' active' : ''}`}
            onClick={() => { setSortKey(key); setSortDir('desc') }}
          >{label}</button>
        ))}
      </div>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <StoreTableHead sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
          <tbody>
            {rows
              .filter(r => selectedLabels.length === 0 || selectedLabels.some(lid => (r.loja?.labels ?? []).includes(lid)))
              .map((r, i) => <StoreRow key={r.main.pdv} rank={i + 1} {...r} labels={labels} />)}
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
  const [selectedPotLabels, setSelectedPotLabels] = useState<string[]>([])

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

  function computeStats(rows: MainRow[]) {
    const vf_ant   = rows.reduce((s, r) => s + r.vf_ant,   0)
    const vf_atual = rows.reduce((s, r) => s + r.vf_atual, 0)
    const vf_var   = vf_ant > 0 ? (vf_atual - vf_ant) / vf_ant * 100 : 0

    const qb_ant   = rows.reduce((s, r) => s + r.qb_ant,   0)
    const qb_atual = rows.reduce((s, r) => s + r.qb_atual, 0)
    const qb_var   = qb_ant > 0 ? (qb_atual - qb_ant) / qb_ant * 100 : 0

    const bm_atual = qb_atual > 0 ? vf_atual / qb_atual : 0
    const bm_ant   = qb_ant   > 0 ? vf_ant   / qb_ant   : 0
    const bm_var   = bm_ant   > 0 ? (bm_atual - bm_ant) / bm_ant * 100 : 0

    // IV ponderado: total itens / total QB
    const ti_atual = rows.reduce((s, r) => s + r.iv_atual * r.qb_atual, 0)
    const ti_ant   = rows.reduce((s, r) => s + r.iv_ant   * r.qb_ant,   0)
    const iv_atual = qb_atual > 0 ? ti_atual / qb_atual : 0
    const iv_ant   = qb_ant   > 0 ? ti_ant   / qb_ant   : 0
    const iv_var   = iv_ant   > 0 ? (iv_atual - iv_ant) / iv_ant * 100 : 0

    // PM = VF / total itens
    const pm_atual = ti_atual > 0 ? vf_atual / ti_atual : 0
    const pm_ant   = ti_ant   > 0 ? vf_ant   / ti_ant   : 0
    const pm_var   = pm_ant   > 0 ? (pm_atual - pm_ant) / pm_ant * 100 : 0

    const fl       = rows.map(r => fluxoMap.get(r.pdv)).filter((f): f is FluxoRow => !!f)
    const resgates = fl.reduce((s, r) => s + r.resgates,   0)
    const conversoes = fl.reduce((s, r) => s + r.conversoes, 0)
    const conv_pct = resgates > 0 ? conversoes / resgates : null

    return { vf_atual, vf_var, qb_atual, qb_var, bm_atual, bm_var, iv_atual, iv_var, pm_atual, pm_var, conv_pct }
  }

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Análise Regional</h2>
          <p className="page-subtitle">{labels.length > 0 ? `${groups.length} regiões · ` : ''}{mainRows.length} lojas</p>
        </div>
      </div>
      <IndicadoresRef />

      <div className="region-cards-row" style={{ marginBottom: 32 }}>
        {groups.map(({ label: lb, rows: groupRows }) => {
          const s = computeStats(groupRows)
          const accent = lb?.color ?? '#94a3b8'
          return (
            <div key={lb?.id ?? '__none__'} className="region-card">
              <div className="region-card-header" style={{ borderColor: accent }}>
                {lb
                  ? <span className="label-chip region-label-chip" style={{ '--chip-color': accent } as React.CSSProperties}>{lb.name}</span>
                  : <span className="region-label-chip region-label-chip--none">Sem região</span>}
                <span className="region-count">{groupRows.length} loja{groupRows.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="region-card-kpis">
                {[
                  { label: 'Receita',       value: fBRLR(s.vf_atual), varV: s.vf_var },
                  { label: 'Qtd. Boletos',  value: fInt(s.qb_atual),  varV: s.qb_var },
                  { label: 'Boleto Médio',  value: fBRLR(s.bm_atual), varV: s.bm_var },
                  { label: 'Itens/Boleto',  value: fDec(s.iv_atual),  varV: s.iv_var },
                  { label: 'Preço Médio',   value: fBRLR(s.pm_atual), varV: s.pm_var },
                  ...(s.conv_pct !== null ? [{ label: 'Conv. Fluxo', value: fPct(s.conv_pct), varV: undefined }] : []),
                ].map(({ label, value, varV }) => (
                  <div key={label} className="region-kpi-row">
                    <span className="region-kpi-row-label">{label}</span>
                    <span className="region-kpi-row-value">{value}</span>
                    {varV !== undefined && (
                      <span className={`region-kpi-row-var${varV > 0.05 ? ' pos' : varV < -0.05 ? ' neg' : ''}`}>
                        {varV > 0 ? '+' : ''}{varV.toFixed(1).replace('.', ',')}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {groups.map(({ label: lb, rows: groupRows }) => (
        <div key={(lb?.id ?? '__none__') + '-table'} className="region-detail-block">
          <div className="region-detail-header" style={{ borderLeftColor: lb?.color ?? '#94a3b8' }}>
            {lb
              ? <span className="label-chip region-label-chip" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span>
              : <span className="region-label-chip region-label-chip--none">Sem região</span>}
            <span className="region-count">{groupRows.length} loja{groupRows.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
            <table
              className="dash-table dash-table--accented"
              style={{ '--table-accent-color': lb?.color ?? '#94a3b8' } as React.CSSProperties}
            >
              <thead>
                <tr>
                  <th className="col-rank">#</th>
                  <th className="col-pdv">PDV</th>
                  <th className="col-num">Receita</th>
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
                  const fluxo = fluxoMap.get(r.pdv)
                  return (
                    <tr key={r.pdv}>
                      <td className="col-rank">{i + 1}</td>
                      <td className="col-pdv">{r.pdv}</td>
                      <td className="col-num">{fBRLR(r.vf_atual)}</td>
                      <td className="col-var"><VarBadge v={r.vf_var} /></td>
                      <td className="col-num">{fInt(r.qb_atual)}</td>
                      <td className="col-var"><VarBadge v={r.qb_var} /></td>
                      <td className="col-num">{fBRLR(r.bm_atual)}</td>
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
      ))}

      {/* ── Potencial por Região ── */}
      {(() => {
        // TODO: BM_FLUXO deve ser lido da planilha Ação de Fluxo quando disponível
        const META_CONV = 0.28
        const BM_FLUXO  = 91.58

        const globalVF = mainRows.reduce((s, r) => s + r.vf_atual, 0)
        const globalQB = mainRows.reduce((s, r) => s + r.qb_atual, 0)
        const globalBM = globalQB > 0 ? globalVF / globalQB : 0

        const potRows = groups.map(({ label: lb, rows: groupRows }) => {
          const gapBM = groupRows
            .filter(r => r.bm_atual < globalBM)
            .reduce((s, r) => s + (globalBM - r.bm_atual) * r.qb_atual, 0)

          const gapFluxo = groupRows.reduce((s, r) => {
            const fl = fluxoMap.get(r.pdv)
            if (!fl) return s
            const faltou = fl.resgates * META_CONV - fl.conversoes
            return faltou > 0 ? s + faltou * BM_FLUXO : s
          }, 0)

          return { label: lb, lojas: groupRows.length, gapBM, gapFluxo, total: gapBM + gapFluxo }
        })

        const filteredPotRows = selectedPotLabels.length === 0
          ? potRows
          : potRows.filter(r => r.label && selectedPotLabels.includes(r.label.id))

        const totBM    = filteredPotRows.reduce((s, r) => s + r.gapBM,    0)
        const totFluxo = filteredPotRows.reduce((s, r) => s + r.gapFluxo, 0)
        const totTotal = filteredPotRows.reduce((s, r) => s + r.total,     0)

        // Per-store breakdown
        const lojaMap2 = new Map(groups.flatMap(({ label: lb, rows: groupRows }) =>
          groupRows.map(r => [r.pdv, lb] as [string, typeof lb])
        ))
        const storeRows = mainRows
          .map(r => {
            const fl = fluxoMap.get(r.pdv)
            const gapBM    = r.bm_atual < globalBM ? (globalBM - r.bm_atual) * r.qb_atual : 0
            const faltou   = fl ? fl.resgates * META_CONV - fl.conversoes : 0
            const gapFluxo = faltou > 0 ? faltou * BM_FLUXO : 0
            return { pdv: r.pdv, label: lojaMap2.get(r.pdv) ?? null, gapBM, gapFluxo, total: gapBM + gapFluxo }
          })
          .filter(r => r.total > 0 && (
            selectedPotLabels.length === 0 ||
            (r.label && selectedPotLabels.includes(r.label.id))
          ))
          .sort((a, b) => b.total - a.total)

        // Receita potencial por região
        const potencialRows = groups
          .filter(({ label: lb }) =>
            selectedPotLabels.length === 0 || (lb && selectedPotLabels.includes(lb.id))
          )
          .map(({ label: lb, rows: groupRows }) => {
            const pot = potRows.find(p => (p.label?.id ?? '__none__') === (lb?.id ?? '__none__'))
            const vf_ant   = groupRows.reduce((s, r) => s + r.vf_ant,   0)
            const vf_atual = groupRows.reduce((s, r) => s + r.vf_atual, 0)
            const gapBM    = pot?.gapBM    ?? 0
            const gapFluxo = pot?.gapFluxo ?? 0
            const potencial = vf_atual + gapBM + gapFluxo
            const var_atual    = vf_ant > 0 ? (vf_atual - vf_ant)  / vf_ant * 100 : 0
            const var_potencial = vf_ant > 0 ? (potencial - vf_ant) / vf_ant * 100 : 0
            return { label: lb, vf_ant, vf_atual, gapBM, gapFluxo, potencial, var_atual, var_potencial }
          })

        const totVfAnt     = potencialRows.reduce((s, r) => s + r.vf_ant,   0)
        const totVfAtual   = potencialRows.reduce((s, r) => s + r.vf_atual, 0)
        const totPotencial = potencialRows.reduce((s, r) => s + r.potencial, 0)
        const totVarAtual    = totVfAnt > 0 ? (totVfAtual   - totVfAnt) / totVfAnt * 100 : 0
        const totVarPotencial = totVfAnt > 0 ? (totPotencial - totVfAnt) / totVfAnt * 100 : 0

        return (
          <div className="potencial-card">
            <div className="potencial-card-header">
              <div>
                <h3 className="potencial-title">Potencial por Região</h3>
                <p className="potencial-sub">
                  GAP BM: lojas abaixo de {fBRLR(globalBM)} (média do grupo) ·
                  GAP Fluxo: lojas abaixo de {(META_CONV * 100).toFixed(0)}% de conversão
                </p>
              </div>
              <div className="potencial-total-badge">
                <span className="potencial-total-label">Potencial total</span>
                <span className="potencial-total-value">{fBRLR(totTotal)}</span>
              </div>
            </div>

            {/* Filtro de região */}
            {labels.length > 0 && (
              <div className="region-filter-bar" style={{ padding: '10px 16px', borderBottom: '1px solid var(--bg-border)', marginBottom: 0 }}>
                <span className="region-filter-label">Região</span>
                <button
                  className={`region-filter-btn${selectedPotLabels.length === 0 ? ' active' : ''}`}
                  onClick={() => setSelectedPotLabels([])}
                >Todas</button>
                {labels.map(lb => (
                  <button
                    key={lb.id}
                    className={`region-filter-btn${selectedPotLabels.includes(lb.id) ? ' active' : ''}`}
                    style={selectedPotLabels.includes(lb.id) ? { background: lb.color + '22', borderColor: lb.color, color: lb.color } as React.CSSProperties : undefined}
                    onClick={() => setSelectedPotLabels(prev => prev.includes(lb.id) ? prev.filter(x => x !== lb.id) : [...prev, lb.id])}
                  >{lb.name}</button>
                ))}
              </div>
            )}

            {/* Resumo por região */}
            <div className="potencial-section-label">Resumo por região</div>
            <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
              <table className="dash-table dash-table--potential">
                <thead>
                  <tr>
                    <th>Região</th>
                    <th className="col-num">Lojas</th>
                    <th className="col-num">GAP Boleto Médio</th>
                    <th className="col-num">GAP Ação de Fluxo</th>
                    <th className="col-num col-gap-head">Total Potencial</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPotRows.map(r => (
                    <tr key={r.label?.id ?? '__none__'}>
                      <td>
                        {r.label
                          ? <span className="label-chip" style={{ '--chip-color': r.label.color } as React.CSSProperties}>{r.label.name}</span>
                          : <span className="dash-muted">Sem região</span>}
                      </td>
                      <td className="col-num">{r.lojas}</td>
                      <td className="col-num col-neg-val">{r.gapBM > 0 ? fBRLR(r.gapBM) : <span className="dash-muted">—</span>}</td>
                      <td className="col-num col-neg-val">{r.gapFluxo > 0 ? fBRLR(r.gapFluxo) : <span className="dash-muted">—</span>}</td>
                      <td className="col-num col-gap-val">{fBRLR(r.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="gap-table-total">
                    <td colSpan={2} className="gap-total-label">
                      {selectedPotLabels.length > 0 ? 'Total filtrado' : 'Total geral'}
                    </td>
                    <td className="col-num col-neg-val">{fBRLR(totBM)}</td>
                    <td className="col-num col-neg-val">{fBRLR(totFluxo)}</td>
                    <td className="col-num col-gap-val">{fBRLR(totTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Detalhe por loja */}
            <div className="potencial-section-label" style={{ borderTop: '1px solid var(--bg-border)' }}>
              Detalhe por loja · {storeRows.length} loja{storeRows.length !== 1 ? 's' : ''} com potencial
              {selectedPotLabels.length > 0 && ' · filtrado por região'}
            </div>
            <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
              <table className="dash-table dash-table--potential">
                <thead>
                  <tr>
                    <th className="col-rank">#</th>
                    <th className="col-pdv">PDV</th>
                    <th>Região</th>
                    <th className="col-num">GAP Boleto Médio</th>
                    <th className="col-num">GAP Ação de Fluxo</th>
                    <th className="col-num col-gap-head">Total Potencial</th>
                  </tr>
                </thead>
                <tbody>
                  {storeRows.map((r, i) => (
                    <tr key={r.pdv}>
                      <td className="col-rank">{i + 1}</td>
                      <td className="col-pdv">{r.pdv}</td>
                      <td>
                        {r.label
                          ? <span className="label-chip" style={{ '--chip-color': r.label.color } as React.CSSProperties}>{r.label.name}</span>
                          : <span className="dash-muted">—</span>}
                      </td>
                      <td className="col-num col-neg-val">{r.gapBM > 0 ? fBRLR(r.gapBM) : <span className="dash-muted">—</span>}</td>
                      <td className="col-num col-neg-val">{r.gapFluxo > 0 ? fBRLR(r.gapFluxo) : <span className="dash-muted">—</span>}</td>
                      <td className="col-num col-gap-val">{fBRLR(r.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="gap-table-total">
                    <td colSpan={3} className="gap-total-label">
                      {selectedPotLabels.length > 0 ? 'Total filtrado' : 'Total'}
                    </td>
                    <td className="col-num col-neg-val">{fBRLR(storeRows.reduce((s, r) => s + r.gapBM,    0))}</td>
                    <td className="col-num col-neg-val">{fBRLR(storeRows.reduce((s, r) => s + r.gapFluxo, 0))}</td>
                    <td className="col-num col-gap-val">{fBRLR(storeRows.reduce((s, r) => s + r.total,    0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Receita Potencial */}
            <div className="potencial-section-label" style={{ borderTop: '1px solid var(--bg-border)' }}>
              Receita potencial — se todos os GAPs forem recuperados
            </div>
            <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
              <table className="dash-table dash-table--potential">
                <thead>
                  <tr>
                    <th>Região</th>
                    <th className="col-num">Receita Atual</th>
                    <th className="col-num">+ GAP BM</th>
                    <th className="col-num">+ GAP Fluxo</th>
                    <th className="col-num col-gap-head">Receita Potencial</th>
                    <th className="col-num">Var. LY Atual</th>
                    <th className="col-num">Var. LY Potencial</th>
                  </tr>
                </thead>
                <tbody>
                  {potencialRows.map(r => (
                    <tr key={r.label?.id ?? '__none__'}>
                      <td>
                        {r.label
                          ? <span className="label-chip" style={{ '--chip-color': r.label.color } as React.CSSProperties}>{r.label.name}</span>
                          : <span className="dash-muted">Sem região</span>}
                      </td>
                      <td className="col-num">{fBRLR(r.vf_atual)}</td>
                      <td className="col-num col-neg-val">{r.gapBM > 0 ? `+ ${fBRL(r.gapBM)}` : <span className="dash-muted">—</span>}</td>
                      <td className="col-num col-neg-val">{r.gapFluxo > 0 ? `+ ${fBRL(r.gapFluxo)}` : <span className="dash-muted">—</span>}</td>
                      <td className="col-num col-gap-val">{fBRLR(r.potencial)}</td>
                      <td className="col-num">
                        <span className={`var-badge${r.var_atual > 0.05 ? ' var-pos' : r.var_atual < -0.05 ? ' var-neg' : ''}`}>
                          {r.var_atual > 0 ? '+' : ''}{r.var_atual.toFixed(1).replace('.', ',')}%
                        </span>
                      </td>
                      <td className="col-num">
                        <span className={`var-badge${r.var_potencial > 0.05 ? ' var-pos' : r.var_potencial < -0.05 ? ' var-neg' : ''} potencial-var-highlight`}>
                          {r.var_potencial > 0 ? '+' : ''}{r.var_potencial.toFixed(1).replace('.', ',')}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="gap-table-total">
                    <td className="gap-total-label">{selectedPotLabels.length > 0 ? 'Total filtrado' : 'Total do grupo'}</td>
                    <td className="col-num">{fBRLR(totVfAtual)}</td>
                    <td className="col-num col-neg-val">+ {fBRL(potRows.filter(r => selectedPotLabels.length === 0 || (r.label && selectedPotLabels.includes(r.label.id))).reduce((s, r) => s + r.gapBM, 0))}</td>
                    <td className="col-num col-neg-val">+ {fBRL(potRows.filter(r => selectedPotLabels.length === 0 || (r.label && selectedPotLabels.includes(r.label.id))).reduce((s, r) => s + r.gapFluxo, 0))}</td>
                    <td className="col-num col-gap-val">{fBRLR(totPotencial)}</td>
                    <td className="col-num">
                      <span className={`var-badge${totVarAtual > 0.05 ? ' var-pos' : totVarAtual < -0.05 ? ' var-neg' : ''}`}>
                        {totVarAtual > 0 ? '+' : ''}{totVarAtual.toFixed(1).replace('.', ',')}%
                      </span>
                    </td>
                    <td className="col-num">
                      <span className={`var-badge${totVarPotencial > 0.05 ? ' var-pos' : totVarPotencial < -0.05 ? ' var-neg' : ''} potencial-var-highlight`}>
                        {totVarPotencial > 0 ? '+' : ''}{totVarPotencial.toFixed(1).replace('.', ',')}%
                      </span>
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

/* ── Lojas — Detalhe da Loja ─────────────────────────── */
function DetalhePage() {
  const { mainRows, fluxoRows, consultorRows, fluxoConsultorRows } = useData()
  const { lojas } = useLojas()
  const { labels } = useLabels()
  const [selectedPdv, setSelectedPdv] = useState<string>('')

  if (mainRows.length === 0) return <LojasEmptyState />

  const lojaMap  = useMemo(() => new Map(lojas.map(l => [l.id, l])), [lojas])
  const fluxoMap = useMemo(() => new Map(fluxoRows.map(r => [r.pdv, r])), [fluxoRows])

  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const activePdv = selectedPdv || mainRows[0]?.pdv || ''
  const storeMain = mainRows.find(r => r.pdv === activePdv)
  const storeFluxo = fluxoMap.get(activePdv)
  const storeLoja  = lojaMap.get(activePdv)

  const storeCons: (ConsultorRow & { fluxo?: { resgates: number; conversoes: number; conv_pct: number } })[] = useMemo(() => {
    const fcMap = new Map(fluxoConsultorRows.filter(r => r.pdv === activePdv).map(r => [r.consultor, r]))
    return consultorRows
      .filter(r => r.pdv === activePdv)
      .map(r => ({ ...r, fluxo: fcMap.get(r.consultor) }))
      .sort((a, b) => b.vf_atual - a.vf_atual)
  }, [consultorRows, fluxoConsultorRows, activePdv])

  const regionLabels = (storeLoja?.labels ?? []).map(lid => labels.find(l => l.id === lid)).filter(Boolean) as typeof labels

  function StoreOptionContent({ pdv, inline }: { pdv: string; inline?: boolean }) {
    const loja = lojaMap.get(pdv)
    const lbs  = (loja?.labels ?? []).map(lid => labels.find(l => l.id === lid)).filter(Boolean) as typeof labels
    return (
      <span className={`store-option-content${inline ? ' store-option-content--inline' : ''}`}>
        <span className="store-option-pdv">{pdv}</span>
        {loja?.apelido && <span className="store-option-apelido">{loja.apelido}</span>}
        {lbs.map(lb => (
          <span key={lb.id} className="label-chip label-chip--xs" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span>
        ))}
      </span>
    )
  }

  return (
    <div className="page-content">
      {/* Header + store picker */}
      <div className="page-title-row" style={{ alignItems: 'flex-start' }}>
        <div>
          <h2 className="page-title">Detalhe da Loja</h2>
          {regionLabels.length > 0 && (
            <div className="label-chips-group" style={{ marginTop: 4 }}>
              {regionLabels.map(lb => (
                <span key={lb.id} className="label-chip" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span>
              ))}
            </div>
          )}
        </div>
        <div className="store-picker" ref={pickerRef}>
          <span className="detalhe-selector-label">Loja</span>
          <button className="store-picker-btn" onClick={() => setPickerOpen(o => !o)}>
            <StoreOptionContent pdv={activePdv} inline />
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {pickerOpen && (
            <div className="store-picker-dropdown">
              {mainRows.map(r => (
                <button
                  key={r.pdv}
                  className={`store-picker-option${r.pdv === activePdv ? ' selected' : ''}`}
                  onClick={() => { setSelectedPdv(r.pdv); setPickerOpen(false) }}
                >
                  <StoreOptionContent pdv={r.pdv} />
                  {r.pdv === activePdv && (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <IndicadoresRef />

      {/* KPI cards da loja */}
      {storeMain && (
        <div className="kpi-row">
          <KpiCard label="Receita"      value={fBRLR(storeMain.vf_atual)} var={storeMain.vf_var} varNote="vs LY" />
          <KpiCard label="Qtd. Boletos" value={fInt(storeMain.qb_atual)}  var={storeMain.qb_var} varNote="vs LY" />
          <KpiCard label="Boleto Médio" value={fBRLR(storeMain.bm_atual)} var={storeMain.bm_var} varNote="vs LY" />
          <KpiCard label="Itens/Boleto" value={fDec(storeMain.iv_atual)}  var={storeMain.iv_var} varNote="vs LY" />
          <KpiCard label="Preço Médio"  value={fBRLR(storeMain.pm_atual)} var={storeMain.pm_var} varNote="vs LY" />
          <KpiCard label="Conv. Fluxo"  value={storeFluxo ? fPct(storeFluxo.conv_pct) : '—'} />
        </div>
      )}

      {/* Tabela de consultores */}
      <div className="detalhe-cons-header">
        <h3 className="detalhe-cons-title">Consultores</h3>
        <span className="detalhe-cons-count">{storeCons.length} consultor{storeCons.length !== 1 ? 'es' : ''}</span>
      </div>

      {storeCons.length === 0 ? (
        <div className="page-empty-state" style={{ padding: '32px 0' }}>
          <div className="page-empty-title" style={{ fontSize: 14 }}>Sem dados de consultores</div>
          <div className="page-empty-desc">Importe a planilha com a aba CONSULTOR para ver os resultados individuais.</div>
        </div>
      ) : (
        <>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th className="col-rank">#</th>
                  <th>Consultor</th>
                  <th className="col-num">Receita</th>
                  <th className="col-num">QB</th>
                  <th className="col-num">BM</th>
                  <th className="col-num">IV</th>
                  <th className="col-num">PM</th>
                  <th className="col-num">Conv.%</th>
                </tr>
              </thead>
              <tbody>
                {storeCons.map((c, i) => (
                  <tr key={c.consultor}>
                    <td className="col-rank">{i + 1}</td>
                    <td className="col-consultor">{c.consultor}</td>
                    <td className="col-num">{fBRLR(c.vf_atual)}</td>
                    <td className="col-num">{fInt(c.qb_atual)}</td>
                    <td className="col-num">{fBRLR(c.bm_atual)}</td>
                    <td className="col-num">{fDec(c.iv_atual)}</td>
                    <td className="col-num">{fBRLR(c.pm_atual)}</td>
                    <td className="col-num">
                      {c.fluxo ? fPct(c.fluxo.conv_pct) : <span className="dash-muted">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Considerações automáticas */}
          {(() => {
            const META_CONV = 0.28
            const BM_FLUXO  = 91.58

            // BM médio da loja calculado a partir dos consultores (ponderado por QB)
            const totalVFCons = storeCons.reduce((s, c) => s + c.vf_atual, 0)
            const totalQBCons = storeCons.reduce((s, c) => s + c.qb_atual, 0)
            const storeBM = totalQBCons > 0 ? totalVFCons / totalQBCons : (storeMain?.bm_atual ?? 0)

            type InsightType = 'warn' | 'danger' | 'positive'
            type Insight = { type: InsightType; consultor: string; points: string[] }
            const byConsultor = new Map<string, Insight>()

            function getOrCreate(consultor: string, type: InsightType): Insight {
              if (!byConsultor.has(consultor)) byConsultor.set(consultor, { type, consultor, points: [] })
              const ins = byConsultor.get(consultor)!
              // Eleva para danger se necessário
              if (type === 'danger' && ins.type !== 'danger') ins.type = 'danger'
              return ins
            }

            // GAP BM
            storeCons
              .filter(c => c.bm_atual < storeBM && c.qb_atual > 0)
              .map(c => ({ ...c, gap: (storeBM - c.bm_atual) * c.qb_atual }))
              .sort((a, b) => b.gap - a.gap)
              .forEach(c => {
                getOrCreate(c.consultor, 'warn').points.push(
                  `BM de ${fBRLR(c.bm_atual)} vs ${fBRLR(storeBM)} da loja — receita deixada na mesa: ${fBRLR(c.gap)}`
                )
              })

            // GAP Fluxo
            storeCons
              .filter(c => c.fluxo && c.fluxo.conv_pct < META_CONV && c.fluxo.resgates > 0)
              .map(c => {
                const faltou = c.fluxo!.resgates * META_CONV - c.fluxo!.conversoes
                return { ...c, faltou, gap: faltou * BM_FLUXO }
              })
              .sort((a, b) => b.gap - a.gap)
              .forEach(c => {
                getOrCreate(c.consultor, 'warn').points.push(
                  `Conversão de ${fPct(c.fluxo!.conv_pct)} (meta: ${(META_CONV*100).toFixed(0)}%) — faltaram ${Math.round(c.faltou)} clientes convertidos, potencial: ${fBRLR(c.gap)}`
                )
              })

            // IV abaixo da média da loja
            const avgIV = totalQBCons > 0 ? storeCons.reduce((s, c) => s + c.iv_atual * c.qb_atual, 0) / totalQBCons : 0
            storeCons
              .filter(c => avgIV > 0 && c.iv_atual < avgIV * 0.85)
              .forEach(c => {
                getOrCreate(c.consultor, 'warn').points.push(
                  `IV de ${fDec(c.iv_atual)} itens/boleto vs ${fDec(avgIV)} da loja — abaixo 15% da média`
                )
              })

            // PM abaixo da média da loja
            const avgPM = totalVFCons > 0 ? totalVFCons / storeCons.reduce((s, c) => s + c.iv_atual * c.qb_atual, 0) : 0
            storeCons
              .filter(c => avgPM > 0 && c.pm_atual < avgPM * 0.85)
              .forEach(c => {
                getOrCreate(c.consultor, 'warn').points.push(
                  `PM de ${fBRLR(c.pm_atual)} vs ${fBRLR(avgPM)} da loja — abaixo 15% da média`
                )
              })

            // Destaque positivo — melhor consultor
            if (storeCons.length > 0 && !byConsultor.has(storeCons[0].consultor)) {
              const top = storeCons[0]
              const share = storeMain && storeMain.vf_atual > 0 ? top.vf_atual / storeMain.vf_atual * 100 : 0
              getOrCreate(top.consultor, 'positive').points.push(
                `Maior receita da loja: ${fBRLR(top.vf_atual)} (${share.toFixed(1).replace('.', ',')}% do total)`
              )
              getOrCreate(top.consultor, 'positive').points.push(
                `BM: ${fBRLR(top.bm_atual)} · IV: ${fDec(top.iv_atual)} · PM: ${fBRLR(top.pm_atual)}`
              )
              if (top.fluxo) getOrCreate(top.consultor, 'positive').points.push(
                `Conversão: ${fPct(top.fluxo.conv_pct)}`
              )
            }

            const insights = Array.from(byConsultor.values())

            if (insights.length === 0) return null

            const iconMap = {
              warn:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
              danger:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
              positive: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
            }

            return (
              <div className="consideracoes-section">
                <h3 className="consideracoes-title">Considerações</h3>
                <div className="consideracoes-list">
                  {insights.map((ins, i) => (
                    <div key={i} className={`consideracao-card consideracao-card--${ins.type}`}>
                      <span className="consideracao-icon">{iconMap[ins.type]}</span>
                      <div style={{ flex: 1 }}>
                        <div className="consideracao-card-title">{ins.consultor}</div>
                        <ul className="consideracao-points">
                          {ins.points.map((p, j) => <li key={j}>{p}</li>)}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </>
      )}
    </div>
  )
}

/* ── Lojas — Consultores ─────────────────────────────── */
function ConsultoresPage() {
  const { consultorRows, fluxoConsultorRows } = useData()
  const { lojas } = useLojas()
  const { labels } = useLabels()
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [selectedOppLabels, setSelectedOppLabels] = useState<string[]>([])

  if (consultorRows.length === 0) return (
    <div className="page-empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <div className="page-empty-title">Dados de consultores não carregados</div>
      <div className="page-empty-desc">Importe a planilha Indicadores Principais com a aba CONSULTOR preenchida.</div>
    </div>
  )

  const lojaMap = useMemo(() => new Map(lojas.map(l => [l.id, l])), [lojas])

  // BM médio do grupo (todos os consultores)
  const groupVF = consultorRows.reduce((s, c) => s + c.vf_atual, 0)
  const groupQB = consultorRows.reduce((s, c) => s + c.qb_atual, 0)
  const groupBM = groupQB > 0 ? groupVF / groupQB : 0

  // QB médio por loja (média entre consultores daquela loja)
  const storeConsMap = useMemo(() => {
    const map = new Map<string, typeof consultorRows>()
    consultorRows.forEach(c => {
      if (!map.has(c.pdv)) map.set(c.pdv, [])
      map.get(c.pdv)!.push(c)
    })
    return map
  }, [consultorRows])

  const storeAvgQB = useMemo(() => {
    const map = new Map<string, number>()
    storeConsMap.forEach((cons, pdv) => {
      const avg = cons.reduce((s, c) => s + c.qb_atual, 0) / cons.length
      map.set(pdv, avg)
    })
    return map
  }, [storeConsMap])

  // Consultores Alto Volume / Baixo Ticket
  const alertRows = useMemo(() => {
    return consultorRows
      .filter(c => {
        const avgQB = storeAvgQB.get(c.pdv) ?? 0
        return c.qb_atual > avgQB && c.bm_atual < groupBM
      })
      .map(c => ({
        ...c,
        loja: lojaMap.get(c.pdv),
        avgQB: storeAvgQB.get(c.pdv) ?? 0,
        excessoQB: c.qb_atual - (storeAvgQB.get(c.pdv) ?? 0),
        gapBM: groupBM - c.bm_atual,
        gapReceita: (groupBM - c.bm_atual) * c.qb_atual,
      }))
      .filter(c => selectedLabels.length === 0 || selectedLabels.some(lid => (c.loja?.labels ?? []).includes(lid)))
      .sort((a, b) => b.gapReceita - a.gapReceita)
  }, [consultorRows, storeAvgQB, groupBM, lojaMap, selectedLabels])

  const totalGap = alertRows.reduce((s, r) => s + r.gapReceita, 0)

  // ── Consultores com oportunidade ──
  const fluxoConsMap = useMemo(() => {
    const map = new Map<string, FluxoConsultorRow>()
    fluxoConsultorRows.forEach(r => map.set(`${r.pdv}|${r.consultor}`, r))
    return map
  }, [fluxoConsultorRows])

  const totalQB = consultorRows.reduce((s, c) => s + c.qb_atual, 0)
  const groupIV = totalQB > 0 ? consultorRows.reduce((s, c) => s + c.iv_atual * c.qb_atual, 0) / totalQB : 0
  const groupPM = totalQB > 0 ? consultorRows.reduce((s, c) => s + c.pm_atual * c.qb_atual, 0) / totalQB : 0
  const totalResgates = fluxoConsultorRows.reduce((s, r) => s + r.resgates, 0)
  const groupConv = totalResgates > 0 ? fluxoConsultorRows.reduce((s, r) => s + r.conversoes, 0) / totalResgates * 100 : 0

  // TODO: sistema de pontuação ponderada

  const oppRows = useMemo(() => {
    return consultorRows
      .map(c => {
        const fluxo = fluxoConsMap.get(`${c.pdv}|${c.consultor}`)
        const rawConv = fluxo?.conv_pct ?? null
        // normaliza para escala 0-100 (arquivo pode entregar 0.28 ou 28)
        const conv = rawConv !== null ? (rawConv < 1 ? rawConv * 100 : rawConv) : null
        const hasConv = conv !== null && groupConv > 0

        const badCount = [
          c.bm_atual < groupBM,
          c.iv_atual < groupIV,
          c.pm_atual < groupPM,
          hasConv && conv! < groupConv,
        ].filter(Boolean).length

        return { ...c, loja: lojaMap.get(c.pdv), fluxo, conv, badCount, hasConv }
      })
      .filter(c => c.badCount > 0)
      .filter(c => selectedOppLabels.length === 0 || selectedOppLabels.some(lid => (c.loja?.labels ?? []).includes(lid)))
      .sort((a, b) => b.badCount - a.badCount)
  }, [consultorRows, fluxoConsMap, groupBM, groupIV, groupPM, groupConv, lojaMap, selectedOppLabels])

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Consultores</h2>
          <p className="page-subtitle">{consultorRows.length} consultores · {storeConsMap.size} lojas</p>
        </div>
      </div>
      <IndicadoresRef />

      {/* Filtro de região */}
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
              style={selectedLabels.includes(lb.id) ? { background: lb.color + '22', borderColor: lb.color, color: lb.color } as React.CSSProperties : undefined}
              onClick={() => setSelectedLabels(prev => prev.includes(lb.id) ? prev.filter(x => x !== lb.id) : [...prev, lb.id])}
            >{lb.name}</button>
          ))}
        </div>
      )}

      {/* Card da análise */}
      <div className="cons-alert-card">
        <div className="cons-alert-header">
          <div>
            <div className="cons-alert-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Atenção
            </div>
            <h3 className="cons-alert-title">Alto Volume / Baixo Ticket</h3>
            <p className="cons-alert-desc">
              Consultores com QB acima da média da loja e BM abaixo de {fBRLR(groupBM)} (média do grupo).
              Atendem mais clientes que os colegas mas com ticket menor, puxando o indicador da loja para baixo.
            </p>
          </div>
          <div className="cons-alert-total">
            <span className="cons-alert-total-label">Receita deixada na mesa</span>
            <span className="cons-alert-total-value">{fBRLR(totalGap)}</span>
            <span className="cons-alert-total-sub">{alertRows.length} consultor{alertRows.length !== 1 ? 'es' : ''}{selectedLabels.length > 0 ? ' · filtrado' : ''}</span>
          </div>
        </div>

        <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
          <table className="dash-table dash-table--potential">
            <thead>
              <tr>
                <th className="col-rank">#</th>
                <th>Consultor</th>
                <th className="col-pdv">PDV</th>
                <th>Região</th>
                <th className="col-num">QB</th>
                <th className="col-num">Média QB Loja</th>
                <th className="col-num">BM</th>
                <th className="col-num">BM Grupo</th>
                <th className="col-num">IV</th>
                <th className="col-num">PM</th>
                <th className="col-num col-gap-head">Receita na Mesa</th>
              </tr>
            </thead>
            <tbody>
              {alertRows.map((c, i) => (
                <tr key={`${c.pdv}-${c.consultor}`}>
                  <td className="col-rank">{i + 1}</td>
                  <td className="col-consultor">{c.consultor}</td>
                  <td className="col-pdv">{c.pdv}</td>
                  <td>
                    <div className="label-chips-group">
                      {(c.loja?.labels ?? []).map(lid => {
                        const lb = labels.find(x => x.id === lid)
                        return lb ? <span key={lid} className="label-chip" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span> : null
                      })}
                    </div>
                  </td>
                  <td className="col-num" style={{ color: '#059669', fontWeight: 700 }}>{fInt(c.qb_atual)}</td>
                  <td className="col-num col-muted-val">{fInt(Math.round(c.avgQB))}</td>
                  <td className="col-num" style={{ color: '#dc2626', fontWeight: 700 }}>{fBRLR(c.bm_atual)}</td>
                  <td className="col-num col-muted-val">{fBRLR(groupBM)}</td>
                  <td className="col-num">{fDec(c.iv_atual)}</td>
                  <td className="col-num">{fBRLR(c.pm_atual)}</td>
                  <td className="col-num col-gap-val">{fBRLR(c.gapReceita)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="gap-table-total">
                <td colSpan={10} className="gap-total-label">Total deixado na mesa</td>
                <td className="col-num col-gap-val">{fBRLR(totalGap)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Consultores com oportunidade ── */}
      <div className="cons-alert-card">
        <div className="cons-opp-header">
          <div>
            <div className="cons-opp-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Oportunidade
            </div>
            <h3 className="cons-alert-title">Consultores com Oportunidade</h3>
            <p className="cons-alert-desc">
              Consultores com mais indicadores abaixo da média do grupo.
              Referência: BM {fBRLR(groupBM)} · IV {fDec(groupIV)} · PM {fBRLR(groupPM)}{groupConv > 0 ? ` · AF ${Math.round(groupConv)}%` : ''}.
            </p>
          </div>
          <div className="cons-opp-total">
            <span className="cons-opp-total-label">Consultores em atenção</span>
            <span className="cons-opp-total-value">{oppRows.length}</span>
            <span className="cons-opp-total-sub">de {consultorRows.length} total{selectedOppLabels.length > 0 ? ' · filtrado' : ''}</span>
          </div>
        </div>

        {labels.length > 0 && (
          <div className="region-filter-bar" style={{ borderBottom: '1px solid var(--bg-border)', borderRadius: 0, padding: '10px 20px' }}>
            <span className="region-filter-label">Região</span>
            <button
              className={`region-filter-btn${selectedOppLabels.length === 0 ? ' active' : ''}`}
              onClick={() => setSelectedOppLabels([])}
            >Todas</button>
            {labels.map(lb => (
              <button
                key={lb.id}
                className={`region-filter-btn${selectedOppLabels.includes(lb.id) ? ' active' : ''}`}
                style={selectedOppLabels.includes(lb.id) ? { background: lb.color + '22', borderColor: lb.color, color: lb.color } as React.CSSProperties : undefined}
                onClick={() => setSelectedOppLabels(prev => prev.includes(lb.id) ? prev.filter(x => x !== lb.id) : [...prev, lb.id])}
              >{lb.name}</button>
            ))}
          </div>
        )}

        <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
          <table className="dash-table">
            <thead>
              <tr>
                <th className="col-rank">#</th>
                <th>Consultor</th>
                <th className="col-pdv">PDV</th>
                <th>Região</th>
                <th className="col-num">Indicadores</th>
                <th className="col-num">BM</th>
                <th className="col-num">IV</th>
                <th className="col-num">PM</th>
                {groupConv > 0 && <th className="col-num">Conv. %</th>}
              </tr>
            </thead>
            <tbody>
              {oppRows.map((c, i) => {
                const maxBad = c.hasConv ? 4 : 3
                const badClass = c.badCount >= maxBad ? 'score-badge--4' : c.badCount === maxBad - 1 ? 'score-badge--3' : c.badCount === maxBad - 2 ? 'score-badge--2' : 'score-badge--1'
                return (
                  <tr key={`${c.pdv}-${c.consultor}`}>
                    <td className="col-rank">{i + 1}</td>
                    <td className="col-consultor">{c.consultor}</td>
                    <td className="col-pdv">{c.pdv}</td>
                    <td>
                      <div className="label-chips-group">
                        {(c.loja?.labels ?? []).map(lid => {
                          const lb = labels.find(x => x.id === lid)
                          return lb ? <span key={lid} className="label-chip" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span> : null
                        })}
                      </div>
                    </td>
                    <td className="col-num">
                      <span className={`score-badge ${badClass}`}>{c.badCount}/{maxBad}</span>
                    </td>
                    <td className="col-num" style={c.bm_atual < groupBM ? { color: '#dc2626', fontWeight: 600 } : { color: '#059669' }}>{fBRLR(c.bm_atual)}</td>
                    <td className="col-num" style={c.iv_atual < groupIV ? { color: '#dc2626', fontWeight: 600 } : { color: '#059669' }}>{fDec(c.iv_atual)}</td>
                    <td className="col-num" style={c.pm_atual < groupPM ? { color: '#dc2626', fontWeight: 600 } : { color: '#059669' }}>{fBRLR(c.pm_atual)}</td>
                    {groupConv > 0 && (
                      <td className="col-num" style={c.hasConv && c.conv! < groupConv ? { color: '#dc2626', fontWeight: 600 } : c.hasConv ? { color: '#059669' } : { color: 'var(--text-muted)' }}>
                        {c.conv !== null ? `${Math.round(c.conv)}%` : '—'}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ── Dispersão ──────────────────────────────────────── */
function fDisp(dev: number | null): string {
  if (dev === null) return '—'
  return (dev >= 0 ? '+' : '') + fDec(dev, 1) + '%'
}

function DispersaoPage() {
  const { mainRows, mainTotal, fluxoRows, fluxoTotal, consultorRows, fluxoConsultorRows } = useData()
  const { lojas } = useLojas()
  const { labels } = useLabels()
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'total' | 'bm' | 'iv' | 'pm' | 'conv'>('total')
  const [selectedPdv, setSelectedPdv] = useState<string>('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  if (mainRows.length === 0) return (
    <div className="page-empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      <div className="page-empty-title">Dados não carregados</div>
      <div className="page-empty-desc">Importe a planilha Indicadores Principais para visualizar a dispersão.</div>
    </div>
  )

  const lojaMap = useMemo(() => new Map(lojas.map(l => [l.id, l])), [lojas])
  const fluxoMap = useMemo(() => new Map(fluxoRows.map(r => [r.pdv, r])), [fluxoRows])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const activePdv = selectedPdv || mainRows[0]?.pdv || ''

  // Dispersão por consultores da loja selecionada
  const fluxoConsMap = useMemo(() => {
    const map = new Map<string, FluxoConsultorRow>()
    fluxoConsultorRows.forEach(r => map.set(`${r.pdv}|${r.consultor}`, r))
    return map
  }, [fluxoConsultorRows])

  const storeCons = useMemo(() => consultorRows.filter(c => c.pdv === activePdv), [consultorRows, activePdv])

  const storeConsAvg = useMemo(() => {
    const totalQB = storeCons.reduce((s, c) => s + c.qb_atual, 0)
    const bm   = totalQB > 0 ? storeCons.reduce((s, c) => s + c.vf_atual, 0) / totalQB : 0
    const iv   = totalQB > 0 ? storeCons.reduce((s, c) => s + c.iv_atual * c.qb_atual, 0) / totalQB : 0
    const pm   = totalQB > 0 ? storeCons.reduce((s, c) => s + c.pm_atual * c.qb_atual, 0) / totalQB : 0
    const fluxoCons = storeCons.map(c => fluxoConsMap.get(`${c.pdv}|${c.consultor}`)).filter(Boolean) as FluxoConsultorRow[]
    const totalResg = fluxoCons.reduce((s, r) => s + r.resgates, 0)
    const af   = totalResg > 0 ? fluxoCons.reduce((s, r) => s + r.conversoes, 0) / totalResg * 100 : 0
    return { bm, iv, pm, af }
  }, [storeCons, fluxoConsMap])

  const consRows = useMemo(() => storeCons.map(c => {
    const fluxo = fluxoConsMap.get(`${c.pdv}|${c.consultor}`)
    const af = fluxo ? (fluxo.conv_pct < 1 ? fluxo.conv_pct * 100 : fluxo.conv_pct) : null
    const devBM = storeConsAvg.bm > 0 && c.bm_atual > 0 ? (c.bm_atual - storeConsAvg.bm) / storeConsAvg.bm * 100 : null
    const devIV = storeConsAvg.iv > 0 && c.iv_atual > 0 ? (c.iv_atual - storeConsAvg.iv) / storeConsAvg.iv * 100 : null
    const devPM = storeConsAvg.pm > 0 && c.pm_atual > 0 ? (c.pm_atual - storeConsAvg.pm) / storeConsAvg.pm * 100 : null
    const devAF = storeConsAvg.af > 0 && af !== null     ? (af - storeConsAvg.af) / storeConsAvg.af * 100 : null
    return { ...c, af, devBM, devIV, devPM, devAF }
  }), [storeCons, fluxoConsMap, storeConsAvg])

  function StoreOptionContent({ pdv, inline }: { pdv: string; inline?: boolean }) {
    const loja = lojaMap.get(pdv)
    const lbs  = (loja?.labels ?? []).map(lid => labels.find(l => l.id === lid)).filter(Boolean) as typeof labels
    return (
      <span className={`store-option-content${inline ? ' store-option-content--inline' : ''}`}>
        <span className="store-option-pdv">{pdv}</span>
        {loja?.apelido && <span className="store-option-apelido">{loja.apelido}</span>}
        {lbs.map(lb => (
          <span key={lb.id} className="label-chip label-chip--xs" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span>
        ))}
      </span>
    )
  }

  const groupBM   = mainTotal?.bm_atual  ?? 0
  const groupIV   = mainTotal?.iv_atual  ?? 0
  const groupPM   = mainTotal?.pm_atual  ?? 0
  // conv_pct vem como decimal (0.28) → normaliza para 0-100
  const groupConv = (fluxoTotal?.conv_pct ?? 0) * 100

  const rows = useMemo(() => {
    return mainRows
      .map(r => {
        const loja  = lojaMap.get(r.pdv)
        const fluxo = fluxoMap.get(r.pdv)
        const conv  = fluxo ? fluxo.conv_pct * 100 : null

        const devBM   = groupBM   > 0 && r.bm_atual > 0 ? (r.bm_atual  - groupBM)   / groupBM   * 100 : null
        const devIV   = groupIV   > 0 && r.iv_atual > 0 ? (r.iv_atual  - groupIV)   / groupIV   * 100 : null
        const devPM   = groupPM   > 0 && r.pm_atual > 0 ? (r.pm_atual  - groupPM)   / groupPM   * 100 : null
        const devConv = groupConv > 0 && conv !== null   ? (conv        - groupConv) / groupConv * 100 : null

        const devs = [devBM, devIV, devPM, devConv].filter((d): d is number => d !== null)
        const absDevAvg = devs.length > 0 ? devs.reduce((s, d) => s + Math.abs(d), 0) / devs.length : 0

        return { ...r, loja, conv, devBM, devIV, devPM, devConv, absDevAvg }
      })
      .filter(r => selectedLabels.length === 0 || selectedLabels.some(lid => (r.loja?.labels ?? []).includes(lid)))
      .sort((a, b) => {
        const key: Record<typeof sortBy, number> = {
          total: b.absDevAvg - a.absDevAvg,
          bm:    Math.abs(b.devBM   ?? 0) - Math.abs(a.devBM   ?? 0),
          iv:    Math.abs(b.devIV   ?? 0) - Math.abs(a.devIV   ?? 0),
          pm:    Math.abs(b.devPM   ?? 0) - Math.abs(a.devPM   ?? 0),
          conv:  Math.abs(b.devConv ?? 0) - Math.abs(a.devConv ?? 0),
        }
        return key[sortBy]
      })
  }, [mainRows, fluxoMap, lojaMap, groupBM, groupIV, groupPM, groupConv, selectedLabels, sortBy])

  const sortBtns: { key: typeof sortBy; label: string }[] = [
    { key: 'total', label: 'Maior desvio' },
    { key: 'bm',   label: 'BM' },
    { key: 'iv',   label: 'IV' },
    { key: 'pm',   label: 'PM' },
    { key: 'conv', label: 'Ação de Fluxo' },
  ]

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Dispersão de Indicadores</h2>
          <p className="page-subtitle">{rows.length} lojas · referência: BM {fBRLR(groupBM)} · IV {fDec(groupIV)} · PM {fBRLR(groupPM)}{groupConv > 0 ? ` · AF ${Math.round(groupConv)}%` : ''}</p>
        </div>
      </div>
      <IndicadoresRef />

      {labels.length > 0 && (
        <div className="region-filter-bar">
          <span className="region-filter-label">Região</span>
          <button className={`region-filter-btn${selectedLabels.length === 0 ? ' active' : ''}`} onClick={() => setSelectedLabels([])}>Todas</button>
          {labels.map(lb => (
            <button
              key={lb.id}
              className={`region-filter-btn${selectedLabels.includes(lb.id) ? ' active' : ''}`}
              style={selectedLabels.includes(lb.id) ? { background: lb.color + '22', borderColor: lb.color, color: lb.color } as React.CSSProperties : undefined}
              onClick={() => setSelectedLabels(prev => prev.includes(lb.id) ? prev.filter(x => x !== lb.id) : [...prev, lb.id])}
            >{lb.name}</button>
          ))}
        </div>
      )}

      <div className="dispersao-legend">
        <span className="dispersao-legend-label">Dispersão:</span>
        {([
          { range: '≤ 10%',    desc: 'Muito baixa', cls: 'dispersao-legend-item--green'  },
          { range: '10%–20%',  desc: 'Baixa',       cls: 'dispersao-legend-item--yellow' },
          { range: '20%–30%',  desc: 'Alta',         cls: 'dispersao-legend-item--orange' },
          { range: '> 30%',    desc: 'Muito alta',   cls: 'dispersao-legend-item--red'    },
        ] as const).map(item => (
          <span key={item.range} className={`dispersao-legend-item ${item.cls}`}>
            <span className="dispersao-legend-dot" />
            <span className="dispersao-legend-range">{item.range}</span>
            <span className="dispersao-legend-desc">{item.desc}</span>
          </span>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="dispersao-toolbar">
          <span className="dispersao-sort-label">Ordenar por desvio em:</span>
          <div className="dispersao-sort-btns">
            {sortBtns.map(b => (
              <button key={b.key} className={`ranking-metric-btn${sortBy === b.key ? ' active' : ''}`} onClick={() => setSortBy(b.key)}>{b.label}</button>
            ))}
          </div>
        </div>

        <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
          <table className="dash-table dispersao-table">
            <thead>
              <tr>
                <th rowSpan={2} className="col-rank">#</th>
                <th rowSpan={2}>Loja</th>
                <th rowSpan={2}>Região</th>
                <th colSpan={2} className="col-group-head col-group-head--blue">Boleto Médio</th>
                <th colSpan={2} className="col-group-head col-group-head--green">Itens por Venda</th>
                <th colSpan={2} className="col-group-head col-group-head--purple">Preço Médio</th>
                {groupConv > 0 && <th colSpan={2} className="col-group-head col-group-head--amber">Ação de Fluxo</th>}
              </tr>
              <tr>
                <th className="col-sub-head col-sub-head--blue">Resultado</th>
                <th className="col-sub-head col-sub-disp col-sub-head--blue">Dispersão</th>
                <th className="col-sub-head col-sub-head--green">Resultado</th>
                <th className="col-sub-head col-sub-disp col-sub-head--green">Dispersão</th>
                <th className="col-sub-head col-sub-head--purple">Resultado</th>
                <th className="col-sub-head col-sub-disp col-sub-head--purple">Dispersão</th>
                {groupConv > 0 && <><th className="col-sub-head col-sub-head--amber">Resultado</th><th className="col-sub-head col-sub-disp col-sub-head--amber">Dispersão</th></>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.pdv}>
                  <td className="col-rank">{i + 1}</td>
                  <td>
                    <div className="col-pdv-name">
                      <span className="col-pdv">{r.pdv}</span>
                      {r.loja?.apelido && <span className="col-apelido">{r.loja.apelido}</span>}
                    </div>
                  </td>
                  <td>
                    <div className="label-chips-group">
                      {(r.loja?.labels ?? []).map(lid => {
                        const lb = labels.find(x => x.id === lid)
                        return lb ? <span key={lid} className="label-chip" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span> : null
                      })}
                    </div>
                  </td>
                  <td className="col-num">{r.bm_atual > 0 ? fBRLR(r.bm_atual) : <span className="dev-na">—</span>}</td>
                  <td className="col-num col-disp" style={{ color: r.devBM !== null ? (r.devBM >= 0 ? '#059669' : '#dc2626') : undefined }}>{fDisp(r.devBM)}</td>
                  <td className="col-num">{r.iv_atual > 0 ? fDec(r.iv_atual) : <span className="dev-na">—</span>}</td>
                  <td className="col-num col-disp" style={{ color: r.devIV !== null ? (r.devIV >= 0 ? '#059669' : '#dc2626') : undefined }}>{fDisp(r.devIV)}</td>
                  <td className="col-num">{r.pm_atual > 0 ? fBRLR(r.pm_atual) : <span className="dev-na">—</span>}</td>
                  <td className="col-num col-disp" style={{ color: r.devPM !== null ? (r.devPM >= 0 ? '#059669' : '#dc2626') : undefined }}>{fDisp(r.devPM)}</td>
                  {groupConv > 0 && <>
                    <td className="col-num">{r.conv !== null ? `${Math.round(r.conv)}%` : <span className="dev-na">—</span>}</td>
                    <td className="col-num col-disp" style={{ color: r.devConv !== null ? (r.devConv >= 0 ? '#059669' : '#dc2626') : undefined }}>{fDisp(r.devConv)}</td>
                  </>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Dispersão por consultores da loja ── */}
      {consultorRows.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header com picker */}
          <div className="dispersao-cons-header">
            <div>
              <h3 className="dispersao-cons-title">Dispersão por Consultores</h3>
              <p className="dispersao-cons-sub">
                Desvio de cada consultor em relação à média da loja · BM {fBRLR(storeConsAvg.bm)} · IV {fDec(storeConsAvg.iv)} · PM {fBRLR(storeConsAvg.pm)}{storeConsAvg.af > 0 ? ` · AF ${Math.round(storeConsAvg.af)}%` : ''}
              </p>
            </div>
            <div className="store-picker" ref={pickerRef}>
              <span className="detalhe-selector-label">Loja</span>
              <button className="store-picker-btn" onClick={() => setPickerOpen(o => !o)}>
                <StoreOptionContent pdv={activePdv} inline />
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {pickerOpen && (
                <div className="store-picker-dropdown">
                  {mainRows.map(r => (
                    <button
                      key={r.pdv}
                      className={`store-picker-option${r.pdv === activePdv ? ' selected' : ''}`}
                      onClick={() => { setSelectedPdv(r.pdv); setPickerOpen(false) }}
                    >
                      <StoreOptionContent pdv={r.pdv} />
                      {r.pdv === activePdv && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {consRows.length === 0 ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              Nenhum dado de consultores para esta loja.
            </div>
          ) : (
            <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
              <table className="dash-table dispersao-table">
                <thead>
                  <tr>
                    <th rowSpan={2} className="col-rank">#</th>
                    <th rowSpan={2}>Consultor</th>
                    <th colSpan={2} className="col-group-head col-group-head--blue">Boleto Médio</th>
                    <th colSpan={2} className="col-group-head col-group-head--green">Itens por Venda</th>
                    <th colSpan={2} className="col-group-head col-group-head--purple">Preço Médio</th>
                    {storeConsAvg.af > 0 && <th colSpan={2} className="col-group-head col-group-head--amber">Ação de Fluxo</th>}
                  </tr>
                  <tr>
                    <th className="col-sub-head col-sub-head--blue">Resultado</th>
                    <th className="col-sub-head col-sub-disp col-sub-head--blue">Dispersão</th>
                    <th className="col-sub-head col-sub-head--green">Resultado</th>
                    <th className="col-sub-head col-sub-disp col-sub-head--green">Dispersão</th>
                    <th className="col-sub-head col-sub-head--purple">Resultado</th>
                    <th className="col-sub-head col-sub-disp col-sub-head--purple">Dispersão</th>
                    {storeConsAvg.af > 0 && <><th className="col-sub-head col-sub-head--amber">Resultado</th><th className="col-sub-head col-sub-disp col-sub-head--amber">Dispersão</th></>}
                  </tr>
                </thead>
                <tbody>
                  {consRows.map((c, i) => (
                    <tr key={c.consultor}>
                      <td className="col-rank">{i + 1}</td>
                      <td className="col-consultor">{c.consultor}</td>
                      <td className="col-num">{c.bm_atual > 0 ? fBRLR(c.bm_atual) : <span className="dev-na">—</span>}</td>
                      <td className="col-num col-disp" style={{ color: c.devBM !== null ? (c.devBM >= 0 ? '#059669' : '#dc2626') : undefined }}>{fDisp(c.devBM)}</td>
                      <td className="col-num">{c.iv_atual > 0 ? fDec(c.iv_atual) : <span className="dev-na">—</span>}</td>
                      <td className="col-num col-disp" style={{ color: c.devIV !== null ? (c.devIV >= 0 ? '#059669' : '#dc2626') : undefined }}>{fDisp(c.devIV)}</td>
                      <td className="col-num">{c.pm_atual > 0 ? fBRLR(c.pm_atual) : <span className="dev-na">—</span>}</td>
                      <td className="col-num col-disp" style={{ color: c.devPM !== null ? (c.devPM >= 0 ? '#059669' : '#dc2626') : undefined }}>{fDisp(c.devPM)}</td>
                      {storeConsAvg.af > 0 && <>
                        <td className="col-num">{c.af !== null ? `${Math.round(c.af)}%` : <span className="dev-na">—</span>}</td>
                        <td className="col-num col-disp" style={{ color: c.devAF !== null ? (c.devAF >= 0 ? '#059669' : '#dc2626') : undefined }}>{fDisp(c.devAF)}</td>
                      </>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── IAF — Ação de Fluxo ────────────────────────────── */
function IafFluxoPage() {
  const { fluxoRows, fluxoConsultorRows, mainTotal, cpData } = useData()
  const { lojas } = useLojas()
  const { labels } = useLabels()
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [selectedPdv, setSelectedPdv] = useState<string>('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  if (fluxoRows.length === 0) return (
    <div className="page-empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
      <div className="page-empty-title">Dados não carregados</div>
      <div className="page-empty-desc">Importe a planilha Ação de Fluxo para visualizar as oportunidades.</div>
    </div>
  )

  const lojaMap = useMemo(() => new Map(lojas.map(l => [l.id, l])), [lojas])
  const groupBM = cpData?.bm_valor ?? mainTotal?.bm_atual ?? 0
  const TARGET = 28

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const activePdv = selectedPdv || fluxoRows[0]?.pdv || ''

  function calcGap(resgates: number, conversoes: number) {
    const gapConv = Math.max(0, resgates * (TARGET / 100) - conversoes)
    return { gapConv, gapReceita: gapConv * groupBM }
  }
  function normConv(v: number) { return v < 1 ? v * 100 : v }

  // Lojas enriquecidas
  const storeRows = useMemo(() => fluxoRows.map(r => {
    const loja = lojaMap.get(r.pdv)
    const conv = normConv(r.conv_pct)
    const { gapConv, gapReceita } = calcGap(r.resgates, r.conversoes)
    return { ...r, loja, conv, gapConv, gapReceita }
  }), [fluxoRows, lojaMap, groupBM])

  // Resumo por região
  const regionGroups = useMemo(() => {
    if (labels.length === 0) return []
    return labels
      .filter(lb => selectedLabels.length === 0 || selectedLabels.includes(lb.id))
      .map(lb => {
        const rows = storeRows.filter(r => (r.loja?.labels ?? []).includes(lb.id))
        if (rows.length === 0) return null
        const totResg = rows.reduce((s, r) => s + r.resgates, 0)
        const totConv = rows.reduce((s, r) => s + r.conversoes, 0)
        const totGapConv = rows.reduce((s, r) => s + r.gapConv, 0)
        const totGapReceita = rows.reduce((s, r) => s + r.gapReceita, 0)
        const conv = totResg > 0 ? totConv / totResg * 100 : 0
        return { label: lb, totResg, totConv, conv, totGapConv, totGapReceita }
      })
      .filter(Boolean) as { label: typeof labels[0]; totResg: number; totConv: number; conv: number; totGapConv: number; totGapReceita: number }[]
  }, [labels, storeRows, selectedLabels])

  // Lojas filtradas
  const filteredStores = useMemo(() =>
    storeRows
      .filter(r => selectedLabels.length === 0 || selectedLabels.some(lid => (r.loja?.labels ?? []).includes(lid)))
      .sort((a, b) => b.gapReceita - a.gapReceita)
  , [storeRows, selectedLabels])

  const totalResg     = filteredStores.reduce((s, r) => s + r.resgates,   0)
  const totalConv     = filteredStores.reduce((s, r) => s + r.conversoes, 0)
  const totalGapConv  = filteredStores.reduce((s, r) => s + r.gapConv,    0)
  const totalGapRec   = filteredStores.reduce((s, r) => s + r.gapReceita, 0)
  const totalConvPct  = totalResg > 0 ? totalConv / totalResg * 100 : 0

  // 1. Pareto — concentração do GAP
  const paretoRows = useMemo(() => {
    let cum = 0
    return filteredStores
      .filter(r => r.gapReceita > 0)
      .map(r => { cum += r.gapReceita; return { ...r, cumPct: totalGapRec > 0 ? cum / totalGapRec * 100 : 0 } })
  }, [filteredStores, totalGapRec])

  // 2. Lojas que atingem a meta
  const metaStores = useMemo(() =>
    filteredStores.filter(r => r.conv >= TARGET).sort((a, b) => b.conv - a.conv)
  , [filteredStores])

  // 3. Ranking global de consultores por conv%
  const consRanking = useMemo(() =>
    fluxoConsultorRows
      .map(c => { const loja = lojaMap.get(c.pdv); return { ...c, conv: normConv(c.conv_pct), loja } })
      .filter(c => selectedLabels.length === 0 || selectedLabels.some(lid => (c.loja?.labels ?? []).includes(lid)))
      .sort((a, b) => b.conv - a.conv)
  , [fluxoConsultorRows, lojaMap, selectedLabels])

  // Consultores da loja selecionada
  const consRows = useMemo(() => {
    return fluxoConsultorRows
      .filter(c => c.pdv === activePdv)
      .map(c => {
        const conv = normConv(c.conv_pct)
        const { gapConv, gapReceita } = calcGap(c.resgates, c.conversoes)
        return { ...c, conv, gapConv, gapReceita }
      })
      .sort((a, b) => b.gapReceita - a.gapReceita)
  }, [fluxoConsultorRows, activePdv, groupBM])

  function StoreOptionContent({ pdv, inline }: { pdv: string; inline?: boolean }) {
    const loja = lojaMap.get(pdv)
    const lbs  = (loja?.labels ?? []).map(lid => labels.find(l => l.id === lid)).filter(Boolean) as typeof labels
    return (
      <span className={`store-option-content${inline ? ' store-option-content--inline' : ''}`}>
        <span className="store-option-pdv">{pdv}</span>
        {loja?.apelido && <span className="store-option-apelido">{loja.apelido}</span>}
        {lbs.map(lb => <span key={lb.id} className="label-chip label-chip--xs" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span>)}
      </span>
    )
  }

  function ConvCell({ conv, gapConv }: { conv: number; gapConv: number }) {
    const ok = conv >= TARGET
    return (
      <td className="col-num" style={{ color: ok ? '#059669' : '#dc2626', fontWeight: 600 }}>
        {Math.round(conv)}%
        {!ok && <span className="fluxo-conv-gap"> −{fInt(Math.round(gapConv))}</span>}
      </td>
    )
  }

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Ação de Fluxo</h2>
          <p className="page-subtitle">Meta de conversão: {TARGET}% · BM referência: {fBRLR(groupBM)}</p>
        </div>
      </div>
      <IndicadoresRef />

      {/* Filtro */}
      {labels.length > 0 && (
        <div className="region-filter-bar">
          <span className="region-filter-label">Região</span>
          <button className={`region-filter-btn${selectedLabels.length === 0 ? ' active' : ''}`} onClick={() => setSelectedLabels([])}>Todas</button>
          {labels.map(lb => (
            <button key={lb.id}
              className={`region-filter-btn${selectedLabels.includes(lb.id) ? ' active' : ''}`}
              style={selectedLabels.includes(lb.id) ? { background: lb.color + '22', borderColor: lb.color, color: lb.color } as React.CSSProperties : undefined}
              onClick={() => setSelectedLabels(prev => prev.includes(lb.id) ? prev.filter(x => x !== lb.id) : [...prev, lb.id])}
            >{lb.name}</button>
          ))}
        </div>
      )}

      {/* Resumo por região */}
      {regionGroups.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="fluxo-card-header">
            <h3 className="fluxo-card-title">Resumo por Região</h3>
            <span className="fluxo-gap-total">{fBRLR(regionGroups.reduce((s, g) => s + g.totGapReceita, 0))} deixados na mesa</span>
          </div>
          <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
            <table className="dash-table dash-table--potential">
              <thead>
                <tr>
                  <th>Região</th>
                  <th className="col-num">Resgates</th>
                  <th className="col-num">Conversões</th>
                  <th className="col-num">Conv%</th>
                  <th className="col-num">GAP Conv.</th>
                  <th className="col-num col-gap-head">GAP Receita</th>
                </tr>
              </thead>
              <tbody>
                {regionGroups.map(g => (
                  <tr key={g.label.id}>
                    <td><span className="label-chip" style={{ '--chip-color': g.label.color } as React.CSSProperties}>{g.label.name}</span></td>
                    <td className="col-num">{fInt(g.totResg)}</td>
                    <td className="col-num">{fInt(g.totConv)}</td>
                    <td className="col-num" style={{ color: g.conv >= TARGET ? '#059669' : '#dc2626', fontWeight: 600 }}>{Math.round(g.conv)}%</td>
                    <td className="col-num">{g.totGapConv > 0 ? fInt(Math.round(g.totGapConv)) : <span className="dash-muted">—</span>}</td>
                    <td className="col-num col-gap-val">{g.totGapReceita > 0 ? fBRLR(g.totGapReceita) : <span className="dash-muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detalhe por loja */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="fluxo-card-header">
          <h3 className="fluxo-card-title">Detalhe por Loja</h3>
          <span className="fluxo-gap-total">{fBRLR(totalGapRec)} deixados na mesa</span>
        </div>
        <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
          <table className="dash-table">
            <thead>
              <tr>
                <th className="col-rank">#</th>
                <th>Loja</th>
                <th>Região</th>
                <th className="col-num">Resgates</th>
                <th className="col-num">Conversões</th>
                <th className="col-num">Conv%</th>
                <th className="col-num">GAP Conv.</th>
                <th className="col-num col-gap-head">GAP Receita</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.map((r, i) => (
                <tr key={r.pdv}>
                  <td className="col-rank">{i + 1}</td>
                  <td>
                    <div className="col-pdv-name">
                      <span className="col-pdv">{r.pdv}</span>
                      {r.loja?.apelido && <span className="col-apelido">{r.loja.apelido}</span>}
                    </div>
                  </td>
                  <td>
                    <div className="label-chips-group">
                      {(r.loja?.labels ?? []).map(lid => {
                        const lb = labels.find(x => x.id === lid)
                        return lb ? <span key={lid} className="label-chip" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span> : null
                      })}
                    </div>
                  </td>
                  <td className="col-num">{fInt(r.resgates)}</td>
                  <td className="col-num">{fInt(r.conversoes)}</td>
                  <ConvCell conv={r.conv} gapConv={r.gapConv} />
                  <td className="col-num">{r.gapConv > 0 ? fInt(Math.round(r.gapConv)) : <span className="dash-muted">—</span>}</td>
                  <td className="col-num col-gap-val">{r.gapReceita > 0 ? fBRLR(r.gapReceita) : <span className="dash-muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="gap-table-total">
                <td colSpan={3} className="gap-total-label">Total</td>
                <td className="col-num">{fInt(totalResg)}</td>
                <td className="col-num">{fInt(totalConv)}</td>
                <td className="col-num" style={{ color: totalConvPct >= TARGET ? '#059669' : '#dc2626', fontWeight: 600 }}>{Math.round(totalConvPct)}%</td>
                <td className="col-num">{fInt(Math.round(totalGapConv))}</td>
                <td className="col-num col-gap-val">{fBRLR(totalGapRec)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 1. Pareto — concentração do GAP */}
      {paretoRows.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="fluxo-card-header">
            <div>
              <h3 className="fluxo-card-title">Concentração do GAP</h3>
              <p className="dispersao-cons-sub">
                {(() => {
                  const idx = paretoRows.findIndex(r => r.cumPct >= 80)
                  const n = idx >= 0 ? idx + 1 : paretoRows.length
                  return `${n} loja${n !== 1 ? 's' : ''} concentram ${Math.round(paretoRows[n - 1]?.cumPct ?? 0)}% do GAP total`
                })()}
              </p>
            </div>
            <span className="fluxo-gap-total">{fBRLR(totalGapRec)} total</span>
          </div>
          <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th className="col-rank">#</th>
                  <th>Loja</th>
                  <th>Região</th>
                  <th className="col-num col-gap-head">GAP Receita</th>
                  <th className="col-num">% do Total</th>
                </tr>
              </thead>
              <tbody>
                {paretoRows.map((r, i) => (
                  <tr key={r.pdv}>
                    <td className="col-rank">{i + 1}</td>
                    <td>
                      <div className="col-pdv-name">
                        <span className="col-pdv">{r.pdv}</span>
                        {r.loja?.apelido && <span className="col-apelido">{r.loja.apelido}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="label-chips-group">
                        {(r.loja?.labels ?? []).map(lid => { const lb = labels.find(x => x.id === lid); return lb ? <span key={lid} className="label-chip" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span> : null })}
                      </div>
                    </td>
                    <td className="col-num col-gap-val">{fBRLR(r.gapReceita)}</td>
                    <td className="col-num">{fDec(totalGapRec > 0 ? r.gapReceita / totalGapRec * 100 : 0, 1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Lojas que atingem a meta */}
      {metaStores.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="fluxo-card-header">
            <div>
              <h3 className="fluxo-card-title" style={{ color: '#059669' }}>Lojas na Meta ≥ {TARGET}%</h3>
              <p className="dispersao-cons-sub">Benchmarks internos — {metaStores.length} loja{metaStores.length !== 1 ? 's' : ''} atingindo ou superando a meta</p>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#059669', background: '#d1fae5', borderRadius: 8, padding: '3px 10px' }}>
              {Math.round(metaStores.reduce((s, r) => s + r.conv, 0) / metaStores.length)}% conv. média
            </span>
          </div>
          <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th className="col-rank">#</th>
                  <th>Loja</th>
                  <th>Região</th>
                  <th className="col-num">Resgates</th>
                  <th className="col-num">Conversões</th>
                  <th className="col-num">Conv%</th>
                  <th className="col-num">Acima da meta</th>
                </tr>
              </thead>
              <tbody>
                {metaStores.map((r, i) => (
                  <tr key={r.pdv}>
                    <td className="col-rank">{i + 1}</td>
                    <td>
                      <div className="col-pdv-name">
                        <span className="col-pdv">{r.pdv}</span>
                        {r.loja?.apelido && <span className="col-apelido">{r.loja.apelido}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="label-chips-group">
                        {(r.loja?.labels ?? []).map(lid => { const lb = labels.find(x => x.id === lid); return lb ? <span key={lid} className="label-chip" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span> : null })}
                      </div>
                    </td>
                    <td className="col-num">{fInt(r.resgates)}</td>
                    <td className="col-num">{fInt(r.conversoes)}</td>
                    <td className="col-num" style={{ color: '#059669', fontWeight: 700 }}>{Math.round(r.conv)}%</td>
                    <td className="col-num" style={{ color: '#059669', fontWeight: 600 }}>+{fDec(r.conv - TARGET, 1)}pp</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Ranking global de consultores */}
      {consRanking.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="fluxo-card-header">
            <h3 className="fluxo-card-title">Ranking de Consultores por Conversão</h3>
            <span className="dispersao-cons-sub">{consRanking.length} consultores · meta {TARGET}%</span>
          </div>
          <div className="fluxo-ranking-cons-wrap">
            <div>
              <div className="fluxo-ranking-cons-title fluxo-ranking-cons-title--top">Top conversores</div>
              <table className="dash-table">
                <thead><tr><th className="col-rank">#</th><th>Consultor</th><th className="col-pdv">PDV</th><th className="col-num">Conv%</th></tr></thead>
                <tbody>
                  {consRanking.slice(0, 10).map((c, i) => (
                    <tr key={`${c.pdv}-${c.consultor}`}>
                      <td className="col-rank">{i + 1}</td>
                      <td className="col-consultor">{c.consultor}</td>
                      <td className="col-pdv">{c.pdv}</td>
                      <td className="col-num" style={{ color: '#059669', fontWeight: 700 }}>{Math.round(c.conv)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <div className="fluxo-ranking-cons-title fluxo-ranking-cons-title--bottom">Precisam de atenção</div>
              <table className="dash-table">
                <thead><tr><th className="col-rank">#</th><th>Consultor</th><th className="col-pdv">PDV</th><th className="col-num">Conv%</th></tr></thead>
                <tbody>
                  {consRanking.slice(-10).reverse().map((c, i) => (
                    <tr key={`${c.pdv}-${c.consultor}`}>
                      <td className="col-rank">{i + 1}</td>
                      <td className="col-consultor">{c.consultor}</td>
                      <td className="col-pdv">{c.pdv}</td>
                      <td className="col-num" style={{ color: c.conv >= TARGET ? '#059669' : '#dc2626', fontWeight: 700 }}>{Math.round(c.conv)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Consultores por loja */}
      {fluxoConsultorRows.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="dispersao-cons-header">
            <div>
              <h3 className="dispersao-cons-title">Consultores por Loja</h3>
              <p className="dispersao-cons-sub">Oportunidade por consultor · meta {TARGET}% de conversão</p>
            </div>
            <div className="store-picker" ref={pickerRef}>
              <span className="detalhe-selector-label">Loja</span>
              <button className="store-picker-btn" onClick={() => setPickerOpen(o => !o)}>
                <StoreOptionContent pdv={activePdv} inline />
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {pickerOpen && (
                <div className="store-picker-dropdown">
                  {fluxoRows.map(r => (
                    <button key={r.pdv}
                      className={`store-picker-option${r.pdv === activePdv ? ' selected' : ''}`}
                      onClick={() => { setSelectedPdv(r.pdv); setPickerOpen(false) }}
                    >
                      <StoreOptionContent pdv={r.pdv} />
                      {r.pdv === activePdv && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {consRows.length === 0 ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Nenhum dado de consultores para esta loja.</div>
          ) : (
            <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th className="col-rank">#</th>
                    <th>Consultor</th>
                    <th className="col-num">Resgates</th>
                    <th className="col-num">Conversões</th>
                    <th className="col-num">Conv%</th>
                    <th className="col-num">GAP Conv.</th>
                    <th className="col-num col-gap-head">GAP Receita</th>
                  </tr>
                </thead>
                <tbody>
                  {consRows.map((c, i) => (
                    <tr key={c.consultor}>
                      <td className="col-rank">{i + 1}</td>
                      <td className="col-consultor">{c.consultor}</td>
                      <td className="col-num">{fInt(c.resgates)}</td>
                      <td className="col-num">{fInt(c.conversoes)}</td>
                      <ConvCell conv={c.conv} gapConv={c.gapConv} />
                      <td className="col-num">{c.gapConv > 0 ? fInt(Math.round(c.gapConv)) : <span className="dash-muted">—</span>}</td>
                      <td className="col-num col-gap-val">{c.gapReceita > 0 ? fBRLR(c.gapReceita) : <span className="dash-muted">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="gap-table-total">
                    <td colSpan={4} className="gap-total-label">Total loja · {activePdv}</td>
                    <td className="col-num" style={{ color: (() => { const r = fluxoRows.find(r => r.pdv === activePdv); return r && normConv(r.conv_pct) >= TARGET ? '#059669' : '#dc2626' })(), fontWeight: 600 }}>
                      {(() => { const r = fluxoRows.find(r => r.pdv === activePdv); return r ? `${Math.round(normConv(r.conv_pct))}%` : '—' })()}
                    </td>
                    <td className="col-num">{fInt(Math.round(consRows.reduce((s, c) => s + c.gapConv, 0)))}</td>
                    <td className="col-num col-gap-val">{fBRLR(consRows.reduce((s, c) => s + c.gapReceita, 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── IAF — ID do Cliente ───────────────────────────── */
function IDClientePage() {
  const { idClienteRows, idClienteConsultorRows } = useData()
  const { lojas } = useLojas()
  const { labels } = useLabels()
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [selectedPdv, setSelectedPdv] = useState<string>('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const { openImport } = useFileStatus()

  const TARGET_CPF = 80

  if (idClienteRows.length === 0) return (
    <div className="page-empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="7.5" cy="12" r="2.5"/><path d="M13 10h5M13 14h5"/>
      </svg>
      <div className="page-empty-title">ID do Cliente</div>
      <div className="page-empty-desc">Importe a planilha de ID do Cliente para visualizar os dados.</div>
      <button className="page-empty-btn" onClick={openImport}>Importar planilha</button>
    </div>
  )

  const lojaMap = useMemo(() => new Map(lojas.map(l => [l.id, l])), [lojas])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const activePdv = selectedPdv || idClienteRows[0]?.pdv || ''

  const storeRows = useMemo(() => idClienteRows.map(r => {
    const loja = lojaMap.get(r.pdv)
    return { ...r, loja, pctCpfPct: r.pct_cpf_atual * 100, pctBolPct: r.pct_boletos_validos_atual * 100 }
  }), [idClienteRows, lojaMap])

  const filteredRows = useMemo(() =>
    storeRows.filter(r => selectedLabels.length === 0 || selectedLabels.some(lid => (r.loja?.labels ?? []).includes(lid)))
  , [storeRows, selectedLabels])

  const totalAtendId    = filteredRows.reduce((s, r) => s + r.atend_id_atual, 0)
  const totalAtendCpf   = filteredRows.reduce((s, r) => s + r.atend_cpf_atual, 0)
  const totalUsoIndevido = filteredRows.reduce((s, r) => s + r.uso_indevido_atual, 0)
  const groupPctCpf     = totalAtendId > 0 ? totalAtendCpf / totalAtendId * 100 : null

  const belowTarget = useMemo(() =>
    filteredRows.filter(r => r.pctCpfPct < TARGET_CPF).sort((a, b) => a.pctCpfPct - b.pctCpfPct)
  , [filteredRows])

  const allRanked = useMemo(() =>
    [...filteredRows].sort((a, b) => b.pctCpfPct - a.pctCpfPct)
  , [filteredRows])

  const consRows = useMemo(() =>
    idClienteConsultorRows
      .filter(c => c.pdv === activePdv)
      .sort((a, b) => b.atend_id - a.atend_id)
      .map(c => ({ ...c, pctCpfPct: c.pct_cpf * 100, pctBolPct: c.pct_boletos_validos * 100 }))
  , [idClienteConsultorRows, activePdv])

  const regionGroups = useMemo(() => {
    if (labels.length === 0) return []
    return labels
      .filter(lb => selectedLabels.length === 0 || selectedLabels.includes(lb.id))
      .map(lb => {
        const rows = storeRows.filter(r => (r.loja?.labels ?? []).includes(lb.id))
        if (rows.length === 0) return null
        const totId  = rows.reduce((s, r) => s + r.atend_id_atual,  0)
        const totCpf = rows.reduce((s, r) => s + r.atend_cpf_atual, 0)
        const pctCpf = totId > 0 ? totCpf / totId * 100 : 0
        const totUso = rows.reduce((s, r) => s + r.uso_indevido_atual, 0)
        const belowCount = rows.filter(r => r.pctCpfPct < TARGET_CPF).length
        return { label: lb, count: rows.length, pctCpf, totUso, belowCount }
      })
      .filter(Boolean) as { label: typeof labels[0]; count: number; pctCpf: number; totUso: number; belowCount: number }[]
  }, [labels, storeRows, selectedLabels])

  function StoreOptionContent({ pdv, inline }: { pdv: string; inline?: boolean }) {
    const loja = lojaMap.get(pdv)
    const lbs  = (loja?.labels ?? []).map(lid => labels.find(l => l.id === lid)).filter(Boolean) as typeof labels
    return (
      <span className={`store-option-content${inline ? ' store-option-content--inline' : ''}`}>
        <span className="store-option-pdv">{pdv}</span>
        {loja?.apelido && <span className="store-option-apelido">{loja.apelido}</span>}
        {lbs.map(lb => <span key={lb.id} className="label-chip label-chip--xs" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span>)}
      </span>
    )
  }

  const cpfColor = (pct: number) => pct >= TARGET_CPF ? '#059669' : pct >= TARGET_CPF * 0.9 ? '#d97706' : '#dc2626'
  const bolColor = (pct: number) => pct >= 80 ? '#059669' : pct >= 65 ? '#d97706' : '#dc2626'

  const StoreLabels = ({ loja }: { loja?: { labels?: string[] } }) => (
    <div className="label-chips-group">
      {(loja?.labels ?? []).map(lid => {
        const lb = labels.find(x => x.id === lid)
        return lb ? <span key={lid} className="label-chip" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span> : null
      })}
    </div>
  )

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <h2 className="page-title">ID do Cliente</h2>
          <p className="page-subtitle">Meta mínima: {TARGET_CPF}% CPF capturado · {filteredRows.length} lojas</p>
        </div>
      </div>

      {groupPctCpf !== null && (
        <div className={`skin-summary-card${groupPctCpf >= TARGET_CPF ? ' skin-summary-card--ok' : ' skin-summary-card--alert'}`}>
          <div className="skin-summary-block">
            <span className="skin-summary-pct">{fDec(groupPctCpf, 1)}%</span>
            <span className="skin-summary-label">
              {selectedLabels.length > 0 ? `% CPF — ${selectedLabels.map(lid => labels.find(l => l.id === lid)?.name ?? '').join(', ')}` : '% CPF do grupo'}
            </span>
          </div>
          <div className="skin-summary-divider" />
          <div className="skin-summary-block">
            <span className="skin-summary-pct skin-summary-pct--target">{TARGET_CPF}%</span>
            <span className="skin-summary-label">meta mínima</span>
          </div>
          <div className="skin-summary-divider" />
          <div className="skin-summary-block">
            {groupPctCpf >= TARGET_CPF
              ? <span className="skin-summary-status skin-summary-status--ok">✓ Meta atingida</span>
              : <span className="skin-summary-status skin-summary-status--nok">✗ {fDec(TARGET_CPF - groupPctCpf, 1)}pp abaixo da meta</span>
            }
            <span className="skin-summary-label">
              {totalUsoIndevido > 0 ? `${fInt(totalUsoIndevido)} uso${totalUsoIndevido !== 1 ? 's' : ''} indevido${totalUsoIndevido !== 1 ? 's' : ''}` : 'sem usos indevidos'}
            </span>
          </div>
        </div>
      )}

      {labels.length > 0 && (
        <div className="region-filter-bar">
          <span className="region-filter-label">Região</span>
          <button className={`region-filter-btn${selectedLabels.length === 0 ? ' active' : ''}`} onClick={() => setSelectedLabels([])}>Todas</button>
          {labels.map(lb => (
            <button key={lb.id}
              className={`region-filter-btn${selectedLabels.includes(lb.id) ? ' active' : ''}`}
              style={selectedLabels.includes(lb.id) ? { background: lb.color + '22', borderColor: lb.color, color: lb.color } as React.CSSProperties : undefined}
              onClick={() => setSelectedLabels(prev => prev.includes(lb.id) ? prev.filter(x => x !== lb.id) : [...prev, lb.id])}
            >{lb.name}</button>
          ))}
        </div>
      )}

      {regionGroups.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="fluxo-card-header">
            <h3 className="fluxo-card-title">Resumo por Região</h3>
            <span className="dispersao-cons-sub">% CPF vs meta {TARGET_CPF}%</span>
          </div>
          <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Região</th>
                  <th className="col-num">Lojas</th>
                  <th className="col-num">% CPF</th>
                  <th className="col-num">Uso Indevido</th>
                  <th className="col-num">Lojas abaixo</th>
                </tr>
              </thead>
              <tbody>
                {regionGroups.map(g => (
                  <tr key={g.label.id}>
                    <td><span className="label-chip" style={{ '--chip-color': g.label.color } as React.CSSProperties}>{g.label.name}</span></td>
                    <td className="col-num">{g.count}</td>
                    <td className="col-num" style={{ color: cpfColor(g.pctCpf), fontWeight: 700 }}>{fDec(g.pctCpf, 1)}%</td>
                    <td className="col-num" style={{ color: g.totUso > 0 ? '#dc2626' : undefined }}>{fInt(g.totUso)}</td>
                    <td className="col-num" style={{ color: g.belowCount > 0 ? '#dc2626' : '#059669', fontWeight: 600 }}>{g.belowCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {belowTarget.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="skin-alert-header">
            <div>
              <h3 className="skin-alert-title">Lojas Abaixo de {TARGET_CPF}% CPF</h3>
              <p className="dispersao-cons-sub">{belowTarget.length} loja{belowTarget.length !== 1 ? 's' : ''} abaixo da meta mínima</p>
            </div>
            <span className="skin-alert-badge">{belowTarget.length}</span>
          </div>
          <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th className="col-rank">#</th>
                  <th>Loja</th>
                  <th>Região</th>
                  <th className="col-num">Atend. ID</th>
                  <th className="col-num">% CPF Ant.</th>
                  <th className="col-num">% CPF Atual</th>
                  <th className="col-num">Uso Indevido</th>
                </tr>
              </thead>
              <tbody>
                {belowTarget.map((r, i) => (
                  <tr key={r.pdv}>
                    <td className="col-rank">{i + 1}</td>
                    <td><div className="col-pdv-name"><span className="col-pdv">{r.pdv}</span>{r.loja?.apelido && <span className="col-apelido">{r.loja.apelido}</span>}</div></td>
                    <td><StoreLabels loja={r.loja} /></td>
                    <td className="col-num">{fInt(r.atend_id_atual)}</td>
                    <td className="col-num" style={{ color: cpfColor(r.pct_cpf_ant * 100) }}>{fDec(r.pct_cpf_ant * 100, 1)}%</td>
                    <td className="col-num" style={{ color: '#dc2626', fontWeight: 700 }}>{fDec(r.pctCpfPct, 1)}%</td>
                    <td className="col-num" style={{ color: r.uso_indevido_atual > 0 ? '#dc2626' : undefined }}>{r.uso_indevido_atual > 0 ? fInt(r.uso_indevido_atual) : <span className="dash-muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="fluxo-card-header">
          <h3 className="fluxo-card-title">Ranking de Lojas por % CPF</h3>
          <span className="dispersao-cons-sub">{allRanked.length} lojas · meta {TARGET_CPF}%</span>
        </div>
        <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
          <table className="dash-table">
            <thead>
              <tr>
                <th className="col-rank">#</th>
                <th>Loja</th>
                <th>Região</th>
                <th className="col-num">Atend. ID</th>
                <th className="col-num">% CPF Ant.</th>
                <th className="col-num">% CPF Atual</th>
                <th className="col-num">Uso Indevido</th>
                <th className="col-num">Boletos ID</th>
                <th className="col-num">% Bol. Válidos</th>
              </tr>
            </thead>
            <tbody>
              {allRanked.map((r, i) => (
                <tr key={r.pdv}>
                  <td className="col-rank">{i + 1}</td>
                  <td><div className="col-pdv-name"><span className="col-pdv">{r.pdv}</span>{r.loja?.apelido && <span className="col-apelido">{r.loja.apelido}</span>}</div></td>
                  <td><StoreLabels loja={r.loja} /></td>
                  <td className="col-num">{fInt(r.atend_id_atual)}</td>
                  <td className="col-num" style={{ color: cpfColor(r.pct_cpf_ant * 100) }}>{fDec(r.pct_cpf_ant * 100, 1)}%</td>
                  <td className="col-num" style={{ color: cpfColor(r.pctCpfPct), fontWeight: r.pctCpfPct < TARGET_CPF ? 700 : undefined }}>{fDec(r.pctCpfPct, 1)}%</td>
                  <td className="col-num" style={{ color: r.uso_indevido_atual > 0 ? '#dc2626' : undefined }}>{r.uso_indevido_atual > 0 ? fInt(r.uso_indevido_atual) : <span className="dash-muted">—</span>}</td>
                  <td className="col-num">{fInt(r.boletos_id_atual)}</td>
                  <td className="col-num" style={{ color: bolColor(r.pctBolPct) }}>{fDec(r.pctBolPct, 1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="fluxo-card-header" style={{ alignItems: 'flex-start', gap: 8 }}>
          <h3 className="fluxo-card-title">Consultores por Loja</h3>
          <div className="store-picker" ref={pickerRef}>
            <button className="store-picker-btn" onClick={() => setPickerOpen(p => !p)}>
              <StoreOptionContent pdv={activePdv} inline />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {pickerOpen && (
              <div className="store-picker-dropdown">
                {idClienteRows.map(r => (
                  <button key={r.pdv} className={`store-picker-opt${r.pdv === activePdv ? ' active' : ''}`}
                    onClick={() => { setSelectedPdv(r.pdv); setPickerOpen(false) }}>
                    <StoreOptionContent pdv={r.pdv} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {consRows.length === 0 ? (
          <div style={{ padding: '24px', color: 'var(--text-muted)', fontSize: 13 }}>Nenhum consultor encontrado para esta loja.</div>
        ) : (
          <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th className="col-rank">#</th>
                  <th>Consultor</th>
                  <th className="col-num">Atend. ID</th>
                  <th className="col-num">% CPF</th>
                  <th className="col-num">Uso Indevido</th>
                  <th className="col-num">% Bol. Válidos</th>
                </tr>
              </thead>
              <tbody>
                {consRows.map((c, i) => (
                  <tr key={c.consultor}>
                    <td className="col-rank">{i + 1}</td>
                    <td className="col-consultor">{c.consultor}</td>
                    <td className="col-num">{fInt(c.atend_id)}</td>
                    <td className="col-num" style={{ color: cpfColor(c.pctCpfPct), fontWeight: c.pctCpfPct < TARGET_CPF ? 700 : undefined }}>{fDec(c.pctCpfPct, 1)}%</td>
                    <td className="col-num" style={{ color: c.uso_indevido > 0 ? '#dc2626' : undefined }}>{c.uso_indevido > 0 ? fInt(c.uso_indevido) : <span className="dash-muted">—</span>}</td>
                    <td className="col-num" style={{ color: bolColor(c.pctBolPct) }}>{fDec(c.pctBolPct, 1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── IAF — Skin (Cuidados Faciais) ─────────────────── */
function IafSkinPage() {
  const { skinRows, skinConsultorRows, skinCP, mainRows } = useData()
  const { lojas } = useLojas()
  const { labels } = useLabels()
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [selectedPdv, setSelectedPdv] = useState<string>('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  const TARGET_MIN = 2.7

  const { openImport } = useFileStatus()

  if (skinRows.length === 0) return (
    <div className="page-empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6M9 15l3 3 3-3"/></svg>
      <div className="page-empty-title">Skin — Cuidados Faciais</div>
      <div className="page-empty-desc">Importe a planilha de Cuidados Faciais para visualizar os dados.</div>
      <button className="page-empty-btn" onClick={openImport}>Importar planilha</button>
    </div>
  )

  const lojaMap = useMemo(() => new Map(lojas.map(l => [l.id, l])), [lojas])
  const mainMap = useMemo(() => new Map(mainRows.map(r => [r.pdv, r])), [mainRows])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const activePdv = selectedPdv || skinRows[0]?.pdv || ''

  const storeRows = useMemo(() => skinRows.map(r => {
    const loja = lojaMap.get(r.pdv)
    const main = mainMap.get(r.pdv)
    const sharePct = r.share * 100
    const vf_total = main?.vf_atual ?? 0
    const gapReceita = vf_total > 0 ? Math.max(0, vf_total * (TARGET_MIN / 100) - r.receita_atual) : 0
    return { ...r, loja, sharePct, gapReceita, vf_total }
  }), [skinRows, lojaMap, mainMap])

  const filteredRows = useMemo(() =>
    storeRows.filter(r => selectedLabels.length === 0 || selectedLabels.some(lid => (r.loja?.labels ?? []).includes(lid)))
  , [storeRows, selectedLabels])

  const belowTarget = useMemo(() =>
    filteredRows.filter(r => r.sharePct < TARGET_MIN).sort((a, b) => a.sharePct - b.sharePct)
  , [filteredRows])

  const allRanked = useMemo(() =>
    [...filteredRows].sort((a, b) => b.sharePct - a.sharePct)
  , [filteredRows])

  const consRows = useMemo(() =>
    skinConsultorRows
      .filter(c => c.pdv === activePdv)
      .sort((a, b) => b.share - a.share)
      .map(c => ({ ...c, sharePct: c.share * 100 }))
  , [skinConsultorRows, activePdv])

  // Share calculado sobre as lojas filtradas (usa vf_total quando disponível, senão usa skinCP)
  const filteredReceita = filteredRows.reduce((s, r) => s + r.receita_atual, 0)
  const filteredVF = filteredRows.reduce((s, r) => s + r.vf_total, 0)
  const filteredSharePct = filteredVF > 0
    ? filteredReceita / filteredVF * 100
    : (skinCP ? skinCP.share * 100 : null)

  const totalGap = belowTarget.reduce((s, r) => s + r.gapReceita, 0)

  const potencialRows = useMemo(() =>
    filteredRows
      .filter(r => r.vf_total > 0)
      .map(r => ({
        ...r,
        inc4: Math.max(0, r.vf_total * 0.04 - r.receita_atual),
        inc5: Math.max(0, r.vf_total * 0.05 - r.receita_atual),
        inc6: Math.max(0, r.vf_total * 0.06 - r.receita_atual),
      }))
      .sort((a, b) => b.inc6 - a.inc6)
  , [filteredRows])
  const totInc4 = potencialRows.reduce((s, r) => s + r.inc4, 0)
  const totInc5 = potencialRows.reduce((s, r) => s + r.inc5, 0)
  const totInc6 = potencialRows.reduce((s, r) => s + r.inc6, 0)

  // 1. Resumo por região
  const regionGroups = useMemo(() => {
    if (labels.length === 0) return []
    return labels
      .filter(lb => selectedLabels.length === 0 || selectedLabels.includes(lb.id))
      .map(lb => {
        const rows = storeRows.filter(r => (r.loja?.labels ?? []).includes(lb.id))
        if (rows.length === 0) return null
        const totSkin = rows.reduce((s, r) => s + r.receita_atual, 0)
        const totVF   = rows.reduce((s, r) => s + r.vf_total,    0)
        const sharePct = totVF > 0 ? totSkin / totVF * 100 : 0
        const totGap   = rows.reduce((s, r) => s + r.gapReceita, 0)
        const belowCount = rows.filter(r => r.sharePct < TARGET_MIN).length
        return { label: lb, count: rows.length, sharePct, totSkin, totGap, belowCount }
      })
      .filter(Boolean) as { label: typeof labels[0]; count: number; sharePct: number; totSkin: number; totGap: number; belowCount: number }[]
  }, [labels, storeRows, selectedLabels])

  // 2. Ranking global de consultores por share skin
  const consRanking = useMemo(() =>
    skinConsultorRows
      .map(c => { const loja = lojaMap.get(c.pdv); return { ...c, loja, sharePct: c.share * 100 } })
      .filter(c => selectedLabels.length === 0 || selectedLabels.some(lid => (c.loja?.labels ?? []).includes(lid)))
      .filter(c => c.receita_atual > 0)
      .sort((a, b) => b.sharePct - a.sharePct)
  , [skinConsultorRows, lojaMap, selectedLabels])

  function StoreOptionContent({ pdv, inline }: { pdv: string; inline?: boolean }) {
    const loja = lojaMap.get(pdv)
    const lbs  = (loja?.labels ?? []).map(lid => labels.find(l => l.id === lid)).filter(Boolean) as typeof labels
    return (
      <span className={`store-option-content${inline ? ' store-option-content--inline' : ''}`}>
        <span className="store-option-pdv">{pdv}</span>
        {loja?.apelido && <span className="store-option-apelido">{loja.apelido}</span>}
        {lbs.map(lb => <span key={lb.id} className="label-chip label-chip--xs" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span>)}
      </span>
    )
  }

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Skin — Cuidados Faciais</h2>
          <p className="page-subtitle">Meta mínima: {TARGET_MIN}% de share · {filteredRows.length} lojas</p>
        </div>
      </div>

      {/* Cartão de resumo — atualiza conforme filtro de região */}
      {filteredSharePct !== null && (
        <div className={`skin-summary-card${filteredSharePct >= TARGET_MIN ? ' skin-summary-card--ok' : ' skin-summary-card--alert'}`}>
          <div className="skin-summary-block">
            <span className="skin-summary-pct">{fDec(filteredSharePct, 2)}%</span>
            <span className="skin-summary-label">
              {selectedLabels.length > 0 ? `share — ${selectedLabels.map(lid => labels.find(l => l.id === lid)?.name ?? '').join(', ')}` : 'share do grupo'}
            </span>
          </div>
          <div className="skin-summary-divider" />
          <div className="skin-summary-block">
            <span className="skin-summary-pct skin-summary-pct--target">{TARGET_MIN}%</span>
            <span className="skin-summary-label">meta mínima</span>
          </div>
          <div className="skin-summary-divider" />
          <div className="skin-summary-block">
            {filteredSharePct >= TARGET_MIN ? (
              <span className="skin-summary-status skin-summary-status--ok">✓ Meta atingida</span>
            ) : (
              <span className="skin-summary-status skin-summary-status--nok">✗ {fDec(TARGET_MIN - filteredSharePct, 2)}pp abaixo da meta</span>
            )}
            <span className="skin-summary-label">receita skin: {fBRLR(filteredReceita)}</span>
          </div>
        </div>
      )}

      {/* Filtro por região */}
      {labels.length > 0 && (
        <div className="region-filter-bar">
          <span className="region-filter-label">Região</span>
          <button className={`region-filter-btn${selectedLabels.length === 0 ? ' active' : ''}`} onClick={() => setSelectedLabels([])}>Todas</button>
          {labels.map(lb => (
            <button key={lb.id}
              className={`region-filter-btn${selectedLabels.includes(lb.id) ? ' active' : ''}`}
              style={selectedLabels.includes(lb.id) ? { background: lb.color + '22', borderColor: lb.color, color: lb.color } as React.CSSProperties : undefined}
              onClick={() => setSelectedLabels(prev => prev.includes(lb.id) ? prev.filter(x => x !== lb.id) : [...prev, lb.id])}
            >{lb.name}</button>
          ))}
        </div>
      )}

      {/* 1. Resumo por região */}
      {regionGroups.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="fluxo-card-header">
            <h3 className="fluxo-card-title">Resumo por Região</h3>
            <span className="dispersao-cons-sub">share vs meta {TARGET_MIN}%</span>
          </div>
          <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Região</th>
                  <th className="col-num">Lojas</th>
                  <th className="col-num">Share</th>
                  <th className="col-num">Receita Skin</th>
                  <th className="col-num">Lojas abaixo</th>
                  <th className="col-num col-gap-head">GAP total</th>
                </tr>
              </thead>
              <tbody>
                {regionGroups.map(g => (
                  <tr key={g.label.id}>
                    <td><span className="label-chip" style={{ '--chip-color': g.label.color } as React.CSSProperties}>{g.label.name}</span></td>
                    <td className="col-num">{g.count}</td>
                    <td className="col-num" style={{ color: g.sharePct >= TARGET_MIN ? '#059669' : '#dc2626', fontWeight: 700 }}>{fDec(g.sharePct, 2)}%</td>
                    <td className="col-num">{fBRLR(g.totSkin)}</td>
                    <td className="col-num" style={{ color: g.belowCount > 0 ? '#dc2626' : '#059669', fontWeight: 600 }}>{g.belowCount}</td>
                    <td className="col-num col-gap-val">{g.totGap > 0 ? fBRLR(g.totGap) : <span className="dash-muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lojas abaixo da meta */}
      {belowTarget.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="skin-alert-header">
            <div>
              <h3 className="skin-alert-title">Lojas Abaixo de {TARGET_MIN}%</h3>
              <p className="dispersao-cons-sub">{belowTarget.length} loja{belowTarget.length !== 1 ? 's' : ''} abaixo da meta mínima · GAP total: {fBRLR(totalGap)}</p>
            </div>
            <span className="skin-alert-badge">{belowTarget.length}</span>
          </div>
          <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th className="col-rank">#</th>
                  <th>Loja</th>
                  <th>Região</th>
                  <th className="col-num">Share Atual</th>
                  <th className="col-num">Receita Skin</th>
                  <th className="col-num col-gap-head">GAP p/ {TARGET_MIN}%</th>
                </tr>
              </thead>
              <tbody>
                {belowTarget.map((r, i) => (
                  <tr key={r.pdv}>
                    <td className="col-rank">{i + 1}</td>
                    <td>
                      <div className="col-pdv-name">
                        <span className="col-pdv">{r.pdv}</span>
                        {r.loja?.apelido && <span className="col-apelido">{r.loja.apelido}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="label-chips-group">
                        {(r.loja?.labels ?? []).map(lid => { const lb = labels.find(x => x.id === lid); return lb ? <span key={lid} className="label-chip" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span> : null })}
                      </div>
                    </td>
                    <td className="col-num" style={{ color: '#dc2626', fontWeight: 700 }}>{fDec(r.sharePct, 2)}%</td>
                    <td className="col-num">{fBRLR(r.receita_atual)}</td>
                    <td className="col-num col-gap-val">{r.gapReceita > 0 ? fBRLR(r.gapReceita) : <span className="dash-muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ranking de todas as lojas */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="fluxo-card-header">
          <h3 className="fluxo-card-title">Ranking de Lojas por Share</h3>
          <span className="dispersao-cons-sub">{allRanked.length} lojas · meta {TARGET_MIN}%</span>
        </div>
        <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
          <table className="dash-table">
            <thead>
              <tr>
                <th className="col-rank">#</th>
                <th>Loja</th>
                <th>Região</th>
                <th className="col-num">Share</th>
                <th className="col-num">Receita Skin Atual</th>
                <th className="col-num">Receita Skin Ant.</th>
                <th className="col-num">Variação</th>
              </tr>
            </thead>
            <tbody>
              {allRanked.map((r, i) => (
                <tr key={r.pdv}>
                  <td className="col-rank">{i + 1}</td>
                  <td>
                    <div className="col-pdv-name">
                      <span className="col-pdv">{r.pdv}</span>
                      {r.loja?.apelido && <span className="col-apelido">{r.loja.apelido}</span>}
                    </div>
                  </td>
                  <td>
                    <div className="label-chips-group">
                      {(r.loja?.labels ?? []).map(lid => { const lb = labels.find(x => x.id === lid); return lb ? <span key={lid} className="label-chip" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span> : null })}
                    </div>
                  </td>
                  <td className="col-num" style={{ color: r.sharePct >= TARGET_MIN ? '#059669' : '#dc2626', fontWeight: 600 }}>{fDec(r.sharePct, 2)}%</td>
                  <td className="col-num">{fBRLR(r.receita_atual)}</td>
                  <td className="col-num">{fBRLR(r.receita_ant)}</td>
                  <td className="col-num" style={{ color: r.var_pct >= 0 ? '#059669' : '#dc2626' }}>
                    {(r.var_pct >= 0 ? '+' : '') + fDec(r.var_pct * 100, 1) + '%'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Breakdown BOTIK vs Demais Marcas */}
      {allRanked.some(r => r.botik_atual > 0 || r.demais_atual > 0) && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="fluxo-card-header">
            <div>
              <h3 className="fluxo-card-title">BOTIK vs Demais Marcas</h3>
              <p className="dispersao-cons-sub">Composição do share de skincare por loja</p>
            </div>
            {skinCP && (
              <div style={{ textAlign: 'right', fontSize: 13 }}>
                <div><span className="skin-brand-tag skin-brand-tag--botik">BOTIK</span> {fDec(skinCP.botik_share * 100, 2)}% do total</div>
                <div><span className="skin-brand-tag skin-brand-tag--demais">Demais</span> {fDec(skinCP.demais_share * 100, 2)}% do total</div>
              </div>
            )}
          </div>
          <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th className="col-rank">#</th>
                  <th>Loja</th>
                  <th>Região</th>
                  <th className="col-num">Share Total</th>
                  <th className="col-num skin-col-botik">BOTIK R$</th>
                  <th className="col-num skin-col-botik">BOTIK %</th>
                  <th className="col-num skin-col-demais">Demais R$</th>
                  <th className="col-num skin-col-demais">Demais %</th>
                </tr>
              </thead>
              <tbody>
                {allRanked.map((r, i) => {
                  const botikPct = r.vf_total > 0 ? r.botik_atual / r.vf_total * 100 : 0
                  const demaisPct = r.vf_total > 0 ? r.demais_atual / r.vf_total * 100 : 0
                  return (
                    <tr key={r.pdv}>
                      <td className="col-rank">{i + 1}</td>
                      <td>
                        <div className="col-pdv-name">
                          <span className="col-pdv">{r.pdv}</span>
                          {r.loja?.apelido && <span className="col-apelido">{r.loja.apelido}</span>}
                        </div>
                      </td>
                      <td>
                        <div className="label-chips-group">
                          {(r.loja?.labels ?? []).map(lid => { const lb = labels.find(x => x.id === lid); return lb ? <span key={lid} className="label-chip" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span> : null })}
                        </div>
                      </td>
                      <td className="col-num" style={{ color: r.sharePct >= TARGET_MIN ? '#059669' : '#dc2626', fontWeight: 600 }}>{fDec(r.sharePct, 2)}%</td>
                      <td className="col-num skin-col-botik">{r.botik_atual > 0 ? fBRLR(r.botik_atual) : <span className="dash-muted">—</span>}</td>
                      <td className="col-num skin-col-botik">{fDec(botikPct, 2)}%</td>
                      <td className="col-num skin-col-demais">{r.demais_atual > 0 ? fBRLR(r.demais_atual) : <span className="dash-muted">—</span>}</td>
                      <td className="col-num skin-col-demais">{fDec(demaisPct, 2)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Ranking global de consultores */}
      {consRanking.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="fluxo-card-header">
            <h3 className="fluxo-card-title">Ranking de Consultores por Share Skin</h3>
            <span className="dispersao-cons-sub">{consRanking.length} consultores · meta {TARGET_MIN}%</span>
          </div>
          <div className="fluxo-ranking-cons-wrap">
            <div>
              <div className="fluxo-ranking-cons-title fluxo-ranking-cons-title--top">Top embaixadores</div>
              <table className="dash-table">
                <thead><tr><th className="col-rank">#</th><th>Consultor</th><th className="col-pdv">PDV</th><th className="col-num">Share</th><th className="col-num">Receita Skin</th></tr></thead>
                <tbody>
                  {consRanking.slice(0, 10).map((c, i) => (
                    <tr key={`${c.pdv}-${c.consultor}`}>
                      <td className="col-rank">{i + 1}</td>
                      <td className="col-consultor">{c.consultor}</td>
                      <td className="col-pdv">{c.pdv}</td>
                      <td className="col-num" style={{ color: c.sharePct >= TARGET_MIN ? '#059669' : '#dc2626', fontWeight: 700 }}>{fDec(c.sharePct, 2)}%</td>
                      <td className="col-num">{fBRLR(c.receita_atual)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <div className="fluxo-ranking-cons-title fluxo-ranking-cons-title--bottom">Precisam de atenção</div>
              <table className="dash-table">
                <thead><tr><th className="col-rank">#</th><th>Consultor</th><th className="col-pdv">PDV</th><th className="col-num">Share</th><th className="col-num">Receita Skin</th></tr></thead>
                <tbody>
                  {consRanking.slice(-10).reverse().map((c, i) => (
                    <tr key={`${c.pdv}-${c.consultor}`}>
                      <td className="col-rank">{i + 1}</td>
                      <td className="col-consultor">{c.consultor}</td>
                      <td className="col-pdv">{c.pdv}</td>
                      <td className="col-num" style={{ color: c.sharePct >= TARGET_MIN ? '#059669' : '#dc2626', fontWeight: 700 }}>{fDec(c.sharePct, 2)}%</td>
                      <td className="col-num">{fBRLR(c.receita_atual)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Potencial por faixa de share */}
      {potencialRows.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="fluxo-card-header">
            <div>
              <h3 className="fluxo-card-title">Potencial de Incremento por Faixa</h3>
              <p className="dispersao-cons-sub">Receita adicional estimada se o share de cada loja atingisse 4%, 5% ou 6%</p>
            </div>
            <div style={{ textAlign: 'right', fontSize: 13, lineHeight: 1.8 }}>
              <div><span className="skin-brand-tag" style={{ background: '#ede9fe', color: '#6d28d9' }}>6%</span> +{fBRLR(totInc6)}</div>
              <div><span className="skin-brand-tag" style={{ background: '#e0e7ff', color: '#4338ca' }}>5%</span> +{fBRLR(totInc5)}</div>
              <div><span className="skin-brand-tag" style={{ background: '#dbeafe', color: '#1d4ed8' }}>4%</span> +{fBRLR(totInc4)}</div>
            </div>
          </div>
          <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th className="col-rank">#</th>
                  <th>Loja</th>
                  <th>Região</th>
                  <th className="col-num">Share Atual</th>
                  <th className="col-num">Receita Skin</th>
                  <th className="col-num skin-col-inc4">+ se 4%</th>
                  <th className="col-num skin-col-inc5">+ se 5%</th>
                  <th className="col-num skin-col-inc6">+ se 6%</th>
                </tr>
              </thead>
              <tbody>
                {potencialRows.map((r, i) => (
                  <tr key={r.pdv}>
                    <td className="col-rank">{i + 1}</td>
                    <td>
                      <div className="col-pdv-name">
                        <span className="col-pdv">{r.pdv}</span>
                        {r.loja?.apelido && <span className="col-apelido">{r.loja.apelido}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="label-chips-group">
                        {(r.loja?.labels ?? []).map(lid => { const lb = labels.find(x => x.id === lid); return lb ? <span key={lid} className="label-chip" style={{ '--chip-color': lb.color } as React.CSSProperties}>{lb.name}</span> : null })}
                      </div>
                    </td>
                    <td className="col-num" style={{ color: r.sharePct >= 6 ? '#059669' : r.sharePct >= TARGET_MIN ? '#d97706' : '#dc2626', fontWeight: 600 }}>{fDec(r.sharePct, 2)}%</td>
                    <td className="col-num">{fBRLR(r.receita_atual)}</td>
                    <td className="col-num skin-col-inc4" style={{ fontWeight: r.inc4 > 0 ? 600 : 400, color: r.inc4 > 0 ? '#1d4ed8' : '#059669' }}>{r.inc4 > 0 ? `+${fBRLR(r.inc4)}` : '✓'}</td>
                    <td className="col-num skin-col-inc5" style={{ fontWeight: r.inc5 > 0 ? 600 : 400, color: r.inc5 > 0 ? '#4338ca' : '#059669' }}>{r.inc5 > 0 ? `+${fBRLR(r.inc5)}` : '✓'}</td>
                    <td className="col-num skin-col-inc6" style={{ fontWeight: r.inc6 > 0 ? 600 : 400, color: r.inc6 > 0 ? '#6d28d9' : '#059669' }}>{r.inc6 > 0 ? `+${fBRLR(r.inc6)}` : '✓'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="gap-table-total">
                  <td colSpan={5} className="gap-total-label">Total</td>
                  <td className="col-num skin-col-inc4" style={{ color: '#1d4ed8', fontWeight: 700 }}>+{fBRLR(totInc4)}</td>
                  <td className="col-num skin-col-inc5" style={{ color: '#4338ca', fontWeight: 700 }}>+{fBRLR(totInc5)}</td>
                  <td className="col-num skin-col-inc6" style={{ color: '#6d28d9', fontWeight: 700 }}>+{fBRLR(totInc6)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Consultores por loja */}
      {skinConsultorRows.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="dispersao-cons-header">
            <div>
              <h3 className="dispersao-cons-title">Consultores por Loja</h3>
              <p className="dispersao-cons-sub">Share de skincare por consultor · meta {TARGET_MIN}%</p>
            </div>
            <div className="store-picker" ref={pickerRef}>
              <span className="detalhe-selector-label">Loja</span>
              <button className="store-picker-btn" onClick={() => setPickerOpen(o => !o)}>
                <StoreOptionContent pdv={activePdv} inline />
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {pickerOpen && (
                <div className="store-picker-dropdown">
                  {skinRows.map(r => (
                    <button key={r.pdv}
                      className={`store-picker-option${r.pdv === activePdv ? ' selected' : ''}`}
                      onClick={() => { setSelectedPdv(r.pdv); setPickerOpen(false) }}
                    >
                      <StoreOptionContent pdv={r.pdv} />
                      {r.pdv === activePdv && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {consRows.length === 0 ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Nenhum dado de consultores para esta loja.</div>
          ) : (
            <div className="dash-table-wrap" style={{ marginBottom: 0 }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th className="col-rank">#</th>
                    <th>Consultor</th>
                    <th className="col-num">Share Skin</th>
                    <th className="col-num">Receita Skin Atual</th>
                  </tr>
                </thead>
                <tbody>
                  {consRows.map((c, i) => (
                    <tr key={c.consultor}>
                      <td className="col-rank">{i + 1}</td>
                      <td className="col-consultor">{c.consultor}</td>
                      <td className="col-num" style={{ color: c.sharePct >= TARGET_MIN ? '#059669' : '#dc2626', fontWeight: 600 }}>{fDec(c.sharePct, 2)}%</td>
                      <td className="col-num">{fBRLR(c.receita_atual)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
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
            <SideItem to="/app/iaf/skin"       icon={IC.skin}    label="Skin"          requires={['skin','parcial-skin']} />
            <SideItem to="/app/iaf/id-cliente" icon={IC.idCard}  label="ID do Cliente" requires={['id-cliente']} />
            <SideItem to="/app/iaf/servicos"   icon={IC.doc}     label="Serviços"      requires={['servicos']} />
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
            <Route path="lojas/detalhe"       element={<DetalhePage />} />
            <Route path="lojas/consultores"   element={<ConsultoresPage />} />
            <Route path="lojas/dispersao"     element={<DispersaoPage />} />
            {/* Mensal – IAF */}
            <Route path="iaf"          element={<WipPage title="IAF — Indicadores" />} />
            <Route path="iaf/detalhe"  element={<WipPage title="IAF — Detalhe" />} />
            <Route path="iaf/fluxo"    element={<IafFluxoPage />} />
            <Route path="iaf/skin"       element={<IafSkinPage />} />
            <Route path="iaf/id-cliente" element={<IDClientePage />} />
            <Route path="iaf/servicos"   element={<WipPage title="Serviços" requires={['servicos']} />} />
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
