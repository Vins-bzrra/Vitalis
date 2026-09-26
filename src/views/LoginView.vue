<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Cross, Mail, Lock, ArrowRight } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { PERFIL_LABEL } from '@/services/authService'
import UiButton from '@/components/ui/UiButton.vue'
import type { PerfilUsuario } from '@/types'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('fernando.aquino@unidade.saude.br')
const senha = ref('••••••••')

const perfisDemo: PerfilUsuario[] = ['medico', 'enfermeiro', 'tecnico_enfermagem', 'recepcao', 'farmacia', 'laboratorio', 'gestao', 'administrador']

async function entrar() {
  const ok = await auth.login(email.value, senha.value)
  if (ok) router.push((route.query.redirect as string) || '/dashboard')
}

async function entrarComoPerfil(perfil: PerfilUsuario) {
  const ok = await auth.loginComoPerfil(perfil)
  if (ok) router.push('/dashboard')
}
</script>

<template>
  <div class="login">
    <div class="login__panel">
      <div class="login__brand">
        <span class="login__brand-mark"><Cross :size="20" /></span>
        <span>Prontuário<strong>Vitalis</strong></span>
      </div>

      <h1 class="login__title">Acesso ao prontuário digital</h1>
      <p class="login__subtitle">Entre com suas credenciais institucionais para acompanhar a jornada completa dos pacientes.</p>

      <form class="login__form" @submit.prevent="entrar">
        <label class="login__field">
          <span>E-mail institucional</span>
          <div class="login__input-wrap">
            <Mail :size="16" />
            <input v-model="email" type="email" required placeholder="nome@unidade.saude.br">
          </div>
        </label>
        <label class="login__field">
          <span>Senha</span>
          <div class="login__input-wrap">
            <Lock :size="16" />
            <input v-model="senha" type="password" required placeholder="Sua senha">
          </div>
        </label>

        <p v-if="auth.erro" class="login__error">{{ auth.erro }}</p>

        <UiButton type="submit" block :disabled="auth.carregando">
          {{ auth.carregando ? 'Entrando...' : 'Entrar' }}
          <template #icon><ArrowRight :size="16" /></template>
        </UiButton>
      </form>

      <div class="login__demo">
        <p>Protótipo — entrar rapidamente como:</p>
        <div class="login__demo-grid">
          <button v-for="p in perfisDemo" :key="p" class="login__demo-chip" @click="entrarComoPerfil(p)">
            {{ PERFIL_LABEL[p] }}
          </button>
        </div>
      </div>
    </div>

    <div class="login__hero" aria-hidden="true">
      <div class="login__hero-content">
        <p class="login__hero-eyebrow">Visão 360° do paciente</p>
        <h2>Da entrada à alta, tudo em uma única linha do tempo clínica.</h2>
        <ul class="login__hero-list">
          <li>Acolhimento, triagem e classificação de risco</li>
          <li>Evoluções médicas e de enfermagem centralizadas</li>
          <li>Exames, prescrições e administração de medicamentos</li>
          <li>Internação, leitos e histórico longitudinal completo</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 480px) 1fr;
}
.login__panel {
  display: flex; flex-direction: column; justify-content: center;
  padding: var(--space-8) var(--space-8);
  max-width: 440px; margin: 0 auto; width: 100%;
}
.login__brand { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-size: 16px; margin-bottom: var(--space-8); }
.login__brand-mark { width: 34px; height: 34px; border-radius: 10px; background: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; }
.login__brand strong { color: var(--color-primary); font-weight: 700; }

.login__title { font-size: 26px; margin-bottom: var(--space-2); }
.login__subtitle { color: var(--color-ink-soft); font-size: 13.5px; margin-bottom: var(--space-6); line-height: 1.6; }

.login__form { display: flex; flex-direction: column; gap: var(--space-4); }
.login__field { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; font-weight: 600; color: var(--color-ink-soft); }
.login__input-wrap {
  display: flex; align-items: center; gap: 10px;
  border: 1px solid var(--color-border-strong); border-radius: var(--radius-sm);
  padding: 11px 14px; color: var(--color-ink-faint);
}
.login__input-wrap:focus-within { border-color: var(--color-primary); }
.login__input-wrap input { border: none; outline: none; flex: 1; font-size: 14px; color: var(--color-ink); background: none; }
.login__error { color: var(--color-critical); font-size: 12.5px; font-weight: 600; }

.login__demo { margin-top: var(--space-8); border-top: 1px solid var(--color-border); padding-top: var(--space-5); }
.login__demo p { font-size: 12px; color: var(--color-ink-faint); margin-bottom: var(--space-3); }
.login__demo-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.login__demo-chip {
  font-size: 12px; font-weight: 600;
  padding: 7px 12px; border-radius: 100px;
  background: var(--color-primary-softer); color: var(--color-primary-dark);
  border: 1px solid transparent; cursor: pointer;
}
.login__demo-chip:hover { border-color: var(--color-primary); }

.login__hero {
  background: linear-gradient(160deg, var(--color-primary-dark), var(--color-primary) 55%, #0E4A7F);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  padding: var(--space-10);
  position: relative;
  overflow: hidden;
}
.login__hero::before {
  content: '';
  position: absolute; inset: -20% -10%;
  background: repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 64px);
}
.login__hero-content { max-width: 440px; position: relative; }
.login__hero-eyebrow { font-family: var(--font-mono); font-size: 11.5px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.75; margin-bottom: var(--space-3); }
.login__hero-content h2 { font-size: 30px; line-height: 1.3; margin-bottom: var(--space-6); }
.login__hero-list { display: flex; flex-direction: column; gap: 12px; font-size: 14px; }
.login__hero-list li { padding-left: 20px; position: relative; opacity: 0.92; }
.login__hero-list li::before { content: ''; position: absolute; left: 0; top: 7px; width: 8px; height: 8px; border-radius: 50%; background: #6FE3C4; }

@media (max-width: 899px) {
  .login { grid-template-columns: 1fr; }
  .login__hero { display: none; }
  .login__panel { padding: var(--space-6) var(--space-4); }
}
</style>
