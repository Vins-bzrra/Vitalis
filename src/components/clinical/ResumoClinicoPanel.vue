<script setup lang="ts">
import type { ResumoClinico } from '@/types'
import UiBadge from '@/components/ui/UiBadge.vue'

defineProps<{ resumo: ResumoClinico }>()
</script>

<template>
  <div class="resumo">
    <section class="resumo__section">
      <h4>Problemas ativos</h4>
      <ul v-if="resumo.problemasAtivos.length" class="resumo__list">
        <li v-for="p in resumo.problemasAtivos" :key="p.id">
          <span class="resumo__item-title">{{ p.nome }}</span>
          <span v-if="p.cid" class="resumo__item-sub mono-num">{{ p.cid }}</span>
        </li>
      </ul>
      <p v-else class="resumo__empty">Nenhum problema ativo registrado.</p>
    </section>

    <section class="resumo__section">
      <h4>Alergias</h4>
      <ul v-if="resumo.alergias.length" class="resumo__list">
        <li v-for="a in resumo.alergias" :key="a.id">
          <span class="resumo__item-title">{{ a.substancia }}</span>
          <UiBadge :tone="a.gravidade === 'grave' ? 'critical' : a.gravidade === 'moderada' ? 'warning' : 'neutral'" size="sm">{{ a.gravidade }}</UiBadge>
        </li>
      </ul>
      <p v-else class="resumo__empty">Nenhuma alergia conhecida.</p>
    </section>

    <section class="resumo__section">
      <h4>Comorbidades</h4>
      <ul v-if="resumo.comorbidades.length" class="resumo__list resumo__list--plain">
        <li v-for="c in resumo.comorbidades" :key="c.id">{{ c.nome }}<span v-if="c.desde" class="resumo__item-sub"> — desde {{ c.desde }}</span></li>
      </ul>
      <p v-else class="resumo__empty">Sem comorbidades registradas.</p>
    </section>

    <section class="resumo__section">
      <h4>Medicamentos em uso</h4>
      <ul v-if="resumo.medicamentosEmUso.length" class="resumo__list">
        <li v-for="m in resumo.medicamentosEmUso" :key="m.id">
          <span class="resumo__item-title">{{ m.nome }} {{ m.dose }}</span>
          <span class="resumo__item-sub">{{ m.frequencia }}</span>
        </li>
      </ul>
      <p v-else class="resumo__empty">Nenhum medicamento contínuo.</p>
    </section>

    <section v-if="resumo.cirurgiasAnteriores.length" class="resumo__section">
      <h4>Cirurgias anteriores</h4>
      <ul class="resumo__list resumo__list--plain">
        <li v-for="c in resumo.cirurgiasAnteriores" :key="c.id">{{ c.nome }} — {{ c.data }}</li>
      </ul>
    </section>

    <section v-if="resumo.historicoFamiliar.length" class="resumo__section">
      <h4>Histórico familiar</h4>
      <ul class="resumo__list resumo__list--plain">
        <li v-for="h in resumo.historicoFamiliar" :key="h.id">{{ h.parentesco }}: {{ h.condicao }}</li>
      </ul>
    </section>

    <section v-if="resumo.historicoSocial" class="resumo__section">
      <h4>Histórico social</h4>
      <p class="resumo__text">{{ resumo.historicoSocial }}</p>
    </section>

    <section v-if="resumo.observacoesImportantes" class="resumo__section resumo__section--highlight">
      <h4>Observações importantes</h4>
      <p class="resumo__text">{{ resumo.observacoesImportantes }}</p>
    </section>
  </div>
</template>

<style scoped>
.resumo {
  background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg);
  padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-4);
  max-height: calc(100vh - var(--header-height) - 24px);
  overflow-y: auto;
}
.resumo__section h4 {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-ink-faint);
  margin-bottom: 8px; font-family: var(--font-sans); font-weight: 700;
}
.resumo__section--highlight { background: var(--color-warning-soft); border-radius: var(--radius-md); padding: 10px 12px; margin: 0 -4px; }
.resumo__section--highlight h4 { color: var(--color-warning); }

.resumo__list { display: flex; flex-direction: column; gap: 8px; }
.resumo__list li { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; }
.resumo__list--plain li { display: block; font-size: 12.5px; color: var(--color-ink-soft); }
.resumo__item-title { font-weight: 600; }
.resumo__item-sub { font-size: 11.5px; color: var(--color-ink-soft); flex-shrink: 0; }
.resumo__empty { font-size: 12.5px; color: var(--color-ink-faint); }
.resumo__text { font-size: 12.5px; color: var(--color-ink-soft); line-height: 1.6; }
</style>
