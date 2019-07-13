!(function(){
	'use strict'

  // 鱼
  function Fish (par, screen) {
    this.$data = {
      screen: screen
    }
    this.$el = {
      $par: par
    }
  }

  // 鱼的构造函数
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
          // Game.removeFishData(index)
          $('body').trigger('removeFishData', index)
          this.$el.$fish.remove()
        }
      }
    }
  }

  $.extend({
    Fish: Fish
  })

})()
