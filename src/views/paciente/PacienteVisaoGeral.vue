<script setup lang="ts">
import { computed } from 'vue'
import type { Atendimento, Paciente } from '@/types'
import PatientTimeline from '@/components/clinical/PatientTimeline.vue'
import VitalReadout from '@/components/clinical/VitalReadout.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import UiBadge from '@/components/ui/UiBadge.vue'

const props = defineProps<{ paciente: Paciente; atendimento: Atendimento | null }>()

const ultimaTriagem = computed(() => props.atendimento?.triagens.at(-1))
const vitais = computed(() => ultimaTriagem.value?.vitais)

function statusSat(sat?: number) {
  if (sat === undefined) return 'normal'
  if (sat < 92) return 'critico'
  if (sat < 95) return 'atencao'
  return 'normal'
}
function statusFc(fc?: number) {
  if (fc === undefined) return 'normal'
  if (fc > 120 || fc < 50) return 'critico'
  if (fc > 100) return 'atencao'
  return 'normal'
}
function statusTemp(t?: number) {
  if (t === undefined) return 'normal'
  if (t >= 39) return 'critico'
  if (t >= 37.8) return 'atencao'
  return 'normal'
}
</script>

<template>
  <div class="visao-geral">
    <UiCard v-if="atendimento" title="Motivo do atendimento" :subtitle="`Atendimento ${atendimento.numero}`">
      <p class="motivo">{{ atendimento.motivoEntrada }}</p>
      <p class="motivo-sub"><strong>Queixa principal:</strong> {{ atendimento.queixaPrincipal }}</p>
    </UiCard>

    <UiCard v-if="vitais" title="Últimos sinais vitais" :subtitle="`Aferidos em ${ultimaTriagem?.data.split('-').reverse().join('/')} às ${ultimaTriagem?.hora}`">
      <div class="vitais-grid">
        <VitalReadout label="PA" :value="vitais.pressaoArterial" unit="mmHg" />
        <VitalReadout label="FC" :value="vitais.frequenciaCardiaca" unit="bpm" :status="statusFc(vitais.frequenciaCardiaca)" />
        <VitalReadout label="FR" :value="vitais.frequenciaRespiratoria" unit="irpm" />
        <VitalReadout label="SatO2" :value="vitais.saturacao" unit="%" :status="statusSat(vitais.saturacao)" />
        <VitalReadout label="Temp" :value="vitais.temperatura" unit="°C" :status="statusTemp(vitais.temperatura)" />
        <VitalReadout v-if="vitais.glicemia" label="Glicemia" :value="vitais.glicemia" unit="mg/dL" />
        <VitalReadout label="Dor" :value="`${vitais.dor}/10`" />
      </div>
    </UiCard>

    <UiCard title="Linha do tempo da jornada" subtitle="Do acolhimento até a situação atual">
      <PatientTimeline v-if="atendimento?.timeline.length" :eventos="atendimento.timeline" />
      <UiEmptyState v-else title="Sem eventos registrados" description="Este atendimento ainda não possui eventos na linha do tempo." />
    </UiCard>

    <UiCard v-if="paciente.resumoClinico.problemasAtivos.length" title="Diagnósticos e problemas ativos">
      <ul class="problemas">
        <li v-for="p in paciente.resumoClinico.problemasAtivos" :key="p.id">
          <div class="problemas__head">
            <span class="problemas__nome">{{ p.nome }}</span>
            <UiBadge tone="primary" size="sm">{{ p.status }}</UiBadge>
          </div>
          <p class="problemas__evolucao">{{ p.evolucao }}</p>
        </li>
      </ul>
    </UiCard>
  </div>
</template>

<style scoped>
.visao-geral { display: flex; flex-direction: column; gap: var(--space-4); }
.motivo { font-size: 14px; line-height: 1.6; }
.motivo-sub { margin-top: 8px; font-size: 13px; color: var(--color-ink-soft); }

.vitais-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }

.problemas { display: flex; flex-direction: column; gap: var(--space-3); }
.problemas li { border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-3); }
.problemas__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.problemas__nome { font-weight: 600; font-size: 13.5px; }
.problemas__evolucao { font-size: 12.5px; color: var(--color-ink-soft); }
</style>
