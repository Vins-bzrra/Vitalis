<script setup lang="ts">
withDefaults(defineProps<{
  tone?: 'primary' | 'success' | 'warning' | 'critical' | 'info' | 'teal' | 'neutral'
  size?: 'sm' | 'md'
  outline?: boolean
}>(), {
  tone: 'neutral',
  size: 'md',
  outline: false,
})
</script>

<template>
  <span class="ui-badge" :class="[`is-${tone}`, `is-${size}`, { 'is-outline': outline }]">
    <slot />
  </span>
</template>

<style scoped>
.ui-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  line-height: 1;
  border-radius: 100px;
  white-space: nowrap;
  border: 1px solid transparent;
}
.is-sm { font-size: 11px; padding: 3px 8px; }
.is-md { font-size: 12px; padding: 5px 10px; }

.is-primary { background: var(--color-primary-soft); color: var(--color-primary-dark); }
.is-success { background: var(--color-success-soft); color: var(--color-success); }
.is-warning { background: var(--color-warning-soft); color: var(--color-warning); }
.is-critical { background: var(--color-critical-soft); color: var(--color-critical); }
.is-info { background: var(--color-info-soft); color: var(--color-info); }
.is-teal { background: var(--color-teal-soft); color: var(--color-teal); }
.is-neutral { background: #EEF1F4; color: var(--color-ink-soft); }

.is-outline { background: transparent; }
.is-outline.is-primary { border-color: var(--color-primary); color: var(--color-primary); }
.is-outline.is-critical { border-color: var(--color-critical); color: var(--color-critical); }
.is-outline.is-warning { border-color: var(--color-warning); color: var(--color-warning); }
.is-outline.is-success { border-color: var(--color-success); color: var(--color-success); }
</style>
