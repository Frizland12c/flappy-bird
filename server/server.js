import http from 'http'
import { WebSocketServer } from 'ws'

const port = process.env.PORT || 8080

const server = http.createServer((req, res) => {

    if (req.url === '/') {

        res.writeHead(200, {
            'Content-Type': 'text/plain'
        })

        res.end('Flappy Bird WebSocket Server is running')

        return
    }

    res.writeHead(404)
    res.end()

})

const wss = new WebSocketServer({
    server: server,
    path: '/ws'
})

console.log(
    `Starting server on port ${port}`
)

const rooms = {}

function createRoomCode() {

    return Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase()

}

wss.on('connection', (socket) => {

    console.log('Client connected')

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
                'Join request for room:',
                roomCode
            )

            if (!rooms[roomCode]) {

                socket.send(
                    'room_not_found'
                )

            }

            else if (
                rooms[roomCode].player2
            ) {

                socket.send(
                    'room_full'
                )

            }

            else {

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

    socket.on('close', () => {

        console.log(
            'Client disconnected'
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