<script setup lang="ts">
defineProps<{
  tabs: { key: string; label: string; badge?: number }[]
  modelValue: string
}>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <div class="ui-tabs" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="ui-tabs__tab"
      role="tab"
      :aria-selected="modelValue === tab.key"
      :class="{ 'is-active': modelValue === tab.key }"
      @click="emit('update:modelValue', tab.key)"
    >
      {{ tab.label }}
      <span v-if="tab.badge" class="ui-tabs__badge">{{ tab.badge }}</span>
    </button>
  </div>
</template>

<style scoped>
.ui-tabs {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  border-bottom: 1px solid var(--color-border);
  padding: 0 2px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.ui-tabs::-webkit-scrollbar { display: none; }

.ui-tabs__tab {
  position: relative;
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 12px 14px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-ink-soft);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
}
.ui-tabs__tab:hover { color: var(--color-ink); }
.ui-tabs__tab.is-active { color: var(--color-primary); }
.ui-tabs__tab.is-active::after {
  content: '';
  position: absolute;
  left: 10px; right: 10px; bottom: -1px;
  height: 2px;
  background: var(--color-primary);
  border-radius: 2px 2px 0 0;
}
.ui-tabs__badge {
  background: var(--color-critical-soft);
  color: var(--color-critical);
  font-size: 10.5px;
  padding: 1px 6px;
  border-radius: 100px;
}
</style>
