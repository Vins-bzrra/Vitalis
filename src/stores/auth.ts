import { defineStore } from 'pinia'
import type { PerfilUsuario, Usuario } from '@/types'
import { authService, temPermissao } from '@/services/authService'

const STORAGE_KEY = 'prontuario:usuario'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    usuario: null as Usuario | null,
    carregando: false,
    erro: '' as string,
  }),
  getters: {
    autenticado: (state) => !!state.usuario,
    perfil: (state): PerfilUsuario | null => state.usuario?.perfil ?? null,
  },
  actions: {
    restaurarSessao() {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        try { this.usuario = JSON.parse(raw) } catch { /* ignore */ }
      }
    },
    async login(email: string, senha: string) {
      this.carregando = true
      this.erro = ''
      try {
        const usuario = await authService.login(email, senha)
        this.usuario = usuario
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(usuario))
        return true
      } catch (e) {
        this.erro = e instanceof Error ? e.message : 'Falha no login.'
        return false
      } finally {
        this.carregando = false
      }
    },
    async loginComoPerfil(perfil: PerfilUsuario) {
      this.carregando = true
      this.erro = ''
      try {
        const usuario = await authService.entrarComoPerfil(perfil)
        this.usuario = usuario
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(usuario))
        return true
      } catch (e) {
        this.erro = e instanceof Error ? e.message : 'Falha no login.'
        return false
      } finally {
        this.carregando = false
      }
    },
    logout() {
      this.usuario = null
      sessionStorage.removeItem(STORAGE_KEY)
    },
    pode(acao: string): boolean {
      if (!this.usuario) return false
      return temPermissao(this.usuario.perfil, acao)
    },
  },
})
