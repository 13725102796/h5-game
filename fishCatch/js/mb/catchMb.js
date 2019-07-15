!(function(){
	'use strict'

	// 炮台
	function Battery (par, screen) {
		this.$el.$par = par
		this.$data.screen = screen
		this.init()
		this.handlerAddPlus() // 加加减减
		this.handlerLaunch() // 发射事件
	}

	Battery.prototype = {
		$data: {
			battertList: [],
			battertCount: 0,
			score: 200,
			index: 0,
			lineWidth: 0,
			lastLaunchTime: new Date()
		},
		$el: {
			$container: $('.fishMan-basic'),
			$battery: $('.basic-battery'),
			$add: $('.basic-add'),
			$plus: $('.basic-plus'),
			$control: [$('.basic-add'), $('.basic-plus')],
			$scoreShow: $('.basic-score'),
			$line: $('.basic-line'),
			$catchAll: $('.fishMan-catchAll'),
			bulletAudio: document.getElementById('audio-bullet'),
			goldAudio: document.getElementById('audio-glod')
		},
		// 初始化
		init: function () {
			var height = this.$data.screen.h

			this.$el.$container.css({
				height: height * 0.094 - 2
			})
			this.$el.$line.css({
				height: (height * 0.094 - 2) * 0.29
			})
			this.$el.$battery.css('background','url(image/'+ GAME_DATA.battery.cannon[0] + ')')
		},
		// 处理加加减减
		handlerAddPlus: function () {
			var _self = this
			// 加加减减事件
			this.$el.$control.forEach(function (item) {
				$(item).on('touchstart', function(ev) {
					ev.stopPropagation()
					var index

					if($(item).data('i')) { // i === 1 加号 i === 0  减号
						index =  (--_self.$data.index < 0) ? 6 : _self.$data.index--
					} else {
						index = ++_self.$data.index % 7
					}
					_self.$el.$battery.css({
						'background' : 'url(image/'+ GAME_DATA.battery.cannon[index] + ')',
						'top' : index * -2
					})
					_self.$data.index = index
					$(item).addClass('active')
				}).on('touchend', function () {
					$(item).removeClass('active')
				})
			})
		},
		// 发射事件
		handlerLaunch: function () {
			var _self = this
			this.$el.$par.on('touchstart', function (ev) {
				var nowDate = new Date()
				var screen = _self.$data.screen
				if(nowDate - _self.$data.lastLaunchTime < 350) return // 两次点击的间隔时间
				_self.$data.lastLaunchTime = nowDate

				ev = ev.originalEvent.touches[0]
				var xy = $(this).offset()
				var x = screen.type ? ev.pageX : ev.pageY // type === 1 横屏 type === 0 竖屏
				var y = screen.type ? ev.pageY : ev.pageX
				var rx = Math.abs(screen.h / 2 - x)
				var ry = screen.type ? Math.abs((screen.w - 40) - y)  : Math.abs(y - 70)
				var dirX = x > (screen.h / 2) ? 1 : -1
				var dirY = screen.type ? (y > (screen.w - 45) ? -1 : 1) : (y > 45 ? 1 : -1)
				var prop = (rx / ry).toFixed(2)
				var radian = Math.atan(prop)
				var angle = radian * 360 / 2 / Math.PI

				if (dirY === -1) return // 往下打
				_self.$el.$battery.css('transform', 'rotate(' + dirX * angle + 'deg)').addClass('active')
				_self.$data.score = _self.$data.score - (_self.$data.index + 1) * 2
				_self.$el.$scoreShow.text(_self.$data.score)

				var $bulletBox = $('<div>')
				var $bullet = new Image()

				$bulletBox.addClass('bullet').css({ opacity: 0 })
				$bullet = new Image()
				$bullet.src = 'image/' + GAME_DATA.battery.bullet[_self.$data.index]
				$bulletBox.append($bullet).appendTo($(this))

				$bullet.onload = function () {
					var x = screen.h / 2 + eval((dirX * Math.sin(radian) * 60).toFixed(2)) + 22
					var	y = screen.w - 40 - eval((dirY * Math.cos(radian) * 60).toFixed(2))
					var tx
					var ty
					if (prop < 0.78) { // 往上打
						ty = -50
						tx = x + dirX * (y + 45) * prop - 11
						console.log('122')
					} else {
						// console.log('111')
						var tx = dirX === 1 ? screen.h : -50 // 左侧还是右侧
						var ty = Math.floor(y - x / prop - 45)
					}

					var transform = 'rotate(' + dirX * angle + 'deg) scale(0.7)'

					$bulletBox.css({'left': x, 'top': y, 'transform': transform, 'opacity': 1})

					var minusX = tx - x
					var minusY = ty - y
					var progressUp = Number((GAME_CONFIG.bulletSpeen / Math.pow(Math.pow(minusX, 2) + Math.pow(minusY, 2), 0.5)).toFixed(2))

					_self.$data.battertCount += 1

					_self.$data.battertList.push({
						el: $bulletBox,
						type: 1, // 1为移动
						data: {
							index: _self.$data.battertCount,
							stX: x,
							stY: y,
							endX: tx,
							endY: ty,
							nowX: x,
							nowY: y,
							progress: 0,
							transform: transform,
							progressUp: progressUp,
							minusX: minusX,
							minusY: minusY
						}
					})

					$bullet.onload = null // 这很重要
				}
			})
		},
		// 运动
		animation: function (fishList) {
			console.log(fishList)
			var _self = this
			for (var i = this.$data.battertList.length - 1; i > -1; i--) {
				var battert = this.$data.battertList[i]
				var data = battert.data
				var nowXpoint = data.nowX + 22
				var nowYpont = data.nowY + 22
				if (battert.type === 1) { // 移动
					var transformX = data.progress * data.minusX / 100
					var transformY = data.progress * data.minusY / 100
					data.progress += data.progressUp
					data.nowX = data.stX + transformX
					data.nowY = data.stY + transformY
					battert.el.css({
						transform: 'translate3D( ' + transformX + 'px, ' + transformY + 'px, 0) ' + data.transform
					})

					fishList.forEach(function (fish) { // 抓到鱼
						fish = fish.$data.moveData
						if (nowXpoint > fish.nowX + fish.width / 10 && nowXpoint < fish.nowX + fish.width * 9 / 10 && nowYpont > fish.nowY + fish.height / 10 && nowYpont < (fish.nowY + fish.height * 9 / 10)) {
							battert.type = 2
							return
						}
					})

					if (data.progress > 100) {
						this.$data.battertList.splice(i, 1)
						battert.el.remove()
					}
				} else if (battert.type === 2) {
					var viewPortProp = this.$data.screen.h / 500
					var networkData = GAME_DATA.battery.bulletDis[this.$data.index]
					var realSize = networkData.scale * viewPortProp
					var	sX = nowXpoint - realSize	/ 2	//l1
					var	eX = sX + realSize		//r1
					var	sY = nowYpont - realSize / 2		//t1
					var	eY = sY + realSize		//b1
					var	disFishList = [] // 被抓到的鱼
					battert.isCatched = true
					battert.el.css({
						width: realSize,
						height: realSize,
						left: sX,
						top: sY,
						transform: 'rotate(0)'
					})
					.addClass('dis')
					.find('img')
					.attr('src','./image/'+ networkData.img)
					.css('width', '100%')
					this.$data.battertList.splice(i, 1)

					setTimeout(function () {
						console.log('缩小')
						battert.el.css({
							transition: '0.5s',
							transform: 'scale(0.1)'
						})
						setTimeout(function () {
							console.log(battert.el)
							battert.el.remove()
						}, 500)
					},1000)

					fishList.forEach(function (fish, index) {
						var fishData = fish.$data.fishData
						var fishMove = fish.$data.moveData
						var l = fishMove.nowX
						var t = fishMove.nowY
						var w = fishMove.width
						var h = fishMove.height * 0.6
						if (sY > t + h || eX < l || eY < t || sX > l + w) {

						} else {
							var degree = fishData.degree
							var power = GAME_DATA.battery.bulletDis[_self.$data.index].power
							var scale = 100 - Math.random() * 100

							if(degree / scale * power > 1){
								disFishList.push(fish)
								fishMove.type = 2
								fish.$el.$fish.addClass('catch')
								Game.removeFishData(index)
							}
						}
					})

					var sumScore = 0

					setTimeout(function () {

						var sum = 0
						disFishList.forEach(function (fish) {
							var fishData = fish.$data.fishData
							sumScore += fishData.value
							fish.$el.$fish
								.css({
									width: 142,
									height: 47,
									left: fish.$data.moveData.nowX,
									top: fish.$data.moveData.nowY,
									transform: 'rotate(0)'
								})
								.removeClass()
								.attr('class', 'gold')
								.find('img')
								.attr('src','./image/' + fishData.gold)
							fish.$el.$fish.animate({
								'margin-top': -50,
								'opacity':0
							}, 500, function () {
								fish.$el.$fish.remove()
							})
						})
					}, 1000)

					// 	$.each(dis, function () {
					// 		var info = $(this).data('info');
					// 		if(!info) return;
					// 		if(info) This.score += info.value;
					// 		sum += info.value;
					// 		This.scoreShow.text(This.score);
					// 		$(this).css({'width':142,'height':47}).removeClass().attr('class','gold').find('img').attr('src','image/' + info.gold);
					// 		$(this).animate({'margin-top':-50,'opacity':0},500,function(){
					// 			$(this).remove();
					// 		});
					// 		This.lineWidth += info.value/40;
					// 	})
					// 	This.goldAudio.play();
					// 	$bulletBox.attr('class','coin').css({'left':nowX,'top':nowY}).animate({'width':30,'height':30,'left':230,'top':680,'opacity':0.5},1000,function(){
					// 		$(this).remove();
					// 	}).find('img').attr('src','image/coin'+ (sum<100?1:2) +'.png');
					// 	if(This.lineWidth > 213) {
					// 		This.lineWidth = 213;
					// 		This.line.addClass('active').text('滑动滚轮撒牛网');
					// 	}
					// 	This.line.css('width',This.lineWidth);
					// },800)
				}
			}
		}
	}

	// 鱼
	function Fish (par, screen) {
		this.$data = {
			screen: screen
		}
		this.$el = {
			$par: par
		}
	}

	Fish.prototype = {
		// 创建鱼
		create: function () {
			var createNum = Math.random() * 100
			var	num = $.grep(GAME_DATA.fish, function(item){
				return createNum > item.appear
			}).length
			var fishData = GAME_DATA.fish[num]

			this.$data.fishData = fishData
			this.renderFish(fishData, num)
			return this
		},
		// 渲染鱼
		renderFish: function (fishData, num) {
			var _self = this
			var screenWidth = this.$data.screen.w
			var screenHeight = this.$data.screen.h
			var dir = Math.random() < 0.5 // 鱼游动的方向
			var Class = fishData.class // 鱼的类型
			var $fish = $('<div>')	//
			var $fishImg = new Image()
			var viewPortProp = 1000 / screenHeight

			$fish.addClass('fish fish-'+ Class)

			$fishImg.src = 'image/' + fishData.img
			$fish.append($fishImg).appendTo(this.$el.$par)

			var appearPosition = Math.random() < 0.7  			// 从顶部还是底部出现 true 为左右 false 为上下
			var disappearPostion =  Math.random() < 0.7			// 从顶部还是底部消失 true 为左右 false 为上下
			var iw = fishData.width / viewPortProp					// 容器宽度
			var ih = fishData.height / Class / viewPortProp	// 容器高度
			var stX // 初始left
			var stY
			var endY
			var endX																					// 目标left

			if (appearPosition) { // 左右出现
				stX = dir ? -iw : screenHeight + iw
				stY = Math.floor(Math.random() * screenWidth) - ih
			} else {	// 上下出现
				stX = Math.random() < 0.5 ? Math.random() * screenHeight / 3 : (2 + Math.random()) * screenHeight / 3 // 不出现在底部 1 / 3 ~ 2 / 3
				stY = Math.random() < 0.5 ? -ih : screenWidth + ih
			}

			if (disappearPostion) { // 左右消失
				if (appearPosition) {
					endX = dir ? screenHeight + iw : -iw
					endY = Math.random() * screenWidth
				} else { // 上下出现的左右消失 至少让他走1/3个板块
					var disappearDir = stY < 0 ? 1 : -1
					endX = dir ? screenHeight + iw : -iw
					endY = (disappearDir + Math.random()) * screenWidth / 3
				}
			} else { // 上下消失
				if (appearPosition) { // 左右出现的上下消失 至少让他走1/3个板块
					var disappearDir = stX < 0 ? 1 : -1
					endX = (disappearDir + Math.random()) * screenHeight / 3  // 提取公因式 disappearDir * screenHeight / 2 + Math.random() * screenHeight / 2
				} else {
					endX = Math.random() < 0.5 ? Math.random() * screenHeight / 3 : (2 + Math.random()) * screenHeight / 3 // 不消失在底部 1 / 3 ~ 2 / 3 Math.random() * screenHeight
				}

				endY = Math.random() < 0.5 ? -ih : screenWidth + ih
			}

			var minusX = endX - stX
			var minusY = endY - stY

			dir = minusX > 0 // true 从左往右 false 从右往左

			var radian = Math.atan(minusY / minusX)
			var deg = radian * 360 / 2 / Math.PI
			var transform = dir ? 'rotateZ(' + deg + 'deg)' : 'rotateZ(' + deg + 'deg) rotateY(180deg)'

			$fish.css({
				width: iw,
				height: ih,
				left: stX,
				top: stY
			})

			this.$data.moveData = {
				width: iw,
				height: ih,
				stX: stX,
				stY: stY,
				nowX: stX,
				nowY: stY,
				minusX: minusX,
				minusY: minusY,
				transform: transform,
				progress: 0,
				progressUp: fishData.speed / 450000 * (1 + Math.random() * 0.5),
				type: 1 // type === 1 移动中
			}
			this.$el.$fish = $fish
		},
		// 移动
		move: function (index) {
			var data = this.$data.moveData
			if (data.type === 1) { // 移动
				var transformX = data.progress * data.minusX / 100
				var transformY = data.progress * data.minusY / 100
				data.progress += data.progressUp
				data.nowX = data.stX + transformX
				data.nowY = data.stY + transformY

				this.$el.$fish.css({
					transform: 'translate3D( ' + transformX + 'px, ' + transformY + 'px, 0) ' + data.transform
				})
				if (data.progress > 100) {
					Game.removeFishData(index)
					this.$el.$fish.remove()
				}
			}
		}
	}

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
			$gameWrapper: $('.game-wrapper'),
			$gameFishMan: $('#game-fishMan'),
			$fishManFish: $('.fishMan-fish')
		},
		$obj: {
			battery: null,
			fishList: []
		},
		init: function () {
			var _self = this
			this.setViewPost()
			setTimeout(function () {
				_self.renderBattery()
				_self.handlerFishData() // 处理鱼的数据
				_self.lisitenEvents()
				_self.animationGame()
			}, 600)
		},
		 // 处理鱼出现概率的数据
		handlerFishData: function () {
			var appear = 0
			GAME_DATA.fish.forEach(function (item) {
				var nowAppear =  appear + item.appear
				item.appear = nowAppear
				appear = nowAppear
			})
		},
		// 增加每次运动后要清除的鱼队列
		removeFishData: function (index) {
			this.$data.removeFishList.push(index)
		},
		animationGame: function () {
			var _self = this
			var lastTime = new Date() // 创建鱼的时间

			_self.$obj.fishList.push(new Fish(_self.$el.$fishManFish, _self.$data.screen).create())
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
					_self.$obj.fishList.push(new Fish(_self.$el.$fishManFish, _self.$data.screen).create())
					lastTime = nowTime
				}
			}, GAME_CONFIG.animationTimer)
			// $('.bb').on('click', function () {
			// 	clearInterval(window.timer)
			// })
		},
		// 画出炮弹
		renderBattery: function () {
			this.$obj.battery = new Battery(this.$el.$gameFishMan, this.$data.screen)
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

				if (type === 1) console.log('关闭重力感应系统体验更好')
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
