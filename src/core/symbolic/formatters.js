/*
const FORMATS = {
  x: (i) => `\\xs{${i}}`, // `x^{${i}}`,
  y: (i) => `\\ys{${i}}`, // `y^{${i}}`,
  u: (i) => `\\us{${i}}`, // `x^{${i}}`,
  v: (i) => `\\vs{${i}}`, // `y^{${i}}`,
  e: (i) => `\\es{${i}}`, // `\\mathbf{e}_{${i}}`,
  f: (i) => `\\fs{${i}}`, // `\\mathbf{f}_{${i}}`,
  X: (i, j) => `\\Xs{${i}}{${j}}`, // `X_{${j}}^{${i}}`,
  Y: (i, j) => `\\Ys{${i}}{${j}}`, // `Y_{${j}}^{${i}}`,
  C: (i, j, k) => `\\Cs{${i}}{${j}}{${k}}`, // `C_{${i} ${j}}^{${k}}`,
}
*/
const FORMATS = {
  x: (i) => `x^{${i}}`,
  y: (i) => `y^{${i}}`,
  u: (i) => `u^{${i}}`,
  v: (i) => `v^{${i}}`,
  e: (i) => `\\mathbf{e}_{${i}}`,
  f: (i) => `\\mathbf{f}_{${i}}`,
  X: (i, j) => `X_{${j}}^{${i}}`,
  Y: (i, j) => `Y_{${j}}^{${i}}`,
  C: (i, j, k) => `C_{${i} ${j}}^{${k}}`,
}

function formatLaTex(node, options) {
  if (node.type === 'SymbolNode' && (node.unescaped || options.unescaped)) {
    return node.name
  }

  if (node.type === 'AccessorNode' && node.object.type === 'SymbolNode') {
    const formatIndex = FORMATS[node.object.name]
    if (formatIndex) {
      return ` ${formatIndex(...node.index.dimensions)}`
    }
  }
}

export { formatLaTex }
