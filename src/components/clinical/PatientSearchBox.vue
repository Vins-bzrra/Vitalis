<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, UserPlus, FolderOpen, PenLine, ClipboardPlus, UserX } from 'lucide-vue-next'
import { usePacienteStore } from '@/stores/paciente'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import { STATUS_ATENDIMENTO_META } from '@/composables/useClinicalMeta'
import { calcularIdade, formatarData } from '@/utils/formatters'
import { cpfMascarado, susMascarado } from '@/utils/mask'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{
  abrir: [id: string]
  'novo-atendimento': [id: string]
  editar: [id: string]
  cadastrar: []
}>()

const store = usePacienteStore()
const auth = useAuthStore()
const termo = ref('')
let debounceTimer: ReturnType<typeof setTimeout>

watch(termo, (valor) => {
  clearTimeout(debounceTimer)
  if (!valor.trim()) { store.limparBusca(); return }
  debounceTimer = setTimeout(() => store.buscar(valor), 220)
})
</script>

<template>
  <div class="patient-search">
    <div class="patient-search__box">
      <Search :size="18" />
      <input
        v-model="termo"
        type="search"
        placeholder="Digite código do paciente, nome, CPF, cartão SUS, data de nascimento ou número do prontuário"
        aria-label="Buscar paciente"
      >
    </div>

    <div v-if="termo.trim()" class="patient-search__results">
      <p v-if="store.buscando" class="patient-search__hint">Buscando pacientes...</p>

      <template v-else-if="store.resultadosBusca.length">
        <article v-for="p in store.resultadosBusca" :key="p.id" class="result-card">
          <UiAvatar :nome="p.nome" :size="48" />
          <div class="result-card__info">
            <strong>{{ p.nome }}</strong>
            <span>{{ p.sexo }} · {{ calcularIdade(p.dataNascimento) }} anos · nasc. {{ formatarData(p.dataNascimento) }}</span>
            <span class="mono-num">CPF {{ cpfMascarado(p.cpf) }} · SUS {{ susMascarado(p.cartaoSus) }}</span>
            <span class="mono-num">Prontuário {{ p.numeroProntuario }}<template v-if="p.ultimoAtendimentoEm"> · Último atendimento {{ formatarData(p.ultimoAtendimentoEm) }}</template></span>
          </div>
          <UiBadge :tone="STATUS_ATENDIMENTO_META[p.statusAtual].tone as any" size="sm">
            {{ STATUS_ATENDIMENTO_META[p.statusAtual].label }}
          </UiBadge>
          <div class="result-card__actions">
            <UiButton size="sm" variant="secondary" @click="emit('abrir', p.id)">
              <template #icon><FolderOpen :size="14" /></template> Abrir prontuário
            </UiButton>
            <UiButton v-if="auth.pode('atendimento.abrir')" size="sm" @click="emit('novo-atendimento', p.id)">
              <template #icon><ClipboardPlus :size="14" /></template> Novo atendimento
            </UiButton>
            <UiButton v-if="auth.pode('paciente.editar')" size="sm" variant="ghost" @click="emit('editar', p.id)">
              <template #icon><PenLine :size="14" /></template> Editar cadastro
            </UiButton>
          </div>
        </article>
      </template>

      <UiEmptyState v-else title="Paciente não encontrado" description="Não localizamos nenhum paciente com esses dados na base da unidade.">
        <template #icon><UserX :size="22" /></template>
        <template v-if="auth.pode('paciente.cadastrar')" #action>
          <UiButton @click="emit('cadastrar')"><template #icon><UserPlus :size="15" /></template> Cadastrar novo paciente</UiButton>
        </template>
      </UiEmptyState>
    </div>
  </div>
</template>

<style scoped>
.patient-search { display: flex; flex-direction: column; gap: var(--space-4); }
.patient-search__box {
  display: flex; align-items: center; gap: 10px;
  background: var(--color-surface); border: 1px solid var(--color-border-strong); border-radius: var(--radius-md);
  padding: 12px 16px; color: var(--color-ink-faint);
}
.patient-search__box:focus-within { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-soft); }
.patient-search__box input { border: none; outline: none; flex: 1; font-size: 14px; background: none; color: var(--color-ink); min-height: 24px; }

.patient-search__hint { font-size: 13px; color: var(--color-ink-soft); padding: var(--space-3) 0; }
.patient-search__results { display: flex; flex-direction: column; gap: var(--space-3); }

.result-card {
  display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
  border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-4);
  background: var(--color-surface);
}
.result-card__info { display: flex; flex-direction: column; flex: 1; min-width: 200px; gap: 2px; }
.result-card__info strong { font-size: 14px; }
.result-card__info span { font-size: 11.5px; color: var(--color-ink-soft); }
.result-card__actions { display: flex; gap: 8px; flex-wrap: wrap; width: 100%; justify-content: flex-end; }

@media (max-width: 639px) {
  .result-card { flex-direction: column; align-items: flex-start; }
  .result-card__actions { justify-content: stretch; }
  .result-card__actions :deep(button) { flex: 1; }
}
</style>
