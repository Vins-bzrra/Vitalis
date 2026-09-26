import { ATENDIMENTOS, PACIENTES } from '@/mock/pacientes'
import { auditService } from '@/services/auditService'
import type { Acolhimento, Atendimento, PerfilUsuario, TipoAtendimento } from '@/types'

const delay = (ms = 320) => new Promise((resolve) => setTimeout(resolve, ms))
const AGORA = () => new Date('2026-09-25T12:00:00')

let sequenciaAtendimento = 540

function gerarNumeroAtendimento(): string {
  sequenciaAtendimento += 1
  return `AT-2026-${String(sequenciaAtendimento).padStart(5, '0')}`
}

function dataHoraAtual() {
  const agora = AGORA()
  return { data: agora.toISOString().slice(0, 10), hora: agora.toTimeString().slice(0, 5) }
}

export interface IniciarAtendimentoInput {
  pacienteId: string
  tipo: TipoAtendimento
  setor: string
  motivoEntrada: string
  queixaPrincipal: string
  observacoes?: string
  profissional: string
  perfilProfissional: PerfilUsuario
}

export interface RegistrarAcolhimentoInput {
  motivoProcura: string
  queixaPrincipal: string
  inicioSintomas: string
  caracteristicas: string
  observacoes: string
  prioridadePercebida: string
  atendimentoImediato: boolean
  profissional: string
  perfilProfissional: PerfilUsuario
}

export const atendimentoService = {
  async iniciar(input: IniciarAtendimentoInput): Promise<Atendimento> {
    await delay()
    const paciente = PACIENTES.find((p) => p.id === input.pacienteId)
    if (!paciente) throw new Error('Paciente não encontrado.')

    const { data, hora } = dataHoraAtual()
    const agora = AGORA()

    const atendimento: Atendimento = {
      id: `atd-${Math.random().toString(36).slice(2, 9)}`,
      pacienteId: input.pacienteId,
      numero: gerarNumeroAtendimento(),
      tipo: input.tipo,
      etapaFluxo: 'acolhimento',
      dataEntrada: agora.toISOString(),
      status: 'aguardando_triagem',
      setor: input.setor,
      motivoEntrada: input.motivoEntrada,
      queixaPrincipal: input.queixaPrincipal,
      historiaDoencaAtual: input.observacoes ?? '',
      timeline: [
        {
          id: `tl-${Math.random().toString(36).slice(2, 9)}`,
          tipo: 'entrada',
          data, hora,
          profissional: input.profissional,
          setor: input.setor,
          descricao: `Atendimento aberto — ${input.motivoEntrada}`,
        },
      ],
      triagens: [],
      evolucoesMedicas: [],
      evolucoesEnfermagem: [],
      diagnosticos: [],
      prescricoes: [],
      administracoes: [],
      exames: [],
      documentos: [],
      anotacoes: [],
      transferencias: [],
    }
    ATENDIMENTOS.push(atendimento)

    paciente.statusAtual = 'aguardando_triagem'
    paciente.setorAtual = input.setor
    paciente.entradaEm = agora.toISOString()
    paciente.ultimoAtendimentoEm = agora.toISOString()

    await auditService.registrar({
      usuario: input.profissional,
      perfil: input.perfilProfissional,
      acao: 'Iniciou atendimento',
      entidade: 'Atendimento',
      entidadeId: atendimento.id,
      detalhes: `Novo atendimento ${atendimento.numero} aberto para ${paciente.nome} (${input.motivoEntrada}).`,
    })

    return atendimento
  },

  async registrarAcolhimento(atendimentoId: string, input: RegistrarAcolhimentoInput): Promise<Atendimento> {
    await delay(300)
    const atendimento = ATENDIMENTOS.find((a) => a.id === atendimentoId)
    if (!atendimento) throw new Error('Atendimento não encontrado.')
    const paciente = PACIENTES.find((p) => p.id === atendimento.pacienteId)

    const { data, hora } = dataHoraAtual()

    const acolhimento: Acolhimento = {
      data, hora,
      profissional: input.profissional,
      motivoProcura: input.motivoProcura,
      queixaPrincipal: input.queixaPrincipal,
      inicioSintomas: input.inicioSintomas,
      caracteristicas: input.caracteristicas,
      observacoes: input.observacoes,
      prioridadePercebida: input.prioridadePercebida,
      atendimentoImediato: input.atendimentoImediato,
    }
    atendimento.acolhimento = acolhimento
    atendimento.queixaPrincipal = input.queixaPrincipal || atendimento.queixaPrincipal
    atendimento.etapaFluxo = 'triagem'
    atendimento.timeline.push({
      id: `tl-${Math.random().toString(36).slice(2, 9)}`,
      tipo: 'acolhimento',
      data, hora,
      profissional: input.profissional,
      setor: atendimento.setor,
      descricao: `Acolhimento realizado — ${input.queixaPrincipal}`,
    })

    await auditService.registrar({
      usuario: input.profissional,
      perfil: input.perfilProfissional,
      acao: 'Registrou acolhimento',
      entidade: 'Atendimento',
      entidadeId: atendimento.id,
      detalhes: `Acolhimento registrado para ${paciente?.nome ?? 'paciente'} no atendimento ${atendimento.numero}.`,
    })

    return atendimento
  },
}
