<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { usePacienteStore } from '@/stores/paciente'
import { usePermissions } from '@/composables/usePermissions'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiButton from '@/components/ui/UiButton.vue'
import AccessDenied from '@/components/shared/AccessDenied.vue'
import { STATUS_ATENDIMENTO_META, TIPO_ATENDIMENTO_META, EVENTOS_ADMINISTRATIVOS, DESCRICAO_ADMINISTRATIVA } from '@/composables/useClinicalMeta'
import { calcularIdade, formatarData, formatarDataHora } from '@/utils/formatters'
import { cpfMascarado, susMascarado } from '@/utils/mask'
import { useAuthStore } from '@/stores/auth'
import { auditService } from '@/services/auditService'

const props = defineProps<{ id: string }>()
const router = useRouter()
const store = usePacienteStore()
const auth = useAuthStore()
const { can } = usePermissions()

onMounted(async () => {
  await store.carregarPaciente(props.id)
  if (auth.usuario && store.pacienteAtual) {
    auditService.registrar({
      usuario: auth.usuario.nome,
      perfil: auth.usuario.perfil,
      acao: 'Acessou dados básicos do paciente',
      entidade: 'Paciente',
      entidadeId: props.id,
      detalhes: `Visão administrativa básica de ${store.pacienteAtual.nome} visualizada (sem dados clínicos).`,
    })
  }
})

const paciente = computed(() => store.pacienteAtual)
const atendimento = computed(() => store.atendimentoAtual)

const eventosPermitidos = computed(() => {
  const eventos = atendimento.value?.timeline.filter((e) => EVENTOS_ADMINISTRATIVOS.includes(e.tipo)) ?? []
  return [...eventos].sort((a, b) => `${a.data}T${a.hora}`.localeCompare(`${b.data}T${b.hora}`))
})
</script>

<template>
  <div v-if="paciente" class="basica">
    <button class="basica__back" @click="router.push('/pacientes')"><ArrowLeft :size="14" /> Voltar para pacientes</button>

    <header class="basica__header">
      <div class="basica__identity">
        <UiAvatar :nome="paciente.nome" :size="60" />
        <div>
          <h1 class="basica__name">{{ paciente.nome }}</h1>
          <p v-if="paciente.nomeSocial" class="basica__meta">Nome social: {{ paciente.nomeSocial }}</p>
          <p class="basica__meta">
            {{ paciente.sexo }} · {{ calcularIdade(paciente.dataNascimento) }} anos ·
            nasc. {{ formatarData(paciente.dataNascimento) }}
          </p>
          <p class="basica__meta mono-num">
            CPF {{ cpfMascarado(paciente.cpf) }} · SUS {{ susMascarado(paciente.cartaoSus) }} ·
            Prontuário {{ paciente.numeroProntuario }}
          </p>
        </div>
      </div>
      <UiBadge :tone="STATUS_ATENDIMENTO_META[paciente.statusAtual].tone as any">
        {{ STATUS_ATENDIMENTO_META[paciente.statusAtual].label }}
      </UiBadge>
    </header>

    <UiCard title="Dados do atendimento" subtitle="Informações administrativas — visão básica do paciente">
      <dl class="basica-dl">
        <div v-if="atendimento"><dt>Nº do atendimento</dt><dd class="mono-num">{{ atendimento.numero }}</dd></div>
        <div v-if="atendimento"><dt>Tipo de atendimento</dt><dd>{{ TIPO_ATENDIMENTO_META[atendimento.tipo].label }}</dd></div>
        <div><dt>Setor</dt><dd>{{ paciente.setorAtual ?? '—' }}</dd></div>
        <div v-if="paciente.leitoAtual"><dt>Leito</dt><dd class="mono-num">{{ paciente.leitoAtual }}</dd></div>
        <div v-if="paciente.entradaEm"><dt>Data/hora de entrada</dt><dd>{{ formatarDataHora(paciente.entradaEm) }}</dd></div>
      </dl>
    </UiCard>

    <UiCard title="Linha do tempo" subtitle="Eventos administrativos e operacionais do atendimento">
      <ol v-if="eventosPermitidos.length" class="basica-timeline">
        <li v-for="ev in eventosPermitidos" :key="ev.id">
          <span class="basica-timeline__time mono-num">{{ ev.hora }}</span>
          <span class="basica-timeline__desc">{{ DESCRICAO_ADMINISTRATIVA[ev.tipo] }}</span>
        </li>
      </ol>
      <p v-else class="basica-empty">Nenhum evento administrativo registrado até o momento.</p>
    </UiCard>

    <AccessDenied
      v-if="!can('clinical.record.view')"
      recurso="o prontuário clínico deste paciente"
      descricao="Dados clínicos (alergias, diagnósticos, sinais vitais, prescrições e evoluções) são visíveis somente para a equipe assistencial autorizada."
    />

    <div class="basica__actions">
      <UiButton v-if="can('paciente.editar')" variant="secondary" @click="router.push(`/pacientes/${paciente.id}/editar`)">Editar cadastro</UiButton>
      <UiButton v-if="can('atendimento.abrir')" @click="router.push(`/pacientes/${paciente.id}/atendimento/novo`)">Novo atendimento</UiButton>
    </div>
  </div>
  <p v-else class="basica-loading">Carregando dados do paciente...</p>
</template>

<style scoped>
.basica { display: flex; flex-direction: column; gap: var(--space-4); max-width: 780px; }
.basica-loading { padding: var(--space-8); text-align: center; color: var(--color-ink-soft); }

.basica__back {
  align-self: flex-start; display: flex; align-items: center; gap: 6px;
  background: none; border: none; cursor: pointer; color: var(--color-ink-soft);
  font-size: 12.5px; font-weight: 600; padding: 6px 0;
}
.basica__back:hover { color: var(--color-primary); }

.basica__header {
  background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg);
  padding: var(--space-5); display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap;
}
.basica__identity { display: flex; gap: var(--space-4); }
.basica__name { font-size: 20px; }
.basica__meta { font-size: 12.5px; color: var(--color-ink-soft); margin-top: 4px; }

.basica-dl { display: flex; flex-direction: column; gap: var(--space-3); }
.basica-dl dt { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-ink-faint); font-weight: 700; margin-bottom: 3px; }
.basica-dl dd { font-size: 13.5px; }

.basica-timeline { display: flex; flex-direction: column; gap: 10px; }
.basica-timeline li { display: flex; align-items: baseline; gap: 12px; padding-bottom: 10px; border-bottom: 1px solid var(--color-border); }
.basica-timeline li:last-child { border-bottom: none; padding-bottom: 0; }
.basica-timeline__time { font-size: 12.5px; color: var(--color-ink-soft); flex-shrink: 0; width: 44px; }
.basica-timeline__desc { font-size: 13.5px; }
.basica-empty { font-size: 12.5px; color: var(--color-ink-faint); }

.basica__actions { display: flex; gap: var(--space-3); flex-wrap: wrap; }

@media (max-width: 639px) {
  .basica__header { flex-direction: column; }
}
</style>
