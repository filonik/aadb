<script setup>
import { computed, KeepAlive, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import keyalesce from 'keyalesce';

import chroma from "chroma-js";

import ToggleGroup from '@/components/ToggleGroup.vue'
import ToggleGroupItem from '@/components/ToggleGroupItem.vue'

import * as A from '@/core/arrays'
import * as N from '@/core/ndarrays'

import * as AA from '@/core/algebras'

import * as SA from '@/core/symbolic/arrays'
import * as SO from '@/core/symbolic/operators'

import { RR } from '@/core/numeric/operators'
import { SR_Optimized as SR } from '@/core/symbolic/operators'

import { simplify, simplifyFractions } from '@/core/symbolic/expressions'

import { useMathJax } from '@/composables/useMathJax'

import { formatLaTex } from '@/core/symbolic/formatters'

//const DEFAULT_PALETTE = chroma.brewer.Set1
const DEFAULT_PALETTE = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"]
//const DEFAULT_PALETTE = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"]

const DEFAULT_PALETTE_FILL = DEFAULT_PALETTE
const DEFAULT_PALETTE_STROKE = DEFAULT_PALETTE.map((c) => chroma(c).darken(1.5).hex())

const ITERATION_RANGE = [0, 9]

const route = useRoute()

const getDefaultE = (i) => `\\mathbf{e}_{${i}}`

const customNames = (xs) => (xs ? decodeURI(xs).split(',') : [])

const toExpr = (es) => (x) => simplify(AA.toExpr(SR)(es)(N.mapWith(SO.C)(x)))

const state = reactive({
    size: [320, 320],
    generatorIds: [],
    iterations: 3,
    transform: computed(() => {
        const [x, y] = [state.size[0]/2, state.size[1]/2]
        return `scale(${x}, ${-y}) translate(1,-1) scale(0.75, 0.75)`
    })
})

const onDecrement = () => {
    state.iterations = Math.max(state.iterations - 1, ITERATION_RANGE[0])
}

const onIncrement = () => {
    state.iterations = Math.min(state.iterations + 1, ITERATION_RANGE[1])
}

const aa = computed(() => {
  const n = parseInt(route.params.n)
  const id = BigInt(route.params.id)

  const queryEs = customNames(route.query.es)

  const getE = (i) => queryEs[i] ?? getDefaultE(i)

  const es = N.filledWithShape([n], (i) => SO.S(getE(i)))

  const C = AA.toConstants(n, id)

  const basis = AA.defaultBasis(RR)(n)

  return {
    n,
    id,
    C,
    basis,
    es,

  }
})

const aaGraph = computed(() => {
    const {n, C, basis} = aa.value

    const generators = state.generatorIds.map((i) => basis[i])

    const P = N.filledWithShape([2,n], (i, j) => i==0? Math.sin(Math.PI*j/n): Math.cos(Math.PI*j/n))
    
    const _mul = AA.mul(RR)(C)

    const _valueKey = (x) => keyalesce(x.data)
    const _relationKey = ([s,t,g]) => keyalesce([...s.data, ...t.data, ...g.data])

    const _unionValues = A.unionBy(_valueKey)
    const _unionRelations = A.unionBy(_relationKey)

    const colors = new Map(basis.map((x, i) => [_valueKey(x), DEFAULT_PALETTE[i]]))
    
    let relations = []
    let values = basis
    for (let i=0; i<state.iterations; i++) {
        let newRelations = values.flatMap((x) => generators.map((g) => [x, _mul(g, x), g]))
        let newValues = newRelations.map((r) => r[1])
        relations = _unionRelations(relations, newRelations)
        values = _unionValues(values, newValues)
    }

    const nodes = new Map(values.map((x) => {
        const p = N.vecmul(P, x)
        return [_valueKey(x), {
            x: N.getItem(p)(0),
            y: N.getItem(p)(1),
            value: x
        }]
    }))

    const links = new Map(relations.map((r) => {
        const [s, t, g] = r
        return [_relationKey(r), {
            source: nodes.get(_valueKey(s)),
            target: nodes.get(_valueKey(t)),
            stroke: colors.get(_valueKey(g)) ?? 'var(--color-border)'
        }]
    }))

    console.log(links)
    return {
        nodes, links
    }
})

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

watch(aa, render)
watch(state, render)
</script>

<template>
    <main ref="rootRef" style="display: flex; flex-direction: column; gap: 1rem">
        <h2>Graph</h2>
        <ToggleGroup style="display: flex; flex-direction: row; align-items: center; justify-content: center;" v-model="state.generatorIds">
            <ToggleGroupItem v-for="(e, i) in aa.basis" :key="i" :value="i"  v-slot="{selected}" >
                <div style="display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem;" :style="{'background-color':selected? DEFAULT_PALETTE_FILL[i]: 'var(--color-background-mute)'}">
                    ${{ format(toExpr(aa.es)(e)) }}$
                </div>
            </ToggleGroupItem> 
        </ToggleGroup>
        <div style="display: flex; flex-direction: row; align-items: center; justify-content: center;">
            <button @click="onDecrement">-</button>
            <div style="display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; border: 1px solid var(--color-border);">{{ state.iterations }}</div>
            <button @click="onIncrement">+</button>
        </div>
        <div style="display: flex; flex-direction: row; align-items: center; justify-content: center;">
            <svg :width="state.size[0]" :height="state.size[1]">
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="15" refY="3" orient="auto" markerUnits="strokeWidth" fill="context-stroke">
                        <path d="M0,0 L0,6 L9,3 z"/>
                    </marker>
                </defs>
                <g :transform="state.transform">
                    <g v-for="(link, i) in aaGraph.links.values()" :key="i">
                        <line :x1="link.source.x" :y1="link.source.y" :x2="link.target.x" :y2="link.target.y" :stroke="link.stroke"  marker-end="url(#arrow)" />
                    </g>
                    <g v-for="(node, i) in aaGraph.nodes.values()" :key="i" :transform="`translate(${node.x},${node.y}) scale(0.01,-0.01)`">
                        <circle cx="0" cy="0" r="5" stroke-width="1" />
                        <foreignObject x="-40" y="-40" width="80" height="40">
                            <div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: center; justify-content: center; color: var(--color-text); height:100%;">
                                ${{ format(toExpr(aa.es)(node.value)) }}$
                            </div>
                        </foreignObject>
                    </g>
                </g>
            </svg>
        </div>
    </main>
</template>

<style>
button {
    background-color: var(--color-background-mute);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    width: 2rem;
    height: 2rem;
}

circle {
    fill: var(--color-background-mute);
    stroke: var(--color-border);
}

line {
    stroke-width: 0.01;
}

g > foreignObject {
    visibility: hidden;
}

g:hover > foreignObject {
    visibility: visible;
}

</style>