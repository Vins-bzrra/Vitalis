<script setup lang="ts">
import { onMounted } from 'vue'
import { useInstitucionalStore } from '@/stores/institucional'
import { useAuthStore } from '@/stores/auth'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import { PERFIL_LABEL, PERMISSOES } from '@/services/authService'

const institucional = useInstitucionalStore()
const auth = useAuthStore()

onMounted(() => institucional.carregarUsuarios())
</script>

<template>
  <div class="usr">
    <header><p class="eyebrow">Administração</p><h1>Usuários e permissões</h1></header>

    <UiCard title="Sessão atual" subtitle="Perfil autenticado neste protótipo">
      <div v-if="auth.usuario" class="current-user">
        <UiAvatar :nome="auth.usuario.nome" :size="48" />
        <div>
          <strong>{{ auth.usuario.nome }}</strong>
          <p>{{ PERFIL_LABEL[auth.usuario.perfil] }} · {{ auth.usuario.email }}</p>
        </div>
      </div>
      <div class="perm-list">
        <span v-for="p in PERMISSOES[auth.usuario!.perfil]" :key="p" class="perm-chip">{{ p }}</span>
      </div>
    </UiCard>

    <UiCard title="Usuários da unidade" :padded="false">
      <div class="table-scroll">
        <table class="usr-table">
          <thead><tr><th>Nome</th><th>Perfil</th><th>Registro</th><th>E-mail</th><th>Status</th></tr></thead>
          <tbody>
            <tr v-for="u in institucional.usuarios" :key="u.id">
              <td data-label="Nome"><div class="table-patient"><UiAvatar :nome="u.nome" :size="28" /><span>{{ u.nome }}</span></div></td>
              <td data-label="Perfil">{{ PERFIL_LABEL[u.perfil] }}</td>
              <td data-label="Registro">{{ u.registro ?? '—' }}</td>
              <td data-label="E-mail">{{ u.email }}</td>
              <td data-label="Status"><UiBadge :tone="u.ativo ? 'success' : 'neutral'" size="sm">{{ u.ativo ? 'Ativo' : 'Inativo' }}</UiBadge></td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiCard>
  </div>
</template>

<style scoped>
.usr { display: flex; flex-direction: column; gap: var(--space-5); }
.eyebrow { font-family: var(--font-mono); font-size: 11.5px; text-transform: uppercase; color: var(--color-ink-faint); margin-bottom: 4px; }
h1 { font-size: 24px; }

.current-user { display: flex; align-items: center; gap: 12px; margin-bottom: var(--space-4); }
.current-user strong { font-size: 14px; }
.current-user p { font-size: 12.5px; color: var(--color-ink-soft); }
.perm-list { display: flex; flex-wrap: wrap; gap: 6px; }
.perm-chip { font-size: 11px; font-family: var(--font-mono); background: var(--color-bg); border: 1px solid var(--color-border); padding: 4px 8px; border-radius: 6px; color: var(--color-ink-soft); }

.table-scroll { overflow-x: auto; }
.usr-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.usr-table th { text-align: left; font-size: 11px; text-transform: uppercase; color: var(--color-ink-faint); padding: 10px var(--space-5); border-bottom: 1px solid var(--color-border); white-space: nowrap; }
.usr-table td { padding: 10px var(--space-5); border-bottom: 1px solid var(--color-border); white-space: nowrap; }
.table-patient { display: flex; align-items: center; gap: 10px; }

@media (max-width: 700px) {
  .usr-table thead { display: none; }
  .usr-table, .usr-table tbody, .usr-table tr, .usr-table td { display: block; width: 100%; }
  .usr-table tr { border-bottom: 1px solid var(--color-border); padding: var(--space-3) var(--space-4); }
  .usr-table td { border-bottom: none; padding: 4px 0; display: flex; justify-content: space-between; }
  .usr-table td::before { content: attr(data-label); font-size: 10.5px; color: var(--color-ink-faint); font-weight: 700; }
}
</style>
