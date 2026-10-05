import { useState, useEffect } from 'react'
import socket from '../services/socket'
import MultiplayerFlappyBird from '../game/MultiplayerFlappyBird'

function Multiplayer({ onBack, selectedBird }) {

  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [message, setMessage] = useState('')
  const [gameReady, setGameReady] = useState(false)

  useEffect(() => {

    function handleMessage(event) {

      if (event.data === 'joined_room') {

        setMessage('Joined successfully!')

      } else if (event.data === 'game_ready') {

        setMessage('Game is ready!')
        setGameReady(true)

      } else if (event.data === 'player_left') {

        setMessage('Player left the game')

      } else if (event.data.length === 5) {

        setRoomCode(event.data)

      }

    }

    socket.addEventListener('message', handleMessage)

    return () => {
      socket.removeEventListener('message', handleMessage)
    }

  }, [])

  function createRoom() {

    if (socket.readyState !== WebSocket.OPEN) {
      setMessage('WebSocket is not connected')
      return
    }

    socket.send('create_room')
    setMessage('Creating room...')

  }

  function joinRoom() {

    if (!joinCode) {
      setMessage('Enter room code')
      return
    }

    if (socket.readyState !== WebSocket.OPEN) {
      setMessage('WebSocket is not connected')
      return
    }

    socket.send(
      `join_room:${joinCode.toUpperCase()}`
    )

    setMessage('Joining room...')

  }

  if (gameReady) {

    return (
      <MultiplayerFlappyBird
        selectedBird={selectedBird}
        onBack={onBack}
      />
    )

  }

  return (
    <div className="multiplayerPage">

      <h1>MULTIPLAYER</h1>

      <button
        className="multiplayerOption"
        onClick={createRoom}
      >
        🎮 Create Room
      </button>

      {roomCode && (
        <p>
          Room Code: {roomCode}
        </p>
      )}

      <input
        type="text"
        placeholder="Enter room code"
        value={joinCode}
        onChange={(e) => {
          setJoinCode(e.target.value.toUpperCase())
        }}
        maxLength={5}
      />

      <button
        className="multiplayerOption"
        onClick={joinRoom}
      >
        🔑 Join Room
      </button>

      {message && (
        <p>
          {message}
        </p>
      )}

      <button
        className="backButton"
        onClick={onBack}
      >
        ← Back
      </button>

    </div>
  )
}

export default Multiplayer