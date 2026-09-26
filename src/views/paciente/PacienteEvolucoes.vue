<script setup lang="ts">
import { ref } from 'vue'
import type { Atendimento, Paciente } from '@/types'
import UiCard from '@/components/ui/UiCard.vue'
import UiTabs from '@/components/ui/UiTabs.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import UiBadge from '@/components/ui/UiBadge.vue'

defineProps<{ paciente: Paciente; atendimento: Atendimento | null }>()
const aba = ref('medica')
</script>

<template>
  <div class="evolucoes">
    <UiTabs v-model="aba" :tabs="[{ key: 'medica', label: 'Evolução médica' }, { key: 'enfermagem', label: 'Evolução de enfermagem' }]" />

    <div v-if="aba === 'medica'" class="evolucoes__panel">
      <template v-if="atendimento?.evolucoesMedicas.length">
        <UiCard v-for="ev in atendimento.evolucoesMedicas" :key="ev.id">
          <div class="evo-head">
            <strong>{{ ev.profissional }}</strong>
            <span class="mono-num">{{ ev.data.split('-').reverse().join('/') }} · {{ ev.hora }}</span>
          </div>
          <dl class="dl">
            <div><dt>Anamnese</dt><dd>{{ ev.anamnese }}</dd></div>
            <div><dt>Exame físico</dt><dd>{{ ev.exameFisico }}</dd></div>
            <div v-if="ev.hipotesesDiagnosticas.length"><dt>Hipóteses diagnósticas</dt><dd>
              <UiBadge v-for="h in ev.hipotesesDiagnosticas" :key="h" tone="info" size="sm" class="chip">{{ h }}</UiBadge>
            </dd></div>
            <div v-if="ev.diagnosticosConfirmados.length"><dt>Diagnósticos confirmados</dt><dd>
              <UiBadge v-for="d in ev.diagnosticosConfirmados" :key="d" tone="primary" size="sm" class="chip">{{ d }}</UiBadge>
            </dd></div>
            <div><dt>Conduta</dt><dd>{{ ev.conduta }}</dd></div>
            <div><dt>Plano terapêutico</dt><dd>{{ ev.planoTerapeutico }}</dd></div>
            <div v-if="ev.encaminhamentos?.length"><dt>Encaminhamentos</dt><dd>{{ ev.encaminhamentos.join(', ') }}</dd></div>
          </dl>
        </UiCard>
      </template>
      <UiEmptyState v-else title="Nenhuma evolução médica registrada" />
    </div>

    <div v-else class="evolucoes__panel">
      <template v-if="atendimento?.evolucoesEnfermagem.length">
        <UiCard v-for="ev in atendimento.evolucoesEnfermagem" :key="ev.id">
          <div class="evo-head">
            <strong>{{ ev.profissional }}</strong>
            <span class="mono-num">{{ ev.data.split('-').reverse().join('/') }} · {{ ev.hora }}</span>
          </div>
          <p class="evo-text">{{ ev.texto }}</p>
          <dl class="dl">
            <div v-if="ev.balancoHidrico"><dt>Balanço hídrico</dt><dd>{{ ev.balancoHidrico }}</dd></div>
            <div v-if="ev.escalas"><dt>Escalas</dt><dd>{{ ev.escalas }}</dd></div>
            <div><dt>Cuidados realizados</dt><dd>{{ ev.cuidadosRealizados.join(', ') }}</dd></div>
            <div v-if="ev.intercorrencias"><dt>Intercorrências</dt><dd>{{ ev.intercorrencias }}</dd></div>
          </dl>
        </UiCard>
      </template>
      <UiEmptyState v-else title="Nenhuma evolução de enfermagem registrada" />
    </div>
  </div>
</template>

<style scoped>
.evolucoes { display: flex; flex-direction: column; gap: var(--space-4); }
.evolucoes__panel { display: flex; flex-direction: column; gap: var(--space-3); }
.evo-head { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: var(--space-3); }
.evo-head span { color: var(--color-ink-soft); }
.evo-text { font-size: 13.5px; margin-bottom: var(--space-3); }
.dl { display: flex; flex-direction: column; gap: var(--space-3); }
.dl dt { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-ink-faint); font-weight: 700; margin-bottom: 4px; }
.dl dd { font-size: 13px; line-height: 1.6; }
.chip { margin-right: 6px; }
</style>
