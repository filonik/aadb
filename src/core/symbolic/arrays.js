import { math } from './common'

export const A = (items, shape) => {
  const result = new math.ArrayNode(items)
  result.shape = shape
  return result
}

export function filledWithShape(shape, f) {
  function _filledWithShape(shape, index) {
    if (shape && shape.length) {
      const [head, ...tail] = shape
      return A(
        Array(head)
          .fill(undefined)
          .map((_, i) => _filledWithShape(tail, [...index, i])),
        shape,
      )
    } else {
      return f(...index)
    }
  }
  return _filledWithShape(shape, [])
}
