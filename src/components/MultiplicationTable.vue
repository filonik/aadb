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
  transition: 0.4s;
}

td {
  min-width: 4em;
  text-align: center;
  border: 1px solid var(--color-border);
  transition: 0.4s;
}

td:hover {
  background-color: hsla(160, 100%, 37%, 0.2);
}

tr:has(td:hover) th,
table:has(tr > td:nth-child(1):hover) tr > th:nth-child(1),
table:has(tr > td:nth-child(2):hover) tr > th:nth-child(2),
table:has(tr > td:nth-child(3):hover) tr > th:nth-child(3),
table:has(tr > td:nth-child(4):hover) tr > th:nth-child(4),
table:has(tr > td:nth-child(5):hover) tr > th:nth-child(5),
table:has(tr > td:nth-child(6):hover) tr > th:nth-child(6),
table:has(tr > td:nth-child(7):hover) tr > th:nth-child(7),
table:has(tr > td:nth-child(8):hover) tr > th:nth-child(8),
table:has(tr > td:nth-child(9):hover) tr > th:nth-child(9),
table:has(tr > td:nth-child(10):hover) tr > th:nth-child(10),
table:has(tr > td:nth-child(11):hover) tr > th:nth-child(11),
table:has(tr > td:nth-child(12):hover) tr > th:nth-child(12),
table:has(tr > td:nth-child(13):hover) tr > th:nth-child(13),
table:has(tr > td:nth-child(14):hover) tr > th:nth-child(14),
table:has(tr > td:nth-child(15):hover) tr > th:nth-child(15),
table:has(tr > td:nth-child(16):hover) tr > th:nth-child(16),
table:has(tr > td:nth-child(17):hover) tr > th:nth-child(17)   {
  background-color: hsla(160, 25%, 37%, 0.2);
}
</style>
