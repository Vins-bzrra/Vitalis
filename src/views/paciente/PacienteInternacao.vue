<script setup lang="ts">
import type { Atendimento, Paciente } from '@/types'
import UiCard from '@/components/ui/UiCard.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { formatarDataHora } from '@/utils/formatters'

defineProps<{ paciente: Paciente; atendimento: Atendimento | null }>()
</script>

<template>
  <div class="internacao">
    <UiCard v-if="atendimento?.internacao" title="Internação atual">
      <dl class="dl">
        <div><dt>Motivo</dt><dd>{{ atendimento.internacao.motivo }}</dd></div>
        <div><dt>Médico responsável</dt><dd>{{ atendimento.internacao.medicoResponsavel }}</dd></div>
        <div><dt>Data de entrada</dt><dd>{{ formatarDataHora(atendimento.internacao.dataEntrada) }}</dd></div>
        <div><dt>Setor / Leito atual</dt><dd>{{ paciente.setorAtual }} · {{ paciente.leitoAtual }}</dd></div>
        <div><dt>Status</dt><dd><UiBadge :tone="atendimento.internacao.status === 'ativa' ? 'teal' : 'neutral'" size="sm">{{ atendimento.internacao.status }}</UiBadge></dd></div>
      </dl>
    </UiCard>
    <UiEmptyState v-else title="Paciente não está internado" description="Não há internação ativa associada a este atendimento." />

    <UiCard title="Histórico de transferências">
      <ul v-if="atendimento?.transferencias.length" class="transf-list">
        <li v-for="t in atendimento.transferencias" :key="t.id">
          <div class="transf-list__route">
            <span>{{ t.origemSetor }}<template v-if="t.origemLeito"> ({{ t.origemLeito }})</template></span>
            <span class="transf-list__arrow">→</span>
            <span>{{ t.destinoSetor }}<template v-if="t.destinoLeito"> ({{ t.destinoLeito }})</template></span>
          </div>
          <p class="transf-list__motivo">{{ t.motivo }}</p>
          <p class="transf-list__meta">{{ t.responsavel }} · {{ t.data.split('-').reverse().join('/') }} às {{ t.hora }}</p>
        </li>
      </ul>
      <UiEmptyState v-else title="Nenhuma transferência registrada" />
    </UiCard>

    <UiCard v-if="atendimento?.alta" title="Documento de alta">
      <dl class="dl">
        <div><dt>Diagnóstico final</dt><dd>{{ atendimento.alta.diagnosticoFinal }}</dd></div>
        <div><dt>Resumo</dt><dd>{{ atendimento.alta.resumoInternacao }}</dd></div>
        <div><dt>Orientações</dt><dd>{{ atendimento.alta.orientacoes }}</dd></div>
        <div><dt>Retorno</dt><dd>{{ atendimento.alta.retorno }}</dd></div>
        <div><dt>Médico responsável</dt><dd>{{ atendimento.alta.medicoResponsavel }}</dd></div>
      </dl>
    </UiCard>
  </div>
</template>

<style scoped>
.internacao { display: flex; flex-direction: column; gap: var(--space-4); }
.dl { display: flex; flex-direction: column; gap: var(--space-3); }
.dl dt { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-ink-faint); font-weight: 700; margin-bottom: 4px; }
.dl dd { font-size: 13.5px; line-height: 1.6; }

.transf-list { display: flex; flex-direction: column; gap: var(--space-3); }
.transf-list li { border-top: 1px solid var(--color-border); padding-top: var(--space-3); }
.transf-list li:first-child { border-top: none; padding-top: 0; }
.transf-list__route { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13.5px; }
.transf-list__arrow { color: var(--color-critical); }
.transf-list__motivo { font-size: 12.5px; color: var(--color-ink-soft); margin-top: 4px; }
.transf-list__meta { font-size: 11.5px; color: var(--color-ink-faint); margin-top: 2px; }
</style>
