content.prop.enemy.base = engine.prop.base.invent({
  name: 'enemy/base',
  damage: 0,
  health: 0,
  points: 0,
  onConstruct: function () {
    this.createSynth()
    this.velocity = this.getSpawnVelocity()
  },
  onDestroy: function () {
    this.destroySynth()
  },
  onUpdate: function () {
    if (this.isDead) {
      return
    }

    this.handlePeriodic({
      delay: () => 0,
      key: 'call',
      trigger: () => this.call(),
    })

    const shouldReact = Math.random() < content.const.enemyReaction

    if (!shouldReact) {
      return
    }

    this.velocity = content.utility.accelerate.vector(this.velocity, this.getTargetVelocity(), content.const.enemyAcceleration)
  },
  call: function () {
    return engine.utility.timing.promise(0)
  },
  createSynth: function () {},
  destroySynth: function () {},
  getSpawnVelocity: function () {
    const velocity = this.getTargetVelocity().inverse().rotateEuler({
      yaw: engine.utility.random.float(-1, 1) * Math.PI / 2,
    })

    velocity.z = 0

    return velocity
  },
  getTargetVelocity: function () {
    const velocity = engine.position.getVector()
      .subtract(this.vector())
      .normalize()
      .scale(content.const.enemySpeed)

    velocity.z = 0

    return velocity
  },
  hit: function () {
    this.damage += 1

    if (this.damage >= this.health) {
      content.system.enemies.kill(this)
    } else {
      this.hitSound()
    }

    return this
  },
  hitSound: function () {},
  killSound: function () {
    return engine.utility.timing.promise(0)
  },
  onKill: function () {
    this.isDead = true
    return this.killSound()
  },
})
