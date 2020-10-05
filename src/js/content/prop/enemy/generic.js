content.prop.enemy.generic = content.prop.enemy.base.invent((parent) => ({
  name: 'enemy/generic',
  health: 1,
  points: 5,
  onConstruct: function ({
    rootFrequency = 440,
  } = {}) {
    parent.onConstruct.apply(this, arguments)

    this.rootFrequency = rootFrequency

    this.synth = engine.audio.synth.createBuffer({
      buffer: engine.audio.buffer.noise.white(),
      gain: 1/2,
    }).filtered({
      frequency: engine.utility.toSubFrequency(rootFrequency) * 2,
      type: 'bandpass',
    }).connect(this.output)

    const now = engine.audio.time()

    this.synth.filter.frequency.exponentialRampToValueAtTime(rootFrequency, now + 1)
    this.synth.filter.Q.linearRampToValueAtTime(5, now + 1)
  },
  onDestroy: function () {
    this.synth.stop()
  },
  onUpdate: function () {
    parent.onUpdate.apply(this, arguments)
  },
  killSound: function () {
    engine.audio.ramp.hold(this.synth.filter.frequency)
    engine.audio.ramp.hold(this.synth.filter.Q)
    engine.audio.ramp.hold(this.synth.param.gain)

    const duration = 2,
      now = engine.audio.time()

    this.synth.filter.frequency.exponentialRampToValueAtTime(engine.utility.toSubFrequency(this.rootFrequency) * 2, now + 1/32)
    this.synth.filter.frequency.linearRampToValueAtTime(this.rootFrequency, now + duration)

    this.synth.filter.Q.exponentialRampToValueAtTime(100, now + duration)

    this.synth.param.gain.linearRampToValueAtTime(1/8, now + 1)
    this.synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + duration)

    this.synth.stop(now + duration)

    const sub = engine.audio.synth.createSimple({
      frequency: engine.utility.toSubFrequency(this.rootFrequency),
    }).connect(this.output)

    sub.param.detune.linearRampToValueAtTime(-1200, now + duration)

    sub.param.gain.exponentialRampToValueAtTime(1/2, now + 1/32)
    sub.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + duration)

    sub.stop(now + duration)

    return engine.utility.timing.promise(duration * 1000)
  },
}))
