app.controls.keyboard = {
  game: () => {
    const keys = engine.input.keyboard.get(),
      state = {}

    const moveBackward = keys.ArrowDown || keys.KeyS || keys.Numpad5,
      moveForward = keys.ArrowUp || keys.KeyW || keys.Numpad8,
      strafeLeft = keys.KeyA || keys.KeyZ || keys.Numpad4,
      strafeRight = keys.KeyD || keys.KeyX || keys.Numpad6,
      turnLeft = keys.ArrowLeft || keys.KeyQ || keys.Numpad7,
      turnRight = keys.ArrowRight || keys.KeyE || keys.Numpad9

    if (keys.ControlLeft || keys.ControlRight || keys.Numpad0 || keys.Space) {
      state.attack = true
    }

    if (moveBackward && !moveForward) {
      state.y = -1
    } else if (moveForward && !moveBackward) {
      state.y = 1
    }

    if (strafeLeft && !strafeRight) {
      state.x = -1
    } else if (strafeRight && !strafeLeft) {
      state.x = 1
    }

    if (turnLeft && !turnRight) {
      state.rotate = 1
    } else if (turnRight && !turnLeft) {
      state.rotate = -1
    }

    return state
  },
  ui: () => {
    const keys = engine.input.keyboard.get(),
      state = {}

    if (keys.Enter || keys.NumpadEnter) {
      state.confirm = true
    }

    if (keys.Space) {
      state.space = true
    }

    return state
  },
}
