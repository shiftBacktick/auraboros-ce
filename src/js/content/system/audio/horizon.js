content.system.audio.horizon = (() => {
  const bus = engine.audio.mixer.createBus(),
    context = engine.audio.context(),
    merger = context.createChannelMerger(),
    mixer = context.createGain()

  engine.audio.synth.createBuffer({
    buffer: engine.audio.buffer.noise.pink(),
    gain: 0.5,
  }).connect(merger, 0, 0)

  engine.audio.synth.createBuffer({
    buffer: engine.audio.buffer.noise.pink(),
    gain: 0.5,
  }).connect(merger, 0, 1)

  bus.gain.value = engine.utility.fromDb(-9)
  mixer.gain.value = engine.const.zeroGain

  merger.connect(mixer)
  mixer.connect(bus)

  return {
    reset: function () {
      engine.audio.ramp.set(mixer.gain, engine.const.zeroGain)
      return this
    },
    update: function () {
      const distance = engine.position.getVector().distance(),
        distanceRatio = engine.utility.clamp(distance / content.const.horizon, 0, 1),
        gain = engine.utility.lerpExp(engine.const.zeroGain, 1, distanceRatio, 10)

      engine.audio.ramp.set(mixer.gain, gain)

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.system.audio.horizon.update()
})

engine.state.on('reset', () => content.system.audio.horizon.reset())
