<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'
withDefaults(defineProps<{ title: string; description?: string }>(), {})
</script>

<template>
  <div class="ui-empty">
    <div class="ui-empty__icon"><slot name="icon"><Inbox :size="22" /></slot></div>
    <p class="ui-empty__title">{{ title }}</p>
    <p v-if="description" class="ui-empty__desc">{{ description }}</p>
    <div v-if="$slots.action" class="ui-empty__action"><slot name="action" /></div>
  </div>
</template>

<style scoped>
.ui-empty {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: var(--space-8) var(--space-4);
  color: var(--color-ink-soft);
}
.ui-empty__icon {
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--color-bg);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: var(--space-3);
  color: var(--color-ink-faint);
}
.ui-empty__title { font-weight: 600; color: var(--color-ink); font-size: 14px; }
.ui-empty__desc { font-size: 12.5px; margin-top: 4px; max-width: 320px; }
.ui-empty__action { margin-top: var(--space-4); }
</style>
