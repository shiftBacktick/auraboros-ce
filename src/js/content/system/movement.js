content.system.movement = (() => {
  const angularAcceleration = Math.PI * 2,
    angularDeceleration = engine.const.gravity,
    angularMaxVelocity = Math.PI,
    lateralAcceleration = engine.const.gravity,
    lateralDeceleration = engine.const.gravity,
    lateralMaxVelocity = 4

  let angularThrust = 0,
    lateralThrust = engine.utility.vector3d.create()

  function applyAngularThrust() {
    const {yaw} = engine.position.getAngularVelocityEuler()

    if (!angularThrust) {
      return engine.position.setAngularVelocityEuler({
        yaw: content.utility.accelerate.value(
          yaw,
          0,
          angularDeceleration
        ),
      })
    }

    engine.position.setAngularVelocityEuler({
      yaw: content.utility.accelerate.value(
        yaw,
        angularThrust * angularMaxVelocity,
        angularAcceleration
      ),
    })
  }

  function applyLateralThrust() {
    if (lateralThrust.isZero()) {
      return engine.position.setVelocity(
        content.utility.accelerate.vector(
          engine.position.getVelocity(),
          engine.utility.vector3d.create(),
          lateralDeceleration
        )
      )
    }

    const currentVelocity = engine.position.getVelocity(),
      targetVelocity = lateralThrust.scale(lateralMaxVelocity).rotateQuaternion(engine.position.getQuaternion())

    const rate = currentVelocity.distance() <= targetVelocity.distance()
      ? lateralAcceleration
      : lateralDeceleration

    engine.position.setVelocity(
      content.utility.accelerate.vector(
        currentVelocity,
        targetVelocity,
        rate
      )
    )
  }

  function updateThrust(controls) {
    const distance = engine.utility.distance(controls)

    controls = {...controls}

    if (distance > 1) {
      controls.x /= distance
      controls.y /= distance
      controls.z /= distance
    }

    angularThrust = controls.rotate

    lateralThrust.set({
      // XXX: Rotated 270 degrees
      x: controls.y,
      y: -controls.x,
    })
  }

  return {
    getLateralThrust: () => lateralThrust.clone(),
    getLateralVelocityRatio: () => engine.utility.clamp(engine.position.getVelocity().distance() / lateralMaxVelocity, 0, 1),
    reset: function () {
      angularThrust = 0
      lateralThrust.set({x: 0, y: 0, z: 0})
      return this
    },
    update: function (controls = {}) {
      // TODO: Apply acceleration and turning to player
      updateThrust(controls)

      applyAngularThrust()
      applyLateralThrust()

      return this
    },
  }
})()

engine.state.on('reset', () => content.system.movement.reset())
