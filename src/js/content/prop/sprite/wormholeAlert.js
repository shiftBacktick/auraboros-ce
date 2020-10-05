content.prop.sprite.wormholeAlert = content.prop.sprite.base.invent({
  name: 'sprite/wormholeAlert',
  play: function ({
    rootFrequency = 440,
  } = {}) {
    const duration = 3/6,
      gain = engine.utility.fromDb(-15)

    const synth = engine.audio.synth.createMod({
      amodDepth: 0.5,
      amodFrequency: 6,
      amodType: 'square',
      carrierGain: 0.5,
      carrierFrequency: rootFrequency * 4,
      carrierType: 'triangle',
      fmodDepth: rootFrequency,
      fmodDetune: 600,
      fmodFrequency: rootFrequency * 2,
      fmodType: 'triangle',
      gain,
    }).connect(this.output)

    const now = engine.audio.time()

    synth.param.gain.setValueAtTime(gain, now + duration - engine.const.zeroTime)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + duration)

    synth.stop(now + duration)

    return engine.utility.timing.promise(duration * 1000)
  },
})

engine.ready(() => {
  content.system.wormholes.on('spawn', (wormhole) => {
    content.prop.sprite.wormholeAlert.trigger({
      x: wormhole.x,
      y: wormhole.y,
    }, {
      rootFrequency: wormhole.rootFrequency,
    })
  })
})
