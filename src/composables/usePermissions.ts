import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { PERFIL_LABEL } from '@/services/authService'

// Camada única de autorização usada por todas as telas do protótipo.
// Nenhum componente deve comparar `auth.usuario?.perfil === 'medico'`
// diretamente — em vez disso, ele expressa a REGRA de negócio (ex.:
// "posso ver o prontuário clínico?") e este composable resolve a permissão
// correspondente através da tabela central em `authService.PERMISSOES`.
export function usePermissions() {
  const auth = useAuthStore()

  const perfil = computed(() => auth.usuario?.perfil ?? null)
  const perfilLabel = computed(() => (perfil.value ? PERFIL_LABEL[perfil.value] : ''))

  function can(permissao: string): boolean {
    return auth.pode(permissao)
  }

  function canAny(permissoes: string[]): boolean {
    return permissoes.some((p) => auth.pode(p))
  }

  function canAll(permissoes: string[]): boolean {
    return permissoes.every((p) => auth.pode(p))
  }

  // Atalhos semânticos para as regras mais reutilizadas na aplicação.
  const temAcessoClinico = computed(() => can('clinical.record.view'))
  const podeVerAlertasClinicos = computed(() => can('clinical.alerts.view'))
  const podeVerFilaTriagem = computed(() => can('triage.view'))
  const podeRealizarTriagem = computed(() => can('triagem.criar'))
  const podeVerLeitos = computed(() => can('leitos.view'))
  const podeVerExamesGlobais = computed(() => can('exames.global.view'))
  const podeVerFarmacia = computed(() => can('farmacia.view'))
  const podeVerUsuarios = computed(() => can('usuarios.view'))
  const podeVerAuditoria = computed(() => can('auditoria.ver'))
  const podeVerIndicadoresGestao = computed(() => can('indicadores.ver'))

  return {
    auth,
    perfil,
    perfilLabel,
    can,
    canAny,
    canAll,
    temAcessoClinico,
    podeVerAlertasClinicos,
    podeVerFilaTriagem,
    podeRealizarTriagem,
    podeVerLeitos,
    podeVerExamesGlobais,
    podeVerFarmacia,
    podeVerUsuarios,
    podeVerAuditoria,
    podeVerIndicadoresGestao,
  }
}
