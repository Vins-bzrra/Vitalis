<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, ChevronDown, Check, Stethoscope, AlertTriangle,
} from 'lucide-vue-next'
import { usePacienteStore } from '@/stores/paciente'
import { useAtendimentoFluxoStore } from '@/stores/atendimentoFluxo'
import UiCard from '@/components/ui/UiCard.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import MobileActionBar from '@/components/ui/MobileActionBar.vue'
import PatientAlertBanner from '@/components/clinical/PatientAlertBanner.vue'
import VitalSignsForm from '@/components/clinical/VitalSignsForm.vue'
import RiskClassificationPicker from '@/components/clinical/RiskClassificationPicker.vue'
import { STATUS_ATENDIMENTO_META } from '@/composables/useClinicalMeta'
import { calcularIdade, formatarData } from '@/utils/formatters'

const props = defineProps<{ id: string }>()
const route = useRoute()
const router = useRouter()
const pacienteStore = usePacienteStore()
const fluxo = useAtendimentoFluxoStore()

const PASSOS = ['queixa', 'vitais', 'classificacao', 'observacoes', 'revisao'] as const
type Passo = typeof PASSOS[number]
const passoAtivo = ref<Passo>('queixa')
const concluida = ref(false)

onMounted(async () => {
  const atendimentoId = route.query.atendimento as string | undefined
  if (atendimentoId && (!fluxo.atendimento || fluxo.atendimento.id !== atendimentoId)) {
    await fluxo.carregarAtendimentoExistente(atendimentoId)
  }
  if (!fluxo.paciente || fluxo.paciente.id !== props.id) {
    await pacienteStore.carregarPaciente(props.id)
    if (pacienteStore.pacienteAtual) fluxo.paciente = pacienteStore.pacienteAtual
    if (!fluxo.atendimento) await fluxo.carregarAtendimentoExistente(pacienteStore.atendimentoAtual?.id ?? '')
  }
})

const paciente = computed(() => fluxo.paciente)
const atendimento = computed(() => fluxo.atendimento)

const labelPasso: Record<Passo, string> = {
  queixa: 'Queixa principal',
  vitais: 'Sinais vitais',
  classificacao: 'Classificação de risco',
  observacoes: 'Observações da triagem',
  revisao: 'Revisão e finalização',
}

function irPara(passo: Passo) {
  passoAtivo.value = passo
}
function proximo() {
  const idx = PASSOS.indexOf(passoAtivo.value)
  if (idx < PASSOS.length - 1) passoAtivo.value = PASSOS[idx + 1]
}

const limiteObservacoes = 500

async function finalizarTriagem() {
  await fluxo.concluirTriagem()
  concluida.value = true
}

function verProntuario() {
  router.push(`/pacientes/${props.id}`)
}
</script>

<template>
  <div class="triagem-wizard">
    <button class="voltar" @click="router.push('/atendimentos')"><ArrowLeft :size="14" /> Voltar para recepção</button>

    <template v-if="!concluida">
      <UiCard v-if="paciente">
        <div class="tw-patient">
          <UiAvatar :nome="paciente.nome" :size="56" />
          <div class="tw-patient__info">
            <strong>{{ paciente.nome }}</strong>
            <span>{{ paciente.sexo }} · {{ calcularIdade(paciente.dataNascimento) }} anos · Prontuário {{ paciente.numeroProntuario }}</span>
            <span v-if="atendimento">Atendimento {{ atendimento.numero }} · Entrada {{ formatarData(atendimento.dataEntrada) }}</span>
          </div>
          <UiBadge :tone="STATUS_ATENDIMENTO_META[paciente.statusAtual].tone as any">
            {{ STATUS_ATENDIMENTO_META[paciente.statusAtual].label }}
          </UiBadge>
        </div>
        <PatientAlertBanner :paciente="paciente" />
      </UiCard>

      <div class="tw-accordion">
        <!-- Queixa principal -->
        <section class="tw-step" :class="{ 'is-active': passoAtivo === 'queixa' }">
          <button class="tw-step__head" @click="irPara('queixa')">
            <span class="tw-step__title">1. {{ labelPasso.queixa }}</span>
            <span v-if="passoAtivo !== 'queixa' && fluxo.dadosTriagem.queixaPrincipal" class="tw-step__summary">{{ fluxo.dadosTriagem.queixaPrincipal }}</span>
            <ChevronDown :size="18" :class="{ 'is-rotated': passoAtivo === 'queixa' }" />
          </button>
          <div v-if="passoAtivo === 'queixa'" class="tw-step__body">
            <textarea v-model="fluxo.dadosTriagem.queixaPrincipal" rows="3" placeholder="Descreva a queixa principal relatada" />
            <div class="tw-step__actions">
              <UiButton size="sm" :disabled="!fluxo.dadosTriagem.queixaPrincipal.trim()" @click="proximo">Continuar</UiButton>
            </div>
          </div>
        </section>

        <!-- Sinais vitais -->
        <section class="tw-step" :class="{ 'is-active': passoAtivo === 'vitais' }">
          <button class="tw-step__head" @click="irPara('vitais')">
            <span class="tw-step__title">2. {{ labelPasso.vitais }}</span>
            <span v-if="passoAtivo !== 'vitais' && fluxo.dadosTriagem.vitais.pressaoArterial" class="tw-step__summary mono-num">
              PA {{ fluxo.dadosTriagem.vitais.pressaoArterial }} · FC {{ fluxo.dadosTriagem.vitais.frequenciaCardiaca }}bpm · SatO2 {{ fluxo.dadosTriagem.vitais.saturacao }}%
            </span>
            <ChevronDown :size="18" :class="{ 'is-rotated': passoAtivo === 'vitais' }" />
          </button>
          <div v-if="passoAtivo === 'vitais'" class="tw-step__body">
            <VitalSignsForm v-model="fluxo.dadosTriagem.vitais" />
            <div class="tw-step__actions">
              <UiButton size="sm" @click="proximo">Continuar</UiButton>
            </div>
          </div>
        </section>

        <!-- Classificação de risco -->
        <section class="tw-step" :class="{ 'is-active': passoAtivo === 'classificacao' }">
          <button class="tw-step__head" @click="irPara('classificacao')">
            <span class="tw-step__title">3. {{ labelPasso.classificacao }}</span>
            <span v-if="passoAtivo !== 'classificacao' && fluxo.dadosTriagem.classificacaoRisco" class="tw-step__summary" :style="{ color: fluxo.dadosTriagem.classificacaoRisco.cor }">
              {{ fluxo.dadosTriagem.classificacaoRisco.label }}
            </span>
            <span v-else-if="passoAtivo !== 'classificacao'" class="tw-step__summary is-pending"><AlertTriangle :size="13" /> Pendente</span>
            <ChevronDown :size="18" :class="{ 'is-rotated': passoAtivo === 'classificacao' }" />
          </button>
          <div v-if="passoAtivo === 'classificacao'" class="tw-step__body">
            <RiskClassificationPicker v-model="fluxo.dadosTriagem.classificacaoRisco" />
            <div class="tw-step__actions">
              <UiButton size="sm" :disabled="!fluxo.dadosTriagem.classificacaoRisco" @click="proximo">Continuar</UiButton>
            </div>
          </div>
        </section>

        <!-- Observações -->
        <section class="tw-step" :class="{ 'is-active': passoAtivo === 'observacoes' }">
          <button class="tw-step__head" @click="irPara('observacoes')">
            <span class="tw-step__title">4. {{ labelPasso.observacoes }}</span>
            <ChevronDown :size="18" :class="{ 'is-rotated': passoAtivo === 'observacoes' }" />
          </button>
          <div v-if="passoAtivo === 'observacoes'" class="tw-step__body">
            <textarea
              v-model="fluxo.dadosTriagem.observacoes"
              rows="4"
              :maxlength="limiteObservacoes"
              placeholder="Registre informações relevantes observadas durante a triagem"
            />
            <p class="tw-char-count">{{ fluxo.dadosTriagem.observacoes.length }}/{{ limiteObservacoes }} caracteres</p>
            <div class="tw-step__actions">
              <UiButton size="sm" @click="proximo">Ir para revisão</UiButton>
            </div>
          </div>
        </section>

        <!-- Revisão -->
        <section class="tw-step" :class="{ 'is-active': passoAtivo === 'revisao' }">
          <button class="tw-step__head" @click="irPara('revisao')">
            <span class="tw-step__title">5. {{ labelPasso.revisao }}</span>
            <ChevronDown :size="18" :class="{ 'is-rotated': passoAtivo === 'revisao' }" />
          </button>
          <div v-if="passoAtivo === 'revisao'" class="tw-step__body tw-review">
            <div class="tw-review__block">
              <h4>Paciente</h4>
              <p>{{ paciente?.nome }} · {{ paciente ? calcularIdade(paciente.dataNascimento) : '' }} anos · Prontuário {{ paciente?.numeroProntuario }}</p>
            </div>
            <div class="tw-review__block">
              <h4>Atendimento</h4>
              <p>{{ atendimento?.numero }} · {{ atendimento?.setor }} · {{ atendimento?.motivoEntrada }}</p>
            </div>
            <div class="tw-review__block">
              <h4>Queixa principal</h4>
              <p>{{ fluxo.dadosTriagem.queixaPrincipal || '—' }}</p>
            </div>
            <div class="tw-review__block">
              <h4>Sinais vitais</h4>
              <ul class="tw-review__vitals mono-num">
                <li>PA {{ fluxo.dadosTriagem.vitais.pressaoArterial || '—' }} mmHg</li>
                <li>FC {{ fluxo.dadosTriagem.vitais.frequenciaCardiaca || '—' }} bpm</li>
                <li>FR {{ fluxo.dadosTriagem.vitais.frequenciaRespiratoria || '—' }} irpm</li>
                <li>SatO2 {{ fluxo.dadosTriagem.vitais.saturacao || '—' }} %</li>
                <li>Temp {{ fluxo.dadosTriagem.vitais.temperatura || '—' }} °C</li>
                <li>Dor {{ fluxo.dadosTriagem.vitais.dor }}/10</li>
              </ul>
            </div>
            <div class="tw-review__block">
              <h4>Classificação</h4>
              <p v-if="fluxo.dadosTriagem.classificacaoRisco" :style="{ color: fluxo.dadosTriagem.classificacaoRisco.cor, fontWeight: 700 }">
                {{ fluxo.dadosTriagem.classificacaoRisco.label }}
              </p>
              <p v-else class="tw-review__missing"><AlertTriangle :size="13" /> Classificação ainda não selecionada — volte à etapa 3.</p>
            </div>
            <div class="tw-review__block">
              <h4>Observações</h4>
              <p>{{ fluxo.dadosTriagem.observacoes || 'Nenhuma observação registrada.' }}</p>
            </div>

            <div class="tw-step__actions">
              <UiButton size="sm" variant="secondary" @click="irPara('classificacao')">Voltar e editar</UiButton>
              <UiButton
                size="sm"
                :disabled="!fluxo.dadosTriagem.classificacaoRisco || !fluxo.dadosTriagem.queixaPrincipal.trim() || fluxo.processando"
                @click="finalizarTriagem"
              >
                <template #icon><Stethoscope :size="15" /></template>
                {{ fluxo.processando ? 'Finalizando...' : 'Finalizar triagem' }}
              </UiButton>
            </div>
          </div>
        </section>
      </div>

      <MobileActionBar>
        <UiButton v-if="passoAtivo !== 'revisao'" block @click="passoAtivo === 'observacoes' ? irPara('revisao') : proximo()">Continuar</UiButton>
        <UiButton v-else block :disabled="!fluxo.dadosTriagem.classificacaoRisco || fluxo.processando" @click="finalizarTriagem">
          {{ fluxo.processando ? 'Finalizando...' : 'Finalizar triagem' }}
        </UiButton>
      </MobileActionBar>
    </template>

    <template v-else>
      <UiCard class="tw-success">
        <div class="tw-success__icon"><Check :size="32" /></div>
        <h2>Triagem concluída</h2>
        <p>O paciente foi encaminhado para <strong>aguardando avaliação médica</strong>. A timeline e o dashboard já foram atualizados.</p>
        <div class="tw-success__actions">
          <UiButton @click="verProntuario">Ver prontuário do paciente</UiButton>
          <UiButton variant="secondary" @click="router.push('/atendimentos')">Voltar para recepção</UiButton>
        </div>
      </UiCard>
    </template>
  </div>
</template>

<style scoped>
.triagem-wizard { display: flex; flex-direction: column; gap: var(--space-4); max-width: 880px; }
.voltar { align-self: flex-start; display: flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; color: var(--color-ink-soft); font-size: 12.5px; font-weight: 600; padding: 6px 0; }
.voltar:hover { color: var(--color-primary); }

.tw-patient { display: flex; align-items: center; gap: 14px; margin-bottom: var(--space-3); flex-wrap: wrap; }
.tw-patient__info { display: flex; flex-direction: column; flex: 1; min-width: 200px; }
.tw-patient__info strong { font-size: 16px; font-family: var(--font-display); }
.tw-patient__info span { font-size: 12px; color: var(--color-ink-soft); }

.tw-accordion { display: flex; flex-direction: column; gap: 10px; }
.tw-step { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }
.tw-step.is-active { border-color: var(--color-primary); }
.tw-step__head {
  width: 100%; display: flex; align-items: center; gap: 12px;
  background: none; border: none; cursor: pointer; text-align: left;
  padding: var(--space-4); min-height: 56px;
}
.tw-step__title { font-weight: 700; font-size: 13.5px; flex-shrink: 0; }
.tw-step__summary { flex: 1; min-width: 0; font-size: 12px; color: var(--color-ink-soft); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: right; }
.tw-step__summary.is-pending { color: var(--color-warning); display: inline-flex; align-items: center; gap: 4px; justify-content: flex-end; }
.tw-step__head svg:last-child { transition: transform 0.15s ease; color: var(--color-ink-faint); flex-shrink: 0; }
.tw-step__head svg.is-rotated { transform: rotate(180deg); }

.tw-step__body { padding: 0 var(--space-4) var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); }
.tw-step__body textarea {
  width: 100%; border: 1px solid var(--color-border-strong); border-radius: var(--radius-sm); padding: 11px 12px;
  font-size: 14px; font-family: inherit; resize: vertical; min-height: 88px;
}
.tw-step__body textarea:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-soft); }
.tw-char-count { font-size: 11px; color: var(--color-ink-faint); text-align: right; }
.tw-step__actions { display: flex; justify-content: flex-end; gap: 8px; }

.tw-review { gap: var(--space-4); }
.tw-review__block h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-ink-faint); font-weight: 700; margin-bottom: 4px; }
.tw-review__block p { font-size: 13.5px; }
.tw-review__vitals { display: flex; flex-wrap: wrap; gap: 10px; font-size: 13px; }
.tw-review__missing { display: flex; align-items: center; gap: 6px; color: var(--color-warning); font-weight: 600; }

.tw-success { max-width: 480px; margin: var(--space-6) auto; text-align: center; }
.tw-success__icon { width: 60px; height: 60px; border-radius: 50%; background: var(--color-success-soft); color: var(--color-success); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-3); }
.tw-success h2 { font-size: 20px; margin-bottom: var(--space-2); }
.tw-success p { font-size: 13.5px; color: var(--color-ink-soft); margin-bottom: var(--space-5); }
.tw-success__actions { display: flex; flex-direction: column; gap: 8px; }

@media (min-width: 480px) {
  .tw-success__actions { flex-direction: row; justify-content: center; }
}
@media (max-width: 767px) {
  .tw-step__summary { display: none; }
}
</style>
