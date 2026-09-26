<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { Loader2, MapPin } from 'lucide-vue-next'
import FormSection from '@/components/form/FormSection.vue'
import FormField from '@/components/form/FormField.vue'
import UiButton from '@/components/ui/UiButton.vue'
import MobileActionBar from '@/components/ui/MobileActionBar.vue'
import { maskCep, maskCpf, maskCartaoSus, maskRg, maskTelefone } from '@/utils/mask'
import { buscarCep } from '@/mock/ceps'
import type { Paciente, Sexo } from '@/types'

const props = defineProps<{ paciente?: Paciente | null; salvando?: boolean }>()
const emit = defineEmits<{ save: [payload: FormPayload]; cancel: [] }>()

export interface FormPayload {
  nome: string; nomeSocial: string; dataNascimento: string; sexo: Sexo; cpf: string; cartaoSus: string
  rg: string; estadoCivil: string; nacionalidade: string; naturalidade: string; profissao: string
  telefone: string; telefoneSecundario: string; email: string
  contatoEmergenciaNome: string; contatoEmergenciaTelefone: string; contatoEmergenciaParentesco: string
  cep: string; logradouro: string; numero: string; complemento: string; bairro: string; cidade: string; estado: string
  alergiasConhecidas: string; medicamentosEmUso: string; doencasCronicas: string; comorbidades: string; observacoesImportantes: string
  responsavelNome: string; responsavelCpf: string; responsavelParentesco: string; responsavelTelefone: string
  consentimentoAtendimento: boolean; consentimentoDados: boolean; consentimentoTermo: boolean
}

function estadoInicial(): FormPayload {
  const p = props.paciente
  return {
    nome: p?.nome ?? '', nomeSocial: p?.nomeSocial ?? '', dataNascimento: p?.dataNascimento ?? '',
    sexo: p?.sexo ?? 'Feminino', cpf: p?.cpf ?? '', cartaoSus: p?.cartaoSus ?? '',
    rg: p?.rg ?? '', estadoCivil: p?.estadoCivil ?? '', nacionalidade: p?.nacionalidade ?? 'Brasileira',
    naturalidade: p?.naturalidade ?? '', profissao: p?.profissao ?? '',
    telefone: p?.telefone ?? '', telefoneSecundario: p?.telefoneSecundario ?? '', email: p?.email ?? '',
    contatoEmergenciaNome: p?.contatoEmergencia?.nome ?? '', contatoEmergenciaTelefone: p?.contatoEmergencia?.telefone ?? '',
    contatoEmergenciaParentesco: p?.contatoEmergencia?.parentesco ?? '',
    cep: p?.enderecoDetalhado?.cep ?? '', logradouro: p?.enderecoDetalhado?.logradouro ?? '',
    numero: p?.enderecoDetalhado?.numero ?? '', complemento: p?.enderecoDetalhado?.complemento ?? '',
    bairro: p?.enderecoDetalhado?.bairro ?? '', cidade: p?.enderecoDetalhado?.cidade ?? '', estado: p?.enderecoDetalhado?.estado ?? '',
    alergiasConhecidas: p?.resumoClinico.alergias.map((a) => a.substancia).join(', ') ?? '',
    medicamentosEmUso: p?.resumoClinico.medicamentosEmUso.map((m) => `${m.nome} ${m.dose}`).join(', ') ?? '',
    doencasCronicas: p?.resumoClinico.comorbidades.map((c) => c.nome).join(', ') ?? '',
    comorbidades: '',
    observacoesImportantes: p?.resumoClinico.observacoesImportantes ?? '',
    responsavelNome: p?.responsavel?.nome ?? '', responsavelCpf: p?.responsavel?.cpf ?? '',
    responsavelParentesco: p?.responsavel?.parentesco ?? '', responsavelTelefone: p?.responsavel?.telefone ?? '',
    consentimentoAtendimento: p?.consentimentos?.atendimento ?? false,
    consentimentoDados: p?.consentimentos?.tratamentoDados ?? false,
    consentimentoTermo: p?.consentimentos?.termoAutorizacao ?? false,
  }
}

const form = reactive<FormPayload>(estadoInicial())
watch(() => props.paciente, () => Object.assign(form, estadoInicial()))

const erros = reactive<Partial<Record<keyof FormPayload, string>>>({})
const tentouSalvar = ref(false)
const buscandoCep = ref(false)
const cepEncontrado = ref<boolean | null>(null)

function aplicarMascara(campo: 'cpf' | 'cartaoSus' | 'rg' | 'telefone' | 'telefoneSecundario' | 'contatoEmergenciaTelefone' | 'responsavelTelefone' | 'responsavelCpf' | 'cep') {
  if (campo === 'cpf' || campo === 'responsavelCpf') form[campo] = maskCpf(form[campo])
  else if (campo === 'cartaoSus') form.cartaoSus = maskCartaoSus(form.cartaoSus)
  else if (campo === 'rg') form.rg = maskRg(form.rg)
  else if (campo === 'cep') form.cep = maskCep(form.cep)
  else form[campo] = maskTelefone(form[campo])
}

async function onCepBlur() {
  const limpo = form.cep.replace(/\D/g, '')
  if (limpo.length !== 8) { cepEncontrado.value = null; return }
  buscandoCep.value = true
  const resultado = await buscarCep(form.cep)
  buscandoCep.value = false
  if (resultado) {
    form.logradouro = resultado.logradouro
    form.bairro = resultado.bairro
    form.cidade = resultado.cidade
    form.estado = resultado.estado
    cepEncontrado.value = true
  } else {
    cepEncontrado.value = false
  }
}

function validar(): boolean {
  Object.keys(erros).forEach((k) => delete erros[k as keyof FormPayload])
  if (!form.nome.trim()) erros.nome = 'Informe o nome completo do paciente.'
  if (!form.dataNascimento) erros.dataNascimento = 'Informe a data de nascimento.'
  if (form.cpf.replace(/\D/g, '').length !== 11) erros.cpf = 'CPF inválido. Utilize o formato 000.000.000-00.'
  if (form.cartaoSus.replace(/\D/g, '').length !== 15) erros.cartaoSus = 'Cartão SUS deve ter 15 dígitos.'
  if (form.telefone.replace(/\D/g, '').length < 10) erros.telefone = 'Informe um telefone válido com DDD.'
  return Object.keys(erros).length === 0
}

function salvar() {
  tentouSalvar.value = true
  if (!validar()) {
    const primeiroErro = document.querySelector('.field.has-error')
    primeiroErro?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
  emit('save', { ...form })
}
</script>

<template>
  <form class="patient-form" novalidate @submit.prevent="salvar">
    <FormSection title="Identificação" description="Dados usados para localizar o paciente em atendimentos futuros." :columns="3">
      <FormField label="Nome completo" required :error="tentouSalvar ? erros.nome : undefined" :span="2">
        <input v-model="form.nome" type="text" autocomplete="name" placeholder="Nome completo do paciente" />
      </FormField>
      <FormField label="Nome social">
        <input v-model="form.nomeSocial" type="text" placeholder="Se houver" />
      </FormField>
      <FormField label="Data de nascimento" required :error="tentouSalvar ? erros.dataNascimento : undefined">
        <input v-model="form.dataNascimento" type="date" />
      </FormField>
      <FormField label="Sexo" required>
        <select v-model="form.sexo">
          <option value="Feminino">Feminino</option>
          <option value="Masculino">Masculino</option>
        </select>
      </FormField>
      <FormField label="CPF" required :error="tentouSalvar ? erros.cpf : undefined">
        <input :value="form.cpf" type="text" inputmode="numeric" placeholder="000.000.000-00" @input="(e) => { form.cpf = (e.target as HTMLInputElement).value; aplicarMascara('cpf') }" />
      </FormField>
      <FormField label="Cartão SUS" required :error="tentouSalvar ? erros.cartaoSus : undefined">
        <input :value="form.cartaoSus" type="text" inputmode="numeric" placeholder="000 0000 0000 0000" @input="(e) => { form.cartaoSus = (e.target as HTMLInputElement).value; aplicarMascara('cartaoSus') }" />
      </FormField>
      <FormField label="RG">
        <input :value="form.rg" type="text" placeholder="00.000.000-0" @input="(e) => { form.rg = (e.target as HTMLInputElement).value; aplicarMascara('rg') }" />
      </FormField>
      <FormField label="Estado civil">
        <select v-model="form.estadoCivil">
          <option value="">Não informado</option>
          <option>Solteiro(a)</option>
          <option>Casado(a)</option>
          <option>União estável</option>
          <option>Divorciado(a)</option>
          <option>Viúvo(a)</option>
        </select>
      </FormField>
      <FormField label="Nacionalidade">
        <input v-model="form.nacionalidade" type="text" />
      </FormField>
      <FormField label="Naturalidade">
        <input v-model="form.naturalidade" type="text" placeholder="Cidade/UF" />
      </FormField>
      <FormField label="Profissão">
        <input v-model="form.profissao" type="text" />
      </FormField>
    </FormSection>

    <FormSection title="Contato" description="Telefones, e-mail e contato de emergência." :columns="3">
      <FormField label="Telefone principal" required :error="tentouSalvar ? erros.telefone : undefined">
        <input :value="form.telefone" type="tel" inputmode="tel" placeholder="(00) 00000-0000" @input="(e) => { form.telefone = (e.target as HTMLInputElement).value; aplicarMascara('telefone') }" />
      </FormField>
      <FormField label="Telefone secundário">
        <input :value="form.telefoneSecundario" type="tel" inputmode="tel" placeholder="(00) 00000-0000" @input="(e) => { form.telefoneSecundario = (e.target as HTMLInputElement).value; aplicarMascara('telefoneSecundario') }" />
      </FormField>
      <FormField label="E-mail">
        <input v-model="form.email" type="email" placeholder="paciente@email.com" />
      </FormField>
      <FormField label="Contato de emergência">
        <input v-model="form.contatoEmergenciaNome" type="text" placeholder="Nome completo" />
      </FormField>
      <FormField label="Telefone do contato">
        <input :value="form.contatoEmergenciaTelefone" type="tel" inputmode="tel" placeholder="(00) 00000-0000" @input="(e) => { form.contatoEmergenciaTelefone = (e.target as HTMLInputElement).value; aplicarMascara('contatoEmergenciaTelefone') }" />
      </FormField>
      <FormField label="Grau de parentesco">
        <input v-model="form.contatoEmergenciaParentesco" type="text" placeholder="Ex.: Filho(a), cônjuge" />
      </FormField>
    </FormSection>

    <FormSection title="Endereço" description="Informe o CEP para preencher automaticamente o restante do endereço." :columns="3">
      <FormField label="CEP" hint="Simulação de busca automática (protótipo)">
        <div class="cep-wrap">
          <input :value="form.cep" type="text" inputmode="numeric" placeholder="00000-000" @input="(e) => { form.cep = (e.target as HTMLInputElement).value; aplicarMascara('cep') }" @blur="onCepBlur" />
          <Loader2 v-if="buscandoCep" :size="16" class="cep-wrap__spin" />
          <MapPin v-else-if="cepEncontrado" :size="16" class="cep-wrap__ok" />
        </div>
      </FormField>
      <FormField label="Logradouro" :span="2">
        <input v-model="form.logradouro" type="text" />
      </FormField>
      <FormField label="Número">
        <input v-model="form.numero" type="text" inputmode="numeric" />
      </FormField>
      <FormField label="Complemento">
        <input v-model="form.complemento" type="text" placeholder="Apto, bloco..." />
      </FormField>
      <FormField label="Bairro">
        <input v-model="form.bairro" type="text" />
      </FormField>
      <FormField label="Cidade">
        <input v-model="form.cidade" type="text" />
      </FormField>
      <FormField label="Estado">
        <input v-model="form.estado" type="text" maxlength="2" placeholder="UF" />
      </FormField>
    </FormSection>

    <FormSection
      title="Informações clínicas iniciais"
      description="Estas informações passam a compor o prontuário clínico do paciente e possuem maior sensibilidade."
      sensitive
    >
      <FormField label="Alergias conhecidas" :span="2" hint="Separe por vírgula">
        <textarea v-model="form.alergiasConhecidas" rows="2" placeholder="Ex.: Dipirona, frutos do mar" />
      </FormField>
      <FormField label="Medicamentos em uso" :span="2" hint="Separe por vírgula">
        <textarea v-model="form.medicamentosEmUso" rows="2" placeholder="Ex.: Losartana 50mg, Metformina 850mg" />
      </FormField>
      <FormField label="Doenças crônicas / comorbidades" :span="2" hint="Separe por vírgula">
        <textarea v-model="form.doencasCronicas" rows="2" placeholder="Ex.: Hipertensão, Diabetes tipo 2" />
      </FormField>
      <FormField label="Observações importantes" :span="2">
        <textarea v-model="form.observacoesImportantes" rows="3" placeholder="Informações relevantes para a equipe assistencial" />
      </FormField>
    </FormSection>

    <FormSection title="Responsável" description="Preencher quando aplicável (menores de idade, dependência ou tutela).">
      <FormField label="Nome do responsável">
        <input v-model="form.responsavelNome" type="text" />
      </FormField>
      <FormField label="CPF do responsável">
        <input :value="form.responsavelCpf" type="text" inputmode="numeric" placeholder="000.000.000-00" @input="(e) => { form.responsavelCpf = (e.target as HTMLInputElement).value; aplicarMascara('responsavelCpf') }" />
      </FormField>
      <FormField label="Grau de parentesco">
        <input v-model="form.responsavelParentesco" type="text" />
      </FormField>
      <FormField label="Telefone">
        <input :value="form.responsavelTelefone" type="tel" inputmode="tel" placeholder="(00) 00000-0000" @input="(e) => { form.responsavelTelefone = (e.target as HTMLInputElement).value; aplicarMascara('responsavelTelefone') }" />
      </FormField>
    </FormSection>

    <FormSection title="Consentimentos" description="Representação visual simplificada para fins de protótipo — não constitui documento legal." :columns="1">
      <label class="consent-row">
        <input v-model="form.consentimentoAtendimento" type="checkbox" />
        <span>Paciente (ou responsável) consente com a realização do atendimento nesta unidade de saúde.</span>
      </label>
      <label class="consent-row">
        <input v-model="form.consentimentoDados" type="checkbox" />
        <span>Paciente está ciente do tratamento de dados pessoais e clínicos para fins assistenciais.</span>
      </label>
      <label class="consent-row">
        <input v-model="form.consentimentoTermo" type="checkbox" />
        <span>Termo de autorização/atendimento aplicável foi apresentado e compreendido.</span>
      </label>
    </FormSection>

    <div class="patient-form__actions">
      <UiButton type="button" variant="ghost" @click="emit('cancel')">Cancelar</UiButton>
      <UiButton type="submit" :disabled="salvando">{{ salvando ? 'Salvando...' : 'Salvar paciente' }}</UiButton>
    </div>

    <MobileActionBar>
      <UiButton type="button" variant="secondary" @click="emit('cancel')">Cancelar</UiButton>
      <UiButton type="submit" :disabled="salvando" @click="salvar">{{ salvando ? 'Salvando...' : 'Salvar' }}</UiButton>
    </MobileActionBar>
  </form>
</template>

<style scoped>
.patient-form { display: flex; flex-direction: column; gap: var(--space-4); padding-bottom: var(--space-6); }

.cep-wrap { position: relative; }
.cep-wrap input { padding-right: 36px; }
.cep-wrap__spin { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--color-primary); animation: spin 0.8s linear infinite; }
.cep-wrap__ok { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--color-success); }
@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }

.consent-row {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-sm);
  font-size: 13px; color: var(--color-ink-soft); cursor: pointer;
}
.consent-row input { width: 18px; height: 18px; margin-top: 2px; flex-shrink: 0; accent-color: var(--color-primary); }
.consent-row + .consent-row { margin-top: 8px; }

.patient-form__actions { display: flex; justify-content: flex-end; gap: var(--space-3); }

@media (max-width: 767px) {
  .patient-form__actions { display: none; }
}
</style>
