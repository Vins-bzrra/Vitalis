<script setup lang="ts">
import type { Atendimento, Paciente } from '@/types'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'

defineProps<{ paciente: Paciente; atendimento: Atendimento | null }>()
</script>

<template>
  <div class="prescricoes">
    <template v-if="atendimento?.prescricoes.length">
      <UiCard v-for="p in atendimento.prescricoes" :key="p.id" :subtitle="`${p.profissional} · ${p.data.split('-').reverse().join('/')} às ${p.hora}`">
        <template #actions>
          <UiBadge :tone="p.status === 'ativa' ? 'success' : p.status === 'suspensa' ? 'critical' : 'neutral'" size="sm">{{ p.status }}</UiBadge>
        </template>
        <div class="table-scroll">
          <table class="presc-table">
            <thead>
              <tr><th>Medicamento</th><th>Dose</th><th>Via</th><th>Frequência</th><th>Horários</th><th>Duração</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in p.itens" :key="item.id">
                <td data-label="Medicamento"><strong>{{ item.medicamento }}</strong><br><span v-if="item.observacoes" class="obs">{{ item.observacoes }}</span></td>
                <td data-label="Dose">{{ item.dose }}</td>
                <td data-label="Via">{{ item.via }}</td>
                <td data-label="Frequência">{{ item.frequencia }}</td>
                <td data-label="Horários" class="mono-num">{{ item.horarios.join(', ') }}</td>
                <td data-label="Duração">{{ item.duracao }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiCard>
    </template>
    <UiEmptyState v-else title="Nenhuma prescrição registrada" description="Este atendimento ainda não possui prescrições médicas." />
  </div>
</template>

<style scoped>
.prescricoes { display: flex; flex-direction: column; gap: var(--space-4); }
.table-scroll { overflow-x: auto; }
.presc-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.presc-table th { text-align: left; color: var(--color-ink-faint); text-transform: uppercase; font-size: 10.5px; padding: 6px 10px; border-bottom: 1px solid var(--color-border); white-space: nowrap; }
.presc-table td { padding: 10px; border-bottom: 1px solid var(--color-border); vertical-align: top; }
.obs { color: var(--color-critical); font-size: 11px; font-weight: 600; }

@media (max-width: 700px) {
  .presc-table thead { display: none; }
  .presc-table, .presc-table tbody, .presc-table tr, .presc-table td { display: block; width: 100%; }
  .presc-table tr { border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-bottom: 10px; padding: 8px; }
  .presc-table td { border-bottom: none; padding: 5px 4px; }
  .presc-table td::before { content: attr(data-label); display: block; font-size: 10.5px; color: var(--color-ink-faint); font-weight: 700; text-transform: uppercase; }
}
</style>
