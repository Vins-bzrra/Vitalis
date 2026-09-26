<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { PERFIL_LABEL } from '@/services/authService'
import UiCard from '@/components/ui/UiCard.vue'
import UiAvatar from '@/components/ui/UiAvatar.vue'

const auth = useAuthStore()
</script>

<template>
  <div class="cfg">
    <header><p class="eyebrow">Preferências</p><h1>Configurações</h1></header>

    <UiCard title="Meu perfil">
      <div class="profile" v-if="auth.usuario">
        <UiAvatar :nome="auth.usuario.nome" :size="56" />
        <div>
          <strong>{{ auth.usuario.nome }}</strong>
          <p>{{ PERFIL_LABEL[auth.usuario.perfil] }} · {{ auth.usuario.email }}</p>
        </div>
      </div>
    </UiCard>

    <UiCard title="Sobre este protótipo" subtitle="Informações da unidade e da versão do sistema">
      <dl class="dl">
        <div><dt>Unidade</dt><dd>Unidade Básica de Saúde Vitalis</dd></div>
        <div><dt>Ambiente</dt><dd>Protótipo demonstrativo — dados fictícios</dd></div>
        <div><dt>Versão</dt><dd class="mono-num">0.9.0</dd></div>
      </dl>
    </UiCard>
  </div>
</template>

<style scoped>
.cfg { display: flex; flex-direction: column; gap: var(--space-5); max-width: 640px; }
.eyebrow { font-family: var(--font-mono); font-size: 11.5px; text-transform: uppercase; color: var(--color-ink-faint); margin-bottom: 4px; }
h1 { font-size: 24px; }
.profile { display: flex; align-items: center; gap: 14px; }
.profile strong { font-size: 15px; }
.profile p { font-size: 12.5px; color: var(--color-ink-soft); }
.dl { display: flex; flex-direction: column; gap: var(--space-3); }
.dl dt { font-size: 11px; text-transform: uppercase; color: var(--color-ink-faint); font-weight: 700; margin-bottom: 3px; }
.dl dd { font-size: 13.5px; }
</style>
