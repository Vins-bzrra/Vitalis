import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useInstitucionalStore } from '@/stores/institucional'
import { usePacienteStore } from '@/stores/paciente'
import { useAtendimentoFluxoStore } from '@/stores/atendimentoFluxo'
import { useAuthStore } from '@/stores/auth'
import { auditService } from '@/services/auditService'
import { rotaProntuario } from '@/utils/patientAccess'
import type { Atendimento, Paciente } from '@/types'

export interface LinhaFila { atendimento: Atendimento; paciente: Paciente }

export type EtapaFila = 'aguardando_triagem' | 'em_triagem' | 'aguardando_medico' | 'em_atendimento' | 'outro'

const HOJE = '2026-09-25'

// Lógica de fila compartilhada entre a Recepção (`/atendimentos`, todas as
// etapas) e a Triagem (`/triagem`, apenas os estágios relevantes à
// enfermagem). Mantida em um único lugar para não duplicar regras de
// transição de etapa nem a decisão de navegação por perfil.
export function useFilaAtendimento() {
  const institucional = useInstitucionalStore()
  const pacienteStore = usePacienteStore()
  const fluxo = useAtendimentoFluxoStore()
  const auth = useAuthStore()
  const router = useRouter()

  const linhasBase = computed<LinhaFila[]>(() =>
    institucional.atendimentos
      .map((a) => ({ atendimento: a, paciente: pacienteStore.pacientes.find((p) => p.id === a.pacienteId) }))
      .filter((l): l is LinhaFila => !!l.paciente)
      .sort((a, b) => b.atendimento.dataEntrada.localeCompare(a.atendimento.dataEntrada))
  )

  function etapaDe(a: Atendimento): EtapaFila {
    if (a.status === 'aguardando_triagem') return a.etapaFluxo === 'triagem' ? 'em_triagem' : 'aguardando_triagem'
    if (a.status === 'aguardando_atendimento') return 'aguardando_medico'
    if (a.status === 'em_atendimento') return 'em_atendimento'
    return 'outro'
  }

  function abrirProntuario(pacienteId: string) {
    router.push(rotaProntuario(pacienteId))
  }

  function acaoPrincipal(l: LinhaFila) {
    const etapa = etapaDe(l.atendimento)
    fluxo.paciente = l.paciente
    fluxo.atendimento = l.atendimento
    if (etapa === 'aguardando_triagem' && auth.pode('acolhimento.registrar')) {
      router.push(`/pacientes/${l.paciente.id}/acolhimento?atendimento=${l.atendimento.id}`)
      return
    }
    if (etapa === 'em_triagem' && auth.pode('triagem.criar')) {
      if (auth.usuario) {
        auditService.registrar({
          usuario: auth.usuario.nome,
          perfil: auth.usuario.perfil,
          acao: 'Iniciou triagem',
          entidade: 'Atendimento',
          entidadeId: l.atendimento.id,
          detalhes: `Triagem iniciada para ${l.paciente.nome} a partir da fila (atendimento ${l.atendimento.numero}).`,
        })
      }
      router.push(`/pacientes/${l.paciente.id}/triagem/nova?atendimento=${l.atendimento.id}`)
      return
    }
    abrirProntuario(l.paciente.id)
  }

  function rotuloAcao(l: LinhaFila) {
    const etapa = etapaDe(l.atendimento)
    if (etapa === 'aguardando_triagem' && auth.pode('acolhimento.registrar')) return 'Acolher'
    if (etapa === 'em_triagem' && auth.pode('triagem.criar')) return 'Iniciar triagem'
    return 'Abrir prontuário'
  }

  function tempoDeEsperaMinutos(a: Atendimento): number {
    const inicio = new Date(a.dataEntrada).getTime()
    const agora = new Date('2026-09-25T12:00:00').getTime()
    return Math.max(0, Math.round((agora - inicio) / 60000))
  }

  return { institucional, pacienteStore, linhasBase, etapaDe, abrirProntuario, acaoPrincipal, rotuloAcao, tempoDeEsperaMinutos, HOJE }
}
