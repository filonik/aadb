import { math, C, S } from './common'

export const and = (x, y) => new math.OperatorNode('and', 'and', [x, y])
export const or = (x, y) => new math.OperatorNode('or', 'or', [x, y])
export const not = (x) => new math.OperatorNode('not', 'not', [x])

export const eq = (x, y) => new math.OperatorNode('==', 'equal', [x, y])
export const neq = (x, y) => new math.OperatorNode('!=', 'unequal', [x, y])

export const lt = (x, y) => new math.OperatorNode('<', 'smaller', [x, y])
export const gt = (x, y) => new math.OperatorNode('>', 'larger', [x, y])
export const leq = (x, y) => new math.OperatorNode('<=', 'smallerEq', [x, y])
export const geq = (x, y) => new math.OperatorNode('>=', 'largerEq', [x, y])

export const add = (x, y) => new math.OperatorNode('+', 'add', [x, y])
export const sub = (x, y) => new math.OperatorNode('-', 'subtract', [x, y])
export const mul = (x, y) => new math.OperatorNode('*', 'multiply', [x, y], true)
export const div = (x, y) => new math.OperatorNode('/', 'divide', [x, y])

export const pos = (x) => new math.OperatorNode('+', 'unaryPlus', [x])
export const neg = (x) => new math.OperatorNode('-', 'unaryMinus', [x])

export const pow = (x, y) => new math.OperatorNode('^', 'pow', [x, y])

export const getItem = (array) => (index) => new math.AccessorNode(array, index)
export const setItem = (array) => (index) => (value) => new math.AssignmentNode(array, index, value)

export const SR = {
  zero: C(0),
  one: C(1),
  add,
  sub,
  mul,
  div,
  pos,
  neg,
  pow,
}

export const is_zero = (x) => x.type === 'ConstantNode' && x.value == 0
export const is_one = (x) => x.type === 'ConstantNode' && x.value == 1

// Perform some early simplification to produce smaller expressions
export const SR_Optimized = {
  zero: C(0),
  one: C(1),
  add: (x, y) => {
    if (is_zero(x)) {
      if (is_zero(y)) {
        return SR_Optimized.zero
      }
      return y
    }
    if (is_zero(y)) {
      return x
    }
    return add(x, y)
  },
  sub,
  mul: (x, y) => {
    if (is_zero(x) || is_zero(y)) {
      return SR_Optimized.zero
    }
    if (is_one(x)) {
      if (is_one(y)) {
        return SR_Optimized.one
      }
      return y
    }
    if (is_one(y)) {
      return x
    }
    return mul(x, y)
  },
  div,
  pos,
  neg,
  pow,
}

export { C, S }
