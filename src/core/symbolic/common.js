import * as math from 'mathjs'

// Disable units. Hackish but works...
//delete math.Unit.UNITS.b
//Object.keys(math.Unit.UNITS).forEach(key => delete math.Unit.UNITS[key]);

math.Unit.deleteUnit('b')
math.Unit.deleteUnit('l')
math.Unit.deleteUnit('m')
math.Unit.deleteUnit('g')
math.Unit.deleteUnit('h')
math.Unit.deleteUnit('s')
math.Unit.deleteUnit('t')

//console.log(math.Unit.UNITS)

const C = (x) => new math.ConstantNode(x)
//const S = (x) => new math.SymbolNode(x)
const I = (...index) => new math.IndexNode(index.map(C))

const S = (x, unescaped = true) => {
  const node = new math.SymbolNode(x)
  node.unescaped = unescaped
  return node
}

export { math, C, S, I }
