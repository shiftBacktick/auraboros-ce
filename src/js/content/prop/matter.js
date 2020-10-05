content.prop.matter = engine.prop.base.invent({
  name: 'matter',
  onConstruct: function () {
    const buffer = engine.utility.choose([
      engine.audio.buffer.noise.brown,
      engine.audio.buffer.noise.pink,
      engine.audio.buffer.noise.white,
    ], Math.random())()

    const frequency = engine.utility.midiToFrequency(engine.utility.choose([
      112,
      117,
      119,
      120,
    ], Math.random()))

    this.synth = engine.audio.synth.createBuffer({
      buffer,
      gain: engine.utility.fromDb(-15),
    }).filtered({
      frequency: frequency * 1.25,
      Q: 50,
      type: 'bandpass',
    }).connect(this.output)

    this.synth.chainStop(
      engine.audio.synth.createLfo({
        depth: frequency / 4,
        frequency: 1/2,
      }).connect(this.synth.filter.frequency)
    )
  },
  onDestroy: function () {
    this.synth.stop()
  },
  onUpdate: function () {
    const vector = this.vector()
    const distance = vector.distance()

    if (!engine.utility.round(distance, 1)) {
      return engine.props.destroy(this)
    }

    const scoreRatio = content.system.score.getRatio(),
      velocity = engine.utility.lerpExp(2, 8, scoreRatio, 1/2)

    this.velocity = vector.inverse().scale(velocity / distance)
  },
})

engine.ready(() => {
  content.system.enemies.on('kill', (enemy) => {
    engine.props.create(content.prop.matter, {
      x: enemy.x,
      y: enemy.y,
    })
  })

  content.system.wormholes.on('kill', (wormhole) => {
    engine.props.create(content.prop.matter, {
      x: wormhole.x,
      y: wormhole.y,
    })
  })
})
