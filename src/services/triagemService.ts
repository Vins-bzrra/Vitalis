import { ATENDIMENTOS, PACIENTES } from '@/mock/pacientes'
import { auditService } from '@/services/auditService'
import type { ClassificacaoRisco, PerfilUsuario, SinaisVitais, Triagem } from '@/types'

const delay = (ms = 380) => new Promise((resolve) => setTimeout(resolve, ms))
const AGORA = () => new Date('2026-09-25T12:00:00')

function dataHoraAtual() {
  const agora = AGORA()
  return { data: agora.toISOString().slice(0, 10), hora: agora.toTimeString().slice(0, 5) }
}

export interface RegistrarTriagemInput {
  atendimentoId: string
  vitais: Omit<SinaisVitais, 'id' | 'data' | 'hora'>
  queixaPrincipal: string
  observacoes: string
  classificacaoRisco: ClassificacaoRisco
  profissional: string
  perfilProfissional: PerfilUsuario
}

export const triagemService = {
  async registrar(input: RegistrarTriagemInput): Promise<Triagem> {
    await delay()
    const atendimento = ATENDIMENTOS.find((a) => a.id === input.atendimentoId)
    if (!atendimento) throw new Error('Atendimento não encontrado.')
    const paciente = PACIENTES.find((p) => p.id === atendimento.pacienteId)
    if (!paciente) throw new Error('Paciente não encontrado.')

    const { data, hora } = dataHoraAtual()

    const triagem: Triagem = {
      id: `tri-${Math.random().toString(36).slice(2, 9)}`,
      data, hora,
      profissional: input.profissional,
      vitais: { id: `sv-${Math.random().toString(36).slice(2, 9)}`, data, hora, ...input.vitais },
      queixaPrincipal: input.queixaPrincipal,
      observacoes: input.observacoes,
      classificacaoRisco: input.classificacaoRisco,
    }

    // Cada triagem é um novo registro histórico — nunca sobrescreve as anteriores.
    atendimento.triagens.push(triagem)
    atendimento.status = 'aguardando_atendimento'
    atendimento.etapaFluxo = 'aguardando_medico'
    if (input.queixaPrincipal) atendimento.queixaPrincipal = input.queixaPrincipal

    atendimento.timeline.push({
      id: `tl-${Math.random().toString(36).slice(2, 9)}`,
      tipo: 'triagem',
      data, hora,
      profissional: input.profissional,
      setor: 'Classificação de Risco',
      descricao: `Triagem realizada. PA ${triagem.vitais.pressaoArterial}, FC ${triagem.vitais.frequenciaCardiaca}bpm, SatO2 ${triagem.vitais.saturacao}%.`,
    })
    atendimento.timeline.push({
      id: `tl-${Math.random().toString(36).slice(2, 9)}`,
      tipo: 'classificacao_risco',
      data, hora,
      profissional: input.profissional,
      setor: 'Classificação de Risco',
      descricao: `Classificação: ${input.classificacaoRisco.label}. ${input.observacoes || ''}`.trim(),
    })

    paciente.statusAtual = 'aguardando_atendimento'

    await auditService.registrar({
      usuario: input.profissional,
      perfil: input.perfilProfissional,
      acao: 'Concluiu triagem',
      entidade: 'Triagem',
      entidadeId: triagem.id,
      detalhes: `Triagem concluída para ${paciente.nome} — classificação ${input.classificacaoRisco.label}.`,
    })
    await auditService.registrar({
      usuario: input.profissional,
      perfil: input.perfilProfissional,
      acao: 'Registrou classificação de risco',
      entidade: 'ClassificacaoRisco',
      entidadeId: triagem.id,
      detalhes: `${input.classificacaoRisco.label} atribuída ao atendimento ${atendimento.numero}.`,
    })

    return triagem
  },
}
