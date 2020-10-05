content.system.footsteps = (() => {
  const lastStep = engine.utility.vector3d.create(),
    strideLength = 1

  let isLeft

  function trigger(distance) {
    const lateralThrust = content.system.movement.getLateralThrust().normalize(),
      velocityRatio = content.system.movement.getLateralVelocityRatio()

    const position = engine.utility.vector3d.create({
      x: strideLength / 2,
      y: (isLeft ? 1 : -1) * (engine.const.positionRadius * 0.75),
      z: -2,
    }).rotateEuler({
      yaw: Math.atan2(-lateralThrust.y, -lateralThrust.x),
    })

    content.sfx.footstep({
      strength: engine.utility.clamp(distance / strideLength * velocityRatio, 0, 1),
      ...position,
    })

    isLeft = !isLeft
  }

  return {
    reset: function () {
      isLeft = Boolean(Math.round(Math.random()))
      lastStep.set()
      return this
    },
    update: function () {
      const vector = engine.position.getVector(),
        velocity = engine.position.getVelocity()

      const distance = lastStep.distance(vector)

      if ((distance >= strideLength) || (distance && velocity.isZero())) {
        lastStep.set(vector)
        trigger(distance)
      }

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.system.footsteps.update()
})

engine.state.on('reset', () => content.system.footsteps.reset())
