import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function SignIn() {
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  function handleSocial(provider: 'google' | 'apple') {
    setLoading(provider)
    setTimeout(() => {
      login(provider)
      navigate('/app/dashboard')
    }, 1100)
  }

  function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading('email')
    setTimeout(() => {
      login('email', email)
      navigate('/app/dashboard')
    }, 900)
  }

  const busy = loading !== null

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
          <span className="signin-logo-text">Prisma Retail</span>
        </div>

        <h1 className="signin-title">Bem-vindo de volta</h1>
        <p className="signin-subtitle">Entre na sua conta para continuar</p>

        <div className="signin-social">
          <button
            className="btn-google"
            onClick={() => handleSocial('google')}
            disabled={busy}
          >
            {loading === 'google' ? (
              <span>Conectando…</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar com Google
              </>
            )}
          </button>

          <button
            className="btn-apple"
            onClick={() => handleSocial('apple')}
            disabled={busy}
          >
            {loading === 'apple' ? (
              <span>Conectando…</span>
            ) : (
              <>
                <svg width="15" height="18" viewBox="0 0 814 1000" fill="currentColor">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-167.2-108.1C117.1 777.5 39 650.5 39 532c0-168.8 113.6-258.5 225.8-258.5 57.1 0 104.5 38.6 140.4 38.6 33 0 85.8-40.8 153.3-40.8 24.6 0 127.7 2.4 198.1 73.1zm-174.3-214c31.3-35.3 54.3-85.2 54.3-135.1 0-6.5-.6-13.1-1.9-18.5-51.6 2-112 34.7-148.8 73.2-28.5 31.9-57.1 82.5-57.1 133.1 0 7.1 1.3 14.2 1.9 16.6 3.2.5 8.4 1.2 13.6 1.2 46.5 0 105.3-31.5 138-70.5z"/>
                </svg>
                Continuar com Apple
              </>
            )}
          </button>
        </div>

        <div className="signin-divider">
          <span>ou entre com e-mail</span>
        </div>

        <form onSubmit={handleEmail}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="seu@email.com.br"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
              onChange={e => setPassword(e.target.value)}
              required
              disabled={busy}
            />
          </div>
          <div className="form-footer">
            <label className="form-remember">
              <input type="checkbox" /> Lembrar de mim
            </label>
            <a href="#">Esqueci minha senha</a>
          </div>
          <button type="submit" className="btn-submit" disabled={busy}>
            {loading === 'email' ? 'Entrando…' : 'Entrar'}
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
