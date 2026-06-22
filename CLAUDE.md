# Velo Retail — Maquete

Protótipo interativo de um console de operações para gestão de redes de franquias de cosméticos. O objetivo é validar fluxos de UX e estrutura de navegação antes da implementação real do produto.

## Stack

- **React 18** + **TypeScript** + **Vite 5**
- **React Router v6** (HashRouter — sem servidor, navegação por `#`)
- Sem bibliotecas de componentes externas — todo o CSS é escrito à mão em `src/index.css`
- Sem backend — toda autenticação e dados são simulados em memória

## Rodar localmente

```bash
npm install
npm run dev        # dev server em http://localhost:5173
npm run typecheck  # verifica TypeScript sem compilar
npm run build      # build local (saída em docs/, gitignored)
```

Deploy para GitHub Pages é automático via `.github/workflows/deploy.yml` em cada push na `main` — **não commitar** a pasta `docs/`.

## Estrutura de arquivos

```
src/
  main.tsx                  # entry point
  App.tsx                   # roteamento raiz + providers
  index.css                 # todos os estilos (único arquivo CSS)
  context/
    AuthContext.tsx          # autenticação simulada
    ThemeContext.tsx         # tema claro/escuro (persiste em localStorage)
  pages/
    Landing.tsx              # página de marketing (rota "/")
    SignIn.tsx               # login simulado (rota "/entrar")
    AppShell.tsx             # shell principal do app (rota "/app/*")
prototipo/
  prototipo01.html           # protótipo HTML original — fonte de referência
                             # para menu, ícones SVG e fontes de dados
```

## Arquitetura geral

### Roteamento

```
/                → Landing
/entrar          → SignIn
/app/*           → AppShell (protegida por ProtectedRoute)
  /app/meta              Gestão Instantânea — Meta do Dia
  /app/parcial           Gestão Instantânea — Parcial do Dia
  /app/dia-anterior      Gestão Instantânea — Dia Anterior
  /app/lojas             Lojas — Visão Geral
  /app/lojas/regioes     Lojas — Análise Regional
  /app/lojas/ranking     Lojas — Ranking de Lojas
  /app/lojas/detalhe     Lojas — Detalhe da Loja
  /app/lojas/consultores Lojas — Consultores
  /app/lojas/dispersao   Lojas — Dispersão
  /app/iaf               IAF — Indicadores
  /app/iaf/detalhe       IAF — Detalhe
  /app/iaf/fluxo         IAF — Ação de Fluxo
  /app/iaf/skin          IAF — Skin (Cuidados Faciais)
  /app/iaf/servicos      IAF — Serviços
  /app/anual/lojas       Anual — Lojas
  /app/anual/regioes     Anual — Análise Regional
  /app/anual/ranking     Anual — Ranking de Lojas
  /app/anual/detalhe     Anual — Detalhe da Loja
  /app/anual/fluxo       Anual — Ação de Fluxo
  /app/anual/iaf         Anual — Indicadores IAF
  /app/anual/pef         Anual — Parcial PEF
  /app/dashboard         (legado — mantido para links diretos)
  /app/loja              (legado)
  /app/vd                (legado)
  /app/relatorios        (legado)
  /app/configuracoes     (legado)
```

### Autenticação (`AuthContext`)

- Login simulado com e-mail/senha (`demo` / `demo`) — único método ativo
- Botão do Google visível mas desabilitado (placeholder para futuro via Supabase Auth — ver #10)
- Apple Sign-In removido (exige Apple Developer Program $99/ano, sem justificativa para protótipo)
- Usuário hardcoded: `{ name: 'Maria Silva', initials: 'MS' }` (na prática `demo` gera `{ name: 'Demo', initials: 'DM' }`)
- `ProtectedRoute` em `App.tsx` redireciona para `/entrar` se não autenticado
- **Sessão não persiste** entre abas/fechar navegador — auth é puramente em memória (useState)
- Planos futuros: #7 (prefixo por usuário no localStorage), #10 (Google Login via Supabase OAuth PKCE)

### Tema (`ThemeContext`)

- Toggle claro/escuro via botão no header
- Persiste em `localStorage` com chave `prisma-theme`
- Aplica `data-theme="dark"` no `<html>` — o CSS usa variáveis CSS que mudam por atributo

---

## AppShell — o componente principal

Todo o app autenticado vive em `src/pages/AppShell.tsx`. Contém:

### FileStatusCtx (Context)

Context central que coordena o estado de arquivos e alertas. Provido pelo `AppShell`, consumido por `Sidebar`, `ImportModal`, `WipPage`, `SideItem` e outros.

```ts
interface FileStatusCtxType {
  statuses: Record<string, FileStatus>            // estado de cada fonte
  setStatuses: ...                                // setter direto (uso interno)
  onFileLoaded: (id: string, filename: string) => void  // chamar ao carregar arquivo
  openImport: () => void                          // abre o modal de importação
  lastLoaded: Record<string, Date>                // timestamp de carga por arquivo
  fileDates: Record<string, Date | null>          // data extraída do nome do arquivo
  lastParcialUpload: Date | null                  // timestamp do último upload parcial
  alertEnabled: boolean
  setAlertEnabled: ...
  alertIntervalMinutes: number                    // frequência do alerta (15/30/60/120/240)
  setAlertIntervalMinutes: ...
  alertActive: boolean                            // true quando é hora de atualizar parcial
  toastVisible: boolean
  setToastVisible: ...
}
```

`type FileStatus = 'embedded' | 'loaded' | 'pending'`

### Fontes de Dados

Definidas como arrays de `DataSource` antes do `AppShell`. O modal chama-se **"Fontes de Dados"**.

**`MENSAL_SOURCES`** (seções: Gestão Instantânea / IAF / Operações):

| id | Nome | Formato | Status inicial |
|---|---|---|---|
| `main` | Indicadores principais | XLSX | embedded |
| `meta` | Meta do dia | XLSX | embedded |
| `parcial` | Parcial do dia | CSV | pending |
| `dia-ant` | Dia anterior | CSV | pending |
| `meta-diaant` | Meta — Dia anterior | XLSX | pending |
| `iaf` | Relatório IAF | XLSX | embedded |
| `fluxo` | Ação de Fluxo | XLSX | embedded |
| `skin` | Skin (Cuidados Faciais) | XLSX | pending |
| `parcial-skin` | Parcial Skin | XLSX | pending |
| `servicos` | Serviços | XLSX | pending |

**`ANUAL_SOURCES`** (seções: Lojas / IAF):

| id | Nome | Formato | Status inicial |
|---|---|---|---|
| `anual-main` | Indicadores anuais | XLSX | pending |
| `anual-fluxo` | Ação de Fluxo anual | XLSX | pending |
| `anual-pef` | Parcial PEF | XLSX | pending |

### Exibição de status no modal de importação

Cada linha do modal mostra a data e hora do arquivo carregado:

- **Não carregado** → cinza, sem data
- **Carregado hoje** → `24/05/2026 às 14:32` em **verde**
- **Carregado em dia anterior** → `23/05/2026 às 14:32` em **vermelho** (stale)
- **Parcial — hora de atualizar** → data em **laranja** com sufixo “hora de atualizar”

A **data** é extraída do nome do arquivo pela função `extractDateFromFilename()`.
A **hora** é o momento em que o usuário selecionou o arquivo.

#### Padrões de nome de arquivo suportados

Os arquivos reais do sistema seguem dois padrões principais:

| Padrão | Exemplo | Regex |
|---|---|---|
| `YYYYMMDD_` no início | `20260416_Loja_Indicadores_..._hash.xlsx` | `/^(\d{4})(\d{2})(\d{2})_/` |
| `DD-MM-YYYY` no meio | `GerencialVendas-02-05-2026.csv` | `/(\d{2})-(\d{2})-(\d{4})/` |

Fallbacks adicionais: `YYYY-MM-DD` e `DDMMYYYY` compacto. Se nenhum padrão for detectado, usa a data/hora do carregamento.

### Sidebar

- Toggle **Mensal / Anual** no topo
- Cada `SideItem` aceita `requires?: string[]` — lista de IDs de fontes de dados necessárias
- `getNavWarn(requires)` agrega o estado de cada fonte (`getSourceState`) com prioridade: **vermelho** = missing, **laranja pulsante** = refresh (parcial), **laranja** = stale
- Ícones SVG copiados do `prototipo01.html` — objeto `IC` no topo do arquivo
- `NavLink` usa `end` (desde #6) para evitar que rotas pai (ex: `/app/lojas`) fiquem ativas quando uma filha está selecionada (ex: `/app/lojas/regioes`)

### Páginas (WipPage)

Todas as rotas da nova estrutura usam `WipPage`, que aceita:
- `title: string` — título da página
- `requires?: string[]` — IDs de fontes necessárias

Se alguma fonte em `requires` estiver `pending`, exibe **banner de aviso amarelo** com nome/formato do arquivo faltante e botão "Importar" que abre o modal.

### Sistema de alerta — Parcial do Dia

A Parcial do Dia é atualizada a cada minuto na fonte original. O sistema avisa o usuário que é hora de carregar uma nova planilha:

- **Timer**: `useEffect` com `setInterval` de 1 minuto
- **Baseline**: data do último upload de `parcial` (ou horário de login se nunca importou)
- **Disparo**: quando `elapsed >= alertIntervalMinutes`
- **Toast**: aparece no canto inferior direito com botão "Importar agora"
- **Reset**: ao carregar um novo arquivo `parcial` via `onFileLoaded('parcial', filename)`
- **Configuração**: modal "Configurações de alerta" no dropdown do perfil

### Dropdown do perfil (avatar no header)

Três opções:
1. **Importar planilhas** → abre `ImportModal`
2. **Configurações de alerta** → abre `AlertSettingsModal`
3. **Sair** → chama `logout()` e redireciona para `/`

### Modais

| Componente | Função |
|---|---|
| `ImportModal` | Lista todas as fontes (abas Mensal/Anual), permite upload de arquivo por linha, exibe data/hora de cada carga |
| `AlertSettingsModal` | Toggle ativar/desativar alerta + seletor de frequência + info da última importação |
| `ParcialAlertToast` | Toast fixo no canto inferior direito quando `alertActive && toastVisible` |

---

## CSS (`src/index.css`)

Arquivo único. Organização por seção com comentários `/* ── Nome ── */`.

### Variáveis principais (`:root` / `[data-theme="dark"]`)

```css
--brand-primary: #7c3aed        /* roxo principal */
--bg-page, --bg-surface, --bg-surface-hover, --bg-surface-2
--bg-border
--text-primary, --text-secondary, --text-muted
--shadow-sm/md/lg/xl
```

### Classes relevantes do sidebar

| Classe | Uso |
|---|---|
| `.nav-item` | Item de navegação (NavLink) |
| `.nav-item.active` | Item selecionado |
| `.nav-icon` | SVG dentro do nav-item (18×18px) |
| `.nav-warn-dot` | Dot de aviso no menu (cor via `--missing` / `--stale` / `--refresh`) |
| `.nav-warn-dot--missing` | Dot vermelho — arquivo não carregado |
| `.nav-warn-dot--stale` | Dot laranja — planilha de outro dia |
| `.nav-warn-dot--refresh` | Dot laranja — hora de atualizar (parcial) |
| `.nav-warn-dot--pulse` | Dot com animação de pulso (só em `refresh`) |
| `.nav-group` | Grupo de itens com título |
| `.nav-group-title` | Label uppercase do grupo |
| `.nav-sections` | Container dos grupos |
| `.sidebar-period-toggle` | Toggle Mensal/Anual |
| `.period-btn` / `.period-btn.active` | Botões do toggle |

### Classes do modal de importação

`.modal-overlay`, `.modal`, `.modal--sm`, `.modal-header`, `.modal-title`, `.modal-close`, `.modal-tabs`, `.modal-tab.active`, `.modal-body`, `.import-section-title`, `.import-row`, `.import-icon`, `.import-name`, `.import-status`, `.import-status.ok`, `.import-status.stale`, `.import-format-badge`, `.format-xlsx`, `.format-csv`

### Classes do sistema de alerta

`.parcial-toast`, `.parcial-toast-title`, `.parcial-toast-sub`, `.parcial-toast-import`, `.parcial-toast-dismiss`, `.toggle-switch`, `.toggle-slider`, `.alert-interval-btn.active`, `.missing-files-banner`, `.missing-file-chip`, `.missing-files-btn`

---

## Persistência de dados

### localStorage

Toda a persistência do protótipo usa **localStorage** (5–10 MB por origin). Chaves prefixadas com `prisma-`.

| Chave | Conteúdo | Est. tamanho |
|---|---|---|
| `prisma-data-main` | Indicadores principais por loja (MainRow[]) | ~40 KB |
| `prisma-data-main-total` | Totais consolidados | ~1 KB |
| `prisma-data-cp` | Aba CP (valores consolidados) | ~1 KB |
| `prisma-data-fluxo` | Ação de Fluxo por loja | ~20 KB |
| `prisma-data-fluxo-total` | Total fluxo | ~0.5 KB |
| `prisma-data-consultor` | Consultores por loja | ~40 KB |
| `prisma-data-fluxo-consultor` | Fluxo por consultor | ~30 KB |
| `prisma-lojas` | Cadastro de lojas | ~10 KB |
| `prisma-labels` | Sistema de etiquetas | ~2 KB |
| `prisma-file-statuses` | Estado das fontes de dados | ~2 KB |
| `prisma-file-lastloaded` | Timestamps de carga | ~2 KB |
| `prisma-file-dates` | Datas extraídas dos nomes | ~2 KB |
| `prisma-parcial-upload` | Último upload do parcial | ~0.5 KB |
| `prisma-prefs-*` | Preferências de alerta | ~1 KB |
| `prisma-theme` | Tema claro/escuro | ~0.5 KB |
| **Total** | | **~150 KB** |

Isso representa ~3% do limite mínimo de 5 MB. Para redes de até ~100 lojas com dados de um único dia, localStorage é mais que suficiente.

### Índices de navegação (dots no sidebar)

| Indicador | Onde | Significado |
|---|---|---|
| ⬤ Vermelho fixo | Itens com `requires` em estado `missing` | Arquivo obrigatório não carregado |
| ⬤ Laranja fixo | Itens com `requires` em estado `stale` | Planilha de outro dia — atualizar dados |
| ⬤ Laranja pulsante | Parcial do Dia em estado `refresh` | Hora de reimportar o parcial (timer) |
| 🔴 Badge vermelho | Ícone de sino no header | Notificações não lidas (hardcoded `3`) |

Estados por fonte (`getSourceState`): `missing` (pending) → `stale` (data ≠ hoje) → `refresh` (parcial + timer) → `ok`. Prioridade no menu: missing > refresh > stale.

### Estratégia futura de dados

Documentada nos issues:
- **#7** — Prefixar chaves localStorage por usuário (`prisma:{userId}:*`) para suporte multi-usuário
- **#8** — ADR: IndexedDB vs backend. Decisão: pular IndexedDB, ir direto para backend se o protótipo virar produto
- **#9** — Modo demo: limpar dados automaticamente a cada 8h para testers
- **#10** — Google Login via Supabase Auth (substituir `demo/demo`)

## Branch e PR

- Branch principal: `main`
- Convenção de branches: `feature/<descricao>` ou `fix/<descricao>`
- Merges simples podem ser feitos localmente (`git merge` + `git push`) sem PR
- PRs via `gh` CLI: `C:\Program Files\GitHub CLI\gh.exe`
- Repositório: `https://github.com/cplovatto/maquete`

## Referência

- `prototipo01.html` — fonte de verdade para ícones SVG, estrutura de menu e lista de planilhas. Consultar sempre que precisar adicionar novos itens ao sidebar ou ao modal de importação.
