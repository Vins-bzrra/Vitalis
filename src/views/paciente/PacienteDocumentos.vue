<script setup lang="ts">
import type { Atendimento, Paciente } from '@/types'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import { TIPO_DOCUMENTO_META } from '@/composables/useClinicalMeta'
import { FileText, Download, Printer } from 'lucide-vue-next'

defineProps<{ paciente: Paciente; atendimento: Atendimento | null }>()
</script>

<template>
  <UiCard title="Documentos digitais" subtitle="Atestados, receitas, relatórios, laudos e termos deste atendimento">
    <ul v-if="atendimento?.documentos.length" class="doc-list">
      <li v-for="d in atendimento.documentos" :key="d.id">
        <span class="doc-icon"><FileText :size="16" /></span>
        <div class="doc-info">
          <strong>{{ d.titulo }}</strong>
          <span>{{ TIPO_DOCUMENTO_META[d.tipo].label }} · {{ d.autor }} · {{ d.criadoEm.split('T')[0].split('-').reverse().join('/') }}</span>
        </div>
        <UiBadge :tone="d.assinado ? 'success' : 'warning'" size="sm">{{ d.assinado ? 'Assinado' : 'Pendente de assinatura' }}</UiBadge>
        <div class="doc-actions">
          <UiButton size="sm" variant="ghost"><template #icon><Download :size="14" /></template></UiButton>
          <UiButton size="sm" variant="ghost"><template #icon><Printer :size="14" /></template></UiButton>
        </div>
      </li>
    </ul>
    <UiEmptyState v-else title="Nenhum documento gerado" description="Documentos criados durante o atendimento aparecerão aqui." />
  </UiCard>
</template>

<style scoped>
.doc-list { display: flex; flex-direction: column; gap: 8px; }
.doc-list li { display: flex; align-items: center; gap: 12px; padding: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-md); flex-wrap: wrap; }
.doc-icon { width: 34px; height: 34px; border-radius: 9px; background: var(--color-primary-soft); color: var(--color-primary-dark); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.doc-info { flex: 1; min-width: 160px; display: flex; flex-direction: column; }
.doc-info strong { font-size: 13.5px; }
.doc-info span { font-size: 11.5px; color: var(--color-ink-soft); }
.doc-actions { display: flex; gap: 4px; }
</style>
