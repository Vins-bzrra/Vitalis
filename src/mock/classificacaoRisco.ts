import type { ClassificacaoRisco, NivelRisco } from '@/types'

export const CLASSIFICACOES_RISCO: Record<NivelRisco, ClassificacaoRisco> = {
  1: { nivel: 1, cor: 'var(--color-risk-1)', label: 'Emergência', tempoMaximoEspera: 'Atendimento imediato' },
  2: { nivel: 2, cor: 'var(--color-risk-2)', label: 'Muito urgente', tempoMaximoEspera: 'Até 10 min' },
  3: { nivel: 3, cor: 'var(--color-risk-3)', label: 'Urgente', tempoMaximoEspera: 'Até 60 min' },
  4: { nivel: 4, cor: 'var(--color-risk-4)', label: 'Pouco urgente', tempoMaximoEspera: 'Até 120 min' },
  5: { nivel: 5, cor: 'var(--color-risk-5)', label: 'Não urgente', tempoMaximoEspera: 'Até 240 min' },
}
