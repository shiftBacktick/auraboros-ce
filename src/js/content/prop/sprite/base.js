content.prop.sprite.base = engine.prop.base.invent({
  name: 'sprite/base',
  play: function (options) {
    return engine.utility.timing.promise(0)
  },
  recalculate: function () {
    const positionQuaternion = engine.position.getQuaternion(),
      positionVector = engine.position.getVector()

    this.relative = this.vector()
      .subtract(positionVector)
      .subtractRadius(this.radius)
      .rotateQuaternion(positionQuaternion.conjugate())

    this.distance = 1

    this.binaural.update(
      this.relative.normalize().scale(engine.const.binauralHeadWidth)
    )

    this.reverb.update({...this.relative})

    return this
  },
  trigger: function (options, ...args) {
    const prop = engine.props.create(this, options)
    const promise = prop.play()

    promise.then(() => {
      engine.props.destroy(prop)
    })

    return promise
  },
})
