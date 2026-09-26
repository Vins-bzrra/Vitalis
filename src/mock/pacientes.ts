import type { Atendimento, Paciente } from '@/types'
import { CLASSIFICACOES_RISCO } from './classificacaoRisco'

// ===========================================================================
// PACIENTE 1 — Maria Aparecida Souza — INTERNADA (UTI), diabética/hipertensa,
// alergia grave a dipirona. Caso "completo" para demonstrar a visão 360°.
// ===========================================================================

const mariaId = 'pac-001'

export const pacienteMaria: Paciente = {
  id: mariaId,
  nome: 'Maria Aparecida Souza',
  sexo: 'Feminino',
  dataNascimento: '1957-03-14',
  cpf: '123.456.789-00',
  cartaoSus: '898 0012 3456 7890',
  numeroProntuario: '2026-000481',
  telefone: '(11) 98877-1122',
  endereco: 'Rua das Acácias, 245 — Vila Nova, São Paulo/SP',
  statusAtual: 'internado',
  setorAtual: 'UTI Geral',
  leitoAtual: 'UTI-03',
  medicoResponsavel: 'Dr. Fernando Aquino',
  entradaEm: '2026-09-20T08:12:00',
  isolamento: undefined,
  resumoClinico: {
    problemasAtivos: [
      {
        id: 'prob-001',
        nome: 'Diabetes Mellitus tipo 2 descompensada',
        status: 'ativo',
        cid: 'E11.9',
        dataIdentificacao: '2026-09-20',
        profissional: 'Dr. Fernando Aquino',
        evolucao: 'Glicemia em queda progressiva após ajuste de insulina basal-bolus.',
        condutas: ['Insulinoterapia EV em bomba', 'Monitorização glicêmica 2/2h'],
      },
      {
        id: 'prob-002',
        nome: 'Pneumonia adquirida na comunidade',
        status: 'ativo',
        cid: 'J18.9',
        dataIdentificacao: '2026-09-20',
        profissional: 'Dr. Fernando Aquino',
        evolucao: 'Em uso de antibioticoterapia empírica, melhora radiológica discreta.',
        condutas: ['Ceftriaxona + Azitromicina EV', 'Fisioterapia respiratória 2x/dia'],
      },
    ],
    comorbidades: [
      { id: 'com-001', nome: 'Hipertensão Arterial Sistêmica', desde: '2010' },
      { id: 'com-002', nome: 'Diabetes Mellitus tipo 2', desde: '2015' },
      { id: 'com-003', nome: 'Obesidade grau I' },
    ],
    alergias: [
      { id: 'alg-001', substancia: 'Dipirona', tipo: 'medicamento', gravidade: 'grave', reacao: 'Anafilaxia', identificadoEm: '2018-05-02' },
      { id: 'alg-002', substancia: 'Frutos do mar', tipo: 'alimento', gravidade: 'moderada', reacao: 'Urticária e edema labial', identificadoEm: '2012-01-01' },
    ],
    medicamentosEmUso: [
      { id: 'med-001', nome: 'Losartana', dose: '50mg', via: 'Oral', frequencia: '1x/dia', uso: 'continuo', inicioEm: '2010-06-01' },
      { id: 'med-002', nome: 'Metformina', dose: '850mg', via: 'Oral', frequencia: '2x/dia', uso: 'continuo', inicioEm: '2015-02-10' },
      { id: 'med-003', nome: 'Sinvastatina', dose: '20mg', via: 'Oral', frequencia: '1x à noite', uso: 'continuo', inicioEm: '2019-08-20' },
    ],
    cirurgiasAnteriores: [
      { id: 'cir-001', nome: 'Colecistectomia videolaparoscópica', data: '2016-04-11', local: 'Hospital Municipal' },
    ],
    historicoFamiliar: [
      { id: 'hf-001', parentesco: 'Mãe', condicao: 'Diabetes Mellitus tipo 2' },
      { id: 'hf-002', parentesco: 'Pai', condicao: 'Infarto agudo do miocárdio' },
    ],
    historicoSocial: 'Não tabagista. Etilismo social ocasional. Reside com o esposo. Aposentada.',
    observacoesImportantes: 'Paciente ansiosa em relação a procedimentos invasivos — orientar sempre antes de qualquer punção.',
  },
}

const atendimentoMaria: Atendimento = {
  id: 'atd-001',
  pacienteId: mariaId,
  numero: 'AT-2026-04481',
  tipo: 'internacao',
  dataEntrada: '2026-09-20T08:12:00',
  status: 'internado',
  setor: 'UTI Geral',
  motivoEntrada: 'Dispneia progressiva e febre há 3 dias',
  queixaPrincipal: 'Falta de ar e febre',
  historiaDoencaAtual:
    'Paciente refere quadro de tosse produtiva, febre (Tax 38,9°C) e dispneia progressiva iniciado há 3 dias, com piora nas últimas 12h associada a queda da saturação. Nega dor torácica. Nega contato com casos suspeitos de doenças infectocontagiosas.',
  timeline: [
    { id: 'tl-001', tipo: 'entrada', data: '2026-09-20', hora: '08:12', profissional: 'Recepção — Camila Dias', setor: 'Recepção', descricao: 'Entrada registrada via ambulância do SAMU.' },
    { id: 'tl-002', tipo: 'triagem', data: '2026-09-20', hora: '08:20', profissional: 'Enf. Patrícia Gomes', setor: 'Classificação de Risco', descricao: 'Triagem realizada. Saturação 89% em ar ambiente.' },
    { id: 'tl-003', tipo: 'classificacao_risco', data: '2026-09-20', hora: '08:22', profissional: 'Enf. Patrícia Gomes', setor: 'Classificação de Risco', descricao: 'Classificada como Muito Urgente (laranja).' },
    { id: 'tl-004', tipo: 'consulta', data: '2026-09-20', hora: '08:41', profissional: 'Dr. Fernando Aquino', setor: 'Emergência', descricao: 'Avaliação médica inicial. Hipótese de PAC + descompensação glicêmica.' },
    { id: 'tl-005', tipo: 'exame', data: '2026-09-20', hora: '09:05', profissional: 'Laboratório Central', setor: 'Laboratório', descricao: 'Coleta de hemograma, PCR, glicemia e gasometria arterial.' },
    { id: 'tl-006', tipo: 'exame', data: '2026-09-20', hora: '09:30', profissional: 'Radiologia', setor: 'Imagem', descricao: 'Raio-X de tórax evidenciou consolidação em base direita.' },
    { id: 'tl-007', tipo: 'prescricao', data: '2026-09-20', hora: '10:15', profissional: 'Dr. Fernando Aquino', setor: 'Emergência', descricao: 'Prescrição de antibioticoterapia e insulinoterapia.' },
    { id: 'tl-008', tipo: 'internacao', data: '2026-09-20', hora: '11:40', profissional: 'Dr. Fernando Aquino', setor: 'UTI Geral', descricao: 'Internação em UTI Geral, leito UTI-03, devido à instabilidade respiratória.' },
    { id: 'tl-009', tipo: 'evolucao', data: '2026-09-21', hora: '07:30', profissional: 'Dr. Fernando Aquino', setor: 'UTI Geral', descricao: 'Evolução clínica com melhora discreta da saturação.' },
    { id: 'tl-010', tipo: 'medicacao', data: '2026-09-22', hora: '14:00', profissional: 'Téc. Enf. Rodrigo Melo', setor: 'UTI Geral', descricao: 'Administração de Ceftriaxona conforme prescrição.' },
    { id: 'tl-011', tipo: 'evolucao', data: '2026-09-23', hora: '08:00', profissional: 'Enf. Patrícia Gomes', setor: 'UTI Geral', descricao: 'Evolução de enfermagem — paciente colaborativa, sinais vitais estáveis.' },
  ],
  triagens: [
    {
      id: 'tri-001',
      data: '2026-09-20',
      hora: '08:20',
      profissional: 'Enf. Patrícia Gomes',
      vitais: {
        id: 'sv-001', data: '2026-09-20', hora: '08:20',
        pressaoArterial: '148/92', frequenciaCardiaca: 108, frequenciaRespiratoria: 26,
        saturacao: 89, temperatura: 38.9, glicemia: 268, peso: 78, altura: 1.62,
        dor: 2, nivelConsciencia: 'Alerta, orientada em tempo e espaço',
      },
      queixaPrincipal: 'Falta de ar e febre há 3 dias',
      observacoes: 'Paciente taquipneica, uso de musculatura acessória leve.',
      classificacaoRisco: CLASSIFICACOES_RISCO[2],
    },
    {
      id: 'tri-001b',
      data: '2026-09-22',
      hora: '06:15',
      profissional: 'Enf. Patrícia Gomes',
      vitais: {
        id: 'sv-001b', data: '2026-09-22', hora: '06:15',
        pressaoArterial: '132/86', frequenciaCardiaca: 94, frequenciaRespiratoria: 20,
        saturacao: 94, temperatura: 37.1, glicemia: 176, peso: 78,
        dor: 1, nivelConsciencia: 'Alerta, orientada em tempo e espaço',
      },
      queixaPrincipal: 'Reavaliação de rotina — evolução da pneumonia',
      observacoes: 'Reclassificação após 48h de antibioticoterapia. Paciente com melhora clínica evidente.',
      classificacaoRisco: CLASSIFICACOES_RISCO[3],
    },
  ],
  evolucoesMedicas: [
    {
      id: 'evm-001', data: '2026-09-20', hora: '08:41', profissional: 'Dr. Fernando Aquino',
      anamnese: 'Tosse produtiva, febre e dispneia há 3 dias, com piora progressiva. Diabética e hipertensa em acompanhamento irregular.',
      exameFisico: 'MV diminuído em base direita com estertores crepitantes. FC 108bpm, FR 26irpm, SatO2 89% AA. Glicemia capilar 268mg/dL.',
      hipotesesDiagnosticas: ['Pneumonia adquirida na comunidade', 'Descompensação de Diabetes Mellitus'],
      diagnosticosConfirmados: [],
      conduta: 'Oxigenoterapia suplementar, antibioticoterapia empírica, insulinoterapia EV, solicitação de exames complementares.',
      planoTerapeutico: 'Internação em UTI para monitorização e estabilização.',
      encaminhamentos: ['UTI Geral'],
    },
    {
      id: 'evm-002', data: '2026-09-21', hora: '07:30', profissional: 'Dr. Fernando Aquino',
      anamnese: 'Paciente refere melhora discreta da dispneia. Mantém tosse produtiva.',
      exameFisico: 'MV presente bilateralmente com crepitações residuais em base direita. SatO2 93% em cateter de O2 2L/min.',
      hipotesesDiagnosticas: [],
      diagnosticosConfirmados: ['Pneumonia adquirida na comunidade', 'Diabetes Mellitus tipo 2 descompensada'],
      conduta: 'Manter antibioticoterapia. Ajuste de insulina conforme controle glicêmico seriado.',
      planoTerapeutico: 'Reavaliação radiológica em 48h. Iniciar desmame progressivo de O2 suplementar.',
    },
    {
      id: 'evm-003', data: '2026-09-23', hora: '08:10', profissional: 'Dr. Fernando Aquino',
      anamnese: 'Boa evolução clínica, nega dispneia em repouso, apetite recuperado.',
      exameFisico: 'MV presente bilateralmente, sem ruídos adventícios. SatO2 96% em ar ambiente.',
      hipotesesDiagnosticas: [],
      diagnosticosConfirmados: ['Pneumonia adquirida na comunidade em resolução'],
      conduta: 'Iniciar transição para antibiótico oral. Avaliar transferência para enfermaria.',
      planoTerapeutico: 'Programar transferência para Clínica Médica nas próximas 24h.',
    },
  ],
  evolucoesEnfermagem: [
    {
      id: 'evn-001', data: '2026-09-22', hora: '06:00', profissional: 'Enf. Patrícia Gomes',
      texto: 'Paciente em decúbito elevado, colaborativa, sem queixas álgicas. Diurese presente, aspecto claro.',
      balancoHidrico: 'BH +320ml nas últimas 24h', escalas: 'Braden: 18 (baixo risco) · Morse: 35 (risco moderado de queda)',
      cuidadosRealizados: ['Higiene corporal no leito', 'Troca de curativo de acesso venoso', 'Mudança de decúbito 2/2h'],
    },
    {
      id: 'evn-002', data: '2026-09-23', hora: '08:00', profissional: 'Enf. Patrícia Gomes',
      texto: 'Paciente deambulando com auxílio até o banheiro. Boa aceitação da dieta.',
      balancoHidrico: 'BH +150ml nas últimas 24h', escalas: 'Braden: 20 (baixo risco)',
      cuidadosRealizados: ['Aferição de sinais vitais 4/4h', 'Estímulo à deambulação assistida'],
      intercorrencias: 'Nenhuma intercorrência no plantão.',
    },
  ],
  diagnosticos: [
    { id: 'diag-001', nome: 'Pneumonia adquirida na comunidade', cid: 'J18.9', tipo: 'confirmado', data: '2026-09-21' },
    { id: 'diag-002', nome: 'Diabetes Mellitus tipo 2 descompensada', cid: 'E11.9', tipo: 'confirmado', data: '2026-09-20' },
  ],
  prescricoes: [
    {
      id: 'presc-001', data: '2026-09-22', hora: '07:00', profissional: 'Dr. Fernando Aquino', status: 'ativa',
      itens: [
        { id: 'pi-001', medicamento: 'Ceftriaxona', dose: '1g', via: 'Endovenosa', frequencia: '12/12h', horarios: ['08:00', '20:00'], duracao: '7 dias' },
        { id: 'pi-002', medicamento: 'Azitromicina', dose: '500mg', via: 'Endovenosa', frequencia: '24/24h', horarios: ['08:00'], duracao: '5 dias' },
        { id: 'pi-003', medicamento: 'Insulina Regular', dose: 'Conforme escala móvel', via: 'Subcutânea', frequencia: '6/6h', horarios: ['06:00', '12:00', '18:00', '00:00'], duracao: 'Enquanto internada', observacoes: 'Checar glicemia capilar antes de cada aplicação.' },
        { id: 'pi-004', medicamento: 'Paracetamol', dose: '750mg', via: 'Oral', frequencia: 'Se necessário (febre/dor)', horarios: ['S/N'], duracao: 'Enquanto internada', observacoes: 'CONTRAINDICADO uso de Dipirona — paciente alérgica.' },
      ],
    },
  ],
  administracoes: [
    { id: 'adm-001', prescricaoItemId: 'pi-001', medicamento: 'Ceftriaxona 1g', horarioPrevisto: '08:00', horarioReal: '08:05', status: 'administrado', responsavel: 'Téc. Enf. Rodrigo Melo', dose: '1g EV' },
    { id: 'adm-002', prescricaoItemId: 'pi-003', medicamento: 'Insulina Regular', horarioPrevisto: '12:00', horarioReal: '12:10', status: 'administrado', responsavel: 'Téc. Enf. Rodrigo Melo', dose: 'Escala móvel SC' },
    { id: 'adm-003', prescricaoItemId: 'pi-001', medicamento: 'Ceftriaxona 1g', horarioPrevisto: '20:00', status: 'pendente', dose: '1g EV' },
    { id: 'adm-004', prescricaoItemId: 'pi-003', medicamento: 'Insulina Regular', horarioPrevisto: '18:00', status: 'atrasado', dose: 'Escala móvel SC' },
    { id: 'adm-005', prescricaoItemId: 'pi-002', medicamento: 'Azitromicina 500mg', horarioPrevisto: '08:00', status: 'suspenso', dose: '500mg EV', observacao: 'Suspenso por decisão médica após 5 dias de uso.' },
  ],
  exames: [
    {
      id: 'ex-001', nome: 'Hemograma completo', tipo: 'laboratorial', solicitadoEm: '2026-09-20T09:05:00', solicitadoPor: 'Dr. Fernando Aquino',
      status: 'resultado_disponivel', realizadoEm: '2026-09-20T09:40:00',
      resultados: [
        { parametro: 'Hemoglobina', valor: '10,2', unidade: 'g/dL', referencia: '12.0 - 15.5', alterado: true },
        { parametro: 'Leucócitos', valor: '15.400', unidade: '/mm³', referencia: '4.000 - 11.000', alterado: true },
        { parametro: 'Plaquetas', valor: '238.000', unidade: '/mm³', referencia: '150.000 - 450.000', alterado: false },
      ],
      historicoParametro: [
        { data: '2026-09-20', valor: 12.4 }, { data: '2026-09-21', valor: 11.8 },
        { data: '2026-09-22', valor: 10.9 }, { data: '2026-09-23', valor: 10.2 },
      ],
    },
    {
      id: 'ex-002', nome: 'Proteína C Reativa (PCR)', tipo: 'laboratorial', solicitadoEm: '2026-09-20T09:05:00', solicitadoPor: 'Dr. Fernando Aquino',
      status: 'resultado_critico', realizadoEm: '2026-09-20T09:40:00',
      resultados: [{ parametro: 'PCR', valor: '186', unidade: 'mg/L', referencia: '< 5', alterado: true, critico: true }],
    },
    {
      id: 'ex-003', nome: 'Gasometria arterial', tipo: 'laboratorial', solicitadoEm: '2026-09-20T09:05:00', solicitadoPor: 'Dr. Fernando Aquino',
      status: 'resultado_disponivel', realizadoEm: '2026-09-20T09:35:00',
      resultados: [
        { parametro: 'pH', valor: '7.34', unidade: '', referencia: '7.35 - 7.45', alterado: true },
        { parametro: 'PaO2', valor: '62', unidade: 'mmHg', referencia: '80 - 100', alterado: true },
        { parametro: 'PaCO2', valor: '38', unidade: 'mmHg', referencia: '35 - 45', alterado: false },
      ],
    },
    {
      id: 'ex-004', nome: 'Raio-X de Tórax', tipo: 'imagem', solicitadoEm: '2026-09-20T09:10:00', solicitadoPor: 'Dr. Fernando Aquino',
      status: 'resultado_disponivel', realizadoEm: '2026-09-20T09:50:00',
      laudo: 'Consolidação alveolar em base pulmonar direita, compatível com processo infeccioso. Ausência de derrame pleural significativo.',
    },
    {
      id: 'ex-005', nome: 'Raio-X de Tórax (controle)', tipo: 'imagem', solicitadoEm: '2026-09-22T08:00:00', solicitadoPor: 'Dr. Fernando Aquino',
      status: 'aguardando_realizacao',
    },
    {
      id: 'ex-006', nome: 'Glicemia de jejum', tipo: 'laboratorial', solicitadoEm: '2026-09-23T06:00:00', solicitadoPor: 'Dr. Fernando Aquino',
      status: 'solicitado',
    },
  ],
  documentos: [
    { id: 'doc-001', tipo: 'laudo', titulo: 'Laudo Raio-X de Tórax', criadoEm: '2026-09-20T09:55:00', autor: 'Dra. Beatriz Lemos (Radiologia)', assinado: true },
    { id: 'doc-002', tipo: 'relatorio', titulo: 'Relatório de Admissão em UTI', criadoEm: '2026-09-20T11:45:00', autor: 'Dr. Fernando Aquino', assinado: true },
    { id: 'doc-003', tipo: 'receita', titulo: 'Prescrição médica vigente', criadoEm: '2026-09-22T07:00:00', autor: 'Dr. Fernando Aquino', assinado: true },
  ],
  anotacoes: [
    { id: 'an-001', data: '2026-09-22', hora: '13:10', autor: 'Nutricionista Sandra Reis', perfil: 'enfermeiro', tipo: 'clinica', texto: 'Paciente com boa aceitação de dieta branda hipossódica. Manter conduta nutricional.' },
    { id: 'an-002', data: '2026-09-23', hora: '09:00', autor: 'Enf. Patrícia Gomes', perfil: 'enfermeiro', tipo: 'pendencia', texto: 'Verificar disponibilidade de leito na Clínica Médica para transferência.', resolvida: false },
    { id: 'an-003', data: '2026-09-23', hora: '09:15', autor: 'Dr. Fernando Aquino', perfil: 'medico', tipo: 'mensagem_interna', texto: '@Farmácia — por favor confirmar disponibilidade de antibiótico oral (Amoxicilina+Clavulanato) para transição.' },
  ],
  internacao: {
    id: 'int-001', pacienteId: mariaId, leitoId: 'leito-uti-03', dataEntrada: '2026-09-20T11:40:00',
    motivo: 'Pneumonia com insuficiência respiratória e descompensação glicêmica', medicoResponsavel: 'Dr. Fernando Aquino', status: 'ativa',
  },
  transferencias: [
    { id: 'trf-001', data: '2026-09-20', hora: '11:40', origemSetor: 'Emergência', destinoSetor: 'UTI Geral', destinoLeito: 'UTI-03', motivo: 'Instabilidade respiratória — necessidade de monitorização contínua', responsavel: 'Dr. Fernando Aquino' },
  ],
}

// ===========================================================================
// PACIENTE 2 — João Pedro Lima — EMERGÊNCIA, dor torácica, aguardando
// avaliação médica, risco 2 (muito urgente).
// ===========================================================================

const joaoId = 'pac-002'

export const pacienteJoao: Paciente = {
  id: joaoId,
  nome: 'João Pedro Lima',
  sexo: 'Masculino',
  dataNascimento: '1992-11-02',
  cpf: '234.567.890-11',
  cartaoSus: '898 0023 4567 8901',
  numeroProntuario: '2026-000482',
  telefone: '(11) 97711-2233',
  endereco: 'Av. Brasil, 900 — Centro, São Paulo/SP',
  statusAtual: 'aguardando_atendimento',
  setorAtual: 'Emergência',
  leitoAtual: undefined,
  medicoResponsavel: undefined,
  entradaEm: '2026-09-25T09:40:00',
  resumoClinico: {
    problemasAtivos: [],
    comorbidades: [],
    alergias: [],
    medicamentosEmUso: [],
    cirurgiasAnteriores: [],
    historicoFamiliar: [{ id: 'hf-010', parentesco: 'Pai', condicao: 'Infarto agudo do miocárdio aos 58 anos' }],
    historicoSocial: 'Tabagista (10 cigarros/dia há 12 anos). Sedentário.',
    observacoesImportantes: 'Primeiro episódio de dor torácica.',
  },
}

const atendimentoJoao: Atendimento = {
  id: 'atd-002', pacienteId: joaoId, numero: 'AT-2026-04512', tipo: 'emergencia',
  dataEntrada: '2026-09-25T09:40:00', status: 'aguardando_atendimento', setor: 'Emergência',
  motivoEntrada: 'Dor torácica súbita', queixaPrincipal: 'Dor no peito com irradiação para braço esquerdo',
  historiaDoencaAtual: 'Refere dor torácica em aperto, início súbito há 40 minutos, irradiando para membro superior esquerdo, associada a sudorese fria. Nega dispneia.',
  timeline: [
    { id: 'tl-020', tipo: 'entrada', data: '2026-09-25', hora: '09:40', profissional: 'Recepção — Camila Dias', setor: 'Recepção', descricao: 'Entrada por conta própria, acompanhado da esposa.' },
    { id: 'tl-021', tipo: 'triagem', data: '2026-09-25', hora: '09:44', profissional: 'Enf. Patrícia Gomes', setor: 'Classificação de Risco', descricao: 'Triagem com ECG imediato solicitado por suspeita de síndrome coronariana aguda.' },
    { id: 'tl-022', tipo: 'classificacao_risco', data: '2026-09-25', hora: '09:46', profissional: 'Enf. Patrícia Gomes', setor: 'Classificação de Risco', descricao: 'Classificado como Muito Urgente (laranja) — dor torácica.' },
  ],
  triagens: [
    {
      id: 'tri-002', data: '2026-09-25', hora: '09:44', profissional: 'Enf. Patrícia Gomes',
      vitais: { id: 'sv-002', data: '2026-09-25', hora: '09:44', pressaoArterial: '156/98', frequenciaCardiaca: 102, frequenciaRespiratoria: 20, saturacao: 96, temperatura: 36.6, dor: 8, nivelConsciencia: 'Alerta, orientado' },
      queixaPrincipal: 'Dor torácica em aperto com irradiação para MSE', observacoes: 'Sudorese fria presente. ECG de 12 derivações solicitado com urgência.',
      classificacaoRisco: CLASSIFICACOES_RISCO[2],
    },
  ],
  evolucoesMedicas: [], evolucoesEnfermagem: [], diagnosticos: [], prescricoes: [], administracoes: [],
  exames: [
    { id: 'ex-010', nome: 'Eletrocardiograma', tipo: 'outro', solicitadoEm: '2026-09-25T09:46:00', solicitadoPor: 'Enf. Patrícia Gomes', status: 'aguardando_realizacao' },
    { id: 'ex-011', nome: 'Troponina', tipo: 'laboratorial', solicitadoEm: '2026-09-25T09:46:00', solicitadoPor: 'Enf. Patrícia Gomes', status: 'solicitado' },
  ],
  documentos: [], anotacoes: [], transferencias: [],
}

// ===========================================================================
// PACIENTE 3 — Ana Beatriz Rocha — AMBULATORIAL (pediatria), consulta de rotina
// ===========================================================================

const anaId = 'pac-003'
export const pacienteAna: Paciente = {
  id: anaId, nome: 'Ana Beatriz Rocha', sexo: 'Feminino', dataNascimento: '2021-06-18',
  cpf: '345.678.901-22', cartaoSus: '898 0034 5678 9012', numeroProntuario: '2026-000390',
  telefone: '(11) 96655-4433', endereco: 'Rua Tupi, 88 — Jardim das Flores, São Paulo/SP',
  statusAtual: 'em_atendimento', setorAtual: 'Ambulatório Pediátrico', leitoAtual: undefined,
  medicoResponsavel: 'Dra. Helena Prado', entradaEm: '2026-09-25T10:00:00',
  resumoClinico: {
    problemasAtivos: [], comorbidades: [],
    alergias: [{ id: 'alg-010', substancia: 'Amoxicilina', tipo: 'medicamento', gravidade: 'leve', reacao: 'Exantema cutâneo', identificadoEm: '2024-02-10' }],
    medicamentosEmUso: [], cirurgiasAnteriores: [], historicoFamiliar: [],
    historicoSocial: 'Frequenta creche. Vacinação em dia conforme caderneta.',
    observacoesImportantes: 'Consulta de puericultura de rotina — acompanhamento de crescimento e desenvolvimento.',
  },
}
const atendimentoAna: Atendimento = {
  id: 'atd-003', pacienteId: anaId, numero: 'AT-2026-04520', tipo: 'ambulatorial', dataEntrada: '2026-09-25T10:00:00',
  status: 'em_atendimento', setor: 'Ambulatório Pediátrico', motivoEntrada: 'Consulta de puericultura',
  queixaPrincipal: 'Acompanhamento de rotina', historiaDoencaAtual: 'Sem queixas agudas. Mãe relata desenvolvimento adequado para idade.',
  timeline: [
    { id: 'tl-030', tipo: 'entrada', data: '2026-09-25', hora: '10:00', profissional: 'Recepção — Camila Dias', setor: 'Recepção', descricao: 'Check-in para consulta agendada.' },
    { id: 'tl-031', tipo: 'consulta', data: '2026-09-25', hora: '10:15', profissional: 'Dra. Helena Prado', setor: 'Ambulatório Pediátrico', descricao: 'Consulta de puericultura em andamento.' },
  ],
  triagens: [], evolucoesMedicas: [], evolucoesEnfermagem: [], diagnosticos: [], prescricoes: [], administracoes: [], exames: [], documentos: [], anotacoes: [], transferencias: [],
}

// ===========================================================================
// PACIENTE 4 — Carlos Eduardo Ferreira — AGUARDANDO TRIAGEM
// ===========================================================================
const carlosId = 'pac-004'
export const pacienteCarlos: Paciente = {
  id: carlosId, nome: 'Carlos Eduardo Ferreira', sexo: 'Masculino', dataNascimento: '1949-01-30',
  cpf: '456.789.012-33', cartaoSus: '898 0045 6789 0123', numeroProntuario: '2026-000501',
  telefone: '(11) 95544-3322', endereco: 'Rua Guarani, 12 — Centro, São Paulo/SP',
  statusAtual: 'aguardando_triagem', setorAtual: 'Recepção', leitoAtual: undefined,
  medicoResponsavel: undefined, entradaEm: '2026-09-25T11:05:00',
  resumoClinico: {
    problemasAtivos: [], comorbidades: [{ id: 'com-020', nome: 'Doença Pulmonar Obstrutiva Crônica' }],
    alergias: [], medicamentosEmUso: [{ id: 'med-020', nome: 'Brometo de Tiotrópio', dose: '18mcg', via: 'Inalatória', frequencia: '1x/dia', uso: 'continuo', inicioEm: '2020-01-01' }],
    cirurgiasAnteriores: [], historicoFamiliar: [], historicoSocial: 'Ex-tabagista (parou há 5 anos, 40 anos/maço).',
    observacoesImportantes: 'Idoso, avaliar prioridade de atendimento.',
  },
}
const atendimentoCarlos: Atendimento = {
  id: 'atd-004', pacienteId: carlosId, numero: 'AT-2026-04531', tipo: 'emergencia', dataEntrada: '2026-09-25T11:05:00',
  status: 'aguardando_triagem', setor: 'Recepção', motivoEntrada: 'Falta de ar', queixaPrincipal: 'Piora da falta de ar habitual',
  historiaDoencaAtual: 'Paciente com DPOC refere piora da dispneia basal há 1 dia.',
  timeline: [{ id: 'tl-040', tipo: 'entrada', data: '2026-09-25', hora: '11:05', profissional: 'Recepção — Camila Dias', setor: 'Recepção', descricao: 'Cadastro realizado, aguardando chamada para triagem.' }],
  triagens: [], evolucoesMedicas: [], evolucoesEnfermagem: [], diagnosticos: [], prescricoes: [], administracoes: [], exames: [], documentos: [], anotacoes: [], transferencias: [],
}

// ===========================================================================
// PACIENTE 5 — Francisca das Chagas — EXAMES PENDENTES
// ===========================================================================
const franciscaId = 'pac-005'
export const pacienteFrancisca: Paciente = {
  id: franciscaId, nome: 'Francisca das Chagas Oliveira', sexo: 'Feminino', dataNascimento: '1972-08-09',
  cpf: '567.890.123-44', cartaoSus: '898 0056 7890 1234', numeroProntuario: '2026-000455',
  telefone: '(11) 94433-2211', endereco: 'Rua Bahia, 320 — Vila Maria, São Paulo/SP',
  statusAtual: 'em_observacao', setorAtual: 'Observação', leitoAtual: 'OBS-05',
  medicoResponsavel: 'Dr. André Bittencourt', entradaEm: '2026-09-24T22:15:00',
  resumoClinico: {
    problemasAtivos: [{ id: 'prob-020', nome: 'Dor abdominal a esclarecer', status: 'ativo', dataIdentificacao: '2026-09-24', profissional: 'Dr. André Bittencourt', evolucao: 'Em investigação.', condutas: ['TC de abdome', 'Hemograma seriado'] }],
    comorbidades: [], alergias: [], medicamentosEmUso: [], cirurgiasAnteriores: [], historicoFamiliar: [],
    historicoSocial: 'Nega comorbidades prévias.', observacoesImportantes: 'Aguardando resultado de tomografia para definição de conduta.',
  },
}
const atendimentoFrancisca: Atendimento = {
  id: 'atd-005', pacienteId: franciscaId, numero: 'AT-2026-04477', tipo: 'emergencia', dataEntrada: '2026-09-24T22:15:00',
  status: 'em_observacao', setor: 'Observação', motivoEntrada: 'Dor abdominal intensa', queixaPrincipal: 'Dor em fossa ilíaca direita',
  historiaDoencaAtual: 'Dor abdominal em fossa ilíaca direita, início há 18h, associada a náuseas e febre baixa.',
  timeline: [
    { id: 'tl-050', tipo: 'entrada', data: '2026-09-24', hora: '22:15', profissional: 'Recepção — Camila Dias', setor: 'Recepção', descricao: 'Entrada por conta própria.' },
    { id: 'tl-051', tipo: 'triagem', data: '2026-09-24', hora: '22:20', profissional: 'Enf. Patrícia Gomes', setor: 'Classificação de Risco', descricao: 'Triagem realizada, dor 7/10.' },
    { id: 'tl-052', tipo: 'consulta', data: '2026-09-24', hora: '22:40', profissional: 'Dr. André Bittencourt', setor: 'Emergência', descricao: 'Avaliação inicial — hipótese de apendicite aguda.' },
    { id: 'tl-053', tipo: 'exame', data: '2026-09-25', hora: '00:10', profissional: 'Laboratório Central', setor: 'Laboratório', descricao: 'Coleta de exames laboratoriais.' },
  ],
  triagens: [{
    id: 'tri-003', data: '2026-09-24', hora: '22:20', profissional: 'Enf. Patrícia Gomes',
    vitais: { id: 'sv-003', data: '2026-09-24', hora: '22:20', pressaoArterial: '128/84', frequenciaCardiaca: 96, frequenciaRespiratoria: 18, saturacao: 98, temperatura: 37.8, dor: 7, nivelConsciencia: 'Alerta' },
    queixaPrincipal: 'Dor em fossa ilíaca direita', observacoes: 'Blumberg positivo.', classificacaoRisco: CLASSIFICACOES_RISCO[3],
  }],
  evolucoesMedicas: [{
    id: 'evm-010', data: '2026-09-24', hora: '22:40', profissional: 'Dr. André Bittencourt',
    anamnese: 'Dor abdominal em FID há 18h, náuseas, febre baixa.', exameFisico: 'Blumberg e McBurney positivos.',
    hipotesesDiagnosticas: ['Apendicite aguda'], diagnosticosConfirmados: [], conduta: 'Solicitado TC de abdome e exames laboratoriais. Jejum e hidratação venosa.',
    planoTerapeutico: 'Avaliação da cirurgia geral após resultado de imagem.',
  }],
  evolucoesEnfermagem: [], diagnosticos: [], prescricoes: [], administracoes: [],
  exames: [
    { id: 'ex-020', nome: 'Hemograma completo', tipo: 'laboratorial', solicitadoEm: '2026-09-25T00:10:00', solicitadoPor: 'Dr. André Bittencourt', status: 'resultado_disponivel', realizadoEm: '2026-09-25T00:45:00', resultados: [{ parametro: 'Leucócitos', valor: '14.200', unidade: '/mm³', referencia: '4.000 - 11.000', alterado: true }] },
    { id: 'ex-021', nome: 'Tomografia de Abdome', tipo: 'imagem', solicitadoEm: '2026-09-25T00:10:00', solicitadoPor: 'Dr. André Bittencourt', status: 'aguardando_realizacao' },
    { id: 'ex-022', nome: 'PCR', tipo: 'laboratorial', solicitadoEm: '2026-09-25T00:10:00', solicitadoPor: 'Dr. André Bittencourt', status: 'solicitado' },
  ],
  documentos: [], anotacoes: [{ id: 'an-010', data: '2026-09-25', hora: '06:00', autor: 'Enf. Patrícia Gomes', perfil: 'enfermeiro', tipo: 'pendencia', texto: 'Cobrar tomografia junto ao setor de imagem — mais de 5h de espera.', resolvida: false }],
  transferencias: [],
}

// ===========================================================================
// PACIENTE 6 — Roberto Nunes — EM PROCESSO DE ALTA (pós-operatório)
// ===========================================================================
const robertoId = 'pac-006'
export const pacienteRoberto: Paciente = {
  id: robertoId, nome: 'Roberto Nunes Carvalho', sexo: 'Masculino', dataNascimento: '1981-05-25',
  cpf: '678.901.234-55', cartaoSus: '898 0067 8901 2345', numeroProntuario: '2026-000402',
  telefone: '(11) 93322-1100', endereco: 'Rua Piauí, 77 — Santana, São Paulo/SP',
  statusAtual: 'em_alta', setorAtual: 'Clínica Cirúrgica', leitoAtual: 'CC-08',
  medicoResponsavel: 'Dr. André Bittencourt', entradaEm: '2026-09-22T14:30:00',
  resumoClinico: {
    problemasAtivos: [], comorbidades: [], alergias: [],
    medicamentosEmUso: [{ id: 'med-030', nome: 'Dipirona', dose: '1g', via: 'Oral', frequencia: 'Se dor', uso: 'temporario', inicioEm: '2026-09-23' }],
    cirurgiasAnteriores: [{ id: 'cir-010', nome: 'Apendicectomia videolaparoscópica', data: '2026-09-22', local: 'Centro Cirúrgico — Bloco 2' }],
    historicoFamiliar: [], historicoSocial: 'Sem comorbidades relevantes.', observacoesImportantes: 'Pós-operatório sem intercorrências, previsão de alta hoje.',
  },
}
const atendimentoRoberto: Atendimento = {
  id: 'atd-006', pacienteId: robertoId, numero: 'AT-2026-04450', tipo: 'internacao', dataEntrada: '2026-09-22T14:30:00',
  status: 'em_alta', setor: 'Clínica Cirúrgica', motivoEntrada: 'Apendicite aguda', queixaPrincipal: 'Dor abdominal', historiaDoencaAtual: 'Submetido à apendicectomia de urgência em 22/09.',
  timeline: [
    { id: 'tl-060', tipo: 'entrada', data: '2026-09-22', hora: '14:30', profissional: 'Recepção', setor: 'Recepção', descricao: 'Entrada via emergência.' },
    { id: 'tl-061', tipo: 'consulta', data: '2026-09-22', hora: '15:10', profissional: 'Dr. André Bittencourt', setor: 'Emergência', descricao: 'Diagnóstico de apendicite aguda confirmado por imagem.' },
    { id: 'tl-062', tipo: 'internacao', data: '2026-09-22', hora: '16:00', profissional: 'Dr. André Bittencourt', setor: 'Centro Cirúrgico', descricao: 'Encaminhado para apendicectomia de urgência.' },
    { id: 'tl-063', tipo: 'evolucao', data: '2026-09-23', hora: '08:00', profissional: 'Dr. André Bittencourt', setor: 'Clínica Cirúrgica', descricao: 'Pós-operatório dia 1, evolução favorável.' },
    { id: 'tl-064', tipo: 'evolucao', data: '2026-09-24', hora: '08:00', profissional: 'Dr. André Bittencourt', setor: 'Clínica Cirúrgica', descricao: 'Pós-operatório dia 2, aceitando dieta, deambulando.' },
    { id: 'tl-065', tipo: 'alta', data: '2026-09-25', hora: '09:00', profissional: 'Dr. André Bittencourt', setor: 'Clínica Cirúrgica', descricao: 'Alta hospitalar em preparação — orientações em elaboração.' },
  ],
  triagens: [], evolucoesMedicas: [], evolucoesEnfermagem: [], diagnosticos: [{ id: 'diag-010', nome: 'Apendicite aguda', cid: 'K35.8', tipo: 'confirmado', data: '2026-09-22' }],
  prescricoes: [], administracoes: [], exames: [], documentos: [{ id: 'doc-010', tipo: 'alta', titulo: 'Resumo de alta hospitalar', criadoEm: '2026-09-25T09:00:00', autor: 'Dr. André Bittencourt', assinado: false }],
  anotacoes: [], transferencias: [],
  alta: {
    id: 'alta-001', data: '2026-09-25', hora: '09:00', diagnosticoFinal: 'Apendicite aguda — pós-operatório de apendicectomia videolaparoscópica',
    resumoInternacao: 'Paciente internado em 22/09 para apendicectomia de urgência. Evoluiu sem intercorrências no pós-operatório, com boa aceitação de dieta e deambulação precoce.',
    procedimentosRealizados: ['Apendicectomia videolaparoscópica'], examesRelevantes: ['Hemograma completo', 'Tomografia de abdome'],
    medicamentosPrescritos: ['Dipirona 1g VO se dor', 'Amoxicilina + Clavulanato 875mg 12/12h por 7 dias'],
    orientacoes: 'Repouso relativo por 7 dias. Evitar esforço físico. Manter curativo seco e limpo. Retornar em caso de febre, dor intensa ou secreção na incisão.',
    retorno: 'Ambulatório de Cirurgia Geral em 7 dias', encaminhamentos: [], medicoResponsavel: 'Dr. André Bittencourt',
  },
}

// ===========================================================================
// PACIENTE 7 — Lúcia Helena Martins — EM TRANSFERÊNCIA para UTI
// ===========================================================================
const luciaId = 'pac-007'
export const pacienteLucia: Paciente = {
  id: luciaId, nome: 'Lúcia Helena Martins', sexo: 'Feminino', dataNascimento: '1965-09-12',
  cpf: '789.012.345-66', cartaoSus: '898 0078 9012 3456', numeroProntuario: '2026-000410',
  telefone: '(11) 92211-0099', endereco: 'Rua Sergipe, 45 — Bela Vista, São Paulo/SP',
  statusAtual: 'em_transferencia', setorAtual: 'Clínica Médica', leitoAtual: 'CM-12',
  medicoResponsavel: 'Dra. Camila Ferraz', entradaEm: '2026-09-23T05:20:00',
  resumoClinico: {
    problemasAtivos: [{ id: 'prob-030', nome: 'Sepse de foco urinário', status: 'ativo', dataIdentificacao: '2026-09-23', profissional: 'Dra. Camila Ferraz', evolucao: 'Piora hemodinâmica nas últimas horas, necessitando de suporte intensivo.', condutas: ['Antibioticoterapia de amplo espectro', 'Suporte hemodinâmico'] }],
    comorbidades: [{ id: 'com-030', nome: 'Doença Renal Crônica estágio 3' }], alergias: [],
    medicamentosEmUso: [], cirurgiasAnteriores: [], historicoFamiliar: [],
    historicoSocial: 'Reside sozinha, independente para AVDs.', observacoesImportantes: 'Transferência urgente para UTI por instabilidade hemodinâmica.',
  },
}
const atendimentoLucia: Atendimento = {
  id: 'atd-007', pacienteId: luciaId, numero: 'AT-2026-04460', tipo: 'internacao', dataEntrada: '2026-09-23T05:20:00',
  status: 'em_transferencia', setor: 'Clínica Médica', motivoEntrada: 'Febre e confusão mental', queixaPrincipal: 'Febre alta e queda do estado geral',
  historiaDoencaAtual: 'Quadro de infecção urinária evoluindo com sinais de sepse.',
  timeline: [
    { id: 'tl-070', tipo: 'entrada', data: '2026-09-23', hora: '05:20', profissional: 'Recepção', setor: 'Recepção', descricao: 'Entrada via emergência.' },
    { id: 'tl-071', tipo: 'internacao', data: '2026-09-23', hora: '09:00', profissional: 'Dra. Camila Ferraz', setor: 'Clínica Médica', descricao: 'Internação para tratamento de infecção urinária.' },
    { id: 'tl-072', tipo: 'evolucao', data: '2026-09-25', hora: '07:00', profissional: 'Dra. Camila Ferraz', setor: 'Clínica Médica', descricao: 'Piora clínica com hipotensão — indicada transferência para UTI.' },
    { id: 'tl-073', tipo: 'transferencia', data: '2026-09-25', hora: '07:30', profissional: 'Dra. Camila Ferraz', setor: 'Clínica Médica → UTI Geral', descricao: 'Transferência em andamento para UTI Geral.' },
  ],
  triagens: [], evolucoesMedicas: [], evolucoesEnfermagem: [], diagnosticos: [{ id: 'diag-020', nome: 'Sepse de foco urinário', cid: 'A41.9', tipo: 'confirmado', data: '2026-09-25' }],
  prescricoes: [], administracoes: [], exames: [
    { id: 'ex-030', nome: 'Lactato sérico', tipo: 'laboratorial', solicitadoEm: '2026-09-25T07:00:00', solicitadoPor: 'Dra. Camila Ferraz', status: 'resultado_critico', realizadoEm: '2026-09-25T07:20:00', resultados: [{ parametro: 'Lactato', valor: '4.8', unidade: 'mmol/L', referencia: '0.5 - 2.2', alterado: true, critico: true }] },
  ],
  documentos: [], anotacoes: [], transferencias: [
    { id: 'trf-010', data: '2026-09-25', hora: '07:30', origemSetor: 'Clínica Médica', origemLeito: 'CM-12', destinoSetor: 'UTI Geral', destinoLeito: 'UTI-05', motivo: 'Instabilidade hemodinâmica — sepse grave', responsavel: 'Dra. Camila Ferraz' },
  ],
}

// ===========================================================================
// PACIENTE 8 — Pedro Henrique Alves — EM OBSERVAÇÃO, crise asmática, alergia
// a penicilina
// ===========================================================================
const pedroId = 'pac-008'
export const pacientePedro: Paciente = {
  id: pedroId, nome: 'Pedro Henrique Alves', sexo: 'Masculino', dataNascimento: '1997-02-19',
  cpf: '890.123.456-77', cartaoSus: '898 0089 0123 4567', numeroProntuario: '2026-000499',
  telefone: '(11) 91100-9988', endereco: 'Rua Amapá, 210 — Casa Verde, São Paulo/SP',
  statusAtual: 'em_observacao', setorAtual: 'Observação', leitoAtual: 'OBS-02',
  medicoResponsavel: 'Dr. Fernando Aquino', entradaEm: '2026-09-25T07:50:00',
  resumoClinico: {
    problemasAtivos: [{ id: 'prob-040', nome: 'Crise asmática moderada', status: 'ativo', dataIdentificacao: '2026-09-25', profissional: 'Dr. Fernando Aquino', evolucao: 'Boa resposta a broncodilatador, em observação.', condutas: ['Nebulização com Salbutamol', 'Corticoide sistêmico'] }],
    comorbidades: [{ id: 'com-040', nome: 'Asma brônquica' }],
    alergias: [{ id: 'alg-020', substancia: 'Penicilina', tipo: 'medicamento', gravidade: 'grave', reacao: 'Broncoespasmo e urticária generalizada', identificadoEm: '2015-03-01' }],
    medicamentosEmUso: [{ id: 'med-040', nome: 'Salbutamol spray', dose: '100mcg', via: 'Inalatória', frequencia: 'Se necessário', uso: 'continuo', inicioEm: '2015-03-01' }],
    cirurgiasAnteriores: [], historicoFamiliar: [], historicoSocial: 'Estudante universitário. Não tabagista.',
    observacoesImportantes: 'Atenção: NÃO administrar Penicilina ou derivados.',
  },
}
const atendimentoPedro: Atendimento = {
  id: 'atd-008', pacienteId: pedroId, numero: 'AT-2026-04528', tipo: 'emergencia', dataEntrada: '2026-09-25T07:50:00',
  status: 'em_observacao', setor: 'Observação', motivoEntrada: 'Falta de ar', queixaPrincipal: 'Chiado no peito e dificuldade para respirar',
  historiaDoencaAtual: 'Crise de chiado no peito e dispneia iniciada durante a madrugada, sem resposta ao uso de bombinha de resgate.',
  timeline: [
    { id: 'tl-080', tipo: 'entrada', data: '2026-09-25', hora: '07:50', profissional: 'Recepção', setor: 'Recepção', descricao: 'Entrada por conta própria.' },
    { id: 'tl-081', tipo: 'triagem', data: '2026-09-25', hora: '07:55', profissional: 'Enf. Patrícia Gomes', setor: 'Classificação de Risco', descricao: 'Triagem — sibilância difusa bilateral.' },
    { id: 'tl-082', tipo: 'consulta', data: '2026-09-25', hora: '08:05', profissional: 'Dr. Fernando Aquino', setor: 'Emergência', descricao: 'Avaliação médica — crise asmática moderada.' },
    { id: 'tl-083', tipo: 'medicacao', data: '2026-09-25', hora: '08:15', profissional: 'Téc. Enf. Rodrigo Melo', setor: 'Emergência', descricao: 'Nebulização com Salbutamol administrada.' },
    { id: 'tl-084', tipo: 'evolucao', data: '2026-09-25', hora: '09:30', profissional: 'Dr. Fernando Aquino', setor: 'Observação', descricao: 'Melhora da ausculta pulmonar, mantido em observação.' },
  ],
  triagens: [{
    id: 'tri-004', data: '2026-09-25', hora: '07:55', profissional: 'Enf. Patrícia Gomes',
    vitais: { id: 'sv-004', data: '2026-09-25', hora: '07:55', pressaoArterial: '124/80', frequenciaCardiaca: 110, frequenciaRespiratoria: 28, saturacao: 92, temperatura: 36.8, dor: 0, nivelConsciencia: 'Alerta' },
    queixaPrincipal: 'Falta de ar e chiado no peito', observacoes: 'Sibilos expiratórios difusos bilaterais.', classificacaoRisco: CLASSIFICACOES_RISCO[2],
  }],
  evolucoesMedicas: [{
    id: 'evm-020', data: '2026-09-25', hora: '08:05', profissional: 'Dr. Fernando Aquino',
    anamnese: 'Asmático conhecido, crise iniciada há 4h sem resposta a resgate domiciliar.', exameFisico: 'Sibilos difusos bilaterais, tiragem intercostal leve.',
    hipotesesDiagnosticas: [], diagnosticosConfirmados: ['Crise asmática moderada'], conduta: 'Nebulização com Salbutamol + Ipratrópio, corticoide sistêmico, monitorização.', planoTerapeutico: 'Reavaliar em 1h — se melhora, alta com plano de ação para asma.',
  }],
  evolucoesEnfermagem: [], diagnosticos: [{ id: 'diag-030', nome: 'Crise asmática moderada', cid: 'J45.1', tipo: 'confirmado', data: '2026-09-25' }],
  prescricoes: [{
    id: 'presc-010', data: '2026-09-25', hora: '08:10', profissional: 'Dr. Fernando Aquino', status: 'ativa',
    itens: [
      { id: 'pi-010', medicamento: 'Salbutamol', dose: '2,5mg', via: 'Inalatória', frequencia: '20/20min (3x)', horarios: ['08:15', '08:35', '08:55'], duracao: 'Conforme resposta' },
      { id: 'pi-011', medicamento: 'Prednisona', dose: '40mg', via: 'Oral', frequencia: '1x/dia', horarios: ['08:20'], duracao: '5 dias' },
    ],
  }],
  administracoes: [
    { id: 'adm-010', prescricaoItemId: 'pi-010', medicamento: 'Salbutamol 2,5mg', horarioPrevisto: '08:15', horarioReal: '08:15', status: 'administrado', responsavel: 'Téc. Enf. Rodrigo Melo', dose: '2,5mg inalatório' },
    { id: 'adm-011', prescricaoItemId: 'pi-010', medicamento: 'Salbutamol 2,5mg', horarioPrevisto: '08:35', horarioReal: '08:36', status: 'administrado', responsavel: 'Téc. Enf. Rodrigo Melo', dose: '2,5mg inalatório' },
    { id: 'adm-012', prescricaoItemId: 'pi-010', medicamento: 'Salbutamol 2,5mg', horarioPrevisto: '08:55', status: 'pendente', dose: '2,5mg inalatório' },
  ],
  exames: [], documentos: [], anotacoes: [], transferencias: [],
}

// ===========================================================================
// Exportações agregadas
// ===========================================================================

export const PACIENTES: Paciente[] = [
  pacienteMaria, pacienteJoao, pacienteAna, pacienteCarlos,
  pacienteFrancisca, pacienteRoberto, pacienteLucia, pacientePedro,
]

export const ATENDIMENTOS: Atendimento[] = [
  atendimentoMaria, atendimentoJoao, atendimentoAna, atendimentoCarlos,
  atendimentoFrancisca, atendimentoRoberto, atendimentoLucia, atendimentoPedro,
]

// Histórico de atendimentos anteriores (para a seção "Histórico do Paciente")
export const HISTORICO_ANTERIOR: Record<string, { id: string; ano: number; data: string; tipo: string; titulo: string; setor: string; status: string }[]> = {
  [mariaId]: [
    { id: 'hist-001', ano: 2025, data: '2025-11-02', tipo: 'Internação', titulo: 'Internação por crise hipertensiva', setor: 'Clínica Médica', status: 'Alta em 2025-11-06' },
    { id: 'hist-002', ano: 2025, data: '2025-04-18', tipo: 'Consulta ambulatorial', titulo: 'Consulta de rotina — Endocrinologia', setor: 'Ambulatório', status: 'Concluído' },
    { id: 'hist-003', ano: 2024, data: '2024-09-30', tipo: 'Emergência', titulo: 'Atendimento por hipoglicemia', setor: 'Emergência', status: 'Alta no mesmo dia' },
  ],
  [robertoId]: [
    { id: 'hist-010', ano: 2024, data: '2024-06-12', tipo: 'Consulta ambulatorial', titulo: 'Check-up anual', setor: 'Ambulatório', status: 'Concluído' },
  ],
  [pedroId]: [
    { id: 'hist-020', ano: 2025, data: '2025-12-03', tipo: 'Emergência', titulo: 'Crise asmática leve', setor: 'Emergência', status: 'Alta no mesmo dia' },
    { id: 'hist-021', ano: 2024, data: '2024-08-14', tipo: 'Emergência', titulo: 'Crise asmática moderada', setor: 'Emergência', status: 'Alta no mesmo dia' },
  ],
}
