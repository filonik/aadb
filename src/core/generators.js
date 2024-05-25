import * as O from './numeric/operators'
import * as M from './numeric/monoids'

export function mapWith(fn) {
  return function* (xs) {
    for (const x of xs) {
      yield fn(x)
    }
  }
}

export function reduce({ append, empty }) {
  return function (xs) {
    let result = empty
    for (const x of xs) {
      result = append(result, x)
    }
    return result
  }
}

export const all = reduce(M.And)
export const any = reduce(M.Or)

export const sum = reduce(M.Add)
export const product = reduce(M.Mul)
