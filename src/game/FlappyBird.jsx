import { useState } from 'react'
import { useRef } from 'react'
import { useEffect } from 'react'

import bird0 from '../assets/bird0.png'
import bird1 from '../assets/bird1.png'
import bird2 from '../assets/bird2.png'
import birdD from '../assets/birddead.png'

import crow0 from '../assets/birds/crow/crow0.png'
import crow1 from '../assets/birds/crow/crow1.png'
import crow2 from '../assets/birds/crow/crow2.png'
import crowD from '../assets/birds/crow/crowdead.png'

import eagle0 from '../assets/birds/eagle/eagle0.png'
import eagle1 from '../assets/birds/eagle/eagle2.png'
import eagle2 from '../assets/birds/eagle/eagle2.png'
import eagleD from '../assets/birds/eagle/eagledead.png'

import pipeB from '../assets/top.png'
import pipeP from '../assets/bottom.png'
import jumpSound from '../assets/jump.wav'
import deadSound from '../assets/dead.wav'
import background from '../assets/background.png'
import groundImag from '../assets/ground.png'

import '../App.css'

const birdImages = {
  normal: [bird0, bird1, bird2, bird1],
  crow: [crow0, crow1, crow2, crow1],
  eagle: [eagle0, eagle1, eagle2, eagle1],
}

const birdDeadImages = {
  normal: birdD,
  crow: crowD,
  eagle: eagleD,
}

function FlappyBird({ selectedBird }) {

  const [count, setCount] = useState(0)

  const canvasRef = useRef(null)

  const countRef = useRef(0)

  const birdX = 50

  const birdY = useRef(100)

  const pipeX = useRef(400)

  const pipeWidth = 60

  const canvasWidth = 400

  const canvasHeight = 600

  const pipeGap = 200

  useEffect(() => {

    console.log(selectedBird)

    const canvas = canvasRef.current

    const ctx = canvas.getContext('2d')

    const jumpAudio = new Audio(jumpSound)

    const deadAudio = new Audio(deadSound)

    let bestScore =
      Number(localStorage.getItem('bestScore')) || 0

    let velocity = 0

    let gravity = 0.2

    let birdFrame = 0

    let frameCount = 0

    let pipeSpeed = 2.5

    let pipeTopHeight = 200

    let groundX = 0

    let jumpPower = -5

    let gameStarted = false

    let gameOver = false

    let dead = false

    let deathSoundPlayed = false

    let animationId

    let gameOverTimer

    const resetButtonX = 130
    const resetButtonY = 360
    const resetButtonWidth = 140
    const resetButtonHeight = 50

    let birdWidth = 40
    let birdHeight = 40

    if (selectedBird === 'eagle') {

      birdWidth = 50
      birdHeight = 50

    }

    /*
      PRELOAD BIRD FRAMES
    */

    const birdFrames = birdImages[selectedBird] || birdImages.normal

    const loadedBirdFrames = birdFrames.map((src) => {

      const image = new Image()

      image.src = src

      return image

    })

    const birdDeadImage = new Image()

    birdDeadImage.src =
      birdDeadImages[selectedBird] ||
      birdDeadImages.normal

    /*
      PRELOAD GAME IMAGES
    */

    const pipeBImage = new Image()
    pipeBImage.src = pipeB

    const pipePImage = new Image()
    pipePImage.src = pipeP

    const backgroundImage = new Image()
    backgroundImage.src = background

    const groundImage = new Image()
    groundImage.src = groundImag

    /*
      Jump
    */

    const jump = () => {

      if (!gameStarted) {

        gameStarted = true

        return

      }

      if (
        birdY.current > 0 &&
        !dead
      ) {

        velocity = jumpPower

        jumpAudio.currentTime = 0

        jumpAudio.play().catch(() => {})

      }

    }

    /*
      Reset
    */

    const resetGame = () => {

      gameStarted = false

      gameOver = false

      dead = false

      deathSoundPlayed = false

      birdY.current = 100

      velocity = 0

      pipeX.current = 400

      pipeTopHeight = 200

      pipeSpeed = 2.5

      gravity = 0.2

      jumpPower = -5

      groundX = 0

      countRef.current = 0

      setCount(0)

      birdFrame = 0

      frameCount = 0

      clearTimeout(gameOverTimer)

      gameOverTimer = null

      gameLoop()

    }

    /*
      Keyboard
    */

    const handleKeyDown = (e) => {

      if (e.code === 'Space') {

        e.preventDefault()

        if (gameOver) {

          resetGame()

          return

        }

        jump()

      }

    }

    /*
      Touch
    */

    const handleTouch = (e) => {

      e.preventDefault()

      const rect =
        canvas.getBoundingClientRect()

      const touchX =
        e.touches[0].clientX - rect.left

      const touchY =
        e.touches[0].clientY - rect.top

      if (
        gameOver &&
        touchX >= resetButtonX &&
        touchX <=
        resetButtonX + resetButtonWidth &&
        touchY >= resetButtonY &&
        touchY <=
        resetButtonY + resetButtonHeight
      ) {

        resetGame()

        return

      }

      jump()

    }

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    canvas.addEventListener(
      'touchstart',
      handleTouch
    )

    /*
      Save Best Score
    */

    function saveBestScore() {

      if (
        countRef.current >
        bestScore
      ) {

        bestScore =
          countRef.current

        localStorage.setItem(
          'bestScore',
          bestScore
        )

      }

    }

    /*
      Game Over Timer
    */

    function startGameOverTimer() {

      if (!gameOverTimer) {

        gameOverTimer =
          setTimeout(() => {

            gameOver = true

          }, 1000)

      }

    }

    /*
      Game Loop
    */

    function gameLoop() {

      frameCount++

      /*
        Bird Animation
      */

      if (frameCount >= 8) {

        birdFrame++

        if (birdFrame >= 4) {

          birdFrame = 0

        }

        frameCount = 0

      }

      /*
        Clear Canvas
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
        canvas.width,
        50
      )

      ctx.drawImage(
        groundImage,
        groundX + canvas.width,
        580,
        canvas.width,
        50
      )

      /*
        Ground Movement
      */

      if (
        gameStarted &&
        !dead
      ) {

        groundX -= 2.5

      }

      if (
        groundX <= -canvas.width
      ) {

        groundX = 0

      }

      /*
        Bird
      */

      if (dead) {

        ctx.drawImage(
          birdDeadImage,
          birdX,
          birdY.current,
          birdWidth,
          birdHeight
        )

      } else {

        ctx.drawImage(
          loadedBirdFrames[birdFrame],
          birdX,
          birdY.current,
          birdWidth,
          birdHeight
        )

      }

      /*
        Score
      */

      ctx.font = '30px Arial'

      ctx.fillStyle = 'white'

      ctx.textAlign = 'left'

      ctx.fillText(
        countRef.current,
        180,
        50
      )

      /*
        Start Screen
      */

      if (!gameStarted) {

        ctx.font = '24px Arial'

        ctx.fillStyle = 'white'

        ctx.textAlign = 'center'

        ctx.fillText(
          'PRESS SPACE TO START',
          canvas.width / 2,
          300
        )

      }

      /*
        Collision With Pipe
      */

      if (
        gameStarted &&
        !dead &&
        birdX + birdWidth >
        pipeX.current &&
        birdX <
        pipeX.current + pipeWidth
      ) {

        if (
          birdY.current <
          pipeTopHeight
        ) {

          console.log(
            'بالا برخورد کرد'
          )

          dead = true

          saveBestScore()

          if (!deathSoundPlayed) {

            deadAudio.currentTime = 0

            deadAudio.play().catch(() => {})

            deathSoundPlayed = true

          }

          startGameOverTimer()

        }

        if (
          birdY.current +
          birdHeight >
          pipeTopHeight + pipeGap
        ) {

          console.log(
            'پایین برخورد کرد'
          )

          dead = true

          saveBestScore()

          if (!deathSoundPlayed) {

            deadAudio.currentTime = 0

            deadAudio.play().catch(() => {})

            deathSoundPlayed = true

          }

          startGameOverTimer()

        }

      }

      /*
        Pipe Movement
      */

      if (
        gameStarted &&
        !dead
      ) {

        pipeX.current -=
          pipeSpeed

      }

      /*
        Gravity
      */

      if (
        gameStarted &&
        !gameOver
      ) {

        if (
          birdY.current <
          560
        ) {

          velocity += gravity

          birdY.current +=
            velocity

        } else {

          birdY.current = 560

          if (!dead) {

            dead = true

            saveBestScore()

            if (!deathSoundPlayed) {

              deadAudio.currentTime = 0

              deadAudio.play().catch(() => {})

              deathSoundPlayed = true

            }

            startGameOverTimer()

          }

        }

      }

      /*
        Ceiling
      */

      if (
        birdY.current < 0
      ) {

        birdY.current = 0

        velocity = 0

      }

      /*
        New Pipe
      */

      if (
        gameStarted &&
        !dead &&
        pipeX.current < -60
      ) {

        setCount(prev => {

          const next = prev + 1

          countRef.current = next

          if (
            next % 5 === 0
          ) {

            pipeSpeed += 0.5

            jumpPower -= 0.1

            gravity += 0.02

          }

          if (
            countRef.current < 5
          ) {

            pipeSpeed += 0.2

          }

          return next

        })

        pipeX.current = 400

        pipeTopHeight =
          100 +
          Math.random() * 200

      }

      /*
        Game Over
      */

      if (gameOver) {

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

        ctx.textAlign = 'center'

        ctx.fillText(
          'GAME OVER',
          canvas.width / 2,
          240
        )

        ctx.font = '26px Arial'

        ctx.fillText(
          `Score: ${countRef.current}`,
          canvas.width / 2,
          290
        )

        ctx.fillText(
          `Best: ${bestScore}`,
          canvas.width / 2,
          330
        )

        ctx.fillStyle = 'white'

        ctx.fillRect(
          resetButtonX,
          resetButtonY,
          resetButtonWidth,
          resetButtonHeight
        )

        ctx.font = '24px Arial'

        ctx.fillStyle = 'black'

        ctx.fillText(
          'RESET',
          canvas.width / 2,
          resetButtonY + 33
        )

      }

      /*
        Continue Game Loop
      */

      if (!gameOver) {

        animationId =
          requestAnimationFrame(
            gameLoop
          )

      }

    }

    /*
      Start
    */

    gameLoop()

    /*
      Cleanup
    */

    return () => {

      window.removeEventListener(
        'keydown',
        handleKeyDown
      )

      canvas.removeEventListener(
        'touchstart',
        handleTouch
      )

      cancelAnimationFrame(
        animationId
      )

      clearTimeout(
        gameOverTimer
      )

    }

  }, [selectedBird])

  return (

    <canvas
      className="gameCanvas"
      width="400"
      height="600"
      ref={canvasRef}
    />

  )

}

export default FlappyBird