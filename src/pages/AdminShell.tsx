import { useState } from 'react'
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import CompaniesPage from './admin/CompaniesPage'
import UsersPage from './admin/UsersPage'
import BillingPage from './admin/BillingPage'

const NAV_ITEMS = [
  {
    to: '/admin/empresas', label: 'Empresas',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="19" rx="2"/><path d="M12 3v19"/><path d="M8 7h3"/><path d="M8 11h3"/><path d="M13 7h3"/><path d="M13 11h3"/></svg>,
  },
  {
    to: '/admin/usuarios', label: 'Usuários',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    to: '/admin/cobranca', label: 'Cobrança',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/><path d="M7 15h.01"/><path d="M11 15h2"/></svg>,
  },
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
                  <span className="nav-icon">{item.icon}</span>
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
