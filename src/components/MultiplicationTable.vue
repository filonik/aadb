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
  headers: {
    type: Object,
    required: false,
  },
  title: {
    type: String,
    required: false,
  },
})

const rows = computed(() => range(0, props.value.shape[0]))
const cols = computed(() => range(0, props.value.shape[1]))

const options = {
  parenthesis: 'auto', // 'keep',
  implicit: 'hide',
  handler: formatLaTex,
  unescaped: true,
}

const format = (expr) => {
  return expr.toTex(options)
}

const rootRef = ref(null)

const { render } = useMathJax(rootRef)

watch(props, render)
</script>

<template>
  <table ref="rootRef">
    <tr v-if="props.headers">
      <th>${{ title }}$</th>
      <th v-for="j in cols" :key="`col-${j}`">${{ format(props.headers.get(j)) }}$</th>
    </tr>
    <tr v-for="i in rows" :key="`row-${i}`">
      <th v-if="props.headers">${{ format(props.headers.get(i)) }}$</th>
      <td v-for="j in cols" :key="`item-${i}-${j}`">${{ format(value.get(i, j)) }}$</td>
    </tr>
  </table>
</template>

<style scoped>
table {
  border-collapse: collapse;
}

th {
  min-width: 4em;
  min-height: 4em;
  text-align: center;
  background-color: var(--color-border);
}

td {
  min-width: 4em;
  text-align: center;
  border: 1px solid var(--color-border);
}
</style>
