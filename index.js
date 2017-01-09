"use strict"

/* globals React, ReactDOM */

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

// act :: Action -> State -> Task String State
const act = (action, state) => Task((rej, res) => {
  var req

  req = new XMLHttpRequest()
  req.onreadystatechange = () => {
    if (req.readyState === 4) {
      res(JSON.parse(req.responseText))
    }
  }
  req.open("POST", "/act", true)
  req.send(JSON.stringify([action, state]))
})

// app :: State => DOM
const app = state =>
  React.createElement(
    "div",
    { onClick: Task.handle(onClick), style: { fontSize: 24 } },
    "Count: " + state.count
  )

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
const onClick = _ => ({
  type: "inc"
})

// onLoad :: () => ()
const onLoad = () => {
  main({ count: 1 }).fork(
    err => console.log("Error" + err),
    res => console.log("Result: " + res)
  )
}

// render :: State -> IO ()
const render = state => {
  ReactDOM.render(app(state), document.getElementById("target"))

  return IO.of(null)
}
