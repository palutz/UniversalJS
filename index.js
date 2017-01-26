"use strict"

// Imports.
var shared = require("./shared.js")

// data IO a = IO (() -> a)
const IO = unsafe => ({
  bind: f => IO(() => f(unsafe()).unsafe()),
  toTask: () => Task((rej, res) => res(unsafe())),
  unsafe: unsafe
})
IO.of = x => IO(() => x)

// data Task a b = Task ((a -> ()) -> (b -> ()) -> ())
const Task = fork => ({
  bind: f => Task((rej, res) =>
    fork(rej, x =>
      f(x).fork(rej, res)
    )
  ),
  fork: fork
})
Task.handle = f => x => Task.dispatch(f(x))
Task.of = x => Task((_, res) => res(x))


// act :: Action -> State -> Task String State
const act = (action, state) => Task((rej, res) => {
  var req

  if (true) return res(shared.act(action, state))

  req = new XMLHttpRequest()
  req.onreadystatechange = () => {
    if (req.readyState === 4) {
      res(JSON.parse(req.responseText))
    }
  }
  req.open("POST", "/act", true)
  delete state.img
  req.send(JSON.stringify([action, state]))
})

// listen :: Task Void Action
const listen = Task((rej, res) => {
  Task.dispatch = action => {
    Task.dispatch = undefined
    res(action)
  }
})

// loop :: State -> Task String State
const loop = state =>
  listen.bind(action =>
    act(action, state)
  ).bind(main)

// main :: State -> Task String State
const main = state =>
  render(state).toTask().bind(() => loop(state))

// onClick :: Event -> Action
const onClick = e => ({
  type: "zoom",
  x: e.clientX,
  y: e.clientY
})

// onLoad :: () => ()
const onLoad = () => {
  document.getElementById("canvas").onclick = Task.handle(onClick)

  var state = {
    W: document.getElementById("canvas").width,
    H: document.getElementById("canvas").height,
    count: 1,
    s: 4,
    x: -2,
    y: -2
  }

  state.x -= (state.s / state.H) * (state.W - state.H) / 2

  act({ type: "start" }, state).bind(main).fork(
    err => console.log("Error" + err),
    res => console.log("Result: " + res)
  )
}

// render :: State -> IO ()
const render = state => {
  var g, img, sx, sy

  g = document.getElementById("canvas").getContext("2d")
  img = g.getImageData(0, 0, state.W, state.H)
  for (sy = 0; sy < state.H; sy++) {
    for (sx = 0; sx < state.W; sx++) {
      img.data[(sx + (state.H - 1 - sy) * state.W) * 4 + 0] = state.img[sy][sx][0]
      img.data[(sx + (state.H - 1 - sy) * state.W) * 4 + 1] = state.img[sy][sx][1]
      img.data[(sx + (state.H - 1 - sy) * state.W) * 4 + 2] = state.img[sy][sx][2]
      img.data[(sx + (state.H - 1 - sy) * state.W) * 4 + 3] = 255
    }
  }

  g.putImageData(img, 0, 0)

  return IO.of(null)
}

// Start
onLoad()
