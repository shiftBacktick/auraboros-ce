content.prop.enemy.generic = content.prop.enemy.base.invent({
  name: 'enemy/generic',
  health: 1,
  points: 1,
  call: function () {
    return engine.utility.timing.promise(0)
  },
  createSynth: function () {
    this.synth = engine.audio.synth.createSimple({
      detune: engine.utility.random.float(-50, 50),
      frequency: engine.utility.random.float(200, 400),
      gain: 1/32,
      type: 'sawtooth',
    }).connect(this.output)
  },
  destroySynth: function () {
    this.synth.stop()
  },
  killSound: function () {
    engine.audio.ramp.exponential(this.synth.param.gain, engine.const.zeroGain, 1)
    this.synth.stop(engine.audio.time() + 1)

    return engine.utility.timing.promise(1000)
  },
})
