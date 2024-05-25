import * as O from './operators'

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
