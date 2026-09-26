<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: string | number
  unit?: string
  status?: 'normal' | 'atencao' | 'critico'
}>()

const statusClass = computed(() => `is-${props.status ?? 'normal'}`)
</script>

<template>
  <div class="vital-readout" :class="statusClass">
    <span class="vital-readout__label">{{ label }}</span>
    <div class="vital-readout__value">
      <span class="mono-num">{{ value }}</span>
      <span v-if="unit" class="vital-readout__unit">{{ unit }}</span>
    </div>
  </div>
</template>

<style scoped>
.vital-readout {
  background: var(--color-ink);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex; flex-direction: column; gap: 4px;
  border: 1px solid var(--color-ink);
  min-width: 0;
}
.vital-readout__label {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.55);
  font-weight: 600;
}
.vital-readout__value {
  display: flex; align-items: baseline; gap: 4px;
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 500;
  color: #6FE3C4;
}
.vital-readout__unit { font-size: 11px; color: rgba(255,255,255,0.5); font-family: var(--font-sans); }

.vital-readout.is-atencao .vital-readout__value { color: #FFC65C; }
.vital-readout.is-critico { border-color: var(--color-critical); }
.vital-readout.is-critico .vital-readout__value { color: #FF7A8A; }
</style>
