import type { Component } from 'vue'
import {
  Users, Clock, Stethoscope, BedDouble, Eye, LogOut, FlaskConical, ClipboardList,
  AlertTriangle, CalendarCheck, UserCheck, CheckCircle2, Move, XCircle,
} from 'lucide-vue-next'
import type { PerfilUsuario } from '@/types'
import type { institucionalService } from '@/services/institucionalService'

export type Indicadores = Awaited<ReturnType<typeof institucionalService.obterIndicadores>>

export interface DashboardStatDef {
  key: string
  label: string
  icon: Component
  tone: string
  valor: (i: Indicadores) => number | string
}

// Catálogo de TODOS os indicadores que podem aparecer em algum dashboard.
// Cada perfil escolhe (em `DASHBOARD_CONFIG_POR_PERFIL`) apenas os que fazem
// sentido para sua função — este catálogo nunca é exibido por inteiro.
export const DASHBOARD_STATS: Record<string, DashboardStatDef> = {
  emAtendimento: { key: 'emAtendimento', label: 'Em atendimento', icon: Stethoscope, tone: 'primary', valor: (i) => i.emAtendimento },
  aguardandoAtendimento: { key: 'aguardandoAtendimento', label: 'Aguardando avaliação médica', icon: Clock, tone: 'warning', valor: (i) => i.aguardandoAtendimento },
  aguardandoTriagem: { key: 'aguardandoTriagem', label: 'Aguardando triagem', icon: Users, tone: 'warning', valor: (i) => i.aguardandoTriagem },
  internados: { key: 'internados', label: 'Internados', icon: BedDouble, tone: 'teal', valor: (i) => i.internados },
  emObservacao: { key: 'emObservacao', label: 'Em observação', icon: Eye, tone: 'info', valor: (i) => i.emObservacao },
  altasHoje: { key: 'altasHoje', label: 'Altas realizadas hoje', icon: LogOut, tone: 'success', valor: (i) => i.altasHoje },
  examesPendentes: { key: 'examesPendentes', label: 'Exames pendentes', icon: FlaskConical, tone: 'warning', valor: (i) => i.examesPendentes },
  examesCriticos: { key: 'examesCriticos', label: 'Resultados críticos', icon: AlertTriangle, tone: 'critical', valor: (i) => i.examesCriticos },
  prescricoesPendentes: { key: 'prescricoesPendentes', label: 'Medicações pendentes', icon: ClipboardList, tone: 'critical', valor: (i) => i.prescricoesPendentes },
  pendenciasEnfermagem: { key: 'pendenciasEnfermagem', label: 'Pendências de enfermagem', icon: AlertTriangle, tone: 'warning', valor: (i) => i.pendenciasEnfermagem },

  atendimentosHoje: { key: 'atendimentosHoje', label: 'Atendimentos iniciados hoje', icon: CalendarCheck, tone: 'primary', valor: (i) => i.atendimentosHoje },
  aguardandoAcolhimento: { key: 'aguardandoAcolhimento', label: 'Aguardando acolhimento', icon: UserCheck, tone: 'warning', valor: (i) => i.aguardandoAcolhimento },
  atendimentosFinalizadosHoje: { key: 'atendimentosFinalizadosHoje', label: 'Atendimentos finalizados hoje', icon: CheckCircle2, tone: 'success', valor: (i) => i.atendimentosFinalizadosHoje },

  examesSolicitados: { key: 'examesSolicitados', label: 'Exames aguardando coleta', icon: FlaskConical, tone: 'neutral', valor: (i) => i.examesSolicitados },
  examesAguardandoProcessamento: { key: 'examesAguardandoProcessamento', label: 'Aguardando processamento', icon: Clock, tone: 'warning', valor: (i) => i.examesAguardandoProcessamento },
  examesResultadosLiberados: { key: 'examesResultadosLiberados', label: 'Resultados liberados', icon: CheckCircle2, tone: 'success', valor: (i) => i.examesResultadosLiberados },

  prescricoesAtivas: { key: 'prescricoesAtivas', label: 'Prescrições ativas', icon: ClipboardList, tone: 'primary', valor: (i) => i.prescricoesAtivas },
  medicamentosAtrasados: { key: 'medicamentosAtrasados', label: 'Medicações atrasadas', icon: AlertTriangle, tone: 'critical', valor: (i) => i.medicamentosAtrasados },
  medicamentosAdministrados: { key: 'medicamentosAdministrados', label: 'Medicações administradas', icon: CheckCircle2, tone: 'success', valor: (i) => i.medicamentosAdministrados },
  medicamentosSuspensos: { key: 'medicamentosSuspensos', label: 'Medicações suspensas', icon: XCircle, tone: 'neutral', valor: (i) => i.medicamentosSuspensos },

  internacoesAtivas: { key: 'internacoesAtivas', label: 'Internações ativas', icon: BedDouble, tone: 'teal', valor: (i) => i.internacoesAtivas },
  transferenciasHoje: { key: 'transferenciasHoje', label: 'Transferências hoje', icon: Move, tone: 'info', valor: (i) => i.transferenciasHoje },
  examesRealizadosHoje: { key: 'examesRealizadosHoje', label: 'Exames realizados hoje', icon: FlaskConical, tone: 'success', valor: (i) => i.examesRealizadosHoje },
}

export interface DashboardRoleConfig {
  titulo: string
  subtitulo: string
  statKeys: string[]
  mostrarAlertasClinicos: boolean
  mostrarOcupacaoLeitos: boolean
  mostrarListaPacientes: boolean
  tituloListaPacientes: string
}

// Configuração declarativa "dashboardConfigByRole": define, por perfil,
// quais indicadores e seções aparecem. O componente DashboardView apenas
// interpreta esta configuração — nenhuma regra de perfil fica hardcoded lá.
export const DASHBOARD_CONFIG_POR_PERFIL: Record<PerfilUsuario, DashboardRoleConfig> = {
  administrador: {
    titulo: 'Visão geral da unidade',
    subtitulo: 'Painel institucional completo',
    statKeys: ['emAtendimento', 'aguardandoAtendimento', 'aguardandoTriagem', 'internados', 'emObservacao', 'altasHoje', 'examesPendentes', 'prescricoesPendentes'],
    mostrarAlertasClinicos: true,
    mostrarOcupacaoLeitos: true,
    mostrarListaPacientes: true,
    tituloListaPacientes: 'Pacientes em atendimento agora',
  },
  medico: {
    titulo: 'Painel clínico',
    subtitulo: 'Pacientes, exames e pendências sob sua responsabilidade',
    statKeys: ['aguardandoAtendimento', 'emAtendimento', 'examesPendentes', 'examesCriticos', 'prescricoesPendentes'],
    mostrarAlertasClinicos: true,
    mostrarOcupacaoLeitos: true,
    mostrarListaPacientes: true,
    tituloListaPacientes: 'Pacientes em atendimento',
  },
  enfermeiro: {
    titulo: 'Painel de enfermagem',
    subtitulo: 'Triagem, cuidados e pendências assistenciais',
    statKeys: ['aguardandoTriagem', 'emAtendimento', 'emObservacao', 'pendenciasEnfermagem', 'prescricoesPendentes'],
    mostrarAlertasClinicos: true,
    mostrarOcupacaoLeitos: true,
    mostrarListaPacientes: true,
    tituloListaPacientes: 'Pacientes sob acompanhamento',
  },
  tecnico_enfermagem: {
    titulo: 'Painel assistencial',
    subtitulo: 'Sinais vitais, cuidados e administração de medicamentos',
    statKeys: ['pendenciasEnfermagem', 'prescricoesPendentes', 'emObservacao', 'emAtendimento'],
    mostrarAlertasClinicos: true,
    mostrarOcupacaoLeitos: false,
    mostrarListaPacientes: true,
    tituloListaPacientes: 'Pacientes sob cuidados',
  },
  recepcao: {
    titulo: 'Painel da recepção',
    subtitulo: 'Fluxo administrativo de chegada e atendimento',
    statKeys: ['atendimentosHoje', 'aguardandoAcolhimento', 'aguardandoTriagem', 'aguardandoAtendimento', 'atendimentosFinalizadosHoje'],
    mostrarAlertasClinicos: false,
    mostrarOcupacaoLeitos: false,
    mostrarListaPacientes: true,
    tituloListaPacientes: 'Atendimentos recentes',
  },
  laboratorio: {
    titulo: 'Painel do laboratório',
    subtitulo: 'Fluxo de exames da unidade',
    statKeys: ['examesSolicitados', 'examesAguardandoProcessamento', 'examesResultadosLiberados', 'examesCriticos'],
    mostrarAlertasClinicos: false,
    mostrarOcupacaoLeitos: false,
    mostrarListaPacientes: false,
    tituloListaPacientes: '',
  },
  farmacia: {
    titulo: 'Painel da farmácia',
    subtitulo: 'Prescrições e dispensação de medicamentos',
    statKeys: ['prescricoesPendentes', 'prescricoesAtivas', 'medicamentosAtrasados', 'medicamentosAdministrados', 'medicamentosSuspensos'],
    mostrarAlertasClinicos: false,
    mostrarOcupacaoLeitos: false,
    mostrarListaPacientes: false,
    tituloListaPacientes: '',
  },
  gestao: {
    titulo: 'Indicadores institucionais',
    subtitulo: 'Visão agregada de operação e assistência',
    statKeys: ['atendimentosHoje', 'internacoesAtivas', 'altasHoje', 'transferenciasHoje', 'examesRealizadosHoje'],
    mostrarAlertasClinicos: false,
    mostrarOcupacaoLeitos: true,
    mostrarListaPacientes: false,
    tituloListaPacientes: '',
  },
}
