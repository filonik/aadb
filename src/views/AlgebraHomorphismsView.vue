<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import ExpressionOutput from '@/components/ExpressionOutput.vue'

import * as A from '@/core/arrays'
import * as N from '@/core/ndarrays'

import * as AA from '@/core/algebras'

import * as SA from '@/core/symbolic/arrays'
import * as SO from '@/core/symbolic/operators'

import { RR } from '@/core/numeric/operators'
//import { SR_Optimized as SR } from '@/core/symbolic/operators'

import { Matrix, inverse } from 'ml-matrix'

const route = useRoute()

const toArrExpr = (array) =>
  SA.filledWithShape(array.shape, (...index) => SO.C(N.getItemR(array)(...index)))

const state = computed(() => {
  const n = parseInt(route.params.n)
  const id = BigInt(route.params.id)

  /*
  const C = AA.toConstants(n, id)

  const Ps = A.permutations(n).map((P) => new Matrix(P))
  const Rs = A.reflections(n).map((R) => new Matrix(R))

  const Ds = A.table((R, P) => {
    const RP = R.mmul(P)
    const RPinv = inverse(RP)
    const D = AA.sw(RR)(C, N.fromMatrix(RP), N.fromMatrix(RPinv))
    return AA.fromConstants(D)
  })(Rs, Ps)
  */

  const similarIds = AA.similarIds(RR)([n, id])

  return {
    n,
    id,
    similarIds,
  }
})

const toLink = (cid) => {
  const [n, id] = cid
  return `/${n}/${id}`
}
</script>

<template>
  <ul>
    <li v-for="(id, i) of state.similarIds" :key="i">
      <RouterLink :to="toLink(id)">{{ toLink(id) }}</RouterLink>
    </li>
  </ul>
  <!--
  <table>
    <tr v-for="i of A.range(0, state.Rs.length)" :key="i">
      <td v-for="j of A.range(0, state.Ps.length)" :key="j">
        <ExpressionOutput :value="toArrExpr(state.RPs[i][j])" /> 
      </td>
    </tr>
  </table>
  -->
</template>

<style></style>
