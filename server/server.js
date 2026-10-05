import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'

const app = express()

const server = createServer(app)

const port = process.env.PORT || 10000

const wss = new WebSocketServer({
    server,
    path: '/ws'
})

const rooms = {}

app.get('/', (req, res) => {

    res.send(
        'Flappy Bird WebSocket Server is running'
    )

})

function createRoomCode() {

    return Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase()

}
server.on('upgrade', (request) => {

    console.log(
        'UPGRADE REQUEST:',
        request.url
    )

})

wss.on('connection', (socket) => {

    console.log('WebSocket client connected')
    socket.on('error', (error) => {

        console.log(
            'WebSocket socket error:',
            error
        )

    })

    socket.on('message', (message) => {

        const data = message.toString()

        console.log(
            'Message from client:',
            data
        )

        if (data === 'create_room') {

            const roomCode =
                createRoomCode()

            rooms[roomCode] = {

                player1: socket,
                player2: null

            }

            socket.roomCode = roomCode
            socket.playerNumber = 1

            console.log(
                'Room created:',
                roomCode
            )

            socket.send(roomCode)

        }

        if (data.startsWith('join_room:')) {

            const roomCode =
                data.split(':')[1]

            console.log(
                'Join request:',
                roomCode
            )

            if (!rooms[roomCode]) {

                socket.send(
                    'room_not_found'
                )

                return
            }

            if (
                rooms[roomCode].player2
            ) {

                socket.send(
                    'room_full'
                )

                return
            }

            rooms[roomCode].player2 =
                socket

            socket.roomCode =
                roomCode

            socket.playerNumber = 2

            console.log(
                'Player 2 joined:',
                roomCode
            )

            socket.send(
                'joined_room'
            )

            rooms[roomCode]
                .player1
                .send('game_ready')

            rooms[roomCode]
                .player2
                .send('game_ready')

        }

        if (data === 'jump') {

            const roomCode =
                socket.roomCode

            if (!roomCode) {
                return
            }

            const room =
                rooms[roomCode]

            if (!room) {
                return
            }

            if (
                socket.playerNumber === 1
            ) {

                if (room.player2) {

                    room.player2.send(
                        'player_jump'
                    )

                }

            }

            if (
                socket.playerNumber === 2
            ) {

                if (room.player1) {

                    room.player1.send(
                        'player_jump'
                    )

                }

            }

        }

    })

    socket.on('close', (code, reason) => {

        console.log(
            'WebSocket client disconnected',
            'code:',
            code,
            'reason:',
            reason.toString()
        )


        const roomCode =
            socket.roomCode

        if (!roomCode) {
            return
        }

        const room =
            rooms[roomCode]

        if (!room) {
            return
        }

        if (
            room.player1 === socket
        ) {

            if (room.player2) {

                room.player2.send(
                    'player_left'
                )

            }

            delete rooms[roomCode]

        }

        else if (
            room.player2 === socket
        ) {

            room.player2 = null

            if (room.player1) {

                room.player1.send(
                    'player_left'
                )

            }

        }

    })

})

server.listen(
    port,
    '0.0.0.0',
    () => {

        console.log(
            `HTTP/WebSocket server running on port ${port}`
        )

    }
)