app.screen.game = (() => {
  let root

  engine.ready(() => {
    root = document.querySelector('.a-game')
    app.utility.focus.trap(root)

    app.state.screen.on('enter-game', onEnter)
    app.state.screen.on('exit-game', onExit)
  })

  function checkCollision() {
    for (const prop of engine.props.get()) {
      if (content.prop.enemy.base.isPrototypeOf(prop) && !prop.isDead && !engine.utility.round(prop.distance, 1)) {
        return true
      }
    }

    return false
  }

  function handleCollision() {
    content.sfx.gameOver()

    engine.loop.pause()
    engine.props.reset()

    setTimeout(() => app.state.screen.dispatch('gameOver'), 2000)
  }

  function handleControls() {
    const game = app.controls.game()

    content.system.movement.update(game)

    if (game.attack) {
      content.system.attack.trigger()
    }
  }

  function onEnter() {
    app.utility.focus.set(root)
    engine.loop.on('frame', onFrame)

    engine.state.import({
      position: {
        x: 0,
        y: 0,
      },
    })

    content.sfx.start()
    engine.loop.resume()
  }

  function onExit() {
    engine.loop.off('frame', onFrame)
  }

  function onFrame({paused}) {
    if (paused) {
      return
    }

    if (checkCollision()) {
      return handleCollision()
    }

    handleControls()
  }
})()
