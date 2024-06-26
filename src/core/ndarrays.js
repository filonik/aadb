import ndarray from 'ndarray'
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
