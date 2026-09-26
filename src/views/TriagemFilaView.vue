<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Search, Clock, Stethoscope, CheckCircle2, Timer } from 'lucide-vue-next'
import { usePacienteStore } from '@/stores/paciente'
import { useFilaAtendimento, type LinhaFila } from '@/composables/useFilaAtendimento'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import ResponsiveDataTable, { type DataTableColumn } from '@/components/ui/ResponsiveDataTable.vue'
import { TIPO_ATENDIMENTO_META } from '@/composables/useClinicalMeta'
import { calcularIdade } from '@/utils/formatters'

const pacienteStore = usePacienteStore()
const { institucional, linhasBase, etapaDe, acaoPrincipal, rotuloAcao, tempoDeEsperaMinutos } = useFilaAtendimento()

const busca = ref('')
const filtro = ref<'relevantes' | 'aguardando_triagem' | 'em_triagem' | 'concluida'>('relevantes')

onMounted(async () => {
  await Promise.all([institucional.carregarAtendimentos(), pacienteStore.carregarLista()])
})

const linhasTriagem = computed(() => linhasBase.value.filter((l) => {
  const etapa = etapaDe(l.atendimento)
  return etapa === 'aguardando_triagem' || etapa === 'em_triagem' || l.atendimento.triagens.length > 0
}))

const linhasFiltradas = computed(() => {
  let linhas = linhasTriagem.value
  if (filtro.value === 'aguardando_triagem') linhas = linhas.filter((l) => etapaDe(l.atendimento) === 'aguardando_triagem')
  else if (filtro.value === 'em_triagem') linhas = linhas.filter((l) => etapaDe(l.atendimento) === 'em_triagem')
  else if (filtro.value === 'concluida') linhas = linhas.filter((l) => l.atendimento.triagens.length > 0)
  else linhas = linhas.filter((l) => etapaDe(l.atendimento) === 'aguardando_triagem' || etapaDe(l.atendimento) === 'em_triagem')

  const termo = busca.value.trim().toLowerCase()
  if (termo) linhas = linhas.filter((l) => l.paciente.nome.toLowerCase().includes(termo))
  return linhas
})

const pendentes = computed(() => linhasTriagem.value.filter((l) => etapaDe(l.atendimento) === 'aguardando_triagem' || etapaDe(l.atendimento) === 'em_triagem'))
const concluidasHoje = computed(() => linhasTriagem.value.filter((l) => l.atendimento.triagens.some((t) => t.data === '2026-09-25')).length)
const tempoMedioEspera = computed(() => {
  if (!pendentes.value.length) return 0
  const total = pendentes.value.reduce((soma, l) => soma + tempoDeEsperaMinutos(l.atendimento), 0)
  return Math.round(total / pendentes.value.length)
})

const cards = computed(() => [
  { label: 'Aguardando triagem', valor: linhasTriagem.value.filter((l) => etapaDe(l.atendimento) === 'aguardando_triagem').length, icon: Clock, tone: 'warning' },
  { label: 'Em triagem', valor: linhasTriagem.value.filter((l) => etapaDe(l.atendimento) === 'em_triagem').length, icon: Stethoscope, tone: 'primary' },
  { label: 'Triagens concluídas hoje', valor: concluidasHoje.value, icon: CheckCircle2, tone: 'success' },
  { label: 'Tempo médio de espera', valor: `${tempoMedioEspera.value} min`, icon: Timer, tone: 'info' },
])

const columns: DataTableColumn[] = [
  { key: 'paciente', label: 'Paciente', primary: true },
  { key: 'idade', label: 'Idade/Sexo' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'espera', label: 'Espera' },
  { key: 'prioridade', label: 'Prioridade' },
  { key: 'status', label: 'Status' },
]

function ultimaClassificacao(l: LinhaFila) {
  return l.atendimento.triagens.at(-1)?.classificacaoRisco
}

function formatarEspera(min: number) {
  if (min < 60) return `${min} min`
  return `${Math.floor(min / 60)}h ${min % 60}min`
}
</script>

<template>
  <div class="triagem-fila">
    <header class="triagem-fila__header">
      <div>
        <p class="eyebrow">Enfermagem</p>
        <h1>Fila de triagem</h1>
        <p class="triagem-fila__subtitle">Pacientes aguardando ou em processo de triagem nesta unidade.</p>
      </div>
    </header>

    <section class="triagem-fila__cards" aria-label="Indicadores de triagem">
      <article v-for="c in cards" :key="c.label" class="tf-card" :class="`is-${c.tone}`">
        <div class="tf-card__icon"><component :is="c.icon" :size="18" /></div>
        <div>
          <p class="tf-card__value mono-num">{{ c.valor }}</p>
          <p class="tf-card__label">{{ c.label }}</p>
        </div>
      </article>
    </section>

    <UiCard :padded="false">
      <div class="triagem-fila__toolbar">
        <div class="triagem-fila__search">
          <Search :size="16" />
          <input v-model="busca" type="search" placeholder="Buscar paciente na fila..." aria-label="Buscar paciente" />
        </div>
        <div class="triagem-fila__filters">
          <button
            v-for="opt in [
              { key: 'relevantes', label: 'Todos' },
              { key: 'aguardando_triagem', label: 'Aguardando triagem' },
              { key: 'em_triagem', label: 'Em triagem' },
              { key: 'concluida', label: 'Triagem concluída' },
            ]"
            :key="opt.key"
            class="filter-chip"
            :class="{ 'is-active': filtro === opt.key }"
            @click="filtro = opt.key as typeof filtro"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <ResponsiveDataTable :columns="columns" :rows="linhasFiltradas" :row-key="(l: LinhaFila) => l.atendimento.id" class="triagem-fila__table">
        <template #cell-paciente="{ row }">
          <div class="table-patient"><UiAvatar :nome="(row as LinhaFila).paciente.nome" :size="32" /><span>{{ (row as LinhaFila).paciente.nome }}</span></div>
        </template>
        <template #cell-idade="{ row }">{{ calcularIdade((row as LinhaFila).paciente.dataNascimento) }} anos · {{ (row as LinhaFila).paciente.sexo }}</template>
        <template #cell-tipo="{ row }">{{ TIPO_ATENDIMENTO_META[(row as LinhaFila).atendimento.tipo].label }}</template>
        <template #cell-espera="{ row }">{{ formatarEspera(tempoDeEsperaMinutos((row as LinhaFila).atendimento)) }}</template>
        <template #cell-prioridade="{ row }">
          <UiBadge v-if="ultimaClassificacao(row as LinhaFila)" tone="neutral" size="sm" :style="{ color: ultimaClassificacao(row as LinhaFila)!.cor }">
            {{ ultimaClassificacao(row as LinhaFila)!.label }}
          </UiBadge>
          <span v-else class="triagem-fila__sem-prioridade">Não classificado</span>
        </template>
        <template #cell-status="{ row }">
          <UiBadge :tone="etapaDe((row as LinhaFila).atendimento) === 'em_triagem' ? 'primary' : 'warning'" size="sm">
            {{ etapaDe((row as LinhaFila).atendimento) === 'em_triagem' ? 'Em triagem' : (row as LinhaFila).atendimento.triagens.length ? 'Triagem concluída' : 'Aguardando triagem' }}
          </UiBadge>
        </template>
        <template #actions="{ row }">
          <UiButton size="sm" @click="acaoPrincipal(row as LinhaFila)">{{ rotuloAcao(row as LinhaFila) }}</UiButton>
        </template>
        <template #empty>
          <UiEmptyState title="Nenhum paciente nesta fila" description="Não há pacientes aguardando ou em processo de triagem para os filtros selecionados." />
        </template>
      </ResponsiveDataTable>
    </UiCard>
  </div>
</template>

<style scoped>
.triagem-fila { display: flex; flex-direction: column; gap: var(--space-5); }
.eyebrow { font-family: var(--font-mono); font-size: 11.5px; text-transform: uppercase; color: var(--color-ink-faint); margin-bottom: 4px; }
.triagem-fila__header h1 { font-size: 24px; }
.triagem-fila__subtitle { font-size: 13px; color: var(--color-ink-soft); margin-top: 4px; }

.triagem-fila__cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3); }
.tf-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-4); display: flex; align-items: center; gap: 12px; }
.tf-card__icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.is-primary .tf-card__icon { background: var(--color-primary-soft); color: var(--color-primary-dark); }
.is-warning .tf-card__icon { background: var(--color-warning-soft); color: var(--color-warning); }
.is-success .tf-card__icon { background: var(--color-success-soft); color: var(--color-success); }
.is-info .tf-card__icon { background: var(--color-info-soft); color: var(--color-info); }
.tf-card__value { font-size: 20px; font-weight: 600; }
.tf-card__label { font-size: 11.5px; color: var(--color-ink-soft); }

.triagem-fila__toolbar { display: flex; flex-direction: column; gap: var(--space-3); padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--color-border); }
.triagem-fila__search { display: flex; align-items: center; gap: 8px; border: 1px solid var(--color-border-strong); border-radius: var(--radius-sm); padding: 9px 12px; color: var(--color-ink-faint); max-width: 360px; }
.triagem-fila__search input { border: none; outline: none; flex: 1; font-size: 13.5px; background: none; color: var(--color-ink); }
.triagem-fila__filters { display: flex; gap: 8px; flex-wrap: wrap; }
.filter-chip {
  font-size: 12.5px; font-weight: 600; padding: 7px 12px; border-radius: 100px;
  background: var(--color-surface); border: 1px solid var(--color-border-strong); color: var(--color-ink-soft);
  cursor: pointer; min-height: 34px;
}
.filter-chip.is-active { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }

.table-patient { display: flex; align-items: center; gap: 10px; }
.triagem-fila__sem-prioridade { font-size: 12px; color: var(--color-ink-faint); }

@media (max-width: 1180px) {
  .triagem-fila__cards { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 759px) {
  .triagem-fila__table :deep(.rdt__actions-cell) { padding-top: 10px; }
  .triagem-fila__table :deep(.rdt__actions-cell button) { width: 100%; min-height: 46px; font-size: 14px; }
}
</style>
