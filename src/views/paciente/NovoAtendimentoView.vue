<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ClipboardPlus } from 'lucide-vue-next'
import { usePacienteStore } from '@/stores/paciente'
import { useAtendimentoFluxoStore } from '@/stores/atendimentoFluxo'
import { useAuthStore } from '@/stores/auth'
import UiCard from '@/components/ui/UiCard.vue'
import UiButton from '@/components/ui/UiButton.vue'
import FormField from '@/components/form/FormField.vue'
import MobileActionBar from '@/components/ui/MobileActionBar.vue'
import PatientSummaryCard from '@/components/clinical/PatientSummaryCard.vue'
import { TIPO_ATENDIMENTO_META } from '@/composables/useClinicalMeta'
import { formatarData } from '@/utils/formatters'
import type { TipoAtendimento } from '@/types'

const props = defineProps<{ id: string }>()
const router = useRouter()
const pacienteStore = usePacienteStore()
const fluxo = useAtendimentoFluxoStore()
const auth = useAuthStore()

const tiposDisponiveis: TipoAtendimento[] = ['emergencia', 'pronto_atendimento', 'consulta', 'retorno', 'procedimento', 'avaliacao']
const setoresDisponiveis = ['Recepção', 'Emergência', 'Pronto Atendimento', 'Ambulatório Geral', 'Ambulatório Pediátrico', 'Observação']

onMounted(async () => {
  if (!fluxo.paciente || fluxo.paciente.id !== props.id) {
    await pacienteStore.carregarPaciente(props.id)
    if (pacienteStore.pacienteAtual) fluxo.selecionarPaciente(pacienteStore.pacienteAtual)
  }
})

const paciente = computed(() => fluxo.paciente)
const erro = reactive({ motivo: '' })

async function abrirAtendimento() {
  erro.motivo = ''
  if (!fluxo.dadosAtendimento.motivoEntrada.trim()) {
    erro.motivo = 'Descreva o motivo da procura para continuar.'
    return
  }
  const atendimento = await fluxo.iniciarAtendimento()
  router.push(`/pacientes/${props.id}/acolhimento?atendimento=${atendimento.id}`)
}
</script>

<template>
  <div class="novo-atendimento">
    <button class="voltar" @click="router.push('/atendimentos')"><ArrowLeft :size="14" /> Voltar para recepção</button>

    <header class="novo-atendimento__header">
      <div>
        <h1>Novo atendimento</h1>
        <p>Confirme os dados do paciente e registre o motivo da procura para abrir o atendimento.</p>
      </div>
    </header>

    <PatientSummaryCard v-if="paciente" :paciente="paciente" :ultimo-atendimento="paciente.ultimoAtendimentoEm ? formatarData(paciente.ultimoAtendimentoEm) : undefined" />

    <UiCard title="Dados do atendimento">
      <form class="atd-form" @submit.prevent="abrirAtendimento">
        <FormField label="Tipo de atendimento" required>
          <select v-model="fluxo.dadosAtendimento.tipo">
            <option v-for="t in tiposDisponiveis" :key="t" :value="t">{{ TIPO_ATENDIMENTO_META[t].label }}</option>
          </select>
        </FormField>
        <FormField label="Setor de entrada" required>
          <select v-model="fluxo.dadosAtendimento.setor">
            <option v-for="s in setoresDisponiveis" :key="s" :value="s">{{ s }}</option>
          </select>
        </FormField>
        <FormField label="Profissional responsável pelo acolhimento">
          <input :value="auth.usuario?.nome" type="text" disabled />
        </FormField>
        <FormField label="Motivo da procura" required :error="erro.motivo" :span="3">
          <textarea v-model="fluxo.dadosAtendimento.motivoEntrada" rows="2" placeholder="Ex.: Dor abdominal intensa há 2 horas" />
        </FormField>
        <FormField label="Queixa principal" :span="3">
          <textarea v-model="fluxo.dadosAtendimento.queixaPrincipal" rows="2" placeholder="Como o paciente descreve o que está sentindo" />
        </FormField>
        <FormField label="Observações iniciais" :span="3">
          <textarea v-model="fluxo.dadosAtendimento.observacoes" rows="2" placeholder="Informações adicionais relevantes para o acolhimento" />
        </FormField>

        <div class="atd-form__actions">
          <UiButton type="button" variant="ghost" @click="router.push('/atendimentos')">Cancelar</UiButton>
          <UiButton type="submit" :disabled="fluxo.processando">
            <template #icon><ClipboardPlus :size="16" /></template>
            {{ fluxo.processando ? 'Abrindo atendimento...' : 'Abrir atendimento e ir para acolhimento' }}
          </UiButton>
        </div>

        <MobileActionBar>
          <UiButton type="submit" block :disabled="fluxo.processando">{{ fluxo.processando ? 'Abrindo...' : 'Abrir atendimento' }}</UiButton>
        </MobileActionBar>
      </form>
    </UiCard>
  </div>
</template>

<style scoped>
.novo-atendimento { display: flex; flex-direction: column; gap: var(--space-4); max-width: 880px; }
.voltar { align-self: flex-start; display: flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; color: var(--color-ink-soft); font-size: 12.5px; font-weight: 600; padding: 6px 0; }
.voltar:hover { color: var(--color-primary); }
.novo-atendimento__header h1 { font-size: 22px; }
.novo-atendimento__header p { font-size: 13px; color: var(--color-ink-soft); margin-top: 4px; }

.atd-form { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
.atd-form__actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: var(--space-3); }

@media (max-width: 900px) {
  .atd-form { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 639px) {
  .atd-form { grid-template-columns: 1fr; }
  .atd-form__actions { display: none; }
}
</style>
