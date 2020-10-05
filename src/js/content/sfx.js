content.sfx = {}

content.sfx.bus = engine.audio.mixer.createBus()
content.sfx.bus.gain.value = engine.utility.fromDb(0)

content.sfx.attack = ({
  frequency = 440,
} = {}) => {
  const detune = engine.utility.random.float(-12.5, 12.5)

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
  const mixer = engine.audio.context().createGain(),
    now = engine.audio.time(),
    rootFrequency = engine.utility.midiToFrequency(33)

  mixer.gain.value = engine.utility.fromDb(-6)
  mixer.connect(content.sfx.bus)

  const boom = engine.audio.synth.createBuffer({
    buffer: engine.audio.buffer.noise.white(),
  }).filtered({
    frequency: rootFrequency,
  }).connect(mixer)

  boom.param.gain.exponentialRampToValueAtTime(4, now + 1/32)
  boom.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + 1)

  boom.stop(now + 1)

  const noise = engine.audio.synth.createAmBuffer({
    buffer: engine.audio.buffer.noise.brown(),
    carrierGain: 1,
    modDepth: engine.const.zeroGain,
    modFrequency: 1,
  }).filtered({
    frequency: engine.const.maxFrequency,
    Q: 50,
    type: 'bandpass',
  }).connect(mixer)

  noise.filter.frequency.exponentialRampToValueAtTime(engine.const.minFrequency, now + 2)

  noise.filter.Q.exponentialRampToValueAtTime(1, now + 1.25)
  noise.filter.Q.exponentialRampToValueAtTime(0.001, now + 2)

  noise.param.gain.linearRampToValueAtTime(0.5, now + 2 - 1/16)
  noise.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + 2)

  noise.param.carrierGain.linearRampToValueAtTime(4/5, now + 2)
  noise.param.mod.depth.linearRampToValueAtTime(1/5, now + 2)
  noise.param.mod.frequency.exponentialRampToValueAtTime(rootFrequency, now + 2)

  noise.stop(now + 2)

  const sub = engine.audio.synth.createFm({
    carrierDetune: -1200,
    carrierFrequency: rootFrequency,
    modDepth: rootFrequency / 4,
    modFrequency: rootFrequency / 2,
  }).connect(mixer)

  sub.param.detune.linearRampToValueAtTime(0, now + 2 - 1/16)

  sub.param.gain.exponentialRampToValueAtTime(1, now + 1/32)
  sub.param.gain.exponentialRampToValueAtTime(1/8, now + 1/2)
  sub.param.gain.linearRampToValueAtTime(0.5, now + 2 - 1/16)
  sub.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + 2)

  sub.stop(now + 2)
}

content.sfx.start = () => {
  const mixer = engine.audio.context().createGain(),
    now = engine.audio.time(),
    rootFrequency = engine.utility.midiToFrequency(33)

  mixer.gain.value = engine.utility.fromDb(-6)
  mixer.connect(content.sfx.bus)

  const boom = engine.audio.synth.createBuffer({
    buffer: engine.audio.buffer.noise.white(),
  }).filtered({
    frequency: rootFrequency,
  }).connect(mixer)

  boom.param.gain.exponentialRampToValueAtTime(4, now + 1/32)
  boom.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + 1)

  boom.stop(now + 1)

  const noise = engine.audio.synth.createAmBuffer({
    buffer: engine.audio.buffer.noise.brown(),
    carrierGain: 4/5,
    modDepth: 1/5,
    modFrequency: rootFrequency,
  }).filtered({
    frequency: engine.const.minFrequency,
    Q: 0.001,
    type: 'bandpass',
  }).connect(mixer)

  noise.filter.frequency.exponentialRampToValueAtTime(engine.const.maxFrequency, now + 2)

  noise.filter.Q.exponentialRampToValueAtTime(1, now + 1.25)
  noise.filter.Q.exponentialRampToValueAtTime(50, now + 2)

  noise.param.gain.exponentialRampToValueAtTime(1/32, now + 1/16)
  noise.param.gain.linearRampToValueAtTime(1/8, now + 1)
  noise.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + 2)

  noise.param.carrierGain.linearRampToValueAtTime(1, now + 2)
  noise.param.mod.depth.linearRampToValueAtTime(engine.const.zeroGain, now + 2)
  noise.param.mod.frequency.exponentialRampToValueAtTime(1, now + 2)

  noise.stop(now + 2)

  const sub = engine.audio.synth.createFm({
    carrierFrequency: rootFrequency,
    modDepth: rootFrequency / 4,
    modFrequency: rootFrequency / 2,
  }).connect(mixer)

  sub.param.detune.linearRampToValueAtTime(-1200, now + 2 - 1/16)

  sub.param.gain.exponentialRampToValueAtTime(1, now + 1/32)
  sub.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + 2)

  sub.stop(now + 2)
}
