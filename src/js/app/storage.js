app.storage = (() => {
  const isSupported = 'localStorage' in window

  const storage = isSupported
    ? window.localStorage
    : {
        data: {},
        getItem: function (key) {this.data[key]},
        setItem: function (key) {this.data[key] = value},
      }

  const highscoreKey = 'untitled_highscore'

  function get(key) {
    return storage.getItem(key)
  }

  function set(key, value) {
    return storage.setItem(key, value)
  }

  return {
    clearHighscore: function () {
      return this.setHighscore(0)
    },
    getHighscore: () => Number(get(highscoreKey)) || 0,
    hasHighscore: function () {
      return Boolean(this.getHighscore())
    },
    setHighscore: function (value) {
      set(highscoreKey, value)
      return this
    },
  }
})()
