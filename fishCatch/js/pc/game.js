!(function(){
	'use strict'

  // 游戏
	var Game = {
		$data: {
			screen: {
				w: 0,
				h: 0,
				type: 0
			},
			firstInit: true,
			removeFishList: [] // 每一次运动鱼之后要清除的鱼队列
		},
		$el: {
			$gameWrapper: $('.game-wrapper'), // 大的鱼盒子
			$gameFishMan: $('#game-fishMan'),
			$fishManFish: $('.fishMan-fish'),
			$start: $('.start-btn'),
			$fishManInfo: $('.fishMan-info'),
			bgAudio: document.getElementById('audio-bg') // 金币声音
		},
		$obj: {
			battery: null,
			fishList: []
		},
		init: function () {
			this.setViewPost()
			this.renderBattery() // 画出炮台
			this.handlerFishData() // 处理鱼的数据
			this.lisitenEvents() // 监听事件
			this.animationGame() // 跑起动画
		},
		 // 处理不同类型鱼出现概率的数据
		handlerFishData: function () {
			var appear = 0

			GAME_DATA.fish.forEach(function (item) {
				var nowAppear =  appear + item.appear
				item.appear = nowAppear
				appear = nowAppear
			})
		},
		// push每轮运动后要清除的鱼队列
		removeFishData: function (ev, index) {
			this.$data.removeFishList.push(index)
		},
		animationGame: function () {
			var _self = this
			var lastTime = new Date() // 创建鱼的时间

			window.timer && clearInterval(window.timer)
			_self.$obj.fishList.push(new $.Fish(_self.$el.$fishManFish, _self.$data.screen).create())
			window.timer = window.setInterval(function () {
				var nowTime = new Date()

				_self.$data.removeFishList = [] // 本轮要清除的鱼队列
				_self.$obj.battery.animation(_self.$obj.fishList)
				_self.$obj.fishList.forEach(function (fish, index) {
					fish.move(index)
				})

				for (var i = _self.$data.removeFishList.length - 1; i > -1; i--) {
					var spliceIndex = _self.$data.removeFishList[i]
					_self.$obj.fishList.splice(spliceIndex, 1) // 清除本轮需要消耗的鱼队列
				}
				if (nowTime - lastTime > GAME_CONFIG.createFishTime) {
					_self.$obj.fishList.push(new $.Fish(_self.$el.$fishManFish, _self.$data.screen).create())
					lastTime = nowTime
				}
			}, GAME_CONFIG.animationTimer)
		},
		// 画出炮弹
		renderBattery: function () {
			this.$obj.battery = new $.Battery(this.$el.$gameFishMan, this.$data.screen)
		},
		// 设备宽高
		setViewPost: function () {
			this.$data.screen = {
				w: 1024,
				h: 768
			}

			if (this.$obj.battery)  this.$obj.battery.$data.screen = this.$data.screen
		},
		// 监听事件
		lisitenEvents: function () {
			var _self = this

			this.$el.bgAudio.play()
      $('body').on('removeFishData', _self.removeFishData.bind(_self))
			$('body').on('moreFish', function () {
				var defaultTime = GAME_CONFIG.createFishTime
				GAME_CONFIG.createFishTime = 100
				_self.animationGame()
				_self.$el.$fishManInfo.text('鱼群来袭...').addClass('active')
				setTimeout(function () {
					_self.$el.$fishManInfo.removeClass('active')
				}, 2000)
				setTimeout(function () {
					_self.$el.$fishManInfo.text('鱼群散去...').addClass('active')
					setTimeout(function () {
						_self.$el.$fishManInfo.removeClass('active')
					}, 2000)
					GAME_CONFIG.createFishTime = defaultTime
					_self.animationGame()
				}, 20000)
			})

		}
	}

	Game.init()


	// 是否电脑
	function IsPC () {
	  var userAgentInfo = navigator.userAgent
	  var Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod']
	  var flag = true
	  for (var i = 0; i < Agents.length; i++) {
	    if (userAgentInfo.indexOf(Agents[i]) > 0) {
	      flag = false
	      break
	    }
	  }
	  return flag
	}

})()
