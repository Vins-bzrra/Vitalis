import { ATENDIMENTOS, PACIENTES } from '@/mock/pacientes'
import { LEITOS } from '@/mock/leitos'
import { AUDIT_LOG, USUARIOS } from '@/mock/usuarios'
import type { AuditLogEntry, Leito, Usuario } from '@/types'

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms))

export const institucionalService = {
  async obterIndicadores() {
    await delay()
    const porStatus = (status: string) => ATENDIMENTOS.filter((a) => a.status === status).length
    const leitosOcupados = LEITOS.filter((l) => l.status === 'ocupado').length
    const examesPendentes = ATENDIMENTOS.flatMap((a) => a.exames).filter((e) =>
      e.status === 'solicitado' || e.status === 'aguardando_realizacao'
    ).length
    const examesCriticos = ATENDIMENTOS.flatMap((a) => a.exames).filter((e) => e.status === 'resultado_critico').length
    const prescricoesPendentes = ATENDIMENTOS.flatMap((a) => a.administracoes).filter((m) =>
      m.status === 'pendente' || m.status === 'atrasado'
    ).length
    const pendenciasEnfermagem = ATENDIMENTOS.flatMap((a) => a.anotacoes).filter((n) =>
      n.tipo === 'pendencia' && !n.resolvida
    ).length

    const HOJE = '2026-09-25'
    const todosExames = ATENDIMENTOS.flatMap((a) => a.exames)
    const todasAdministracoes = ATENDIMENTOS.flatMap((a) => a.administracoes)
    const todasPrescricoes = ATENDIMENTOS.flatMap((a) => a.prescricoes)

    return {
      emAtendimento: porStatus('em_atendimento'),
      aguardandoAtendimento: porStatus('aguardando_atendimento'),
      aguardandoTriagem: porStatus('aguardando_triagem'),
      internados: porStatus('internado'),
      emObservacao: porStatus('em_observacao'),
      altasHoje: ATENDIMENTOS.filter((a) => a.alta?.data === HOJE).length,
      totalPacientesAtivos: PACIENTES.length,
      leitosOcupados,
      leitosTotais: LEITOS.length,
      taxaOcupacao: Math.round((leitosOcupados / LEITOS.length) * 100),
      examesPendentes,
      examesCriticos,
      prescricoesPendentes,
      pendenciasEnfermagem,

      // Recepção — fluxo administrativo do dia
      atendimentosHoje: ATENDIMENTOS.filter((a) => a.dataEntrada.startsWith(HOJE)).length,
      aguardandoAcolhimento: ATENDIMENTOS.filter((a) => a.status === 'aguardando_triagem' && (!a.etapaFluxo || a.etapaFluxo === 'acolhimento' || a.etapaFluxo === 'aberto')).length,
      atendimentosFinalizadosHoje: ATENDIMENTOS.filter((a) => a.alta?.data === HOJE || a.status === 'alta_realizada').length,

      // Laboratório
      examesSolicitados: todosExames.filter((e) => e.status === 'solicitado').length,
      examesAguardandoColeta: todosExames.filter((e) => e.status === 'solicitado').length,
      examesAguardandoProcessamento: todosExames.filter((e) => e.status === 'aguardando_realizacao').length,
      examesResultadosLiberados: todosExames.filter((e) => e.status === 'resultado_disponivel' || e.status === 'resultado_critico').length,
      examesResultadosPendentes: todosExames.filter((e) => e.status === 'solicitado' || e.status === 'aguardando_realizacao').length,

      // Farmácia
      prescricoesAtivas: todasPrescricoes.filter((p) => p.status === 'ativa').length,
      medicamentosAdministrados: todasAdministracoes.filter((m) => m.status === 'administrado').length,
      medicamentosSuspensos: todasAdministracoes.filter((m) => m.status === 'suspenso').length,
      medicamentosAtrasados: todasAdministracoes.filter((m) => m.status === 'atrasado').length,

      // Gestão / institucional
      internacoesAtivas: ATENDIMENTOS.filter((a) => a.internacao?.status === 'ativa').length,
      transferenciasHoje: ATENDIMENTOS.flatMap((a) => a.transferencias).filter((t) => t.data === HOJE).length,
      examesRealizadosHoje: todosExames.filter((e) => e.realizadoEm?.startsWith(HOJE)).length,
    }
  },

  async listarLeitos(): Promise<Leito[]> {
    await delay()
    return LEITOS
  },

  async listarUsuarios(): Promise<Usuario[]> {
    await delay()
    return USUARIOS
  },

  async listarAuditoria(): Promise<AuditLogEntry[]> {
    await delay()
    return AUDIT_LOG
  },

  async listarAtendimentos() {
    await delay()
    return ATENDIMENTOS
  },
}
