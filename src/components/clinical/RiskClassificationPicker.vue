<script setup lang="ts">
import { CircleAlert, TriangleAlert, Clock, CircleCheck, Circle, Check } from 'lucide-vue-next'
import { CLASSIFICACOES_RISCO } from '@/mock/classificacaoRisco'
import type { ClassificacaoRisco, NivelRisco } from '@/types'

const modelValue = defineModel<ClassificacaoRisco | null>({ required: true })

const descricoes: Record<NivelRisco, string> = {
  1: 'Risco iminente de morte. Atendimento imediato.',
  2: 'Alto potencial de gravidade. Atendimento em minutos.',
  3: 'Situação que requer avaliação em tempo reduzido.',
  4: 'Sem risco imediato, mas requer avaliação médica.',
  5: 'Situação não urgente, pode aguardar com segurança.',
}
const icones: Record<NivelRisco, typeof CircleAlert> = {
  1: CircleAlert, 2: TriangleAlert, 3: Clock, 4: CircleCheck, 5: Circle,
}

function selecionar(c: ClassificacaoRisco) {
  modelValue.value = c
}
</script>

<template>
  <div class="risk-picker">
    <button
      v-for="c in Object.values(CLASSIFICACOES_RISCO)"
      :key="c.nivel"
      type="button"
      class="risk-option"
      :class="{ 'is-active': modelValue?.nivel === c.nivel }"
      :style="{ '--risk-color': c.cor }"
      :aria-pressed="modelValue?.nivel === c.nivel"
      @click="selecionar(c)"
    >
      <span class="risk-option__icon"><component :is="icones[c.nivel]" :size="20" /></span>
      <span class="risk-option__body">
        <strong>{{ c.label }}</strong>
        <span>{{ descricoes[c.nivel] }}</span>
        <span class="risk-option__time">{{ c.tempoMaximoEspera }}</span>
      </span>
      <span v-if="modelValue?.nivel === c.nivel" class="risk-option__check"><Check :size="16" /></span>
    </button>

    <p v-if="modelValue" class="risk-picker__confirm" role="status">
      <Check :size="14" /> Classificação selecionada: <strong>{{ modelValue.label }}</strong>
    </p>
  </div>
</template>

<style scoped>
.risk-picker { display: flex; flex-direction: column; gap: 8px; }
.risk-option {
  display: flex; align-items: center; gap: 12px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  background: var(--color-surface);
  cursor: pointer;
  text-align: left;
  min-height: 56px;
}
.risk-option:hover { border-color: var(--risk-color); }
.risk-option.is-active { border-color: var(--risk-color); background: color-mix(in srgb, var(--risk-color) 8%, white); }
.risk-option__icon { color: var(--risk-color); flex-shrink: 0; }
.risk-option__body { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.risk-option__body strong { font-size: 13.5px; color: var(--risk-color); }
.risk-option__body span { font-size: 12px; color: var(--color-ink-soft); }
.risk-option__time { font-family: var(--font-mono); font-size: 11px !important; color: var(--color-ink-faint) !important; margin-top: 2px; }
.risk-option__check { color: var(--risk-color); flex-shrink: 0; }

.risk-picker__confirm {
  display: flex; align-items: center; gap: 6px;
  font-size: 12.5px; color: var(--color-success); font-weight: 600;
  background: var(--color-success-soft); padding: 8px 12px; border-radius: var(--radius-sm);
  margin-top: 4px;
}
</style>
