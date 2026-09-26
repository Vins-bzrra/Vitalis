<script setup lang="ts">
import { onMounted } from 'vue'
import { useInstitucionalStore } from '@/stores/institucional'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { PERFIL_LABEL } from '@/services/authService'
import { ShieldCheck } from 'lucide-vue-next'

const institucional = useInstitucionalStore()
onMounted(() => institucional.carregarAuditoria())
</script>

<template>
  <div class="aud">
    <header><p class="eyebrow">Rastreabilidade</p><h1>Auditoria</h1></header>

    <UiCard title="Trilha de auditoria" subtitle="Toda alteração clínica preserva rastreabilidade — nada é sobrescrito sem histórico">
      <ul class="aud-list">
        <li v-for="log in institucional.auditLog" :key="log.id">
          <span class="aud-icon"><ShieldCheck :size="16" /></span>
          <div class="aud-info">
            <div class="aud-info__head">
              <strong>{{ log.acao }}</strong>
              <span class="mono-num">{{ log.data.split('-').reverse().join('/') }} · {{ log.hora }}</span>
            </div>
            <p>{{ log.detalhes }}</p>
            <div class="aud-tags">
              <UiBadge tone="neutral" size="sm">{{ log.usuario }}</UiBadge>
              <UiBadge tone="info" size="sm">{{ PERFIL_LABEL[log.perfil] }}</UiBadge>
              <UiBadge tone="primary" size="sm">{{ log.entidade }} · {{ log.entidadeId }}</UiBadge>
            </div>
          </div>
        </li>
      </ul>
    </UiCard>
  </div>
</template>

<style scoped>
.aud { display: flex; flex-direction: column; gap: var(--space-5); }
.eyebrow { font-family: var(--font-mono); font-size: 11.5px; text-transform: uppercase; color: var(--color-ink-faint); margin-bottom: 4px; }
h1 { font-size: 24px; }

.aud-list { display: flex; flex-direction: column; gap: var(--space-3); }
.aud-list li { display: flex; gap: 12px; border-top: 1px solid var(--color-border); padding-top: var(--space-3); }
.aud-list li:first-child { border-top: none; padding-top: 0; }
.aud-icon { width: 32px; height: 32px; border-radius: 9px; background: var(--color-primary-soft); color: var(--color-primary-dark); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.aud-info { flex: 1; min-width: 0; }
.aud-info__head { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.aud-info__head strong { font-size: 13.5px; }
.aud-info__head span { font-size: 11.5px; color: var(--color-ink-soft); }
.aud-info p { font-size: 12.5px; color: var(--color-ink-soft); margin: 4px 0 8px; }
.aud-tags { display: flex; flex-wrap: wrap; gap: 6px; }
</style>
