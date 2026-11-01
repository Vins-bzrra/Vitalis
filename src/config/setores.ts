// Setores assistenciais da unidade. `internacao: true` indica setores de
// pacientes internados (leito de enfermaria/UTI); os demais recebem fichas
// abertas de urgência/emergência ou ambulatório.
export const SETORES: { nome: string; internacao: boolean }[] = [
  { nome: 'UTI Geral', internacao: true },
  { nome: 'Clínica Médica', internacao: true },
  { nome: 'Clínica Cirúrgica', internacao: true },
  { nome: 'Pediatria', internacao: true },
  { nome: 'Emergência', internacao: false },
  { nome: 'Observação', internacao: false },
  { nome: 'Ambulatório Pediátrico', internacao: false },
  { nome: 'Recepção', internacao: false },
]
