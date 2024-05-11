<script setup>
import { computed, ref, watch } from 'vue'

import { range } from '@/core/arrays'
import { formatLaTex } from '@/core/symbolic/formatters'

import { useMathJax } from '@/composables/useMathJax'

const props = defineProps({
  value: {
    type: Object,
    required: true,
  },
})

const rows = computed(() => range(0, props.value.shape[0]))
const cols = computed(() => range(0, props.value.shape[1]))

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
  <table ref="rootRef">
    <tr v-for="i in rows" :key="`row-${i}`">
      <td v-for="j in cols" :key="`item-${i}-${j}`">${{ format(value.get(i, j)) }}$</td>
    </tr>
  </table>
</template>

<style scoped>
table {
  border-collapse: collapse;
}

td {
  min-width: 4em;
  text-align: center;
  border: 1px solid var(--color-border);
}
</style>
