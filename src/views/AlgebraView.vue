<script setup>
import { computed, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import BooleanOutput from '@/components/BooleanOutput.vue'
import ExpressionOutput from '@/components/ExpressionOutput.vue'
import MultiplicationTable from '@/components/MultiplicationTable.vue'

import * as AA from '@/core/algebras'

import * as A from '@/core/arrays'
import * as N from '@/core/ndarrays'
import * as O from '@/core/numeric/operators'

import { simplify, simplifyFractions } from '@/core/symbolic/expressions'

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
  const _add = AA.add(SR)(SC)
  const _sub = AA.sub(SR)(SC)
  const _mul = AA.mul(SR)(SC)
  const _divs = AA.divs(SR)(SC)

  const _antiCommutator = (x, y) => _divs(_add(_mul(x, y), _mul(y, x)), SO.C(2))
  const _commutator = (x, y) => _divs(_sub(_mul(x, y), _mul(y, x)), SO.C(2))

  const defaultBasis = A.filledWithShape([n], (i) =>
    N.filledWithShape([n], (j) => (i == j ? SO.C(1) : SO.C(0))),
  )
  const _commutatorTable = AA.table(_commutator)(defaultBasis)
  const commutatorTable = N.mapWith((x) => simplify(_toExpr(es)(x)))(_commutatorTable)

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

  const lunit = AA.lunit(RR)(C)
  const runit = AA.runit(RR)(C)

  const SOC = (x) => SO.C(simplifyFractions(x))
  const slunit = lunit ? N.mapWith(SOC)(lunit) : undefined
  const srunit = runit ? N.mapWith(SOC)(runit) : undefined

  const eqlunit = slunit ? SO.eq(_x, simplify(_toExpr(es)(slunit))) : undefined
  const eqrunit = srunit ? SO.eq(_y, simplify(_toExpr(es)(srunit))) : undefined

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
    lunit,
    runit,
    eqlunit,
    eqrunit,
  }

  return {
    n,
    id,
    prevId,
    nextId,
    es,
    eqXy,
    eqxY,
    C,
    SC,
    M,
    X,
    Y,
    SX,
    SY,
    eqxy,
    properties,
    commutatorTable,
  }
})
</script>

<template>
  <main>
    <section style="display: flex; flex-direction: row">
      <h2
        style="
          flex-grow: 1;
          display: flex;
          flex-direction: row;
          align-items: end;
          overflow: hidden;
          gap: 0.25rem;
        "
      >
        Algebra
        <sub style="overflow: hidden; text-overflow: ellipsis">{{ aa.n }}/{{ aa.id }}</sub>
      </h2>
      <RouterLink :to="`/${aa.n}/${aa.prevId}`">&lt;&lt;</RouterLink>
      <RouterLink :to="`/${aa.n}/${aa.nextId}`">&gt;&gt;</RouterLink>
    </section>
    <section>
      <h3>Multiplication Table</h3>
      <MultiplicationTable :value="aa.M" :headers="aa.es" :title="'\\mathbf{x}\\mathbf{y}'" />
    </section>
    <section>
      <h3>Multiplication</h3>
      <ExpressionOutput :value="aa.eqxy" />
    </section>
    <section>
      <h3>Units</h3>
      <!--
      <p>Left: {{ aa.properties.lunit }}</p>
      <p>Right: {{ aa.properties.runit }}</p>
      -->
      <p><ExpressionOutput :value="aa.properties.eqlunit" /></p>
      <p><ExpressionOutput :value="aa.properties.eqrunit" /></p>
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
      <h3>Commutator Table</h3>
      <MultiplicationTable
        :value="aa.commutatorTable"
        :headers="aa.es"
        :title="'\\left[\\mathbf{x},\\mathbf{y}\\right]'"
      />
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
