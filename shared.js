"use strict"

var AA = [[0, 0], [0.3, 0], [0.3, 0.3],
  [0, 0.3], [-0.3, 0.3], [-0.3, 0],
  [-0.3, -0.3], [0, -0.3], [0.3, -0.3]]

// act :: Action -> State -> State
const act = (action, state) => {
  var Z = 4
  var q, s, x, y

  console.time("act")
  if (action.type === "start") {
    state.img = mandelbrot(state)
  } else if (action.type === "zoom") {
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
  }

  console.timeEnd("act")

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
      r[sy][sx] = AA.map(s =>
        iterate(sx + s[0], sy + s[1])
      ).reduce((col, x) =>
        [col[0] + x[0] / 9, col[1] + x[1] / 9, col[2] + x[2] / 9],
        [0, 0, 0]
      )
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
