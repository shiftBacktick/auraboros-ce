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
      .rotateQuaternion(positionQuaternion.conjugate())

    this.distance = 1

    this.binaural.update(
      this.relative.normalize().scale(engine.const.binauralHeadWidth / 2)
    )

    this.reverb.update({...this.relative})

    return this
  },
  trigger: function (propOptions = {}, playOptions = {}) {
    const prop = engine.props.create(this, propOptions)
    const promise = prop.play(playOptions)

    // XXX: Circumvent propFadeDuration
    engine.audio.ramp.set(prop.output.gain, 1)

    promise.then(() => {
      engine.props.destroy(prop)
    })

    return promise
  },
})
