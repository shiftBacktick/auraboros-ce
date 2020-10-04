content.system.audio.wormholeAlert = (() => {
  const bus = engine.audio.mixer.createBus()
  const binaural = engine.audio.binaural.create().to(bus)

  bus.gain.value = engine.utility.fromDb(-12)

  function trigger(wormhole) {
    const synth = engine.audio.synth.createMod({
      amodDepth: 0.5,
      amodFrequency: 6,
      amodType: 'square',
      carrierGain: 0.5,
      carrierFrequency: wormhole.rootFrequency * 4,
      carrierType: 'triangle',
      fmodDepth: wormhole.rootFrequency,
      fmodDetune: 600,
      fmodFrequency: wormhole.rootFrequency * 2,
      fmodType: 'triangle',
    })

    binaural.from(synth).update(
      wormhole.relative.normalize()
    )

    const duration = 3/6,
      now = engine.audio.time()

    synth.param.gain.exponentialRampToValueAtTime(1, now + engine.const.zeroTime)
    synth.param.gain.setValueAtTime(1, now + duration - engine.const.zeroTime)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + duration)
    synth.stop(now + duration)
  }

  return {
    trigger: function (wormhole) {
      trigger(wormhole)
      return this
    },
  }
})()

engine.ready(() => {
  content.system.wormholes.on('spawn', (wormhole) => content.system.audio.wormholeAlert.trigger(wormhole))
})
