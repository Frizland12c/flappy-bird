import { useState } from 'react'

import Home from './pages/Home'
import Settings from './pages/Settings'
import Birds from './pages/Birds'
import Multiplayer from './pages/Multiplayer'

import socket from './services/socket'

function App() {

  const [page, setPage] = useState('home')

  const [selectedBird, setSelectedBird] =
    useState('normal')

  console.log(socket)

  return (
    <>

      {page === 'home' && (
        <Home
          onSettings={() => setPage('settings')}
          selectedBird={selectedBird}
        />
      )}

      {page === 'settings' && (
        <Settings
          onBack={() => setPage('home')}
          onBirds={() => setPage('birds')}
          onMultiplayer={() => setPage('multiplayer')}
        />
      )}

      {page === 'birds' && (
        <Birds
          onBack={() => setPage('settings')}
          selectedBird={selectedBird}
          onSelectBird={setSelectedBird}
        />
      )}

      {page === 'multiplayer' && (
        <Multiplayer
          onBack={() => setPage('settings')}
          selectedBird={selectedBird}
        />
      )}

    </>
  )
}

export default App