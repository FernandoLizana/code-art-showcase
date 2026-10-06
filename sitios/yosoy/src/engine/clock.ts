export type Clock = {
  now: () => number
  setTimeout: (fn: () => void, ms: number) => number
  clearTimeout: (id: number) => void
}

export const realtimeClock: Clock = {
  now: () => (typeof performance !== 'undefined' ? performance.now() : Date.now()),
  setTimeout: (fn, ms) => window.setTimeout(fn, ms),
  clearTimeout: (id) => {
    window.clearTimeout(id)
  },
}
