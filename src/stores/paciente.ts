import { defineStore } from 'pinia'
import type { Atendimento, AtendimentoHistoricoResumo, Paciente } from '@/types'
import { pacienteService, type DadosNovoPaciente } from '@/services/pacienteService'
import { auditService } from '@/services/auditService'
import { useAuthStore } from '@/stores/auth'

export const usePacienteStore = defineStore('paciente', {
  state: () => ({
    pacientes: [] as Paciente[],
    pacienteAtual: null as Paciente | null,
    atendimentoAtual: null as Atendimento | null,
    historico: [] as AtendimentoHistoricoResumo[],
    carregando: false,
    salvando: false,
    resultadosBusca: [] as Paciente[],
    buscando: false,
    ultimoCadastrado: null as Paciente | null,
  }),
  actions: {
    async carregarLista() {
      this.carregando = true
      this.pacientes = await pacienteService.listar()
      this.carregando = false
    },
    async buscar(termo: string) {
      this.buscando = true
      this.resultadosBusca = await pacienteService.buscar(termo)
      this.buscando = false
    },
    limparBusca() {
      this.resultadosBusca = []
    },
    async carregarPaciente(id: string) {
      this.carregando = true
      const [paciente, atendimento, historico] = await Promise.all([
        pacienteService.obterPorId(id),
        pacienteService.obterAtendimentoAtivo(id),
        pacienteService.obterHistorico(id),
      ])
      this.pacienteAtual = paciente ?? null
      this.atendimentoAtual = atendimento ?? null
      this.historico = historico
      this.carregando = false
    },
    async carregarAtendimentoEspecifico(atendimentoId: string) {
      const atendimento = await pacienteService.obterAtendimentoPorId(atendimentoId)
      if (atendimento) this.atendimentoAtual = atendimento
    },

    async criarPaciente(dados: DadosNovoPaciente): Promise<Paciente> {
      this.salvando = true
      const auth = useAuthStore()
      try {
        const paciente = await pacienteService.criar(dados)
        this.pacientes.push(paciente)
        this.ultimoCadastrado = paciente
        if (auth.usuario) {
          await auditService.registrar({
            usuario: auth.usuario.nome,
            perfil: auth.usuario.perfil,
            acao: 'Cadastrou paciente',
            entidade: 'Paciente',
            entidadeId: paciente.id,
            detalhes: `Novo cadastro: ${paciente.nome} (prontuário ${paciente.numeroProntuario}).`,
          })
        }
        return paciente
      } finally {
        this.salvando = false
      }
    },

    async atualizarPaciente(id: string, dados: Partial<Paciente>): Promise<Paciente> {
      this.salvando = true
      const auth = useAuthStore()
      try {
        const paciente = await pacienteService.atualizar(id, dados)
        const idx = this.pacientes.findIndex((p) => p.id === id)
        if (idx >= 0) this.pacientes[idx] = paciente
        if (this.pacienteAtual?.id === id) this.pacienteAtual = paciente
        if (auth.usuario) {
          await auditService.registrar({
            usuario: auth.usuario.nome,
            perfil: auth.usuario.perfil,
            acao: 'Atualizou cadastro',
            entidade: 'Paciente',
            entidadeId: paciente.id,
            detalhes: `Dados cadastrais atualizados para ${paciente.nome} (prontuário ${paciente.numeroProntuario}).`,
          })
        }
        return paciente
      } finally {
        this.salvando = false
      }
    },
  },
})
