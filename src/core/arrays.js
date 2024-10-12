import * as O from './numeric/operators'
import * as M from './numeric/monoids'

export const length = (array) => array.length

const minimum = (array) => Math.min(...array)
const maximum = (array) => Math.max(...array)

const minimumLength = (arrays) => minimum(arrays.map(length))
const maximumLength = (arrays) => maximum(arrays.map(length))

export const range = (lower, upper) => {
  const length = upper - lower
  return Array.from({ length }, (_, i) => i + lower)
}

export const repeat = (value, length) => {
  return Array.from({ length }).fill(value)
}

export function filledWithShape(shape, f) {
  function _filledWithShape(shape, index) {
    if (shape && shape.length) {
      const [head, ...tail] = shape
      return Array.from({ length: head }, (_, i) => _filledWithShape(tail, [...index, i]))
    } else {
      return f(...index)
    }
  }
  return _filledWithShape(shape, [])
}

export const getItem = (array) => (index) => array[index]
export const itemGetter = (index) => (array) => getItem(array)(index)

export const mapWith = (fn) => (array) => array.map(fn)

export const reduce = ({ append, empty }) =>
  empty === undefined ? (xs) => xs.reduce(append) : (xs) => xs.reduce(append, empty)

export const zipWithShortest =
  (fn) =>
  (...arrays) =>
    Array.from({ length: minimumLength(arrays) }, (_, i) => fn(...arrays.map((a) => a[i])))

export const zipWithLongest =
  (fn) =>
  (...arrays) =>
    Array.from({ length: maximumLength(arrays) }, (_, i) => fn(...arrays.map((a) => a[i])))

export const zipWith = zipWithShortest

export const all = reduce(M.And)
export const any = reduce(M.Or)

export const sum = reduce(M.Add)
export const product = reduce(M.Mul)

export const eq = (xs, ys) => all(zipWith(O.eq)(xs, ys))
export const neq = (xs, ys) => any(zipWith(O.neq)(xs, ys))

export const CartesianMul = {
  append: (b, c) => b.flatMap((d) => c.map((e) => [...d, e])),
  empty: [[]],
}

export const cartesianProduct = reduce(CartesianMul)

export const indices = (shape) => cartesianProduct(shape.map((upper) => range(0, upper)))
