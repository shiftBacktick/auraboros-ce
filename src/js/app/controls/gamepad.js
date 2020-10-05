app.controls.gamepad = {
  game: function () {
    const state = {}

    let rotate = 0,
      x = 0,
      y = 0

    if (engine.input.gamepad.hasAxis(0, 1, 2)) {
      rotate = engine.input.gamepad.getAxis(2, true)
      x = engine.input.gamepad.getAxis(0)
      y = engine.input.gamepad.getAxis(1, true)
    } else if (engine.input.gamepad.hasAxis(0, 1)) {
      rotate = engine.input.gamepad.getAxis(0, true)
      y = engine.input.gamepad.getAxis(1, true)
    }

    if (engine.input.gamepad.isDigital(12)) {
      y = 1
    }

    if (engine.input.gamepad.isDigital(13)) {
      y = -1
    }

    if (engine.input.gamepad.isDigital(14)) {
      rotate = 1
    }

    if (engine.input.gamepad.isDigital(15)) {
      rotate = -1
    }

    if (engine.input.gamepad.isDigital(6) || engine.input.gamepad.isDigital(7)) {
      state.attack = true
    }

    if (rotate) {
      state.rotate = engine.utility.clamp(rotate, -1, 1)
    }

    if (x) {
      state.x = engine.utility.clamp(x, -1, 1)
    }

    if (y) {
      state.y = engine.utility.clamp(y, -1, 1)
    }

    return state
  },
  ui: function () {
    const state = {}

    if (engine.input.gamepad.isDigital(0) || engine.input.gamepad.isDigital(8) || engine.input.gamepad.isDigital(9)) {
      state.confirm = true
    }

    return state
  },
}
