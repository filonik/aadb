import ndarray from 'ndarray'

//import * as bigintConversion from 'bigint-conversion'

import * as A from './arrays'
import * as G from './generators'
import * as O from './numeric/operators'
import * as S from './strings'

import { base64ToUnsignedBigInt, unsignedBigIntToBase64, compare } from './numbers'

import { fromArray, filledWithShape, getItem, getItemR } from './ndarrays'

import { Matrix, inverse, pseudoInverse } from 'ml-matrix'

const groupBySorted = (x) => JSON.stringify(x.toSorted())

const groupedCartesianProduct = (xs) => Object.groupBy(A.cartesianProduct(xs), groupBySorted)

const groupedCartesianProductsWithShape = (n, shape) => {
  const xss = A.cartesianProduct(shape.map((s) => A.cartesianProduct(A.repeat(A.range(0, n), s))))
  return Object.groupBy(xss, (xs) => JSON.stringify(xs.map((x) => x.toSorted())))
}

const toBase = (base) => (value) => {
  let result = []
  while (value) {
    let digit = value % base
    result.push(digit)
    value = value / base
  }
  return result
}

const fromBase = (base) => (digits) => {
  let result = BigInt(0)
  let n = BigInt(1)
  for (let digit of digits) {
    result += digit * n
    n *= base
  }
  return result
}

const toSign = (i) => O.mod(i - 2, 3) - 1
const fromSign = (i) => O.mod(i, 3)

const pad = (value, n) => (digits) => {
  const length = n - digits.length
  if (length > 0) {
    const padding = Array.from({ length }).fill(value)
    return digits.concat(padding)
  }
  return digits
}

export const toConstants = (n, id) => {
  const shape = [n, n, n]
  const digits = toBase(BigInt(3))(BigInt(id))
  const values = digits.map((digit) => toSign(Number(digit)))
  return ndarray(pad(0, Math.pow(n, 3))(values), shape)
}

export const fromConstants = (C) => {
  const [I, J, K] = C.shape
  const digits = C.data.flat(1)
  const id = fromBase(BigInt(3))(digits.map((digit) => BigInt(fromSign(digit))))
  return [I, id]
}

export const toBase64 = (id) => {
  return unsignedBigIntToBase64(id)
  //return bigintConversion.bigintToBase64(id, true, false)
}

export const sparsifyConstants = (C) => {
  const coeffs = [...new Set(C.data)].sort()
  const entries = Array.from(coeffs, (coeff) => [coeff, []])
  for (let index of A.indices(C.shape)) {
    const c = C.get(...index)
    const i = coeffs.indexOf(c)
    entries[i][1].push(index)
  }
  const result = Object.fromEntries(entries)
  delete result[0]
  return result
}

export const sparseConstantsToString = (C) => {
  let result = ''
  for (let [c, indices] of Object.entries(C)) {
    result += c
    result += ','
    result += indices
    result += '\n'
  }
  return S.base64UrlEncode(result)
}

export const mulTable =
  ({ zero, add, mul }) =>
  (C) =>
  (es) => {
    const [I, J, K] = C.shape
    const sum = A.reduce({ append: add, empty: zero })
    const items = (i, j) => sum(A.range(0, K).map((k) => mul(getItemR(C)(i, j, k), getItem(es)(k))))
    return filledWithShape([I, J], items)
  }

export const matReprL =
  ({ zero, add, mul }) =>
  (C) =>
  (xs) => {
    const [I, J, K] = C.shape
    //const items = (j, k) => sum({ items: range(0, head).map((i) => mul(getItemR(C)(i, j, k), getItem(xs)(i))) })
    const sum = A.reduce({ append: add, empty: zero })
    const items = (k, j) => sum(A.range(0, I).map((i) => mul(getItemR(C)(i, j, k), getItem(xs)(i))))
    return filledWithShape([K, J], items)
  }

export const matReprR =
  ({ zero, add, mul }) =>
  (C) =>
  (xs) => {
    const [I, J, K] = C.shape
    //const items = (j, k) => sum({ items: range(0, head).map((i) => mul(getItemR(C)(i, j, k), getItem(xs)(i))) })
    const sum = A.reduce({ append: add, empty: zero })
    const items = (k, i) => sum(A.range(0, J).map((j) => mul(getItemR(C)(i, j, k), getItem(xs)(j))))
    return filledWithShape([K, I], items)
  }

export const mul =
  ({ zero, add, mul }) =>
  (C) =>
  (xs, ys) => {
    const [I, J, K] = C.shape
    const sum = A.reduce({ append: add, empty: zero })
    const items = (k) =>
      sum(
        A.range(0, J).map((j) =>
          sum(
            A.range(0, I).map((i) =>
              mul(mul(getItemR(C)(i, j, k), getItem(xs)(i)), getItem(ys)(j)),
            ),
          ),
        ),
      )
    return filledWithShape([K], items)
  }

/*
  def tconstants(C, P, P_inv):
    I, J, K = C.shape
    def _tconstants(i, j, k):
        return sum(sum(sum(P[k,c]*C[a,b,c]*P_inv[a,i]*P_inv[b,j] for c in range(K)) for b in range(J)) for a in range(I))
    return np.array([[[_tconstants(i,j,k) for k in range(K)] for j in range(J)] for i in range(I)], dtype=C.dtype)

*/
export const sw =
  ({ zero, add, mul }) =>
  (C, P, Pinv) => {
    const [I, J, K] = C.shape
    const sum = A.reduce({ append: add, empty: zero })
    const items = (i, j, k) =>
      sum(
        A.range(0, I).map((a) =>
          sum(
            A.range(0, J).map((b) =>
              sum(
                A.range(0, K).map((c) =>
                  mul(
                    mul(mul(getItemR(P)(k, c), getItemR(C)(a, b, c)), getItemR(Pinv)(a, i)),
                    getItemR(Pinv)(b, j),
                  ),
                ),
              ),
            ),
          ),
        ),
      )
    return filledWithShape([I, J, K], items)
  }

export const arrayToMatrix = (xs) => {
  return new Matrix(xs)
}

export const matrixToArray = (m) => {
  return m.data.map((xs) => Array.from(xs))
}

//export const ndArrayToMatrix = () => {}

export const matrixToNdArray = (m) => {
  const shape = [m.rows, m.columns]
  const data = matrixToArray(m).flat(1)
  return ndarray(data, shape)
}

export const similarConstants = (R) => (C) => {
  const [I, J, K] = C.shape

  const ps = A.permutations(I).map(arrayToMatrix)
  const rs = A.reflections(I).map(arrayToMatrix)

  return A.table((r, p) => {
    const rp = r.mmul(p)
    const rpinv = inverse(rp)
    return sw(R)(C, matrixToNdArray(rp), matrixToNdArray(rpinv))
  })(rs, ps)
}

export const similarIds = (R) => (cid) => {
  const [n, id] = cid
  const C = toConstants(n, id)
  const Ds = similarConstants(R)(C)
  return A.distinct(Ds.flat(1).map((D) => fromConstants(D)[1]))
    .sort(compare)
    .map((id) => [n, id])
}

export const mapL = (f) => (C) => (xs, y) => {
  const [I, J, K] = C.shape
  const items = (i) => f(getItem(xs)(i), y)
  return filledWithShape([I], items)
}

export const mapR = (f) => (C) => (x, ys) => {
  const [I, J, K] = C.shape
  const items = (i) => f(x, getItem(ys)(i))
  return filledWithShape([I], items)
}

export const mapLR = (f) => (C) => (xs, ys) => {
  const [I, J, K] = C.shape
  const items = (i) => f(getItem(xs)(i), getItem(ys)(i))
  return filledWithShape([I], items)
}

export const add = ({ add }) => mapLR(add)
export const sub = ({ sub }) => mapLR(sub)

export const adds = ({ add }) => mapL(add)
export const subs = ({ sub }) => mapL(sub)
export const muls = ({ mul }) => mapL(mul)
export const divs = ({ div }) => mapL(div)

export const table = (f) => (es) => {
  const N = A.length(es)
  const items = (i, j) => f(A.getItem(es)(i), A.getItem(es)(j))
  return filledWithShape([N, N], items)
}

export const toExpr =
  ({ zero, add, mul }) =>
  (es) =>
  (xs) => {
    const sum = A.reduce({ append: add, empty: zero })
    return sum(A.zipWith(mul)(xs.data, es.data))
  }

export const isQCommutative =
  ({ mul }) =>
  (q) =>
  (C) => {
    const [I, J, K] = C.shape
    for (let [i, j, k] of A.indices([I, J, K])) {
      const lhs = getItemR(C)(i, j, k)
      const rhs = getItemR(C)(j, i, k)
      if (lhs != mul(q, rhs)) {
        return false
      }
    }
    return true
  }

export const isQAssociative =
  ({ zero, add, mul }) =>
  (q) =>
  (C) => {
    const [I, J, K] = C.shape
    const sum = A.reduce({ append: add, empty: zero })
    for (let [a, b, d, e] of A.indices([I, I, I, I])) {
      const lhs = sum(A.range(0, I).map((c) => mul(getItemR(C)(c, d, e), getItemR(C)(a, b, c))))
      const rhs = sum(A.range(0, I).map((c) => mul(getItemR(C)(a, c, e), getItemR(C)(b, d, c))))
      if (lhs != mul(q, rhs)) {
        return false
      }
    }
    return true
  }

export const isQLeftAlternative =
  ({ zero, add, mul }) =>
  (q) =>
  (C) => {
    const [I, J, K] = C.shape
    const sum = A.reduce({ append: add, empty: zero })
    const JS = groupedCartesianProductsWithShape(I, [2, 1])
    for (let k of A.range(0, K)) {
      for (let js of Object.values(JS)) {
        const lhs = sum(
          js.map(([[j0, j1], [j2]]) =>
            sum(A.range(0, I).map((i) => mul(getItemR(C)(i, j0, k), getItemR(C)(j2, j1, i)))),
          ),
        )
        const rhs = sum(
          js.map(([[j0, j1], [j2]]) =>
            sum(A.range(0, I).map((i) => mul(getItemR(C)(j2, i, k), getItemR(C)(j1, j0, i)))),
          ),
        )
        if (lhs != mul(q, rhs)) {
          return false
        }
      }
    }
    return true
  }

/*
export const isFlexible =
  ({ zero, add, mul }) =>
  (C) => {
    return false
  }
*/

export const isQRightAlternative =
  ({ zero, add, mul }) =>
  (q) =>
  (C) => {
    const [I, J, K] = C.shape
    const sum = A.reduce({ append: add, empty: zero })
    const JS = groupedCartesianProductsWithShape(I, [2, 1])
    for (let k of A.range(0, K)) {
      for (let js of Object.values(JS)) {
        const lhs = sum(
          js.map(([[j0, j1], [j2]]) =>
            sum(A.range(0, I).map((i) => mul(getItemR(C)(i, j2, k), getItemR(C)(j0, j1, i)))),
          ),
        )
        const rhs = sum(
          js.map(([[j0, j1], [j2]]) =>
            sum(A.range(0, I).map((i) => mul(getItemR(C)(j0, i, k), getItemR(C)(j1, j2, i)))),
          ),
        )
        if (lhs != mul(q, rhs)) {
          return false
        }
      }
    }
    return true
  }

export const isQAlternative = (R) => (q) => (C) => {
  return isQLeftAlternative(R)(q)(C) && isQRightAlternative(R)(q)(C)
}

export const isQPowerAssociative =
  ({ zero, add, mul }) =>
  (q) =>
  (C) => {
    const [I, J, K] = C.shape
    const sum = A.reduce({ append: add, empty: zero })
    const JS = groupedCartesianProduct(A.repeat(A.range(0, J), 3))
    for (let k of A.range(0, K)) {
      for (let js of Object.values(JS)) {
        const lhs = sum(
          js.map(([j0, j1, j2]) =>
            sum(A.range(0, I).map((i) => mul(getItemR(C)(j0, i, k), getItemR(C)(j1, j2, i)))),
          ),
        )
        const rhs = sum(
          js.map(([j0, j1, j2]) =>
            sum(A.range(0, I).map((i) => mul(getItemR(C)(i, j0, k), getItemR(C)(j1, j2, i)))),
          ),
        )
        if (lhs != mul(q, rhs)) {
          return false
        }
      }
    }
    return true
  }

export const isJacobian =
  ({ zero, add, mul }) =>
  (C) => {
    const [I, J, K] = C.shape
    const sum = A.reduce({ append: add, empty: zero })
    for (let [a, b, c, e] of A.indices([I, I, I, I])) {
      const abc = sum(A.range(0, I).map((d) => mul(getItemR(C)(a, d, e), getItemR(C)(b, c, d))))
      const bca = sum(A.range(0, I).map((d) => mul(getItemR(C)(b, d, e), getItemR(C)(c, a, d))))
      const cab = sum(A.range(0, I).map((d) => mul(getItemR(C)(c, d, e), getItemR(C)(a, b, d))))
      if (sum([abc, bca, cab]) != zero) {
        return false
      }
    }
    return true
  }

export const isCommutative = (R) => isQCommutative(R)(R.one)
export const isAntiCommutative = (R) => isQCommutative(R)(R.add_inv(R.one))

export const isAssociative = (R) => isQAssociative(R)(R.one)
export const isAntiAssociative = (R) => isQAssociative(R)(R.add_inv(R.one))

export const isAlternative = (R) => isQAlternative(R)(R.one)
export const isAntiAlternative = (R) => isQAlternative(R)(R.add_inv(R.one))

export const isPowerAssociative = (R) => isQPowerAssociative(R)(R.one)
export const isAntiPowerAssociative = (R) => isQPowerAssociative(R)(R.add_inv(R.one))

const matrixIsZero = (x, eps = Number.EPSILON) =>
  G.all(G.mapWith((x) => O.isZero(x, eps))(x.values()))

const matrixIsClose = (x, y, eps = Number.EPSILON) => matrixIsZero(Matrix.sub(y, x), eps)

const EPS = 1e-14

export const trySolve = (A, b) => {
  const _A = new Matrix(A)
  const _b = new Matrix(b)
  try {
    const _x = pseudoInverse(_A).mmul(_b)
    if (matrixIsClose(_A.mmul(_x), _b, EPS)) {
      return _x.to1DArray()
    }
  } catch (e) {
    /* empty */
  }
}

export const lunit = (R) => (C) => {
  const [I, J, K] = C.shape
  const _A = A.filledWithShape([I * J, K], (ij, k) => {
    const i = O.quo(ij, J)
    const j = O.rem(ij, J)
    return getItemR(C)(k, j, i)
  })
  const _b = A.filledWithShape([I * J, 1], (ij, k) => {
    const i = O.quo(ij, J)
    const j = O.rem(ij, J)
    return i == j ? 1 : 0
  })
  const result = trySolve(_A, _b)
  return result ? fromArray(result) : undefined
}

export const runit = (R) => (C) => {
  const [I, J, K] = C.shape
  const _A = A.filledWithShape([I * J, K], (ij, k) => {
    const i = O.quo(ij, J)
    const j = O.rem(ij, J)
    return getItemR(C)(j, k, i)
  })

  const _b = A.filledWithShape([I * J, 1], (ij, k) => {
    const i = O.quo(ij, J)
    const j = O.rem(ij, J)
    return i == j ? 1 : 0
  })
  const result = trySolve(_A, _b)
  return result ? fromArray(result) : undefined
}

// Generic Structure Constants

export const GeneralComplex =
  ({ zero, one, neg }) =>
  (k) => {
    const shape = [2, 2, 2]
    const data = [
      [
        [one, zero],
        [zero, one],
      ],
      [
        [zero, one],
        [neg(k), zero],
      ],
    ]
    return ndarray(data.flat(2), shape)
  }

export const Clifford1 =
  ({ zero, one }) =>
  (k0) => {
    const shape = [2, 2, 2]
    const data = [
      [
        [one, zero],
        [zero, one],
      ],
      [
        [zero, one],
        [k0, zero],
      ],
    ]
    return ndarray(data.flat(2), shape)
  }

export const Clifford2 =
  ({ zero, one, neg, mul }) =>
  (k0, k1) => {
    const shape = [4, 4, 4]
    const data = [
      [
        [one, zero, zero, zero],
        [zero, one, zero, zero],
        [zero, zero, one, zero],
        [zero, zero, zero, one],
      ],
      [
        [zero, one, zero, zero],
        [k0, zero, zero, zero],
        [zero, zero, zero, one],
        [zero, zero, k0, zero],
      ],
      [
        [zero, zero, one, zero],
        [zero, zero, zero, neg(one)],
        [k1, zero, zero, zero],
        [zero, neg(k1), zero, zero],
      ],
      [
        [zero, zero, zero, one],
        [zero, zero, neg(k0), zero],
        [zero, k1, zero, zero],
        [neg(mul(k0, k1)), zero, zero, zero],
      ],
    ]
    return ndarray(data.flat(2), shape)
  }

export const Clifford3 =
  ({ zero, one, neg, mul }) =>
  (k0, k1, k2) => {
    const shape = [8, 8, 8]
    const data = [
      [
        [one, zero, zero, zero, zero, zero, zero, zero],
        [zero, one, zero, zero, zero, zero, zero, zero],
        [zero, zero, one, zero, zero, zero, zero, zero],
        [zero, zero, zero, one, zero, zero, zero, zero],
        [zero, zero, zero, zero, one, zero, zero, zero],
        [zero, zero, zero, zero, zero, one, zero, zero],
        [zero, zero, zero, zero, zero, zero, one, zero],
        [zero, zero, zero, zero, zero, zero, zero, one],
      ],
      [
        [zero, one, zero, zero, zero, zero, zero, zero],
        [k0, zero, zero, zero, zero, zero, zero, zero],
        [zero, zero, zero, one, zero, zero, zero, zero],
        [zero, zero, k0, zero, zero, zero, zero, zero],
        [zero, zero, zero, zero, zero, one, zero, zero],
        [zero, zero, zero, zero, k0, zero, zero, zero],
        [zero, zero, zero, zero, zero, zero, zero, one],
        [zero, zero, zero, zero, zero, zero, k0, zero],
      ],
      [
        [zero, zero, one, zero, zero, zero, zero, zero],
        [zero, zero, zero, neg(one), zero, zero, zero, zero],
        [k1, zero, zero, zero, zero, zero, zero, zero],
        [zero, neg(k1), zero, zero, zero, zero, zero, zero],
        [zero, zero, zero, zero, zero, zero, one, zero],
        [zero, zero, zero, zero, zero, zero, zero, neg(one)],
        [zero, zero, zero, zero, k1, zero, zero, zero],
        [zero, zero, zero, zero, zero, neg(k1), zero, zero],
      ],
      [
        [zero, zero, zero, one, zero, zero, zero, zero],
        [zero, zero, neg(k0), zero, zero, zero, zero, zero],
        [zero, k1, zero, zero, zero, zero, zero, zero],
        [neg(mul(k0, k1)), zero, zero, zero, zero, zero, zero, zero],
        [zero, zero, zero, zero, zero, zero, zero, one],
        [zero, zero, zero, zero, zero, zero, neg(k0), zero],
        [zero, zero, zero, zero, zero, k1, zero, zero],
        [zero, zero, zero, zero, neg(mul(k0, k1)), zero, zero, zero],
      ],
      [
        [zero, zero, zero, zero, one, zero, zero, zero],
        [zero, zero, zero, zero, zero, neg(one), zero, zero],
        [zero, zero, zero, zero, zero, zero, neg(one), zero],
        [zero, zero, zero, zero, zero, zero, zero, one],
        [k2, zero, zero, zero, zero, zero, zero, zero],
        [zero, neg(k2), zero, zero, zero, zero, zero, zero],
        [zero, zero, neg(k2), zero, zero, zero, zero, zero],
        [zero, zero, zero, k2, zero, zero, zero, zero],
      ],
      [
        [zero, zero, zero, zero, zero, one, zero, zero],
        [zero, zero, zero, zero, neg(k0), zero, zero, zero],
        [zero, zero, zero, zero, zero, zero, zero, neg(one)],
        [zero, zero, zero, zero, zero, zero, k0, zero],
        [zero, k2, zero, zero, zero, zero, zero, zero],
        [neg(mul(k0, k2)), zero, zero, zero, zero, zero, zero, zero],
        [zero, zero, zero, neg(k2), zero, zero, zero, zero],
        [zero, zero, mul(k0, k2), zero, zero, zero, zero, zero],
      ],
      [
        [zero, zero, zero, zero, zero, zero, one, zero],
        [zero, zero, zero, zero, zero, zero, zero, one],
        [zero, zero, zero, zero, neg(k1), zero, zero, zero],
        [zero, zero, zero, zero, zero, neg(k1), zero, zero],
        [zero, zero, k2, zero, zero, zero, zero, zero],
        [zero, zero, zero, k2, zero, zero, zero, zero],
        [neg(mul(k1, k2)), zero, zero, zero, zero, zero, zero, zero],
        [zero, neg(mul(k1, k2)), zero, zero, zero, zero, zero, zero],
      ],
      [
        [zero, zero, zero, zero, zero, zero, zero, one],
        [zero, zero, zero, zero, zero, zero, k0, zero],
        [zero, zero, zero, zero, zero, neg(k1), zero, zero],
        [zero, zero, zero, zero, neg(mul(k0, k1)), zero, zero, zero],
        [zero, zero, zero, k2, zero, zero, zero, zero],
        [zero, zero, mul(k0, k2), zero, zero, zero, zero, zero],
        [zero, neg(mul(k1, k2)), zero, zero, zero, zero, zero, zero],
        [neg(mul(mul(k0, k1), k2)), zero, zero, zero, zero, zero, zero, zero],
      ],
    ]
    return ndarray(data.flat(2), shape)
  }

export const Clifford2Even =
  ({ zero, one, neg, mul }) =>
  (k0, k1) => {
    const shape = [2, 2, 2]
    const data = [
      [
        [one, zero],
        [zero, one],
      ],
      [
        [zero, one],
        [neg(mul(k0, k1)), zero],
      ],
    ]
    return ndarray(data.flat(2), shape)
  }

export const Clifford3Even =
  ({ zero, one, neg, mul }) =>
  (k0, k1, k2) => {
    const shape = [4, 4, 4]
    const data = [
      [
        [one, zero, zero, zero],
        [zero, one, zero, zero],
        [zero, zero, one, zero],
        [zero, zero, zero, one],
      ],
      [
        [zero, one, zero, zero],
        [neg(mul(k0, k1)), zero, zero, zero],
        [zero, zero, zero, neg(k0)],
        [zero, zero, k1, zero],
      ],
      [
        [zero, zero, one, zero],
        [zero, zero, zero, k0],
        [neg(mul(k0, k2)), zero, zero, zero],
        [zero, neg(k2), zero, zero],
      ],
      [
        [zero, zero, zero, one],
        [zero, zero, neg(k1), zero],
        [zero, k2, zero, zero],
        [neg(mul(k1, k2)), zero, zero, zero],
      ],
    ]
    return ndarray(data.flat(2), shape)
  }

export const Clifford4Even =
  ({ zero, one, neg, mul }) =>
  (k0, k1, k2, k3) => {
    const shape = [8, 8, 8]
    const data = [
      [
        [one, zero, zero, zero, zero, zero, zero, zero],
        [zero, one, zero, zero, zero, zero, zero, zero],
        [zero, zero, one, zero, zero, zero, zero, zero],
        [zero, zero, zero, one, zero, zero, zero, zero],
        [zero, zero, zero, zero, one, zero, zero, zero],
        [zero, zero, zero, zero, zero, one, zero, zero],
        [zero, zero, zero, zero, zero, zero, one, zero],
        [zero, zero, zero, zero, zero, zero, zero, one],
      ],
      [
        [zero, one, zero, zero, zero, zero, zero, zero],
        [neg(mul(k0, k1)), zero, zero, zero, zero, zero, zero, zero],
        [zero, zero, zero, neg(k0), zero, zero, zero, zero],
        [zero, zero, k1, zero, zero, zero, zero, zero],
        [zero, zero, zero, zero, zero, neg(k0), zero, zero],
        [zero, zero, zero, zero, k1, zero, zero, zero],
        [zero, zero, zero, zero, zero, zero, zero, one],
        [zero, zero, zero, zero, zero, zero, neg(mul(k0, k1)), zero],
      ],
      [
        [zero, zero, one, zero, zero, zero, zero, zero],
        [zero, zero, zero, k0, zero, zero, zero, zero],
        [neg(mul(k0, k2)), zero, zero, zero, zero, zero, zero, zero],
        [zero, neg(k2), zero, zero, zero, zero, zero, zero],
        [zero, zero, zero, zero, zero, zero, neg(k0), zero],
        [zero, zero, zero, zero, zero, zero, zero, neg(one)],
        [zero, zero, zero, zero, k2, zero, zero, zero],
        [zero, zero, zero, zero, zero, mul(k0, k2), zero, zero],
      ],
      [
        [zero, zero, zero, one, zero, zero, zero, zero],
        [zero, zero, neg(k1), zero, zero, zero, zero, zero],
        [zero, k2, zero, zero, zero, zero, zero, zero],
        [neg(mul(k1, k2)), zero, zero, zero, zero, zero, zero, zero],
        [zero, zero, zero, zero, zero, zero, zero, one],
        [zero, zero, zero, zero, zero, zero, neg(k1), zero],
        [zero, zero, zero, zero, zero, k2, zero, zero],
        [zero, zero, zero, zero, neg(mul(k1, k2)), zero, zero, zero],
      ],
      [
        [zero, zero, zero, zero, one, zero, zero, zero],
        [zero, zero, zero, zero, zero, k0, zero, zero],
        [zero, zero, zero, zero, zero, zero, k0, zero],
        [zero, zero, zero, zero, zero, zero, zero, one],
        [neg(mul(k0, k3)), zero, zero, zero, zero, zero, zero, zero],
        [zero, neg(k3), zero, zero, zero, zero, zero, zero],
        [zero, zero, neg(k3), zero, zero, zero, zero, zero],
        [zero, zero, zero, neg(mul(k0, k3)), zero, zero, zero, zero],
      ],
      [
        [zero, zero, zero, zero, zero, one, zero, zero],
        [zero, zero, zero, zero, neg(k1), zero, zero, zero],
        [zero, zero, zero, zero, zero, zero, zero, neg(one)],
        [zero, zero, zero, zero, zero, zero, k1, zero],
        [zero, k3, zero, zero, zero, zero, zero, zero],
        [neg(mul(k1, k3)), zero, zero, zero, zero, zero, zero, zero],
        [zero, zero, zero, neg(k3), zero, zero, zero, zero],
        [zero, zero, mul(k1, k3), zero, zero, zero, zero, zero],
      ],
      [
        [zero, zero, zero, zero, zero, zero, one, zero],
        [zero, zero, zero, zero, zero, zero, zero, one],
        [zero, zero, zero, zero, neg(k2), zero, zero, zero],
        [zero, zero, zero, zero, zero, neg(k2), zero, zero],
        [zero, zero, k3, zero, zero, zero, zero, zero],
        [zero, zero, zero, k3, zero, zero, zero, zero],
        [neg(mul(k2, k3)), zero, zero, zero, zero, zero, zero, zero],
        [zero, neg(mul(k2, k3)), zero, zero, zero, zero, zero, zero],
      ],
      [
        [zero, zero, zero, zero, zero, zero, zero, one],
        [zero, zero, zero, zero, zero, zero, neg(mul(k0, k1)), zero],
        [zero, zero, zero, zero, zero, mul(k0, k2), zero, zero],
        [zero, zero, zero, zero, neg(mul(k1, k2)), zero, zero, zero],
        [zero, zero, zero, neg(mul(k0, k3)), zero, zero, zero, zero],
        [zero, zero, mul(k1, k3), zero, zero, zero, zero, zero],
        [zero, neg(mul(k2, k3)), zero, zero, zero, zero, zero, zero],
        [mul(mul(mul(k0, k1), k2), k3), zero, zero, zero, zero, zero, zero, zero],
      ],
    ]
    return ndarray(data.flat(2), shape)
  }
