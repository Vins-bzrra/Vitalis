<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BedDouble, Printer } from 'lucide-vue-next'
import { gerarQrLeito, urlDoLeito } from '@/utils/qrLeito'
import { useInstitucionalStore } from '@/stores/institucional'
import { usePacienteStore } from '@/stores/paciente'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { rotaProntuario } from '@/utils/patientAccess'
import type { Leito } from '@/types'

const institucional = useInstitucionalStore()
const pacienteStore = usePacienteStore()
const router = useRouter()

onMounted(() => {
  institucional.carregarLeitos()
  pacienteStore.carregarLista()
})

const leitoSelecionado = ref<Leito | null>(null)
const qrSelecionado = ref('')
watch(leitoSelecionado, async (l) => {
  qrSelecionado.value = l ? await gerarQrLeito(l.numero) : ''
})

function imprimirEtiquetas(query: Record<string, string>) {
  router.push({ path: '/leitos/etiquetas', query })
}

const porSetor = computed(() => {
  const grupos = new Map<string, Leito[]>()
  for (const l of institucional.leitos) {
    if (!grupos.has(l.setor)) grupos.set(l.setor, [])
    grupos.get(l.setor)!.push(l)
  }
  return [...grupos.entries()]
})

const statusLabel: Record<Leito['status'], string> = {
  livre: 'Livre', ocupado: 'Ocupado', higienizacao: 'Higienização', bloqueado: 'Bloqueado', manutencao: 'Manutenção',
}
const statusTone: Record<Leito['status'], string> = {
  livre: 'success', ocupado: 'primary', higienizacao: 'warning', bloqueado: 'critical', manutencao: 'neutral',
}

function pacienteDoLeito(leito: Leito) {
  return pacienteStore.pacientes.find((p) => p.id === leito.pacienteId)
}

function abrirLeito(leito: Leito) {
  leitoSelecionado.value = leito
}

function irParaPaciente() {
  const p = leitoSelecionado.value && pacienteDoLeito(leitoSelecionado.value)
  if (p) router.push(rotaProntuario(p.id))
}
</script>

<template>
  <div class="leitos">
    <header class="leitos__header">
      <div>
        <p class="leitos__eyebrow">Gestão de leitos</p>
        <h1>Leitos & Ocupação</h1>
      </div>
      <UiButton variant="secondary" @click="imprimirEtiquetas({})"><template #icon><Printer :size="15" /></template> Imprimir etiquetas QR</UiButton>
      <div class="leitos__legend">
        <span v-for="s in Object.keys(statusLabel)" :key="s" class="leitos__legend-item">
          <span class="dot" :class="`is-${s}`" /> {{ statusLabel[s as Leito['status']] }}
        </span>
      </div>
    </header>

    <UiCard v-for="[setor, leitos] in porSetor" :key="setor" :title="setor" :subtitle="`${leitos.filter(l => l.status === 'ocupado').length} de ${leitos.length} leitos ocupados`">
      <template #actions>
        <UiButton size="sm" variant="ghost" @click="imprimirEtiquetas({ setor })"><template #icon><Printer :size="14" /></template> Etiquetas do setor</UiButton>
      </template>
      <div class="leitos-grid">
        <button v-for="l in leitos" :key="l.id" class="leito-card" :class="`is-${l.status}`" @click="abrirLeito(l)">
          <BedDouble :size="18" />
          <span class="leito-card__numero mono-num">{{ l.numero }}</span>
          <span class="leito-card__status">{{ statusLabel[l.status] }}</span>
          <span v-if="l.pacienteId" class="leito-card__paciente">{{ pacienteDoLeito(l)?.nome.split(' ').slice(0, 2).join(' ') }}</span>
        </button>
      </div>
    </UiCard>

    <UiModal :model-value="!!leitoSelecionado" :title="`Leito ${leitoSelecionado?.numero}`" @update:model-value="(v) => !v && (leitoSelecionado = null)">
      <div v-if="leitoSelecionado" class="leito-detail">
        <div class="leito-detail__info">
          <dl class="dl">
            <div><dt>Setor</dt><dd>{{ leitoSelecionado.setor }}</dd></div>
            <div><dt>Quarto</dt><dd>{{ leitoSelecionado.quarto }}</dd></div>
            <div><dt>Status</dt><dd><UiBadge :tone="statusTone[leitoSelecionado.status] as any" size="sm">{{ statusLabel[leitoSelecionado.status] }}</UiBadge></dd></div>
            <div v-if="pacienteDoLeito(leitoSelecionado)"><dt>Paciente ocupante</dt><dd>{{ pacienteDoLeito(leitoSelecionado)!.nome }}</dd></div>
          </dl>
          <UiButton v-if="pacienteDoLeito(leitoSelecionado)" size="sm" @click="irParaPaciente">Abrir prontuário do paciente</UiButton>
        </div>
        <div class="leito-detail__qr">
          <img v-if="qrSelecionado" :src="qrSelecionado" class="qr-img" :alt="`QR Code do leito ${leitoSelecionado.numero}`">
          <p>QR Code do leito {{ leitoSelecionado.numero }}</p>
          <small>Imprima e cole no leito. Ao escanear, o profissional faz login e cai direto no prontuário de quem estiver neste leito.</small>
          <code class="qr-url">{{ urlDoLeito(leitoSelecionado.numero) }}</code>
          <UiButton size="sm" variant="secondary" @click="imprimirEtiquetas({ leito: leitoSelecionado.numero })"><template #icon><Printer :size="14" /></template> Imprimir etiqueta</UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<style scoped>
.leitos { display: flex; flex-direction: column; gap: var(--space-5); }
.leitos__header { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: var(--space-3); }
.leitos__eyebrow { font-family: var(--font-mono); font-size: 11.5px; text-transform: uppercase; color: var(--color-ink-faint); margin-bottom: 4px; }
.leitos__header h1 { font-size: 24px; }
.leitos__legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: 12px; color: var(--color-ink-soft); }
.leitos__legend-item { display: flex; align-items: center; gap: 6px; }
.dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
.dot.is-livre { background: var(--color-success); }
.dot.is-ocupado { background: var(--color-primary); }
.dot.is-higienizacao { background: var(--color-warning); }
.dot.is-bloqueado { background: var(--color-critical); }
.dot.is-manutencao { background: var(--color-ink-faint); }

.leitos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; }
.leito-card {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  border: 2px solid var(--color-border); border-radius: var(--radius-md);
  padding: 14px 8px; background: var(--color-surface); cursor: pointer;
  min-height: 88px;
}
.leito-card.is-livre { border-color: var(--color-success); color: var(--color-success); }
.leito-card.is-ocupado { border-color: var(--color-primary); color: var(--color-primary-dark); background: var(--color-primary-softer); }
.leito-card.is-higienizacao { border-color: var(--color-warning); color: var(--color-warning); }
.leito-card.is-bloqueado { border-color: var(--color-critical); color: var(--color-critical); background: var(--color-critical-soft); }
.leito-card.is-manutencao { border-color: var(--color-border-strong); color: var(--color-ink-faint); }
.leito-card__numero { font-weight: 700; font-size: 14px; color: var(--color-ink); }
.leito-card__status { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.03em; }
.leito-card__paciente { font-size: 10.5px; color: var(--color-ink-soft); text-align: center; }

.leito-detail { display: grid; grid-template-columns: 1fr auto; gap: var(--space-5); align-items: start; }
.leito-detail__info { display: flex; flex-direction: column; gap: var(--space-4); }
.dl { display: flex; flex-direction: column; gap: var(--space-3); }
.dl dt { font-size: 11px; text-transform: uppercase; color: var(--color-ink-faint); font-weight: 700; margin-bottom: 3px; }
.dl dd { font-size: 13.5px; }
.leito-detail__qr { text-align: center; width: 200px; display: flex; flex-direction: column; align-items: center; }
.qr-img { width: 150px; height: 150px; margin: 0 auto var(--space-2); display: block; }
.qr-url { display: block; font-size: 10px; color: var(--color-ink-faint); word-break: break-all; margin: 6px 0 10px; }
.qr-placeholder { width: 120px; height: 120px; margin: 0 auto var(--space-2); border: 2px dashed var(--color-border-strong); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--color-ink-faint); }
.leito-detail__qr p { font-size: 12px; font-weight: 600; }
.leito-detail__qr small { font-size: 10.5px; color: var(--color-ink-faint); line-height: 1.5; display: block; margin-top: 4px; }

@media (max-width: 560px) {
  .leito-detail { grid-template-columns: 1fr; }
  .leito-detail__qr { width: 100%; }
}
</style>
