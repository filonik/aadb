<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import BooleanOutput from '@/components/BooleanOutput.vue'
import DetailsOutput from '@/components/DetailsOutput.vue'
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

const toArrExpr = (array) => SA.filledWithShape(array.shape, N.getItemR(array))

const route = useRoute()

const getDefaultE = (i) => `\\mathbf{e}_{${i}}`
const getDefaultX = (i) => `x^{${i}}`
const getDefaultY = (i) => `y^{${i}}`

const customNames = (xs) => (xs ? decodeURI(xs).split(',') : [])

const base = computed(() => {
  const n = parseInt(route.params.n)
  const id = BigInt(route.params.id)

  const queryEs = customNames(route.query.es)
  const queryXs = customNames(route.query.xs)
  const queryYs = customNames(route.query.ys)

  const getE = (i) => queryEs[i] ?? getDefaultE(i)
  const getX = (i) => queryXs[i] ?? getDefaultX(i)
  const getY = (i) => queryYs[i] ?? getDefaultY(i)

  const es = N.filledWithShape([n], (i) => SO.S(getE(i)))
  const xs = N.filledWithShape([n], (i) => SO.S(getX(i)))
  const ys = N.filledWithShape([n], (i) => SO.S(getY(i)))

  //const es = N.symvec('e', n)
  //const xs = N.symvec('x', n)
  //const ys = N.symvec('y', n)

  const C = AA.toConstants(n, id)

  const SC = N.mapWith(SO.C)(C)

  const SA = {
    C: SC,
    adds: AA.adds(SR)(SC),
    subs: AA.subs(SR)(SC),
    muls: AA.muls(SR)(SC),
    divs: AA.divs(SR)(SC),
    add: AA.add(SR)(SC),
    sub: AA.sub(SR)(SC),
    mul: AA.mul(SR)(SC),
  }

  const toExpr = AA.toExpr(SR)

  return {
    n,
    id,
    es,
    xs,
    ys,
    C,
    SA,
    toExpr,
  }
})

const aa = computed(() => {
  const { n, id, es, C, SA, toExpr } = base.value

  const prevId = (id - 1n).toString()
  const nextId = (id + 1n).toString()

  const _mulTable = AA.mulTable(SR)(SA.C)

  const M = N.mapWith(simplify)(_mulTable(es))

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

  return {
    n,
    id,
    prevId,
    nextId,
    es,
    C,
    M,
    properties,
  }
})

const aaEqs = computed(() => {
  const { es, xs, ys, C, SA, toExpr } = base.value

  const _x = SO.S('\\mathbf{x}')
  const _y = SO.S('\\mathbf{y}')
  const _xy = SO.mul(_x, _y)

  const xy = N.mapWith(simplify)(SA.mul(xs, ys))

  const eqxy = SO.eq(_xy, simplify(toExpr(es)(xy)))

  const lunit = AA.lunit(RR)(C)
  const runit = AA.runit(RR)(C)

  const SOC = (x) => SO.C(simplifyFractions(x))
  const slunit = lunit ? N.mapWith(SOC)(lunit) : undefined
  const srunit = runit ? N.mapWith(SOC)(runit) : undefined

  const eqlunit = slunit ? SO.eq(_x, simplify(toExpr(es)(slunit))) : undefined
  const eqrunit = srunit ? SO.eq(_y, simplify(toExpr(es)(srunit))) : undefined

  return {
    xy,
    eqxy,
    lunit,
    runit,
    eqlunit,
    eqrunit,
  }
})

const aaMatReprs = computed(() => {
  const { xs, ys, SA } = base.value
  const { xy } = aaEqs.value

  const _matReprL = AA.matReprL(SR)(SA.C)
  const _matReprR = AA.matReprR(SR)(SA.C)

  const X = N.mapWith(simplify)(_matReprL(xs))
  const Y = N.mapWith(simplify)(_matReprR(ys))

  const sx = toArrExpr(xs)
  const sy = toArrExpr(ys)

  const SX = toArrExpr(X)
  const SY = toArrExpr(Y)

  const sxy = toArrExpr(xy)

  const T = (x) => SR.pow(x, SO.S('T'))

  const eqXy = SO.eq(SO.mul(SX, sy), sxy)
  const eqxY = SO.eq(SO.mul(T(sx), T(SY)), T(sxy))

  return {
    eqXy,
    eqxY,
  }
})

const commutator =
  ({ divs, sub, mul }) =>
  (x, y) =>
    divs(sub(mul(x, y), mul(y, x)), SO.C(2))

const antiCommutator =
  ({ divs, add, mul }) =>
  (x, y) =>
    divs(add(mul(x, y), mul(y, x)), SO.C(2))

const aaCommutatorTable = computed(() => {
  const { n, es, SA } = base.value

  const _toExpr = AA.toExpr(SR)

  const defaultBasis = A.filledWithShape([n], (i) =>
    N.filledWithShape([n], (j) => (i == j ? SO.C(1) : SO.C(0))),
  )

  const _commutatorTable = AA.table(commutator(SA))(defaultBasis)
  const commutatorTable = N.mapWith((x) => simplify(_toExpr(es)(x)))(_commutatorTable)

  return commutatorTable
})

const aaAntiCommutatorTable = computed(() => {
  const { n, es, SA } = base.value

  const _toExpr = AA.toExpr(SR)

  const defaultBasis = A.filledWithShape([n], (i) =>
    N.filledWithShape([n], (j) => (i == j ? SO.C(1) : SO.C(0))),
  )
  const _commutatorTable = AA.table(antiCommutator(SA))(defaultBasis)
  const commutatorTable = N.mapWith((x) => simplify(_toExpr(es)(x)))(_commutatorTable)

  return commutatorTable
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
      <DetailsOutput>
        <template v-slot:summary>Equations</template>
        <section>
          <h4>Multiplication</h4>
          <ExpressionOutput :value="aaEqs.eqxy" />
        </section>
        <section>
          <h4>Units</h4>
          <!--
          <p>Left: {{ aa.properties.lunit }}</p>
          <p>Right: {{ aa.properties.runit }}</p>
          -->
          <p><ExpressionOutput :value="aaEqs.eqlunit" /></p>
          <p><ExpressionOutput :value="aaEqs.eqrunit" /></p>
        </section>
      </DetailsOutput>
    </section>
    <section>
      <DetailsOutput>
        <template v-slot:summary>Matrix Representations</template>
        <section>
          <h4>Left Representation</h4>
          <p><ExpressionOutput :value="aaMatReprs.eqXy" /></p>
        </section>
        <section>
          <h4>Right Representation</h4>
          <p><ExpressionOutput :value="aaMatReprs.eqxY" /></p>
        </section>
      </DetailsOutput>
    </section>
    <section>
      <DetailsOutput>
        <template v-slot:summary>Tables</template>
        <section>
          <h4>Commutator Table</h4>
          <MultiplicationTable
            :value="aaCommutatorTable"
            :headers="aa.es"
            :title="'\\left[\\mathbf{x},\\mathbf{y}\\right]'"
          />
        </section>
        <section>
          <h4>Anti-Commutator Table</h4>
          <MultiplicationTable
            :value="aaAntiCommutatorTable"
            :headers="aa.es"
            :title="'\\left\\{\\mathbf{x},\\mathbf{y}\\right\\}'"
          />
        </section>
      </DetailsOutput>
    </section>
    <section>
      <DetailsOutput>
        <template v-slot:summary>Structure Constants</template>
        <p>{{ aa.C.data }}</p>
        <!--
        <p>{{ AA.toBase64(BigInt(aa.id)) }}</p>
        -->
      </DetailsOutput>
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
