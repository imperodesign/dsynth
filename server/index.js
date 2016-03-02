var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)

app.use(express.static(`${__dirname}/..`))

server.listen(3007, () => {
  console.log('Server is listening on http://0.0.0.0:3007')
})

const clients = []

io.on('connection', socket => {
  clients.push(socket)

  socket.on('CLIENT:PLAY', data => {
    console.log('CLIENT:PLAY', data)

    const source = data.source

    clients.forEach((client, index) => {
      if (client.id === socket.id) return
      client.emit('SERVER:PLAY', data)
    })
  })

  socket.on('CLIENT:STOP', data => {
    console.log('CLIENT:STOP', data)

    const source = data.source

    clients.forEach((client, index) => {
      if (client.id === socket.id) return
      client.emit('SERVER:STOP', data)
    })
  })
})
