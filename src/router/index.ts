import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { auditService } from '@/services/auditService'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      // Folha de impressão das etiquetas QR — fora do layout para imprimir limpa.
      path: '/leitos/etiquetas',
      name: 'leitos-etiquetas',
      component: () => import('@/views/EtiquetasLeitosView.vue'),
      meta: { perm: 'leitos.view', recurso: 'a impressão de etiquetas de leito' },
    },
    {
      path: '/',
      component: () => import('@/layouts/AppShell.vue'),
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
        { path: 'acesso-restrito', name: 'acesso-restrito', component: () => import('@/views/AcessoRestritoView.vue') },
        { path: 'pacientes', name: 'pacientes', component: () => import('@/views/PacientesListView.vue') },
        {
          path: 'pacientes/novo',
          name: 'paciente-novo',
          component: () => import('@/views/PacienteNovoView.vue'),
          meta: { perm: 'paciente.cadastrar', recurso: 'o cadastro de pacientes' },
        },
        {
          path: 'pacientes/:id/editar',
          name: 'paciente-editar',
          component: () => import('@/views/PacienteEditarView.vue'),
          props: true,
          meta: { perm: 'paciente.editar', recurso: 'a edição de cadastro' },
        },
        {
          path: 'pacientes/:id/basico',
          name: 'paciente-basico',
          component: () => import('@/views/paciente/PacienteVisaoBasica.vue'),
          props: true,
          meta: { perm: 'paciente.ver', recurso: 'os dados do paciente' },
        },
        {
          path: 'pacientes/:id/atendimento/novo',
          name: 'paciente-atendimento-novo',
          component: () => import('@/views/paciente/NovoAtendimentoView.vue'),
          props: true,
          meta: { perm: 'atendimento.abrir', recurso: 'a abertura de atendimentos' },
        },
        {
          path: 'pacientes/:id/acolhimento',
          name: 'paciente-acolhimento',
          component: () => import('@/views/paciente/AcolhimentoView.vue'),
          props: true,
          meta: { perm: 'acolhimento.registrar', recurso: 'o registro de acolhimento' },
        },
        {
          path: 'pacientes/:id/triagem/nova',
          name: 'paciente-triagem-nova',
          component: () => import('@/views/paciente/TriagemWizardView.vue'),
          props: true,
          meta: { perm: 'triagem.criar', recurso: 'o registro de triagem' },
        },
        {
          // Prontuário clínico 360° — exige acesso clínico completo. Perfis
          // sem essa permissão são redirecionados para a visão básica
          // (ver guard abaixo), nunca para uma tela de erro genérica.
          path: 'pacientes/:id',
          component: () => import('@/views/paciente/PacienteShell.vue'),
          props: true,
          meta: { perm: 'clinical.record.view', recurso: 'o prontuário clínico' },
          children: [
            { path: '', name: 'paciente-visao-geral', component: () => import('@/views/paciente/PacienteVisaoGeral.vue') },
            { path: 'evolucoes', name: 'paciente-evolucoes', component: () => import('@/views/paciente/PacienteEvolucoes.vue') },
            { path: 'prescricao', name: 'paciente-prescricao', component: () => import('@/views/paciente/PacientePrescricaoAba.vue') },
            { path: 'receita', name: 'paciente-receita', component: () => import('@/views/paciente/PacienteReceita.vue') },
            { path: 'documentos', name: 'paciente-documentos', component: () => import('@/views/paciente/PacienteDocumentos.vue') },
            { path: 'historico', name: 'paciente-historico', component: () => import('@/views/paciente/PacienteHistorico.vue') },
            // Abas antigas foram incorporadas ao Resumo / Prescrição; links antigos continuam funcionando.
            ...['atendimento', 'triagem', 'exames', 'internacao'].map((path) => ({ path, redirect: (to: { params: Record<string, unknown> }) => `/pacientes/${to.params.id}` })),
            ...['prescricoes', 'medicamentos'].map((path) => ({ path, redirect: (to: { params: Record<string, unknown> }) => `/pacientes/${to.params.id}/prescricao` })),
          ],
        },
        {
          path: 'triagem',
          name: 'triagem-fila',
          component: () => import('@/views/TriagemFilaView.vue'),
          meta: { perm: 'triage.view', recurso: 'a fila de triagem' },
        },
        {
          path: 'leitos',
          name: 'leitos',
          component: () => import('@/views/LeitosView.vue'),
          meta: { perm: 'leitos.view', recurso: 'o mapa de leitos' },
        },
        {
          // Destino do QR Code colado no leito: exige login e acesso clínico,
          // e redireciona para o prontuário do ocupante atual do leito.
          path: 'leito/:numero',
          name: 'leito-acesso',
          component: () => import('@/views/LeitoAcessoView.vue'),
          props: true,
        },
        { path: 'atendimentos', name: 'atendimentos', component: () => import('@/views/AtendimentosView.vue') },
        {
          path: 'exames',
          name: 'exames',
          component: () => import('@/views/ExamesGlobalView.vue'),
          meta: { perm: 'exames.global.view', recurso: 'o painel de exames' },
        },
        {
          path: 'farmacia',
          name: 'farmacia',
          component: () => import('@/views/FarmaciaView.vue'),
          meta: { perm: 'farmacia.view', recurso: 'o painel da farmácia' },
        },
        {
          path: 'usuarios',
          name: 'usuarios',
          component: () => import('@/views/UsuariosView.vue'),
          meta: { perm: 'usuarios.view', recurso: 'a administração de usuários' },
        },
        {
          path: 'auditoria',
          name: 'auditoria',
          component: () => import('@/views/AuditoriaView.vue'),
          meta: { perm: 'auditoria.ver', recurso: 'o módulo de auditoria' },
        },
        { path: 'configuracoes', name: 'configuracoes', component: () => import('@/views/ConfiguracoesView.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!auth.usuario) auth.restaurarSessao()
  if (!to.meta.public && !auth.usuario) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.path === '/login' && auth.usuario) {
    return { path: '/dashboard' }
  }

  const permissaoNecessaria = to.meta.perm as string | undefined
  if (permissaoNecessaria && !auth.pode(permissaoNecessaria)) {
    if (auth.usuario) {
      auditService.registrar({
        usuario: auth.usuario.nome,
        perfil: auth.usuario.perfil,
        acao: 'Tentativa de acesso negada',
        entidade: 'Rota',
        entidadeId: to.fullPath,
        detalhes: `Acesso a "${to.meta.recurso ?? to.path}" negado — permissão "${permissaoNecessaria}" ausente para o perfil ${auth.usuario.perfil}.`,
      })
    }
    // Caso especial: prontuário clínico → cai para a visão básica em vez de
    // uma tela de erro, pois o paciente em si é um recurso legítimo para
    // vários perfis — apenas os dados clínicos são restritos.
    if (permissaoNecessaria === 'clinical.record.view' && typeof to.params.id === 'string') {
      return { path: `/pacientes/${to.params.id}/basico` }
    }
    return { path: '/acesso-restrito', query: { recurso: (to.meta.recurso as string) ?? to.path } }
  }
  return true
})

export default router
