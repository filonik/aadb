import { onMounted, unref } from 'vue'

export const useMathJax = (targetRef) => {
  let promise = Promise.resolve()

  function typeset(code) {
    promise = promise
      .then(() => window.MathJax.typesetPromise(code()))
      .catch((err) => console.log('Typeset failed: ' + err.message))
    return promise
  }

  const render = () => {
    const target = unref(targetRef)
    if (target) {
      typeset(() => {
        return [target]
      })
    }
  }

  onMounted(() => {
    render()
  })

  return { render }
}
