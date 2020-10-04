content.system.enemies = (() => {
  const enemies = new Set(),
    pubsub = engine.utility.pubsub.create()

  let cooldown = 0

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

    const wormhole = engine.utility.choose(wormholes, Math.random())

    enemies.add(
      engine.props.create(content.prop.enemy.generic, {
        radius: content.const.enemyRadius,
        x: wormhole.x + (wormhole.radius * engine.const.unit2 * engine.utility.random.float(-1, 1)),
        y: wormhole.y + (wormhole.radius * engine.const.unit2 * engine.utility.random.float(-1, 1)),
      })
    )

    wormhole.onSpawn()
  }

  return engine.utility.pubsub.decorate({
    kill: function (prop) {
      engine.props.destroy(prop)
      enemies.delete(prop)

      resetCooldown()

      pubsub.emit('kill', prop)

      return this
    },
    reset: function () {
      enemies.clear()
      return this
    },
    update: function () {
      if (enemies.size >= content.const.enemyLimit) {
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
