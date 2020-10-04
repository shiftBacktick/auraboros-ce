content.sfx = {}

content.sfx.bus = engine.audio.mixer.createBus()
content.sfx.bus.gain.value = engine.utility.fromDb(0)

content.sfx.attack = ({
  frequency = 440,
} = {}) => {
  const detune = engine.utility.random.float(-25, 25)

  const synth = engine.audio.synth.createSimple({
    detune,
    frequency: frequency / 4,
    type: 'triangle',
  }).shaped(
    engine.audio.shape.noise()
  ).filtered({
    detune,
  }).connect(content.sfx.bus)

  const gain = engine.utility.fromDb(-12),
    now = engine.audio.time()

  synth.filter.frequency.setValueAtTime(frequency * 2, now)
  synth.filter.frequency.exponentialRampToValueAtTime(frequency / 8, now + 1/16)

  synth.param.frequency.setValueAtTime(frequency / 2, now)
  synth.param.frequency.exponentialRampToValueAtTime(frequency / 8, now + 1/8)

  synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
  synth.param.gain.exponentialRampToValueAtTime(gain, now + 1/64)
  synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + 2)

  synth.stop(now + 1)
}

content.sfx.footstep = ({
  strength = 0,
  x = 0,
  y = 0,
} = {}) => {
  const binaural = engine.audio.binaural.create()

  const synth = engine.audio.synth.createBuffer({
    buffer: engine.audio.buffer.noise.brown(),
  }).filtered()

  const frequency = engine.utility.lerpRandom([250, 500], [1000, 2000], strength),
    gain = engine.utility.fromDb(engine.utility.lerp(-18, -15, strength)),
    now = engine.audio.time()

  binaural.from(synth.output).to(content.sfx.bus).update({
    x,
    y,
  })

  synth.filter.frequency.setValueAtTime(frequency * 2, now)
  synth.filter.frequency.exponentialRampToValueAtTime(frequency / 2, now + 1/4)

  synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
  synth.param.gain.exponentialRampToValueAtTime(gain, now + 1/32)
  synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + 1/2)

  synth.stop(now + 1)
}

content.sfx.gameOver = () => {
  console.log('content.sfx.gameOver')
}

content.sfx.start = () => {
  console.log('content.sfx.start')
}
