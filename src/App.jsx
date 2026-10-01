import { useState } from 'react'
import { useRef } from 'react'
import { useEffect } from 'react'

import bird0 from './assets/bird0.png'
import bird1 from './assets/bird1.png'
import bird2 from './assets/bird2.png'
import birdD from './assets/birddead.png'
import pipeB from './assets/top.png'
import pipeP from './assets/bottom.png'
import jumpSound from './assets/jump.wav'
import deadSound from './assets/dead.wav'
import background from './assets/background.png'
import groundImag from './assets/ground.png'

import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const canvasRef = useRef(null)
  const countRef = useRef(0)

  const birdX = 50
  const birdY = useRef(100)

  const pipeX = useRef(400)
  const pipeWidth = 60
  const pipeHeight = 200

  const birdImage = new Image()
  birdImage.src = bird0

  const pipeBImage = new Image()
  pipeBImage.src = pipeB

  const pipePImage = new Image()
  pipePImage.src = pipeP

  const backgroundImage = new Image()
  backgroundImage.src = background

  const groundImage = new Image()
  groundImage.src = groundImag

  const birdFrames = [bird0, bird1, bird2, bird1]

  useEffect(() => {
    console.log("Canvas آماده شد")

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    const jumpAudio = new Audio(jumpSound)
    const deadAudio = new Audio(deadSound)

    // Best Score از حافظه مرورگر
    let bestScore =
      Number(localStorage.getItem("bestScore")) || 0

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
    let resetRequested = false

    let animationId
    let gameOverTimer

    const resetButtonX = 130
    const resetButtonY = 360
    const resetButtonWidth = 140
    const resetButtonHeight = 50


    const jump = () => {
      if (!gameStarted) {
        gameStarted = true

        return
      }

      if (birdY.current > 0 && !dead) {
        velocity = jumpPower

        jumpAudio.currentTime = 0
        jumpAudio.play()
      }
    }

    const handleKeyDown = (e) => {
      if (e.code === "Space") {

        if (gameOver) {
          resetGame()
          return
        }

        jump()
      }
    }

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

      birdImage.src = bird0

      clearTimeout(gameOverTimer)
      gameOverTimer = null

      gameLoop()
    }

    const handleTouch = (e) => {
      e.preventDefault()

      const rect = canvas.getBoundingClientRect()

      const touchX =
        e.touches[0].clientX - rect.left

      const touchY =
        e.touches[0].clientY - rect.top

      if (
        gameOver &&
        touchX >= resetButtonX &&
        touchX <= resetButtonX + resetButtonWidth &&
        touchY >= resetButtonY &&
        touchY <= resetButtonY + resetButtonHeight
      ) {
        resetRequested = true
        return
      }

      jump()
    }



    window.addEventListener(
      "keydown",
      handleKeyDown
    )

    canvas.addEventListener(
      "touchstart",
      handleTouch
    )

    // ذخیره Best Score
    function saveBestScore() {
      if (countRef.current > bestScore) {
        bestScore = countRef.current

        localStorage.setItem(
          "bestScore",
          bestScore
        )
      }
    }

    // نمایش Game Over با یک ثانیه تأخیر
    function startGameOverTimer() {
      if (!gameOverTimer) {
        gameOverTimer = setTimeout(() => {
          gameOver = true
        }, 1000)
      }
    }

    function gameLoop() {

      frameCount = frameCount + 1

      // انیمیشن پرنده
      if (frameCount >= 8) {
        birdFrame = birdFrame + 1

        if (birdFrame == 4) {
          birdFrame = 0
        }

        frameCount = 0

        if (gameStarted && !dead) {
          birdImage.src =
            birdFrames[birdFrame]
        }
      }

      // پاک کردن Canvas
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      )

      // Background
      ctx.drawImage(
        backgroundImage,
        0,
        0,
        canvas.width,
        canvas.height
      )

      // لوله بالا
      ctx.drawImage(
        pipeBImage,
        pipeX.current,
        0,
        pipeWidth,
        pipeTopHeight
      )

      // لوله پایین
      ctx.drawImage(
        pipePImage,
        pipeX.current,
        pipeTopHeight + 200,
        pipeWidth,
        canvas.height -
        (pipeTopHeight + 200)
      )

      // زمین
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

      // حرکت زمین
      if (gameStarted && !dead) {
        groundX = groundX - 2.5
      }

      if (groundX <= -canvas.width) {
        groundX = 0
      }

      // پرنده
      ctx.drawImage(
        birdImage,
        birdX,
        birdY.current,
        40,
        40
      )

      // Score
      ctx.font = "30px Arial"
      ctx.fillStyle = "white"
      ctx.textAlign = "left"

      ctx.fillText(
        countRef.current,
        180,
        50
      )

      // صفحه شروع
      if (!gameStarted) {
        ctx.font = "24px Arial"
        ctx.fillStyle = "white"
        ctx.textAlign = "center"

        ctx.fillText(
          "PRESS SPACE TO START",
          canvas.width / 2,
          300
        )
      }

      // برخورد با لوله‌ها
      if (
        gameStarted &&
        !dead &&
        birdX + 40 > pipeX.current &&
        birdX < pipeX.current + pipeWidth
      ) {

        // برخورد با لوله بالا
        if (
          birdY.current < pipeTopHeight
        ) {
          console.log("بالا برخورد کرد")

          dead = true
          birdImage.src = birdD

          saveBestScore()

          if (!deathSoundPlayed) {
            deadAudio.currentTime = 0
            deadAudio.play()

            deathSoundPlayed = true
          }

          startGameOverTimer()
        }

        // برخورد با لوله پایین
        if (
          birdY.current + 40 >
          pipeTopHeight + 200
        ) {
          console.log("پایین برخورد کرد")

          dead = true
          birdImage.src = birdD

          saveBestScore()

          if (!deathSoundPlayed) {
            deadAudio.currentTime = 0
            deadAudio.play()

            deathSoundPlayed = true
          }

          startGameOverTimer()
        }
      }

      // حرکت لوله
      if (gameStarted && !dead) {
        pipeX.current =
          pipeX.current - pipeSpeed
      }

      // Gravity
      // حتی بعد از مرگ هم ادامه پیدا می‌کند
      // تا پرنده یک ثانیه سقوط کند
      if (
        gameStarted &&
        !gameOver
      ) {

        if (birdY.current < 560) {

          velocity =
            velocity + gravity

          birdY.current =
            birdY.current + velocity

        } else {

          birdY.current = 560

          birdImage.src = birdD

          ctx.drawImage(
            birdImage,
            birdX,
            birdY.current,
            40,
            40
          )

          if (!dead) {
            dead = true

            saveBestScore()

            if (!deathSoundPlayed) {
              deadAudio.currentTime = 0
              deadAudio.play()

              deathSoundPlayed = true
            }

            startGameOverTimer()
          }
        }
      }

      // برخورد با سقف
      if (birdY.current < 0) {
        birdY.current = 0
        velocity = 0
      }

      // ساخت لوله جدید
      if (
        gameStarted &&
        !dead &&
        pipeX.current < -60
      ) {

        setCount(prev => {

          const next = prev + 1

          countRef.current = next

          // هر 5 امتیاز سخت‌تر شود
          if (next % 5 === 0) {
            pipeSpeed =
              pipeSpeed + 0.5

            jumpPower =
              jumpPower - 0.1

            gravity =
              gravity + 0.02
          }

          // افزایش تدریجی سرعت در 5 امتیاز اول
          if (countRef.current < 5) {
            pipeSpeed =
              pipeSpeed + 0.2
          }

          return next
        })

        pipeX.current = 400

        pipeTopHeight =
          100 + Math.random() * 200
      }


      if (resetRequested) {
        resetRequested = false

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

        birdImage.src = bird0

        clearTimeout(gameOverTimer)
        gameOverTimer = null
      }

      // صفحه Game Over
      if (gameOver) {

        // لایه تار روی بازی
        ctx.fillStyle =
          "rgba(0, 0, 0, 0.45)"

        ctx.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
        )

        // GAME OVER
        ctx.font = "38px Arial"
        ctx.fillStyle = "white"
        ctx.textAlign = "center"

        ctx.fillText(
          "GAME OVER",
          canvas.width / 2,
          240
        )

        // Score
        ctx.font = "26px Arial"

        ctx.fillText(
          `Score: ${countRef.current}`,
          canvas.width / 2,
          290
        )

        // Best Score
        ctx.fillText(
          `Best: ${bestScore}`,
          canvas.width / 2,
          330
        )
        ctx.fillStyle = "white"

        ctx.fillRect(
          resetButtonX,
          resetButtonY,
          resetButtonWidth,
          resetButtonHeight
        )

        ctx.font = "24px Arial"
        ctx.fillStyle = "black"

        ctx.fillText(
          "RESET",
          canvas.width / 2,
          resetButtonY + 33
        )

      }

      // ادامه Game Loop
      if (!gameOver) {
        animationId =
          requestAnimationFrame(gameLoop)
      }
    }

    gameLoop()

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      )

      canvas.removeEventListener(
        "touchstart",
        handleTouch
      )

      cancelAnimationFrame(
        animationId
      )

      clearTimeout(
        gameOverTimer
      )
    }

  }, [])

  return (
    <>
      <canvas
        className="gameCanvas"
        width="400"
        height="600"
        ref={canvasRef}
      >
      </canvas>
    </>
  )
}

export default App