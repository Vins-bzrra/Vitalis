<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, HeartHandshake } from 'lucide-vue-next'
import { usePacienteStore } from '@/stores/paciente'
import { useAtendimentoFluxoStore } from '@/stores/atendimentoFluxo'
import UiCard from '@/components/ui/UiCard.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import FormField from '@/components/form/FormField.vue'
import MobileActionBar from '@/components/ui/MobileActionBar.vue'
import PatientAlertBanner from '@/components/clinical/PatientAlertBanner.vue'
import { STATUS_ATENDIMENTO_META } from '@/composables/useClinicalMeta'
import { calcularIdade } from '@/utils/formatters'

const props = defineProps<{ id: string }>()
const route = useRoute()
const router = useRouter()
const pacienteStore = usePacienteStore()
const fluxo = useAtendimentoFluxoStore()

onMounted(async () => {
  const atendimentoId = route.query.atendimento as string | undefined
  if (atendimentoId && (!fluxo.atendimento || fluxo.atendimento.id !== atendimentoId)) {
    await fluxo.carregarAtendimentoExistente(atendimentoId)
  }
  if (!fluxo.paciente || fluxo.paciente.id !== props.id) {
    await pacienteStore.carregarPaciente(props.id)
    if (pacienteStore.pacienteAtual) fluxo.paciente = pacienteStore.pacienteAtual
  }
})

const paciente = computed(() => fluxo.paciente)
const atendimento = computed(() => fluxo.atendimento)

const prioridades = ['Baixa', 'Moderada', 'Alta', 'Imediata']

async function encaminharParaTriagem() {
  if (!fluxo.dadosAcolhimento.queixaPrincipal.trim()) return
  await fluxo.concluirAcolhimento()
  router.push(`/pacientes/${props.id}/triagem/nova?atendimento=${fluxo.atendimento?.id}`)
}
</script>

<template>
  <div class="acolhimento">
    <button class="voltar" @click="router.push('/atendimentos')"><ArrowLeft :size="14" /> Voltar para recepção</button>

    <div class="acolhimento__title">
      <span class="acolhimento__badge"><HeartHandshake :size="16" /> ACOLHIMENTO</span>
    </div>

    <UiCard v-if="paciente" :padded="true">
      <div class="acolhimento__patient">
        <UiAvatar :nome="paciente.nome" :size="52" />
        <div class="acolhimento__patient-info">
          <strong>{{ paciente.nome }}</strong>
          <span>{{ calcularIdade(paciente.dataNascimento) }} anos · {{ paciente.sexo }}<template v-if="atendimento"> · Atendimento {{ atendimento.numero }}</template></span>
        </div>
        <UiBadge :tone="STATUS_ATENDIMENTO_META[paciente.statusAtual].tone as any" size="sm">
          {{ STATUS_ATENDIMENTO_META[paciente.statusAtual].label }}
        </UiBadge>
      </div>
      <PatientAlertBanner :paciente="paciente" compact />
    </UiCard>

    <UiCard title="Registro do acolhimento" subtitle="Essas informações serão utilizadas na triagem e ficam registradas na timeline do atendimento.">
      <form class="acolhimento-form" @submit.prevent="encaminharParaTriagem">
        <FormField label="Motivo da procura" :span="2">
          <textarea v-model="fluxo.dadosAcolhimento.motivoProcura" rows="2" />
        </FormField>
        <FormField label="Queixa principal" required :span="2">
          <textarea v-model="fluxo.dadosAcolhimento.queixaPrincipal" rows="2" placeholder="Descreva a queixa relatada pelo paciente" />
        </FormField>
        <FormField label="Início dos sintomas">
          <input v-model="fluxo.dadosAcolhimento.inicioSintomas" type="text" placeholder="Ex.: Há 2 dias" />
        </FormField>
        <FormField label="Características da queixa">
          <input v-model="fluxo.dadosAcolhimento.caracteristicas" type="text" placeholder="Ex.: Dor em cólica, intermitente" />
        </FormField>
        <FormField label="Prioridade percebida">
          <select v-model="fluxo.dadosAcolhimento.prioridadePercebida">
            <option v-for="p in prioridades" :key="p" :value="p">{{ p }}</option>
          </select>
        </FormField>
        <FormField label="Necessidade de atendimento imediato">
          <label class="switch-row">
            <input v-model="fluxo.dadosAcolhimento.atendimentoImediato" type="checkbox" />
            <span>{{ fluxo.dadosAcolhimento.atendimentoImediato ? 'Sim, requer atendimento imediato' : 'Não identificada' }}</span>
          </label>
        </FormField>
        <FormField label="Observações" :span="2">
          <textarea v-model="fluxo.dadosAcolhimento.observacoes" rows="3" />
        </FormField>

        <div class="acolhimento-form__actions">
          <UiButton type="submit" :disabled="fluxo.processando">
            {{ fluxo.processando ? 'Encaminhando...' : 'Encaminhar para triagem' }}
            <template #icon><ArrowRight :size="16" /></template>
          </UiButton>
        </div>

        <MobileActionBar>
          <UiButton type="submit" block :disabled="fluxo.processando">Encaminhar para triagem</UiButton>
        </MobileActionBar>
      </form>
    </UiCard>
  </div>
</template>

<style scoped>
.acolhimento { display: flex; flex-direction: column; gap: var(--space-4); max-width: 880px; }
.voltar { align-self: flex-start; display: flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; color: var(--color-ink-soft); font-size: 12.5px; font-weight: 600; padding: 6px 0; }
.voltar:hover { color: var(--color-primary); }

.acolhimento__title { display: flex; }
.acolhimento__badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--color-success-soft); color: var(--color-success);
  font-weight: 700; font-size: 13px; letter-spacing: 0.04em;
  padding: 8px 16px; border-radius: 100px;
}

.acolhimento__patient { display: flex; align-items: center; gap: 14px; margin-bottom: var(--space-3); flex-wrap: wrap; }
.acolhimento__patient-info { display: flex; flex-direction: column; flex: 1; min-width: 160px; }
.acolhimento__patient-info strong { font-size: 15px; }
.acolhimento__patient-info span { font-size: 12px; color: var(--color-ink-soft); }

.acolhimento-form { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); }
.acolhimento-form__actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; }
.switch-row { display: flex; align-items: center; gap: 8px; min-height: 44px; font-size: 13px; color: var(--color-ink-soft); }
.switch-row input { width: 20px; height: 20px; accent-color: var(--color-primary); }

@media (max-width: 639px) {
  .acolhimento-form { grid-template-columns: 1fr; }
  .acolhimento-form__actions { display: none; }
}
</style>
