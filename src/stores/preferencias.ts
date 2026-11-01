import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Preferências de priorização por usuário: cada profissional escolhe os
// setores em que atua e o sistema passa a mostrar esses pacientes PRIMEIRO
// (painel, lista de pacientes, atendimentos). Nada fica escondido — os demais
// pacientes continuam acessíveis logo abaixo ou pelo botão "ver todos".

export interface Preferencias {
  setoresPrioritarios: string[]
  /** Quando true, as listas abrem mostrando só os setores priorizados. */
  somenteMeusSetores: boolean
  abaPainel: 'urgencia' | 'internados'
  modeloEvolucaoPadrao: string
}

const PADRAO: Preferencias = {
  setoresPrioritarios: [],
  somenteMeusSetores: false,
  abaPainel: 'urgencia',
  modeloEvolucaoPadrao: '',
}

// Valores iniciais de demonstração para alguns usuários fictícios, para que o
// efeito da priorização apareça já no primeiro acesso.
const PADRAO_DEMO: Record<string, Partial<Preferencias>> = {
  'usr-001': { setoresPrioritarios: ['UTI Geral'], abaPainel: 'internados', modeloEvolucaoPadrao: 'me-uti' },
  'usr-005': { setoresPrioritarios: ['UTI Geral'], abaPainel: 'internados' },
}

const chave = (usuarioId: string) => `propprontuario-prefs-${usuarioId}`

function ler(usuarioId: string): Preferencias {
  try {
    const bruto = localStorage.getItem(chave(usuarioId))
    if (bruto) return { ...PADRAO, ...JSON.parse(bruto) }
  } catch { /* armazenamento indisponível */ }
  return { ...PADRAO, ...PADRAO_DEMO[usuarioId] }
}

export const usePreferenciasStore = defineStore('preferencias', {
  state: () => ({ usuarioId: '' as string, prefs: { ...PADRAO } as Preferencias }),
  getters: {
    temPrioridade: (s) => s.prefs.setoresPrioritarios.length > 0,
  },
  actions: {
    /** Garante que as preferências carregadas pertencem ao usuário logado. */
    sincronizar() {
      const id = useAuthStore().usuario?.id ?? ''
      if (id === this.usuarioId) return
      this.usuarioId = id
      this.prefs = id ? ler(id) : { ...PADRAO }
    },
    atualizar(parcial: Partial<Preferencias>) {
      this.sincronizar()
      this.prefs = { ...this.prefs, ...parcial }
      if (!this.usuarioId) return
      try { localStorage.setItem(chave(this.usuarioId), JSON.stringify(this.prefs)) } catch { /* armazenamento indisponível */ }
    },
    doMeuSetor(setor?: string) {
      this.sincronizar()
      return !!setor && this.prefs.setoresPrioritarios.includes(setor)
    },
  },
})

/**
 * Ordena uma lista colocando primeiro os itens dos setores priorizados pelo
 * usuário, mantendo a ordem original dentro de cada grupo.
 */
export function priorizarPorSetor<T>(itens: T[], setorDe: (item: T) => string | undefined, setores: string[]): T[] {
  if (!setores.length) return itens
  const meus = itens.filter((i) => setores.includes(setorDe(i) ?? ''))
  const outros = itens.filter((i) => !setores.includes(setorDe(i) ?? ''))
  return [...meus, ...outros]
}
