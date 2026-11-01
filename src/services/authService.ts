import type { PerfilUsuario, Usuario } from '@/types'
import { USUARIOS } from '@/mock/usuarios'

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

export const PERFIL_LABEL: Record<PerfilUsuario, string> = {
  administrador: 'Administrador',
  medico: 'Médico',
  enfermeiro: 'Enfermeiro',
  tecnico_enfermagem: 'Técnico de Enfermagem',
  recepcao: 'Recepção',
  laboratorio: 'Laboratório',
  farmacia: 'Farmácia',
  gestao: 'Gestão',
}

// Permissões por perfil — usadas para habilitar/desabilitar ações e, mais
// importante, para decidir O QUE é renderizado (dashboard, sidebar,
// prontuário clínico x visão básica, timeline, fila de triagem etc.).
// Este é o único lugar do protótipo onde a relação perfil → permissão é
// definida; todo o restante da aplicação consulta esta tabela através de
// `usePermissions()` / `authStore.pode()`, nunca comparando `perfil === '...'`
// diretamente em componentes de tela.
export const PERMISSOES: Record<PerfilUsuario, string[]> = {
  administrador: ['*'],

  medico: [
    'paciente.ver', 'clinical.record.view', 'clinical.alerts.view',
    'prescricao.criar', 'prescricao.ver', 'evolucao.criar', 'exame.solicitar',
    'alta.criar', 'diagnostico.criar', 'documento.assinar', 'triagem.ver_resultado', 'receita.criar',
    // Sem 'leitos.view' (gestão de leitos é do NIR/enfermagem/gestão) e sem
    // 'exames.global.view' (fila do laboratório): o médico vê os exames dentro
    // da página de cada paciente.
  ],

  enfermeiro: [
    'paciente.ver', 'clinical.record.view', 'clinical.alerts.view',
    'triage.view', 'triagem.criar', 'evolucao_enfermagem.criar',
    'medicacao.administrar', 'sinais_vitais.registrar', 'leitos.view',
  ],

  tecnico_enfermagem: [
    'paciente.ver', 'clinical.record.view', 'clinical.alerts.view',
    'triage.view', 'triagem.criar', 'sinais_vitais.registrar',
    'medicacao.administrar', 'leitos.view',
  ],

  recepcao: [
    'paciente.ver', 'paciente.cadastrar', 'paciente.editar',
    'atendimento.abrir', 'acolhimento.registrar',
  ],

  laboratorio: [
    'paciente.ver', 'exame.registrar_resultado', 'exames.global.view',
  ],

  farmacia: [
    'paciente.ver', 'prescricao.ver', 'medicacao.dispensar', 'farmacia.view',
  ],

  gestao: [
    'paciente.ver', 'indicadores.ver', 'auditoria.ver', 'leitos.view',
  ],
}

export function temPermissao(perfil: PerfilUsuario, acao: string): boolean {
  const permissoes = PERMISSOES[perfil]
  return permissoes.includes('*') || permissoes.includes(acao)
}

export const authService = {
  async login(email: string, _senha: string): Promise<Usuario> {
    await delay()
    const usuario = USUARIOS.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.ativo)
    if (!usuario) throw new Error('Credenciais inválidas ou usuário inativo.')
    return usuario
  },

  async entrarComoPerfil(perfil: PerfilUsuario): Promise<Usuario> {
    await delay(250)
    const usuario = USUARIOS.find((u) => u.perfil === perfil && u.ativo)
    if (!usuario) throw new Error('Nenhum usuário ativo encontrado para este perfil.')
    return usuario
  },
}
