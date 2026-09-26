import { defineStore } from 'pinia'
import type { Atendimento, ClassificacaoRisco, Paciente, SinaisVitais, TipoAtendimento } from '@/types'
import { atendimentoService } from '@/services/atendimentoService'
import { triagemService } from '@/services/triagemService'
import { useAuthStore } from '@/stores/auth'
import { usePacienteStore } from '@/stores/paciente'
import { useInstitucionalStore } from '@/stores/institucional'

export interface DadosNovoAtendimento {
  tipo: TipoAtendimento
  setor: string
  motivoEntrada: string
  queixaPrincipal: string
  observacoes: string
}

export interface DadosAcolhimento {
  motivoProcura: string
  queixaPrincipal: string
  inicioSintomas: string
  caracteristicas: string
  observacoes: string
  prioridadePercebida: string
  atendimentoImediato: boolean
}

export interface DadosTriagemForm {
  vitais: Omit<SinaisVitais, 'id' | 'data' | 'hora'>
  queixaPrincipal: string
  observacoes: string
  classificacaoRisco: ClassificacaoRisco | null
}

const VITAIS_VAZIAS: DadosTriagemForm['vitais'] = {
  pressaoArterial: '', frequenciaCardiaca: 0, frequenciaRespiratoria: 0, saturacao: 0,
  temperatura: 0, glicemia: undefined, peso: undefined, altura: undefined, dor: 0, nivelConsciencia: 'Alerta',
}

export const useAtendimentoFluxoStore = defineStore('atendimentoFluxo', {
  state: () => ({
    paciente: null as Paciente | null,
    atendimento: null as Atendimento | null,
    dadosAtendimento: {
      tipo: 'pronto_atendimento' as TipoAtendimento,
      setor: 'Recepção',
      motivoEntrada: '',
      queixaPrincipal: '',
      observacoes: '',
    } as DadosNovoAtendimento,
    dadosAcolhimento: {
      motivoProcura: '', queixaPrincipal: '', inicioSintomas: '', caracteristicas: '',
      observacoes: '', prioridadePercebida: 'Moderada', atendimentoImediato: false,
    } as DadosAcolhimento,
    dadosTriagem: {
      vitais: { ...VITAIS_VAZIAS },
      queixaPrincipal: '',
      observacoes: '',
      classificacaoRisco: null,
    } as DadosTriagemForm,
    processando: false,
  }),
  actions: {
    selecionarPaciente(paciente: Paciente) {
      this.paciente = paciente
      this.atendimento = null
      this.dadosAtendimento = {
        tipo: 'pronto_atendimento', setor: 'Recepção', motivoEntrada: '', queixaPrincipal: '', observacoes: '',
      }
      this.dadosAcolhimento = {
        motivoProcura: '', queixaPrincipal: '', inicioSintomas: '', caracteristicas: '',
        observacoes: '', prioridadePercebida: 'Moderada', atendimentoImediato: false,
      }
      this.dadosTriagem = { vitais: { ...VITAIS_VAZIAS }, queixaPrincipal: '', observacoes: '', classificacaoRisco: null }
    },

    async carregarAtendimentoExistente(atendimentoId: string) {
      const pacienteStore = usePacienteStore()
      await pacienteStore.carregarAtendimentoEspecifico(atendimentoId)
      this.atendimento = pacienteStore.atendimentoAtual
      if (this.atendimento) {
        this.paciente = pacienteStore.pacientes.find((p) => p.id === this.atendimento!.pacienteId) ?? this.paciente
      }
    },

    async iniciarAtendimento(): Promise<Atendimento> {
      if (!this.paciente) throw new Error('Nenhum paciente selecionado.')
      const auth = useAuthStore()
      this.processando = true
      try {
        const atendimento = await atendimentoService.iniciar({
          pacienteId: this.paciente.id,
          tipo: this.dadosAtendimento.tipo,
          setor: this.dadosAtendimento.setor,
          motivoEntrada: this.dadosAtendimento.motivoEntrada,
          queixaPrincipal: this.dadosAtendimento.queixaPrincipal,
          observacoes: this.dadosAtendimento.observacoes,
          profissional: auth.usuario?.nome ?? 'Recepção',
          perfilProfissional: auth.usuario?.perfil ?? 'recepcao',
        })
        this.atendimento = atendimento
        this.dadosAcolhimento.motivoProcura = this.dadosAtendimento.motivoEntrada
        this.dadosAcolhimento.queixaPrincipal = this.dadosAtendimento.queixaPrincipal
        await useInstitucionalStore().carregarDashboard()
        return atendimento
      } finally {
        this.processando = false
      }
    },

    async concluirAcolhimento(): Promise<Atendimento> {
      if (!this.atendimento) throw new Error('Nenhum atendimento em andamento.')
      const auth = useAuthStore()
      this.processando = true
      try {
        const atendimento = await atendimentoService.registrarAcolhimento(this.atendimento.id, {
          ...this.dadosAcolhimento,
          profissional: auth.usuario?.nome ?? 'Recepção',
          perfilProfissional: auth.usuario?.perfil ?? 'recepcao',
        })
        this.atendimento = atendimento
        this.dadosTriagem.queixaPrincipal = this.dadosAcolhimento.queixaPrincipal
        this.dadosTriagem.observacoes = ''
        return atendimento
      } finally {
        this.processando = false
      }
    },

    async concluirTriagem(): Promise<Atendimento> {
      if (!this.atendimento) throw new Error('Nenhum atendimento em andamento.')
      if (!this.dadosTriagem.classificacaoRisco) throw new Error('Selecione uma classificação de risco.')
      const auth = useAuthStore()
      this.processando = true
      try {
        await triagemService.registrar({
          atendimentoId: this.atendimento.id,
          vitais: this.dadosTriagem.vitais,
          queixaPrincipal: this.dadosTriagem.queixaPrincipal,
          observacoes: this.dadosTriagem.observacoes,
          classificacaoRisco: this.dadosTriagem.classificacaoRisco,
          profissional: auth.usuario?.nome ?? 'Enfermagem',
          perfilProfissional: auth.usuario?.perfil ?? 'enfermeiro',
        })
        const pacienteStore = usePacienteStore()
        await pacienteStore.carregarAtendimentoEspecifico(this.atendimento.id)
        this.atendimento = pacienteStore.atendimentoAtual
        await useInstitucionalStore().carregarDashboard()
        return this.atendimento!
      } finally {
        this.processando = false
      }
    },

    reset() {
      this.paciente = null
      this.atendimento = null
    },
  },
})
