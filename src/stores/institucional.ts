import { defineStore } from 'pinia'
import type { AuditLogEntry, Leito, Usuario, Atendimento } from '@/types'
import { institucionalService } from '@/services/institucionalService'

export const useInstitucionalStore = defineStore('institucional', {
  state: () => ({
    indicadores: null as Awaited<ReturnType<typeof institucionalService.obterIndicadores>> | null,
    leitos: [] as Leito[],
    usuarios: [] as Usuario[],
    auditLog: [] as AuditLogEntry[],
    atendimentos: [] as Atendimento[],
    carregando: false,
  }),
  actions: {
    async carregarDashboard() {
      this.carregando = true
      const [indicadores, leitos, atendimentos] = await Promise.all([
        institucionalService.obterIndicadores(),
        institucionalService.listarLeitos(),
        institucionalService.listarAtendimentos(),
      ])
      this.indicadores = indicadores
      this.leitos = leitos
      this.atendimentos = atendimentos
      this.carregando = false
    },
    async carregarLeitos() {
      this.leitos = await institucionalService.listarLeitos()
    },
    async carregarUsuarios() {
      this.usuarios = await institucionalService.listarUsuarios()
    },
    async carregarAuditoria() {
      this.auditLog = await institucionalService.listarAuditoria()
    },
    async carregarAtendimentos() {
      this.atendimentos = await institucionalService.listarAtendimentos()
    },
  },
})
