"use strict"

const shared = require("./shared.js")

onmessage = e => {
  var action, state

  console.time("worker: message")

  ;[action, state] = e.data
  state = shared.act(action, state)

  console.timeEnd("worker: message")
  postMessage(state)
}
