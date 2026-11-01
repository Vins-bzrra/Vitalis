import { ATENDIMENTOS, HISTORICO_ANTERIOR, PACIENTES } from '@/mock/pacientes'
import type { Atendimento, AtendimentoHistoricoResumo, Paciente } from '@/types'

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms))

let sequenciaProntuario = 502

function gerarNumeroProntuario(): string {
  sequenciaProntuario += 1
  return `2026-000${sequenciaProntuario}`
}

export type DadosNovoPaciente = Omit<
  Paciente,
  'id' | 'numeroProntuario' | 'statusAtual' | 'resumoClinico' | 'cadastradoEm' | 'atualizadoEm'
> & {
  resumoClinico?: Partial<Paciente['resumoClinico']>
}

export const pacienteService = {
  async listar(): Promise<Paciente[]> {
    await delay()
    return PACIENTES
  },

  async buscar(termo: string): Promise<Paciente[]> {
    await delay(120)
    const alvo = termo.trim().toLowerCase()
    if (!alvo) return []
    return PACIENTES.filter((p) =>
      p.nome.toLowerCase().includes(alvo) ||
      p.cpf.includes(alvo) ||
      p.numeroProntuario.toLowerCase().includes(alvo) ||
      (p.codigoPaciente ?? '').toLowerCase().includes(alvo) ||
      p.cartaoSus.includes(alvo) ||
      p.dataNascimento.includes(alvo) ||
      (p.leitoAtual ?? '').toLowerCase().includes(alvo) ||
      ATENDIMENTOS.some((a) => a.pacienteId === p.id && a.numero.toLowerCase().includes(alvo))
    )
  },

  async obterPorId(id: string): Promise<Paciente | undefined> {
    await delay()
    return PACIENTES.find((p) => p.id === id)
  },

  async obterAtendimentoAtivo(pacienteId: string): Promise<Atendimento | undefined> {
    await delay()
    const doPaciente = ATENDIMENTOS.filter((a) => a.pacienteId === pacienteId)
    return doPaciente.at(-1)
  },

  async obterAtendimentoPorId(atendimentoId: string): Promise<Atendimento | undefined> {
    await delay()
    return ATENDIMENTOS.find((a) => a.id === atendimentoId)
  },

  async obterHistorico(pacienteId: string): Promise<AtendimentoHistoricoResumo[]> {
    await delay()
    return (HISTORICO_ANTERIOR[pacienteId] ?? []).map((h) => ({ ...h }))
  },

  async criar(dados: DadosNovoPaciente): Promise<Paciente> {
    await delay(420)
    const agora = new Date('2026-09-25T12:00:00').toISOString()
    const paciente: Paciente = {
      ...dados,
      id: `pac-${Math.random().toString(36).slice(2, 9)}`,
      numeroProntuario: gerarNumeroProntuario(),
      statusAtual: 'aguardando_triagem',
      cadastradoEm: agora,
      atualizadoEm: agora,
      resumoClinico: {
        problemasAtivos: [],
        comorbidades: [],
        alergias: [],
        medicamentosEmUso: [],
        cirurgiasAnteriores: [],
        historicoFamiliar: [],
        historicoSocial: '',
        observacoesImportantes: '',
        ...dados.resumoClinico,
      },
    }
    PACIENTES.push(paciente)
    return paciente
  },

  async atualizar(id: string, dados: Partial<Paciente>): Promise<Paciente> {
    await delay(380)
    const paciente = PACIENTES.find((p) => p.id === id)
    if (!paciente) throw new Error('Paciente não encontrado.')
    Object.assign(paciente, dados, { atualizadoEm: new Date('2026-09-25T12:00:00').toISOString() })
    return paciente
  },
}
