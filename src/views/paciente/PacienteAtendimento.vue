<script setup lang="ts">
import { ref } from 'vue'
import type { Atendimento, Paciente } from '@/types'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import { Plus } from 'lucide-vue-next'

const props = defineProps<{ paciente: Paciente; atendimento: Atendimento | null }>()
const novaEvolucaoAberta = ref(false)
const textoEvolucao = ref('')

function registrarEvolucao() {
  if (!props.atendimento || !textoEvolucao.value.trim()) return
  props.atendimento.evolucoesMedicas.unshift({
    id: `evm-novo-${Date.now()}`,
    data: '2026-09-25', hora: '12:00', profissional: 'Você (sessão atual)',
    anamnese: textoEvolucao.value, exameFisico: '—', hipotesesDiagnosticas: [], diagnosticosConfirmados: [],
    conduta: '—', planoTerapeutico: '—',
  })
  props.atendimento.timeline.push({
    id: `tl-novo-${Date.now()}`, tipo: 'evolucao', data: '2026-09-25', hora: '12:00',
    profissional: 'Você (sessão atual)', setor: props.atendimento.setor, descricao: 'Nova evolução registrada.',
  })
  textoEvolucao.value = ''
  novaEvolucaoAberta.value = false
}
</script>

<template>
  <div v-if="atendimento" class="atendimento">
    <UiCard title="Motivo da entrada e queixa principal">
      <dl class="dl">
        <div><dt>Motivo da entrada</dt><dd>{{ atendimento.motivoEntrada }}</dd></div>
        <div><dt>Queixa principal</dt><dd>{{ atendimento.queixaPrincipal }}</dd></div>
        <div><dt>História da doença atual</dt><dd>{{ atendimento.historiaDoencaAtual }}</dd></div>
      </dl>
    </UiCard>

    <UiCard v-if="atendimento.acolhimento" title="Acolhimento" :subtitle="`Registrado por ${atendimento.acolhimento.profissional} em ${atendimento.acolhimento.data.split('-').reverse().join('/')} às ${atendimento.acolhimento.hora}`">
      <dl class="dl">
        <div><dt>Início dos sintomas</dt><dd>{{ atendimento.acolhimento.inicioSintomas || '—' }}</dd></div>
        <div><dt>Características da queixa</dt><dd>{{ atendimento.acolhimento.caracteristicas || '—' }}</dd></div>
        <div><dt>Prioridade percebida</dt><dd>
          {{ atendimento.acolhimento.prioridadePercebida }}
          <UiBadge v-if="atendimento.acolhimento.atendimentoImediato" tone="critical" size="sm" class="chip">Atendimento imediato</UiBadge>
        </dd></div>
        <div v-if="atendimento.acolhimento.observacoes"><dt>Observações</dt><dd>{{ atendimento.acolhimento.observacoes }}</dd></div>
      </dl>
    </UiCard>

    <UiCard title="Avaliação inicial e conduta" subtitle="Última avaliação médica registrada para este atendimento">
      <template v-if="atendimento.evolucoesMedicas.length">
        <div v-for="ev in atendimento.evolucoesMedicas.slice(0, 1)" :key="ev.id" class="avaliacao">
          <dl class="dl">
            <div><dt>Hipóteses diagnósticas</dt><dd>
              <UiBadge v-for="h in ev.hipotesesDiagnosticas" :key="h" tone="info" size="sm" class="chip">{{ h }}</UiBadge>
              <span v-if="!ev.hipotesesDiagnosticas.length">—</span>
            </dd></div>
            <div><dt>Diagnóstico</dt><dd>
              <UiBadge v-for="d in ev.diagnosticosConfirmados" :key="d" tone="primary" size="sm" class="chip">{{ d }}</UiBadge>
              <span v-if="!ev.diagnosticosConfirmados.length">Em investigação</span>
            </dd></div>
            <div><dt>Conduta</dt><dd>{{ ev.conduta }}</dd></div>
            <div><dt>Plano terapêutico</dt><dd>{{ ev.planoTerapeutico }}</dd></div>
          </dl>
        </div>
      </template>
      <UiEmptyState v-else title="Ainda sem avaliação médica" description="Aguardando primeira avaliação médica deste atendimento." />
    </UiCard>

    <UiCard title="Evoluções deste atendimento">
      <template #actions>
        <UiButton size="sm" variant="secondary" @click="novaEvolucaoAberta = !novaEvolucaoAberta">
          <template #icon><Plus :size="15" /></template> Registrar evolução
        </UiButton>
      </template>

      <div v-if="novaEvolucaoAberta" class="nova-evolucao">
        <textarea v-model="textoEvolucao" rows="3" placeholder="Descreva a evolução clínica do paciente..." />
        <div class="nova-evolucao__actions">
          <UiButton size="sm" variant="ghost" @click="novaEvolucaoAberta = false">Cancelar</UiButton>
          <UiButton size="sm" :disabled="!textoEvolucao.trim()" @click="registrarEvolucao">Salvar evolução</UiButton>
        </div>
      </div>

      <ul v-if="atendimento.evolucoesMedicas.length" class="evolucoes-list">
        <li v-for="ev in atendimento.evolucoesMedicas" :key="ev.id">
          <div class="evolucoes-list__head">
            <strong>{{ ev.profissional }}</strong>
            <span class="mono-num">{{ ev.data.split('-').reverse().join('/') }} · {{ ev.hora }}</span>
          </div>
          <p>{{ ev.anamnese }}</p>
        </li>
      </ul>
      <UiEmptyState v-else title="Nenhuma evolução registrada" />
    </UiCard>
  </div>
</template>

<style scoped>
.atendimento { display: flex; flex-direction: column; gap: var(--space-4); }
.dl { display: flex; flex-direction: column; gap: var(--space-3); }
.dl dt { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-ink-faint); font-weight: 700; margin-bottom: 4px; }
.dl dd { font-size: 13.5px; line-height: 1.6; }
.chip { margin-right: 6px; margin-bottom: 4px; }

.nova-evolucao { margin-bottom: var(--space-4); }
.nova-evolucao textarea {
  width: 100%; border: 1px solid var(--color-border-strong); border-radius: var(--radius-sm);
  padding: 10px 12px; font-size: 13.5px; font-family: inherit; resize: vertical;
}
.nova-evolucao__actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }

.evolucoes-list { display: flex; flex-direction: column; gap: var(--space-3); }
.evolucoes-list li { border-top: 1px solid var(--color-border); padding-top: var(--space-3); }
.evolucoes-list li:first-child { border-top: none; padding-top: 0; }
.evolucoes-list__head { display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 4px; }
.evolucoes-list__head span { color: var(--color-ink-soft); }
.evolucoes-list p { font-size: 13px; color: var(--color-ink-soft); }
</style>
