<script setup>
import { ref, watch } from 'vue'

import { formatLaTex } from '@/core/symbolic/formatters'

import { useMathJax } from '@/composables/useMathJax'

const props = defineProps({
  value: {
    type: Object,
    required: true,
  },
})

const options = {
  parenthesis: 'auto', // 'keep',
  implicit: 'hide',
  handler: formatLaTex,
}

const format = (expr) => {
  return expr.toTex(options)
}

const rootRef = ref(null)

const { render } = useMathJax(rootRef)

watch(() => props.value, render)
</script>

<template>
  <span ref="rootRef">${{ format(value) }}$</span>
</template>
