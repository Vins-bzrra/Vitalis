<script setup lang="ts">
import { computed } from 'vue'
import type { Paciente } from '@/types'
import { AlertTriangle, ShieldAlert, Pill, Syringe } from 'lucide-vue-next'

const props = defineProps<{ paciente: Paciente; compact?: boolean }>()

const alergiasGraves = computed(() => props.paciente.resumoClinico.alergias.filter((a) => a.gravidade === 'grave'))
const outrasAlergias = computed(() => props.paciente.resumoClinico.alergias.filter((a) => a.gravidade !== 'grave'))
const temIsolamento = computed(() => !!props.paciente.isolamento)
const temAlgumAlerta = computed(() =>
  alergiasGraves.value.length > 0 || outrasAlergias.value.length > 0 || temIsolamento.value ||
  (!props.compact && props.paciente.resumoClinico.medicamentosEmUso.length > 0)
)
</script>

<template>
  <div v-if="temAlgumAlerta" class="alert-banner" :class="{ 'is-compact': compact }">
    <span v-for="a in alergiasGraves" :key="a.id" class="alert-banner__chip is-critical">
      <ShieldAlert :size="14" /> Alergia grave: {{ a.substancia }}<template v-if="!compact"> ({{ a.reacao }})</template>
    </span>
    <span v-if="temIsolamento" class="alert-banner__chip is-warning">
      <AlertTriangle :size="14" /> Isolamento: {{ paciente.isolamento }}
    </span>
    <span v-for="a in outrasAlergias" :key="a.id" class="alert-banner__chip is-info">
      <Pill :size="14" /> Alergia: {{ a.substancia }}
    </span>
    <span v-if="!compact && paciente.resumoClinico.medicamentosEmUso.length" class="alert-banner__chip is-neutral">
      <Syringe :size="14" /> {{ paciente.resumoClinico.medicamentosEmUso.length }} medicamento(s) em uso contínuo
    </span>
  </div>
</template>

<style scoped>
.alert-banner { display: flex; flex-wrap: wrap; gap: 8px; }
.alert-banner__chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 12px; border-radius: 100px; font-size: 12px; font-weight: 600;
}
.is-compact .alert-banner__chip { padding: 5px 10px; font-size: 11.5px; }
.alert-banner__chip.is-critical { background: var(--color-critical-soft); color: var(--color-critical); }
.alert-banner__chip.is-warning { background: var(--color-warning-soft); color: var(--color-warning); }
.alert-banner__chip.is-info { background: var(--color-info-soft); color: var(--color-info); }
.alert-banner__chip.is-neutral { background: #EEF1F4; color: var(--color-ink-soft); }
</style>
