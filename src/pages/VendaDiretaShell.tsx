import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { VIC, VdSideItem } from './vd/vdShared'
import RankingEquipesPage from './vd/RankingEquipesPage'
import DetalheEquipePage from './vd/DetalheEquipePage'
import IniciosPage from './vd/IniciosPage'
import AtividadePage from './vd/AtividadePage'
import FinanceiroPage from './vd/FinanceiroPage'
import EmRiscoPage from './vd/EmRiscoPage'
import AdensamentoPage from './vd/AdensamentoPage'
import MixProdutoPage from './vd/MixProdutoPage'
import IafGeralPage from './vd/IafGeralPage'
import IafErsPage from './vd/IafErsPage'

function VdSidebar() {
  return (
    <aside className="sidebar">
      <nav className="nav-sections">
        <div className="nav-group">
          <div className="nav-group-title">Visão Geral</div>
          <VdSideItem to="/vd/equipes"          icon={VIC.grid}  label="Ranking de Equipes" />
          <VdSideItem to="/vd/equipes/detalhe"  icon={VIC.users} label="Detalhe da Equipe" />
        </div>
        <div className="nav-group">
          <div className="nav-group-title">Indicadores do Ciclo</div>
          <VdSideItem to="/vd/inicios"     icon={VIC.bolt}   label="Inícios" />
          <VdSideItem to="/vd/atividade"   icon={VIC.check}  label="Atividade" />
          <VdSideItem to="/vd/financeiro"  icon={VIC.dollar} label="Financeiro" />
          <VdSideItem to="/vd/risco"       icon={VIC.alert}  label="Em Risco" />
        </div>
        <div className="nav-group">
          <div className="nav-group-title">Mercado</div>
          <VdSideItem to="/vd/adensamento" icon={VIC.mapPin}   label="Adensamento" />
          <VdSideItem to="/vd/mix"         icon={VIC.pieChart} label="Mix de Produto" />
        </div>
        <div className="nav-group">
          <div className="nav-group-title">IAF</div>
          <VdSideItem to="/vd/iaf"      icon={VIC.check} label="IAF Geral" />
          <VdSideItem to="/vd/iaf/ers"  icon={VIC.store} label="IAF ERS" />
        </div>
      </nav>
    </aside>
  )
}

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
        <VdSidebar />
        <main className="app-main">
          <Routes>
            <Route path="equipes"          element={<RankingEquipesPage />} />
            <Route path="equipes/detalhe"  element={<DetalheEquipePage />} />
            <Route path="inicios"          element={<IniciosPage />} />
            <Route path="atividade"        element={<AtividadePage />} />
            <Route path="financeiro"       element={<FinanceiroPage />} />
            <Route path="risco"            element={<EmRiscoPage />} />
            <Route path="adensamento"      element={<AdensamentoPage />} />
            <Route path="mix"              element={<MixProdutoPage />} />
            <Route path="iaf"              element={<IafGeralPage />} />
            <Route path="iaf/ers"          element={<IafErsPage />} />
            <Route path="*" element={<Navigate to="equipes" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
