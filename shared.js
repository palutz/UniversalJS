"use strict"

// act :: Action -> State -> State
const act = (action, state) => {
  var Z = 4
  var q, s, x, y

  if (action.type === "zoom") {
    q = state.s / state.H
    x = state.x + action.x * q
    y = state.y + (state.H - 1 - action.y) * q
    s = state.s / Z

    q = s / state.H

    state = mixin({
      s: s,
      x: x - state.W / 2 * q,
      y: y - state.H / 2 * q
    }, mixin(state, {}))
    state.img = mandelbrot(state)

    return state
  }

  return state

  function mixin(s, t) {
    var k

    for (k in s) {
      t[k] = s[k]
    }

    return t
  }
}

// mandelbrot :: State -> [[Col]]
const mandelbrot = state => {
  var col, q, sx, sy, r

  q = state.s / state.H
  r = []
  for (sy = 0; sy < state.H; sy++) {
    r[sy] = []
    for (sx = 0; sx < state.W; sx++) {
      r[sy][sx] = iterate(sx, sy)
    }
  }

  return r

  function iterate(sx, sy) {
    var a, b, c, d, n, rx, ry

    a = rx = state.x + sx * q
    b = ry = state.y + sy * q
    n = 256
    do {
      c = a * a
      d = b * b
      b = 2 * a * b + ry
      a = c - d + rx
      n--
    } while (n > 0 && c + d < 4)

    return [17 * ((n & 7) | ((n >>> 1) & 8)),
      17 * ((n & 3) | ((n >>> 3) & 12)),
      17 * ((n & 3) | ((n >>> 1) & 4) | ((n >>> 4) & 8))]
  }
}

module.exports = {
  act: act,
  mandelbrot: mandelbrot
}
