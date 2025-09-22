// TODO: WIP...

import * as O from '../numeric/operators'

const withFromScalar = (fromScalar) => ({
    fromScalar,
    zero: () => fromScalar(0),
    one: () => fromScalar(1),
})

const RR = {
    ...O.RR,
    ...withFromScalar((x) => x)
}

const involutive = (R) => ({...R, inv: (x) => x})

const doubling = (I) => (A) => ({
    add: ([a0,b0], [a1,b1]) => [A.add(a0,a1), A.add(b0,b1)],
    add_inv:  ([a,b]) => [A.add_inv(a), A.add_inv(b)],
    ...withFromScalar((x) => [A.fromScalar(x), A.zero()]),
    ...I(A)
})

const cayley_dickson_doubling = (k) => (A) => doubling({
    mul: ([a0,b0], [a1,b1]) => [
        A.add(A.mul(a0, a1), A.mul(k, A.mul(b1, b0))),
        A.add(A.mul(b1, a0), A.mul(b0, A.inv(a1))),
    ],
    mul_inv: undefined,
    inv: ([a,b]) => [A.inv(a), A.add_inv(b)]
})(A)

export const Real = involutive(RR)
export const Complex = cayley_dickson_doubling(Real.fromScalar(-1))(Real)
export const Quaternion = cayley_dickson_doubling(Complex.fromScalar(-1))(Complex)
export const Octonion = cayley_dickson_doubling(Quaternion.fromScalar(-1))(Quaternion)
