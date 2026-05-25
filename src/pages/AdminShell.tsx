import { useState } from 'react'
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import CompaniesPage from './admin/CompaniesPage'
import UsersPage from './admin/UsersPage'
import BillingPage from './admin/BillingPage'

const NAV_ITEMS = [
  { to: '/admin/empresas', icon: '🏢', label: 'Empresas' },
  { to: '/admin/usuarios', icon: '👥', label: 'Usuários' },
  { to: '/admin/cobranca', icon: '💳', label: 'Cobrança' },
]

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
    <div className="app-shell">
      {/* Header — mesma identidade visual do app */}
      <header className="app-header">
        <NavLink to="/admin" className="app-header-logo">
          <div className="app-header-logo-icon">💎</div>
          <span className="app-header-logo-text">Prisma Retail</span>
        </NavLink>

        <div className="app-header-spacer" />

        <div className="app-header-actions">
          <button className="app-header-icon-btn" title="Notificações">
            🔔
            <span className="notif-dot">3</span>
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

      <div className="app-body">
        {/* Sidebar admin — estilo nav-sections igual ao app, sem dados de loja */}
        <aside className="sidebar">
          <nav className="nav-sections">
            <div className="nav-group">
              <div className="nav-group-title">Administração</div>
              {NAV_ITEMS.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <span className="nav-icon" style={{ fontSize: 16 }}>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main */}
        <main className="app-main">
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
