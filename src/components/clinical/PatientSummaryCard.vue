<script setup lang="ts">
import { computed } from 'vue'
import type { Paciente } from '@/types'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import PatientAlertBanner from '@/components/clinical/PatientAlertBanner.vue'
import { STATUS_ATENDIMENTO_META } from '@/composables/useClinicalMeta'
import { calcularIdade, formatarData } from '@/utils/formatters'

const props = defineProps<{ paciente: Paciente; ultimoAtendimento?: string }>()

const problemasRelevantes = computed(() => props.paciente.resumoClinico.problemasAtivos.slice(0, 3))
</script>

<template>
  <div class="summary-card">
    <div class="summary-card__head">
      <UiAvatar :nome="paciente.nome" :size="52" />
      <div class="summary-card__identity">
        <strong>{{ paciente.nome }}</strong>
        <span>{{ paciente.sexo }} · {{ calcularIdade(paciente.dataNascimento) }} anos · nasc. {{ formatarData(paciente.dataNascimento) }}</span>
        <span class="mono-num">Prontuário {{ paciente.numeroProntuario }}</span>
      </div>
      <UiBadge :tone="STATUS_ATENDIMENTO_META[paciente.statusAtual].tone as any" size="sm">
        {{ STATUS_ATENDIMENTO_META[paciente.statusAtual].label }}
      </UiBadge>
    </div>

    <PatientAlertBanner :paciente="paciente" compact />

    <ul v-if="problemasRelevantes.length" class="summary-card__problems">
      <li v-for="p in problemasRelevantes" :key="p.id">{{ p.nome }}</li>
    </ul>

    <p v-if="ultimoAtendimento" class="summary-card__meta">Último atendimento: {{ ultimoAtendimento }}</p>
  </div>
</template>

<style scoped>
.summary-card {
  display: flex; flex-direction: column; gap: var(--space-3);
  background: var(--color-primary-softer); border: 1px solid var(--color-border); border-radius: var(--radius-lg);
  padding: var(--space-4);
}
.summary-card__head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.summary-card__identity { display: flex; flex-direction: column; flex: 1; min-width: 160px; }
.summary-card__identity strong { font-size: 15px; font-family: var(--font-display); }
.summary-card__identity span { font-size: 12px; color: var(--color-ink-soft); }

.summary-card__problems { display: flex; flex-wrap: wrap; gap: 6px; font-size: 12px; }
.summary-card__problems li { background: var(--color-surface); border: 1px solid var(--color-border); padding: 4px 10px; border-radius: 100px; color: var(--color-ink-soft); }

.summary-card__meta { font-size: 11.5px; color: var(--color-ink-faint); }
</style>
