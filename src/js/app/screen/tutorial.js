app.screen.tutorial = (() => {
  let root,
    start

  engine.ready(() => {
    root = document.querySelector('.a-tutorial')

    start = root.querySelector('.a-tutorial--start')
    start.addEventListener('click', onStartClick)

    app.utility.focus.trap(root)

    app.state.screen.on('enter-tutorial', onEnter)
    app.state.screen.on('exit-tutorial', onExit)
  })

  function onEnter() {
    app.utility.focus.set(root)
    engine.loop.on('frame', onFrame)
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

  return {}
})()
