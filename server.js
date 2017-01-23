"use strict"

const fs = require("fs")
const http = require("http")

const act_ = (action, state) => ({
  count: state.count + 1
})

const server = http.createServer((req, res) => {
  var body

  body = ""
  req.on("data", chunk => body = body + chunk)
  req.on("end", () => {
    var action, state

    res.statusCode = 200
    if (req.url === "/act") {
      [action, state] = JSON.parse(body)
      res.setHeader('Content-Type', 'text/json')
      res.end(JSON.stringify(act_(action, state)))
    } else if (req.url === "/bundle.js") {
      res.end(fs.readFileSync("./public/bundle.js"))
    } else {
      res.end(fs.readFileSync("./public/index.html"))
    }
  })

})

server.listen(3000, "127.0.0.1", () => {
  console.log("listening...")
})
