import type { Leito } from '@/types'

export const LEITOS: Leito[] = [
  { id: 'leito-uti-01', numero: 'UTI-01', setor: 'UTI Geral', quarto: 'Quarto 1', status: 'ocupado', pacienteId: undefined },
  { id: 'leito-uti-02', numero: 'UTI-02', setor: 'UTI Geral', quarto: 'Quarto 1', status: 'livre' },
  { id: 'leito-uti-03', numero: 'UTI-03', setor: 'UTI Geral', quarto: 'Quarto 2', status: 'ocupado', pacienteId: 'pac-001' },
  { id: 'leito-uti-04', numero: 'UTI-04', setor: 'UTI Geral', quarto: 'Quarto 2', status: 'higienizacao' },
  { id: 'leito-uti-05', numero: 'UTI-05', setor: 'UTI Geral', quarto: 'Quarto 3', status: 'bloqueado' },

  { id: 'leito-obs-01', numero: 'OBS-01', setor: 'Observação', quarto: 'Sala de Observação', status: 'livre' },
  { id: 'leito-obs-02', numero: 'OBS-02', setor: 'Observação', quarto: 'Sala de Observação', status: 'ocupado', pacienteId: 'pac-008' },
  { id: 'leito-obs-03', numero: 'OBS-03', setor: 'Observação', quarto: 'Sala de Observação', status: 'livre' },
  { id: 'leito-obs-04', numero: 'OBS-04', setor: 'Observação', quarto: 'Sala de Observação', status: 'manutencao' },
  { id: 'leito-obs-05', numero: 'OBS-05', setor: 'Observação', quarto: 'Sala de Observação', status: 'ocupado', pacienteId: 'pac-005' },

  { id: 'leito-cm-10', numero: 'CM-10', setor: 'Clínica Médica', quarto: 'Quarto 10', status: 'livre' },
  { id: 'leito-cm-11', numero: 'CM-11', setor: 'Clínica Médica', quarto: 'Quarto 10', status: 'livre' },
  { id: 'leito-cm-12', numero: 'CM-12', setor: 'Clínica Médica', quarto: 'Quarto 11', status: 'ocupado', pacienteId: 'pac-007' },
  { id: 'leito-cm-13', numero: 'CM-13', setor: 'Clínica Médica', quarto: 'Quarto 11', status: 'higienizacao' },

  { id: 'leito-cc-06', numero: 'CC-06', setor: 'Clínica Cirúrgica', quarto: 'Quarto 6', status: 'livre' },
  { id: 'leito-cc-07', numero: 'CC-07', setor: 'Clínica Cirúrgica', quarto: 'Quarto 6', status: 'bloqueado' },
  { id: 'leito-cc-08', numero: 'CC-08', setor: 'Clínica Cirúrgica', quarto: 'Quarto 7', status: 'ocupado', pacienteId: 'pac-006' },
  { id: 'leito-cc-09', numero: 'CC-09', setor: 'Clínica Cirúrgica', quarto: 'Quarto 7', status: 'livre' },

  { id: 'leito-pedi-01', numero: 'PED-01', setor: 'Pediatria', quarto: 'Quarto Pediátrico 1', status: 'livre' },
  { id: 'leito-pedi-02', numero: 'PED-02', setor: 'Pediatria', quarto: 'Quarto Pediátrico 1', status: 'livre' },
]
