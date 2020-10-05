app.screen.gameOver = (() => {
  let restart,
    root

  engine.ready(() => {
    root = document.querySelector('.a-gameOver')

    restart = document.querySelector('.a-gameOver--restart')
    restart.addEventListener('click', onRestartClick)

    app.utility.focus.trap(root)

    app.state.screen.on('enter-gameOver', onEnter)
    app.state.screen.on('exit-gameOver', onExit)
  })

  function onEnter() {
    app.utility.focus.set(root)
    engine.loop.on('frame', onFrame)

    updateScores()
  }

  function onExit() {
    engine.loop.off('frame', onFrame)
  }

  function onFrame() {
    const ui = app.controls.ui()

    if ((ui.enter || ui.space) && app.utility.focus.is(restart)) {
      // Native button click
      return
    }

    if (ui.confirm || ui.enter || ui.space) {
      onRestartClick()
    }
  }

  function onRestartClick() {
    app.state.screen.dispatch('restart')
  }

  function updateScores() {
    const highscore = app.storage.getHighscore(),
      score = content.system.score.get()

    const isHighscore = score > highscore

    if (isHighscore) {
      app.storage.setHighscore(score)
    }

    root.querySelector('.a-gameOver--highscore').hidden = isHighscore
    root.querySelector('.a-gameOver--success').hidden = !isHighscore

    root.querySelector('.a-gameOver--scoreValue').innerHTML = app.utility.number.format(score)

    root.querySelector('.a-gameOver--highscoreValue').innerHTML = app.utility.number.format(
      app.storage.getHighscore()
    )
  }

  return {}
})()
