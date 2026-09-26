<script setup lang="ts">
import { computed } from 'vue'
import FormField from '@/components/form/FormField.vue'
import type { SinaisVitais } from '@/types'

type VitaisForm = Omit<SinaisVitais, 'id' | 'data' | 'hora'>

const vitais = defineModel<VitaisForm>({ required: true })

const imc = computed(() => {
  const peso = vitais.value.peso
  const altura = vitais.value.altura
  if (!peso || !altura) return null
  return (peso / (altura * altura)).toFixed(1)
})

const niveisConsciencia = ['Alerta', 'Sonolento', 'Confuso', 'Torporoso', 'Inconsciente']
</script>

<template>
  <div class="vitals-form">
    <FormField label="Pressão arterial" hint="mmHg — ex.: 120/80">
      <input v-model="vitais.pressaoArterial" type="text" placeholder="120/80" inputmode="numeric" />
    </FormField>
    <FormField label="Frequência cardíaca" hint="bpm">
      <input v-model.number="vitais.frequenciaCardiaca" type="number" min="0" placeholder="82" inputmode="numeric" />
    </FormField>
    <FormField label="Frequência respiratória" hint="irpm">
      <input v-model.number="vitais.frequenciaRespiratoria" type="number" min="0" placeholder="18" inputmode="numeric" />
    </FormField>
    <FormField label="Saturação de O₂" hint="%">
      <input v-model.number="vitais.saturacao" type="number" min="0" max="100" placeholder="98" inputmode="numeric" />
    </FormField>
    <FormField label="Temperatura" hint="°C">
      <input v-model.number="vitais.temperatura" type="number" step="0.1" placeholder="36,7" inputmode="decimal" />
    </FormField>
    <FormField label="Glicemia capilar" hint="mg/dL (opcional)">
      <input v-model.number="vitais.glicemia" type="number" min="0" inputmode="numeric" />
    </FormField>
    <FormField label="Peso" hint="kg (opcional)">
      <input v-model.number="vitais.peso" type="number" step="0.1" inputmode="decimal" />
    </FormField>
    <FormField label="Altura" hint="m (opcional)">
      <input v-model.number="vitais.altura" type="number" step="0.01" inputmode="decimal" />
    </FormField>
    <FormField label="IMC calculado" hint="kg/m²">
      <input :value="imc ?? '—'" type="text" disabled />
    </FormField>
    <FormField label="Nível de consciência / Glasgow">
      <select v-model="vitais.nivelConsciencia">
        <option v-for="n in niveisConsciencia" :key="n" :value="n">{{ n }}</option>
      </select>
    </FormField>

    <div class="vitals-form__pain">
      <span class="vitals-form__pain-label">Escala de dor: <strong class="mono-num">{{ vitais.dor }}/10</strong></span>
      <input v-model.number="vitais.dor" type="range" min="0" max="10" aria-label="Escala de dor de 0 a 10" />
    </div>
  </div>
</template>

<style scoped>
.vitals-form { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
.vitals-form__pain { grid-column: 1 / -1; display: flex; flex-direction: column; gap: 8px; }
.vitals-form__pain-label { font-size: 12.5px; font-weight: 600; color: var(--color-ink-soft); }
.vitals-form__pain input[type="range"] { width: 100%; min-height: 32px; }

@media (max-width: 900px) {
  .vitals-form { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .vitals-form { grid-template-columns: 1fr; }
}
</style>
