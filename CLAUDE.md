# Prisma Retail — Maquete

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
npm run build      # build para docs/ (deploy estático)
```

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

- Login simulado com Google, Apple ou e-mail/senha
- Usuário hardcoded: `{ name: 'Maria Silva', initials: 'MS' }`
- `ProtectedRoute` em `App.tsx` redireciona para `/entrar` se não autenticado

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
- **Carregado em dia anterior** → `23/05/2026 às 14:32` em **vermelho**

A **data** é extraída do nome do arquivo pela função `extractDateFromFilename()`.
A **hora** é o momento em que o usuário selecionou o arquivo.

#### Padrões de nome de arquivo suportados

Os arquivos reais do sistema seguem dois padrões principais (baseados em exemplos de `C:\Users\lovat\Downloads`):

| Padrão | Exemplo | Regex |
|---|---|---|
| `YYYYMMDD_` no início | `20260416_Loja_Indicadores_..._hash.xlsx` | `/^(\d{4})(\d{2})(\d{2})_/` |
| `DD-MM-YYYY` no meio | `GerencialVendas-02-05-2026.csv` | `/(\d{2})-(\d{2})-(\d{4})/` |

Fallbacks adicionais: `YYYY-MM-DD` e `DDMMYYYY` compacto. Se nenhum padrão for detectado, usa a data/hora do carregamento.

### Sidebar

- Toggle **Mensal / Anual** no topo
- Cada `SideItem` aceita `requires?: string[]` — lista de IDs de fontes de dados necessárias
- Se qualquer fonte em `requires` for `pending`: exibe **dot laranja** no item
- Se a fonte `parcial` for `pending` E `alertActive` for `true`: o dot **pulsa** (animação CSS)
- Ícones SVG copiados do `prototipo01.html` — objeto `IC` no topo do arquivo

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
| `.nav-warn-dot` | Dot laranja de aviso |
| `.nav-warn-dot--pulse` | Dot com animação de pulso |
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

## Branch e PR

- Branch principal: `main`
- Convenção de branches: `feature/<descricao>` ou `fix/<descricao>`
- Merges simples podem ser feitos localmente (`git merge` + `git push`) sem PR
- PRs via `gh` CLI: `C:\Program Files\GitHub CLI\gh.exe`
- Repositório: `https://github.com/cplovatto/maquete`

## Referência

- `prototipo01.html` — fonte de verdade para ícones SVG, estrutura de menu e lista de planilhas. Consultar sempre que precisar adicionar novos itens ao sidebar ou ao modal de importação.
- Exemplos de arquivos reais em `C:\Users\lovat\Downloads` — útil para testar padrões de nome de arquivo.
