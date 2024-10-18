<script setup>
import { ref, watch } from 'vue'

const emit = defineEmits(['show', 'hide'])

const isOpen = ref(false)

function onMyToggle(e) {
  const detailsElement = e.target
  if (detailsElement.open) {
    if (!isOpen.value) {
      isOpen.value = true
      emit('show')
    }
  } else {
    if (isOpen.value) {
      isOpen.value = false
      emit('hide')
    }
  }
}
</script>

<template>
  <details @toggle="onMyToggle">
    <summary>
      <slot name="summary"></slot>
    </summary>
    <slot v-if="isOpen"></slot>
  </details>
</template>
