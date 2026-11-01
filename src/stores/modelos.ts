import { defineStore } from 'pinia'
import type { ModeloEvolucao, ModeloReceita } from '@/types'

// Modelos reutilizáveis: perfis de evolução por especialidade e receitas
// padronizadas (ex.: "Diabetes — 3 medicações"), para não redigitar tudo a
// cada paciente. Os modelos criados pelo usuário ficam salvos no navegador.

const MODELOS_EVOLUCAO_PADRAO: ModeloEvolucao[] = [
  {
    id: 'me-clinica', nome: 'Clínica médica — SOAP', especialidade: 'Clínica Médica',
    texto: 'S: \n\nO: BEG, corado, hidratado, eupneico.\nACV: RCR 2T BNF s/ sopros.\nAR: MV+ bilateralmente s/ RA.\nABD: flácido, indolor, RHA+.\nEXT: sem edemas, panturrilhas livres.\n\nA: \n\nP: ',
  },
  {
    id: 'me-orto', nome: 'Ortopedia — curta', especialidade: 'Ortopedia',
    texto: 'Paciente em ___ DPO de ___.\nQueixas: \nCurativo: limpo e seco.\nPerfusão distal preservada, sem déficit neurovascular.\nConduta: ',
  },
  {
    id: 'me-cirurgia', nome: 'Cirurgia geral — pós-operatório', especialidade: 'Cirurgia Geral',
    texto: '___ DPO de ___.\nDieta: \nDiurese / evacuação: \nFerida operatória: \nDrenos: \nConduta: ',
  },
  {
    id: 'me-uti', nome: 'UTI — por sistemas', especialidade: 'UTI',
    texto: 'Neuro: \nHemodinâmico: \nRespiratório: \nRenal / BH: \nInfeccioso: \nMetabólico: \nConduta: ',
  },
]

const MODELOS_RECEITA_PADRAO: ModeloReceita[] = [
  {
    id: 'mr-dm2', nome: 'Diabetes tipo 2 — básico',
    itens: [
      { medicamento: 'Metformina 850mg', posologia: 'Tomar 1 comprimido após café da manhã e jantar', quantidade: '60 comprimidos' },
      { medicamento: 'Glicazida MR 30mg', posologia: 'Tomar 1 comprimido no café da manhã', quantidade: '30 comprimidos' },
      { medicamento: 'Sinvastatina 20mg', posologia: 'Tomar 1 comprimido à noite', quantidade: '30 comprimidos' },
    ],
    orientacoes: 'Manter dieta e atividade física. Retorno na UBS em 30 dias com glicemia de jejum e HbA1c.',
  },
  {
    id: 'mr-has', nome: 'Hipertensão — básico',
    itens: [
      { medicamento: 'Losartana 50mg', posologia: 'Tomar 1 comprimido de 12/12h', quantidade: '60 comprimidos' },
      { medicamento: 'Hidroclorotiazida 25mg', posologia: 'Tomar 1 comprimido pela manhã', quantidade: '30 comprimidos' },
    ],
    orientacoes: 'Reduzir sal na dieta. Aferir a pressão na UBS semanalmente.',
  },
  {
    id: 'mr-asma', nome: 'Crise asmática — alta',
    itens: [
      { medicamento: 'Salbutamol spray 100mcg', posologia: 'Inalar 4 jatos com espaçador de 4/4h se falta de ar', quantidade: '1 frasco' },
      { medicamento: 'Prednisona 20mg', posologia: 'Tomar 2 comprimidos pela manhã por 5 dias', quantidade: '10 comprimidos' },
    ],
    orientacoes: 'Retornar ao PS se falta de ar persistente ou piora.',
  },
]

const CHAVE = 'propprontuario-modelos'

function lerSalvos(): { evolucao: ModeloEvolucao[]; receita: ModeloReceita[] } {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (bruto) return JSON.parse(bruto)
  } catch { /* armazenamento indisponível */ }
  return { evolucao: [], receita: [] }
}

export const useModelosStore = defineStore('modelos', {
  state: () => {
    const salvos = lerSalvos()
    return {
      evolucaoProprios: salvos.evolucao as ModeloEvolucao[],
      receitaProprios: salvos.receita as ModeloReceita[],
    }
  },
  getters: {
    modelosEvolucao: (s) => [...s.evolucaoProprios, ...MODELOS_EVOLUCAO_PADRAO],
    modelosReceita: (s) => [...s.receitaProprios, ...MODELOS_RECEITA_PADRAO],
  },
  actions: {
    persistir() {
      try {
        localStorage.setItem(CHAVE, JSON.stringify({ evolucao: this.evolucaoProprios, receita: this.receitaProprios }))
      } catch { /* armazenamento indisponível */ }
    },
    salvarModeloEvolucao(nome: string, especialidade: string, texto: string) {
      this.evolucaoProprios.unshift({ id: `me-${Date.now()}`, nome, especialidade, texto, proprio: true })
      this.persistir()
    },
    salvarModeloReceita(modelo: Omit<ModeloReceita, 'id'>) {
      this.receitaProprios.unshift({ ...modelo, id: `mr-${Date.now()}` })
      this.persistir()
    },
    removerModeloEvolucao(id: string) {
      this.evolucaoProprios = this.evolucaoProprios.filter((m) => m.id !== id)
      this.persistir()
    },
    removerModeloReceita(id: string) {
      this.receitaProprios = this.receitaProprios.filter((m) => m.id !== id)
      this.persistir()
    },
  },
})
