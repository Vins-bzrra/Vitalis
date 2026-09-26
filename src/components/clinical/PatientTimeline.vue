<script setup lang="ts">
import type { EventoTimeline } from '@/types'
import { TIPO_EVENTO_META } from '@/composables/useClinicalMeta'
import * as icons from 'lucide-vue-next'
import { computed, ref, type Component } from 'vue'

const props = defineProps<{ eventos: EventoTimeline[] }>()
const expandido = ref<string | null>(props.eventos.at(-1)?.id ?? null)

const ordenados = computed(() =>
  [...props.eventos].sort((a, b) => `${a.data}T${a.hora}`.localeCompare(`${b.data}T${b.hora}`))
)

function iconFor(nome: string) {
  const map: Record<string, keyof typeof icons> = {
    'log-in': 'LogIn', stethoscope: 'Stethoscope', flag: 'Flag', 'user-round': 'UserRound',
    'flask-conical': 'FlaskConical', 'clipboard-list': 'ClipboardList', pill: 'Pill',
    'file-text': 'FileText', bed: 'Bed', move: 'Move', 'log-out': 'LogOut', 'hand-heart': 'HeartHandshake',
  }
  return icons[map[nome] ?? 'Circle'] as Component
}

function toggle(id: string) {
  expandido.value = expandido.value === id ? null : id
}
</script>

<template>
  <div class="timeline">
    <div class="timeline__rail" aria-hidden="true" />
    <ol class="timeline__list">
      <li v-for="ev in ordenados" :key="ev.id" class="timeline__item" :class="`is-${ev.tipo}`">
        <button class="timeline__dot" :aria-expanded="expandido === ev.id" @click="toggle(ev.id)">
          <component :is="iconFor(TIPO_EVENTO_META[ev.tipo].icon)" :size="14" />
        </button>
        <div class="timeline__content">
          <button class="timeline__summary" @click="toggle(ev.id)">
            <span class="timeline__type">{{ TIPO_EVENTO_META[ev.tipo].label }}</span>
            <span class="timeline__when mono-num">{{ ev.data.split('-').reverse().join('/') }} · {{ ev.hora }}</span>
          </button>
          <Transition name="expand">
            <div v-if="expandido === ev.id" class="timeline__details">
              <p class="timeline__desc">{{ ev.descricao }}</p>
              <div class="timeline__meta">
                <span>{{ ev.profissional }}</span>
                <span aria-hidden="true">·</span>
                <span>{{ ev.setor }}</span>
              </div>
              <div v-if="ev.documentos?.length" class="timeline__docs">
                <span v-for="d in ev.documentos" :key="d" class="timeline__doc">{{ d }}</span>
              </div>
            </div>
          </Transition>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.timeline { position: relative; padding-left: 4px; }
.timeline__rail {
  position: absolute;
  left: 19px; top: 8px; bottom: 8px;
  width: 2px;
  background: repeating-linear-gradient(to bottom, var(--color-border) 0 6px, transparent 6px 10px);
}
.timeline__list { display: flex; flex-direction: column; gap: var(--space-2); }
.timeline__item { position: relative; display: flex; gap: var(--space-3); }

.timeline__dot {
  position: relative; z-index: 1;
  flex-shrink: 0;
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.is-alta .timeline__dot, .is-internacao .timeline__dot { border-color: var(--color-teal); color: var(--color-teal); }
.is-acolhimento .timeline__dot { border-color: var(--color-success); color: var(--color-success); }
.is-exame .timeline__dot { border-color: var(--color-info); color: var(--color-info); }
.is-prescricao .timeline__dot, .is-medicacao .timeline__dot { border-color: var(--color-warning); color: var(--color-warning); }
.is-transferencia .timeline__dot { border-color: var(--color-critical); color: var(--color-critical); }
.is-classificacao_risco .timeline__dot { border-color: var(--color-risk-3); color: var(--color-risk-3); }

.timeline__content { flex: 1; min-width: 0; padding-bottom: var(--space-3); }
.timeline__summary {
  width: 100%;
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-3);
  background: none; border: none; text-align: left; cursor: pointer;
  padding: 8px 0; min-height: 40px;
}
.timeline__type { font-weight: 600; font-size: 13.5px; }
.timeline__when { font-size: 12px; color: var(--color-ink-soft); flex-shrink: 0; }

.timeline__details {
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  margin-top: 2px;
}
.timeline__desc { font-size: 13px; color: var(--color-ink); }
.timeline__meta { margin-top: 6px; font-size: 12px; color: var(--color-ink-soft); display: flex; gap: 6px; }
.timeline__docs { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; }
.timeline__doc { font-size: 11.5px; background: var(--color-primary-soft); color: var(--color-primary-dark); padding: 3px 8px; border-radius: 6px; }

.expand-enter-active, .expand-leave-active { transition: all 0.15s ease; }
.expand-enter-from, .expand-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
