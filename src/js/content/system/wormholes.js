content.system.wormholes = (() => {
  const activeFrequencies = new Set(),
    pubsub = engine.utility.pubsub.create(),
    wormholes = new Set()

  const allowedFrequencies = [45, 47, 48, 50].map(engine.utility.midiToFrequency)

  let cooldown = 0,
    limit = 0

  function getUnusedFrequency() {
    const frequencies = allowedFrequencies.filter((f) => !activeFrequencies.has(f))
    return engine.utility.choose(frequencies, Math.random())
  }

  function isCooldown() {
    return performance.now() >= cooldown
  }

  function resetCooldown() {
    cooldown = performance.now() + content.const.wormholeSpawnRate
  }

  function setup() {
    const frequency = allowedFrequencies[0]

    wormholes.add(
      engine.props.create(content.prop.wormhole, {
        radius: content.const.wormholeRadius,
        rootFrequency: frequency,
        x: content.const.horizon / 2,
        y: 0,
      })
    )

    activeFrequencies.add(frequency)
    resetCooldown()
  }

  function spawn() {
    const angle = engine.utility.random.float(0, 2 * Math.PI),
      frequency = getUnusedFrequency(),
      radius = content.const.horizon / 2

    const wormhole = engine.props.create(content.prop.wormhole, {
      radius: content.const.wormholeRadius,
      rootFrequency: frequency,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    })

    wormholes.add(wormhole)
    activeFrequencies.add(frequency)

    pubsub.emit('spawn', wormhole)

    resetCooldown()
  }

  return engine.utility.pubsub.decorate({
    get: () => [...wormholes],
    import: function () {
      setup()
      return this
    },
    kill: function (wormhole) {
      wormhole.onKill().then(() => engine.props.destroy(wormhole))

      activeFrequencies.delete(wormhole.rootFrequency)
      wormholes.delete(wormhole)
      resetCooldown()

      if (limit < content.const.wormholeLimitMax) {
        limit += 1
      }

      pubsub.emit('kill', wormhole)

      return this
    },
    limit: () => limit,
    reset: function () {
      activeFrequencies.clear()
      wormholes.clear()

      limit = content.const.wormholeLimitMin

      return this
    },
    update: function () {
      if (wormholes.size >= limit) {
        return this
      }

      if (!isCooldown()) {
        return this
      }

      spawn()

      return this
    },
  }, pubsub)
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.system.wormholes.update()
})

engine.state.on('import', () => content.system.wormholes.import())
engine.state.on('reset', () => content.system.wormholes.reset())
