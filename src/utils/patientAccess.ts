import { useAuthStore } from '@/stores/auth'

// Ponto único de decisão: para onde o clique em "abrir paciente" deve levar.
// Perfis com acesso clínico completo (médico, enfermeiro, técnico de
// enfermagem, administrador) vão para o prontuário 360°. Os demais perfis
// (recepção, laboratório, farmácia, gestão) vão para a visão básica,
// administrativa, sem dados clínicos.
export function rotaProntuario(pacienteId: string): string {
  const auth = useAuthStore()
  return auth.pode('clinical.record.view')
    ? `/pacientes/${pacienteId}`
    : `/pacientes/${pacienteId}/basico`
}
