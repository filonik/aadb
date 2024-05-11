<script setup>
import { computed, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import BooleanOutput from '@/components/BooleanOutput.vue'
import ExpressionOutput from '@/components/ExpressionOutput.vue'
import MultiplicationTable from '@/components/MultiplicationTable.vue'

import * as AA from '@/core/algebras'

import * as A from '@/core/arrays'
import * as N from '@/core/ndarrays'

import { simplify } from '@/core/symbolic/expressions'

import { SR_Optimized as SR } from '@/core/symbolic/operators'
import { RR } from '@/core/numeric/operators'

import * as SA from '@/core/symbolic/arrays'
import * as SO from '@/core/symbolic/operators'

const route = useRoute()

const toArrExpr = (array) => SA.filledWithShape(array.shape, N.getItemR(array))

const aa = computed(() => {
  const n = parseInt(route.params.n)
  const id = BigInt(route.params.id)

  const prevId = (id - 1n).toString()
  const nextId = (id + 1n).toString()

  const es = N.symvec('e', n)
  const xs = N.symvec('x', n)
  const ys = N.symvec('y', n)

  const C = AA.toConstants(n, id)

  const SC = N.mapWith(SO.C)(C)

  const _toExpr = AA.toExpr(SR)
  const _mulTable = AA.mulTable(SR)(SC)
  const _matReprL = AA.matReprL(SR)(SC)
  const _matReprR = AA.matReprR(SR)(SC)
  const _mul = AA.mul(SR)(SC)

  const M = N.mapWith(simplify)(_mulTable(es))

  const X = N.mapWith(simplify)(_matReprL(xs))
  const Y = N.mapWith(simplify)(_matReprR(ys))

  const xy = N.mapWith(simplify)(_mul(xs, ys))

  const sx = toArrExpr(xs)
  const sy = toArrExpr(ys)

  const SX = toArrExpr(X)
  const SY = toArrExpr(Y)

  const sxy = toArrExpr(xy)

  //const X = math.parse('matrix([[1,2],[3,4]])')
  //const X = SA.A([SA.A([SO.C(1), SO.C(2)]), SA.A([SO.C(3), SO.C(4)])])

  //N.mapWith(simplify)(_matReprL(xs))

  const eqXy = SO.eq(SO.mul(SX, sy), sxy)
  const eqxY = SO.eq(SO.mul(sx, SY), sxy)

  const _x = SO.S('\\mathbf{x}')
  const _y = SO.S('\\mathbf{y}')
  const _xy = SO.mul(_x, _y)

  const eqxy = SO.eq(_xy, simplify(_toExpr(es)(xy)))

  const commutative = AA.isCommutative(RR)(C)
  const antiCommutative = AA.isAntiCommutative(RR)(C)

  const associative = AA.isAssociative(RR)(C)
  const antiAssociative = AA.isAntiAssociative(RR)(C)

  const alternative = associative || AA.isAlternative(RR)(C)
  const antiAlternative = antiAssociative || AA.isAntiAlternative(RR)(C)

  const powerAssociative = alternative || AA.isPowerAssociative(RR)(C)
  const antiPowerAssociative = antiAlternative || AA.isAntiPowerAssociative(RR)(C)

  const properties = {
    commutative,
    antiCommutative,
    associative,
    antiAssociative,
    //leftAlternative: AA.isLeftAlternative(RR)(C)
    //flexible: commutative || associative || AA.isFlexible(RR)(C),
    //rightAlternative: AA.isRightAlternative(RR)(C)
    alternative,
    antiAlternative,
    powerAssociative,
    antiPowerAssociative,
    jacobian: AA.isJacobian(RR)(C),
  }

  return { n, id, prevId, nextId, eqXy, eqxY, C, SC, M, X, Y, SX, SY, eqxy, properties }
})
</script>

<template>
  <main>
    <section style="display: flex; flex-direction: row">
      <h2 style="flex-grow: 1">
        Algebra <sub>{{ aa.n }}/{{ aa.id }}</sub>
      </h2>
      <RouterLink :to="`/${aa.n}/${aa.prevId}`">&lt;&lt;</RouterLink>
      <RouterLink :to="`/${aa.n}/${aa.nextId}`">&gt;&gt;</RouterLink>
    </section>
    <section>
      <h3>Multiplication Table</h3>
      <MultiplicationTable :value="aa.M" />
    </section>
    <section>
      <h3>Multiplication</h3>
      <ExpressionOutput :value="aa.eqxy" />
    </section>
    <section>
      <h3>Matrix Representation</h3>
      <ExpressionOutput :value="aa.eqXy" />
      <!--
      <ExpressionOutput :value="aa.eqxY" />
      -->
    </section>
    <section>
      <h3>Properties</h3>
      <p>
        Commutative: <BooleanOutput :value="aa.properties.commutative" /> / Anti-Commutative:
        <BooleanOutput :value="aa.properties.antiCommutative" />
      </p>
      <p>
        Associative: <BooleanOutput :value="aa.properties.associative" /> / Anti-Associative:
        <BooleanOutput :value="aa.properties.antiAssociative" />
      </p>
      <p>
        Alternative: <BooleanOutput :value="aa.properties.alternative" /> / Anti-Alternative:
        <BooleanOutput :value="aa.properties.antiAlternative" />
      </p>
      <p>
        Power-Associative: <BooleanOutput :value="aa.properties.powerAssociative" /> /
        Anti-Power-Associative: <BooleanOutput :value="aa.properties.antiPowerAssociative" />
      </p>
      <p>Jacobian: <BooleanOutput :value="aa.properties.jacobian" /></p>
    </section>
    <section>
      <h3>Structure Constants</h3>
      {{ aa.C.data }}
    </section>
  </main>
</template>

<style>
sub {
  color: var(--color-border-hover);
  font-size: small;
}
section {
  margin: 1em 0;
}
</style>
