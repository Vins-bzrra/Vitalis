<script setup lang="ts">
import { computed } from 'vue'
import type { Paciente } from '@/types'
import UiCard from '@/components/ui/UiCard.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import { usePacienteStore } from '@/stores/paciente'

defineProps<{ paciente: Paciente }>()
const store = usePacienteStore()

const porAno = computed(() => {
  const grupos = new Map<number, typeof store.historico>()
  for (const h of store.historico) {
    if (!grupos.has(h.ano)) grupos.set(h.ano, [])
    grupos.get(h.ano)!.push(h)
  }
  return [...grupos.entries()].sort((a, b) => b[0] - a[0])
})
</script>

<template>
  <UiCard title="Histórico do paciente" subtitle="Todos os atendimentos anteriores, em ordem cronológica">
    <template v-if="porAno.length">
      <div v-for="[ano, itens] in porAno" :key="ano" class="ano-group">
        <h4 class="ano-group__title mono-num">{{ ano }}</h4>
        <ul class="ano-group__list">
          <li v-for="item in itens" :key="item.id" class="hist-item">
            <div class="hist-item__dot" />
            <div class="hist-item__body">
              <div class="hist-item__head">
                <strong>{{ item.titulo }}</strong>
                <span class="mono-num">{{ item.data.split('-').reverse().join('/') }}</span>
              </div>
              <p>{{ item.tipo }} · {{ item.setor }} · {{ item.status }}</p>
            </div>
          </li>
        </ul>
      </div>
    </template>
    <UiEmptyState v-else title="Sem atendimentos anteriores registrados" description="Este é o primeiro registro deste paciente na unidade." />
  </UiCard>
</template>

<style scoped>
.ano-group { margin-bottom: var(--space-5); }
.ano-group:last-child { margin-bottom: 0; }
.ano-group__title { font-size: 15px; color: var(--color-primary); margin-bottom: var(--space-3); }
.ano-group__list { display: flex; flex-direction: column; gap: var(--space-3); padding-left: var(--space-2); border-left: 2px solid var(--color-border); }

.hist-item { display: flex; gap: 12px; position: relative; }
.hist-item__dot { width: 10px; height: 10px; border-radius: 50%; background: var(--color-primary); flex-shrink: 0; margin-top: 5px; margin-left: -17px; box-shadow: 0 0 0 3px var(--color-surface); }
.hist-item__body { flex: 1; }
.hist-item__head { display: flex; justify-content: space-between; gap: 10px; }
.hist-item__head strong { font-size: 13.5px; }
.hist-item__head span { font-size: 12px; color: var(--color-ink-soft); }
.hist-item__body p { font-size: 12.5px; color: var(--color-ink-soft); margin-top: 2px; }
</style>
