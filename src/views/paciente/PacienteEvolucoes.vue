<script setup lang="ts">
import { computed, ref } from 'vue'
import { BookmarkPlus, FileText, Trash2 } from 'lucide-vue-next'
import type { Atendimento, Paciente } from '@/types'
import UiCard from '@/components/ui/UiCard.vue'
import UiTabs from '@/components/ui/UiTabs.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useModelosStore } from '@/stores/modelos'
import { usePermissions } from '@/composables/usePermissions'
import { usePreferenciasStore } from '@/stores/preferencias'

const props = defineProps<{ paciente: Paciente; atendimento: Atendimento | null }>()
const auth = useAuthStore()
const modelos = useModelosStore()
const { can } = usePermissions()
const aba = ref('medica')

// Evolução em texto livre: cada especialidade evolui do seu jeito, na ordem
// que preferir. Os modelos são só um ponto de partida opcional.
const texto = ref('')
const modeloId = ref('')
const salvandoModelo = ref(false)
const nomeModelo = ref('')
const especialidadeModelo = ref('')
const aviso = ref('')

// Modelo preferido do usuário (Configurações) já vem carregado — continua
// totalmente editável, ou pode ser trocado por "Em branco".
const prefs = usePreferenciasStore()
prefs.sincronizar()
function carregarModeloPadrao() {
  const m = modelos.modelosEvolucao.find((x) => x.id === prefs.prefs.modeloEvolucaoPadrao)
  modeloId.value = m?.id ?? ''
  texto.value = m?.texto ?? ''
}
carregarModeloPadrao()

function aplicarModelo() {
  const m = modelos.modelosEvolucao.find((x) => x.id === modeloId.value)
  const atual = modelos.modelosEvolucao.find((x) => x.texto === texto.value)
  if (!m) { if (!texto.value.trim() || atual || confirm('Apagar o texto atual?')) texto.value = ''; return }
  if (texto.value.trim() && !atual && !confirm('Substituir o texto atual pelo modelo selecionado?')) {
    modeloId.value = ''
    return
  }
  texto.value = m.texto
}

function registrar() {
  if (!props.atendimento || !texto.value.trim()) return
  const agora = new Date()
  const m = modelos.modelosEvolucao.find((x) => x.id === modeloId.value)
  props.atendimento.evolucoesLivres ??= []
  props.atendimento.evolucoesLivres.unshift({
    id: `evl-${agora.getTime()}`,
    data: agora.toISOString().slice(0, 10),
    hora: agora.toTimeString().slice(0, 5),
    profissional: auth.usuario?.nome ?? '—',
    especialidade: m?.especialidade,
    texto: texto.value.trim(),
  })
  carregarModeloPadrao()
  mostrarAviso('Evolução registrada.')
}

function salvarComoModelo() {
  if (!nomeModelo.value.trim() || !texto.value.trim()) return
  modelos.salvarModeloEvolucao(nomeModelo.value.trim(), especialidadeModelo.value.trim() || 'Pessoal', texto.value)
  salvandoModelo.value = false
  nomeModelo.value = ''
  especialidadeModelo.value = ''
  mostrarAviso('Modelo salvo — disponível para os próximos pacientes.')
}

function mostrarAviso(msg: string) {
  aviso.value = msg
  setTimeout(() => { aviso.value = '' }, 3000)
}

const meusModelos = computed(() => modelos.modelosEvolucao.filter((m) => m.proprio))
const totalMedicas = computed(() => (props.atendimento?.evolucoesLivres?.length ?? 0) + (props.atendimento?.evolucoesMedicas.length ?? 0))

function dataBr(d: string) { return d.split('-').reverse().join('/') }
</script>

<template>
  <div class="evolucoes">
    <UiTabs v-model="aba" :tabs="[{ key: 'medica', label: 'Evolução médica' }, { key: 'enfermagem', label: 'Evolução de enfermagem' }]" />

    <div v-if="aba === 'medica'" class="evolucoes__panel">
      <UiCard v-if="atendimento && can('evolucao.criar')" title="Nova evolução" subtitle="Texto livre — escreva na ordem e no formato da sua especialidade">
        <div class="editor">
          <div class="editor__bar">
            <label class="editor__modelo">
              <FileText :size="14" />
              <select v-model="modeloId" aria-label="Partir de um modelo" @change="aplicarModelo">
                <option value="">Em branco (sem modelo)</option>
                <optgroup v-if="meusModelos.length" label="Meus modelos">
                  <option v-for="m in meusModelos" :key="m.id" :value="m.id">{{ m.nome }}</option>
                </optgroup>
                <optgroup label="Modelos por especialidade">
                  <option v-for="m in modelos.modelosEvolucao.filter(x => !x.proprio)" :key="m.id" :value="m.id">{{ m.nome }}</option>
                </optgroup>
              </select>
            </label>
            <UiButton size="sm" variant="ghost" :disabled="!texto.trim()" @click="salvandoModelo = !salvandoModelo">
              <template #icon><BookmarkPlus :size="14" /></template> Salvar como modelo
            </UiButton>
          </div>

          <div v-if="salvandoModelo" class="editor__salvar">
            <input v-model="nomeModelo" placeholder="Nome do modelo (ex.: Minha evolução de enfermaria)" aria-label="Nome do modelo">
            <input v-model="especialidadeModelo" placeholder="Especialidade (opcional)" aria-label="Especialidade do modelo">
            <UiButton size="sm" :disabled="!nomeModelo.trim()" @click="salvarComoModelo">Salvar</UiButton>
          </div>

          <textarea v-model="texto" rows="10" placeholder="Escreva a evolução livremente..." aria-label="Texto da evolução" />

          <div class="editor__footer">
            <span class="editor__aviso" role="status">{{ aviso }}</span>
            <UiButton :disabled="!texto.trim()" @click="registrar">Registrar evolução</UiButton>
          </div>

          <details v-if="meusModelos.length" class="editor__meus">
            <summary>Gerenciar meus modelos ({{ meusModelos.length }})</summary>
            <ul>
              <li v-for="m in meusModelos" :key="m.id">
                <span>{{ m.nome }} <small>· {{ m.especialidade }}</small></span>
                <button :aria-label="`Excluir modelo ${m.nome}`" @click="modelos.removerModeloEvolucao(m.id)"><Trash2 :size="14" /></button>
              </li>
            </ul>
          </details>
        </div>
      </UiCard>

      <template v-if="totalMedicas">
        <UiCard v-for="ev in atendimento?.evolucoesLivres ?? []" :key="ev.id">
          <div class="evo-head">
            <strong>{{ ev.profissional }} <UiBadge v-if="ev.especialidade" tone="info" size="sm">{{ ev.especialidade }}</UiBadge></strong>
            <span class="mono-num">{{ dataBr(ev.data) }} · {{ ev.hora }}</span>
          </div>
          <p class="evo-livre">{{ ev.texto }}</p>
        </UiCard>

        <UiCard v-for="ev in atendimento?.evolucoesMedicas ?? []" :key="ev.id">
          <div class="evo-head">
            <strong>{{ ev.profissional }}</strong>
            <span class="mono-num">{{ dataBr(ev.data) }} · {{ ev.hora }}</span>
          </div>
          <dl class="dl">
            <div><dt>Anamnese</dt><dd>{{ ev.anamnese }}</dd></div>
            <div><dt>Exame físico</dt><dd>{{ ev.exameFisico }}</dd></div>
            <div v-if="ev.hipotesesDiagnosticas.length"><dt>Hipóteses diagnósticas</dt><dd>
              <UiBadge v-for="h in ev.hipotesesDiagnosticas" :key="h" tone="info" size="sm" class="chip">{{ h }}</UiBadge>
            </dd></div>
            <div v-if="ev.diagnosticosConfirmados.length"><dt>Diagnósticos confirmados</dt><dd>
              <UiBadge v-for="d in ev.diagnosticosConfirmados" :key="d" tone="primary" size="sm" class="chip">{{ d }}</UiBadge>
            </dd></div>
            <div><dt>Conduta</dt><dd>{{ ev.conduta }}</dd></div>
            <div><dt>Plano terapêutico</dt><dd>{{ ev.planoTerapeutico }}</dd></div>
            <div v-if="ev.encaminhamentos?.length"><dt>Encaminhamentos</dt><dd>{{ ev.encaminhamentos.join(', ') }}</dd></div>
          </dl>
        </UiCard>
      </template>
      <UiEmptyState v-else title="Nenhuma evolução médica registrada" />
    </div>

    <div v-else class="evolucoes__panel">
      <template v-if="atendimento?.evolucoesEnfermagem.length">
        <UiCard v-for="ev in atendimento.evolucoesEnfermagem" :key="ev.id">
          <div class="evo-head">
            <strong>{{ ev.profissional }}</strong>
            <span class="mono-num">{{ dataBr(ev.data) }} · {{ ev.hora }}</span>
          </div>
          <p class="evo-text">{{ ev.texto }}</p>
          <dl class="dl">
            <div v-if="ev.balancoHidrico"><dt>Balanço hídrico</dt><dd>{{ ev.balancoHidrico }}</dd></div>
            <div v-if="ev.escalas"><dt>Escalas</dt><dd>{{ ev.escalas }}</dd></div>
            <div><dt>Cuidados realizados</dt><dd>{{ ev.cuidadosRealizados.join(', ') }}</dd></div>
            <div v-if="ev.intercorrencias"><dt>Intercorrências</dt><dd>{{ ev.intercorrencias }}</dd></div>
          </dl>
        </UiCard>
      </template>
      <UiEmptyState v-else title="Nenhuma evolução de enfermagem registrada" />
    </div>
  </div>
</template>

<style scoped>
.evolucoes { display: flex; flex-direction: column; gap: var(--space-4); }
.evolucoes__panel { display: flex; flex-direction: column; gap: var(--space-3); }
.evo-head { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; font-size: 13px; margin-bottom: var(--space-3); }
.evo-head strong { display: inline-flex; align-items: center; gap: 8px; }
.evo-head span { color: var(--color-ink-soft); }
.evo-text { font-size: 13.5px; margin-bottom: var(--space-3); }
.evo-livre { font-size: 13.5px; line-height: 1.6; white-space: pre-wrap; }
.dl { display: flex; flex-direction: column; gap: var(--space-3); }
.dl dt { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-ink-faint); font-weight: 700; margin-bottom: 4px; }
.dl dd { font-size: 13px; line-height: 1.6; }
.chip { margin-right: 6px; }

.editor { display: flex; flex-direction: column; gap: var(--space-3); }
.editor__bar { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
.editor__modelo { display: flex; align-items: center; gap: 8px; color: var(--color-ink-soft); flex: 1; min-width: 220px; }
.editor select, .editor input {
  border: 1px solid var(--color-border); border-radius: var(--radius-md); min-height: 38px; padding: 0 10px;
  font-size: 13px; background: var(--color-surface); color: var(--color-ink);
}
.editor__modelo select { flex: 1; }
.editor__salvar { display: flex; gap: 8px; flex-wrap: wrap; padding: 10px; background: var(--color-primary-softer); border-radius: var(--radius-md); }
.editor__salvar input { flex: 1; min-width: 160px; }
.editor textarea {
  width: 100%; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 12px;
  font-family: var(--font-mono); font-size: 13px; line-height: 1.6; resize: vertical; color: var(--color-ink); background: var(--color-surface);
}
.editor textarea:focus { outline: 2px solid var(--color-primary-soft); border-color: var(--color-primary); }
.editor__footer { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.editor__aviso { font-size: 12.5px; color: var(--color-success); font-weight: 600; }
.editor__meus summary { font-size: 12.5px; color: var(--color-ink-soft); cursor: pointer; }
.editor__meus ul { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
.editor__meus li { display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding: 6px 8px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
.editor__meus small { color: var(--color-ink-faint); }
.editor__meus button { background: none; border: none; cursor: pointer; color: var(--color-ink-faint); min-width: 32px; min-height: 32px; }
.editor__meus button:hover { color: var(--color-critical); }
</style>
