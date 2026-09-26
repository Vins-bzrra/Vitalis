<script setup lang="ts"></script>

<template>
  <div class="mobile-action-bar">
    <slot />
  </div>
</template>

<style scoped>
.mobile-action-bar { display: none; }

@media (max-width: 767px) {
  .mobile-action-bar {
    display: flex;
    gap: var(--space-3);
    position: sticky;
    bottom: 0;
    left: 0; right: 0;
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
    padding: var(--space-3) var(--space-4);
    padding-bottom: max(var(--space-3), env(safe-area-inset-bottom));
    z-index: 40;
    margin: 0 calc(var(--space-3) * -1) calc(var(--space-3) * -1);
  }
  .mobile-action-bar :deep(button) { flex: 1; }
}
</style>
