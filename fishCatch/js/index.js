var Entrance = {
  init: function () {
    if (this.testMb()) {
      this.initMb()
    } else {
      this.initPc()
    }
  },
  testMb: function () {
    var ua = navigator.userAgent
    var ipad = ua.match(/(iPad).*OS\s([\d_]+)/)
    var isIphone =!ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/)
    var isAndroid = ua.match(/(Android)\s+([\d.]+)/)
    var isMobile = isIphone || isAndroid
    console.log(isMobile)
    return isMobile
  },
  initMb: function () {
    var css = '<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"><link href="./css/styleMb.css" rel="stylesheet"/>' // '<link href="http://www.web-jackiee.com/works/jquery/oldcowPlayer/css/styleMb.css" rel="stylesheet"/>'
    var battery = document.createElement('script')
    var fish = document.createElement('script')
    var game = document.createElement('script')
    var _self = this

    document.head.innerHTML += css
    battery.src = './js/mb/battery.js'
    fish.src = './js/mb/fish.js'
    game.src = './js/mb/game.js'

    document.body.appendChild(battery)
    document.body.appendChild(fish)
    document.body.appendChild(game)
  },
  initPc: function () {
    var css = '<link href="./css/stylePc.css" rel="stylesheet"/>' // '<link href="http://www.web-jackiee.com/works/jquery/oldcowPlayer/css/stylePc.css" rel="stylesheet"/>'
    var battery = document.createElement('script')
    var fish = document.createElement('script')
    var game = document.createElement('script')
    var loadCount = 0
    var _self = this

    document.head.innerHTML += css
    battery.src = './js/pc/battery.js'
    fish.src = './js/pc/fish.js'
    game.src = './js/pc/game.js'

    document.body.appendChild(battery)
    document.body.appendChild(fish)

    battery.onload = function () {
      loadCount++
      if (loadCount === 2) document.body.appendChild(game)
    }

    fish.onload = function () {
      loadCount++
      if (loadCount === 2) document.body.appendChild(game)
    }
  }
}

Entrance.init()
