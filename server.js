"use strict"

const fs = require("fs")
const http = require("http")
const shared = require("./shared.js")

const server = http.createServer((req, res) => {
  var body

  console.log(req.url)
  console.time("request")

  body = ""
  req.on("data", chunk => body = body + chunk)
  req.on("end", () => {
    var action, state

    console.timeEnd("request")

    res.statusCode = 200
    if (req.url === "/act") {
      ;[action, state] = JSON.parse(body)
      state = shared.act(action, state)
      console.time("response")
      res.setHeader('Content-Type', 'text/json')
      res.end(JSON.stringify(state))
      console.timeEnd("response")
    } else if (req.url === "/index.bundle.js") {
      res.end(fs.readFileSync("./public/index.bundle.js"))
    } else if (req.url === "/worker.bundle.js") {
      res.end(fs.readFileSync("./public/worker.bundle.js"))
    } else {
      res.end(fs.readFileSync("./public/index.html"))
    }
  })

})

server.listen(3000, "127.0.0.1", () => {
  console.log("listening...")
})
