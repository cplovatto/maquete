import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import CompaniesPage from './admin/CompaniesPage'
import UsersPage from './admin/UsersPage'
import BillingPage from './admin/BillingPage'

/* ── Admin nav items ─────────────────────────────────── */

const NAV_ITEMS = [
  { to: '/admin/empresas', icon: '🏢', label: 'Empresas' },
  { to: '/admin/usuarios', icon: '👥', label: 'Usuários' },
  { to: '/admin/cobranca', icon: '💳', label: 'Cobrança' },
]

/* ── AdminNav ─────────────────────────────────────────── */

function AdminNav() {
  const navigate = useNavigate()
  const [active, setActive] = useState(() => {
    const hash = window.location.hash
    const match = NAV_ITEMS.find(n => hash.includes(n.to))
    return match?.to ?? '/admin/empresas'
  })

  return (
    <nav className="admin-nav">
      {NAV_ITEMS.map(item => (
        <button
          key={item.to}
          className={`admin-nav-item${active === item.to ? ' active' : ''}`}
          onClick={() => { setActive(item.to); navigate(item.to) }}
        >
          <span className="admin-nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

/* ── AdminShell ───────────────────────────────────────── */

export default function AdminShell() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="admin-shell">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-brand">
          <span className="admin-header-logo">⚙️</span>
          <span className="admin-header-title">Painel Administrativo</span>
        </div>

        <div className="admin-header-spacer" />

        <div className="admin-header-actions">
          <button className="app-header-icon-btn" title="Ir para o app" onClick={() => navigate('/app')}>
            📊
          </button>
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
                  <div className="profile-dropdown-info">
                    <div className="profile-dropdown-name">{user?.name}</div>
                    <div className="profile-dropdown-role">Administrador</div>
                  </div>
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

      <div className="admin-body">
        <AdminNav />

        <main className="admin-main">
          <Routes>
            <Route index element={<Navigate to="empresas" replace />} />
            <Route path="empresas" element={<CompaniesPage />} />
            <Route path="usuarios" element={<UsersPage />} />
            <Route path="cobranca" element={<BillingPage />} />
            <Route path="*" element={<Navigate to="empresas" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
