!(function(){
	'use strict'

	// 炮台
	function Battery (par, screen) {
		this.$el.$par = par // 父元素盒子
		this.$data.screen = screen // 屏幕高宽
		this.$data.parOffset = this.$el.$par.offset()
		this.init() // 初始化
		this.handlerAddPlus() // 加加减减
		this.handlerLaunch() // 发射事件
	}

  // 炮台
	Battery.prototype = {
		$data: {
			battertList: [],
			battertCount: 0,
			score: 1000,
			index: 0,
			lineWidth: 0,
			lastLaunchTime: new Date(),
			moreSwitch: true
		},
		$el: {
			$container: $('.fishMan-basic'), // 大炮架盒子
			$battery: $('.basic-battery'), // 炮弹
			$add: $('.basic-add'), // 加号
			$plus: $('.basic-plus'), // 减号
			$control: [$('.basic-add'), $('.basic-plus')], // 控制键
			$scoreShow: $('.basic-score'), // 分数
			$line: $('.basic-line'), // 分数线
			$catchAll: $('.fishMan-catchAll'),
			bulletAudio: document.getElementById('audio-bullet'),  // 炮弹声音
			goldAudio: document.getElementById('audio-glod') // 金币声音
		},
    // 初始化
		init: function () {
			var height = this.$data.screen.h

			this.$el.$container.css({ // 大盒子
				height: height * 0.094 - 2
			})

			this.$el.$battery.css('background', 'url(image/'+ GAME_DATA.battery.cannon[0] + ')') // 根据当前等级初始化炮弹的样子
		},
		// 处理加加减减
		handlerAddPlus: function () {
			var _self = this
			// 加加减减事件
			this.$el.$control.forEach(function (item) {
				$(item).on('mousedown', function(ev) {
					ev.stopPropagation()
					var index

					if($(item).data('i') === 1) { // i === 1 加号 i === 0  减号
						index =  (--_self.$data.index < 0) ? 6 : _self.$data.index--
					} else {
						index = ++_self.$data.index % 7 // 最高7等级
					}
					_self.$el.$battery.css({
						'background-image' : 'url(image/'+ GAME_DATA.battery.cannon[index] + ')',
						'top' : index * -2
					})
					_self.$data.index = index
					$(item).addClass('active')
				}).on('mouseup', function () {
					$(item).removeClass('active')
				})
			})
		},
		// 发射事件
		handlerLaunch: function () {
			var _self = this

			this.$el.$par.on('click', function (ev) {

				var nowDate = new Date()
				var screen = _self.$data.screen

        if(nowDate - _self.$data.lastLaunchTime < 300) return

				_self.$data.lastLaunchTime = nowDate

        var bulletArttr = _self.getBulletAttr(ev, screen)
        var dirX = bulletArttr.dirX
        var dirY = bulletArttr.dirY
        var prop = bulletArttr.prop
        var radian = bulletArttr.radian
        var angle = bulletArttr.angle

				if (dirY === -1) return // 往下打
				_self.$el.$battery.css('transform', 'rotate(' + dirX * angle + 'deg)').addClass('active') // 调整炮台初始的转动角度
				_self.$data.score = _self.$data.score - (_self.$data.index + 1) * 2 // 分数扣除
				_self.$el.$scoreShow.text(_self.$data.score)  // 显示分数

				var $bulletBox = $('<div>') // 创建炮弹盒子
				var $bullet = new Image()

				$bulletBox.addClass('bullet').css({ opacity: 0 })
				$bullet = new Image()
				$bullet.src = 'image/' + GAME_DATA.battery.bullet[_self.$data.index]
				$bulletBox.append($bullet).appendTo($(this)) // 炮弹装进去

				$bullet.onload = function () {
          _self.renderBullet($bulletBox, screen, dirX, dirY, prop, radian, angle)
					$bullet.onload = null // 这很重要
				}
				_self.$el.bulletAudio.play()
			})
		},
    // 渲染初始的炮弹并记录相关值
    renderBullet: function ($bulletBox, screen, dirX, dirY, prop, radian, angle) {
      var x = screen.w / 2 + eval((dirX * Math.sin(radian) * 84).toFixed(2)) // 出现的left
      var	y = screen.h - 40 - eval((dirY * Math.cos(radian) * 84).toFixed(2)) // 出现的top
      var tx  // 目标left
      var ty  // 目标top
      if (prop < 0.78) { // 往上打
        tx = x + dirX * (y + 45) * prop - 11
        ty = -50
      } else {
        tx = dirX === 1 ? screen.w : -50 // 左侧还是右侧
        ty = Math.floor(y - x / prop - 45)
      }

      var transform = 'rotate(' + dirX * angle + 'deg) scale(0.8)'

      $bulletBox.css({'left': x, 'top': y, 'transform': transform, 'opacity': 1})

      var minusX = tx - x
      var minusY = ty - y
      var progressUp = Number((GAME_CONFIG.bulletSpeen / Math.pow(Math.pow(minusX, 2) + Math.pow(minusY, 2), 0.5)).toFixed(2))

      this.$data.battertList.push({
        el: $bulletBox,
        type: 1, // 1为移动 2为触碰到鱼了
        data: {
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
    },
		// 运动
		animation: function (fishList) {
			for (var i = this.$data.battertList.length - 1; i > -1; i--) {
				var battert = this.$data.battertList[i]
				var data = battert.data
				var nowXpoint = data.nowX + 22
				var nowYpoint = data.nowY + 22
				if (battert.type === 1) { // 移动
					this.animationMove(fishList, battert, data, nowXpoint, nowYpoint, i)
				} else if (battert.type === 2) {
          this.animationCatch(fishList, battert, nowXpoint, nowYpoint, i)
				}
			}
		},
		// 炮移动中
    animationMove: function (fishList, battert, data, nowXpoint, nowYpoint, i) {
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
        var scaleW = (fish.width > 50 ? 1 : -1) * fish.width / 10 // 小于50px的为负数给于判断范围扩大 大于50的减去判断范围
        var scaleH = (fish.height > 50 ? 1 : -1) * fish.height / 10

        if (nowXpoint > fish.nowX + scaleW && nowXpoint < fish.nowX + fish.width - scaleW && nowYpoint > fish.nowY + scaleH && nowYpoint < fish.nowY + fish.height - scaleH) {
          battert.type = 2
          return
        }
      })

      if (data.progress > 100) {
        this.$data.battertList.splice(i, 1)
        battert.el.remove()
      }
    },
    // 抓到鱼
    animationCatch: function (fishList, battert, nowXpoint, nowYpoint, i) {
      var _self = this
      var viewPortProp = this.$data.screen.w / 500
      var networkData = GAME_DATA.battery.bulletDis[this.$data.index]
      var realSize = networkData.scale * viewPortProp
      var	sX = nowXpoint - realSize	/ 2	//l1
      var	eX = sX + realSize		//r1
      var	sY = nowYpoint - realSize / 2		//t1
      var	eY = sY + realSize		//b1
      var	disFishList = [] // 被抓到的鱼

      battert.el.css({
        width: realSize,
        height: realSize,
        left: sX,
        top: sY,
        transform: 'rotate(0) translate3D(0, 0, 0)',
				opacity: 0
      })
      .addClass('dis')
      .find('img')
      .attr('src','./image/'+ networkData.img)
      .css('width', '100%')
			.on('load', function () { // 防止图片加载慢,弹头本身变大
				battert.el.css({
					opacity: 1
				})
			})

      this.$data.battertList.splice(i, 1)

      // 定位完之后捕获碰撞检测按2/3比例来算
      sX = nowXpoint - realSize	/ 3
      eX = sX + realSize * 2 / 3
      sY = nowYpoint - realSize / 3
      eY = sY + realSize	* 2 / 3

      fishList.forEach(function (fish, index) {
        var fishData = fish.$data.fishData
        var fishMove = fish.$data.moveData
        var l = fishMove.nowX
        var t = fishMove.nowY
        var w = fishMove.width
        var h = fishMove.height * 0.6
        if (!(sY > t + h || eX < l || eY < t || sX > l + w)) {
          var degree = fishData.degree
          var power = GAME_DATA.battery.bulletDis[_self.$data.index].power
          var scale = 100 - Math.random() * 100

          if(degree / scale * power > 1){
            disFishList.push(fish)
            fishMove.type = 2
            fish.$el.$fish.addClass('catch')
            $('body').trigger('removeFishData', index) // 移除鱼的数据
          }
        }
      })

			this.animationBeGold(viewPortProp, disFishList, battert.el, nowXpoint, nowYpoint, _self)
    },
		// 抓到鱼之后的动画
		animationBeGold: function (viewPortProp, disFishList, $battert, nowXpoint, nowYpoint, _self) {
			_self.$el.goldAudio.play()
			setTimeout(function () {
				// var width = 64
				// var height = width * 0.33
				var sumScore = 0

				disFishList.forEach(function (fish) {
					var fishData = fish.$data.fishData
					sumScore += fishData.value
					fish.$el.$fish
						.css({
							left: fish.$data.moveData.nowX,
							top: fish.$data.moveData.nowY,
							transform: 'rotate(0) translate3D(0, 0, 0)',
							'z-index': '100',
						})
						.removeClass()
						.attr('class', 'gold')
						.find('img')
						.attr('src','./image/' + fishData.gold)
						.animate({
							'margin-top': -50,
							'opacity': 0
						}, 1000, function () {
							fish.$el.$fish.remove()
						})
				})

				// 抓到鱼了
				if (sumScore) {
					$battert
						.attr('class','coin')
						.animate({
							width: 30,
							height:30,
							left: nowXpoint,
							top: nowYpoint
						}, 500, function() {
							$(this).animate({
								left: 150,
								top: 700,
								transform: 'scale(0.2)'
							}, 500, function () {
								$(this).remove()
							})
						})
						.find('img')
						.attr('src', 'image/coin'+ (sumScore < 100 ? 1 : 2) +'.png')
					_self.$el.goldAudio.play()
					_self.$data.score += sumScore
					_self.$el.$scoreShow.text(_self.$data.score)
					_self.$data.lineWidth += sumScore / 70
					_self.$el.$line.css('width', Math.min(_self.$data.lineWidth, 100) + '%')

					if(_self.$data.lineWidth > 100 && _self.$data.moreSwitch) {
						_self.$data.moreSwitch = false
						_self.$el.$line.addClass('active')
						$('body').trigger('moreFish')
						setTimeout(function () {
							_self.$data.lineWidth = 0
							_self.$el.$line.removeClass('active').css('width', _self.$data.lineWidth + '%')
							_self.$data.moreSwitch = true
						}, 20000)
					}
				} else {
					_self.disappearBattert($battert)
				}

      }, 1000)
		},
    // 隐藏网
    disappearBattert: function ($battert) {
      $battert.css({
        transition: '0.5s',
        transform: 'scale(0.1)'
      })
      setTimeout(function () {
        $battert.remove()
      }, 500)
    },
		// 获取导弹的属性
    getBulletAttr: function (ev, screen) {
			var parOffset = this.$data.parOffset
      var x = ev.pageX - parOffset.left + 14
      var y = ev.pageY - parOffset.top + 14
      var rx = Math.abs(screen.w / 2 - x)
      var ry = Math.abs((screen.h - y / 10) - y)
			if (x > (screen.w / 2)) {
				rx = rx
				ry = ry - 14
			}
      var dirX = x > (screen.w / 2) ? 1 : -1
      var dirY = y > (screen.h - 45) ? -1 : 1
      var prop = (rx / ry).toFixed(2)
      var radian = Math.atan(prop)
      var angle = radian * 360 / 2 / Math.PI

      return {
        dirX: dirX,
        dirY: dirY,
        prop: prop,
        radian: radian,
        angle: angle
      }
    }
	}

  $.extend({
    Battery: Battery
  })

})()
