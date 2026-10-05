import { Redis } from '@upstash/redis'
import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
})

const app = express()

const server = createServer(app)

const wss = new WebSocketServer({
  server
})

function createRoomCode() {
  return Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase()
}

wss.on('connection', (socket) => {

  console.log('Vercel WebSocket connected')

  socket.on('message', async (message) => {

    const data = message.toString()

    console.log('Message:', data)

    // CREATE ROOM
    if (data === 'create_room') {

      const roomCode = createRoomCode()

      await redis.set(`room:${roomCode}`, {
        player1: true,
        player2: false
      })

      socket.roomCode = roomCode
      socket.playerNumber = 1

      socket.send(roomCode)

      return
    }

    // JOIN ROOM
    if (data.startsWith('join_room:')) {

      const roomCode = data.split(':')[1]

      const room = await redis.get(`room:${roomCode}`)

      if (!room) {
        socket.send('room_not_found')
        return
      }

      if (room.player2) {
        socket.send('room_full')
        return
      }

      room.player2 = true

      await redis.set(`room:${roomCode}`, room)

      socket.roomCode = roomCode
      socket.playerNumber = 2

      socket.send('joined_room')

      return
    }

    // JUMP
    if (data === 'jump') {

      const roomCode = socket.roomCode

      if (!roomCode) {
        return
      }

      const room = await redis.get(`room:${roomCode}`)

      if (!room) {
        return
      }

      console.log(
        `Player ${socket.playerNumber} jumped in room ${roomCode}`
      )

      return
    }

  })

  socket.on('close', async () => {

    const roomCode = socket.roomCode

    if (!roomCode) {
      return
    }

    const room = await redis.get(`room:${roomCode}`)

    if (!room) {
      return
    }

    if (socket.playerNumber === 1) {

      await redis.del(`room:${roomCode}`)

      console.log(
        `Room ${roomCode} deleted`
      )

      return
    }

    if (socket.playerNumber === 2) {

      room.player2 = false

      await redis.set(`room:${roomCode}`, room)

      console.log(
        `Player 2 left room ${roomCode}`
      )

    }

  })

})

export default server