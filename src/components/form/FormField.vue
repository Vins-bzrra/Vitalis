<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  for?: string
  required?: boolean
  error?: string
  hint?: string
  span?: 1 | 2 | 3
}>(), { span: 1 })
</script>

<template>
  <div class="field" :class="[`is-span-${span}`, { 'has-error': !!error }]">
    <label :for="$props.for">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true">*</span>
    </label>
    <slot />
    <p v-if="error" class="field__error" role="alert">{{ error }}</p>
    <p v-else-if="hint" class="field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field.is-span-2 { grid-column: span 2; }
.field.is-span-3 { grid-column: span 3; }
.field label { font-size: 12.5px; font-weight: 600; color: var(--color-ink-soft); }
.field__required { color: var(--color-critical); margin-left: 2px; }
.field__error { font-size: 11.5px; color: var(--color-critical); font-weight: 600; }
.field__hint { font-size: 11.5px; color: var(--color-ink-faint); }

.field :deep(input), .field :deep(select), .field :deep(textarea) {
  width: 100%;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  padding: 11px 12px;
  font-size: 14px;
  font-family: inherit;
  color: var(--color-ink);
  min-height: 44px;
  background: var(--color-surface);
}
.field :deep(textarea) { min-height: 88px; resize: vertical; }
.field :deep(input:focus), .field :deep(select:focus), .field :deep(textarea:focus) {
  outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-soft);
}
.field.has-error :deep(input), .field.has-error :deep(select), .field.has-error :deep(textarea) {
  border-color: var(--color-critical);
}
.field.has-error :deep(input:focus), .field.has-error :deep(textarea:focus) {
  box-shadow: 0 0 0 3px var(--color-critical-soft);
}

@media (max-width: 639px) {
  .field.is-span-2, .field.is-span-3 { grid-column: span 1; }
}
</style>
