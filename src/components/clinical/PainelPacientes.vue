<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, BedDouble, Siren, Search, Star } from 'lucide-vue-next'
import type { Atendimento, Paciente, StatusAtendimento } from '@/types'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import { STATUS_ATENDIMENTO_META } from '@/composables/useClinicalMeta'
import { calcularIdade, tempoDecorrido } from '@/utils/formatters'
import { usePreferenciasStore } from '@/stores/preferencias'

// Painel inicial dividido como no sistema hospitalar: quem está INTERNADO
// (leito de enfermaria/UTI) separado de quem tem FICHA ABERTA na urgência/
// emergência. Dentro de cada aba, os setores escolhidos pelo usuário em
// Configurações aparecem primeiro.
const props = defineProps<{ pacientes: Paciente[]; atendimentos: Atendimento[] }>()
const emit = defineEmits<{ abrir: [id: string] }>()

const prefsStore = usePreferenciasStore()
prefsStore.sincronizar()
const prefs = computed(() => prefsStore.prefs)

const STATUS_INTERNADO: StatusAtendimento[] = ['internado', 'em_transferencia', 'em_alta']

type Situacao = 'todos' | 'aguardando' | 'em_atendimento' | 'atendidos'
const SITUACOES: { key: Situacao; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'aguardando', label: 'Aguardando' },
  { key: 'em_atendimento', label: 'Em atendimento' },
  { key: 'atendidos', label: 'Atendidos' },
]
function situacaoDe(s: StatusAtendimento): Situacao {
  if (s === 'aguardando_triagem' || s === 'aguardando_atendimento') return 'aguardando'
  if (s === 'em_atendimento') return 'em_atendimento'
  return 'atendidos' // em observação / reavaliação / alta dada
}

const aba = ref<'internados' | 'urgencia'>(prefs.value.abaPainel)
const situacao = ref<Situacao>('todos')
const filtro = ref('')
const filtroEspecialidade = ref('')
const mostrarOutros = ref(!prefs.value.somenteMeusSetores)

const linhas = computed(() =>
  props.pacientes.map((p) => {
    const at = props.atendimentos.filter((a) => a.pacienteId === p.id).at(-1)
    const idade = calcularIdade(p.dataNascimento)
    return {
      paciente: p,
      atendimento: at,
      idade,
      risco: at?.triagens.at(-1)?.classificacaoRisco,
      prioridade: at?.prioridade ?? (idade >= 60 ? 'Idoso 60+' : undefined),
    }
  }),
)

const internados = computed(() => linhas.value.filter((l) => STATUS_INTERNADO.includes(l.paciente.statusAtual)))
const urgencia = computed(() =>
  linhas.value
    .filter((l) => !STATUS_INTERNADO.includes(l.paciente.statusAtual))
    // Mais grave primeiro; prioritários na frente dentro da mesma cor; sem classificação ao final.
    .sort((a, b) => (a.risco?.nivel ?? 9) - (b.risco?.nivel ?? 9) || Number(!a.prioridade) - Number(!b.prioridade)),
)

const contagemSituacao = computed(() => {
  const c: Record<Situacao, number> = { todos: urgencia.value.length, aguardando: 0, em_atendimento: 0, atendidos: 0 }
  urgencia.value.forEach((l) => c[situacaoDe(l.paciente.statusAtual)]++)
  return c
})

const especialidades = computed(() =>
  [...new Set(linhas.value.map((l) => l.atendimento?.especialidadeSolicitada).filter(Boolean))] as string[],
)

const filtradas = computed(() => {
  const termo = filtro.value.trim().toLowerCase()
  return (aba.value === 'internados' ? internados.value : urgencia.value).filter((l) => {
    if (aba.value === 'urgencia' && situacao.value !== 'todos' && situacaoDe(l.paciente.statusAtual) !== situacao.value) return false
    if (filtroEspecialidade.value && l.atendimento?.especialidadeSolicitada !== filtroEspecialidade.value) return false
    if (!termo) return true
    return (
      l.paciente.nome.toLowerCase().includes(termo) ||
      (l.paciente.codigoPaciente ?? '').toLowerCase().includes(termo) ||
      (l.paciente.leitoAtual ?? '').toLowerCase().includes(termo)
    )
  })
})

// Separação "meus setores" x "outros setores" conforme a preferência do usuário.
const meus = computed(() => filtradas.value.filter((l) => prefs.value.setoresPrioritarios.includes(l.paciente.setorAtual ?? '')))
const outros = computed(() => filtradas.value.filter((l) => !prefs.value.setoresPrioritarios.includes(l.paciente.setorAtual ?? '')))
const grupos = computed(() => {
  if (!prefsStore.temPrioridade) return [{ titulo: '', linhas: filtradas.value }]
  const g = [{ titulo: `Meus setores · ${prefs.value.setoresPrioritarios.join(', ')}`, linhas: meus.value }]
  if (mostrarOutros.value && outros.value.length) g.push({ titulo: 'Outros setores', linhas: outros.value })
  return g
})
const totalVisivel = computed(() => grupos.value.reduce((n, g) => n + g.linhas.length, 0))

function diasInternado(iso?: string) {
  if (!iso) return '—'
  const dias = Math.floor((new Date('2026-09-25T12:00:00').getTime() - new Date(iso).getTime()) / 86_400_000)
  return dias <= 0 ? 'Hoje' : `${dias} dia${dias > 1 ? 's' : ''}`
}
</script>

<template>
  <div class="painel">
    <div class="painel__tabs" role="tablist">
      <button role="tab" :aria-selected="aba === 'urgencia'" :class="{ 'is-active': aba === 'urgencia' }" @click="aba = 'urgencia'">
        <Siren :size="15" /> Urgência / Emergência <span class="painel__count">{{ urgencia.length }}</span>
      </button>
      <button role="tab" :aria-selected="aba === 'internados'" :class="{ 'is-active': aba === 'internados' }" @click="aba = 'internados'">
        <BedDouble :size="15" /> Internados <span class="painel__count">{{ internados.length }}</span>
      </button>
    </div>

    <div v-if="aba === 'urgencia'" class="painel__situacoes" role="group" aria-label="Filtrar por situação">
      <button v-for="s in SITUACOES" :key="s.key" class="chip" :class="{ 'is-active': situacao === s.key }" @click="situacao = s.key">
        {{ s.label }} <span class="mono-num">{{ contagemSituacao[s.key] }}</span>
      </button>
    </div>

    <div class="painel__filtros">
      <label class="painel__busca">
        <Search :size="15" />
        <input v-model="filtro" type="search" placeholder="Filtrar por código, nome ou leito" aria-label="Filtrar pacientes">
      </label>
      <select v-model="filtroEspecialidade" aria-label="Filtrar por especialidade">
        <option value="">Todas as especialidades</option>
        <option v-for="e in especialidades" :key="e" :value="e">{{ e }}</option>
      </select>
    </div>

    <p v-if="!prefsStore.temPrioridade" class="painel__dica">
      <Star :size="13" /> Dica: escolha seus setores em <RouterLink to="/configuracoes">Configurações</RouterLink> para ver primeiro os pacientes da sua área.
    </p>

    <div v-if="totalVisivel" class="table-scroll">
      <table class="painel-table">
        <thead>
          <tr v-if="aba === 'urgencia'">
            <th>Código</th><th>Paciente</th><th>Classificação</th><th>Situação</th><th>Especialidade</th><th>Espera</th><th></th>
          </tr>
          <tr v-else>
            <th>Código</th><th>Paciente</th><th>Setor / Leito</th><th>Especialidade</th><th>Responsável</th><th>Internado há</th><th></th>
          </tr>
        </thead>
        <tbody v-for="g in grupos" :key="g.titulo">
          <tr v-if="g.titulo" class="painel__grupo"><td colspan="7">{{ g.titulo }} <span class="mono-num">({{ g.linhas.length }})</span></td></tr>
          <tr v-if="g.titulo && !g.linhas.length" class="painel__grupo-vazio"><td colspan="7">Nenhum paciente {{ aba === 'internados' ? 'internado' : 'na urgência' }} nos seus setores.</td></tr>
          <tr v-for="l in g.linhas" :key="l.paciente.id" :style="aba === 'urgencia' && l.risco ? { '--risco': l.risco.cor } : undefined" @click="emit('abrir', l.paciente.id)">
            <td data-label="Código" class="mono-num painel__cod">{{ l.paciente.codigoPaciente ?? '—' }}</td>
            <td data-label="Paciente">
              <div class="painel__pac">
                <strong>{{ l.paciente.nome }}</strong>
                <span>
                  {{ l.idade }} anos · {{ l.paciente.sexo === 'Feminino' ? 'F' : 'M' }}
                  <UiBadge v-if="aba === 'urgencia' && l.prioridade" tone="warning" size="sm" :title="`Atendimento prioritário: ${l.prioridade}`">Prioritário · {{ l.prioridade }}</UiBadge>
                </span>
              </div>
            </td>
            <template v-if="aba === 'urgencia'">
              <td data-label="Classificação">
                <span v-if="l.risco" class="risco" :style="{ '--risco': l.risco.cor }">
                  <span class="risco__dot" /> {{ l.risco.label }}
                </span>
                <span v-else class="risco is-pendente">Aguardando triagem</span>
              </td>
              <td data-label="Situação">
                <UiBadge :tone="STATUS_ATENDIMENTO_META[l.paciente.statusAtual].tone as any" size="sm">{{ STATUS_ATENDIMENTO_META[l.paciente.statusAtual].label }}</UiBadge>
              </td>
              <td data-label="Especialidade">{{ l.atendimento?.especialidadeSolicitada ?? '—' }}</td>
              <td data-label="Espera">{{ l.paciente.entradaEm ? tempoDecorrido(l.paciente.entradaEm) : '—' }}</td>
            </template>
            <template v-else>
              <td data-label="Setor / Leito">{{ l.paciente.setorAtual ?? '—' }}<template v-if="l.paciente.leitoAtual"> · <span class="mono-num">{{ l.paciente.leitoAtual }}</span></template></td>
              <td data-label="Especialidade">{{ l.atendimento?.especialidadeSolicitada ?? '—' }}</td>
              <td data-label="Responsável">{{ l.paciente.medicoResponsavel ?? '—' }}</td>
              <td data-label="Internado há">{{ diasInternado(l.paciente.entradaEm) }}</td>
            </template>
            <td class="painel__arrow"><ArrowRight :size="15" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <UiEmptyState v-else title="Nenhum paciente encontrado" description="Ajuste o filtro ou troque de aba." />

    <button v-if="prefsStore.temPrioridade && outros.length" class="painel__outros" @click="mostrarOutros = !mostrarOutros">
      {{ mostrarOutros ? 'Ocultar outros setores' : `Ver pacientes de outros setores (${outros.length})` }}
    </button>
  </div>
</template>

<style scoped>
.painel { display: flex; flex-direction: column; gap: var(--space-3); }
.painel__tabs { display: flex; gap: 6px; background: var(--color-bg, #F3F5F8); padding: 4px; border-radius: var(--radius-md); }
.painel__tabs button {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 40px; border: none; background: none; border-radius: var(--radius-sm);
  font-weight: 600; font-size: 13px; color: var(--color-ink-soft); cursor: pointer;
}
.painel__tabs button.is-active { background: var(--color-surface); color: var(--color-primary-dark); box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.painel__count { font-family: var(--font-mono); font-size: 11.5px; background: var(--color-primary-soft); color: var(--color-primary-dark); padding: 1px 7px; border-radius: 100px; }

.painel__situacoes { display: flex; gap: 6px; flex-wrap: wrap; }
.chip { font-size: 12.5px; font-weight: 600; padding: 6px 12px; border-radius: 100px; background: var(--color-surface); border: 1px solid var(--color-border-strong); color: var(--color-ink-soft); cursor: pointer; min-height: 34px; display: inline-flex; gap: 6px; align-items: center; }
.chip span { font-size: 11px; opacity: .8; }
.chip.is-active { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }
.painel__dica { font-size: 12px; color: var(--color-ink-soft); display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.painel__dica a { color: var(--color-primary); font-weight: 600; }
.painel__grupo td { background: var(--color-primary-softer); font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--color-primary-dark); padding: 6px 10px; cursor: default; }
.painel__grupo-vazio td { font-size: 12.5px; color: var(--color-ink-faint); cursor: default; }
.painel__outros { align-self: center; background: none; border: 1px dashed var(--color-border-strong); border-radius: 100px; padding: 8px 16px; font-size: 12.5px; font-weight: 600; color: var(--color-primary); cursor: pointer; min-height: 38px; }
.painel__filtros { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.painel__busca { flex: 1; min-width: 200px; display: flex; align-items: center; gap: 8px; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 0 10px; color: var(--color-ink-faint); }
.painel__busca input { flex: 1; border: none; outline: none; background: none; min-height: 38px; font-size: 13px; color: var(--color-ink); }
.painel__filtros select { border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 0 10px; min-height: 40px; font-size: 13px; background: var(--color-surface); color: var(--color-ink); }

.table-scroll { overflow-x: auto; }
.painel-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.painel-table th { text-align: left; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-ink-faint); padding: 8px 10px; border-bottom: 1px solid var(--color-border); white-space: nowrap; }
.painel-table td { padding: 10px; border-bottom: 1px solid var(--color-border); white-space: nowrap; }
.painel-table tbody tr { cursor: pointer; }
.painel-table tbody tr.painel__grupo:hover, .painel-table tbody tr.painel__grupo-vazio:hover { background: none; }
.painel-table tbody tr:hover { background: var(--color-primary-softer); }
.painel__cod { font-weight: 600; color: var(--color-primary-dark); }
.painel__pac { display: flex; flex-direction: column; }
.painel__pac span { font-size: 11.5px; color: var(--color-ink-soft); display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.painel__arrow { color: var(--color-ink-faint); }

.risco { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; font-size: 12.5px; color: var(--risco); }
.risco__dot { width: 10px; height: 10px; border-radius: 50%; background: var(--risco); }
.risco.is-pendente { color: var(--color-ink-faint); font-weight: 500; }

@media (max-width: 639px) {
  .painel__tabs button { font-size: 12px; gap: 5px; }
  .painel-table thead { display: none; }
  .painel-table, .painel-table tbody, .painel-table tr, .painel-table td { display: block; width: 100%; }
  .painel-table tr { border: 1px solid var(--color-border); border-left: 4px solid var(--risco, var(--color-border)); border-radius: var(--radius-md); margin-bottom: 10px; padding: 8px; }
  .painel-table td { border-bottom: none; display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 5px 4px; white-space: normal; text-align: right; }
  .painel-table td::before { content: attr(data-label); font-size: 11px; color: var(--color-ink-faint); font-weight: 600; text-align: left; }
  .painel__pac { align-items: flex-end; }
  .painel__arrow { display: none !important; }
  .painel-table tr.painel__grupo, .painel-table tr.painel__grupo-vazio { border: none; padding: 0; margin: 12px 0 6px; }
  .painel-table tr.painel__grupo td, .painel-table tr.painel__grupo-vazio td { display: block; text-align: left; border-radius: var(--radius-sm); }
  .painel-table tr.painel__grupo td::before, .painel-table tr.painel__grupo-vazio td::before { display: none; }
  .painel__pac span { justify-content: flex-end; }
}
</style>
