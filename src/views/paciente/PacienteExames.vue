<script setup lang="ts">
import { computed } from 'vue'
import type { Atendimento, Paciente } from '@/types'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import { STATUS_EXAME_META } from '@/composables/useClinicalMeta'
import { FlaskConical, Image as ImageIcon } from 'lucide-vue-next'

const props = defineProps<{ paciente: Paciente; atendimento: Atendimento | null }>()

const pendentes = computed(() => props.atendimento?.exames.filter(e => e.status === 'solicitado' || e.status === 'aguardando_realizacao') ?? [])
const disponiveis = computed(() => props.atendimento?.exames.filter(e => e.status === 'resultado_disponivel' || e.status === 'resultado_critico') ?? [])
const comHistorico = computed(() => props.atendimento?.exames.filter(e => (e.historicoParametro?.length ?? 0) > 1) ?? [])
</script>

<template>
  <div class="exames">
    <UiCard title="Exames aguardando" :subtitle="`${pendentes.length} exame(s) solicitado(s) ou aguardando realização`">
      <ul v-if="pendentes.length" class="exame-list">
        <li v-for="e in pendentes" :key="e.id">
          <span class="exame-icon"><component :is="e.tipo === 'imagem' ? ImageIcon : FlaskConical" :size="16" /></span>
          <div class="exame-info">
            <strong>{{ e.nome }}</strong>
            <span>Solicitado por {{ e.solicitadoPor }}</span>
          </div>
          <UiBadge :tone="STATUS_EXAME_META[e.status].tone as any" size="sm">{{ STATUS_EXAME_META[e.status].label }}</UiBadge>
        </li>
      </ul>
      <UiEmptyState v-else title="Nenhum exame pendente" />
    </UiCard>

    <UiCard title="Resultados disponíveis">
      <template v-if="disponiveis.length">
        <div v-for="e in disponiveis" :key="e.id" class="resultado" :class="{ 'is-critico': e.status === 'resultado_critico' }">
          <div class="resultado__head">
            <strong>{{ e.nome }}</strong>
            <UiBadge :tone="STATUS_EXAME_META[e.status].tone as any" size="sm">{{ STATUS_EXAME_META[e.status].label }}</UiBadge>
          </div>
          <table v-if="e.resultados?.length" class="resultado__table">
            <thead><tr><th>Parâmetro</th><th>Valor</th><th>Referência</th></tr></thead>
            <tbody>
              <tr v-for="r in e.resultados" :key="r.parametro" :class="{ 'is-alterado': r.alterado, 'is-critico': r.critico }">
                <td>{{ r.parametro }}</td>
                <td class="mono-num">{{ r.valor }} {{ r.unidade }}</td>
                <td>{{ r.referencia }}</td>
              </tr>
            </tbody>
          </table>
          <p v-if="e.laudo" class="resultado__laudo">{{ e.laudo }}</p>
        </div>
      </template>
      <UiEmptyState v-else title="Nenhum resultado disponível ainda" />
    </UiCard>

    <UiCard v-if="comHistorico.length" title="Comparação de resultados ao longo do tempo">
      <div v-for="e in comHistorico" :key="e.id" class="historico">
        <strong>{{ e.nome }}{{ e.resultados?.[0]?.parametro ? ` — ${e.resultados[0].parametro}` : '' }}</strong>
        <div class="historico__trend mono-num">
          <template v-for="(h, i) in e.historicoParametro" :key="h.data">
            <span :class="{ 'is-last': i === (e.historicoParametro!.length - 1) }">{{ h.valor }}</span>
            <span v-if="i < e.historicoParametro!.length - 1" class="historico__arrow">→</span>
          </template>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<style scoped>
.exames { display: flex; flex-direction: column; gap: var(--space-4); }

.exame-list { display: flex; flex-direction: column; gap: var(--space-2); }
.exame-list li { display: flex; align-items: center; gap: 12px; padding: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.exame-icon { width: 32px; height: 32px; border-radius: 8px; background: var(--color-info-soft); color: var(--color-info); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.exame-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.exame-info strong { font-size: 13.5px; }
.exame-info span { font-size: 12px; color: var(--color-ink-soft); }

.resultado { border-top: 1px solid var(--color-border); padding: var(--space-3) 0; }
.resultado:first-child { border-top: none; padding-top: 0; }
.resultado.is-critico { background: var(--color-critical-soft); border-radius: var(--radius-md); padding: var(--space-3); margin: 0 -4px; }
.resultado__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }

.resultado__table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.resultado__table th { text-align: left; color: var(--color-ink-faint); font-size: 11px; text-transform: uppercase; padding: 4px 8px; }
.resultado__table td { padding: 6px 8px; border-top: 1px solid var(--color-border); }
.resultado__table tr.is-alterado td:nth-child(2) { color: var(--color-warning); font-weight: 700; }
.resultado__table tr.is-critico td:nth-child(2) { color: var(--color-critical); font-weight: 700; }
.resultado__laudo { font-size: 12.5px; color: var(--color-ink-soft); margin-top: 8px; }

.historico { padding: var(--space-3) 0; border-top: 1px solid var(--color-border); }
.historico:first-child { border-top: none; padding-top: 0; }
.historico strong { font-size: 13px; display: block; margin-bottom: 6px; }
.historico__trend { font-size: 14px; display: flex; flex-wrap: wrap; align-items: center; gap: 4px; color: var(--color-ink-soft); }
.historico__trend .is-last { color: var(--color-primary); font-weight: 700; }
.historico__arrow { color: var(--color-ink-faint); }
</style>
