<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  sensitive?: boolean
  columns?: 1 | 2 | 3
}>(), { columns: 2 })
</script>

<template>
  <section class="form-section" :class="{ 'is-sensitive': sensitive }">
    <header class="form-section__head">
      <div>
        <h3>{{ title }}</h3>
        <p v-if="description">{{ description }}</p>
      </div>
      <span v-if="sensitive" class="form-section__flag">Dado clínico sensível</span>
    </header>
    <div class="form-section__grid" :class="`is-cols-${columns}`">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.form-section {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  background: var(--color-surface);
}
.form-section.is-sensitive { border-color: #E8D9B8; background: #FFFDF7; }

.form-section__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-3); margin-bottom: var(--space-4); }
.form-section__head h3 { font-size: 15.5px; }
.form-section__head p { font-size: 12.5px; color: var(--color-ink-soft); margin-top: 3px; }
.form-section__flag {
  flex-shrink: 0; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;
  color: var(--color-warning); background: var(--color-warning-soft); padding: 5px 10px; border-radius: 100px;
}

.form-section__grid { display: grid; gap: var(--space-4); }
.form-section__grid.is-cols-2 { grid-template-columns: repeat(2, 1fr); }
.form-section__grid.is-cols-3 { grid-template-columns: repeat(3, 1fr); }

@media (max-width: 1023px) {
  .form-section__grid.is-cols-3 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 639px) {
  .form-section { padding: var(--space-4); }
  .form-section__grid.is-cols-2, .form-section__grid.is-cols-3 { grid-template-columns: 1fr; }
}
</style>
