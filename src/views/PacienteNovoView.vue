<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle2, ClipboardPlus, FolderOpen, ArrowLeft } from 'lucide-vue-next'
import PatientForm, { type FormPayload } from '@/components/clinical/PatientForm.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { usePacienteStore } from '@/stores/paciente'
import { useAtendimentoFluxoStore } from '@/stores/atendimentoFluxo'
import { parseAlergias, parseComorbidades, parseMedicamentos } from '@/utils/clinicalParse'
import { formatarData } from '@/utils/formatters'
import { rotaProntuario } from '@/utils/patientAccess'
import type { Paciente } from '@/types'

const router = useRouter()
const store = usePacienteStore()
const fluxo = useAtendimentoFluxoStore()

const etapa = ref<'form' | 'sucesso'>('form')
const pacienteCriado = ref<Paciente | null>(null)

function cancelar() {
  router.push('/atendimentos')
}

async function salvar(payload: FormPayload) {
  const paciente = await store.criarPaciente({
    nome: payload.nome,
    nomeSocial: payload.nomeSocial || undefined,
    sexo: payload.sexo,
    dataNascimento: payload.dataNascimento,
    cpf: payload.cpf,
    cartaoSus: payload.cartaoSus,
    rg: payload.rg || undefined,
    estadoCivil: payload.estadoCivil || undefined,
    nacionalidade: payload.nacionalidade || undefined,
    naturalidade: payload.naturalidade || undefined,
    profissao: payload.profissao || undefined,
    telefone: payload.telefone,
    telefoneSecundario: payload.telefoneSecundario || undefined,
    email: payload.email || undefined,
    endereco: [payload.logradouro, payload.numero && `nº ${payload.numero}`, payload.bairro, payload.cidade && `${payload.cidade}/${payload.estado}`]
      .filter(Boolean).join(', '),
    enderecoDetalhado: payload.cep ? {
      cep: payload.cep, logradouro: payload.logradouro, numero: payload.numero, complemento: payload.complemento || undefined,
      bairro: payload.bairro, cidade: payload.cidade, estado: payload.estado,
    } : undefined,
    contatoEmergencia: payload.contatoEmergenciaNome ? {
      nome: payload.contatoEmergenciaNome, telefone: payload.contatoEmergenciaTelefone, parentesco: payload.contatoEmergenciaParentesco,
    } : undefined,
    responsavel: payload.responsavelNome ? {
      nome: payload.responsavelNome, cpf: payload.responsavelCpf, parentesco: payload.responsavelParentesco, telefone: payload.responsavelTelefone,
    } : undefined,
    consentimentos: {
      atendimento: payload.consentimentoAtendimento,
      tratamentoDados: payload.consentimentoDados,
      termoAutorizacao: payload.consentimentoTermo,
    },
    resumoClinico: {
      alergias: parseAlergias(payload.alergiasConhecidas),
      medicamentosEmUso: parseMedicamentos(payload.medicamentosEmUso),
      comorbidades: parseComorbidades(payload.doencasCronicas),
      observacoesImportantes: payload.observacoesImportantes,
      problemasAtivos: [], cirurgiasAnteriores: [], historicoFamiliar: [], historicoSocial: '',
    },
  })
  pacienteCriado.value = paciente
  etapa.value = 'sucesso'
}

function iniciarAtendimento() {
  if (!pacienteCriado.value) return
  fluxo.selecionarPaciente(pacienteCriado.value)
  router.push(`/pacientes/${pacienteCriado.value.id}/atendimento/novo`)
}

function abrirProntuario() {
  if (pacienteCriado.value) router.push(rotaProntuario(pacienteCriado.value.id))
}
</script>

<template>
  <div class="novo-paciente">
    <template v-if="etapa === 'form'">
      <button class="voltar" @click="router.push('/atendimentos')"><ArrowLeft :size="14" /> Voltar para recepção</button>
      <header class="novo-paciente__header">
        <div>
          <h1>Cadastro do paciente</h1>
          <p>Registre os dados de identificação e contato para iniciar o atendimento.</p>
        </div>
      </header>

      <PatientForm :salvando="store.salvando" @save="salvar" @cancel="cancelar" />
    </template>

    <template v-else-if="pacienteCriado">
      <UiCard class="sucesso-card">
        <div class="sucesso-card__icon"><CheckCircle2 :size="36" /></div>
        <h2>Paciente cadastrado com sucesso</h2>
        <p class="sucesso-card__sub">O cadastro foi registrado no prontuário digital da unidade.</p>

        <dl class="sucesso-card__data">
          <div><dt>Nome</dt><dd>{{ pacienteCriado.nome }}</dd></div>
          <div><dt>Prontuário</dt><dd class="mono-num">{{ pacienteCriado.numeroProntuario }}</dd></div>
          <div><dt>Cartão SUS</dt><dd class="mono-num">{{ pacienteCriado.cartaoSus }}</dd></div>
          <div><dt>Data de nascimento</dt><dd>{{ formatarData(pacienteCriado.dataNascimento) }}</dd></div>
        </dl>

        <div class="sucesso-card__actions">
          <UiButton @click="iniciarAtendimento"><template #icon><ClipboardPlus :size="16" /></template> Iniciar atendimento</UiButton>
          <UiButton variant="secondary" @click="abrirProntuario"><template #icon><FolderOpen :size="16" /></template> Abrir prontuário</UiButton>
          <UiButton variant="ghost" @click="router.push('/atendimentos')">Voltar para recepção</UiButton>
        </div>
      </UiCard>
    </template>
  </div>
</template>

<style scoped>
.novo-paciente { display: flex; flex-direction: column; gap: var(--space-4); max-width: 1080px; }
.voltar {
  align-self: flex-start; display: flex; align-items: center; gap: 6px;
  background: none; border: none; cursor: pointer; color: var(--color-ink-soft); font-size: 12.5px; font-weight: 600; padding: 6px 0;
}
.voltar:hover { color: var(--color-primary); }
.novo-paciente__header h1 { font-size: 22px; }
.novo-paciente__header p { font-size: 13px; color: var(--color-ink-soft); margin-top: 4px; }

.sucesso-card { max-width: 520px; margin: var(--space-6) auto; text-align: center; }
.sucesso-card__icon { color: var(--color-success); margin: 0 auto var(--space-3); width: 64px; height: 64px; border-radius: 50%; background: var(--color-success-soft); display: flex; align-items: center; justify-content: center; }
.sucesso-card__sub { font-size: 13px; color: var(--color-ink-soft); margin-top: 4px; }
.sucesso-card__data { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3); text-align: left; margin: var(--space-5) 0; background: var(--color-bg); border-radius: var(--radius-md); padding: var(--space-4); }
.sucesso-card__data dt { font-size: 10.5px; text-transform: uppercase; color: var(--color-ink-faint); font-weight: 700; }
.sucesso-card__data dd { font-size: 13.5px; margin-top: 2px; }
.sucesso-card__actions { display: flex; flex-direction: column; gap: 8px; }

@media (min-width: 480px) {
  .sucesso-card__actions { flex-direction: row; justify-content: center; flex-wrap: wrap; }
}
</style>
