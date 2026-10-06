import { useRef, useEffect, useState } from 'react'

import bird0 from '../assets/bird0.png'
import bird1 from '../assets/bird1.png'
import bird2 from '../assets/bird2.png'

import crow0 from '../assets/birds/crow/crow0.png'
import crow1 from '../assets/birds/crow/crow1.png'
import crow2 from '../assets/birds/crow/crow2.png'

import eagle0 from '../assets/birds/eagle/eagle0.png'
import eagle1 from '../assets/birds/eagle/eagle2.png'
import eagle2 from '../assets/birds/eagle/eagle2.png'

import pipeB from '../assets/top.png'
import pipeP from '../assets/bottom.png'

import background from '../assets/background.png'
import groundImag from '../assets/ground.png'

import jumpSound from '../assets/jump.wav'

import socket from '../services/socket'

function MultiplayerFlappyBird({
  selectedBird,
  remoteBird,
  onBack
}) {

  const canvasRef =
    useRef(null)

  const localBirdY =
    useRef(250)

  const remoteBirdY =
    useRef(250)

  const localVelocity =
    useRef(0)

  const remoteVelocity =
    useRef(0)

  const pipeX =
    useRef(400)

  const score =
    useRef(0)

  const [gameOver, setGameOver] =
    useState(false)

  const [restartCountdown, setRestartCountdown] =
    useState(null)

  const birdImages = {

    normal: [
      bird0,
      bird1,
      bird2,
      bird1
    ],

    crow: [
      crow0,
      crow1,
      crow2,
      crow1
    ],

    eagle: [
      eagle0,
      eagle1,
      eagle2,
      eagle1
    ]

  }

  function loadImage(src) {

    return new Promise(
      (resolve, reject) => {

        const image =
          new Image()

        image.onload = () => {
          resolve(image)
        }

        image.onerror = () => {

          reject(
            new Error(
              `Failed to load image: ${src}`
            )
          )

        }

        image.src = src

      }
    )

  }

  useEffect(() => {

    const canvas =
      canvasRef.current

    const ctx =
      canvas.getContext('2d')

    const jumpAudio =
      new Audio(jumpSound)

    const localBirdFrames =
      birdImages[selectedBird] ||
      birdImages.normal

    const remoteBirdFrames =
      birdImages[remoteBird] ||
      birdImages.normal

    let localLoadedFrames = []
    let remoteLoadedFrames = []

    let pipeBImage
    let pipePImage
    let backgroundImage
    let groundImage

    let birdFrame = 0
    let remoteBirdFrame = 0

    let frameCount = 0

    let groundX = 0

    let gameRunning = true

    let animationId = null

    let restartTimer = null

    const gravity = 0.2
    const jumpPower = -5

    const pipeWidth = 60
    const pipeGap = 200
    const pipeSpeed = 2.5

    let pipeTopHeight = 180

    let localDead = false
    let remoteDead = false

    let localDeathTime = null
    let remoteDeathTime = null

    let deathMessageSent = false

    let lastScorePipe = false

    let localBirdWidth = 40
    let localBirdHeight = 40

    let remoteBirdWidth = 40
    let remoteBirdHeight = 40

    if (
      selectedBird ===
      'eagle'
    ) {

      localBirdWidth = 50
      localBirdHeight = 50

    }

    if (
      remoteBird ===
      'eagle'
    ) {

      remoteBirdWidth = 50
      remoteBirdHeight = 50

    }

    const localBirdX = 60
    const remoteBirdX = 160

    function sendDeathMessage() {

      if (
        deathMessageSent
      ) {

        return

      }

      deathMessageSent = true

      if (
        socket.readyState ===
        WebSocket.OPEN
      ) {

        socket.send(
          'player_dead'
        )

      }

    }

    function localJump() {

      if (
        !gameRunning ||
        localDead
      ) {

        return

      }

      localVelocity.current =
        jumpPower

      jumpAudio.currentTime = 0

      jumpAudio
        .play()
        .catch(() => {})

      if (
        socket.readyState ===
        WebSocket.OPEN
      ) {

        socket.send(
          'jump'
        )

      }

    }

    function resetGame() {

      if (restartTimer) {

        clearInterval(
          restartTimer
        )

        restartTimer = null

      }

      if (animationId) {

        cancelAnimationFrame(
          animationId
        )

        animationId = null

      }

      localBirdY.current = 250
      remoteBirdY.current = 250

      localVelocity.current = 0
      remoteVelocity.current = 0

      pipeX.current = 400

      score.current = 0

      birdFrame = 0
      remoteBirdFrame = 0

      frameCount = 0

      groundX = 0

      pipeTopHeight = 180

      localDead = false
      remoteDead = false

      localDeathTime = null
      remoteDeathTime = null

      deathMessageSent = false
      lastScorePipe = false

      gameRunning = false

      setGameOver(false)

      setRestartCountdown(5)

      let number = 5

      restartTimer =
        setInterval(() => {

          number--

          if (
            number > 0
          ) {

            setRestartCountdown(
              number
            )

          } else {

            clearInterval(
              restartTimer
            )

            restartTimer = null

            setRestartCountdown(
              null
            )

            gameRunning = true

            gameLoop()

          }

        }, 1000)

    }

    function handleSocketMessage(
      event
    ) {

      if (
        event.data ===
        'player_jump'
      ) {

        if (
          !remoteDead &&
          gameRunning
        ) {

          remoteVelocity.current =
            jumpPower

        }

      }

      else if (
        event.data ===
        'player_dead'
      ) {

        if (
          !remoteDead
        ) {

          remoteDead = true

          remoteDeathTime =
            Date.now()

          remoteVelocity.current = 0

        }

        /*
          اگر بازیکن خودمان قبلاً مرده باشد،
          gameLoop همچنان یک ثانیه ادامه پیدا
          می‌کند تا جسد هر دو بازیکن دیده شود.
        */

      }

      else if (
        event.data ===
        'restart_game'
      ) {

        resetGame()

      }

    }

    socket.addEventListener(
      'message',
      handleSocketMessage
    )

    function handleKeyDown(
      event
    ) {

      if (
        event.code ===
        'Space'
      ) {

        event.preventDefault()

        localJump()

      }

    }

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    function handleTouch(
      event
    ) {

      event.preventDefault()

      localJump()

    }

    canvas.addEventListener(
      'touchstart',
      handleTouch
    )

    function checkCollision(
      birdX,
      birdY,
      birdWidth,
      birdHeight
    ) {

      if (
        birdX + birdWidth >
          pipeX.current &&
        birdX <
          pipeX.current +
          pipeWidth
      ) {

        if (
          birdY <
          pipeTopHeight
        ) {

          return true

        }

        if (
          birdY +
            birdHeight >
          pipeTopHeight +
            pipeGap
        ) {

          return true

        }

      }

      return false

    }

    async function startGame() {

      try {

        const allImages =
          await Promise.all([

            ...localBirdFrames.map(
              loadImage
            ),

            ...remoteBirdFrames.map(
              loadImage
            ),

            loadImage(pipeB),
            loadImage(pipeP),
            loadImage(background),
            loadImage(groundImag)

          ])

        if (!gameRunning) {
          return
        }

        let index = 0

        localLoadedFrames =
          allImages.slice(
            index,
            index +
              localBirdFrames.length
          )

        index +=
          localBirdFrames.length

        remoteLoadedFrames =
          allImages.slice(
            index,
            index +
              remoteBirdFrames.length
          )

        index +=
          remoteBirdFrames.length

        pipeBImage =
          allImages[index++]

        pipePImage =
          allImages[index++]

        backgroundImage =
          allImages[index++]

        groundImage =
          allImages[index++]

        gameLoop()

      } catch (error) {

        console.error(
          'Failed to load game images:',
          error
        )

      }

    }

    function gameLoop() {

      if (
        !gameRunning
      ) {

        return

      }

      /*
        اگر هر دو بازیکن مرده‌اند،
        بازی بلافاصله متوقف نمی‌شود.

        یک ثانیه اجازه می‌دهیم جسد هر دو
        روی صفحه دیده شود.
      */

      if (
        localDead &&
        remoteDead
      ) {

        const now =
          Date.now()

        const latestDeathTime =
          Math.max(
            localDeathTime || now,
            remoteDeathTime || now
          )

        if (
          now -
            latestDeathTime >=
          1000
        ) {

          gameRunning = false

          setGameOver(true)

          return

        }

      }

      frameCount++

      if (
        frameCount >= 8
      ) {

        /*
          پرنده زنده فریم عوض می‌کند.
          پرنده مرده همان فریمی که در آن
          مرده باقی می‌ماند.
        */

        if (
          !localDead
        ) {

          birdFrame++

          if (
            birdFrame >= 4
          ) {

            birdFrame = 0

          }

        }

        if (
          !remoteDead
        ) {

          remoteBirdFrame++

          if (
            remoteBirdFrame >= 4
          ) {

            remoteBirdFrame = 0

          }

        }

        frameCount = 0

      }

      // LOCAL PHYSICS

      if (
        !localDead
      ) {

        localVelocity.current +=
          gravity

        localBirdY.current +=
          localVelocity.current

      }

      // REMOTE PHYSICS

      if (
        !remoteDead
      ) {

        remoteVelocity.current +=
          gravity

        remoteBirdY.current +=
          remoteVelocity.current

      }

      // CEILING

      if (
        localBirdY.current < 0
      ) {

        localBirdY.current = 0

        localVelocity.current = 0

      }

      if (
        remoteBirdY.current < 0
      ) {

        remoteBirdY.current = 0

        remoteVelocity.current = 0

      }

      // LOCAL GROUND DEATH

      if (
        localBirdY.current >
          540 &&
        !localDead
      ) {

        localBirdY.current = 540

        localDead = true

        localVelocity.current = 0

        localDeathTime =
          Date.now()

        sendDeathMessage()

      }

      // REMOTE GROUND

      if (
        remoteBirdY.current >
          540
      ) {

        remoteBirdY.current = 540

        remoteVelocity.current = 0

      }

      // LOCAL COLLISION

      if (
        !localDead
      ) {

        if (
          checkCollision(
            localBirdX,
            localBirdY.current,
            localBirdWidth,
            localBirdHeight
          )
        ) {

          localDead = true

          localVelocity.current = 0

          localDeathTime =
            Date.now()

          sendDeathMessage()

        }

      }

      // REMOTE COLLISION

      if (
        !remoteDead
      ) {

        if (
          checkCollision(
            remoteBirdX,
            remoteBirdY.current,
            remoteBirdWidth,
            remoteBirdHeight
          )
        ) {

          remoteDead = true

          remoteVelocity.current = 0

          remoteDeathTime =
            Date.now()

        }

      }

      // PIPE

      pipeX.current -=
        pipeSpeed

      // SCORE

      if (
        !lastScorePipe &&
        pipeX.current < 60
      ) {

        score.current++

        lastScorePipe = true

      }

      // NEW PIPE

      if (
        pipeX.current <
        -pipeWidth
      ) {

        pipeX.current = 400

        const heights = [
          150,
          200,
          120,
          180,
          230,
          160,
          210,
          140
        ]

        const index =
          Math.floor(
            score.current
          ) %
          heights.length

        pipeTopHeight =
          heights[index]

        lastScorePipe = false

      }

      // GROUND

      groundX -= 2.5

      if (
        groundX <= -400
      ) {

        groundX = 0

      }

      // CANVAS

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      )

      // BACKGROUND

      ctx.drawImage(
        backgroundImage,
        0,
        0,
        canvas.width,
        canvas.height
      )

      // PIPE TOP

      ctx.drawImage(
        pipeBImage,
        pipeX.current,
        0,
        pipeWidth,
        pipeTopHeight
      )

      // PIPE BOTTOM

      ctx.drawImage(
        pipePImage,
        pipeX.current,
        pipeTopHeight +
          pipeGap,
        pipeWidth,
        canvas.height -
          (
            pipeTopHeight +
            pipeGap
          )
      )

      // GROUND

      ctx.drawImage(
        groundImage,
        groundX,
        580,
        400,
        50
      )

      ctx.drawImage(
        groundImage,
        groundX + 400,
        580,
        400,
        50
      )

      /*
        PLAYER 1

        پرنده مرده تا یک ثانیه بعد از مرگ
        روی همان نقطه می‌ماند.
      */

      const showLocalCorpse =
        localDead &&
        localDeathTime !== null &&
        Date.now() -
          localDeathTime <
          1000

      if (
        !localDead ||
        showLocalCorpse
      ) {

        if (
          localLoadedFrames[
            birdFrame
          ]
        ) {

          ctx.drawImage(
            localLoadedFrames[
              birdFrame
            ],
            localBirdX,
            localBirdY.current,
            localBirdWidth,
            localBirdHeight
          )

        }

      }

      /*
        PLAYER 2

        پرنده مرده تا یک ثانیه بعد از مرگ
        روی همان نقطه می‌ماند.
      */

      const showRemoteCorpse =
        remoteDead &&
        remoteDeathTime !== null &&
        Date.now() -
          remoteDeathTime <
          1000

      if (
        !remoteDead ||
        showRemoteCorpse
      ) {

        if (
          remoteLoadedFrames[
            remoteBirdFrame
          ]
        ) {

          ctx.drawImage(
            remoteLoadedFrames[
              remoteBirdFrame
            ],
            remoteBirdX,
            remoteBirdY.current,
            remoteBirdWidth,
            remoteBirdHeight
          )

        }

      }

      // LABELS

      ctx.font =
        '16px Arial'

      ctx.textAlign =
        'center'

      ctx.fillStyle =
        'white'

      if (
        !localDead
      ) {

        ctx.fillText(
          'YOU',
          localBirdX +
            localBirdWidth / 2,
          localBirdY.current - 8
        )

      }
      else if (
        showLocalCorpse
      ) {

        ctx.fillText(
          'DEAD',
          localBirdX +
            localBirdWidth / 2,
          localBirdY.current - 8
        )

      }

      if (
        !remoteDead
      ) {

        ctx.fillText(
          'P2',
          remoteBirdX +
            remoteBirdWidth / 2,
          remoteBirdY.current - 8
        )

      }
      else if (
        showRemoteCorpse
      ) {

        ctx.fillText(
          'DEAD',
          remoteBirdX +
            remoteBirdWidth / 2,
          remoteBirdY.current - 8
        )

      }

      // SCORE

      ctx.font =
        '30px Arial'

      ctx.fillStyle =
        'white'

      ctx.fillText(
        score.current,
        200,
        45
      )

      // DEATH OVERLAY

      if (
        localDead
      ) {

        ctx.fillStyle =
          'rgba(0, 0, 0, 0.45)'

        ctx.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
        )

        ctx.font =
          '38px Arial'

        ctx.fillStyle =
          'white'

        ctx.fillText(
          'YOU DIED',
          200,
          260
        )

      }

      // GAME OVER

      if (
        localDead &&
        remoteDead
      ) {

        const now =
          Date.now()

        const latestDeathTime =
          Math.max(
            localDeathTime || now,
            remoteDeathTime || now
          )

        /*
          تا یک ثانیه بعد از آخرین مرگ،
          GAME OVER نمایش داده نمی‌شود.
        */

        if (
          now -
            latestDeathTime >=
          1000
        ) {

          ctx.fillStyle =
            'rgba(0, 0, 0, 0.65)'

          ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
          )

          ctx.font =
            '38px Arial'

          ctx.fillStyle =
            'white'

          ctx.fillText(
            'GAME OVER',
            200,
            250
          )

          ctx.font =
            '22px Arial'

          ctx.fillText(
            `Score: ${score.current}`,
            200,
            290
          )

        }

      }

      animationId =
        requestAnimationFrame(
          gameLoop
        )

    }

    startGame()

    return () => {

      gameRunning = false

      if (animationId) {

        cancelAnimationFrame(
          animationId
        )

      }

      if (restartTimer) {

        clearInterval(
          restartTimer
        )

      }

      window.removeEventListener(
        'keydown',
        handleKeyDown
      )

      canvas.removeEventListener(
        'touchstart',
        handleTouch
      )

      socket.removeEventListener(
        'message',
        handleSocketMessage
      )

    }

  }, [
    selectedBird,
    remoteBird
  ])

  function restartGame() {

    if (
      socket.readyState ===
      WebSocket.OPEN
    ) {

      socket.send(
        'restart_game'
      )

    }

  }

  return (

    <div className="multiplayerGamePage">

      <canvas
        className="gameCanvas"
        width="400"
        height="600"
        ref={canvasRef}
      />

      {restartCountdown !== null && (

        <div className="restartOverlay">

          <p>
            GET READY
          </p>

          <strong>
            {restartCountdown}
          </strong>

        </div>

      )}

      {gameOver && (

        <button
          className="multiplayerRestartButton"
          onClick={restartGame}
        >
          🔄 RESTART
        </button>

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

export default MultiplayerFlappyBird