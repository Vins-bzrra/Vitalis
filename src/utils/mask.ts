export function maskCpf(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function maskCartaoSus(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 15)
    .replace(/(\d{3})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d{1,4})$/, '$1 $2')
}

export function maskTelefone(valor: string): string {
  const limpo = valor.replace(/\D/g, '').slice(0, 11)
  if (limpo.length <= 10) {
    return limpo
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2')
  }
  return limpo
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

export function maskCep(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d{1,3})$/, '$1-$2')
}

export function maskRg(valor: string): string {
  return valor.replace(/[^0-9Xx]/g, '').slice(0, 9)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})([0-9Xx]{1,1})$/, '$1-$2')
}

export function cpfMascarado(cpf: string): string {
  const limpo = cpf.replace(/\D/g, '')
  if (limpo.length < 11) return cpf
  return `${limpo.slice(0, 3)}.***.***-${limpo.slice(9, 11)}`
}

export function susMascarado(sus: string): string {
  const limpo = sus.replace(/\D/g, '')
  if (limpo.length < 15) return sus
  return `${limpo.slice(0, 3)} **** **** ${limpo.slice(11, 15)}`
}
