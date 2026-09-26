<script setup lang="ts">
export interface DataTableColumn<T = any> {
  key: string
  label: string
  primary?: boolean
}

defineProps<{ columns: DataTableColumn[]; rows: any[]; rowKey: (row: any) => string }>()
const emit = defineEmits<{ 'row-click': [row: any] }>()
</script>

<template>
  <div class="rdt">
    <table class="rdt__table">
      <thead>
        <tr>
          <th v-for="c in columns" :key="c.key">{{ c.label }}</th>
          <th v-if="$slots.actions" class="rdt__actions-head"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="rowKey(row)" @click="emit('row-click', row)">
          <td v-for="c in columns" :key="c.key" :data-label="c.label" :class="{ 'is-primary': c.primary }">
            <slot :name="`cell-${c.key}`" :row="row"><slot name="cell" :row="row" :column="c" /></slot>
          </td>
          <td v-if="$slots.actions" class="rdt__actions-cell" @click.stop>
            <slot name="actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!rows.length" class="rdt__empty">
      <slot name="empty" />
    </div>
  </div>
</template>

<style scoped>
.rdt { width: 100%; overflow-x: auto; }
.rdt__table { width: 100%; border-collapse: collapse; font-size: 13px; }
.rdt__table th {
  text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em;
  color: var(--color-ink-faint); padding: 10px var(--space-4); border-bottom: 1px solid var(--color-border); white-space: nowrap;
}
.rdt__table td { padding: 12px var(--space-4); border-bottom: 1px solid var(--color-border); vertical-align: middle; }
.rdt__table tbody tr { cursor: pointer; }
.rdt__table tbody tr:hover { background: var(--color-primary-softer); }
.rdt__actions-cell { display: flex; gap: 6px; justify-content: flex-end; white-space: nowrap; }
.rdt__empty { padding: var(--space-6); }

@media (max-width: 760px) {
  .rdt__table thead { display: none; }
  .rdt__table, .rdt__table tbody, .rdt__table tr, .rdt__table td { display: block; width: 100%; }
  .rdt__table tr {
    border: 1px solid var(--color-border); border-radius: var(--radius-md);
    margin-bottom: 10px; padding: var(--space-3);
  }
  .rdt__table td { border-bottom: none; padding: 5px 2px; display: flex; justify-content: space-between; gap: 10px; text-align: right; }
  .rdt__table td.is-primary { font-weight: 600; font-size: 14px; }
  .rdt__table td::before { content: attr(data-label); font-size: 10.5px; color: var(--color-ink-faint); font-weight: 700; text-transform: uppercase; text-align: left; }
  .rdt__actions-cell { justify-content: flex-start; padding-top: 8px; border-top: 1px dashed var(--color-border); margin-top: 4px; }
}
</style>
