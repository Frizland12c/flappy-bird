let socket = null

let reconnectAttempts = 0

const maxReconnectDelay = 10000

function connect() {

  socket = new WebSocket(
    'wss://flappy-bird-y45l.onrender.com/ws'
  )

  socket.onopen = () => {

    console.log('WebSocket connected')

    reconnectAttempts = 0

  }

  socket.onmessage = (event) => {

    console.log(
      'Message from server:',
      event.data
    )

  }

  socket.onclose = () => {

    console.log(
      'WebSocket disconnected'
    )

    reconnect()

  }

  socket.onerror = (error) => {

    console.log(
      'WebSocket error',
      error
    )

  }

}

function reconnect() {

  reconnectAttempts++

  const delay = Math.min(
    1000 * 2 ** (reconnectAttempts - 1),
    maxReconnectDelay
  )

  console.log(
    `Reconnecting in ${delay}ms...`
  )

  setTimeout(() => {

    connect()

  }, delay)

}

connect()

export default {

  get readyState() {

    return socket?.readyState

  },

  send(message) {

    if (
      socket &&
      socket.readyState === WebSocket.OPEN
    ) {

      socket.send(message)

    }

  },

  addEventListener(type, handler) {

    socket?.addEventListener(
      type,
      handler
    )

  },

  removeEventListener(type, handler) {

    socket?.removeEventListener(
      type,
      handler
    )

  }

}