content.system.enemies = (() => {
  const activeFrequencies = new Set(),
    enemies = new Set(),
    pubsub = engine.utility.pubsub.create()

  const allowedFrequencies = [
    57, 59, 60, 62, 64, 65, 67,
    69, 71, 72, 74, 76, 77, 79,
    81, 83, 84, 86, 88, 89, 91,
  ].map(engine.utility.midiToFrequency)

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
    cooldown = performance.now() + content.const.enemySpawnRate
  }

  function spawn() {
    const wormholes = content.system.wormholes.get().filter((wormhole) => {
      return wormhole.isActive && !wormhole.isDead
    })

    if (!wormholes.length) {
      return resetCooldown()
    }

    const frequency = getUnusedFrequency(),
      wormhole = engine.utility.choose(wormholes, Math.random())

    activeFrequencies.add(frequency)

    enemies.add(
      engine.props.create(content.prop.enemy.generic, {
        radius: content.const.enemyRadius,
        rootFrequency: frequency,
        x: wormhole.x + (wormhole.radius * engine.const.unit2 * engine.utility.random.float(-1, 1)),
        y: wormhole.y + (wormhole.radius * engine.const.unit2 * engine.utility.random.float(-1, 1)),
      })
    )

    wormhole.onSpawn()
  }

  return engine.utility.pubsub.decorate({
    get: () => [...enemies],
    kill: function (enemy) {
      enemy.onKill().then(() => engine.props.destroy(enemy))

      activeFrequencies.delete(enemy.rootFrequency)
      enemies.delete(enemy)
      resetCooldown()

      if (limit < content.const.enemyLimitMax) {
        limit += 1
      }

      pubsub.emit('kill', enemy)

      return this
    },
    limit: () => limit,
    reset: function () {
      activeFrequencies.clear()
      enemies.clear()

      limit = content.const.enemyLimitMin

      return this
    },
    update: function () {
      if (enemies.size >= limit) {
        return this
      }

      if (!isCooldown()) {
        return this
      }

      spawn()
      resetCooldown()

      return this
    },
  }, pubsub)
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.system.enemies.update()
})

engine.state.on('reset', () => content.system.enemies.reset())
