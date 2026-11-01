import QRCode from 'qrcode'

// O QR Code identifica o LEITO, não o paciente: a etiqueta impressa fica
// colada no leito e continua válida quando o ocupante muda. Ao escanear, o
// profissional cai em /leito/<número>, que exige login e redireciona para o
// prontuário de quem estiver no leito naquele momento.
export function urlDoLeito(numero: string): string {
  return `${window.location.origin}/leito/${encodeURIComponent(numero)}`
}

export function gerarQrLeito(numero: string, tamanho = 240): Promise<string> {
  return QRCode.toDataURL(urlDoLeito(numero), { width: tamanho, margin: 1, errorCorrectionLevel: 'M' })
}
