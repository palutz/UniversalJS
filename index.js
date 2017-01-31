"use strict"

const MODE = "webworker"

// Imports.
var shared = require("./shared.js")

// data IO a = IO (() -> a)
const IO = unsafe => ({
  bind: f => IO(() => f(unsafe()).unsafe()),
  toTask: () => Task((_, res) => res(unsafe())),
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

  if (MODE === "server") {
    console.time("request")
    req = new XMLHttpRequest()
    req.onreadystatechange = () => {
      var t
      if (req.readyState === 4) {
        t = JSON.parse(req.responseText)
        console.timeEnd("request")
        res(t)
      }
    }
    req.open("POST", "/act", true)
    delete state.img
    req.send(JSON.stringify([action, state]))
  } else if (MODE === "webworker") {

  } else {
    return res(shared.act(action, state))
  }
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
  var col, g, img, sx, sy

  console.time("render")
  g = document.getElementById("canvas").getContext("2d")
  img = g.getImageData(0, 0, state.W, state.H)
  for (sy = 0; sy < state.H; sy++) {
    for (sx = 0; sx < state.W; sx++) {
      col = shared.palette(state.img[sy][sx])
      img.data[(sx + (state.H - 1 - sy) * state.W) * 4 + 0] = col[0]
      img.data[(sx + (state.H - 1 - sy) * state.W) * 4 + 1] = col[1]
      img.data[(sx + (state.H - 1 - sy) * state.W) * 4 + 2] = col[2]
      img.data[(sx + (state.H - 1 - sy) * state.W) * 4 + 3] = 255
    }
  }

  g.putImageData(img, 0, 0)
  console.timeEnd("render")

  return IO.of(null)
}

// Start
onLoad()
