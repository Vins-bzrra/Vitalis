import { AUDIT_LOG } from '@/mock/usuarios'
import type { AuditLogEntry, PerfilUsuario } from '@/types'

const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms))

export interface RegistrarAuditoriaInput {
  usuario: string
  perfil: PerfilUsuario
  acao: string
  entidade: string
  entidadeId: string
  detalhes: string
}

export const auditService = {
  async registrar(input: RegistrarAuditoriaInput): Promise<AuditLogEntry> {
    await delay()
    const agora = new Date('2026-09-25T12:00:00')
    const entrada: AuditLogEntry = {
      id: `aud-${Math.random().toString(36).slice(2, 9)}`,
      data: agora.toISOString().slice(0, 10),
      hora: agora.toTimeString().slice(0, 5),
      ...input,
    }
    AUDIT_LOG.unshift(entrada)
    return entrada
  },

  async listar(): Promise<AuditLogEntry[]> {
    await delay()
    return AUDIT_LOG
  },
}
