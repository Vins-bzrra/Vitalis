<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ArrowRight } from 'lucide-vue-next'
import { usePacienteStore } from '@/stores/paciente'
import UiCard from '@/components/ui/UiCard.vue'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { STATUS_ATENDIMENTO_META } from '@/composables/useClinicalMeta'
import { calcularIdade } from '@/utils/formatters'
import { rotaProntuario } from '@/utils/patientAccess'
import type { StatusAtendimento } from '@/types'
import { usePreferenciasStore } from '@/stores/preferencias'

const store = usePacienteStore()
const router = useRouter()
const filtro = ref('')
const filtroStatus = ref<StatusAtendimento | 'todos'>('todos')
const prefs = usePreferenciasStore()
prefs.sincronizar()
const somenteMeus = ref(prefs.prefs.somenteMeusSetores)

onMounted(() => store.carregarLista())

const statusDisponiveis = Object.keys(STATUS_ATENDIMENTO_META) as StatusAtendimento[]

const filtrados = computed(() => {
  return store.pacientes.filter((p) => {
    const t = filtro.value.trim().toLowerCase()
    const bateTexto = !t || p.nome.toLowerCase().includes(t) || p.numeroProntuario.includes(t) || (p.codigoPaciente ?? '').includes(t)
    const bateStatus = filtroStatus.value === 'todos' || p.statusAtual === filtroStatus.value
    return bateTexto && bateStatus
  })
})

// Pacientes dos setores do usuário primeiro; os demais logo abaixo (ou
// ocultos, se ele preferir), sem nunca ficarem inacessíveis.
const meus = computed(() => filtrados.value.filter((p) => prefs.doMeuSetor(p.setorAtual)))
const outros = computed(() => filtrados.value.filter((p) => !prefs.doMeuSetor(p.setorAtual)))
const grupos = computed(() => {
  if (!prefs.temPrioridade) return [{ titulo: '', itens: filtrados.value }]
  const g = [{ titulo: `Meus setores · ${prefs.prefs.setoresPrioritarios.join(', ')}`, itens: meus.value }]
  if (!somenteMeus.value) g.push({ titulo: 'Demais pacientes', itens: outros.value })
  return g
})
</script>

<template>
  <div class="lista">
    <header class="lista__header">
      <div>
        <p class="lista__eyebrow">Gestão de pacientes</p>
        <h1>Pacientes</h1>
      </div>
    </header>

    <UiCard :padded="false">
      <div class="lista__filters">
        <div class="lista__search">
          <Search :size="16" />
          <input v-model="filtro" type="search" placeholder="Buscar por nome, código ou prontuário..." />
        </div>
        <select v-model="filtroStatus" class="lista__select">
          <option value="todos">Todos os status</option>
          <option v-for="s in statusDisponiveis" :key="s" :value="s">{{ STATUS_ATENDIMENTO_META[s].label }}</option>
        </select>
        <label v-if="prefs.temPrioridade" class="lista__toggle">
          <input v-model="somenteMeus" type="checkbox"> Só meus setores
        </label>
      </div>

      <div class="table-scroll">
        <table class="lista-table">
          <thead>
            <tr>
              <th>Código</th><th>Paciente</th><th>Idade</th><th>Status</th><th>Setor</th><th>Leito</th><th>Prontuário</th><th></th>
            </tr>
          </thead>
          <tbody v-for="g in grupos" :key="g.titulo">
            <tr v-if="g.titulo" class="lista__grupo"><td colspan="8">{{ g.titulo }} ({{ g.itens.length }})</td></tr>
            <tr v-for="p in g.itens" :key="p.id" @click="router.push(rotaProntuario(p.id))">
              <td data-label="Código" class="mono-num lista__cod">{{ p.codigoPaciente ?? '—' }}</td>
              <td data-label="Paciente">
                <div class="table-patient"><UiAvatar :nome="p.nome" :size="32" /><span>{{ p.nome }}</span></div>
              </td>
              <td data-label="Idade">{{ calcularIdade(p.dataNascimento) }} anos</td>
              <td data-label="Status"><UiBadge :tone="STATUS_ATENDIMENTO_META[p.statusAtual].tone as any" size="sm">{{ STATUS_ATENDIMENTO_META[p.statusAtual].label }}</UiBadge></td>
              <td data-label="Setor">{{ p.setorAtual ?? '—' }}</td>
              <td data-label="Leito">{{ p.leitoAtual ?? '—' }}</td>
              <td data-label="Prontuário" class="mono-num">{{ p.numeroProntuario }}</td>
              <td><ArrowRight :size="15" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiCard>
  </div>
</template>

<style scoped>
.lista { display: flex; flex-direction: column; gap: var(--space-5); }
.lista__eyebrow { font-family: var(--font-mono); font-size: 11.5px; text-transform: uppercase; color: var(--color-ink-faint); margin-bottom: 4px; }
.lista__header h1 { font-size: 24px; }

.lista__filters { display: flex; gap: var(--space-3); padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--color-border); flex-wrap: wrap; }
.lista__search { flex: 1; min-width: 220px; display: flex; align-items: center; gap: 8px; border: 1px solid var(--color-border-strong); border-radius: var(--radius-sm); padding: 9px 12px; color: var(--color-ink-faint); }
.lista__search input { border: none; outline: none; flex: 1; font-size: 13.5px; background: none; color: var(--color-ink); }
.lista__select { border: 1px solid var(--color-border-strong); border-radius: var(--radius-sm); padding: 9px 12px; font-size: 13px; }

.table-scroll { overflow-x: auto; }
.lista-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.lista-table th { text-align: left; font-size: 11px; text-transform: uppercase; color: var(--color-ink-faint); padding: 10px var(--space-5); border-bottom: 1px solid var(--color-border); white-space: nowrap; }
.lista-table td { padding: 12px var(--space-5); border-bottom: 1px solid var(--color-border); white-space: nowrap; }
.lista-table tbody tr { cursor: pointer; }
.lista-table tbody tr:hover { background: var(--color-primary-softer); }
.table-patient { display: flex; align-items: center; gap: 10px; }
.lista__cod { font-weight: 700; color: var(--color-primary-dark); }
.lista__grupo td { background: var(--color-primary-softer); font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--color-primary-dark); padding: 8px var(--space-5); cursor: default; }
.lista__toggle { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--color-ink-soft); cursor: pointer; }

@media (max-width: 700px) {
  .lista-table thead { display: none; }
  .lista-table, .lista-table tbody, .lista-table tr, .lista-table td { display: block; width: 100%; }
  .lista-table tr { border-bottom: 1px solid var(--color-border); padding: var(--space-3) var(--space-4); }
  .lista-table td { border-bottom: none; padding: 4px 0; display: flex; justify-content: space-between; }
  .lista-table td::before { content: attr(data-label); font-size: 10.5px; color: var(--color-ink-faint); font-weight: 700; }
  .lista-table td:first-child::before { display: none; }
  .lista-table tr.lista__grupo { padding: 0; border: none; }
  .lista-table tr.lista__grupo td { display: block; padding: 8px var(--space-4); }
  .lista-table tr.lista__grupo td::before { display: none; }
}
</style>
