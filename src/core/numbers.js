//const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

export function unsignedBigIntToBase64(num) {
  const base = BigInt(ALPHABET.length)
  let result = ''
  while (num) {
    let r = num % base
    num -= r
    num /= base
    result = ALPHABET.charAt(Number(r)) + result
  }
  return result
}

export function base64ToUnsignedBigInt(str) {
  const base = BigInt(ALPHABET.length)
  let result = BigInt(0)
  while (str.length) {
    let r = ALPHABET.indexOf(str.charAt(0))
    str = str.substr(1)
    result *= base
    result += BigInt(r)
  }
  return result
}
