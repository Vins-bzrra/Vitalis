import type { AuditLogEntry, Usuario } from '@/types'

export const USUARIOS: Usuario[] = [
  { id: 'usr-001', nome: 'Dr. Fernando Aquino', email: 'fernando.aquino@unidade.saude.br', perfil: 'medico', registro: 'CRM 145.221-SP', ativo: true },
  { id: 'usr-002', nome: 'Dra. Camila Ferraz', email: 'camila.ferraz@unidade.saude.br', perfil: 'medico', registro: 'CRM 178.933-SP', ativo: true },
  { id: 'usr-003', nome: 'Dr. André Bittencourt', email: 'andre.bittencourt@unidade.saude.br', perfil: 'medico', registro: 'CRM 199.204-SP', ativo: true },
  { id: 'usr-004', nome: 'Dra. Helena Prado', email: 'helena.prado@unidade.saude.br', perfil: 'medico', registro: 'CRM 165.112-SP', ativo: true },
  { id: 'usr-005', nome: 'Enf. Patrícia Gomes', email: 'patricia.gomes@unidade.saude.br', perfil: 'enfermeiro', registro: 'COREN 245.001-SP', ativo: true },
  { id: 'usr-006', nome: 'Téc. Enf. Rodrigo Melo', email: 'rodrigo.melo@unidade.saude.br', perfil: 'tecnico_enfermagem', registro: 'COREN-TE 301.884-SP', ativo: true },
  { id: 'usr-007', nome: 'Camila Dias', email: 'camila.dias@unidade.saude.br', perfil: 'recepcao', ativo: true },
  { id: 'usr-008', nome: 'Sandra Reis', email: 'sandra.reis@unidade.saude.br', perfil: 'gestao', ativo: true },
  { id: 'usr-009', nome: 'Bruno Salles', email: 'bruno.salles@unidade.saude.br', perfil: 'farmacia', ativo: true },
  { id: 'usr-010', nome: 'Juliana Prado', email: 'juliana.prado@unidade.saude.br', perfil: 'laboratorio', ativo: true },
  { id: 'usr-011', nome: 'Admin Sistema', email: 'admin@unidade.saude.br', perfil: 'administrador', ativo: true },
  { id: 'usr-012', nome: 'Dra. Beatriz Lemos', email: 'beatriz.lemos@unidade.saude.br', perfil: 'medico', registro: 'CRM 210.556-SP', ativo: false },
]

export const AUDIT_LOG: AuditLogEntry[] = [
  { id: 'aud-001', data: '2026-09-25', hora: '09:15', usuario: 'Dr. Fernando Aquino', perfil: 'medico', acao: 'Assinou evolução médica', entidade: 'EvolucaoMedica', entidadeId: 'evm-003', detalhes: 'Assinatura digital da evolução do paciente Maria Aparecida Souza (prontuário 2026-000481).' },
  { id: 'aud-002', data: '2026-09-25', hora: '08:36', usuario: 'Téc. Enf. Rodrigo Melo', perfil: 'tecnico_enfermagem', acao: 'Registrou administração de medicamento', entidade: 'AdministracaoMedicamento', entidadeId: 'adm-011', detalhes: 'Salbutamol 2,5mg administrado ao paciente Pedro Henrique Alves.' },
  { id: 'aud-003', data: '2026-09-25', hora: '07:30', usuario: 'Dra. Camila Ferraz', perfil: 'medico', acao: 'Solicitou transferência de setor', entidade: 'Transferencia', entidadeId: 'trf-010', detalhes: 'Transferência de Lúcia Helena Martins da Clínica Médica para UTI Geral.' },
  { id: 'aud-004', data: '2026-09-24', hora: '22:41', usuario: 'Dr. André Bittencourt', perfil: 'medico', acao: 'Criou evolução médica', entidade: 'EvolucaoMedica', entidadeId: 'evm-010', detalhes: 'Primeira avaliação de Francisca das Chagas Oliveira.' },
  { id: 'aud-005', data: '2026-09-23', hora: '09:00', usuario: 'Dr. Fernando Aquino', perfil: 'medico', acao: 'Prescreveu medicamentos', entidade: 'Prescricao', entidadeId: 'presc-001', detalhes: 'Nova prescrição para Maria Aparecida Souza — antibioticoterapia e insulina.' },
  { id: 'aud-006', data: '2026-09-20', hora: '11:40', usuario: 'Dr. Fernando Aquino', perfil: 'medico', acao: 'Internou paciente', entidade: 'Internacao', entidadeId: 'int-001', detalhes: 'Internação de Maria Aparecida Souza em UTI Geral, leito UTI-03.' },
  { id: 'aud-007', data: '2026-09-20', hora: '08:22', usuario: 'Enf. Patrícia Gomes', perfil: 'enfermeiro', acao: 'Classificou risco', entidade: 'Triagem', entidadeId: 'tri-001', detalhes: 'Classificação Muito Urgente atribuída a Maria Aparecida Souza.' },
  { id: 'aud-008', data: '2026-09-18', hora: '16:02', usuario: 'Admin Sistema', perfil: 'administrador', acao: 'Alterou permissão de usuário', entidade: 'Usuario', entidadeId: 'usr-012', detalhes: 'Usuário Dra. Beatriz Lemos desativado por transferência de unidade.' },
]
