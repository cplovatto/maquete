import { useState } from 'react'
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

/* ── Sidebar nav item ───────────────────────────────── */
interface SideItemProps { to: string; icon: string; label: string; badge?: string }
function SideItem({ to, icon, label, badge }: SideItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
    >
      <span className="sidebar-icon">{icon}</span>
      <span>{label}</span>
      {badge && <span className="sidebar-badge">{badge}</span>}
    </NavLink>
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
        <aside className="sidebar">
          <SideItem to="/app/dashboard" icon="🏠" label="Painel" />

          <div className="sidebar-section-label">Loja</div>
          <SideItem to="/app/loja" icon="🏪" label="Visão Geral" />
          <SideItem to="/app/loja" icon="🖥️" label="PDV" />
          <SideItem to="/app/loja" icon="📦" label="Estoque" />
          <SideItem to="/app/loja" icon="🛒" label="Pedidos" badge="5" />
          <SideItem to="/app/loja" icon="👥" label="Clientes" />

          <div className="sidebar-section-label">Venda Direta</div>
          <SideItem to="/app/vd" icon="💄" label="Visão Geral" />
          <SideItem to="/app/vd" icon="👩‍💼" label="Consultoras" />
          <SideItem to="/app/vd" icon="📱" label="Catálogo" />
          <SideItem to="/app/vd" icon="💰" label="Comissões" />

          <div className="sidebar-section-label">Gestão</div>
          <SideItem to="/app/relatorios" icon="📊" label="Relatórios" />
          <SideItem to="/app/configuracoes" icon="⚙️" label="Configurações" />

          <div className="sidebar-footer">
            <button className="sidebar-item" onClick={handleLogout}>
              <span className="sidebar-icon">🚪</span>
              <span>Sair</span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="app-main">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"    element={<DashboardPage />} />
            <Route path="loja"         element={<LojaPage />} />
            <Route path="vd"           element={<VDPage />} />
            <Route path="relatorios"   element={<RelatoriosPage />} />
            <Route path="configuracoes" element={<ConfigPage />} />
            <Route path="*"            element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
