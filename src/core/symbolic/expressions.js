import { math } from './common'

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
