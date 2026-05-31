import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function SignIn() {
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [socialNotice, setSocialNotice] = useState('')

  function handleSocial(provider: 'google') {
    setSocialNotice('Login com Google ainda não está disponível. Use o login demo.')
  }

  function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSocialNotice('')
    setLoading(true)
    const creds = { username, password }
    setTimeout(() => {
      const ok = login('email', creds.username, creds.password)
      if (ok) {
        navigate(creds.username === 'admin' ? '/admin' : '/app')
      } else {
        setError('Usuário ou senha incorretos.')
        setLoading(false)
      }
    }, 600)
  }

  const busy = loading

  return (
    <div className="signin-page">
      <div className="signin-bg" />

      <div className="signin-corner">
        <button className="theme-toggle" onClick={toggleTheme} title="Alternar tema">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      <div className="signin-back">
        <Link to="/" className="btn btn-ghost" style={{ gap: 6, fontSize: 13 }}>
          ← Voltar
        </Link>
      </div>

      <div className="signin-card">
        <div className="signin-logo">
          <div className="signin-logo-icon">💎</div>
          <span className="signin-logo-text">Velo Retail</span>
        </div>

        <h1 className="signin-title">Bem-vindo de volta</h1>
        <p className="signin-subtitle">Entre na sua conta para continuar</p>

        <div className="signin-social">
          <button
            className="btn-google"
            onClick={() => handleSocial('google')}
            disabled={busy}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </button>


          {socialNotice && (
            <p className="signin-social-notice">{socialNotice}</p>
          )}
        </div>

        <div className="signin-divider">
          <span>ou entre com e-mail</span>
        </div>

        <form onSubmit={handleEmail}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Usuário</label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="demo"
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              required
              disabled={busy}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              required
              disabled={busy}
            />
          </div>
          {error && <p className="signin-error">{error}</p>}
          <div className="form-footer">
            <span className="signin-demo-hint">Use <strong>demo</strong> / <strong>demo</strong></span>
          </div>
          <button type="submit" className="btn-submit" disabled={busy}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="signin-footer">
          Não tem uma conta?{' '}
          <Link to="/#precos">Criar conta gratuita</Link>
        </p>
      </div>
    </div>
  )
}
