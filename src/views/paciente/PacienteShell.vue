<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronDown, ArrowLeft } from 'lucide-vue-next'
import { usePacienteStore } from '@/stores/paciente'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiTabs from '@/components/ui/UiTabs.vue'
import ResumoClinicoPanel from '@/components/clinical/ResumoClinicoPanel.vue'
import PatientAlertBanner from '@/components/clinical/PatientAlertBanner.vue'
import { STATUS_ATENDIMENTO_META } from '@/composables/useClinicalMeta'
import { calcularIdade, formatarData, formatarDataHora } from '@/utils/formatters'
import { useAuthStore } from '@/stores/auth'
import { auditService } from '@/services/auditService'

const props = defineProps<{ id: string }>()
const route = useRoute()
const router = useRouter()
const store = usePacienteStore()
const auth = useAuthStore()

const resumoAberto = ref(false)

onMounted(() => carregar())
watch(() => props.id, () => carregar())

async function carregar() {
  await store.carregarPaciente(props.id)
  if (auth.usuario && store.pacienteAtual) {
    auditService.registrar({
      usuario: auth.usuario.nome,
      perfil: auth.usuario.perfil,
      acao: 'Acessou prontuário clínico',
      entidade: 'Paciente',
      entidadeId: props.id,
      detalhes: `Prontuário clínico 360° de ${store.pacienteAtual.nome} visualizado.`,
    })
  }
}

const paciente = computed(() => store.pacienteAtual)
const atendimento = computed(() => store.atendimentoAtual)

const tabs = computed(() => [
  { key: `/pacientes/${props.id}`, label: 'Visão geral' },
  { key: `/pacientes/${props.id}/atendimento`, label: 'Atendimento atual' },
  { key: `/pacientes/${props.id}/triagem`, label: 'Triagem' },
  { key: `/pacientes/${props.id}/evolucoes`, label: 'Evoluções' },
  { key: `/pacientes/${props.id}/exames`, label: 'Exames', badge: atendimento.value?.exames.filter(e => e.status === 'resultado_critico').length || undefined },
  { key: `/pacientes/${props.id}/prescricoes`, label: 'Prescrições' },
  { key: `/pacientes/${props.id}/medicamentos`, label: 'Medicamentos' },
  { key: `/pacientes/${props.id}/documentos`, label: 'Documentos' },
  { key: `/pacientes/${props.id}/internacao`, label: 'Internação/Leito' },
  { key: `/pacientes/${props.id}/historico`, label: 'Histórico' },
])

const abaAtiva = computed({
  get: () => route.path,
  set: (v: string) => router.push(v),
})

</script>

<template>
  <div v-if="paciente" class="pac">
    <button class="pac__back" @click="router.push('/pacientes')"><ArrowLeft :size="14" /> Voltar para pacientes</button>

    <header class="pac__header">
      <div class="pac__identity">
        <UiAvatar :nome="paciente.nome" :size="64" />
        <div class="pac__identity-text">
          <h1 class="pac__name">{{ paciente.nome }}</h1>
          <p class="pac__meta">
            {{ paciente.sexo }} · {{ calcularIdade(paciente.dataNascimento) }} anos
            (nasc. {{ formatarData(paciente.dataNascimento) }}) · CPF {{ paciente.cpf }}
          </p>
          <p class="pac__meta">
            Prontuário <strong class="mono-num">{{ paciente.numeroProntuario }}</strong> ·
            Cartão SUS <span class="mono-num">{{ paciente.cartaoSus }}</span>
          </p>
        </div>
      </div>

      <div class="pac__status">
        <UiBadge :tone="STATUS_ATENDIMENTO_META[paciente.statusAtual].tone as any">
          {{ STATUS_ATENDIMENTO_META[paciente.statusAtual].label }}
        </UiBadge>
        <div class="pac__status-grid">
          <div v-if="paciente.setorAtual"><span>Setor</span><strong>{{ paciente.setorAtual }}</strong></div>
          <div v-if="paciente.leitoAtual"><span>Leito</span><strong class="mono-num">{{ paciente.leitoAtual }}</strong></div>
          <div v-if="paciente.medicoResponsavel"><span>Responsável</span><strong>{{ paciente.medicoResponsavel }}</strong></div>
          <div v-if="paciente.entradaEm"><span>Entrada</span><strong>{{ formatarDataHora(paciente.entradaEm) }}</strong></div>
        </div>
      </div>
    </header>

    <PatientAlertBanner :paciente="paciente" />

    <button class="pac__resumo-toggle" :aria-expanded="resumoAberto" @click="resumoAberto = !resumoAberto">
      Resumo clínico rápido
      <ChevronDown :size="16" :class="{ 'is-rotated': resumoAberto }" />
    </button>

    <div class="pac__body">
      <div class="pac__main">
        <UiTabs v-model="abaAtiva" :tabs="tabs" />
        <div class="pac__content">
          <RouterView :paciente="paciente" :atendimento="atendimento" />
        </div>
      </div>

      <aside class="pac__sidebar" :class="{ 'is-open': resumoAberto }">
        <ResumoClinicoPanel :resumo="paciente.resumoClinico" />
      </aside>
    </div>
  </div>
  <div v-else class="pac__loading">Carregando prontuário...</div>
</template>

<style scoped>
.pac { display: flex; flex-direction: column; gap: var(--space-4); }
.pac__loading { padding: var(--space-8); text-align: center; color: var(--color-ink-soft); }

.pac__back {
  align-self: flex-start;
  display: flex; align-items: center; gap: 6px;
  background: none; border: none; cursor: pointer;
  color: var(--color-ink-soft); font-size: 12.5px; font-weight: 600;
  padding: 6px 0;
}
.pac__back:hover { color: var(--color-primary); }

.pac__header {
  background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg);
  padding: var(--space-5);
  display: flex; justify-content: space-between; gap: var(--space-5); flex-wrap: wrap;
}
.pac__identity { display: flex; gap: var(--space-4); min-width: 0; }
.pac__name { font-size: 22px; }
.pac__meta { font-size: 12.5px; color: var(--color-ink-soft); margin-top: 4px; }
.pac__meta strong { color: var(--color-ink); font-weight: 600; }

.pac__status { display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-3); }
.pac__status-grid { display: grid; grid-template-columns: repeat(2, auto); gap: 4px 20px; text-align: right; }
.pac__status-grid div { display: flex; flex-direction: column; }
.pac__status-grid span { font-size: 10.5px; color: var(--color-ink-faint); text-transform: uppercase; letter-spacing: 0.04em; }
.pac__status-grid strong { font-size: 12.5px; font-weight: 600; }

.pac__alerts { display: flex; flex-wrap: wrap; gap: 8px; }
.pac__alert {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 12px; border-radius: 100px; font-size: 12px; font-weight: 600;
}
.pac__alert.is-critical { background: var(--color-critical-soft); color: var(--color-critical); }
.pac__alert.is-warning { background: var(--color-warning-soft); color: var(--color-warning); }
.pac__alert.is-info { background: var(--color-info-soft); color: var(--color-info); }
.pac__alert.is-neutral { background: #EEF1F4; color: var(--color-ink-soft); }

.pac__resumo-toggle { display: none; }

.pac__body { display: grid; grid-template-columns: 1fr 320px; gap: var(--space-4); align-items: start; }
.pac__main { min-width: 0; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }
.pac__content { padding: var(--space-5); }
.pac__sidebar { position: sticky; top: calc(var(--header-height) + 12px); }

@media (max-width: 1100px) {
  .pac__body { grid-template-columns: 1fr; }
  .pac__resumo-toggle {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md);
    padding: 12px 16px; font-weight: 600; font-size: 13.5px; cursor: pointer; color: var(--color-primary-dark);
    min-height: 44px;
  }
  .pac__resumo-toggle svg { transition: transform 0.15s ease; }
  .pac__resumo-toggle svg.is-rotated { transform: rotate(180deg); }
  .pac__sidebar { display: none; }
  .pac__sidebar.is-open { display: block; }
}

@media (max-width: 639px) {
  .pac__header { flex-direction: column; }
  .pac__status { align-items: flex-start; }
  .pac__status-grid { text-align: left; }
  .pac__content { padding: var(--space-3); }
}
</style>
