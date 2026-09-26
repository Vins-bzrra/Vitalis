<script setup lang="ts">
import { computed } from 'vue'
import type { Atendimento, Paciente } from '@/types'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import { STATUS_ADMINISTRACAO_META } from '@/composables/useClinicalMeta'
import { Check } from 'lucide-vue-next'

const props = defineProps<{ paciente: Paciente; atendimento: Atendimento | null }>()

const ordenadas = computed(() =>
  [...(props.atendimento?.administracoes ?? [])].sort((a, b) => a.horarioPrevisto.localeCompare(b.horarioPrevisto))
)

function marcarAdministrado(id: string) {
  const item = props.atendimento?.administracoes.find((a) => a.id === id)
  if (item) { item.status = 'administrado'; item.horarioReal = '12:00' }
}
</script>

<template>
  <div class="medicamentos">
    <UiCard title="Administração de medicamentos" subtitle="Painel de enfermagem para este atendimento">
      <div class="legend">
        <span v-for="(meta, key) in STATUS_ADMINISTRACAO_META" :key="key" class="legend__item">
          <UiBadge :tone="meta.tone as any" size="sm">{{ meta.label }}</UiBadge>
        </span>
      </div>

      <ul v-if="ordenadas.length" class="med-list">
        <li v-for="a in ordenadas" :key="a.id" :class="`is-${a.status}`">
          <div class="med-list__time mono-num">{{ a.horarioPrevisto }}</div>
          <div class="med-list__info">
            <strong>{{ a.medicamento }}</strong>
            <span>{{ a.dose }}<template v-if="a.responsavel"> · {{ a.responsavel }}</template></span>
            <span v-if="a.observacao" class="med-list__obs">{{ a.observacao }}</span>
          </div>
          <UiBadge :tone="STATUS_ADMINISTRACAO_META[a.status].tone as any" size="sm">{{ STATUS_ADMINISTRACAO_META[a.status].label }}</UiBadge>
          <UiButton
            v-if="a.status === 'pendente' || a.status === 'atrasado'"
            size="sm" variant="secondary"
            @click="marcarAdministrado(a.id)"
          >
            <template #icon><Check :size="14" /></template> Administrar
          </UiButton>
        </li>
      </ul>
      <UiEmptyState v-else title="Nenhum medicamento programado" />
    </UiCard>

    <UiCard title="Medicamentos de uso contínuo (resumo clínico)">
      <ul v-if="paciente.resumoClinico.medicamentosEmUso.length" class="continuo-list">
        <li v-for="m in paciente.resumoClinico.medicamentosEmUso" :key="m.id">
          <strong>{{ m.nome }} {{ m.dose }}</strong>
          <span>{{ m.via }} · {{ m.frequencia }}</span>
        </li>
      </ul>
      <UiEmptyState v-else title="Sem medicamentos contínuos registrados" />
    </UiCard>
  </div>
</template>

<style scoped>
.medicamentos { display: flex; flex-direction: column; gap: var(--space-4); }
.legend { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: var(--space-4); }

.med-list { display: flex; flex-direction: column; gap: 8px; }
.med-list li {
  display: flex; align-items: center; gap: 14px;
  padding: 10px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-md);
  flex-wrap: wrap;
}
.med-list li.is-atrasado { border-color: var(--color-critical); background: var(--color-critical-soft); }
.med-list li.is-pendente { border-color: var(--color-warning); }
.med-list__time { font-size: 15px; font-weight: 600; width: 52px; flex-shrink: 0; }
.med-list__info { flex: 1; min-width: 160px; display: flex; flex-direction: column; }
.med-list__info strong { font-size: 13.5px; }
.med-list__info span { font-size: 12px; color: var(--color-ink-soft); }
.med-list__obs { color: var(--color-critical) !important; font-weight: 600; }

.continuo-list { display: flex; flex-direction: column; gap: 8px; }
.continuo-list li { display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid var(--color-border); font-size: 13px; }
.continuo-list li:first-child { border-top: none; }
.continuo-list span { color: var(--color-ink-soft); }
</style>
