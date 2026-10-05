import { useRef, useEffect } from 'react'

import bird0 from '../assets/bird0.png'
import bird1 from '../assets/bird1.png'
import bird2 from '../assets/bird2.png'

import crow0 from '../assets/birds/crow/crow0.png'
import crow1 from '../assets/birds/crow/crow1.png'
import crow2 from '../assets/birds/crow/crow2.png'

import eagle0 from '../assets/birds/eagle/eagle0.png'
import eagle1 from '../assets/birds/eagle/eagle1.png'
import eagle2 from '../assets/birds/eagle/eagle2.png'

import pipeB from '../assets/top.png'
import pipeP from '../assets/bottom.png'

import background from '../assets/background.png'
import groundImag from '../assets/ground.png'

import jumpSound from '../assets/jump.wav'

import socket from '../services/socket'

function MultiplayerFlappyBird({ selectedBird, onBack }) {

  const canvasRef = useRef(null)

  const localBirdY = useRef(250)
  const remoteBirdY = useRef(250)

  const localVelocity = useRef(0)
  const remoteVelocity = useRef(0)

  const pipeX = useRef(400)

  const score = useRef(0)

  const birdImages = {
    normal: [bird0, bird1, bird2, bird1],
    crow: [crow0, crow1, crow2, crow1],
    eagle: [eagle0, eagle1, eagle2, eagle1],
  }

  useEffect(() => {

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const jumpAudio = new Audio(jumpSound)

    const birdFrames = birdImages[selectedBird] || birdImages.normal

    const birdImage = new Image()
    birdImage.src = birdFrames[0]

    const remoteBirdImage = new Image()
    remoteBirdImage.src = birdFrames[0]

    const pipeBImage = new Image()
    pipeBImage.src = pipeB

    const pipePImage = new Image()
    pipePImage.src = pipeP

    const backgroundImage = new Image()
    backgroundImage.src = background

    const groundImage = new Image()
    groundImage.src = groundImag

    let birdFrame = 0
    let frameCount = 0

    let remoteBirdFrame = 0

    let groundX = 0

    let gameRunning = true

    let animationId

    const gravity = 0.2
    const jumpPower = -5

    const pipeWidth = 60

    const pipeGap = 200

    const pipeSpeed = 2.5

    let pipeTopHeight = 180

    let localDead = false
    let remoteDead = false

    let lastPipeX = 400

    let lastScorePipe = false

    let localBirdWidth = 40
    let localBirdHeight = 40

    let remoteBirdWidth = 40
    let remoteBirdHeight = 40

    if (selectedBird === 'eagle') {

      localBirdWidth = 50
      localBirdHeight = 50

      remoteBirdWidth = 50
      remoteBirdHeight = 50

    }

    /*
      Player 1 / Local Bird
    */

    const localBirdX = 60

    /*
      Player 2 / Remote Bird
    */

    const remoteBirdX = 160

    /*
      Jump کردن پرنده خودمان
    */

    function localJump() {

      if (!gameRunning || localDead) {
        return
      }

      localVelocity.current = jumpPower

      jumpAudio.currentTime = 0
      jumpAudio.play().catch(() => {})

      if (socket.readyState === WebSocket.OPEN) {
        socket.send('jump')
      }

    }

    /*
      دریافت پیام‌های WebSocket
    */

    function handleSocketMessage(event) {

      if (event.data === 'player_jump') {

        if (!remoteDead) {
          remoteVelocity.current = jumpPower
        }

      }

    }

    socket.addEventListener(
      'message',
      handleSocketMessage
    )

    /*
      کیبورد
    */

    function handleKeyDown(event) {

      if (event.code === 'Space') {

        event.preventDefault()

        localJump()

      }

    }

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    /*
      لمس موبایل
    */

    function handleTouch(event) {

      event.preventDefault()

      localJump()

    }

    canvas.addEventListener(
      'touchstart',
      handleTouch
    )

    /*
      برخورد پرنده با لوله
    */

    function checkCollision(
      birdX,
      birdY,
      birdWidth,
      birdHeight
    ) {

      if (
        birdX + birdWidth > pipeX.current &&
        birdX < pipeX.current + pipeWidth
      ) {

        if (
          birdY < pipeTopHeight
        ) {

          return true

        }

        if (
          birdY + birdHeight >
          pipeTopHeight + pipeGap
        ) {

          return true

        }

      }

      return false

    }

    /*
      Game Loop
    */

    function gameLoop() {

      if (!gameRunning) {
        return
      }

      frameCount++

      /*
        Animation
      */

      if (frameCount >= 8) {

        birdFrame++

        if (birdFrame >= 4) {
          birdFrame = 0
        }

        remoteBirdFrame++

        if (remoteBirdFrame >= 4) {
          remoteBirdFrame = 0
        }

        if (!localDead) {

          birdImage.src =
            birdFrames[birdFrame]

        }

        if (!remoteDead) {

          remoteBirdImage.src =
            birdFrames[remoteBirdFrame]

        }

        frameCount = 0

      }

      /*
        Local Bird Physics
      */

      if (!localDead) {

        localVelocity.current += gravity

        localBirdY.current +=
          localVelocity.current

      }

      /*
        Remote Bird Physics
      */

      if (!remoteDead) {

        remoteVelocity.current += gravity

        remoteBirdY.current +=
          remoteVelocity.current

      }

      /*
        سقف
      */

      if (localBirdY.current < 0) {

        localBirdY.current = 0
        localVelocity.current = 0

      }

      if (remoteBirdY.current < 0) {

        remoteBirdY.current = 0
        remoteVelocity.current = 0

      }

      /*
        زمین
      */

      if (localBirdY.current > 540) {

        localBirdY.current = 540
        localDead = true

      }

      if (remoteBirdY.current > 540) {

        remoteBirdY.current = 540
        remoteDead = true

      }

      /*
        برخورد Local
      */

      if (!localDead) {

        if (
          checkCollision(
            localBirdX,
            localBirdY.current,
            localBirdWidth,
            localBirdHeight
          )
        ) {

          localDead = true

        }

      }

      /*
        برخورد Remote
      */

      if (!remoteDead) {

        if (
          checkCollision(
            remoteBirdX,
            remoteBirdY.current,
            remoteBirdWidth,
            remoteBirdHeight
          )
        ) {

          remoteDead = true

        }

      }

      /*
        حرکت لوله
      */

      pipeX.current -= pipeSpeed

      /*
        امتیاز
      */

      if (
        !lastScorePipe &&
        pipeX.current < 60
      ) {

        score.current++

        lastScorePipe = true

      }

      /*
        لوله جدید
      */

      if (pipeX.current < -pipeWidth) {

        pipeX.current = 400

        /*
          برای اینکه هر دو بازیکن
          مسیر مشابهی داشته باشند،
          ارتفاع‌ها از یک الگوی ثابت می‌آیند.
        */

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
          Math.floor(score.current) %
          heights.length

        pipeTopHeight =
          heights[index]

        lastScorePipe = false

        lastPipeX = 400

      }

      /*
        حرکت زمین
      */

      groundX -= 2.5

      if (groundX <= -400) {
        groundX = 0
      }

      /*
        Canvas
      */

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      )

      /*
        Background
      */

      ctx.drawImage(
        backgroundImage,
        0,
        0,
        canvas.width,
        canvas.height
      )

      /*
        Pipe Top
      */

      ctx.drawImage(
        pipeBImage,
        pipeX.current,
        0,
        pipeWidth,
        pipeTopHeight
      )

      /*
        Pipe Bottom
      */

      ctx.drawImage(
        pipePImage,
        pipeX.current,
        pipeTopHeight + pipeGap,
        pipeWidth,
        canvas.height -
        (pipeTopHeight + pipeGap)
      )

      /*
        Ground
      */

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
        Player 1
      */

      ctx.drawImage(
        birdImage,
        localBirdX,
        localBirdY.current,
        localBirdWidth,
        localBirdHeight
      )

      /*
        Player 2
      */

      ctx.drawImage(
        remoteBirdImage,
        remoteBirdX,
        remoteBirdY.current,
        remoteBirdWidth,
        remoteBirdHeight
      )

      /*
        Player Labels
      */

      ctx.font = '16px Arial'
      ctx.textAlign = 'center'

      ctx.fillStyle = 'white'

      ctx.fillText(
        'YOU',
        localBirdX + localBirdWidth / 2,
        localBirdY.current - 8
      )

      ctx.fillText(
        'P2',
        remoteBirdX + remoteBirdWidth / 2,
        remoteBirdY.current - 8
      )

      /*
        Score
      */

      ctx.font = '30px Arial'
      ctx.fillStyle = 'white'

      ctx.fillText(
        score.current,
        200,
        45
      )

      /*
        Death
      */

      if (localDead) {

        ctx.fillStyle =
          'rgba(0, 0, 0, 0.45)'

        ctx.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
        )

        ctx.font = '38px Arial'
        ctx.fillStyle = 'white'

        ctx.fillText(
          'YOU DIED',
          200,
          260
        )

      }

      animationId =
        requestAnimationFrame(gameLoop)

    }

    /*
      شروع بازی
    */

    gameLoop()

    /*
      Cleanup
    */

    return () => {

      gameRunning = false

      cancelAnimationFrame(
        animationId
      )

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

  }, [selectedBird])

  return (
    <div className="multiplayerGamePage">

      <canvas
        className="gameCanvas"
        width="400"
        height="600"
        ref={canvasRef}
      />

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