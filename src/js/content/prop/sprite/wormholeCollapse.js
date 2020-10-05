content.prop.sprite.wormholeCollapse = content.prop.sprite.base.invent({
  name: 'sprite/wormholeCollapse',
  play: function ({
    rootFrequency = 440,
  } = {}) {
    const duration = 2,
      gain = engine.utility.fromDb(-6),
      now = engine.audio.time()

    const explosion = engine.audio.synth.createAmBuffer({
      buffer: engine.audio.buffer.noise.pink(),
      carrierGain: 0.5,
      modDepth: 0.5,
    }).filtered().connect(this.output)

    explosion.filter.frequency.setValueAtTime(80, now)
    explosion.filter.frequency.exponentialRampToValueAtTime(800, now + duration)

    explosion.param.gain.setValueAtTime(engine.const.zeroGain, now)
    explosion.param.gain.exponentialRampToValueAtTime(gain, now + 1/32)
    explosion.param.gain.linearRampToValueAtTime(gain/64, now + duration - engine.const.zeroTime)
    explosion.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    explosion.param.mod.frequency.setValueAtTime(27.5, now)
    explosion.param.mod.frequency.exponentialRampToValueAtTime(3.4375, now + duration)

    explosion.stop(now + duration)

    const sub = engine.audio.synth.createSimple({
      frequency: engine.utility.toSubFrequency(rootFrequency),
    }).connect(this.output)

    sub.param.detune.setValueAtTime(0, now)
    sub.param.detune.linearRampToValueAtTime(-1200, now + duration)

    sub.param.gain.setValueAtTime(engine.const.zeroGain, now)
    sub.param.gain.exponentialRampToValueAtTime(gain/4, now + 1/32)
    sub.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    return engine.utility.timing.promise(duration * 1000)
  },
})

engine.ready(() => {
  content.system.wormholes.on('kill', (wormhole) => {
    content.prop.sprite.wormholeCollapse.trigger({
      x: wormhole.x,
      y: wormhole.y,
    }, {
      rootFrequency: wormhole.rootFrequency,
    })
  })
})
