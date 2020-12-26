content.const = {
  enemyAcceleration: engine.const.gravity, // m/s
  enemyLimitMax: 12,
  enemyLimitMin: 1,
  enemyRadius: 0.5, // m
  enemyReaction: 1/8, // % chance
  enemySpeed: 3, // m/s
  enemySpawnRate: 1 * 1000, // ms
  horizon: 50, // m
  idealScore: (1 * 60) * (60 + (5 * 60) + (500 * 4)),
  projectileFireRate: 1/10 * 1000, // ms
  projectileSpeed: 25, // m/s
  projectileTimeout: 1, // s
  wormholeChargeTime: 15, // s
  wormholeLimitMax: 4,
  wormholeLimitMin: 1,
  wormholeRadius: 2, // m
  wormholeSpawnRate: 15 * 1000, // ms
}

engine.const.distancePower = 2
