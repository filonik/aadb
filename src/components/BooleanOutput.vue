<script setup>
const props = defineProps({
  value: {
    type: Boolean,
    required: true,
  },
})
</script>

<template>
  <span>{{ value ? '✅' : '❌' }}</span>
</template>
