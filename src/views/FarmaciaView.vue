<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useInstitucionalStore } from '@/stores/institucional'
import { usePacienteStore } from '@/stores/paciente'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import { STATUS_ADMINISTRACAO_META } from '@/composables/useClinicalMeta'

const institucional = useInstitucionalStore()
const pacienteStore = usePacienteStore()

onMounted(() => {
  institucional.carregarAtendimentos()
  pacienteStore.carregarLista()
})

function nomePaciente(pacienteId: string) {
  return pacienteStore.pacientes.find((p) => p.id === pacienteId)?.nome ?? '—'
}

const dispensacoes = computed(() =>
  institucional.atendimentos.flatMap((a) =>
    a.prescricoes.flatMap((p) => p.itens.map((item) => ({ item, prescricao: p, pacienteId: a.pacienteId })))
  )
)

const administracoesAtrasadas = computed(() =>
  institucional.atendimentos.flatMap((a) => a.administracoes.filter((m) => m.status === 'atrasado' || m.status === 'pendente').map((m) => ({ m, pacienteId: a.pacienteId })))
)
</script>

<template>
  <div class="farm">
    <header><p class="eyebrow">Farmácia</p><h1>Prescrições e dispensação</h1></header>

    <UiCard title="Medicações pendentes de administração" subtitle="Visão consolidada de toda a unidade">
      <ul v-if="administracoesAtrasadas.length" class="farm-list">
        <li v-for="x in administracoesAtrasadas" :key="x.m.id">
          <div><strong>{{ x.m.medicamento }}</strong><span>{{ nomePaciente(x.pacienteId) }} · previsto {{ x.m.horarioPrevisto }}</span></div>
          <UiBadge :tone="STATUS_ADMINISTRACAO_META[x.m.status].tone as any" size="sm">{{ STATUS_ADMINISTRACAO_META[x.m.status].label }}</UiBadge>
        </li>
      </ul>
      <UiEmptyState v-else title="Nenhuma pendência de medicação" />
    </UiCard>

    <UiCard title="Itens prescritos na unidade" subtitle="Todos os medicamentos prescritos nos atendimentos ativos">
      <div class="table-scroll">
        <table class="farm-table">
          <thead><tr><th>Medicamento</th><th>Paciente</th><th>Dose</th><th>Via</th><th>Frequência</th></tr></thead>
          <tbody>
            <tr v-for="d in dispensacoes" :key="d.item.id">
              <td data-label="Medicamento">{{ d.item.medicamento }}</td>
              <td data-label="Paciente">{{ nomePaciente(d.pacienteId) }}</td>
              <td data-label="Dose">{{ d.item.dose }}</td>
              <td data-label="Via">{{ d.item.via }}</td>
              <td data-label="Frequência">{{ d.item.frequencia }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiCard>
  </div>
</template>

<style scoped>
.farm { display: flex; flex-direction: column; gap: var(--space-5); }
.eyebrow { font-family: var(--font-mono); font-size: 11.5px; text-transform: uppercase; color: var(--color-ink-faint); margin-bottom: 4px; }
h1 { font-size: 24px; }
.farm-list { display: flex; flex-direction: column; gap: 8px; }
.farm-list li { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-md); gap: 10px; }
.farm-list li div { display: flex; flex-direction: column; }
.farm-list li strong { font-size: 13.5px; }
.farm-list li span { font-size: 12px; color: var(--color-ink-soft); }

.table-scroll { overflow-x: auto; }
.farm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.farm-table th { text-align: left; font-size: 11px; text-transform: uppercase; color: var(--color-ink-faint); padding: 8px 10px; border-bottom: 1px solid var(--color-border); white-space: nowrap; }
.farm-table td { padding: 10px; border-bottom: 1px solid var(--color-border); white-space: nowrap; }

@media (max-width: 700px) {
  .farm-table thead { display: none; }
  .farm-table, .farm-table tbody, .farm-table tr, .farm-table td { display: block; width: 100%; }
  .farm-table tr { border-bottom: 1px solid var(--color-border); padding: var(--space-2) 0; }
  .farm-table td { border-bottom: none; padding: 3px 0; display: flex; justify-content: space-between; }
  .farm-table td::before { content: attr(data-label); font-size: 10.5px; color: var(--color-ink-faint); font-weight: 700; }
}
</style>
