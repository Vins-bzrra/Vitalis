<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, X } from 'lucide-vue-next'
import { usePacienteStore } from '@/stores/paciente'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { STATUS_ATENDIMENTO_META } from '@/composables/useClinicalMeta'
import { calcularIdade } from '@/utils/formatters'
import { rotaProntuario } from '@/utils/patientAccess'

const emit = defineEmits<{ close: [] }>()
const store = usePacienteStore()
const router = useRouter()
const termo = ref('')
let debounceTimer: ReturnType<typeof setTimeout>

watch(termo, (valor) => {
  clearTimeout(debounceTimer)
  if (!valor.trim()) { store.limparBusca(); return }
  debounceTimer = setTimeout(() => store.buscar(valor), 200)
})

function selecionar(id: string) {
  router.push(rotaProntuario(id))
  termo.value = ''
  store.limparBusca()
  emit('close')
}
</script>

<template>
  <div class="global-search">
    <div class="global-search__box">
      <Search :size="18" class="global-search__icon" />
      <input
        v-model="termo"
        type="search"
        placeholder="Buscar por nome, CPF, prontuário, cartão SUS, leito..."
        autofocus
        class="global-search__input"
      >
      <button class="global-search__close" aria-label="Fechar busca" @click="emit('close')"><X :size="18" /></button>
    </div>

    <div v-if="termo.trim()" class="global-search__results">
      <p v-if="store.buscando" class="global-search__hint">Buscando...</p>
      <template v-else-if="store.resultadosBusca.length">
        <button
          v-for="p in store.resultadosBusca"
          :key="p.id"
          class="global-search__result"
          @click="selecionar(p.id)"
        >
          <UiAvatar :nome="p.nome" :size="38" />
          <div class="global-search__result-info">
            <span class="global-search__result-name">{{ p.nome }}</span>
            <span class="global-search__result-meta">
              {{ calcularIdade(p.dataNascimento) }} anos · Prontuário {{ p.numeroProntuario }}
              <template v-if="p.leitoAtual"> · Leito {{ p.leitoAtual }}</template>
            </span>
          </div>
          <UiBadge :tone="STATUS_ATENDIMENTO_META[p.statusAtual].tone as any" size="sm">
            {{ STATUS_ATENDIMENTO_META[p.statusAtual].label }}
          </UiBadge>
        </button>
      </template>
      <p v-else class="global-search__hint">Nenhum paciente encontrado para "{{ termo }}".</p>
    </div>
  </div>
</template>

<style scoped>
.global-search { width: 100%; }
.global-search__box {
  display: flex; align-items: center; gap: 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  padding: 10px 14px;
}
.global-search__icon { color: var(--color-ink-faint); flex-shrink: 0; }
.global-search__input { flex: 1; border: none; outline: none; background: none; font-size: 14px; min-width: 0; }
.global-search__close {
  background: none; border: none; cursor: pointer; color: var(--color-ink-faint);
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px;
  flex-shrink: 0;
}
.global-search__close:hover { background: var(--color-bg); }

.global-search__results {
  margin-top: var(--space-2);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  max-height: 60vh;
  overflow-y: auto;
  box-shadow: var(--shadow-md);
}
.global-search__hint { padding: var(--space-4); font-size: 13px; color: var(--color-ink-soft); }
.global-search__result {
  width: 100%;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px;
  background: none; border: none; border-bottom: 1px solid var(--color-border);
  cursor: pointer; text-align: left;
  min-height: 44px;
}
.global-search__result:last-child { border-bottom: none; }
.global-search__result:hover { background: var(--color-primary-softer); }
.global-search__result-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.global-search__result-name { font-weight: 600; font-size: 13.5px; }
.global-search__result-meta { font-size: 11.5px; color: var(--color-ink-soft); }
</style>
