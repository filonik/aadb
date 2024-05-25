import { math } from './common'

import * as A from '../arrays'
import * as O from '../numeric/operators'

const COMMON_FRACTIONS = A.mapWith(([x, y]) => O.div(x, y))(
  A.cartesianProduct(A.repeat(A.range(1, 11), 2)),
)

export const simplifyFractions = (x) => {
  for (const y of COMMON_FRACTIONS) {
    if (O.isClose(x, y)) {
      return y
    }
  }
  return x
}

const simplifySetImplicit = (value) => (node, path, parent) => {
  if (node.isOperatorNode && node.op === '*') {
    node.implicit = value
    return node
  }
  return node
}

export const simplify = (node) => {
  return math.simplify(node).transform(simplifySetImplicit(true))
}
