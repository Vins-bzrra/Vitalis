<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Stethoscope, ChevronDown } from 'lucide-vue-next'
import type { Atendimento, Paciente } from '@/types'
import UiCard from '@/components/ui/UiCard.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import { useAuthStore } from '@/stores/auth'
import { useAtendimentoFluxoStore } from '@/stores/atendimentoFluxo'

const props = defineProps<{ paciente: Paciente; atendimento: Atendimento | null }>()
const router = useRouter()
const auth = useAuthStore()
const fluxo = useAtendimentoFluxoStore()

const expandida = ref<string | null>(null)
function toggle(id: string) {
  expandida.value = expandida.value === id ? null : id
}

function novaTriagem() {
  if (!props.atendimento) return
  fluxo.paciente = props.paciente
  fluxo.atendimento = props.atendimento
  fluxo.dadosTriagem.queixaPrincipal = props.atendimento.queixaPrincipal
  router.push(`/pacientes/${props.paciente.id}/triagem/nova?atendimento=${props.atendimento.id}`)
}
</script>

<template>
  <div class="hist-triagem">
    <UiCard title="Histórico de triagens" subtitle="Cada triagem realizada fica registrada como um evento histórico independente">
      <template #actions>
        <UiButton v-if="auth.pode('triagem.criar') && atendimento" size="sm" @click="novaTriagem">
          <template #icon><Stethoscope :size="15" /></template> Registrar nova triagem
        </UiButton>
      </template>

      <template v-if="atendimento?.triagens.length">
        <ul class="tri-list">
          <li v-for="t in [...atendimento.triagens].reverse()" :key="t.id">
            <button class="tri-list__head" @click="toggle(t.id)">
              <span class="risco-tag" :style="{ '--risk-color': t.classificacaoRisco.cor }">{{ t.classificacaoRisco.label }}</span>
              <span class="tri-list__meta mono-num">{{ t.data.split('-').reverse().join('/') }} · {{ t.hora }} · {{ t.profissional }}</span>
              <ChevronDown :size="16" :class="{ 'is-rotated': expandida === t.id }" />
            </button>
            <div v-if="expandida === t.id" class="tri-list__body">
              <p class="tri-list__queixa">{{ t.queixaPrincipal }}</p>
              <div class="tri-list__vitals">
                <span>PA {{ t.vitais.pressaoArterial }}</span>
                <span>FC {{ t.vitais.frequenciaCardiaca }}bpm</span>
                <span>FR {{ t.vitais.frequenciaRespiratoria }}irpm</span>
                <span>SatO2 {{ t.vitais.saturacao }}%</span>
                <span>Temp {{ t.vitais.temperatura }}°C</span>
                <span v-if="t.vitais.glicemia">Glicemia {{ t.vitais.glicemia }}mg/dL</span>
                <span>Dor {{ t.vitais.dor }}/10</span>
                <span>{{ t.vitais.nivelConsciencia }}</span>
              </div>
              <p v-if="t.observacoes" class="tri-list__obs">{{ t.observacoes }}</p>
            </div>
          </li>
        </ul>
      </template>
      <UiEmptyState v-else title="Nenhuma triagem registrada" description="Assim que uma triagem for realizada para este atendimento, ela aparecerá aqui.">
        <template v-if="auth.pode('triagem.criar') && atendimento" #action>
          <UiButton size="sm" @click="novaTriagem"><template #icon><Stethoscope :size="15" /></template> Registrar triagem</UiButton>
        </template>
      </UiEmptyState>
    </UiCard>
  </div>
</template>

<style scoped>
.hist-triagem { display: flex; flex-direction: column; gap: var(--space-4); }
.tri-list { display: flex; flex-direction: column; gap: 8px; }
.tri-list__head {
  width: 100%; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  background: none; border: 1px solid var(--color-border); border-radius: var(--radius-md);
  padding: 10px 14px; cursor: pointer; text-align: left; min-height: 48px;
}
.tri-list__head:hover { border-color: var(--color-primary); }
.risco-tag { background: var(--risk-color); color: #fff; padding: 4px 10px; border-radius: 100px; font-weight: 700; font-size: 11.5px; flex-shrink: 0; }
.tri-list__meta { flex: 1; font-size: 12px; color: var(--color-ink-soft); }
.tri-list__head svg { transition: transform 0.15s ease; color: var(--color-ink-faint); flex-shrink: 0; }
.tri-list__head svg.is-rotated { transform: rotate(180deg); }

.tri-list__body { padding: var(--space-3) 14px; }
.tri-list__queixa { font-size: 13px; margin-bottom: 8px; }
.tri-list__vitals { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12.5px; font-family: var(--font-mono); color: var(--color-ink); margin-bottom: 6px; }
.tri-list__obs { font-size: 12.5px; color: var(--color-ink-soft); }
</style>
