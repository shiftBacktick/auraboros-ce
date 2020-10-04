content.system.audio.arena = (() => {
  const bus = engine.audio.mixer.createBus(),
    gain = engine.utility.fromDb(-12)

  const boundary = engine.audio.synth.createBuffer({
    buffer: engine.audio.buffer.noise.brown(),
  })

  const binaural = engine.audio.binaural.create().from(boundary.output).to(bus)

  const singularity = engine.audio.synth.createAm({
    carrierGain: 2/3,
    carrierFrequency: 22.5,
    carrierType: 'square',
    modDepth: 1/3,
    modFrequency: 2,
  }).shaped(
    engine.audio.shape.noise()
  ).filtered({
    frequency: 110,
  }).connect(bus)

  bus.gain.value = engine.const.zeroGain

  function getBinauralVector() {
    // XXX: This feels like a hack
    // TODO: Are there more elegant ways with quaternions?
    const positionEuler = engine.position.getEuler()
    const vectorEuler = engine.position.getVector().euler()

    const result = engine.utility.vector3d.unitX().rotateEuler({
      yaw: positionEuler.yaw - vectorEuler.yaw,
    })

    result.y *= -1

    return result
  }

  return {
    blur: function () {
      engine.audio.ramp.linear(bus.gain, engine.const.zeroGain, 1)
      return this
    },
    unblur: function () {
      engine.audio.ramp.linear(bus.gain, gain, 1)
      return this
    },
    update: function () {
      const distance = engine.position.getVector().distance(),
        score = content.system.score.get(),
        scoreRatio = engine.utility.clamp(score / content.const.idealScore, 0, 1)

      const boundaryDistanceRatio = engine.utility.clamp(distance / content.const.horizon, 0, 1),
        singularityDistanceRatio = engine.utility.clamp(distance / (content.const.horizon / 2), 0, 1)

      const boundaryGain = engine.utility.lerpExp(engine.const.zeroGain, 0.25, boundaryDistanceRatio, content.const.horizon / 3),
        singularityGain = engine.utility.lerpExp(1, engine.const.zeroGain, singularityDistanceRatio, 1/4),
        singularityModFrequency = engine.utility.lerp(2, 20, scoreRatio)

      binaural.update(
        getBinauralVector()
      )

      engine.audio.ramp.set(boundary.param.gain, boundaryGain)
      engine.audio.ramp.set(singularity.param.gain, singularityGain)
      engine.audio.ramp.set(singularity.param.mod.frequency, singularityModFrequency)

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.system.audio.arena.update()
})

engine.loop.on('pause', () => content.system.audio.arena.blur())
engine.loop.on('resume', () => content.system.audio.arena.unblur())
