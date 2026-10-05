const socket = new WebSocket('ws://localhost:8080')

socket.onopen = () => {
  console.log('WebSocket connected')
 
}

socket.onmessage = (event) => {
  console.log('Message from server:', event.data)
}
socket.onclose = () => {
  console.log('WebSocket disconnected')
}

socket.onerror = (error) => {
  console.log('WebSocket error', error)
}

export default socket