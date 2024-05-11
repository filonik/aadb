import * as O from './numeric/operators'

const length = (array) => array.length
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

export const And = {
  append: O.and,
  empty: true,
}

export const Or = {
  append: O.or,
  empty: false,
}

export const Add = {
  append: O.add,
  empty: 0,
}

export const Mul = {
  append: O.mul,
  empty: 1,
}

export const all = reduce(And)
export const any = reduce(Or)

export const sum = reduce(Add)
export const product = reduce(Mul)

export const CartesianMul = {
  append: (b, c) => b.flatMap((d) => c.map((e) => [...d, e])),
  empty: [[]],
}

export const cartesianProduct = reduce(CartesianMul)

export const indices = (shape) => cartesianProduct(shape.map((upper) => range(0, upper)))
