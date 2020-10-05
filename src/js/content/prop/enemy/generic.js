content.prop.enemy.generic = content.prop.enemy.base.invent((parent) => ({
  name: 'enemy/generic',
  health: 1,
  points: 5,
  onConstruct: function () {
    parent.onConstruct.apply(this, arguments)
    this.createSynth()
  },
  onDestroy: function () {
    this.destroySynth()
  },
  onUpdate: function () {
    parent.onUpdate.apply(this, arguments)
    // TODO: Update synth
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
}))
