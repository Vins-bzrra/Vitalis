// Base fictícia de CEPs para simular o preenchimento automático de endereço
// no cadastro do paciente. Não representa uma base real de CEPs.

export interface CepInfo {
  logradouro: string
  bairro: string
  cidade: string
  estado: string
}

export const CEPS_MOCK: Record<string, CepInfo> = {
  '01310-100': { logradouro: 'Avenida Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP' },
  '02011-000': { logradouro: 'Rua Voluntários da Pátria', bairro: 'Santana', cidade: 'São Paulo', estado: 'SP' },
  '03310-000': { logradouro: 'Rua Tupi', bairro: 'Vila Maria', cidade: 'São Paulo', estado: 'SP' },
  '04101-000': { logradouro: 'Rua Vergueiro', bairro: 'Vila Mariana', cidade: 'São Paulo', estado: 'SP' },
  '05407-000': { logradouro: 'Rua Piauí', bairro: 'Pinheiros', cidade: 'São Paulo', estado: 'SP' },
  '20040-020': { logradouro: 'Avenida Rio Branco', bairro: 'Centro', cidade: 'Rio de Janeiro', estado: 'RJ' },
  '30130-010': { logradouro: 'Avenida Afonso Pena', bairro: 'Centro', cidade: 'Belo Horizonte', estado: 'MG' },
}

export async function buscarCep(cep: string): Promise<CepInfo | null> {
  await new Promise((resolve) => setTimeout(resolve, 350))
  const limpo = cep.replace(/\D/g, '')
  const chave = Object.keys(CEPS_MOCK).find((k) => k.replace(/\D/g, '') === limpo)
  if (chave) return CEPS_MOCK[chave]
  // Fallback determinístico para qualquer CEP de 8 dígitos digitado no protótipo
  if (limpo.length === 8) {
    return { logradouro: 'Rua das Palmeiras', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP' }
  }
  return null
}
