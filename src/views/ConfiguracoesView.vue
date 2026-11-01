<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { PERFIL_LABEL } from '@/services/authService'
import UiCard from '@/components/ui/UiCard.vue'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import { usePreferenciasStore } from '@/stores/preferencias'
import { useModelosStore } from '@/stores/modelos'
import { usePermissions } from '@/composables/usePermissions'
import { SETORES } from '@/config/setores'
import { ref } from 'vue'

const auth = useAuthStore()
const prefs = usePreferenciasStore()
prefs.sincronizar()
const modelos = useModelosStore()
const { can } = usePermissions()
const salvo = ref(false)

function alternarSetor(nome: string) {
  const atuais = prefs.prefs.setoresPrioritarios
  const novos = atuais.includes(nome) ? atuais.filter((s) => s !== nome) : [...atuais, nome]
  // Se o usuário só prioriza setores de internação, o painel abre direto na aba "Internados".
  const soInternacao = novos.length > 0 && novos.every((n) => SETORES.find((s) => s.nome === n)?.internacao)
  prefs.atualizar({ setoresPrioritarios: novos, ...(soInternacao ? { abaPainel: 'internados' as const } : {}) })
  confirmar()
}

function confirmar() {
  salvo.value = true
  setTimeout(() => { salvo.value = false }, 1800)
}
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

    <UiCard title="Priorizar informações" subtitle="Escolha os setores em que você atua. Os pacientes deles aparecem primeiro no painel, em Pacientes e em Atendimentos — os demais continuam acessíveis logo abaixo.">
      <fieldset class="setores">
        <legend>Setores de internação</legend>
        <label v-for="s in SETORES.filter(x => x.internacao)" :key="s.nome" class="setor" :class="{ 'is-on': prefs.prefs.setoresPrioritarios.includes(s.nome) }">
          <input type="checkbox" :checked="prefs.prefs.setoresPrioritarios.includes(s.nome)" @change="alternarSetor(s.nome)"> {{ s.nome }}
        </label>
      </fieldset>
      <fieldset class="setores">
        <legend>Urgência, emergência e ambulatório</legend>
        <label v-for="s in SETORES.filter(x => !x.internacao)" :key="s.nome" class="setor" :class="{ 'is-on': prefs.prefs.setoresPrioritarios.includes(s.nome) }">
          <input type="checkbox" :checked="prefs.prefs.setoresPrioritarios.includes(s.nome)" @change="alternarSetor(s.nome)"> {{ s.nome }}
        </label>
      </fieldset>

      <div class="opcoes">
        <label class="opcao">
          <span>Ao abrir o painel inicial, mostrar primeiro</span>
          <select :value="prefs.prefs.abaPainel" @change="prefs.atualizar({ abaPainel: ($event.target as HTMLSelectElement).value as 'urgencia' | 'internados' }); confirmar()">
            <option value="internados">Pacientes internados</option>
            <option value="urgencia">Urgência / emergência</option>
          </select>
        </label>
        <label class="opcao opcao--check">
          <input type="checkbox" :checked="prefs.prefs.somenteMeusSetores" :disabled="!prefs.temPrioridade" @change="prefs.atualizar({ somenteMeusSetores: ($event.target as HTMLInputElement).checked }); confirmar()">
          <span>Abrir as listas mostrando <strong>somente</strong> meus setores (com botão para ver os demais)</span>
        </label>
        <label v-if="can('evolucao.criar')" class="opcao">
          <span>Modelo de evolução que já vem selecionado</span>
          <select :value="prefs.prefs.modeloEvolucaoPadrao" @change="prefs.atualizar({ modeloEvolucaoPadrao: ($event.target as HTMLSelectElement).value }); confirmar()">
            <option value="">Nenhum — começar em branco</option>
            <option v-for="m in modelos.modelosEvolucao" :key="m.id" :value="m.id">{{ m.nome }}</option>
          </select>
        </label>
      </div>
      <p class="salvo" role="status">{{ salvo ? 'Preferência salva ✓' : '' }}</p>
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
.setores { border: none; padding: 0; margin: 0 0 var(--space-4); display: flex; flex-wrap: wrap; gap: 8px; }
.setores legend { font-size: 11px; text-transform: uppercase; color: var(--color-ink-faint); font-weight: 700; margin-bottom: 8px; }
.setor { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border: 1px solid var(--color-border-strong); border-radius: 100px; font-size: 13px; font-weight: 600; cursor: pointer; min-height: 40px; color: var(--color-ink-soft); }
.setor.is-on { background: var(--color-primary-soft); border-color: var(--color-primary); color: var(--color-primary-dark); }
.opcoes { display: flex; flex-direction: column; gap: var(--space-3); border-top: 1px solid var(--color-border); padding-top: var(--space-4); }
.opcao { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; }
.opcao select { border: 1px solid var(--color-border-strong); border-radius: var(--radius-sm); min-height: 40px; padding: 0 10px; font-size: 13px; max-width: 360px; background: var(--color-surface); color: var(--color-ink); }
.opcao--check { flex-direction: row; align-items: flex-start; font-weight: 400; cursor: pointer; }
.opcao--check input { margin-top: 3px; }
.salvo { min-height: 18px; margin-top: var(--space-2); font-size: 12.5px; font-weight: 600; color: var(--color-success); }
</style>
