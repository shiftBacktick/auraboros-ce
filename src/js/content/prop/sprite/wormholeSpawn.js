content.prop.sprite.wormholeSpawn = content.prop.sprite.base.invent({
  name: 'sprite/wormholeSpawn',
  play: function ({
    rootFrequency = 440,
  } = {}) {
    return Promise.all([
      this.playAlert(rootFrequency),
      this.playSub(rootFrequency),
    ])
  },
  playAlert: function (rootFrequency) {
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
  playSub: function (rootFrequency) {
    const duration = 2,
      now = engine.audio.time()

    const sub = engine.audio.synth.createFm({
      carrierDetune: -1200,
      carrierFrequency: rootFrequency,
      modDepth: rootFrequency / 4,
      modFrequency: rootFrequency / 2,
    }).connect(this.output)

    sub.param.detune.linearRampToValueAtTime(0, now + 2 - 1/16)

    sub.param.gain.exponentialRampToValueAtTime(1/8, now + 1/32)
    sub.param.gain.exponentialRampToValueAtTime(1/128, now + 1/2)
    sub.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    return engine.utility.timing.promise(duration * 1000)
  },
})

engine.ready(() => {
  content.system.wormholes.on('spawn', (wormhole) => {
    content.prop.sprite.wormholeSpawn.trigger({
      x: wormhole.x,
      y: wormhole.y,
    }, {
      rootFrequency: wormhole.rootFrequency,
    })
  })
})
