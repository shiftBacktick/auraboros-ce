content.system.attack = (() => {
  const projectiles = new Set()

  const frequencies = [
    72,
    71,
    69,
    64,
  ].map(engine.utility.midiToFrequency)

  let cooldown = 0

  function attack() {
    const velocity = engine.utility.vector3d.create({
      x: content.const.projectileSpeed,
    }).rotateQuaternion(
      engine.position.getQuaternion()
    )

    content.sfx.attack({
      frequency: engine.utility.choose(frequencies, Math.random()),
    })

    projectiles.add(
      content.system.attack.projectile.create({
        time: content.const.projectileTimeout,
        vector: engine.position.getVector(),
        velocity,
      })
    )
  }

  return {
    getProjectiles: () => [...projectiles],
    reset: function () {
      projectiles.clear()
      return this
    },
    trigger: function () {
      const now = performance.now()

      if (now > cooldown) {
        attack()
        cooldown = now + content.const.projectileFireRate
      }

      return this
    },
    update: function () {
      const enemies = engine.utility.quadtree.create(),
        wormholes = engine.utility.quadtree.create()

      for (const prop of engine.props.get()) {
        if (content.prop.enemy.base.isPrototypeOf(prop) && !prop.isDead) {
          enemies.insert(prop)
        } else if (content.prop.wormhole.isPrototypeOf(prop) && !prop.isDead) {
          wormholes.insert(prop)
        }
      }

      for (const projectile of projectiles) {
        projectile.update()

        if (projectile.time <= 0) {
          projectiles.delete(projectile)
          continue
        }

        const wormhole = wormholes.find(projectile, content.const.wormholeRadius)

        if (wormhole) {
          wormhole.hit()
          projectiles.delete(projectile)
          continue
        }

        const enemy = enemies.find(projectile, content.const.enemyRadius)

        if (enemy) {
          enemy.hit()
          projectiles.delete(projectile)
        }
      }

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.system.attack.update()
})

engine.state.on('reset', () => content.system.footsteps.reset())
