"use strict"

/* globals React, ReactDOM */

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
  fork: fork,
  toTask: () => Task(fork)
})
Task.of = x => Task((_, res) => res(x))
Task.handle = f => x => Task.dispatch(f(x))
Task.nt = m => m.toTask()

// data FreeMonad f a = Pure a | Bind f (FreeMonad f a) ?
const Bind = (f, m) => ({
  bind: g => Bind(g, Bind(f, m)),
  // foldMap :: Functor f, g => (f a -> g a) -> (a -> g a) -> FreeMonad f a -> g a
  foldMap: (t, of) => m.foldMap(t, of).bind(x => t(f(x))),
  toTask: () => Bind(f, m).foldMap(Task.nt, Task.of)
})
const Pure = x => ({
  bind: f => Bind(f, Pure(x)),
  foldMap: (t, of) => of(x),
  toTask: () => Task.of(x)
})

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

// loop :: State -> FreeMonad State
const loop = state =>
  Pure(null).bind(() =>
    listen
  ).bind(action =>
    act(action, state)
  ).bind(main)

// main :: State -> FreeMonad State
const main = state =>
  Pure(state).bind(render).bind(() => loop(state))

// onClick :: Event -> Action
const onClick = _ => ({
  type: "inc"
})

// onLoad :: () => ()
const onLoad = () => {
  main({ count: 1 }).foldMap(Task.nt, Task.of).fork(
    err => console.log("Error: " + err),
    res => console.log("Result: " + res)
  )
}

// render :: State -> IO ()
const render = state => {
  ReactDOM.render(app(state), document.getElementById("target"))

  return IO.of(null)
}
