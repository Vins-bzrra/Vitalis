<script setup lang="ts">
import { X } from 'lucide-vue-next'

withDefaults(defineProps<{ modelValue: boolean; title?: string; width?: string }>(), { width: '560px' })
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
function close() { emit('update:modelValue', false) }
</script>

<template>
  <Teleport to="body">
    <Transition name="ui-modal-fade">
      <div v-if="modelValue" class="ui-modal-overlay" @click.self="close">
        <div class="ui-modal" :style="{ maxWidth: width }" role="dialog" aria-modal="true">
          <header class="ui-modal__header">
            <h3>{{ title }}</h3>
            <button class="ui-modal__close" aria-label="Fechar" @click="close"><X :size="18" /></button>
          </header>
          <div class="ui-modal__body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="ui-modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ui-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(23, 36, 49, 0.45);
  display: flex; align-items: center; justify-content: center;
  padding: var(--space-4);
  z-index: 200;
}
.ui-modal {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  width: 100%;
  max-height: 88vh;
  display: flex; flex-direction: column;
  box-shadow: var(--shadow-lg);
}
.ui-modal__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-5);
  border-bottom: 1px solid var(--color-border);
}
.ui-modal__header h3 { font-size: 17px; }
.ui-modal__close {
  background: none; border: none; cursor: pointer;
  color: var(--color-ink-soft);
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.ui-modal__close:hover { background: var(--color-bg); color: var(--color-ink); }
.ui-modal__body { padding: var(--space-5); overflow-y: auto; }
.ui-modal__footer {
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border);
  display: flex; justify-content: flex-end; gap: var(--space-3);
}
.ui-modal-fade-enter-active, .ui-modal-fade-leave-active { transition: opacity 0.15s ease; }
.ui-modal-fade-enter-from, .ui-modal-fade-leave-to { opacity: 0; }
</style>
