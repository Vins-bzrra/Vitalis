<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  subtitle?: string
  padded?: boolean
}>(), { padded: true })
</script>

<template>
  <section class="ui-card">
    <header v-if="title || $slots.actions" class="ui-card__header">
      <div>
        <h3 v-if="title" class="ui-card__title">{{ title }}</h3>
        <p v-if="subtitle" class="ui-card__subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="ui-card__actions">
        <slot name="actions" />
      </div>
    </header>
    <div class="ui-card__body" :class="{ 'is-padded': padded }">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.ui-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.ui-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-5) 0;
}
.ui-card__title { font-size: 16px; }
.ui-card__subtitle { margin-top: 2px; font-size: 12.5px; color: var(--color-ink-soft); }
.ui-card__body.is-padded { padding: var(--space-5); }
</style>
