<script setup lang="ts">
import { computed } from 'vue'
import { iniciais } from '@/utils/formatters'

const props = withDefaults(defineProps<{
  nome: string
  size?: number
  tone?: 'primary' | 'neutral'
}>(), { size: 44, tone: 'primary' })

const initials = computed(() => iniciais(props.nome))
</script>

<template>
  <div
    class="ui-avatar"
    :class="`is-${tone}`"
    :style="{ width: `${size}px`, height: `${size}px`, fontSize: `${size * 0.38}px` }"
  >
    {{ initials }}
  </div>
</template>

<style scoped>
.ui-avatar {
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-weight: 600;
  flex-shrink: 0;
}
.is-primary { background: var(--color-primary-soft); color: var(--color-primary-dark); }
.is-neutral { background: #EEF1F4; color: var(--color-ink-soft); }
</style>
