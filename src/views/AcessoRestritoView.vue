<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import AccessDenied from '@/components/shared/AccessDenied.vue'
import UiButton from '@/components/ui/UiButton.vue'

const route = useRoute()
const router = useRouter()

const recurso = computed(() => (route.query.recurso as string) || 'este recurso')
</script>

<template>
  <div class="restrito">
    <AccessDenied
      :recurso="recurso"
      descricao="Se você acredita que deveria ter acesso a esta área, procure o administrador do sistema para revisar seu perfil de permissões."
    />
    <div class="restrito__actions">
      <UiButton variant="secondary" @click="router.push('/dashboard')">
        <template #icon><ArrowLeft :size="15" /></template> Voltar para o início
      </UiButton>
    </div>
  </div>
</template>

<style scoped>
.restrito { max-width: 560px; margin: var(--space-8) auto; display: flex; flex-direction: column; gap: var(--space-4); }
.restrito__actions { display: flex; justify-content: center; }
</style>
