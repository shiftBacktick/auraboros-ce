content.system.score = (() => {
  let score = 0

  return {
    get: () => Math.floor(score),
    increment: function (value = 0) {
      score += value
      return this
    },
    reset: function () {
      score = 0
      return this
    },
  }
})()

engine.ready(() => {
  content.system.enemies.on('kill', (prop) => content.system.score.increment(prop.points))
  content.system.wormholes.on('kill', (prop) => content.system.score.increment(prop.points))
})

engine.loop.on('frame', ({delta, paused}) => {
  if (paused) {
    return
  }

  if (engine.position.getVector().distance() < content.const.horizon) {
    content.system.score.increment(delta / 2)
  }
})

engine.state.on('reset', () => content.system.score.reset())
