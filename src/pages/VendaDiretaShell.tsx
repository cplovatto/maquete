import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function VendaDiretaShell() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-logo">
          <div className="app-header-logo-icon">💄</div>
          <span className="app-header-logo-text">Velo Venda Direta</span>
        </div>

        <div className="app-header-spacer" />

        <div className="app-header-actions">
          <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => navigate('/selecionar-canal')}>
            Trocar canal
          </button>
          <button className="theme-toggle" onClick={toggleTheme} title="Alternar tema">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className="app-header-avatar" title={user?.name} onClick={() => { logout(); navigate('/') }}>
            {user?.initials}
          </button>
        </div>
      </header>

      <div className="app-body">
        <main className="app-main">
          <div className="placeholder-page">
            <div className="page-header">
              <div className="page-title">Venda Direta</div>
              <div className="page-subtitle">Rede de revendedoras — Atividade, Inícios e acompanhamento por ciclo</div>
            </div>
            <div className="wip-banner">
              <span style={{ fontSize: 20 }}>🏗️</span>
              <span><strong>Módulo em construção</strong> — este dashboard ainda está sendo desenhado, separado do Canal Loja.</span>
            </div>
            <div className="placeholder-grid">
              {[
                { icon: '📈', title: 'Atividade', desc: '% da base de revendedoras que compra no ciclo atual.' },
                { icon: '🆕', title: 'Inícios', desc: 'Novos cadastros de revendedoras no ciclo.' },
                { icon: '⚠️', title: 'Em Risco', desc: 'Revendedoras com ciclos consecutivos sem comprar, até desativação.' },
                { icon: '🔄', title: 'Ciclos', desc: 'Acompanhamento por ciclo, em vez de calendário mensal.' },
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
        </main>
      </div>
    </div>
  )
}
