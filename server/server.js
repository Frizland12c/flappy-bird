import { WebSocketServer } from 'ws'

const port = process.env.PORT || 8080

const wss = new WebSocketServer({
    port: port
})

console.log(`WebSocket server running on port ${port}`)

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

        console.log('Message from client:', data)


        /*
          CREATE ROOM
        */

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


        /*
          JOIN ROOM
        */

        if (data.startsWith('join_room:')) {

            const roomCode =
                data.split(':')[1]


            console.log(
                'Join request for room:',
                roomCode
            )


            /*
              Room وجود ندارد
            */

            if (!rooms[roomCode]) {

                console.log(
                    'Room not found'
                )

                socket.send(
                    'room_not_found'
                )

            }


            /*
              Room پر است
            */

            else if (
                rooms[roomCode].player2
            ) {

                console.log(
                    'Room is full'
                )

                socket.send(
                    'room_full'
                )

            }


            /*
              ورود Player 2
            */

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


                /*
                  به Player 2
                */

                socket.send(
                    'joined_room'
                )


                /*
                  بازی برای هر دو آماده است
                */

                rooms[roomCode]
                    .player1
                    .send('game_ready')


                rooms[roomCode]
                    .player2
                    .send('game_ready')

            }

        }


        /*
          PLAYER JUMP
        */

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


            /*
              اگر Player 1 پرید
              برای Player 2 بفرست
            */

            if (
                socket.playerNumber === 1
            ) {

                if (room.player2) {

                    room.player2.send(
                        'player_jump'
                    )

                }

            }


            /*
              اگر Player 2 پرید
              برای Player 1 بفرست
            */

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


    /*
      قطع شدن اتصال
    */

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


        /*
          اگر Player 1 قطع شد
        */

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


        /*
          اگر Player 2 قطع شد
        */

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