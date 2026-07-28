import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function ChannelSelect() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="channel-select-page">
      <div className="channel-select-bg" />

      <div className="channel-select-corner">
        <button className="theme-toggle" onClick={toggleTheme} title="Alternar tema">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => { logout(); navigate('/') }}>
          Sair
        </button>
      </div>

      <div className="channel-select-inner">
        <div className="channel-select-header">
          <div className="signin-logo-icon" style={{ margin: '0 auto 16px' }}>V</div>
          <h1>Qual canal você quer acessar?</h1>
          <p>Escolha um canal para continuar. Você pode trocar a qualquer momento.</p>
        </div>

        <div className="channel-cards">
          <button className="channel-card" onClick={() => navigate('/app')}>
            <div className="product-icon product-icon-loja">🏪</div>
            <h3>Canal Loja</h3>
            <p>Indicadores de PDV físico: Skin, AF, BP, Resgate, ID, Serviços e mais.</p>
          </button>

          <button className="channel-card" onClick={() => navigate('/vd')}>
            <div className="product-icon product-icon-vd">💄</div>
            <h3>Venda Direta</h3>
            <p>Rede de revendedoras: Atividade, Inícios e acompanhamento por ciclo.</p>
          </button>
        </div>
      </div>
    </div>
  )
}
