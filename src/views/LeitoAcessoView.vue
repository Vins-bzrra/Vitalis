<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BedDouble } from 'lucide-vue-next'
import { useInstitucionalStore } from '@/stores/institucional'
import { useAuthStore } from '@/stores/auth'
import { auditService } from '@/services/auditService'
import { rotaProntuario } from '@/utils/patientAccess'
import UiButton from '@/components/ui/UiButton.vue'

// Destino do QR Code colado no leito. A rota exige login (guard global): o
// QR só encurta o caminho, nunca dispensa autenticação. Resolve o ocupante
// ATUAL do leito e redireciona para o prontuário dele.
const props = defineProps<{ numero: string }>()
const institucional = useInstitucionalStore()
const auth = useAuthStore()
const router = useRouter()
const mensagem = ref('Localizando paciente do leito...')

onMounted(async () => {
  await institucional.carregarLeitos()
  const leito = institucional.leitos.find((l) => l.numero.toLowerCase() === props.numero.toLowerCase())
  if (!leito) { mensagem.value = `Leito ${props.numero} não encontrado.`; return }
  if (!leito.pacienteId) { mensagem.value = `O leito ${leito.numero} (${leito.setor}) está sem paciente no momento.`; return }

  if (auth.usuario) {
    auditService.registrar({
      usuario: auth.usuario.nome,
      perfil: auth.usuario.perfil,
      acao: 'Acessou paciente via QR Code do leito',
      entidade: 'Leito',
      entidadeId: leito.numero,
      detalhes: `Leitura do QR Code do leito ${leito.numero} (${leito.setor}).`,
    })
  }
  router.replace(rotaProntuario(leito.pacienteId))
})
</script>

<template>
  <div class="leito-acesso">
    <BedDouble :size="36" />
    <p>{{ mensagem }}</p>
    <UiButton variant="secondary" @click="router.push('/dashboard')">Ir para o painel</UiButton>
  </div>
</template>

<style scoped>
.leito-acesso { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-8) var(--space-4); text-align: center; color: var(--color-ink-soft); }
.leito-acesso p { font-size: 14px; max-width: 360px; }
</style>
