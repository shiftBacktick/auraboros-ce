app.controls.mouse = (() => {
  const sensitivity = 10

  let gameScreen

  engine.ready(() => {
    gameScreen = document.querySelector('.a-game')
    gameScreen.addEventListener('click', onClick)

    app.state.screen.on('exit-game', onExitGame)
    app.state.screen.on('enter-game', onEnterGame)
  })

  function exitPointerLock() {
    document.exitPointerLock()
  }

  function isPointerLock() {
    return document.pointerLockElement === gameScreen
  }

  function onClick() {
    if (!isPointerLock()) {
      requestPointerLock()
    }
  }

  function onEnterGame() {
    requestPointerLock()
  }

  function onExitGame() {
    if (isPointerLock()) {
      exitPointerLock()
    }
  }

  function requestPointerLock() {
    gameScreen.requestPointerLock()
  }

  return {
    game: function () {
      if (!isPointerLock()) {
        return {}
      }

      const mouse = engine.input.mouse.get(),
        state = {}

      if (mouse.button[0]) {
        state.attack = true
      }

      if (mouse.moveX) {
        const screenRatio = window.innerWidth / 1080
        state.rotate = engine.utility.scale(mouse.moveX, -window.innerWidth, window.innerWidth, screenRatio, -screenRatio) * sensitivity
      }

      return state
    },
    ui: function () {
      return {}
    },
  }
})()
