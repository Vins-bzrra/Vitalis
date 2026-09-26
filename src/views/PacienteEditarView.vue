<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, CheckCircle2 } from 'lucide-vue-next'
import PatientForm, { type FormPayload } from '@/components/clinical/PatientForm.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { usePacienteStore } from '@/stores/paciente'
import { parseAlergias, parseComorbidades, parseMedicamentos } from '@/utils/clinicalParse'
import { rotaProntuario } from '@/utils/patientAccess'

const props = defineProps<{ id: string }>()
const route = useRoute()
const router = useRouter()
const store = usePacienteStore()

const salvo = ref(false)

onMounted(() => store.carregarPaciente(props.id))

const paciente = computed(() => store.pacienteAtual)

async function salvar(payload: FormPayload) {
  if (!paciente.value) return
  await store.atualizarPaciente(paciente.value.id, {
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
      // Preserva o histórico clínico já existente (problemas, cirurgias, histórico familiar);
      // apenas os campos editáveis no cadastro são atualizados.
      ...paciente.value.resumoClinico,
      alergias: parseAlergias(payload.alergiasConhecidas),
      medicamentosEmUso: parseMedicamentos(payload.medicamentosEmUso),
      comorbidades: parseComorbidades(payload.doencasCronicas),
      observacoesImportantes: payload.observacoesImportantes,
    },
  })
  salvo.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelar() {
  router.push(rotaProntuario(props.id))
}
</script>

<template>
  <div class="editar-paciente">
    <button class="voltar" @click="router.push(rotaProntuario(props.id))"><ArrowLeft :size="14" /> Voltar para o prontuário</button>

    <header class="editar-paciente__header">
      <div>
        <h1>Editar cadastro</h1>
        <p v-if="paciente">Atualize os dados cadastrais de {{ paciente.nome }}. As informações clínicas históricas são preservadas.</p>
      </div>
    </header>

    <div v-if="salvo" class="alerta-sucesso" role="status">
      <CheckCircle2 :size="16" /> Alterações salvas com sucesso.
    </div>

    <PatientForm v-if="paciente" :key="route.fullPath" :paciente="paciente" :salvando="store.salvando" @save="salvar" @cancel="cancelar" />
    <p v-else class="carregando">Carregando dados do paciente...</p>
  </div>
</template>

<style scoped>
.editar-paciente { display: flex; flex-direction: column; gap: var(--space-4); max-width: 1080px; }
.voltar {
  align-self: flex-start; display: flex; align-items: center; gap: 6px;
  background: none; border: none; cursor: pointer; color: var(--color-ink-soft); font-size: 12.5px; font-weight: 600; padding: 6px 0;
}
.voltar:hover { color: var(--color-primary); }
.editar-paciente__header h1 { font-size: 22px; }
.editar-paciente__header p { font-size: 13px; color: var(--color-ink-soft); margin-top: 4px; }
.alerta-sucesso {
  display: flex; align-items: center; gap: 8px;
  background: var(--color-success-soft); color: var(--color-success); font-weight: 600; font-size: 13px;
  padding: 10px 14px; border-radius: var(--radius-md);
}
.carregando { color: var(--color-ink-soft); padding: var(--space-6); text-align: center; }
</style>
