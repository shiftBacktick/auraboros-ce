content.prop.wormhole = engine.prop.base.invent({
  name: 'wormhole',
  damage: 0,
  health: 100,
  points: 500,
  onConstruct: function ({
    rootFrequency = 440,
  }) {
    this.activeTimer = content.const.wormholeChargeTime
    this.isActive = false
    this.rootFrequency = rootFrequency

    this.synth = engine.audio.synth.createMod({
      amodDepth: 0,
      amodFrequency: 8,
      carrierDetune: -1200,
      carrierFrequency: rootFrequency,
      carrierGain: 1,
      fmodDepth: 0,
      fmodFrequency: rootFrequency,
      gain: engine.const.zeroGain,
    }).connect(this.output)

    const now = engine.audio.time()

    this.synth.param.detune.linearRampToValueAtTime(0, now + content.const.wormholeChargeTime)
    this.synth.param.fmod.depth.linearRampToValueAtTime(this.rootFrequency / 2, now + content.const.wormholeChargeTime)
    this.synth.param.gain.linearRampToValueAtTime(0.5, now + content.const.wormholeChargeTime)

    setTimeout(() => {
      this.isActive = true
      this.score /= 2
    }, content.const.wormholeChargeTime * 1000)
  },
  onDestroy: function () {
    this.synth.stop()
  },
  onUpdate: function () {
    if (this.isDead) {
      return
    }

    const damage = (this.damage / this.health) ** 2

    engine.audio.ramp.set(this.synth.param.amod.depth, damage / 2)
    engine.audio.ramp.set(this.synth.param.carrierGain, 1 - (damage / 2))
    engine.audio.ramp.set(this.synth.param.fmod.detune, engine.utility.lerp(0, -600, damage))

    const directionalRatio = this.calculateDirectionalRatio()

    if (directionalRatio) {
      if (!this.directionalSynth) {
        this.createDirectionalSynth()
      }
      this.updateDirectionalSynth(directionalRatio)
    } else if (this.directionalSynth) {
      this.destroyDirectionalSynth()
    }
  },
  calculateGainCompensation: function (coefficient = 1) {
    const power = engine.utility.distanceToPower(
      engine.utility.clamp(this.distance, 0, content.const.horizon / 2)
    )

    return coefficient / power
  },
  calculateDirectionalRatio: function () {
    const atan2 = Math.atan2(this.relative.y, this.relative.x),
      cos = Math.cos(atan2)

    if (cos < engine.const.unit2) {
      return 0
    }

    return engine.utility.scale(cos, engine.const.unit2, 1, 0, 1) ** 100
  },
  createDirectionalSynth: function () {
    this.directionalSynth = engine.audio.synth.createSimple({
      frequency: this.rootFrequency * 4,
      type: 'triangle',
    }).filtered({
      frequency: this.rootFrequency * 2,
    }).connect(this.output)

    return this
  },
  destroyDirectionalSynth: function () {
    this.directionalSynth.stop()
    delete this.directionalSynth
    return this
  },
  hit: function () {
    if (this.isDead) {
      return
    }

    this.damage += 1

    if (this.damage >= this.health) {
      this.kill()
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
  kill: function () {
    this.isActive = false
    this.isDead = true

    engine.audio.ramp.hold(this.synth.param.amod.depth)
    engine.audio.ramp.hold(this.synth.param.carrierGain)
    engine.audio.ramp.hold(this.synth.param.detune)
    engine.audio.ramp.hold(this.synth.param.fmod.detune)
    engine.audio.ramp.hold(this.synth.param.fmod.depth)
    engine.audio.ramp.hold(this.synth.param.gain)

    const now = engine.audio.time()

    this.synth.param.amod.depth.linearRampToValueAtTime(0, now + 2)
    this.synth.param.detune.linearRampToValueAtTime(-1200, now + 2)
    this.synth.param.fmod.depth.linearRampToValueAtTime(0, now + 2)
    this.synth.param.fmod.detune.linearRampToValueAtTime(-600, now + 2)
    this.synth.param.gain.exponentialRampToValueAtTime(1/4, now + 1/32)

    const synth = engine.audio.synth.createAmBuffer({
      buffer: engine.audio.buffer.noise.pink(),
      carrierGain: 0.5,
      modDepth: 0.5,
    }).filtered().connect(this.output)

    synth.filter.frequency.setValueAtTime(80, now)
    synth.filter.frequency.exponentialRampToValueAtTime(800, now + 2)

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(1, now + 1/32)
    synth.param.gain.linearRampToValueAtTime(1/64, now + 2)

    synth.param.mod.frequency.setValueAtTime(27.5, now)
    synth.param.mod.frequency.exponentialRampToValueAtTime(3.4375, now + 2)

    synth.stop(now + 2)

    engine.utility.timing.promise(2 * 1000).then(() => content.system.wormholes.kill(this))

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
  updateDirectionalSynth: function (strength = 0) {
    const gain = strength * this.calculateGainCompensation(engine.utility.fromDb(-21))
    engine.audio.ramp.set(this.directionalSynth.param.gain, gain)
    return this
  },
})
