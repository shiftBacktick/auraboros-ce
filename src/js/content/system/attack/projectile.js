content.system.attack.projectile = {}

content.system.attack.projectile.create = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

content.system.attack.projectile.prototype = {
  construct: function ({
    time = 0,
    vector = {},
    velocity = {},
  } = {}) {
    this.time = time
    this.velocity = velocity
    this.x = vector.x || 0
    this.y = vector.y || 0
    this.z = vector.z || 0
    return this
  },
  update: function () {
    const delta = engine.loop.delta(),
      deltaVelocity = this.velocity.scale(delta)

    this.time -= delta
    this.x += deltaVelocity.x
    this.y += deltaVelocity.y
    this.z += deltaVelocity.z

    return this
  },
}
