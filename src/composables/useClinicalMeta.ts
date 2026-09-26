import type { StatusAdministracao, StatusAtendimento, StatusExame, TipoAtendimento, TipoDocumento, TipoEventoTimeline } from '@/types'

export const STATUS_ATENDIMENTO_META: Record<StatusAtendimento, { label: string; tone: string }> = {
  aguardando_triagem: { label: 'Aguardando triagem', tone: 'warning' },
  aguardando_atendimento: { label: 'Aguardando atendimento', tone: 'warning' },
  em_atendimento: { label: 'Em atendimento', tone: 'primary' },
  em_observacao: { label: 'Em observação', tone: 'info' },
  internado: { label: 'Internado', tone: 'teal' },
  em_transferencia: { label: 'Em transferência', tone: 'critical' },
  em_alta: { label: 'Em processo de alta', tone: 'success' },
  alta_realizada: { label: 'Alta realizada', tone: 'neutral' },
}

export const TIPO_EVENTO_META: Record<TipoEventoTimeline, { label: string; icon: string }> = {
  entrada: { label: 'Entrada', icon: 'log-in' },
  acolhimento: { label: 'Acolhimento', icon: 'hand-heart' },
  triagem: { label: 'Triagem', icon: 'stethoscope' },
  classificacao_risco: { label: 'Classificação de Risco', icon: 'flag' },
  consulta: { label: 'Consulta', icon: 'user-round' },
  exame: { label: 'Exame', icon: 'flask-conical' },
  prescricao: { label: 'Prescrição', icon: 'clipboard-list' },
  medicacao: { label: 'Medicação', icon: 'pill' },
  evolucao: { label: 'Evolução', icon: 'file-text' },
  internacao: { label: 'Internação', icon: 'bed' },
  transferencia: { label: 'Transferência', icon: 'move' },
  alta: { label: 'Alta', icon: 'log-out' },
}

// Eventos de timeline considerados administrativos/operacionais — podem ser
// exibidos para perfis sem acesso clínico (recepção, laboratório, farmácia,
// gestão). Qualquer tipo fora desta lista (exame, prescrição, medicação,
// evolução, classificação de risco) é sempre ocultado da visão básica.
export const EVENTOS_ADMINISTRATIVOS: TipoEventoTimeline[] = [
  'entrada', 'acolhimento', 'triagem', 'internacao', 'transferencia', 'alta',
]

// Rótulo genérico e não-clínico para a visão básica: ignora deliberadamente
// o texto livre de `descricao` (que pode conter achados clínicos) e usa
// apenas uma frase operacional fixa por tipo de evento.
export const DESCRICAO_ADMINISTRATIVA: Partial<Record<TipoEventoTimeline, string>> = {
  entrada: 'Entrada registrada na unidade',
  acolhimento: 'Acolhimento realizado',
  triagem: 'Triagem realizada — encaminhado para avaliação',
  internacao: 'Internação registrada',
  transferencia: 'Transferência de setor registrada',
  alta: 'Alta registrada',
}

export const TIPO_ATENDIMENTO_META: Record<TipoAtendimento, { label: string }> = {
  emergencia: { label: 'Emergência' },
  pronto_atendimento: { label: 'Pronto atendimento' },
  consulta: { label: 'Consulta' },
  retorno: { label: 'Retorno' },
  procedimento: { label: 'Procedimento' },
  avaliacao: { label: 'Avaliação' },
  ambulatorial: { label: 'Ambulatorial' },
  internacao: { label: 'Internação' },
}

export const STATUS_EXAME_META: Record<StatusExame, { label: string; tone: string }> = {
  solicitado: { label: 'Solicitado', tone: 'neutral' },
  aguardando_realizacao: { label: 'Aguardando realização', tone: 'warning' },
  realizado: { label: 'Realizado', tone: 'info' },
  resultado_disponivel: { label: 'Resultado disponível', tone: 'success' },
  resultado_critico: { label: 'Resultado crítico', tone: 'critical' },
}

export const STATUS_ADMINISTRACAO_META: Record<StatusAdministracao, { label: string; tone: string }> = {
  administrado: { label: 'Administrado', tone: 'success' },
  pendente: { label: 'Pendente', tone: 'warning' },
  recusado: { label: 'Recusado', tone: 'critical' },
  suspenso: { label: 'Suspenso', tone: 'neutral' },
  atrasado: { label: 'Atrasado', tone: 'critical' },
}

export const TIPO_DOCUMENTO_META: Record<TipoDocumento, { label: string }> = {
  atestado: { label: 'Atestado' },
  receita: { label: 'Receita' },
  relatorio: { label: 'Relatório' },
  termo: { label: 'Termo' },
  laudo: { label: 'Laudo' },
  alta: { label: 'Documento de Alta' },
  anexo: { label: 'Anexo' },
}
