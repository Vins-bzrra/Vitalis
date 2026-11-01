<script setup lang="ts">
import { computed, ref } from 'vue'
import { BookmarkPlus, Plus, Printer, Trash2, X } from 'lucide-vue-next'
import type { Atendimento, ItemReceita, Paciente } from '@/types'
import UiCard from '@/components/ui/UiCard.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { useAuthStore } from '@/stores/auth'
import { useModelosStore } from '@/stores/modelos'
import { calcularIdade } from '@/utils/formatters'

const props = defineProps<{ paciente: Paciente; atendimento: Atendimento | null }>()
const auth = useAuthStore()
const modelos = useModelosStore()

// Catálogo simplificado para sugerir nome + posologia usual ao digitar.
const CATALOGO: ItemReceita[] = [
  { medicamento: 'Amoxicilina 500mg', posologia: 'Tomar 1 cápsula de 8/8h por 7 dias', quantidade: '21 cápsulas' },
  { medicamento: 'Amoxicilina + Clavulanato 875/125mg', posologia: 'Tomar 1 comprimido de 12/12h por 7 dias', quantidade: '14 comprimidos' },
  { medicamento: 'Azitromicina 500mg', posologia: 'Tomar 1 comprimido 1x/dia por 5 dias', quantidade: '5 comprimidos' },
  { medicamento: 'Cefalexina 500mg', posologia: 'Tomar 1 cápsula de 6/6h por 7 dias', quantidade: '28 cápsulas' },
  { medicamento: 'Paracetamol 750mg', posologia: 'Tomar 1 comprimido de 6/6h se dor ou febre', quantidade: '20 comprimidos' },
  { medicamento: 'Ibuprofeno 600mg', posologia: 'Tomar 1 comprimido de 8/8h por 5 dias, após refeições', quantidade: '15 comprimidos' },
  { medicamento: 'Omeprazol 20mg', posologia: 'Tomar 1 cápsula em jejum', quantidade: '30 cápsulas' },
  { medicamento: 'Ondansetrona 8mg', posologia: 'Tomar 1 comprimido de 8/8h se náusea', quantidade: '10 comprimidos' },
  { medicamento: 'Metformina 850mg', posologia: 'Tomar 1 comprimido após café da manhã e jantar', quantidade: '60 comprimidos' },
  { medicamento: 'Glicazida MR 30mg', posologia: 'Tomar 1 comprimido no café da manhã', quantidade: '30 comprimidos' },
  { medicamento: 'Losartana 50mg', posologia: 'Tomar 1 comprimido de 12/12h', quantidade: '60 comprimidos' },
  { medicamento: 'Hidroclorotiazida 25mg', posologia: 'Tomar 1 comprimido pela manhã', quantidade: '30 comprimidos' },
  { medicamento: 'Anlodipino 5mg', posologia: 'Tomar 1 comprimido 1x/dia', quantidade: '30 comprimidos' },
  { medicamento: 'Sinvastatina 20mg', posologia: 'Tomar 1 comprimido à noite', quantidade: '30 comprimidos' },
  { medicamento: 'AAS 100mg', posologia: 'Tomar 1 comprimido após o almoço', quantidade: '30 comprimidos' },
  { medicamento: 'Prednisona 20mg', posologia: 'Tomar 2 comprimidos pela manhã por 5 dias', quantidade: '10 comprimidos' },
  { medicamento: 'Salbutamol spray 100mcg', posologia: 'Inalar 4 jatos com espaçador de 4/4h se falta de ar', quantidade: '1 frasco' },
  { medicamento: 'Dipirona 500mg', posologia: 'Tomar 1 comprimido de 6/6h se dor ou febre', quantidade: '20 comprimidos' },
]

const itens = ref<ItemReceita[]>([])
const orientacoes = ref('')
const busca = ref('')
const modeloAplicado = ref('')
const salvandoModelo = ref(false)
const nomeModelo = ref('')
const aviso = ref('')

const alergias = computed(() => props.paciente.resumoClinico.alergias.filter((a) => a.tipo === 'medicamento'))

const sugestoes = computed(() => {
  const t = busca.value.trim().toLowerCase()
  if (t.length < 2) return []
  // Nomes que começam com o termo vêm primeiro ("dipi" → Dipirona antes de Anlodipino).
  return CATALOGO.filter((c) => c.medicamento.toLowerCase().includes(t))
    .sort((a, b) => Number(!a.medicamento.toLowerCase().startsWith(t)) - Number(!b.medicamento.toLowerCase().startsWith(t)))
    .slice(0, 6)
})

function alergico(nome: string) {
  return alergias.value.find((a) => nome.toLowerCase().includes(a.substancia.toLowerCase()))
}

function adicionar(item?: ItemReceita) {
  itens.value.push(item ? { ...item } : { medicamento: busca.value.trim(), posologia: '', quantidade: '' })
  busca.value = ''
}

function usarModelo(id: string) {
  const m = modelos.modelosReceita.find((x) => x.id === id)
  if (!m) return
  itens.value = m.itens.map((i) => ({ ...i }))
  orientacoes.value = m.orientacoes ?? ''
  modeloAplicado.value = m.nome
}

function salvarModelo() {
  if (!nomeModelo.value.trim() || !itens.value.length) return
  modelos.salvarModeloReceita({ nome: nomeModelo.value.trim(), itens: itens.value.map((i) => ({ ...i })), orientacoes: orientacoes.value })
  salvandoModelo.value = false
  nomeModelo.value = ''
  mostrarAviso('Modelo salvo. Na próxima receita é só escolher na lista.')
}

function limpar() {
  itens.value = []
  orientacoes.value = ''
  modeloAplicado.value = ''
}

function emitir() {
  if (!itens.value.length) return
  props.atendimento?.documentos.unshift({
    id: `doc-${Date.now()}`,
    tipo: 'receita',
    titulo: `Receita para casa — ${itens.value.length} medicação(ões)`,
    criadoEm: new Date().toISOString(),
    autor: auth.usuario?.nome ?? '—',
    assinado: false,
  })
  window.print()
  mostrarAviso('Receita gerada e anexada em Documentos.')
}

function mostrarAviso(msg: string) {
  aviso.value = msg
  setTimeout(() => { aviso.value = '' }, 3500)
}
</script>

<template>
  <div class="receita">
    <UiCard title="Modelos salvos" subtitle="Um clique monta a receita inteira — sem redigitar as medicações">
      <div class="modelos">
        <div v-for="m in modelos.modelosReceita" :key="m.id" class="modelo" :class="{ 'is-ativo': modeloAplicado === m.nome }">
          <button class="modelo__btn" @click="usarModelo(m.id)">
            <strong>{{ m.nome }}</strong>
            <span>{{ m.itens.map(i => i.medicamento.split(' ')[0]).join(' · ') }}</span>
          </button>
          <button v-if="modelos.receitaProprios.some(p => p.id === m.id)" class="modelo__del" :aria-label="`Excluir modelo ${m.nome}`" @click="modelos.removerModeloReceita(m.id)"><X :size="13" /></button>
        </div>
      </div>
    </UiCard>

    <UiCard title="Receita" :subtitle="`${paciente.nome} · ${calcularIdade(paciente.dataNascimento)} anos${paciente.codigoPaciente ? ' · Cód. ' + paciente.codigoPaciente : ''}`">
      <div v-if="alergias.length" class="receita__alergias">
        Alergias: <UiBadge v-for="a in alergias" :key="a.id" tone="critical" size="sm">{{ a.substancia }}</UiBadge>
      </div>

      <div class="busca">
        <input v-model="busca" placeholder="Digite o nome do medicamento..." aria-label="Buscar medicamento" @keydown.enter.prevent="sugestoes[0] ? adicionar(sugestoes[0]) : busca.trim() && adicionar()">
        <ul v-if="sugestoes.length" class="busca__sugestoes">
          <li v-for="s in sugestoes" :key="s.medicamento">
            <button @click="adicionar(s)"><strong>{{ s.medicamento }}</strong><span>{{ s.posologia }}</span></button>
          </li>
        </ul>
        <button v-else-if="busca.trim().length >= 2" class="busca__livre" @click="adicionar()"><Plus :size="14" /> Adicionar "{{ busca.trim() }}"</button>
      </div>

      <ol v-if="itens.length" class="itens">
        <li v-for="(item, i) in itens" :key="i" :class="{ 'is-alergia': alergico(item.medicamento) }">
          <span class="itens__n mono-num">{{ i + 1 }}.</span>
          <div class="itens__campos">
            <div class="itens__linha">
              <input v-model="item.medicamento" class="itens__med" aria-label="Medicamento">
              <input v-model="item.quantidade" class="itens__qtd" placeholder="Quantidade" aria-label="Quantidade">
            </div>
            <textarea v-model="item.posologia" rows="2" placeholder="Posologia" aria-label="Posologia" />
            <p v-if="alergico(item.medicamento)" class="itens__alerta">⚠ Paciente alérgico a {{ alergico(item.medicamento)!.substancia }} ({{ alergico(item.medicamento)!.reacao }})</p>
          </div>
          <button class="itens__del" :aria-label="`Remover ${item.medicamento}`" @click="itens.splice(i, 1)"><Trash2 :size="15" /></button>
        </li>
      </ol>
      <p v-else class="receita__vazio">Escolha um modelo acima ou digite um medicamento.</p>

      <label class="receita__orient">
        <span>Orientações</span>
        <textarea v-model="orientacoes" rows="3" placeholder="Orientações ao paciente, retorno..." />
      </label>

      <div v-if="salvandoModelo" class="receita__salvar">
        <input v-model="nomeModelo" placeholder="Nome do modelo (ex.: ITU não complicada)" aria-label="Nome do modelo">
        <UiButton size="sm" :disabled="!nomeModelo.trim()" @click="salvarModelo">Salvar</UiButton>
      </div>

      <div class="receita__acoes">
        <span class="receita__aviso" role="status">{{ aviso }}</span>
        <UiButton variant="ghost" :disabled="!itens.length" @click="limpar">Limpar</UiButton>
        <UiButton variant="secondary" :disabled="!itens.length" @click="salvandoModelo = !salvandoModelo"><template #icon><BookmarkPlus :size="15" /></template> Salvar como modelo</UiButton>
        <UiButton :disabled="!itens.length" @click="emitir"><template #icon><Printer :size="15" /></template> Gerar receita</UiButton>
      </div>
    </UiCard>
  </div>
</template>

<style scoped>
.receita { display: flex; flex-direction: column; gap: var(--space-4); }

.modelos { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
.modelo { position: relative; border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.modelo.is-ativo { border-color: var(--color-primary); background: var(--color-primary-softer); }
.modelo__btn { width: 100%; text-align: left; background: none; border: none; cursor: pointer; padding: 10px 28px 10px 12px; display: flex; flex-direction: column; gap: 2px; min-height: 56px; }
.modelo__btn strong { font-size: 13px; }
.modelo__btn span { font-size: 11.5px; color: var(--color-ink-soft); }
.modelo:hover { border-color: var(--color-primary); }
.modelo__del { position: absolute; top: 6px; right: 6px; background: none; border: none; cursor: pointer; color: var(--color-ink-faint); }

.receita__alergias { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 12.5px; font-weight: 600; color: var(--color-critical); margin-bottom: var(--space-3); }

.receita input, .receita textarea {
  width: 100%; border: 1px solid var(--color-border); border-radius: var(--radius-md); min-height: 38px; padding: 0 10px;
  font-size: 13px; background: var(--color-surface); color: var(--color-ink);
}
.receita textarea { padding: 10px; resize: vertical; }

.busca { position: relative; margin-bottom: var(--space-3); }
.busca > input { min-height: 44px; }
.busca__sugestoes { position: absolute; z-index: 5; left: 0; right: 0; top: calc(100% + 4px); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: 0 8px 24px rgba(0,0,0,.1); overflow: hidden; }
.busca__sugestoes button { width: 100%; text-align: left; background: none; border: none; cursor: pointer; padding: 8px 12px; display: flex; flex-direction: column; }
.busca__sugestoes button:hover { background: var(--color-primary-softer); }
.busca__sugestoes strong { font-size: 13px; }
.busca__sugestoes span { font-size: 11.5px; color: var(--color-ink-soft); }
.busca__livre { margin-top: 6px; display: inline-flex; align-items: center; gap: 4px; background: none; border: none; color: var(--color-primary); font-weight: 600; font-size: 12.5px; cursor: pointer; }

.itens { display: flex; flex-direction: column; gap: 8px; margin-bottom: var(--space-3); }
.itens li { display: flex; gap: 8px; align-items: flex-start; padding: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.itens li.is-alergia { border-color: var(--color-critical); background: var(--color-critical-soft); }
.itens__n { font-weight: 700; padding-top: 9px; color: var(--color-ink-soft); }
.itens__campos { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.itens__linha { display: flex; gap: 6px; flex-wrap: wrap; }
.itens__med { flex: 2; min-width: 160px; font-weight: 600; }
.itens__qtd { flex: 1; min-width: 110px; }
.itens__alerta { font-size: 12px; font-weight: 700; color: var(--color-critical); }
.itens__del { background: none; border: none; cursor: pointer; color: var(--color-ink-faint); min-width: 36px; min-height: 36px; }
.itens__del:hover { color: var(--color-critical); }

.receita__vazio { font-size: 13px; color: var(--color-ink-faint); margin-bottom: var(--space-3); }
.receita__orient { display: flex; flex-direction: column; gap: 4px; margin-bottom: var(--space-3); }
.receita__orient span { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-ink-faint); font-weight: 700; }
.receita__salvar { display: flex; gap: 8px; padding: 10px; background: var(--color-primary-softer); border-radius: var(--radius-md); margin-bottom: var(--space-3); }
.receita__acoes { display: flex; justify-content: flex-end; align-items: center; gap: 8px; flex-wrap: wrap; }
.receita__aviso { margin-right: auto; font-size: 12.5px; color: var(--color-success); font-weight: 600; }

@media (max-width: 639px) {
  .receita__acoes :deep(button) { flex: 1; }
}
</style>
