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
			var _self = this
			this.setViewPost()
			setTimeout(function () { // 延迟触发,由于重力系统开启检测到横屏时,手机将倒转页面,手机端性能倒转时间不同,导致屏幕宽高测算失败
				_self.renderBattery() // 画出炮台
				_self.handlerFishData() // 处理鱼的数据
				_self.lisitenEvents() // 监听事件
				_self.animationGame() // 跑起动画
			}, 600)
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
			// $('.bb').on('click', function () {
			// 	// clearInterval(window.timer)
			// 	_self.$el.bgAudio.play()
			// })
		},
		// 画出炮弹
		renderBattery: function () {
			this.$obj.battery = new $.Battery(this.$el.$gameFishMan, this.$data.screen)
		},
		// 设备宽高
		setViewPost: function () {
			var $gameWrapper = this.$el.$gameWrapper
			var _self = this
			setTimeout(function () {
				var type
				var transfommStyle
				var ispc = IsPC() && $gameWrapper.width() < $gameWrapper.height() // 最后去除

				if(window.orientation == 0 || window.orientation == 180 || ispc) { // 竖屏
					type = 0
					var screenW = $gameWrapper.width()
					var screenH = $gameWrapper.height()
					transfommStyle = {
						'transform': 'translate3D(0, ' + screenW * -1 + 'px, 0) rotate(90deg)',
						'transform-origin': '0 ' + screenW + 'px',
						'background-size': screenH + 'px ' + (screenH  * 0.75) + 'px'
					}
				} else { // 横屏
					type = 1
					var screenW = $gameWrapper.height()
					var screenH = $gameWrapper.width()
					transfommStyle = {
						'transform': 'translate3D(0, 0, 0)',
						'background-size': screenH + 'px ' + (screenH  * 0.75) + 'px'
					}
				}

				var gameFishManStyle = $.extend({
					width: screenH,
					height: screenW
				}, transfommStyle)

				_self.$el.$gameFishMan.css(gameFishManStyle)
				_self.$data.screen = {
					w: screenW,
					h: screenH,
					type: type
				}
				if (_self.$obj.battery)  _self.$obj.battery.$data.screen = _self.$data.screen

				if (type === 1) alert('关闭重力感应系统体验更好')
			}, 500)
		},
		// 监听事件
		lisitenEvents: function () {
			var _evt = 'onorientationchange' in window ? 'orientationchange' : 'resize'
			var _self = this
	    window.addEventListener(_evt, function () {
				_self.setViewPost()
			}, false)

			window.addEventListener('touchmove', function (e) {
				e.preventDefault()
			}, false)

			window.addEventListener('touchstart', function (e) {
				_self.$el.bgAudio.play()
			}, false)

      $('body').on('removeFishData', _self.removeFishData.bind(_self))
			$('body').on('moreFish', function () {
				var defaultTime = GAME_CONFIG.createFishTime
				GAME_CONFIG.createFishTime = 200
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
