<script setup>
import { ref, watch } from 'vue'

import { formatLaTex } from '@/core/symbolic/formatters'

import { useMathJax } from '@/composables/useMathJax'

const props = defineProps({
  value: {
    type: Object,
    required: false,
  },
})

const options = {
  parenthesis: 'auto', // 'keep',
  implicit: 'hide',
  handler: formatLaTex,
  unescaped: true,
}

const format = (expr) => {
  return expr ? `$${expr.toTex(options)}$` : undefined
}

const rootRef = ref(null)

const { render } = useMathJax(rootRef)

watch(() => props.value, render)
</script>

<template>
  <span ref="rootRef">{{ format(value) }}</span>
</template>
