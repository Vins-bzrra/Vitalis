import type { Alergia, Comorbidade, Medicamento } from '@/types'

const HOJE = '2026-09-25'

function splitLista(texto: string): string[] {
  return texto.split(',').map((t) => t.trim()).filter(Boolean)
}

export function parseAlergias(texto: string): Alergia[] {
  return splitLista(texto).map((substancia, i) => ({
    id: `alg-novo-${Date.now()}-${i}`,
    substancia,
    tipo: 'outro',
    gravidade: 'moderada',
    reacao: 'Não especificada no cadastro',
    identificadoEm: HOJE,
  }))
}

export function parseMedicamentos(texto: string): Medicamento[] {
  return splitLista(texto).map((entrada, i) => ({
    id: `med-novo-${Date.now()}-${i}`,
    nome: entrada,
    dose: '',
    via: 'Oral',
    frequencia: 'Conforme prescrição',
    uso: 'continuo',
    inicioEm: HOJE,
  }))
}

export function parseComorbidades(texto: string): Comorbidade[] {
  return splitLista(texto).map((nome, i) => ({ id: `com-novo-${Date.now()}-${i}`, nome }))
}
