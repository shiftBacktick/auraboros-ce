app.screen.splash = (() => {
  let root,
    start

  engine.ready(() => {
    root = document.querySelector('.a-splash')

    start = root.querySelector('.a-splash--start')
    start.addEventListener('click', onStartClick)

    app.utility.focus.trap(root)

    app.state.screen.on('enter-splash', onEnter)
    app.state.screen.on('exit-splash', onExit)

    root.querySelector('.a-splash--version').innerHTML = `v${app.version()}`
  })

  function onEnter() {
    app.utility.focus.set(root)
    engine.loop.on('frame', onFrame)
    updateHighscore()
  }

  function onExit() {
    engine.loop.off('frame', onFrame)
  }

  function onFrame() {
    const ui = app.controls.ui()

    if ((ui.enter || ui.space) && app.utility.focus.is(start)) {
      // Native button click
      return
    }

    if (ui.confirm || ui.enter || ui.space) {
      onStartClick()
    }
  }

  function onStartClick() {
    app.state.screen.dispatch('start')
  }

  function updateHighscore() {
    document.querySelector('.a-splash--highscore').hidden = !app.storage.hasHighscore()

    document.querySelector('.a-splash--highscoreValue').innerHTML = app.utility.number.format(
      app.storage.getHighscore()
    )
  }

  return {}
})()
