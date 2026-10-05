import { useState, useEffect } from 'react'
import socket from '../services/socket'
import MultiplayerFlappyBird from '../game/MultiplayerFlappyBird'

function Multiplayer({
  onBack,
  selectedBird
}) {

  const [roomCode, setRoomCode] =
    useState('')

  const [joinCode, setJoinCode] =
    useState('')

  const [message, setMessage] =
    useState('')

  const [gameReady, setGameReady] =
    useState(false)

  const [countdown, setCountdown] =
    useState(null)

  const [remoteBird, setRemoteBird] =
    useState('normal')

  useEffect(() => {

    let countdownTimer

    function handleMessage(event) {

      if (
        event.data ===
        'joined_room'
      ) {

        setMessage(
          'Joined successfully!'
        )

      }

      else if (
        event.data.startsWith(
          'remote_bird:'
        )
      ) {

        const bird =
          event.data.split(':')[1]

        if (
          bird === 'normal' ||
          bird === 'crow' ||
          bird === 'eagle'
        ) {

          setRemoteBird(bird)

        }

      }

      else if (
        event.data ===
        'countdown_start'
      ) {

        setMessage(
          'Get ready!'
        )

        setCountdown(5)

        let number = 5

        clearInterval(
          countdownTimer
        )

        countdownTimer =
          setInterval(() => {

            number--

            if (number > 0) {

              setCountdown(
                number
              )

            } else {

              clearInterval(
                countdownTimer
              )

              setCountdown(
                null
              )

              setGameReady(
                true
              )

            }

          }, 1000)

      }

      else if (
        event.data ===
        'player_left'
      ) {

        clearInterval(
          countdownTimer
        )

        setCountdown(
          null
        )

        setGameReady(
          false
        )

        setRemoteBird(
          'normal'
        )

        setMessage(
          'Player left the game'
        )

      }

      else if (
        event.data ===
        'room_not_found'
      ) {

        setMessage(
          'Room not found'
        )

      }

      else if (
        event.data ===
        'room_full'
      ) {

        setMessage(
          'Room is full'
        )

      }

      else if (
        event.data.length === 5
      ) {

        setRoomCode(
          event.data
        )

      }

    }

    socket.addEventListener(
      'message',
      handleMessage
    )

    return () => {

      clearInterval(
        countdownTimer
      )

      socket.removeEventListener(
        'message',
        handleMessage
      )

    }

  }, [])

  function createRoom() {

    if (
      socket.readyState !==
      WebSocket.OPEN
    ) {

      setMessage(
        'WebSocket is not connected'
      )

      return

    }

    setRemoteBird(
      'normal'
    )

    socket.send(
      `create_room:${selectedBird}`
    )

    setMessage(
      'Waiting for Player 2...'
    )

  }

  function joinRoom() {

    if (!joinCode) {

      setMessage(
        'Enter room code'
      )

      return

    }

    if (
      socket.readyState !==
      WebSocket.OPEN
    ) {

      setMessage(
        'WebSocket is not connected'
      )

      return

    }

    socket.send(
      `join_room:${joinCode.toUpperCase()}:${selectedBird}`
    )

    setMessage(
      'Joining room...'
    )

  }

  if (gameReady) {

    return (
      <MultiplayerFlappyBird
        selectedBird={selectedBird}
        remoteBird={remoteBird}
        onBack={onBack}
      />
    )

  }

  return (

    <div className="multiplayerPage">

      <h1>
        MULTIPLAYER
      </h1>

      {countdown !== null ? (

        <div className="countdownBox">

          <p className="countdownText">
            GET READY
          </p>

          <div className="countdownNumber">
            {countdown}
          </div>

        </div>

      ) : (

        <>

          <button
            className="multiplayerOption"
            onClick={createRoom}
          >
            🎮 Create Room
          </button>

          {roomCode && (

            <div className="roomCodeBox">

              <p>
                ROOM CODE
              </p>

              <strong>
                {roomCode}
              </strong>

              <span>
                Waiting for Player 2...
              </span>

            </div>

          )}

          <div className="joinBox">

            <input
              type="text"
              placeholder="ENTER ROOM CODE"
              value={joinCode}
              onChange={(e) => {

                setJoinCode(
                  e.target.value.toUpperCase()
                )

              }}
              maxLength={5}
            />

            <button
              className="multiplayerOption"
              onClick={joinRoom}
            >
              🔑 Join Room
            </button>

          </div>

          {message && (

            <p className="multiplayerMessage">
              {message}
            </p>

          )}

          <button
            className="backButton"
            onClick={onBack}
          >
            ← Back
          </button>

        </>

      )}

    </div>

  )

}

export default Multiplayer