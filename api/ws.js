import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'

const app = express()

const server = createServer(app)

const wss = new WebSocketServer({
  server
})

const rooms = {}

function createRoomCode() {
  return Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase()
}

wss.on('connection', (socket) => {

  console.log('Vercel WebSocket connected')

  socket.on('message', (message) => {

    const data = message.toString()

    console.log('Message:', data)

    if (data === 'create_room') {

      const roomCode = createRoomCode()

      rooms[roomCode] = {
        player1: socket,
        player2: null
      }

      socket.roomCode = roomCode
      socket.playerNumber = 1

      socket.send(roomCode)

      return
    }

    if (data.startsWith('join_room:')) {

      const roomCode = data.split(':')[1]

      if (!rooms[roomCode]) {
        socket.send('room_not_found')
        return
      }

      if (rooms[roomCode].player2) {
        socket.send('room_full')
        return
      }

      rooms[roomCode].player2 = socket

      socket.roomCode = roomCode
      socket.playerNumber = 2

      socket.send('joined_room')

      rooms[roomCode].player1.send('game_ready')
      rooms[roomCode].player2.send('game_ready')

      return
    }

    if (data === 'jump') {

      const roomCode = socket.roomCode

      if (!roomCode) return

      const room = rooms[roomCode]

      if (!room) return

      if (
        socket.playerNumber === 1 &&
        room.player2
      ) {
        room.player2.send('player_jump')
      }

      if (
        socket.playerNumber === 2 &&
        room.player1
      ) {
        room.player1.send('player_jump')
      }

      return
    }

  })

  socket.on('close', () => {

    const roomCode = socket.roomCode

    if (!roomCode) return

    const room = rooms[roomCode]

    if (!room) return

    if (room.player1 === socket) {

      if (room.player2) {
        room.player2.send('player_left')
      }

      delete rooms[roomCode]

    } else if (room.player2 === socket) {

      room.player2 = null

      if (room.player1) {
        room.player1.send('player_left')
      }

    }

  })

})

export default server
