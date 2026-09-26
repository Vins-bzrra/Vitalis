export function calcularIdade(dataNascimento: string): number {
  const nasc = new Date(dataNascimento)
  const hoje = new Date('2026-09-25')
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

export function formatarData(data: string): string {
  if (!data) return ''
  const [ano, mes, dia] = data.split('T')[0].split('-')
  return `${dia}/${mes}/${ano}`
}

export function formatarDataHora(dataIso: string): string {
  if (!dataIso) return ''
  const d = new Date(dataIso)
  const data = formatarData(dataIso)
  const hora = d.toTimeString().slice(0, 5)
  return `${data} às ${hora}`
}

export function formatarDataHoraCurta(data: string, hora: string): string {
  return `${formatarData(data)} · ${hora}`
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

export function tempoDecorrido(dataIso: string): string {
  const inicio = new Date(dataIso).getTime()
  const agora = new Date('2026-09-25T12:00:00').getTime()
  const diffMin = Math.floor((agora - inicio) / 60000)
  if (diffMin < 60) return `${diffMin} min`
  const horas = Math.floor(diffMin / 60)
  if (horas < 24) return `${horas}h ${diffMin % 60}min`
  const dias = Math.floor(horas / 24)
  return `${dias}d ${horas % 24}h`
}
