<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard, Users, BedDouble, ClipboardList, FlaskConical, PillBottle,
  ShieldCheck, History, Settings, Search, Menu, X, LogOut, ChevronDown, Cross, Stethoscope,
} from 'lucide-vue-next'
import GlobalSearch from '@/components/layout/GlobalSearch.vue'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import { useAuthStore } from '@/stores/auth'
import { PERFIL_LABEL } from '@/services/authService'
import { usePermissions } from '@/composables/usePermissions'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { can } = usePermissions()

const sidebarAberta = ref(false)
const buscaAberta = ref(false)
const menuUsuarioAberto = ref(false)

// O menu lateral é montado dinamicamente: cada item só aparece se o
// usuário autenticado possuir a permissão correspondente. `perm: null`
// significa "disponível para qualquer usuário autenticado".
const TODOS_OS_ITENS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, perm: null },
  { to: '/atendimentos', label: 'Atendimentos', icon: ClipboardList, perm: null },
  { to: '/pacientes', label: 'Pacientes', icon: Users, perm: 'paciente.ver' },
  { to: '/triagem', label: 'Triagem', icon: Stethoscope, perm: 'triage.view', destaque: true },
  { to: '/leitos', label: 'Leitos & Internação', icon: BedDouble, perm: 'leitos.view' },
  { to: '/exames', label: 'Exames', icon: FlaskConical, perm: 'exames.global.view' },
  { to: '/farmacia', label: 'Farmácia', icon: PillBottle, perm: 'farmacia.view' },
  { to: '/usuarios', label: 'Usuários', icon: ShieldCheck, perm: 'usuarios.view' },
  { to: '/auditoria', label: 'Auditoria', icon: History, perm: 'auditoria.ver' },
  { to: '/configuracoes', label: 'Configurações', icon: Settings, perm: null },
]

const navItems = computed(() => TODOS_OS_ITENS.filter((item) => !item.perm || can(item.perm)))

const breadcrumbs = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  return parts
})

function sair() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="shell">
    <Transition name="drawer-fade">
      <div v-if="sidebarAberta" class="shell__scrim" @click="sidebarAberta = false" />
    </Transition>

    <aside class="shell__sidebar" :class="{ 'is-open': sidebarAberta }">
      <div class="shell__brand">
        <span class="shell__brand-mark"><Cross :size="18" /></span>
        <span class="shell__brand-text">Prontuário<strong>Vitalis</strong></span>
        <button class="shell__sidebar-close" aria-label="Fechar menu" @click="sidebarAberta = false"><X :size="20" /></button>
      </div>

      <nav class="shell__nav" aria-label="Navegação principal">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="shell__nav-link"
          :class="{ 'is-destaque': item.destaque }"
          @click="sidebarAberta = false"
        >
          <component :is="item.icon" :size="19" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="shell__sidebar-footer">
        <p>Unidade Básica de Saúde Vitalis</p>
        <p class="mono-num">v0.9.0 · protótipo</p>
      </div>
    </aside>

    <div class="shell__main">
      <header class="shell__header">
        <button class="shell__icon-btn shell__menu-btn" aria-label="Abrir menu" @click="sidebarAberta = true">
          <Menu :size="20" />
        </button>

        <nav class="shell__breadcrumbs" aria-label="Breadcrumb">
          <RouterLink to="/dashboard">Início</RouterLink>
          <template v-for="(crumb, i) in breadcrumbs" :key="i">
            <span class="shell__crumb-sep">/</span>
            <span class="shell__crumb">{{ crumb }}</span>
          </template>
        </nav>

        <button class="shell__search-trigger" @click="buscaAberta = true">
          <Search :size="16" />
          <span>Buscar paciente...</span>
        </button>

        <div class="shell__header-actions">
          <button class="shell__icon-btn shell__search-icon-btn" aria-label="Buscar" @click="buscaAberta = true">
            <Search :size="19" />
          </button>

          <div class="shell__user" :class="{ 'is-open': menuUsuarioAberto }">
            <button class="shell__user-trigger" @click="menuUsuarioAberto = !menuUsuarioAberto">
              <UiAvatar :nome="auth.usuario?.nome ?? '?'" :size="34" />
              <span class="shell__user-info">
                <strong>{{ auth.usuario?.nome }}</strong>
                <small>{{ auth.usuario ? PERFIL_LABEL[auth.usuario.perfil] : '' }}</small>
              </span>
              <ChevronDown :size="16" />
            </button>
            <div v-if="menuUsuarioAberto" class="shell__user-menu">
              <button @click="sair"><LogOut :size="16" /> Sair</button>
            </div>
          </div>
        </div>
      </header>

      <Transition name="drawer-fade">
        <div v-if="buscaAberta" class="shell__search-overlay" @click.self="buscaAberta = false">
          <div class="shell__search-panel">
            <GlobalSearch @close="buscaAberta = false" />
          </div>
        </div>
      </Transition>

      <main class="shell__content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell { display: flex; min-height: 100vh; }

.shell__scrim {
  position: fixed; inset: 0; background: rgba(23,36,49,0.45); z-index: 90; display: none;
}

.shell__sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex; flex-direction: column;
  position: sticky; top: 0; height: 100vh;
}
.shell__brand { display: flex; align-items: center; gap: 10px; padding: 18px 18px 14px; }
.shell__brand-mark {
  width: 32px; height: 32px; border-radius: 9px; background: var(--color-primary); color: #fff;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.shell__brand-text { font-family: var(--font-display); font-size: 15.5px; }
.shell__brand-text strong { font-weight: 700; color: var(--color-primary); }
.shell__sidebar-close { display: none; margin-left: auto; background: none; border: none; cursor: pointer; color: var(--color-ink-soft); }

.shell__nav { flex: 1; overflow-y: auto; padding: var(--space-3) 12px; display: flex; flex-direction: column; gap: 2px; }
.shell__nav-link {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--color-ink-soft);
  font-size: 13.5px; font-weight: 600;
  min-height: 44px;
}
.shell__nav-link:hover { background: var(--color-primary-softer); color: var(--color-primary-dark); }
.shell__nav-link.router-link-active { background: var(--color-primary-soft); color: var(--color-primary-dark); }

.shell__nav-link.is-destaque {
  border: 1px solid var(--color-primary-soft);
  background: linear-gradient(90deg, var(--color-primary-softer), transparent);
  color: var(--color-primary-dark);
}
.shell__nav-link.is-destaque:hover { background: var(--color-primary-soft); }
.shell__nav-link.is-destaque.router-link-active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

.shell__sidebar-footer { padding: var(--space-4); border-top: 1px solid var(--color-border); font-size: 11px; color: var(--color-ink-faint); }
.shell__sidebar-footer p:first-child { font-weight: 600; color: var(--color-ink-soft); margin-bottom: 2px; }

.shell__main { flex: 1; min-width: 0; display: flex; flex-direction: column; }

.shell__header {
  height: var(--header-height);
  display: flex; align-items: center; gap: var(--space-3);
  padding: 0 var(--space-5);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky; top: 0; z-index: 50;
}
.shell__menu-btn { display: none; }
.shell__icon-btn {
  background: none; border: none; cursor: pointer; color: var(--color-ink-soft);
  width: 40px; height: 40px; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.shell__icon-btn:hover { background: var(--color-bg); color: var(--color-ink); }

.shell__breadcrumbs { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--color-ink-soft); text-transform: capitalize; flex-shrink: 0; }
.shell__breadcrumbs a { color: var(--color-ink-soft); font-weight: 600; }
.shell__crumb-sep { color: var(--color-ink-faint); }
.shell__crumb { color: var(--color-ink); font-weight: 600; }

.shell__search-trigger {
  flex: 1; max-width: 380px;
  display: flex; align-items: center; gap: 8px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 100px;
  padding: 9px 14px;
  color: var(--color-ink-faint);
  font-size: 13px;
  cursor: pointer;
  margin-left: auto;
}
.shell__search-icon-btn { display: none; }

.shell__header-actions { display: flex; align-items: center; gap: 8px; margin-left: var(--space-3); flex-shrink: 0; }

.shell__user { position: relative; }
.shell__user-trigger {
  display: flex; align-items: center; gap: 8px;
  background: none; border: none; cursor: pointer; padding: 4px 6px 4px 4px; border-radius: 100px;
}
.shell__user-trigger:hover { background: var(--color-bg); }
.shell__user-info { display: flex; flex-direction: column; text-align: left; }
.shell__user-info strong { font-size: 12.5px; }
.shell__user-info small { font-size: 11px; color: var(--color-ink-soft); }

.shell__user-menu {
  position: absolute; right: 0; top: calc(100% + 6px);
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); box-shadow: var(--shadow-md);
  min-width: 160px; padding: 6px; z-index: 60;
}
.shell__user-menu button {
  width: 100%; display: flex; align-items: center; gap: 8px;
  padding: 9px 10px; background: none; border: none; cursor: pointer;
  border-radius: 8px; font-size: 13px; color: var(--color-critical); font-weight: 600;
}
.shell__user-menu button:hover { background: var(--color-critical-soft); }

.shell__search-overlay {
  position: fixed; inset: 0; top: var(--header-height);
  background: rgba(23,36,49,0.35);
  z-index: 100;
  display: flex; justify-content: center;
  padding: var(--space-5) var(--space-4);
}
.shell__search-panel { width: 100%; max-width: 640px; }

.shell__content { flex: 1; padding: var(--space-6); max-width: 1440px; width: 100%; margin: 0 auto; }

.drawer-fade-enter-active, .drawer-fade-leave-active { transition: opacity 0.15s ease; }
.drawer-fade-enter-from, .drawer-fade-leave-to { opacity: 0; }

@media (max-width: 1023px) {
  .shell__sidebar {
    position: fixed; left: 0; top: 0; z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    box-shadow: var(--shadow-lg);
  }
  .shell__sidebar.is-open { transform: translateX(0); }
  .shell__sidebar-close { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; }
  .shell__scrim { display: block; }
  .shell__menu-btn { display: flex; }
  .shell__search-trigger { display: none; }
  .shell__search-icon-btn { display: flex; }
  .shell__breadcrumbs { display: none; }
  .shell__content { padding: var(--space-4); }
  .shell__user-info { display: none; }
}

@media (max-width: 639px) {
  .shell__header { padding: 0 var(--space-3); gap: var(--space-2); }
  .shell__content { padding: var(--space-3); }
}
</style>
