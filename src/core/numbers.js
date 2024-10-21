const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-'

export function bigint_to_unsignedbase64(num) {
  const base = BigInt(ALPHABET.length)
  let str = '',
    r
  while (num) {
    r = num % base
    num -= r
    num /= base
    str = ALPHABET.charAt(Number(r)) + str
  }
  return str
}

export function unsignedbase64_to_bigint(str) {
  const base = BigInt(ALPHABET.length)
  let num = BigInt(0),
    r
  while (str.length) {
    r = ALPHABET.indexOf(str.charAt(0))
    str = str.substr(1)
    num *= base
    num += BigInt(r)
  }
  return num
}
