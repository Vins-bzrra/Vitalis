// ---------------------------------------------------------------------------
// Entidades centrais do Prontuário Digital
// ---------------------------------------------------------------------------

export type Sexo = 'Masculino' | 'Feminino'

export type StatusAtendimento =
  | 'aguardando_triagem'
  | 'aguardando_atendimento'
  | 'em_atendimento'
  | 'em_observacao'
  | 'internado'
  | 'em_transferencia'
  | 'em_alta'
  | 'alta_realizada'

export type NivelRisco = 1 | 2 | 3 | 4 | 5 // 1 = emergência, 5 = não urgente

export interface ClassificacaoRisco {
  nivel: NivelRisco
  cor: string
  label: string
  tempoMaximoEspera: string
}

export interface Alergia {
  id: string
  substancia: string
  tipo: 'medicamento' | 'alimento' | 'outro'
  gravidade: 'leve' | 'moderada' | 'grave'
  reacao: string
  identificadoEm: string
}

export interface Comorbidade {
  id: string
  nome: string
  desde?: string
}

export interface Problema {
  id: string
  nome: string
  status: 'ativo' | 'resolvido' | 'cronico'
  cid?: string
  dataIdentificacao: string
  profissional: string
  evolucao: string
  condutas: string[]
}

export interface Medicamento {
  id: string
  nome: string
  dose: string
  via: string
  frequencia: string
  uso: 'continuo' | 'temporario'
  inicioEm: string
}

export interface HistoricoFamiliar {
  id: string
  parentesco: string
  condicao: string
}

export interface ResumoClinico {
  problemasAtivos: Problema[]
  comorbidades: Comorbidade[]
  alergias: Alergia[]
  medicamentosEmUso: Medicamento[]
  cirurgiasAnteriores: { id: string; nome: string; data: string; local: string }[]
  historicoFamiliar: HistoricoFamiliar[]
  historicoSocial: string
  observacoesImportantes: string
}

export interface EnderecoDetalhado {
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
}

export interface ContatoEmergencia {
  nome: string
  telefone: string
  parentesco: string
}

export interface ResponsavelPaciente {
  nome: string
  cpf: string
  parentesco: string
  telefone: string
}

export interface ConsentimentosPaciente {
  atendimento: boolean
  tratamentoDados: boolean
  termoAutorizacao: boolean
}

export interface Paciente {
  id: string
  nome: string
  nomeSocial?: string
  avatarUrl?: string
  sexo: Sexo
  dataNascimento: string
  cpf: string
  cartaoSus: string
  rg?: string
  estadoCivil?: string
  nacionalidade?: string
  naturalidade?: string
  profissao?: string
  numeroProntuario: string
  /**
   * Código curto e único do paciente na instituição (equivalente ao "RG do
   * hospital" citado pela usuária — não confundir com o RG civil). Usado para
   * localizar o paciente rapidamente no painel, na busca e nas etiquetas.
   */
  codigoPaciente?: string
  telefone: string
  telefoneSecundario?: string
  email?: string
  endereco: string
  enderecoDetalhado?: EnderecoDetalhado
  contatoEmergencia?: ContatoEmergencia
  responsavel?: ResponsavelPaciente
  consentimentos?: ConsentimentosPaciente
  statusAtual: StatusAtendimento
  setorAtual?: string
  leitoAtual?: string
  medicoResponsavel?: string
  entradaEm?: string
  isolamento?: string
  ultimoAtendimentoEm?: string
  cadastradoEm?: string
  atualizadoEm?: string
  resumoClinico: ResumoClinico
}

// ---- Atendimento / Jornada -------------------------------------------------

export type TipoEventoTimeline =
  | 'entrada'
  | 'acolhimento'
  | 'triagem'
  | 'classificacao_risco'
  | 'consulta'
  | 'exame'
  | 'prescricao'
  | 'medicacao'
  | 'evolucao'
  | 'internacao'
  | 'transferencia'
  | 'alta'

export interface EventoTimeline {
  id: string
  tipo: TipoEventoTimeline
  data: string
  hora: string
  profissional: string
  setor: string
  descricao: string
  documentos?: string[]
}

export interface SinaisVitais {
  id: string
  data: string
  hora: string
  pressaoArterial: string
  frequenciaCardiaca: number
  frequenciaRespiratoria: number
  saturacao: number
  temperatura: number
  glicemia?: number
  peso?: number
  altura?: number
  dor: number
  nivelConsciencia: string
}

export interface Triagem {
  id: string
  data: string
  hora: string
  profissional: string
  vitais: SinaisVitais
  queixaPrincipal: string
  observacoes: string
  classificacaoRisco: ClassificacaoRisco
}

export interface EvolucaoMedica {
  id: string
  data: string
  hora: string
  profissional: string
  anamnese: string
  exameFisico: string
  hipotesesDiagnosticas: string[]
  diagnosticosConfirmados: string[]
  conduta: string
  planoTerapeutico: string
  encaminhamentos?: string[]
}

// Evolução em texto livre: cada médico escreve na ordem e no formato da sua
// especialidade, opcionalmente partindo de um modelo (ver ModeloEvolucao).
export interface EvolucaoLivre {
  id: string
  data: string
  hora: string
  profissional: string
  especialidade?: string
  texto: string
}

export interface ModeloEvolucao {
  id: string
  nome: string
  especialidade: string
  texto: string
  proprio?: boolean
}

export interface ItemReceita {
  medicamento: string
  posologia: string
  quantidade: string
}

export interface ModeloReceita {
  id: string
  nome: string
  itens: ItemReceita[]
  orientacoes?: string
}

export interface EvolucaoEnfermagem {
  id: string
  data: string
  hora: string
  profissional: string
  texto: string
  balancoHidrico?: string
  escalas?: string
  cuidadosRealizados: string[]
  intercorrencias?: string
}

export interface Diagnostico {
  id: string
  nome: string
  cid: string
  tipo: 'hipotese' | 'confirmado'
  data: string
}

export interface ItemPrescricao {
  id: string
  medicamento: string
  dose: string
  via: string
  frequencia: string
  horarios: string[]
  duracao: string
  observacoes?: string
}

export interface Prescricao {
  id: string
  data: string
  hora: string
  profissional: string
  itens: ItemPrescricao[]
  status: 'ativa' | 'suspensa' | 'concluida'
}

export type StatusAdministracao = 'administrado' | 'pendente' | 'recusado' | 'suspenso' | 'atrasado'

export interface AdministracaoMedicamento {
  id: string
  prescricaoItemId: string
  medicamento: string
  dose: string
  horarioPrevisto: string
  horarioReal?: string
  status: StatusAdministracao
  responsavel?: string
  observacao?: string
}

export type StatusExame = 'solicitado' | 'aguardando_realizacao' | 'realizado' | 'resultado_disponivel' | 'resultado_critico'

export interface ResultadoExame {
  parametro: string
  valor: string
  unidade: string
  referencia: string
  alterado: boolean
  critico?: boolean
}

export interface Exame {
  id: string
  nome: string
  tipo: 'laboratorial' | 'imagem' | 'outro'
  solicitadoEm: string
  solicitadoPor: string
  status: StatusExame
  realizadoEm?: string
  resultados?: ResultadoExame[]
  historicoParametro?: { data: string; valor: number }[]
  laudo?: string
}

export interface Leito {
  id: string
  numero: string
  setor: string
  quarto: string
  status: 'livre' | 'ocupado' | 'higienizacao' | 'bloqueado' | 'manutencao'
  pacienteId?: string
  isolamento?: boolean
}

export interface Internacao {
  id: string
  pacienteId: string
  leitoId: string
  dataEntrada: string
  motivo: string
  medicoResponsavel: string
  status: 'ativa' | 'finalizada'
}

export interface Transferencia {
  id: string
  data: string
  hora: string
  origemSetor: string
  origemLeito?: string
  destinoSetor: string
  destinoLeito?: string
  motivo: string
  responsavel: string
}

export interface Alta {
  id: string
  data: string
  hora: string
  diagnosticoFinal: string
  resumoInternacao: string
  procedimentosRealizados: string[]
  examesRelevantes: string[]
  medicamentosPrescritos: string[]
  orientacoes: string
  retorno: string
  encaminhamentos: string[]
  medicoResponsavel: string
}

export type TipoDocumento = 'atestado' | 'receita' | 'relatorio' | 'termo' | 'laudo' | 'alta' | 'anexo'

export interface Documento {
  id: string
  tipo: TipoDocumento
  titulo: string
  criadoEm: string
  autor: string
  assinado: boolean
}

export interface AnotacaoMultiprofissional {
  id: string
  data: string
  hora: string
  autor: string
  perfil: PerfilUsuario
  tipo: 'clinica' | 'mensagem_interna' | 'pendencia' | 'solicitacao'
  texto: string
  resolvida?: boolean
}

export type PerfilUsuario =
  | 'administrador'
  | 'medico'
  | 'enfermeiro'
  | 'tecnico_enfermagem'
  | 'recepcao'
  | 'laboratorio'
  | 'farmacia'
  | 'gestao'

export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: PerfilUsuario
  registro?: string
  ativo: boolean
  avatarUrl?: string
}

export interface AuditLogEntry {
  id: string
  data: string
  hora: string
  usuario: string
  perfil: PerfilUsuario
  acao: string
  entidade: string
  entidadeId: string
  detalhes: string
}

export type TipoAtendimento =
  | 'emergencia' | 'pronto_atendimento' | 'consulta' | 'retorno' | 'procedimento' | 'avaliacao'
  // valores legados, mantidos para compatibilidade com dados já cadastrados
  | 'ambulatorial' | 'internacao'

export type EtapaFluxoAtendimento =
  | 'aberto' | 'acolhimento' | 'triagem' | 'aguardando_medico' | 'em_avaliacao' | 'concluido'

export interface Acolhimento {
  data: string
  hora: string
  profissional: string
  motivoProcura: string
  queixaPrincipal: string
  inicioSintomas: string
  caracteristicas: string
  observacoes: string
  prioridadePercebida: string
  atendimentoImediato: boolean
}

export interface Atendimento {
  id: string
  pacienteId: string
  numero: string
  tipo: TipoAtendimento
  etapaFluxo?: EtapaFluxoAtendimento
  dataEntrada: string
  status: StatusAtendimento
  setor: string
  motivoEntrada: string
  /** Especialidade para a qual a avaliação foi solicitada (clínica médica, cirurgia, cardiologia...). */
  especialidadeSolicitada?: string
  /** Atendimento prioritário por lei (idoso, gestante, PcD...). Idosos 60+ são detectados automaticamente. */
  prioridade?: string
  queixaPrincipal: string
  historiaDoencaAtual: string
  acolhimento?: Acolhimento
  timeline: EventoTimeline[]
  triagens: Triagem[]
  evolucoesMedicas: EvolucaoMedica[]
  evolucoesLivres?: EvolucaoLivre[]
  evolucoesEnfermagem: EvolucaoEnfermagem[]
  diagnosticos: Diagnostico[]
  prescricoes: Prescricao[]
  administracoes: AdministracaoMedicamento[]
  exames: Exame[]
  documentos: Documento[]
  anotacoes: AnotacaoMultiprofissional[]
  internacao?: Internacao
  transferencias: Transferencia[]
  alta?: Alta
}

export interface AtendimentoHistoricoResumo {
  id: string
  ano: number
  data: string
  tipo: string
  titulo: string
  setor: string
  status: string
}
