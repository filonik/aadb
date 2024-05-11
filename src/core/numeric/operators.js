export const and = (x, y) => x && y
export const or = (x, y) => x || y
export const not = (x) => !x

export const eq = (x, y) => x == y
export const neq = (x, y) => x != y

export const lt = (x, y) => x < y
export const gt = (x, y) => x > y
export const leq = (x, y) => x <= y
export const geq = (x, y) => x >= y

export const add = (x, y) => x + y
export const sub = (x, y) => x - y
export const mul = (x, y) => x * y
export const div = (x, y) => x / y

export const quotient = (x, y) => Math.trunc(x / y)
export const remainder = (x, y) => x % y

export const add_inv = (x) => 0 - x
export const mul_inv = (x) => 1 / x

export const min = (x, y) => (x < y ? x : y)
export const max = (x, y) => (x > y ? x : y)

export const mod = (n, m) => ((n % m) + m) % m

export const RR = {
  zero: 0,
  one: 1,
  add,
  add_inv,
  mul,
  mul_inv,
}
