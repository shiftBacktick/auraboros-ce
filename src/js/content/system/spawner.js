content.system.spawner = (() => {
  const enemies = new Set(),
    wormholes = new Set(),
    pubsub = engine.utility.pubsub.create()

  const locations = [
    {
      radius: content.const.wormholeRadius,
      rootFrequency: engine.utility.midiToFrequency(45),
      x: content.const.horizon / 2,
      y: 0,
    },
    {
      radius: content.const.wormholeRadius,
      rootFrequency: engine.utility.midiToFrequency(47),
      x: 0,
      y: content.const.horizon / 2,
    },
    {
      radius: content.const.wormholeRadius,
      rootFrequency: engine.utility.midiToFrequency(48),
      x: -content.const.horizon / 2,
      y: 0,
    },
    {
      radius: content.const.wormholeRadius,
      rootFrequency: engine.utility.midiToFrequency(38),
      x: 0,
      y: -content.const.horizon / 2,
    },
  ]

  let cooldown = 0

  function setup() {
    for (const options of locations) {
      wormholes.add(
        engine.props.create(content.prop.wormhole, options)
      )
    }
  }

  function spawn() {
    const activeObelisks = [...wormholes].filter((wormhole) => {
      return wormhole.isActive && wormhole.distance >= (content.const.horizon / 4) - wormhole.radius
    })

    if (!activeObelisks.length) {
      return
    }

    const wormhole = engine.utility.choose(activeObelisks, Math.random())

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
    import: function () {
      setup()
      return this
    },
    kill: function (prop) {
      enemies.delete(prop)
      pubsub.emit('kill', prop)
      return this
    },
    reset: function () {
      enemies.clear()
      wormholes.clear()
      return this
    },
    update: function () {
      const now = performance.now()

      if (now > cooldown && enemies.size < content.const.enemyLimit) {
        spawn()
        cooldown = now + content.const.enemySpawnRate
      }

      return this
    },
  }, pubsub)
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.system.spawner.update()
})

engine.state.on('import', () => content.system.spawner.import())
engine.state.on('reset', () => content.system.spawner.reset())
