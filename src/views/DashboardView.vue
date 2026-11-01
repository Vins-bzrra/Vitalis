<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AlertTriangle, ArrowRight, Search, UserPlus, FlaskConical, PillBottle } from 'lucide-vue-next'
import { useInstitucionalStore } from '@/stores/institucional'
import { usePacienteStore } from '@/stores/paciente'
import { usePermissions } from '@/composables/usePermissions'
import { DASHBOARD_CONFIG_POR_PERFIL, DASHBOARD_STATS } from '@/config/dashboardConfig'
import { rotaProntuario } from '@/utils/patientAccess'
import { usePreferenciasStore, priorizarPorSetor } from '@/stores/preferencias'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import PainelPacientes from '@/components/clinical/PainelPacientes.vue'
import { STATUS_EXAME_META } from '@/composables/useClinicalMeta'
import { calcularIdade } from '@/utils/formatters'

const institucional = useInstitucionalStore()
const pacienteStore = usePacienteStore()
const router = useRouter()
const { perfil, can } = usePermissions()
const prefs = usePreferenciasStore()
prefs.sincronizar()

onMounted(() => {
  institucional.carregarDashboard()
  pacienteStore.carregarLista()
})

// A configuração decide O QUE existe para o perfil; o `can()` decide se a
// permissão correspondente realmente autoriza a renderização — as duas
// camadas juntas evitam que uma seção "vaze" por engano de configuração.
const config = computed(() => (perfil.value ? DASHBOARD_CONFIG_POR_PERFIL[perfil.value] : null))

const cards = computed(() => {
  const i = institucional.indicadores
  if (!i || !config.value) return []
  return config.value.statKeys.map((key) => DASHBOARD_STATS[key]).filter(Boolean).map((def) => ({
    label: def.label, icon: def.icon, tone: def.tone, valor: def.valor(i),
  }))
})

const mostrarAlertas = computed(() => !!config.value?.mostrarAlertasClinicos && can('clinical.alerts.view'))
const mostrarOcupacao = computed(() => !!config.value?.mostrarOcupacaoLeitos && can('leitos.view'))
const mostrarListaPacientes = computed(() => !!config.value?.mostrarListaPacientes)

const pacientesAtencao = computed(() => {
  if (!mostrarAlertas.value) return []
  const lista = institucional.atendimentos
    .map((at) => {
      const paciente = pacienteStore.pacientes.find((p) => p.id === at.pacienteId)
      if (!paciente) return null
      const alergiaGrave = paciente.resumoClinico.alergias.some((a) => a.gravidade === 'grave')
      const examesCriticos = at.exames.filter((e) => e.status === 'resultado_critico').length
      const medAtrasada = at.administracoes.some((m) => m.status === 'atrasado')
      const pendenciaEnf = at.anotacoes.some((n) => n.tipo === 'pendencia' && !n.resolvida)
      const motivos: string[] = []
      if (alergiaGrave) motivos.push('Alergia grave')
      if (examesCriticos) motivos.push(`${examesCriticos} resultado(s) crítico(s)`)
      if (medAtrasada) motivos.push('Medicação atrasada')
      if (pendenciaEnf) motivos.push('Pendência de enfermagem')
      if (!motivos.length) return null
      return { paciente, atendimento: at, motivos }
    })
    .filter((v): v is NonNullable<typeof v> => v !== null)
  // Alertas dos setores do usuário primeiro (ver Configurações).
  return priorizarPorSetor(lista, (v) => v.paciente.setorAtual, prefs.prefs.setoresPrioritarios)
})

// Laboratório — resumo de exames críticos/pendentes (só computado quando o
// perfil realmente possui a permissão correspondente).
const examesPrioritarios = computed(() => {
  if (perfil.value !== 'laboratorio' || !can('exames.global.view')) return []
  return institucional.atendimentos.flatMap((a) => a.exames.map((e) => ({ exame: e, pacienteId: a.pacienteId })))
    .filter((x) => x.exame.status === 'resultado_critico' || x.exame.status === 'solicitado')
    .slice(0, 6)
})

// Farmácia — medicações pendentes/atrasadas de toda a unidade.
const farmaciaPendencias = computed(() => {
  if (perfil.value !== 'farmacia' || !can('farmacia.view')) return []
  return institucional.atendimentos.flatMap((a) => a.administracoes.map((m) => ({ administracao: m, pacienteId: a.pacienteId })))
    .filter((x) => x.administracao.status === 'pendente' || x.administracao.status === 'atrasado')
    .slice(0, 6)
})

function nomePaciente(pacienteId: string) {
  return pacienteStore.pacientes.find((p) => p.id === pacienteId)?.nome ?? '—'
}

function abrirPaciente(id: string) {
  router.push(rotaProntuario(id))
}
</script>

<template>
  <div v-if="config" class="dash">
    <header class="dash__header">
      <div>
        <p class="dash__eyebrow">{{ config.subtitulo }} · 25 de setembro de 2026</p>
        <h1>{{ config.titulo }}</h1>
      </div>
      <div v-if="perfil === 'recepcao'" class="dash__quick-actions">
        <UiButton variant="secondary" @click="router.push('/atendimentos')"><template #icon><Search :size="15" /></template> Buscar paciente</UiButton>
        <UiButton v-if="can('paciente.cadastrar')" @click="router.push('/pacientes/novo')"><template #icon><UserPlus :size="15" /></template> Cadastrar paciente</UiButton>
      </div>
    </header>

    <section class="dash__cards" aria-label="Indicadores do perfil atual">
      <article v-for="c in cards" :key="c.label" class="dash-card" :class="`is-${c.tone}`">
        <div class="dash-card__icon"><component :is="c.icon" :size="18" /></div>
        <div>
          <p class="dash-card__value mono-num">{{ c.valor }}</p>
          <p class="dash-card__label">{{ c.label }}</p>
        </div>
      </article>
    </section>

    <UiCard v-if="mostrarListaPacientes" :title="config.tituloListaPacientes" subtitle="Internados separados das fichas abertas na urgência/emergência">
      <PainelPacientes :pacientes="pacienteStore.pacientes" :atendimentos="institucional.atendimentos" @abrir="abrirPaciente" />
    </UiCard>

    <div v-if="mostrarAlertas || mostrarOcupacao" class="dash__grid">
      <UiCard v-if="mostrarAlertas" title="Atenção necessária" subtitle="Pacientes com pendências ou alertas clínicos relevantes" class="dash__attention">
        <template v-if="pacientesAtencao.length">
          <button v-for="item in pacientesAtencao" :key="item.paciente.id" class="attention-row" @click="abrirPaciente(item.paciente.id)">
            <UiAvatar :nome="item.paciente.nome" :size="40" />
            <div class="attention-row__info">
              <span class="attention-row__name">{{ item.paciente.nome }} <UiBadge v-if="prefs.doMeuSetor(item.paciente.setorAtual)" tone="primary" size="sm">Meu setor</UiBadge></span>
              <span class="attention-row__meta">
                {{ calcularIdade(item.paciente.dataNascimento) }} anos ·
                {{ item.paciente.setorAtual }}<template v-if="item.paciente.leitoAtual"> · Leito {{ item.paciente.leitoAtual }}</template>
              </span>
            </div>
            <div class="attention-row__tags">
              <UiBadge v-for="m in item.motivos" :key="m" tone="critical" size="sm">
                <AlertTriangle :size="11" /> {{ m }}
              </UiBadge>
            </div>
            <ArrowRight :size="16" class="attention-row__arrow" />
          </button>
        </template>
        <UiEmptyState v-else title="Nenhum alerta no momento" description="Todos os pacientes ativos estão sem pendências críticas." />
      </UiCard>

      <UiCard v-if="mostrarOcupacao" title="Ocupação de leitos" :subtitle="`${institucional.indicadores?.leitosOcupados ?? 0} de ${institucional.indicadores?.leitosTotais ?? 0} leitos ocupados`">
        <div class="occupancy">
          <div class="occupancy__ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-border)" stroke-width="12" />
              <circle
                cx="60" cy="60" r="52" fill="none" stroke="var(--color-primary)" stroke-width="12"
                stroke-linecap="round"
                :stroke-dasharray="`${(institucional.indicadores?.taxaOcupacao ?? 0) * 3.27} 1000`"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <span class="occupancy__value mono-num">{{ institucional.indicadores?.taxaOcupacao ?? 0 }}%</span>
          </div>
          <ul class="occupancy__legend">
            <li><span class="dot is-ocupado" /> Ocupados</li>
            <li><span class="dot is-livre" /> Livres</li>
          </ul>
          <RouterLink to="/leitos" class="occupancy__link">Ver mapa de leitos <ArrowRight :size="14" /></RouterLink>
        </div>
      </UiCard>
    </div>

    <UiCard v-if="examesPrioritarios.length" title="Exames prioritários" subtitle="Resultados críticos e solicitações recentes">
      <ul class="mini-list">
        <li v-for="x in examesPrioritarios" :key="x.exame.id" :class="{ 'is-critico': x.exame.status === 'resultado_critico' }" @click="router.push('/exames')">
          <div><strong>{{ x.exame.nome }}</strong><span>{{ nomePaciente(x.pacienteId) }}</span></div>
          <UiBadge :tone="STATUS_EXAME_META[x.exame.status].tone as any" size="sm">{{ STATUS_EXAME_META[x.exame.status].label }}</UiBadge>
        </li>
      </ul>
    </UiCard>

    <UiCard v-if="farmaciaPendencias.length" title="Medicações pendentes" subtitle="Administrações pendentes ou atrasadas na unidade">
      <ul class="mini-list">
        <li v-for="x in farmaciaPendencias" :key="x.administracao.id" :class="{ 'is-critico': x.administracao.status === 'atrasado' }" @click="router.push('/farmacia')">
          <div><strong>{{ x.administracao.medicamento }}</strong><span>{{ nomePaciente(x.pacienteId) }} · previsto {{ x.administracao.horarioPrevisto }}</span></div>
          <UiBadge :tone="x.administracao.status === 'atrasado' ? 'critical' : 'warning'" size="sm">{{ x.administracao.status === 'atrasado' ? 'Atrasado' : 'Pendente' }}</UiBadge>
        </li>
      </ul>
    </UiCard>


    <div v-if="perfil === 'laboratorio' || perfil === 'farmacia'" class="dash__shortcut">
      <UiButton variant="secondary" @click="router.push(perfil === 'laboratorio' ? '/exames' : '/farmacia')">
        <template #icon><component :is="perfil === 'laboratorio' ? FlaskConical : PillBottle" :size="15" /></template>
        Ver painel completo
      </UiButton>
    </div>
  </div>
</template>

<style scoped>
.dash { display: flex; flex-direction: column; gap: var(--space-6); }
.dash__header { display: flex; justify-content: space-between; align-items: flex-end; gap: var(--space-4); flex-wrap: wrap; }
.dash__eyebrow { font-family: var(--font-mono); font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-ink-faint); margin-bottom: 4px; }
.dash__header h1 { font-size: 24px; }
.dash__quick-actions { display: flex; gap: var(--space-3); flex-wrap: wrap; }

.dash__cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3); }
.dash-card {
  background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg);
  padding: var(--space-4); display: flex; align-items: center; gap: 12px;
}
.dash-card__icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.is-primary .dash-card__icon { background: var(--color-primary-soft); color: var(--color-primary-dark); }
.is-warning .dash-card__icon { background: var(--color-warning-soft); color: var(--color-warning); }
.is-teal .dash-card__icon { background: var(--color-teal-soft); color: var(--color-teal); }
.is-info .dash-card__icon { background: var(--color-info-soft); color: var(--color-info); }
.is-success .dash-card__icon { background: var(--color-success-soft); color: var(--color-success); }
.is-critical .dash-card__icon { background: var(--color-critical-soft); color: var(--color-critical); }
.is-neutral .dash-card__icon { background: #EEF1F4; color: var(--color-ink-soft); }

.dash-card__value { font-size: 22px; font-weight: 600; }
.dash-card__label { font-size: 12px; color: var(--color-ink-soft); }

.dash__grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: var(--space-4); align-items: start; }

.attention-row {
  width: 100%; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  padding: 10px 8px; background: none; border: none; border-bottom: 1px solid var(--color-border);
  cursor: pointer; text-align: left; min-height: 56px;
}
.attention-row:last-child { border-bottom: none; }
.attention-row:hover { background: var(--color-critical-soft); border-radius: var(--radius-sm); }
.attention-row__info { flex: 1; min-width: 140px; display: flex; flex-direction: column; }
.attention-row__name { font-weight: 600; font-size: 13.5px; }
.attention-row__meta { font-size: 11.5px; color: var(--color-ink-soft); }
.attention-row__tags { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; max-width: 240px; }
.attention-row__arrow { color: var(--color-ink-faint); flex-shrink: 0; }

@media (max-width: 480px) {
  .attention-row__tags { max-width: 100%; justify-content: flex-start; margin-left: 52px; }
  .attention-row__arrow { display: none; }
}

.occupancy { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); }
.occupancy__ring { position: relative; width: 140px; height: 140px; }
.occupancy__value { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 600; }
.occupancy__legend { display: flex; gap: var(--space-4); font-size: 12.5px; color: var(--color-ink-soft); }
.occupancy__legend .dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; margin-right: 6px; }
.dot.is-ocupado { background: var(--color-primary); }
.dot.is-livre { background: var(--color-border-strong); }
.occupancy__link { font-size: 12.5px; font-weight: 600; color: var(--color-primary); display: flex; align-items: center; gap: 4px; }

.mini-list { display: flex; flex-direction: column; gap: 8px; }
.mini-list li { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; gap: 10px; }
.mini-list li:hover { background: var(--color-primary-softer); }
.mini-list li.is-critico { border-color: var(--color-critical); background: var(--color-critical-soft); }
.mini-list li div { display: flex; flex-direction: column; }
.mini-list li strong { font-size: 13.5px; }
.mini-list li span { font-size: 12px; color: var(--color-ink-soft); }

.dash__shortcut { display: flex; }

.table-scroll { overflow-x: auto; }
.dash-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.dash-table th { text-align: left; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-ink-faint); padding: 8px 10px; border-bottom: 1px solid var(--color-border); white-space: nowrap; }
.dash-table td { padding: 10px; border-bottom: 1px solid var(--color-border); white-space: nowrap; }
.dash-table tbody tr { cursor: pointer; }
.dash-table tbody tr:hover { background: var(--color-primary-softer); }
.table-patient { display: flex; align-items: center; gap: 10px; }

@media (max-width: 1180px) {
  .dash__cards { grid-template-columns: repeat(2, 1fr); }
  .dash__grid { grid-template-columns: 1fr; }
}
@media (max-width: 639px) {
  .dash__cards { grid-template-columns: 1fr 1fr; }
  .dash-card { padding: var(--space-3); }
  .dash__header { flex-direction: column; align-items: stretch; }
  .dash__quick-actions :deep(button) { flex: 1; }
  .dash-table thead { display: none; }
  .dash-table, .dash-table tbody, .dash-table tr, .dash-table td { display: block; width: 100%; }
  .dash-table tr { border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-bottom: 10px; padding: 8px; }
  .dash-table td { border-bottom: none; display: flex; justify-content: space-between; align-items: center; padding: 6px 4px; }
  .dash-table td::before { content: attr(data-label); font-size: 11px; color: var(--color-ink-faint); font-weight: 600; }
  .dash-table td:first-child::before { display: none; }
}
</style>
