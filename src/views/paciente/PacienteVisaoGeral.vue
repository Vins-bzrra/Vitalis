<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, ChevronDown } from 'lucide-vue-next'
import type { Atendimento, Paciente } from '@/types'
import PatientTimeline from '@/components/clinical/PatientTimeline.vue'
import VitalReadout from '@/components/clinical/VitalReadout.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import PacienteExames from './PacienteExames.vue'
import PacienteTriagem from './PacienteTriagem.vue'
import PacienteInternacao from './PacienteInternacao.vue'

// "Página do paciente": tudo o que o médico precisa ao abrir o prontuário,
// em uma única tela — queixa, sinais vitais, última evolução, prescrição
// ativa, exames (laboratório, raio-X, ECG...) e internação. As abas
// Evoluções e Prescrição ficam só para escrever/ver o histórico completo.
const props = defineProps<{ paciente: Paciente; atendimento: Atendimento | null }>()

const ultimaTriagem = computed(() => props.atendimento?.triagens.at(-1))
const vitais = computed(() => ultimaTriagem.value?.vitais)
const base = computed(() => `/pacientes/${props.paciente.id}`)

const ultimaEvolucao = computed(() => {
  const livre = props.atendimento?.evolucoesLivres?.[0]
  if (livre) return { profissional: livre.profissional, data: livre.data, hora: livre.hora, texto: livre.texto }
  const ev = props.atendimento?.evolucoesMedicas.at(-1)
  if (!ev) return null
  return { profissional: ev.profissional, data: ev.data, hora: ev.hora, texto: `${ev.anamnese}\n\nConduta: ${ev.conduta}` }
})

const prescricaoAtiva = computed(() => props.atendimento?.prescricoes.find((p) => p.status === 'ativa'))
const internado = computed(() => ['internado', 'em_transferencia', 'em_alta'].includes(props.paciente.statusAtual))

function dataBr(d: string) { return d.split('-').reverse().join('/') }

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
  <div class="resumo">
    <UiCard v-if="atendimento" title="Motivo do atendimento" :subtitle="`Atendimento ${atendimento.numero}${atendimento.especialidadeSolicitada ? ' · avaliação solicitada: ' + atendimento.especialidadeSolicitada : ''}`">
      <p class="motivo">{{ atendimento.motivoEntrada }}</p>
      <p class="motivo-sub"><strong>Queixa principal:</strong> {{ atendimento.queixaPrincipal }}</p>
      <p v-if="atendimento.historiaDoencaAtual" class="motivo-sub"><strong>HDA:</strong> {{ atendimento.historiaDoencaAtual }}</p>
      <p v-if="atendimento.acolhimento" class="motivo-sub">
        <strong>Acolhimento ({{ atendimento.acolhimento.profissional }}):</strong>
        {{ [atendimento.acolhimento.inicioSintomas, atendimento.acolhimento.caracteristicas, atendimento.acolhimento.observacoes].filter(Boolean).join(' · ') || '—' }}
        <UiBadge v-if="atendimento.acolhimento.atendimentoImediato" tone="critical" size="sm">Atendimento imediato</UiBadge>
      </p>
    </UiCard>

    <UiCard v-if="vitais" title="Últimos sinais vitais" :subtitle="`Aferidos em ${dataBr(ultimaTriagem!.data)} às ${ultimaTriagem!.hora}`">
      <template #actions>
        <span class="risco-tag" :style="{ '--risk-color': ultimaTriagem!.classificacaoRisco.cor }">{{ ultimaTriagem!.classificacaoRisco.label }}</span>
      </template>
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

    <div class="resumo__duo">
      <UiCard title="Última evolução">
        <template #actions><RouterLink :to="`${base}/evolucoes`" class="link">Evoluir <ArrowRight :size="13" /></RouterLink></template>
        <template v-if="ultimaEvolucao">
          <p class="meta">{{ ultimaEvolucao.profissional }} · <span class="mono-num">{{ dataBr(ultimaEvolucao.data) }} {{ ultimaEvolucao.hora }}</span></p>
          <p class="evo-texto">{{ ultimaEvolucao.texto }}</p>
        </template>
        <UiEmptyState v-else title="Ainda sem evolução" />
      </UiCard>

      <UiCard title="Prescrição ativa">
        <template #actions><RouterLink :to="`${base}/prescricao`" class="link">Ver prescrição <ArrowRight :size="13" /></RouterLink></template>
        <ul v-if="prescricaoAtiva" class="presc">
          <li v-for="i in prescricaoAtiva.itens" :key="i.id">
            <strong>{{ i.medicamento }} {{ i.dose }}</strong>
            <span>{{ i.via }} · {{ i.frequencia }}</span>
          </li>
        </ul>
        <UiEmptyState v-else title="Sem prescrição ativa" />
      </UiCard>
    </div>

    <section aria-label="Exames do paciente">
      <h2 class="resumo__titulo">Exames</h2>
      <PacienteExames :paciente="paciente" :atendimento="atendimento" />
    </section>

    <UiCard v-if="paciente.resumoClinico.problemasAtivos.length" title="Diagnósticos e problemas ativos">
      <ul class="problemas">
        <li v-for="p in paciente.resumoClinico.problemasAtivos" :key="p.id">
          <div class="problemas__head">
            <span class="problemas__nome">{{ p.nome }}<span v-if="p.cid" class="mono-num problemas__cid"> {{ p.cid }}</span></span>
            <UiBadge tone="primary" size="sm">{{ p.status }}</UiBadge>
          </div>
          <p class="problemas__evolucao">{{ p.evolucao }}</p>
        </li>
      </ul>
    </UiCard>

    <!-- Informações de apoio: recolhidas por padrão para não poluir a tela. -->
    <details v-if="internado" class="secao">
      <summary>Internação e transferências <ChevronDown :size="16" /></summary>
      <PacienteInternacao :paciente="paciente" :atendimento="atendimento" />
    </details>

    <details class="secao">
      <summary>Triagens e classificação de risco ({{ atendimento?.triagens.length ?? 0 }}) <ChevronDown :size="16" /></summary>
      <PacienteTriagem :paciente="paciente" :atendimento="atendimento" />
    </details>

    <details class="secao">
      <summary>Linha do tempo do atendimento <ChevronDown :size="16" /></summary>
      <UiCard>
        <PatientTimeline v-if="atendimento?.timeline.length" :eventos="atendimento.timeline" />
        <UiEmptyState v-else title="Sem eventos registrados" />
      </UiCard>
    </details>
  </div>
</template>

<style scoped>
.resumo { display: flex; flex-direction: column; gap: var(--space-4); }
.resumo__titulo { font-size: 15px; margin-bottom: var(--space-3); }
.resumo__duo { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); align-items: start; }
.motivo { font-size: 14px; line-height: 1.6; }
.motivo-sub { margin-top: 8px; font-size: 13px; color: var(--color-ink-soft); line-height: 1.55; }

.vitais-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
.risco-tag { background: var(--risk-color); color: #fff; padding: 4px 10px; border-radius: 100px; font-weight: 700; font-size: 11.5px; }

.link { display: inline-flex; align-items: center; gap: 4px; font-size: 12.5px; font-weight: 600; color: var(--color-primary); }
.meta { font-size: 12px; color: var(--color-ink-soft); margin-bottom: 6px; }
.evo-texto { font-size: 13px; line-height: 1.55; white-space: pre-wrap; max-height: 220px; overflow: auto; }

.presc { display: flex; flex-direction: column; gap: 6px; }
.presc li { display: flex; flex-direction: column; padding: 8px 10px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
.presc strong { font-size: 13px; }
.presc span { font-size: 12px; color: var(--color-ink-soft); }

.problemas { display: flex; flex-direction: column; gap: var(--space-3); }
.problemas li { border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-3); }
.problemas__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 8px; }
.problemas__nome { font-weight: 600; font-size: 13.5px; }
.problemas__cid { color: var(--color-ink-faint); font-weight: 500; font-size: 12px; }
.problemas__evolucao { font-size: 12.5px; color: var(--color-ink-soft); }

.secao { border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.secao > summary {
  list-style: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; font-weight: 600; font-size: 13.5px; min-height: 48px;
}
.secao > summary::-webkit-details-marker { display: none; }
.secao > summary svg { color: var(--color-ink-faint); transition: transform .15s ease; }
.secao[open] > summary svg { transform: rotate(180deg); }
.secao[open] > summary { border-bottom: 1px solid var(--color-border); }
.secao > :not(summary) { margin: var(--space-3); }

@media (max-width: 760px) {
  .resumo__duo { grid-template-columns: 1fr; }
}
</style>
