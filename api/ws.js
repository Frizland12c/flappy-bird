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

const connections = new Map()

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
    // create_room:eagle
    if (data.startsWith('create_room:')) {

      const bird =
        data.split(':')[1] || 'normal'

      const roomCode =
        createRoomCode()

      await redis.set(
        `room:${roomCode}`,
        {
          player1: true,
          player2: false,
          player1Bird: bird,
          player2Bird: null
        }
      )

      socket.roomCode = roomCode
      socket.playerNumber = 1

      connections.set(
        `${roomCode}:1`,
        socket
      )

      socket.send(roomCode)

      return

    }

    // JOIN ROOM
    // join_room:ABCDE:crow
    if (data.startsWith('join_room:')) {

      const parts =
        data.split(':')

      const roomCode =
        parts[1]

      const bird =
        parts[2] || 'normal'

      const room =
        await redis.get(
          `room:${roomCode}`
        )

      if (!room) {

        socket.send(
          'room_not_found'
        )

        return

      }

      if (room.player2) {

        socket.send(
          'room_full'
        )

        return

      }

      room.player2 = true
      room.player2Bird = bird

      await redis.set(
        `room:${roomCode}`,
        room
      )

      socket.roomCode = roomCode
      socket.playerNumber = 2

      connections.set(
        `${roomCode}:2`,
        socket
      )

      socket.send(
        'joined_room'
      )

      /*
        نوع پرنده Player 1 را
        برای Player 2 می‌فرستیم.
      */

      socket.send(
        `remote_bird:${room.player1Bird || 'normal'}`
      )

      /*
        نوع پرنده Player 2 را
        برای Player 1 می‌فرستیم.
      */

      const player1 =
        connections.get(
          `${roomCode}:1`
        )

      if (player1) {

        player1.send(
          `remote_bird:${bird}`
        )

        /*
          هر دو بازیکن آماده‌اند.
        */

        player1.send(
          'countdown_start'
        )

        socket.send(
          'countdown_start'
        )

      }

      return

    }

    // JUMP
    if (data === 'jump') {

      const roomCode =
        socket.roomCode

      if (!roomCode) {
        return
      }

      const room =
        await redis.get(
          `room:${roomCode}`
        )

      if (!room) {
        return
      }

      const otherPlayerNumber =
        socket.playerNumber === 1
          ? 2
          : 1

      const otherPlayer =
        connections.get(
          `${roomCode}:${otherPlayerNumber}`
        )

      if (otherPlayer) {

        otherPlayer.send(
          'player_jump'
        )

      }

      return

    }

    // PLAYER DEAD
    if (data === 'player_dead') {

      const roomCode =
        socket.roomCode

      if (!roomCode) {
        return
      }

      const otherPlayerNumber =
        socket.playerNumber === 1
          ? 2
          : 1

      const otherPlayer =
        connections.get(
          `${roomCode}:${otherPlayerNumber}`
        )

      if (otherPlayer) {

        otherPlayer.send(
          'player_dead'
        )

      }

      return

    }

    // RESTART GAME
    if (data === 'restart_game') {

      const roomCode =
        socket.roomCode

      if (!roomCode) {
        return
      }

      const room =
        await redis.get(
          `room:${roomCode}`
        )

      if (!room) {
        return
      }

      const player1 =
        connections.get(
          `${roomCode}:1`
        )

      const player2 =
        connections.get(
          `${roomCode}:2`
        )

      if (player1) {

        player1.send(
          'restart_game'
        )

      }

      if (player2) {

        player2.send(
          'restart_game'
        )

      }

      return

    }

  })

  socket.on('close', async () => {

    const roomCode =
      socket.roomCode

    const playerNumber =
      socket.playerNumber

    if (
      !roomCode ||
      !playerNumber
    ) {

      return

    }

    connections.delete(
      `${roomCode}:${playerNumber}`
    )

    const room =
      await redis.get(
        `room:${roomCode}`
      )

    if (!room) {
      return
    }

    // PLAYER 1 LEFT
    if (playerNumber === 1) {

      const player2 =
        connections.get(
          `${roomCode}:2`
        )

      if (player2) {

        player2.send(
          'player_left'
        )

      }

      await redis.del(
        `room:${roomCode}`
      )

      console.log(
        `Room ${roomCode} deleted`
      )

      return

    }

    // PLAYER 2 LEFT
    if (playerNumber === 2) {

      room.player2 = false
      room.player2Bird = null

      await redis.set(
        `room:${roomCode}`,
        room
      )

      const player1 =
        connections.get(
          `${roomCode}:1`
        )

      if (player1) {

        player1.send(
          'player_left'
        )

      }

      console.log(
        `Player 2 left room ${roomCode}`
      )

    }

  })

})

export default server