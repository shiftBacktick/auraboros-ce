content.prop.wormhole = engine.prop.base.invent({
  name: 'wormhole',
  damage: 0,
  health: 100,
  points: 100,
  onConstruct: function ({
    rootFrequency = 440,
  }) {
    this.isActive = true
    this.rootFrequency = rootFrequency

    this.synth = engine.audio.synth.createMod({
      amodDepth: 0,
      amodFrequency: 8,
      carrierFrequency: rootFrequency,
      carrierGain: 1,
      fmodDepth: rootFrequency / 2,
      fmodFrequency: rootFrequency,
      gain: 0.5,
    }).connect(this.output)
  },
  onDestroy: function () {
    this.synth.stop()
  },
  onUpdate: function () {
    if (!this.isActive) {
      return
    }

    const damage = (this.damage / this.health) ** 2

    engine.audio.ramp.set(this.synth.param.amod.depth, damage / 2)
    engine.audio.ramp.set(this.synth.param.carrierGain, 1 - (damage / 2))
    engine.audio.ramp.set(this.synth.param.fmod.detune, engine.utility.lerp(0, -600, damage))
  },
  deactivate: function () {
    this.isActive = false
    content.system.score.increment(this.points)

    engine.audio.ramp.hold(this.synth.param.amod.depth)
    engine.audio.ramp.hold(this.synth.param.carrierGain)
    engine.audio.ramp.hold(this.synth.param.detune)
    engine.audio.ramp.hold(this.synth.param.fmod.detune)
    engine.audio.ramp.hold(this.synth.param.fmod.depth)
    engine.audio.ramp.hold(this.synth.param.gain)

    const now = engine.audio.time()

    this.synth.param.amod.depth.linearRampToValueAtTime(0, now + 2)
    this.synth.param.carrierGain.linearRampToValueAtTime(1, now + 2)

    this.synth.param.detune.linearRampToValueAtTime(-1200, now + 2)
    this.synth.param.detune.linearRampToValueAtTime(0, now + content.const.wormholeRecharge)

    this.synth.param.fmod.depth.linearRampToValueAtTime(0, now + 2)
    this.synth.param.fmod.depth.linearRampToValueAtTime(this.rootFrequency / 2, now + content.const.wormholeRecharge)

    this.synth.param.fmod.detune.linearRampToValueAtTime(-600, now + 2)
    this.synth.param.fmod.detune.linearRampToValueAtTime(0, now + content.const.wormholeRecharge)

    this.synth.param.fmod.detune.linearRampToValueAtTime(1/256, now + 2)
    this.synth.param.fmod.detune.linearRampToValueAtTime(0.5, now + content.const.wormholeRecharge)

    const synth = engine.audio.synth.createAmBuffer({
      buffer: engine.audio.buffer.noise.pink(),
      carrierGain: 0.5,
      modDepth: 0.5,
    }).filtered().connect(this.output)

    synth.filter.frequency.setValueAtTime(80, now)
    synth.filter.frequency.exponentialRampToValueAtTime(800, now + 2)

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(1, now + 1/32)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + 2)

    synth.param.mod.frequency.setValueAtTime(27.5, now)
    synth.param.mod.frequency.exponentialRampToValueAtTime(3.4375, now + 2)

    synth.stop(now + 2)

    setTimeout(() => {
      this.damage = 0
      this.isActive = true
    }, content.const.wormholeRecharge * 1000)

    return this
  },
  hit: function () {
    if (!this.isActive) {
      return
    }

    this.damage += 1

    if (this.damage >= this.health) {
      this.deactivate()
    } else {
      this.hitSound()
    }

    return this
  },
  hitSound: function () {
    const frequency = engine.utility.midiToFrequency(
      engine.utility.choose([
        64, 69, 71, 72,
      ], Math.random())
    )

    const synth = engine.audio.synth.createSimple({
      detune: engine.utility.random.float(-25, 25),
      frequency,
      type: 'square',
    }).filtered({
      frequency,
    }).connect(this.output)

    const now = engine.audio.time()

    synth.param.detune.setValueAtTime(0, now)
    synth.param.detune.linearRampToValueAtTime(1200, now + 1/16)

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(0.5, now + 1/32)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + 1)

    synth.stop(now + 1)

    return this
  },
  onSpawn: function () {
    engine.audio.ramp.hold(this.synth.param.detune)
    engine.audio.ramp.hold(this.synth.param.fmod.depth)

    const now = engine.audio.time()

    this.synth.param.detune.linearRampToValueAtTime(1200, now + 1/16)
    this.synth.param.detune.linearRampToValueAtTime(0, now + 1)

    this.synth.param.fmod.depth.exponentialRampToValueAtTime(this.rootFrequency, now + 1/16)
    this.synth.param.fmod.depth.exponentialRampToValueAtTime(this.rootFrequency / 2, now + 1)

    return this
  },
})
