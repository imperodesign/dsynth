const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const HashMap =  require('hashmap')
const clients = new HashMap()
const globalActiveSources = new HashMap()
const jade = require('jade')

app.set('views', './views')
app.set('view engine', 'jade')

app.use('/public', express.static(`${__dirname}/public`))

app.get('/', (req, res, next) => {
  res.render('index')
})

app.get('/pad', (req, res, next) => {
  res.render('pad', {
    websocketsURL: process.env.WEB_SOCKETS_URL || 'http://127.0.0.1:3007'
  })
})

server.listen(3007, () => {
  console.log('Server is listening on http://0.0.0.0:3007')
})

io.on('connection', socket => {
  clients.set(socket.id, { socket, activeSources: [] })
  console.log(clients.get(socket.id).activeSources)

  socket.on('CLIENT:PLAY', data => {
    console.log('CLIENT:PLAY', data)
    if(!data || data.source === undefined) return
    const source = data.source

    if (globalActiveSources.get(source)) return
    globalActiveSources.set(source, socket.id)

    clients.get(socket.id).activeSources.push(source)

    socket.emit('SERVER:PLAY', data)
    socket.broadcast.emit('SERVER:PLAY', data)

    console.log(clients.get(socket.id).activeSources)
  })

  socket.on('CLIENT:STOP', data => {
    console.log('CLIENT:STOP', data)
    if(!data || data.source === undefined) return
    const source = data.source

    if (!globalActiveSources.get(source)) return

    const i = clients.get(socket.id).activeSources.indexOf(source)
    if (i !== -1) {
    	clients.get(socket.id).activeSources.splice(i, 1)
      globalActiveSources.remove(source)
      socket.emit('SERVER:STOP', data)
      socket.broadcast.emit('SERVER:STOP', data)
    } else {
      console.error('Something nasty')
    }

    console.log(clients.get(socket.id).activeSources)
  })

  socket.on('disconnect', () => {
    const sources = clients.get(socket.id).activeSources
    socket.broadcast.emit('SERVER:STOP:ALL', { sources })

    clients.get(socket.id).activeSources.forEach(source => {
      globalActiveSources.remove(source)
    })

    clients.remove(socket.id)
  })

})
