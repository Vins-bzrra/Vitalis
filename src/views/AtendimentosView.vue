<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Clock, Stethoscope, ClipboardCheck, UserCheck, CalendarCheck, UserPlus, ArrowRight,
} from 'lucide-vue-next'
import { usePacienteStore } from '@/stores/paciente'
import { useAtendimentoFluxoStore } from '@/stores/atendimentoFluxo'
import { useAuthStore } from '@/stores/auth'
import { useFilaAtendimento, type LinhaFila } from '@/composables/useFilaAtendimento'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiTabs from '@/components/ui/UiTabs.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import PatientSearchBox from '@/components/clinical/PatientSearchBox.vue'
import ResponsiveDataTable, { type DataTableColumn } from '@/components/ui/ResponsiveDataTable.vue'
import { STATUS_ATENDIMENTO_META, TIPO_ATENDIMENTO_META } from '@/composables/useClinicalMeta'
import { formatarDataHora } from '@/utils/formatters'

const pacienteStore = usePacienteStore()
const fluxo = useAtendimentoFluxoStore()
const auth = useAuthStore()
const router = useRouter()
const { institucional, linhasBase, etapaDe, abrirProntuario, acaoPrincipal, rotuloAcao, HOJE } = useFilaAtendimento()

const aba = ref<string>('fila')
const filtroEtapa = ref<'todos' | 'aguardando_triagem' | 'em_triagem' | 'aguardando_medico' | 'em_atendimento'>('todos')

onMounted(async () => {
  await Promise.all([institucional.carregarAtendimentos(), pacienteStore.carregarLista()])
})

const indicadores = computed(() => {
  const linhas = linhasBase.value
  return {
    aguardandoTriagem: linhas.filter((l) => etapaDe(l.atendimento) === 'aguardando_triagem').length,
    emTriagem: linhas.filter((l) => etapaDe(l.atendimento) === 'em_triagem').length,
    aguardandoMedico: linhas.filter((l) => etapaDe(l.atendimento) === 'aguardando_medico').length,
    emAtendimento: linhas.filter((l) => etapaDe(l.atendimento) === 'em_atendimento').length,
    atendidosHoje: linhas.filter((l) => l.atendimento.dataEntrada.startsWith(HOJE)).length,
  }
})

const cards = computed(() => [
  { label: 'Aguardando triagem', valor: indicadores.value.aguardandoTriagem, icon: Clock, tone: 'warning' },
  { label: 'Em triagem', valor: indicadores.value.emTriagem, icon: Stethoscope, tone: 'primary' },
  { label: 'Aguardando avaliação médica', valor: indicadores.value.aguardandoMedico, icon: ClipboardCheck, tone: 'info' },
  { label: 'Em atendimento', valor: indicadores.value.emAtendimento, icon: UserCheck, tone: 'teal' },
  { label: 'Atendimentos hoje', valor: indicadores.value.atendidosHoje, icon: CalendarCheck, tone: 'success' },
])

const linhasFiltradas = computed(() => {
  if (filtroEtapa.value === 'todos') return linhasBase.value
  return linhasBase.value.filter((l) => etapaDe(l.atendimento) === filtroEtapa.value)
})

const columns: DataTableColumn[] = [
  { key: 'numero', label: 'Nº atendimento' },
  { key: 'paciente', label: 'Paciente', primary: true },
  { key: 'tipo', label: 'Tipo' },
  { key: 'etapa', label: 'Etapa' },
  { key: 'setor', label: 'Setor' },
  { key: 'entrada', label: 'Entrada' },
]

function iniciarNovoAtendimento(pacienteId: string) {
  const paciente = pacienteStore.pacientes.find((p) => p.id === pacienteId)
  if (!paciente) return
  fluxo.selecionarPaciente(paciente)
  router.push(`/pacientes/${pacienteId}/atendimento/novo`)
}

function editarCadastro(pacienteId: string) {
  router.push(`/pacientes/${pacienteId}/editar`)
}
</script>

<template>
  <div class="recepcao">
    <header class="recepcao__header">
      <div>
        <p class="eyebrow">Recepção</p>
        <h1>Atendimentos</h1>
        <p class="recepcao__subtitle">Busque pacientes, cadastre novos e acompanhe a fila de acolhimento e triagem.</p>
      </div>
      <UiButton v-if="auth.pode('paciente.cadastrar')" @click="router.push('/pacientes/novo')">
        <template #icon><UserPlus :size="16" /></template> Cadastrar paciente
      </UiButton>
    </header>

    <section class="recepcao__cards" aria-label="Indicadores de atendimento">
      <article v-for="c in cards" :key="c.label" class="rc-card" :class="`is-${c.tone}`">
        <div class="rc-card__icon"><component :is="c.icon" :size="18" /></div>
        <div>
          <p class="rc-card__value mono-num">{{ c.valor }}</p>
          <p class="rc-card__label">{{ c.label }}</p>
        </div>
      </article>
    </section>

    <UiCard v-if="auth.pode('triage.view')" :padded="false" class="recepcao__triagem-cta">
      <RouterLink to="/triagem" class="triagem-cta">
        <span class="triagem-cta__icon"><Stethoscope :size="18" /></span>
        <span class="triagem-cta__text">
          <strong>Fila de triagem</strong>
          <span>Acesse a fila dedicada para acolher e classificar pacientes com prioridade.</span>
        </span>
        <ArrowRight :size="16" />
      </RouterLink>
    </UiCard>

    <UiTabs v-model="aba" :tabs="[{ key: 'fila', label: 'Fila de atendimento' }, { key: 'buscar', label: 'Buscar / cadastrar paciente' }]" />

    <div v-if="aba === 'fila'" class="recepcao__fila">
      <div class="recepcao__filters">
        <button
          v-for="opt in [
            { key: 'todos', label: 'Todos' },
            { key: 'aguardando_triagem', label: 'Aguardando triagem' },
            { key: 'em_triagem', label: 'Em triagem' },
            { key: 'aguardando_medico', label: 'Aguardando médico' },
            { key: 'em_atendimento', label: 'Em atendimento' },
          ]"
          :key="opt.key"
          class="filter-chip"
          :class="{ 'is-active': filtroEtapa === opt.key }"
          @click="filtroEtapa = opt.key as typeof filtroEtapa"
        >
          {{ opt.label }}
        </button>
      </div>

      <UiCard :padded="false">
        <ResponsiveDataTable :columns="columns" :rows="linhasFiltradas" :row-key="(l: LinhaFila) => l.atendimento.id" @row-click="(l: LinhaFila) => abrirProntuario(l.paciente.id)">
          <template #cell-numero="{ row }"><span class="mono-num">{{ (row as LinhaFila).atendimento.numero }}</span></template>
          <template #cell-paciente="{ row }">
            <div class="table-patient"><UiAvatar :nome="(row as LinhaFila).paciente.nome" :size="30" /><span>{{ (row as LinhaFila).paciente.nome }}</span></div>
          </template>
          <template #cell-tipo="{ row }">{{ TIPO_ATENDIMENTO_META[(row as LinhaFila).atendimento.tipo].label }}</template>
          <template #cell-etapa="{ row }">
            <UiBadge :tone="STATUS_ATENDIMENTO_META[(row as LinhaFila).atendimento.status].tone as any" size="sm">
              {{ STATUS_ATENDIMENTO_META[(row as LinhaFila).atendimento.status].label }}
            </UiBadge>
          </template>
          <template #cell-setor="{ row }">{{ (row as LinhaFila).atendimento.setor }}</template>
          <template #cell-entrada="{ row }">{{ formatarDataHora((row as LinhaFila).atendimento.dataEntrada) }}</template>
          <template #actions="{ row }">
            <UiButton size="sm" variant="secondary" @click="acaoPrincipal(row as LinhaFila)">
              {{ rotuloAcao(row as LinhaFila) }}
            </UiButton>
          </template>
          <template #empty>
            <UiEmptyState title="Nenhum atendimento nesta etapa" description="Ajuste o filtro ou busque um paciente para iniciar um novo atendimento." />
          </template>
        </ResponsiveDataTable>
      </UiCard>
    </div>

    <div v-else class="recepcao__buscar">
      <UiCard title="Buscar paciente" subtitle="Localize um paciente já cadastrado para abrir o prontuário ou iniciar um novo atendimento">
        <PatientSearchBox
          @abrir="abrirProntuario"
          @novo-atendimento="iniciarNovoAtendimento"
          @editar="editarCadastro"
          @cadastrar="router.push('/pacientes/novo')"
        />
      </UiCard>
    </div>
  </div>
</template>

<style scoped>
.recepcao { display: flex; flex-direction: column; gap: var(--space-5); }
.recepcao__header { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--space-4); flex-wrap: wrap; }
.eyebrow { font-family: var(--font-mono); font-size: 11.5px; text-transform: uppercase; color: var(--color-ink-faint); margin-bottom: 4px; }
.recepcao__header h1 { font-size: 24px; }
.recepcao__subtitle { font-size: 13px; color: var(--color-ink-soft); margin-top: 4px; max-width: 520px; }

.recepcao__cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-3); }
.rc-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-4); display: flex; align-items: center; gap: 12px; }
.rc-card__icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.is-primary .rc-card__icon { background: var(--color-primary-soft); color: var(--color-primary-dark); }
.is-warning .rc-card__icon { background: var(--color-warning-soft); color: var(--color-warning); }
.is-info .rc-card__icon { background: var(--color-info-soft); color: var(--color-info); }
.is-teal .rc-card__icon { background: var(--color-teal-soft); color: var(--color-teal); }
.is-success .rc-card__icon { background: var(--color-success-soft); color: var(--color-success); }
.rc-card__value { font-size: 22px; font-weight: 600; }
.rc-card__label { font-size: 11.5px; color: var(--color-ink-soft); }

.triagem-cta { display: flex; align-items: center; gap: 12px; padding: var(--space-4); }
.triagem-cta__icon { width: 38px; height: 38px; border-radius: 10px; background: var(--color-primary-soft); color: var(--color-primary-dark); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.triagem-cta__text { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.triagem-cta__text strong { font-size: 13.5px; color: var(--color-ink); }
.triagem-cta__text span { font-size: 12px; color: var(--color-ink-soft); }

.recepcao__filters { display: flex; gap: 8px; flex-wrap: wrap; }
.filter-chip {
  font-size: 12.5px; font-weight: 600; padding: 8px 14px; border-radius: 100px;
  background: var(--color-surface); border: 1px solid var(--color-border-strong); color: var(--color-ink-soft);
  cursor: pointer; min-height: 36px;
}
.filter-chip.is-active { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }

.recepcao__fila { display: flex; flex-direction: column; gap: var(--space-3); }
.table-patient { display: flex; align-items: center; gap: 10px; }

@media (max-width: 1180px) {
  .recepcao__cards { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 639px) {
  .recepcao__cards { grid-template-columns: repeat(2, 1fr); }
  .recepcao__header { flex-direction: column; align-items: stretch; }
  .recepcao__header :deep(button) { width: 100%; }
}
</style>
