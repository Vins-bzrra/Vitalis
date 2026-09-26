<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  block?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
}>(), {
  variant: 'primary',
  size: 'md',
  block: false,
  disabled: false,
  type: 'button',
})
</script>

<template>
  <button
    class="ui-btn"
    :class="[`is-${variant}`, `is-${size}`, { 'is-block': block }]"
    :type="type"
    :disabled="disabled"
  >
    <slot name="icon" />
    <slot />
  </button>
</template>

<style scoped>
.ui-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.05s ease;
  white-space: nowrap;
}
.ui-btn:active:not(:disabled) { transform: translateY(1px); }
.ui-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.is-block { width: 100%; }

.is-md { padding: 10px 16px; font-size: 13.5px; min-height: 40px; }
.is-sm { padding: 7px 12px; font-size: 12.5px; min-height: 32px; }

.is-primary { background: var(--color-primary); color: #fff; }
.is-primary:hover:not(:disabled) { background: var(--color-primary-dark); }

.is-secondary { background: var(--color-surface); color: var(--color-ink); border-color: var(--color-border-strong); }
.is-secondary:hover:not(:disabled) { background: var(--color-primary-softer); border-color: var(--color-primary); }

.is-ghost { background: transparent; color: var(--color-ink-soft); }
.is-ghost:hover:not(:disabled) { background: var(--color-primary-softer); color: var(--color-primary-dark); }

.is-danger { background: var(--color-critical-soft); color: var(--color-critical); }
.is-danger:hover:not(:disabled) { background: var(--color-critical); color: #fff; }
</style>
