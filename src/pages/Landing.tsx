import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

interface PricingFeature { label: string; ok: boolean }
interface PricingCardProps {
  name: string; price: string; desc: string
  features: PricingFeature[]; cta: string; featured?: boolean
}

function PricingCard({ name, price, desc, features, cta, featured }: PricingCardProps) {
  return (
    <div className={`pricing-card${featured ? ' featured' : ''}`}>
      <div className="pricing-plan">{name}</div>
      <div className="pricing-price">
        <span className="pricing-currency">R$</span>
        <span className="pricing-amount">{price}</span>
        <span className="pricing-period">/mês</span>
      </div>
      <p className="pricing-desc">{desc}</p>
      <ul className="pricing-features">
        {features.map(f => (
          <li key={f.label} className={f.ok ? '' : 'off'}>
            <span className={f.ok ? 'check-icon' : 'x-icon'}>{f.ok ? '✓' : '✗'}</span>
            {f.label}
          </li>
        ))}
      </ul>
      <Link to="/entrar" className={`pricing-cta ${featured ? 'pricing-cta-primary' : 'pricing-cta-secondary'}`}>
        {cta}
      </Link>
    </div>
  )
}

export default function Landing() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div>
      {/* Navbar */}
      <nav className="nav">
        <a href="#topo" className="nav-logo" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <div className="nav-logo-icon">💎</div>
          <span className="nav-logo-text">Prisma Retail</span>
        </a>
        <ul className="nav-links">
          <li><a onClick={() => scrollTo('produtos')}>Produtos</a></li>
          <li><a onClick={() => scrollTo('precos')}>Preços</a></li>
          <li><a onClick={() => scrollTo('sobre')}>Sobre</a></li>
          <li><a onClick={() => scrollTo('footer')}>Contato</a></li>
        </ul>
        <div className="nav-actions">
          <button className="theme-toggle" onClick={toggleTheme} title="Alternar tema">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <Link to="/entrar" className="btn btn-ghost">Entrar</Link>
          <Link to="/entrar" className="btn btn-gradient">Começar Grátis</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" id="topo">
        <div className="hero-bg" />
        <div className="hero-badge">🧪 Maquete — Demonstração Visual</div>
        <h1>
          Gestão de Varejo<br />
          <span className="gradient-text">Simples e Poderosa</span>
        </h1>
        <p>
          O <strong>Prisma Retail</strong> unifica a operação da sua{' '}
          <strong>Loja</strong> e equipe de{' '}
          <strong>Venda Direta</strong> no segmento de cosméticos.
          Tudo em um só lugar, feito para o Brasil.
        </p>
        <div className="hero-actions">
          <Link to="/entrar" className="btn btn-gradient btn-lg">
            Começar Gratuitamente
          </Link>
          <button className="btn btn-secondary btn-lg" onClick={() => scrollTo('produtos')}>
            Conhecer os Produtos
          </button>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">2.400+</div>
            <div className="hero-stat-label">Lojas ativas</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">18.000+</div>
            <div className="hero-stat-label">Consultoras VD</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">R$ 4,2B</div>
            <div className="hero-stat-label">Em vendas processadas</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">99,9%</div>
            <div className="hero-stat-label">Disponibilidade</div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="produtos">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-badge">Nossos Produtos</div>
            <h2>Duas soluções, um ecossistema</h2>
            <p>
              Desenvolvido especificamente para o varejo de cosméticos,
              com foco na realidade do mercado brasileiro.
            </p>
          </div>
          <div className="product-cards">
            <div className="product-card">
              <div className="product-icon product-icon-loja">🏪</div>
              <h3>Prisma Loja</h3>
              <p>
                Gestão completa do ponto de venda: estoque, frente de caixa,
                clientes e relatórios integrados para lojas de cosméticos.
              </p>
              <ul className="product-features">
                {['Frente de caixa (PDV)', 'Controle de estoque', 'Cadastro de clientes',
                  'Emissão de NF-e e NFC-e', 'Gestão de fornecedores', 'Relatórios e BI'].map(f => (
                  <li key={f}><span className="feature-check">✓</span>{f}</li>
                ))}
              </ul>
            </div>
            <div className="product-card">
              <div className="product-icon product-icon-vd">💄</div>
              <h3>Prisma VD</h3>
              <p>
                Plataforma completa de Venda Direta: gerencie sua rede de consultoras,
                catálogo digital, pedidos e comissões com facilidade.
              </p>
              <ul className="product-features">
                {['Gestão de consultoras', 'Catálogo digital', 'Pedidos e devoluções',
                  'Cálculo de comissões', 'App para consultoras', 'Metas e gamificação'].map(f => (
                  <li key={f}><span className="feature-check">✓</span>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="sobre" style={{ background: 'var(--bg-surface-2)' }}>
        <div className="section-inner">
          <div className="section-header">
            <div className="section-badge">Como Funciona</div>
            <h2>Do cadastro ao relatório em minutos</h2>
            <p>Configuração simples e intuitiva. Sem precisar de TI.</p>
          </div>
          <div className="product-cards">
            {[
              { icon: '🚀', title: '1. Cadastre sua empresa', desc: 'Configure sua loja, produtos e equipe em poucos cliques. Importação de planilhas inclusa.' },
              { icon: '🔗', title: '2. Conecte seus canais', desc: 'Integre PDV, e-commerce, marketplace e sua rede de consultoras em uma única plataforma.' },
              { icon: '📊', title: '3. Acompanhe em tempo real', desc: 'Dashboard completo com vendas, estoque, comissões e metas atualizados em tempo real.' },
            ].map(s => (
              <div className="product-card" key={s.title} style={{ textAlign: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="pricing-bg">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-badge">Planos e Preços</div>
            <h2>Escolha o plano ideal</h2>
            <p>Comece grátis por 14 dias. Sem cartão de crédito. Cancele quando quiser.</p>
          </div>
          <div className="pricing-cards">
            <PricingCard
              name="Essencial"
              price="149"
              desc="Ideal para lojas pequenas e consultoras autônomas que estão começando."
              features={[
                { label: 'Até 3 usuários', ok: true },
                { label: '1 ponto de venda', ok: true },
                { label: 'Controle de estoque básico', ok: true },
                { label: 'Relatórios simples', ok: true },
                { label: 'Suporte por e-mail', ok: true },
                { label: 'Integração fiscal (NF-e)', ok: false },
                { label: 'Módulo VD integrado', ok: false },
                { label: 'API e integrações', ok: false },
              ]}
              cta="Começar Grátis"
            />
            <PricingCard
              name="Profissional"
              price="349"
              desc="Para negócios em crescimento que precisam de recursos avançados e suporte dedicado."
              features={[
                { label: 'Até 15 usuários', ok: true },
                { label: 'PDVs ilimitados', ok: true },
                { label: 'Estoque avançado com alertas', ok: true },
                { label: 'BI e relatórios completos', ok: true },
                { label: 'Suporte prioritário', ok: true },
                { label: 'Integração fiscal (NF-e/NFC-e)', ok: true },
                { label: 'Módulo VD integrado', ok: true },
                { label: 'API e integrações', ok: false },
              ]}
              cta="Começar Grátis"
              featured
            />
            <PricingCard
              name="Enterprise"
              price="749"
              desc="Para grandes redes e operações complexas com necessidades específicas."
              features={[
                { label: 'Usuários ilimitados', ok: true },
                { label: 'Multi-CNPJ', ok: true },
                { label: 'Estoque com WMS', ok: true },
                { label: 'BI customizado', ok: true },
                { label: 'SLA e suporte 24/7', ok: true },
                { label: 'Integração fiscal completa', ok: true },
                { label: 'Módulo VD integrado', ok: true },
                { label: 'API e integrações ilimitadas', ok: true },
              ]}
              cta="Falar com Vendas"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div className="nav-logo-icon">💎</div>
                <span className="nav-logo-text">Prisma Retail</span>
              </div>
              <p className="footer-brand-desc">
                Plataforma de gestão para o varejo de cosméticos brasileiro.
                Loja física e Venda Direta em um único ecossistema.
              </p>
            </div>
            <div className="footer-col">
              <h4>Produto</h4>
              <ul>
                <li><a href="#">Prisma Loja</a></li>
                <li><a href="#">Prisma VD</a></li>
                <li><a href="#">Preços</a></li>
                <li><a href="#">Novidades</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Empresa</h4>
              <ul>
                <li><a href="#">Sobre nós</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Carreiras</a></li>
                <li><a href="#">Contato</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Suporte</h4>
              <ul>
                <li><a href="#">Central de Ajuda</a></li>
                <li><a href="#">Documentação</a></li>
                <li><a href="#">Status</a></li>
                <li><a href="#">Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Prisma Retail. Todos os direitos reservados.</p>
            <span className="footer-badge">🧪 Maquete — Apenas Demo</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
