import ndarray from 'ndarray'
import ndarrayGemm from 'ndarray-gemm'
//import ndarrayFill from 'ndarray-fill'
import ndarrayShow from 'ndarray-show'

import * as A from './arrays'

// Is cwise not working? Something to do with vite bundling?
// Drop-in replacement for now...
function ndarrayFill(array, f) {
  for (let index of A.indices(array.shape)) {
    array.set(...index, f(...index))
  }
}

export function filledWithShape(shape, f) {
  const length = A.product(shape)
  const result = ndarray(Array.from({ length }), shape)
  ndarrayFill(result, f)
  return result
}

export const fromArray = (array) => filledWithShape([array.length], A.getItem(array))

export const mapWith = (fn) => (array) =>
  filledWithShape(array.shape, (...index) => fn(array.get(...index)))

export function toString(array) {
  return ndarrayShow(array)
}

export const getItem = (array) => (index) => array.get(index)
export const getItemR =
  (array) =>
  (...index) =>
    array.get(...index)

export const itemGetter = (index) => (array) => getItem(array)(index)
export const itemGetterR =
  (...index) =>
  (array) =>
    getItemR(array)(...index)

import { S, I } from './symbolic/common'
import * as O from './symbolic/operators'

const items =
  (name) =>
  (...indices) =>
    O.getItem(S(name))(I(...indices))

export const symarr = (name, shape) => filledWithShape(shape, items(name))
export const symvec = (name, length) => symarr(name, [length])
export const symmat = (name, length) => symarr(name, [length, length])

export const unit = (n, k) => filledWithShape([n], (i) => (i == k ? 1 : 0))
export const eye = (n, m) => filledWithShape([n, m], (i, j) => (i == j ? 1 : 0))

export const reflection = (rs) => {
  const n = rs.length
  return filledWithShape([n, n], (i, j) => (i == j ? (rs[i] ? -1 : +1) : 0))
}

export const reflections = (n) => {
  const mask = (i) => A.range(0, n).map((j) => Boolean(i & (1 << j)))
  return A.range(0, 1 << n).map((i) => reflection(mask(i)))
}

export const permutation = (ps) => {
  const n = ps.length
  return filledWithShape([n, n], (i, j) => (i == ps[j] ? 1 : 0))
}

export const permutations = (n) => {
  return A.permutations(A.range(0, n)).map(permutation)
}

export const matmul = (a, b) => {
  const result = filledWithShape([a.shape[0], b.shape[1]], () => 0)
  ndarrayGemm(result, a, b)
  return result
}
