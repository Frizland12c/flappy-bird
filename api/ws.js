import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'

const app = express()

const server = createServer(app)

const wss = new WebSocketServer({
  server
})

wss.on('connection', (socket) => {

  console.log('Vercel WebSocket connected')

  socket.send('hello_from_vercel')

  socket.on('message', (message) => {

    console.log(
      'Message:',
      message.toString()
    )

    socket.send(
      `echo:${message.toString()}`
    )

  })

})

export default server