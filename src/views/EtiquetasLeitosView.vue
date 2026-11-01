<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Printer } from 'lucide-vue-next'
import { useInstitucionalStore } from '@/stores/institucional'
import { gerarQrLeito, urlDoLeito } from '@/utils/qrLeito'
import UiButton from '@/components/ui/UiButton.vue'

// Folha de etiquetas para imprimir e colar nos leitos. Página própria (fora do
// layout com menu) para sair limpa na impressora. Aceita ?setor= ou ?leito=.
const route = useRoute()
const router = useRouter()
const institucional = useInstitucionalStore()
const qrs = ref<Record<string, string>>({})

const leitos = computed(() => {
  const setor = route.query.setor as string | undefined
  const leito = route.query.leito as string | undefined
  return institucional.leitos.filter((l) => (!setor || l.setor === setor) && (!leito || l.numero === leito))
})

const titulo = computed(() =>
  route.query.leito ? `Etiqueta do leito ${route.query.leito}` : route.query.setor ? `Etiquetas — ${route.query.setor}` : 'Etiquetas — todos os leitos',
)

function imprimir() { window.print() }

onMounted(async () => {
  await institucional.carregarLeitos()
  const pares = await Promise.all(leitos.value.map(async (l) => [l.numero, await gerarQrLeito(l.numero, 360)] as const))
  qrs.value = Object.fromEntries(pares)
})
</script>

<template>
  <div class="etiquetas">
    <header class="etiquetas__barra">
      <UiButton variant="ghost" @click="router.back()"><template #icon><ArrowLeft :size="15" /></template> Voltar</UiButton>
      <div>
        <h1>{{ titulo }}</h1>
        <p>Imprima, recorte e cole cada etiqueta no respectivo leito (cabeceira ou suporte de prontuário).</p>
      </div>
      <UiButton :disabled="!Object.keys(qrs).length" @click="imprimir"><template #icon><Printer :size="15" /></template> Imprimir</UiButton>
    </header>

    <div class="etiquetas__grade">
      <article v-for="l in leitos" :key="l.id" class="etiqueta">
        <img v-if="qrs[l.numero]" :src="qrs[l.numero]" :alt="`QR Code do leito ${l.numero}`">
        <div class="etiqueta__texto">
          <strong class="mono-num">{{ l.numero }}</strong>
          <span>{{ l.setor }} · {{ l.quarto }}</span>
          <small>Escaneie com o celular para abrir o prontuário do paciente deste leito. Acesso somente com login.</small>
          <code>{{ urlDoLeito(l.numero) }}</code>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.etiquetas { min-height: 100vh; background: var(--color-bg, #F3F5F8); padding: var(--space-5); }
.etiquetas__barra { display: flex; align-items: center; gap: var(--space-4); flex-wrap: wrap; margin-bottom: var(--space-5); }
.etiquetas__barra > div { flex: 1; min-width: 220px; }
.etiquetas__barra h1 { font-size: 20px; }
.etiquetas__barra p { font-size: 12.5px; color: var(--color-ink-soft); }

.etiquetas__grade { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px; }
.etiqueta {
  background: #fff; color: #111; border: 1.5px dashed #9AA5B1; border-radius: 10px;
  padding: 12px; display: flex; gap: 12px; align-items: center; break-inside: avoid;
}
.etiqueta img { width: 128px; height: 128px; flex-shrink: 0; }
.etiqueta__texto { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.etiqueta__texto strong { font-size: 26px; letter-spacing: .02em; }
.etiqueta__texto span { font-size: 13px; font-weight: 600; }
.etiqueta__texto small { font-size: 10.5px; color: #444; line-height: 1.4; }
.etiqueta__texto code { font-size: 9px; color: #666; word-break: break-all; }

@media print {
  .etiquetas { background: #fff; padding: 0; }
  .etiquetas__barra { display: none; }
  .etiquetas__grade { grid-template-columns: 1fr 1fr; gap: 6mm; }
}
</style>
