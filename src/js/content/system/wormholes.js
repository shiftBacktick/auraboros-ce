content.system.wormholes = (() => {
  const pubsub = engine.utility.pubsub.create(),
    wormholes = new Set()

  const frequencies = [38, 45, 47, 48].map(engine.utility.midiToFrequency)

  let cooldown = 0,
    limit = 0

  function isCooldown() {
    return performance.now() >= cooldown
  }

  function resetCooldown() {
    cooldown = performance.now() + content.const.wormholeSpawnRate
  }

  function setup() {
    wormholes.add(
      engine.props.create(content.prop.wormhole, {
        radius: content.const.wormholeRadius,
        rootFrequency: frequencies[0],
        x: content.const.horizon / 2,
        y: 0,
      })
    )

    resetCooldown()
  }

  function spawn() {
    const angle = engine.utility.random.float(0, 2 * Math.PI),
      radius = content.const.horizon / 2

    const wormhole = engine.props.create(content.prop.wormhole, {
      radius: content.const.wormholeRadius,
      rootFrequency: frequencies[wormholes.size],
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    })

    wormholes.add(wormhole)
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
      engine.props.destroy(wormhole)
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
      limit = content.const.wormholeLimitMin
      wormholes.clear()
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
