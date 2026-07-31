import { createContext, useCallback, useContext, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'

/*
 * Dados do Canal VD (Venda Direta) — DADOS DE EXEMPLO gerados de forma
 * determinística (sem PII, sem nomes reais de pessoas).
 *
 * A estrutura (Gerente → Equipe → Revendedoras, buckets de ciclos sem
 * comprar, indicadores de Líquidas/Financeiro/Ativos/Mix de produto,
 * adensamento por município) reflete o formato real da planilha "BASE
 * CICLO" usada pela operação — só os valores e nomes são fictícios.
 * A alimentação com dados reais (import de planilha) fica para uma
 * etapa futura.
 */

export const CICLO_ATUAL = 'Ciclo 09 (exemplo)'

/** Espaços do Revendedor — lojas físicas de atendimento só pra revendedoras. */
export const ERS = ['Caxias do Sul', 'Santa Maria', 'Uruguaiana', 'Bagé'] as const
export type VdEr = typeof ERS[number]

/** Classificação funcional da equipe: foco em captar revendedoras novas, ou em manter/reativar a base existente. */
export const TIMES = ['Início', 'Base'] as const
export type VdTime = typeof TIMES[number]

export interface VdEquipeRow {
  id: string
  /** nome da supervisora que lidera a equipe */
  nome: string
  time: VdTime
  er: VdEr
  /** contagem de revendedoras por ciclos consecutivos sem comprar, índice 0..6 */
  base: number[]
  baseTotal: number
  metaCadastro: number
  iniciosReinicios: number
  liquidas: number
  premiacao: number | null
  metaFinanceira: number
  realizadoFinanceiro: number
  metaAtivos: number
  realizadoAtivos: number
  ativasBase: number
  skinQtd: number
  makeQtd: number
  multimarcaQtd: number
  cabelosQtd: number
  /** % (0-100) de dias/ações no ciclo em que a supervisora usou a plataforma pra tratar as revendedoras */
  vdiUsoPct: number
  /** % (0-100) da base com treinamento concluído */
  treinamentoPct: number
  /**
   * % (0-100) de satisfação das revendedoras — placeholder. A definição exata
   * dessa métrica ainda vai ser explicada pelo operador quando importarmos a
   * planilha real; por enquanto é só um número de exemplo.
   */
  satisfacaoPct: number
}

export interface VdMunicipioRow {
  municipio: string
  base: number
  populacao: number
  adensamentoAtual: number
  tendencia: 'CRESCEU' | 'CAIU' | 'MANTEVE'
  metaAnual: number
  metaBase: number
  liquidasCiclo: number
}

export interface VdRevendedoraSample {
  id: string
  nome: string
  ciclosInatividade: number
  situacao: 'Ativo' | 'Inativo'
  papel: string
}

/* ── PRNG determinístico (mulberry32) — mesma seed sempre gera os mesmos dados ── */
function mulberry32(seed: number) {
  let s = seed
  return function rand() {
    s |= 0; s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rand: () => number, min: number, max: number): number {
  return min + rand() * (max - min)
}

const TOTAL_EQUIPES = 30
/** proporção observada na planilha real: minoria das equipes é especializada em Início/Reinício */
const CHANCE_TIME_INICIO = 0.2

/** distribuição observada na base real (Total Geral): bucket 0..6 */
const BASE_BUCKET_WEIGHTS = [0.134, 0.318, 0.131, 0.174, 0.121, 0.069, 0.053]

const PAPEL_LADDER = [
  { papel: 'Bronze', peso: 0.49 },
  { papel: 'Cobre', peso: 0.31 },
  { papel: 'Prata', peso: 0.15 },
  { papel: 'Ouro', peso: 0.05 },
]

function distribuiBuckets(rand: () => number, total: number): number[] {
  const weights = BASE_BUCKET_WEIGHTS.map(w => w * pick(rand, 0.8, 1.2))
  const sumW = weights.reduce((a, b) => a + b, 0)
  const buckets = weights.map(w => Math.round((w / sumW) * total))
  const diff = total - buckets.reduce((a, b) => a + b, 0)
  buckets[1] += diff // ajusta o arredondamento no bucket mais populoso
  return buckets.map(b => Math.max(0, b))
}

function generateEquipes(seed: number): VdEquipeRow[] {
  const rand = mulberry32(seed)
  const equipes: VdEquipeRow[] = []

  for (let n = 1; n <= TOTAL_EQUIPES; n++) {
    const baseTotal = Math.round(pick(rand, 220, 620))
    const base = distribuiBuckets(rand, baseTotal)
    const time: VdTime = rand() < CHANCE_TIME_INICIO ? 'Início' : 'Base'

    const metaCadastro = Math.round(baseTotal * pick(rand, 0.04, 0.07))
    const iniciosReinicios = Math.max(0, Math.round(metaCadastro * pick(rand, 0.5, 1.5)))
    const liquidas = iniciosReinicios - Math.round(metaCadastro * pick(rand, 0.3, 0.9))
    const premiacao = liquidas >= 4 ? [45, 45, 60, 100][Math.floor(pick(rand, 0, 4))] : null

    const metaFinanceira = Math.round(pick(rand, 80_000, 320_000))
    const realizadoFinanceiro = Math.round(metaFinanceira * pick(rand, 0.25, 1.15))

    const metaAtivos = Math.round(baseTotal * pick(rand, 0.4, 0.55))
    const realizadoAtivos = Math.round(metaAtivos * pick(rand, 0.3, 1.1))
    const ativasBase = realizadoAtivos

    const skinQtd = Math.round(ativasBase * pick(rand, 0.2, 0.4))
    const makeQtd = Math.round(ativasBase * pick(rand, 0.35, 0.55))
    const multimarcaQtd = Math.round(ativasBase * pick(rand, 0.4, 0.6))
    const cabelosQtd = Math.round(ativasBase * pick(rand, 0.1, 0.3))

    const vdiUsoPct = pick(rand, 55, 100)
    const treinamentoPct = pick(rand, 70, 100)
    const satisfacaoPct = pick(rand, 65, 100)

    equipes.push({
      id: `equipe-${n}`,
      nome: `Supervisora ${String(n).padStart(2, '0')}`,
      time,
      er: ERS[(n - 1) % ERS.length],
      base, baseTotal,
      metaCadastro, iniciosReinicios, liquidas, premiacao,
      metaFinanceira, realizadoFinanceiro,
      metaAtivos, realizadoAtivos, ativasBase,
      skinQtd, makeQtd, multimarcaQtd, cabelosQtd,
      vdiUsoPct, treinamentoPct, satisfacaoPct,
    })
  }
  return equipes
}

/** Municípios reais da região (nome + população — dado público, não pessoal). */
const MUNICIPIOS_BASE: { nome: string; populacao: number }[] = [
  { nome: 'ACEGUÁ', populacao: 4170 },
  { nome: 'BAGÉ', populacao: 117938 },
  { nome: 'BARRA DO QUARAÍ', populacao: 4241 },
  { nome: 'CAÇAPAVA DO SUL', populacao: 32515 },
  { nome: 'CACEQUI', populacao: 11157 },
  { nome: 'CAMPO BOM', populacao: 62886 },
  { nome: 'CANDIOTA', populacao: 10710 },
  { nome: 'CAXIAS DO SUL', populacao: 463501 },
  { nome: 'DILERMANDO DE AGUIAR', populacao: 2806 },
  { nome: 'DOM PEDRITO', populacao: 36981 },
  { nome: 'HULHA NEGRA', populacao: 5976 },
  { nome: 'ITAARA', populacao: 5572 },
  { nome: 'ITAQUI', populacao: 35768 },
  { nome: 'LAVRAS DO SUL', populacao: 7157 },
  { nome: 'MAÇAMBARÁ', populacao: 4425 },
  { nome: 'PEDRAS ALTAS', populacao: 2061 },
  { nome: 'PINHEIRO MACHADO', populacao: 11214 },
  { nome: 'QUARAÍ', populacao: 23500 },
  { nome: 'ROSÁRIO DO SUL', populacao: 36630 },
  { nome: 'SANTA MARGARIDA DO SUL', populacao: 2596 },
  { nome: 'SANTA MARIA', populacao: 271735 },
  { nome: 'SANTANA DA BOA VISTA', populacao: 7024 },
  { nome: 'SANTANA DO LIVRAMENTO', populacao: 84421 },
  { nome: 'SÃO GABRIEL', populacao: 58487 },
  { nome: 'SÃO JOÃO DO POLÊSINE', populacao: 2649 },
  { nome: 'SÃO MARTINHO DA SERRA', populacao: 2860 },
  { nome: 'SÃO PEDRO DO SUL', populacao: 15577 },
  { nome: 'SILVEIRA MARTINS', populacao: 2028 },
  { nome: 'TOROPI', populacao: 2554 },
  { nome: 'URUGUAIANA', populacao: 117210 },
]

function generateMunicipios(): VdMunicipioRow[] {
  const rand = mulberry32(7)
  return MUNICIPIOS_BASE.map(({ nome, populacao }) => {
    const densidadePor10k = pick(rand, 4, 11)
    const base = Math.max(1, Math.round((populacao / 10000) * densidadePor10k))
    const adensamentoAtual = (base / populacao) * 10000
    const liquidasCiclo = pick(rand, -3, 8)
    const tendencia: VdMunicipioRow['tendencia'] = liquidasCiclo > 0.3 ? 'CRESCEU' : liquidasCiclo < -0.3 ? 'CAIU' : 'MANTEVE'
    const metaAnual = adensamentoAtual + pick(rand, 0.5, 2)
    const metaBase = (populacao / 10000) * metaAnual
    return { municipio: nome, base, populacao, adensamentoAtual, tendencia, metaAnual, metaBase, liquidasCiclo }
  })
}

function pickPapel(rand: () => number): string {
  const r = rand()
  let acc = 0
  for (const { papel, peso } of PAPEL_LADDER) {
    acc += peso
    if (r <= acc) return papel
  }
  return 'Bronze'
}

function generateRevendedorasAmostra(equipeId: string, equipe: VdEquipeRow | undefined): VdRevendedoraSample[] {
  const seed = equipeId.split('-').reduce((a, c) => a + c.length, 0) * 1000 + (equipe?.baseTotal ?? 0)
  const rand = mulberry32(seed || 1)
  const n = 20
  const out: VdRevendedoraSample[] = []
  for (let i = 1; i <= n; i++) {
    const buckets = distribuiBuckets(rand, 100) // pesos relativos
    let roll = pick(rand, 0, 100)
    let ciclosInatividade = 6
    let acc = 0
    for (let b = 0; b < buckets.length; b++) {
      acc += buckets[b]
      if (roll <= acc) { ciclosInatividade = b; break }
    }
    const chanceAtivo = ciclosInatividade <= 3 ? 0.9 : ciclosInatividade === 4 ? 0.6 : ciclosInatividade === 5 ? 0.3 : 0.1
    const situacao: VdRevendedoraSample['situacao'] = rand() < chanceAtivo ? 'Ativo' : 'Inativo'
    out.push({
      id: `${equipeId}-r${String(i).padStart(3, '0')}`,
      nome: `Revendedora ${String(i).padStart(3, '0')}`,
      ciclosInatividade,
      situacao,
      papel: pickPapel(rand),
    })
  }
  return out.sort((a, b) => a.ciclosInatividade - b.ciclosInatividade)
}

interface VdDataCtxType {
  ciclo: string
  equipes: VdEquipeRow[]
  /** dataset independente (outra seed) pra alternar Ciclo/Ano no IAF — ainda 100% exemplo, sem cálculo real de acumulado anual */
  equipesAno: VdEquipeRow[]
  municipios: VdMunicipioRow[]
  getRevendedorasAmostra: (equipeId: string) => VdRevendedoraSample[]
}

const VdDataCtx = createContext<VdDataCtxType | null>(null)

export function VdDataProvider({ children }: { children: ReactNode }) {
  const equipes = useMemo(() => generateEquipes(42), [])
  const equipesAno = useMemo(() => generateEquipes(4242), [])
  const municipios = useMemo(() => generateMunicipios(), [])
  const sampleCache = useRef(new Map<string, VdRevendedoraSample[]>())

  const getRevendedorasAmostra = useCallback((equipeId: string) => {
    if (!sampleCache.current.has(equipeId)) {
      const equipe = equipes.find(e => e.id === equipeId)
      sampleCache.current.set(equipeId, generateRevendedorasAmostra(equipeId, equipe))
    }
    return sampleCache.current.get(equipeId)!
  }, [equipes])

  const value = useMemo(
    () => ({ ciclo: CICLO_ATUAL, equipes, equipesAno, municipios, getRevendedorasAmostra }),
    [equipes, equipesAno, municipios, getRevendedorasAmostra],
  )

  return <VdDataCtx.Provider value={value}>{children}</VdDataCtx.Provider>
}

export function useVdData() {
  const ctx = useContext(VdDataCtx)
  if (!ctx) throw new Error('useVdData deve ser usado dentro de VdDataProvider')
  return ctx
}
