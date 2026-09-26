<script setup lang="ts">
import { ShieldAlert } from 'lucide-vue-next'
import { usePermissions } from '@/composables/usePermissions'

withDefaults(defineProps<{
  recurso?: string
  descricao?: string
  compact?: boolean
}>(), {
  recurso: 'esta informação',
  descricao: '',
})

const { perfilLabel } = usePermissions()
</script>

<template>
  <div class="access-denied" :class="{ 'is-compact': compact }" role="alert">
    <div class="access-denied__icon"><ShieldAlert :size="compact ? 18 : 26" /></div>
    <div class="access-denied__body">
      <p class="access-denied__title">Acesso restrito</p>
      <p class="access-denied__text">
        Seu perfil (<strong>{{ perfilLabel }}</strong>) não possui permissão para visualizar {{ recurso }}.
      </p>
      <p v-if="descricao" class="access-denied__hint">{{ descricao }}</p>
    </div>
  </div>
</template>

<style scoped>
.access-denied {
  display: flex; align-items: flex-start; gap: var(--space-3);
  background: var(--color-warning-soft);
  border: 1px solid #E8D9B8;
  border-radius: var(--radius-lg);
  padding: var(--space-5);
}
.access-denied.is-compact { padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); align-items: center; }

.access-denied__icon {
  flex-shrink: 0;
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(255,255,255,0.6);
  color: var(--color-warning);
  display: flex; align-items: center; justify-content: center;
}
.is-compact .access-denied__icon { width: 32px; height: 32px; }

.access-denied__body { min-width: 0; }
.access-denied__title { font-weight: 700; font-size: 14px; color: var(--color-ink); margin-bottom: 2px; }
.is-compact .access-denied__title { font-size: 13px; }
.access-denied__text { font-size: 12.5px; color: var(--color-ink-soft); line-height: 1.5; }
.access-denied__text strong { color: var(--color-ink); }
.access-denied__hint { font-size: 11.5px; color: var(--color-ink-faint); margin-top: 4px; }
</style>
