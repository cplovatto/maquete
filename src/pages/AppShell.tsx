import { useState } from 'react'
import type { ReactNode } from 'react'
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

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

/* ── Sidebar nav item ───────────────────────────────── */
interface SideItemProps { to: string; icon: ReactNode; label: string }
function SideItem({ to, icon, label }: SideItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
    >
      {icon}
      {label}
    </NavLink>
  )
}

/* ── Placeholder page ───────────────────────────────── */
function WipPage({ title }: { title: string }) {
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
            <SideItem to="/app/parcial"       icon={IC.clock}    label="Parcial do Dia" />
            <SideItem to="/app/dia-anterior"  icon={IC.calendar} label="Dia Anterior" />
          </div>
          <div className="nav-group">
            <div className="nav-group-title">Lojas</div>
            <SideItem to="/app/lojas"              icon={IC.grid}    label="Visão Geral" />
            <SideItem to="/app/lojas/regioes"      icon={IC.mapPin}  label="Análise Regional" />
            <SideItem to="/app/lojas/ranking"      icon={IC.chart}   label="Ranking de Lojas" />
            <SideItem to="/app/lojas/detalhe"      icon={IC.store}   label="Detalhe da Loja" />
            <SideItem to="/app/lojas/consultores"  icon={IC.users}   label="Consultores" />
            <SideItem to="/app/lojas/dispersao"    icon={IC.scatter} label="Dispersão" />
          </div>
          <div className="nav-group">
            <div className="nav-group-title">IAF</div>
            <SideItem to="/app/iaf"            icon={IC.check}   label="Indicadores" />
            <SideItem to="/app/iaf/detalhe"    icon={IC.search}  label="Detalhe" />
            <SideItem to="/app/iaf/fluxo"      icon={IC.arrows}  label="Ação de Fluxo" />
            <SideItem to="/app/iaf/skin"       icon={IC.skin}    label="Skin" />
            <SideItem to="/app/iaf/servicos"   icon={IC.doc}     label="Serviços" />
          </div>
        </nav>
      )}

      {periodo === 'anual' && (
        <nav className="nav-sections">
          <div className="nav-group">
            <div className="nav-group-title">Lojas</div>
            <SideItem to="/app/anual/lojas"     icon={IC.grid}   label="Visão Geral" />
            <SideItem to="/app/anual/regioes"   icon={IC.mapPin} label="Análise Regional" />
            <SideItem to="/app/anual/ranking"   icon={IC.chart}  label="Ranking de Lojas" />
            <SideItem to="/app/anual/detalhe"   icon={IC.store}  label="Detalhe da Loja" />
            <SideItem to="/app/anual/fluxo"     icon={IC.arrows} label="Ação de Fluxo" />
          </div>
          <div className="nav-group">
            <div className="nav-group-title">IAF</div>
            <SideItem to="/app/anual/iaf"  icon={IC.check}  label="Indicadores" />
            <SideItem to="/app/anual/pef"  icon={IC.dollar} label="Parcial PEF" />
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

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
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
          <div className="app-header-avatar" title={user?.name}>{user?.initials}</div>
        </div>
      </header>

      <div className="app-body">
        {/* Sidebar */}
        <Sidebar />

        {/* Main */}
        <main className="app-main">
          <Routes>
            <Route index element={<Navigate to="meta" replace />} />
            {/* Mensal – Gestão Instantânea */}
            <Route path="meta"          element={<WipPage title="Meta do Dia" />} />
            <Route path="parcial"       element={<WipPage title="Parcial do Dia" />} />
            <Route path="dia-anterior"  element={<WipPage title="Dia Anterior" />} />
            {/* Mensal – Lojas */}
            <Route path="lojas"                    element={<WipPage title="Lojas — Visão Geral" />} />
            <Route path="lojas/regioes"            element={<WipPage title="Análise Regional" />} />
            <Route path="lojas/ranking"            element={<WipPage title="Ranking de Lojas" />} />
            <Route path="lojas/detalhe"            element={<WipPage title="Detalhe da Loja" />} />
            <Route path="lojas/consultores"        element={<WipPage title="Consultores" />} />
            <Route path="lojas/dispersao"          element={<WipPage title="Dispersão" />} />
            {/* Mensal – IAF */}
            <Route path="iaf"            element={<WipPage title="IAF — Indicadores" />} />
            <Route path="iaf/detalhe"    element={<WipPage title="IAF — Detalhe" />} />
            <Route path="iaf/fluxo"      element={<WipPage title="Ação de Fluxo" />} />
            <Route path="iaf/skin"       element={<WipPage title="Skin" />} />
            <Route path="iaf/servicos"   element={<WipPage title="Serviços" />} />
            {/* Anual – Lojas */}
            <Route path="anual/lojas"    element={<WipPage title="Anual — Lojas" />} />
            <Route path="anual/regioes"  element={<WipPage title="Anual — Análise Regional" />} />
            <Route path="anual/ranking"  element={<WipPage title="Anual — Ranking de Lojas" />} />
            <Route path="anual/detalhe"  element={<WipPage title="Anual — Detalhe da Loja" />} />
            <Route path="anual/fluxo"    element={<WipPage title="Anual — Ação de Fluxo" />} />
            {/* Anual – IAF */}
            <Route path="anual/iaf"      element={<WipPage title="Anual — Indicadores" />} />
            <Route path="anual/pef"      element={<WipPage title="Anual — Parcial PEF" />} />
            {/* legado (mantidos para não quebrar links diretos) */}
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
  )
}
