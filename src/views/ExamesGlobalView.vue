<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useInstitucionalStore } from '@/stores/institucional'
import { usePacienteStore } from '@/stores/paciente'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import { STATUS_EXAME_META } from '@/composables/useClinicalMeta'

const institucional = useInstitucionalStore()
const pacienteStore = usePacienteStore()
const router = useRouter()

onMounted(() => {
  institucional.carregarAtendimentos()
  pacienteStore.carregarLista()
})

function nomePaciente(pacienteId: string) {
  return pacienteStore.pacientes.find((p) => p.id === pacienteId)?.nome ?? '—'
}

const todosExames = computed(() =>
  institucional.atendimentos.flatMap((a) => a.exames.map((e) => ({ exame: e, pacienteId: a.pacienteId })))
)
const pendentes = computed(() => todosExames.value.filter((x) => x.exame.status === 'solicitado' || x.exame.status === 'aguardando_realizacao'))
const criticos = computed(() => todosExames.value.filter((x) => x.exame.status === 'resultado_critico'))
const disponiveis = computed(() => todosExames.value.filter((x) => x.exame.status === 'resultado_disponivel'))
</script>

<template>
  <div class="exg">
    <header><p class="eyebrow">Diagnóstico</p><h1>Exames da unidade</h1></header>

    <div class="exg__summary">
      <div class="exg__stat is-critical"><strong>{{ criticos.length }}</strong><span>Resultados críticos</span></div>
      <div class="exg__stat is-warning"><strong>{{ pendentes.length }}</strong><span>Pendentes</span></div>
      <div class="exg__stat is-success"><strong>{{ disponiveis.length }}</strong><span>Disponíveis</span></div>
    </div>

    <UiCard title="Resultados críticos" subtitle="Requerem atenção imediata">
      <ul v-if="criticos.length" class="exg-list">
        <li v-for="x in criticos" :key="x.exame.id" class="is-critico" @click="router.push(`/pacientes/${x.pacienteId}/exames`)">
          <div><strong>{{ x.exame.nome }}</strong><span>{{ nomePaciente(x.pacienteId) }}</span></div>
          <UiBadge tone="critical" size="sm">{{ STATUS_EXAME_META[x.exame.status].label }}</UiBadge>
        </li>
      </ul>
      <UiEmptyState v-else title="Nenhum resultado crítico no momento" />
    </UiCard>

    <UiCard title="Exames pendentes" subtitle="Solicitados ou aguardando realização">
      <ul v-if="pendentes.length" class="exg-list">
        <li v-for="x in pendentes" :key="x.exame.id" @click="router.push(`/pacientes/${x.pacienteId}/exames`)">
          <div><strong>{{ x.exame.nome }}</strong><span>{{ nomePaciente(x.pacienteId) }} · {{ x.exame.solicitadoPor }}</span></div>
          <UiBadge :tone="STATUS_EXAME_META[x.exame.status].tone as any" size="sm">{{ STATUS_EXAME_META[x.exame.status].label }}</UiBadge>
        </li>
      </ul>
      <UiEmptyState v-else title="Nenhum exame pendente" />
    </UiCard>
  </div>
</template>

<style scoped>
.exg { display: flex; flex-direction: column; gap: var(--space-5); }
.eyebrow { font-family: var(--font-mono); font-size: 11.5px; text-transform: uppercase; color: var(--color-ink-faint); margin-bottom: 4px; }
h1 { font-size: 24px; }

.exg__summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); }
.exg__stat { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-4); text-align: center; }
.exg__stat strong { display: block; font-size: 26px; font-family: var(--font-mono); }
.exg__stat span { font-size: 12px; color: var(--color-ink-soft); }
.exg__stat.is-critical strong { color: var(--color-critical); }
.exg__stat.is-warning strong { color: var(--color-warning); }
.exg__stat.is-success strong { color: var(--color-success); }

.exg-list { display: flex; flex-direction: column; gap: 8px; }
.exg-list li { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; gap: 10px; }
.exg-list li:hover { background: var(--color-primary-softer); }
.exg-list li.is-critico { border-color: var(--color-critical); background: var(--color-critical-soft); }
.exg-list li div { display: flex; flex-direction: column; }
.exg-list li strong { font-size: 13.5px; }
.exg-list li span { font-size: 12px; color: var(--color-ink-soft); }

@media (max-width: 560px) { .exg__summary { grid-template-columns: 1fr; } }
</style>
