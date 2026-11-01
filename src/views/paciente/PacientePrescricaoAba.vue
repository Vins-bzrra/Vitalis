<script setup lang="ts">
import type { Atendimento, Paciente } from '@/types'
import PacientePrescricoes from './PacientePrescricoes.vue'
import PacienteMedicamentos from './PacienteMedicamentos.vue'

// Prescrição hospitalar e aprazamento/administração na mesma aba: o médico vê
// o que prescreveu e a enfermagem checa os horários, sem trocar de tela.
defineProps<{ paciente: Paciente; atendimento: Atendimento | null }>()
</script>

<template>
  <div class="aba-prescricao">
    <PacientePrescricoes :paciente="paciente" :atendimento="atendimento" />
    <PacienteMedicamentos :paciente="paciente" :atendimento="atendimento" />
  </div>
</template>

<style scoped>
.aba-prescricao { display: flex; flex-direction: column; gap: var(--space-4); }
</style>
