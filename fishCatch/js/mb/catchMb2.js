;(function(){
	'use strict';
	//小鱼位置
	var fishXY = [];

	//炮台构造函数
	function Battery(obj,config){
		this.obj = obj;
		this.config = config;
		this.container = $(config.basic,obj);
		this.init();
	};
	//炮台原型
	Battery.prototype = {
		//初始化
		init : function(){
			this.battery = $(this.config.battery,this.container);
			this.add = $(this.config.add,this.container).data('i',0);
			this.plus = $(this.config.plus,this.container).data('i',1);
			this.control = [this.add,this.plus];
			this.score = 200;
			this.scoreShow = $(this.config.score,this.container);
			this.line = $(this.config.line,this.container);
			this.catchAll = $(this.config.catchAll);
			this.bulletAudio = document.getElementById(this.config.audio.bullet);
			this.goldAudio = document.getElementById(this.config.audio.gold);
			this.index = 0;
			this.lineWidth = 0;
			this.lastTime = new Date();
			this.battery.css('background','url(image/'+ gameData.battery.cannon[0] + ')');
			this.setViewPost()
			this.handler();
			this.cowChatch();
		},
		// 配置设备
		setViewPost: function () {
			var $gameWrapper = $('.game-wrapper')
			this.screen = {
				w: $gameWrapper.width(),
				h: $gameWrapper.height()
			}
			$gameWrapper.find('#game-fishMan').css({
				width: this.screen.h,
				height: this.screen.w,
				transform: 'translate3D(0, ' + this.screen.w * -1 + 'px, 0) rotate(90deg)',
				'transform-origin': '0 ' + this.screen.w + 'px',
				'background-size': this.screen.h + 'px ' + (this.screen.h  * 0.75) + 'px'
			})
			this.container.css({
				height: this.screen.h * 0.094 - 2
			})
			this.line.css({
				height: (this.screen.h * 0.094 - 2) * 0.29
			})
			
			// alert((this.screen.h  * 0.75) + 'px ' + this.screen.h + 'px')
			// alert(this.screen.w)
			// alert($gameWrapper.height())
		},
		//炮台事件处理
		handler : function(){
			var This = this;
			//加加减减事件
			$.each(this.control,function(){
				$(this).on('touchstart',function(ev){
					ev.stopPropagation();
					$(this).addClass('active');
					if($(this).data('i')){
						This.index =  (--This.index < 0)?6:This.index--;
					}else{
						This.index ++;
						This.index %=7;
					};
					This.battery.css({
						'background' : 'url(image/'+ gameData.battery.cannon[This.index] + ')',
						'top' : This.index*-2
					});
				}).on('touchend',function(){
					$(this).removeClass('active');
				});
			});
			//打炮事件
			this.obj.on('touchstart',function(ev){
				var nowDate = new Date();
				if(nowDate - This.lastTime<400) return;
				This.lastTime = nowDate;
				var xy = $(this).offset(),
					x = ev.pageX - xy.left,
					y = ev.pageY - xy.top,
					rx = Math.abs(558-x),
					ry = Math.abs(708-y),
					dirX = x>558?1:-1,
					dirY = y>708?1:-1,
					prop = (rx/ry).toFixed(2),
					radian = Math.atan(prop),
					angle = radian*360/2/Math.PI;
				//炮台角度
				This.battery.css('transform','rotate('+dirX*angle+'deg)').addClass('active');
				//分数计算
				This.score -=This.index+1;
				This.scoreShow.text(This.score);
				//导弹
				var $bulletBox = $('<div>'),
					$bullet = new Image();
				$bulletBox.addClass('bullet');
				$bullet = new Image();
				$bullet.src = 'image/' + gameData.battery.bullet[This.index];
				$bulletBox.append($bullet).appendTo(This.obj);
				$bullet.onload = function(){
					var x = 558 + eval((dirX*Math.sin(radian)*60).toFixed(2)),
						y = 708 + eval((dirY*Math.cos(radian)*60).toFixed(2));
					if(prop < 0.78){
						var ty = (dirY ==-1)?-50:818,				//0:768
						tx = dirY ==-1?558+dirX*prop*708:60;
					}else{
						var tx = dirX == 1?1074:-50, 			//1024:0
						ty = Math.floor(y-x/prop);
					}
					$bulletBox.css({'top': y ,'left': x ,'transform':'rotate('+dirX*angle+'deg)'});
					This.collision($($bulletBox),tx,ty,x,y,2500,function(){$bulletBox.remove()});
					this.onload = null;
					This.bulletAudio.play();
				}
			})
		},
		//运动与碰撞检测
		collision : function($bulletBox,tx,ty,x,y,time,fn){
			var fishArr = $('.fish',this.obj),
				startTime = new Date(),
				minsX = tx - x,
				minsY = ty - y,
				This = this,
				timer = setInterval(function(){
					var durTime = new Date - startTime,
						prop = (durTime/time).toFixed(3),
						nowX = prop*minsX + x,
						nowY = prop*minsY + y;
					$bulletBox.css({'left':nowX,'top':nowY});
					for(var i=0;i<fishArr.length;i++){
						var l = fishArr[i].offsetLeft,
							t = fishArr[i].offsetTop,
							w = fishArr[i].offsetWidth,
							h = fishArr[i].offsetHeight*0.6;
						if (nowX>l && nowX<l+w && nowY>t && nowY<t+h){
							clearInterval(timer);
							This.capture($bulletBox,timer,nowX,nowY);
							return;
						}
					}
				if(prop >= 1){
					clearInterval(timer);
					fn();
				}
			},20);
		},
		//捕获事件
		capture : function($bulletBox,timer,nowX,nowY){
			var data = gameData.battery.bulletDis[this.index],
				fishArr = $('.fish',this.obj),
				sX = nowX - data.scale,					//l1
				eX = nowX + data.scale,					//r1
				sY = nowY - data.scale,					//t1
				eY = nowY + data.scale,					//b1
				dis = [],
				This = this;
			$bulletBox.css({'left':sX,'top':sY,'transform':'rotate(0)'}).addClass('dis').find('img').attr('src','image/'+ data.img);
			for(var i=0;i<fishArr.length;i++){
				var l = fishArr[i].offsetLeft,
					t = fishArr[i].offsetTop,
					w = fishArr[i].offsetWidth,
					h = fishArr[i].offsetHeight*0.6;
				//范围检测
				if (sY>t+h||eX<l||eY<t||sX>l+w){
				}else{
					var degree = $(fishArr[i]).data('info').degree,
						power = gameData.battery.bulletDis[this.index].power,
						scale = 100-Math.random()*100;
					if(degree/scale*power>1){
						dis.push(fishArr[i]);
						clearInterval(fishArr[i].timer);
						$(fishArr[i]).addClass('catch');
					}
				}
			}
			if(!dis.length){
				setTimeout(function(){$bulletBox.remove()},1000);
				return;
			}
			setTimeout(function(){
					var sum = 0;
					$.each(dis,function(){
						var info = $(this).data('info');
						if(!info) return;
						if(info) This.score += info.value;
						sum += info.value;
						This.scoreShow.text(This.score);
						$(this).css({'width':142,'height':47}).removeClass().attr('class','gold').find('img').attr('src','image/' + info.gold);
						$(this).animate({'margin-top':-50,'opacity':0},500,function(){
							$(this).remove();
						});
						This.lineWidth += info.value/40;
					})
					This.goldAudio.play();
					$bulletBox.attr('class','coin').css({'left':nowX,'top':nowY}).animate({'width':30,'height':30,'left':230,'top':680,'opacity':0.5},1000,function(){
						$(this).remove();
					}).find('img').attr('src','image/coin'+ (sum<100?1:2) +'.png');
					if(This.lineWidth > 213) {
						This.lineWidth = 213;
						This.line.addClass('active').text('滑动滚轮撒牛网');
					}
					This.line.css('width',This.lineWidth);
			},800)
		},
		//牛式捕捉
		cowChatch : function(){
			var This =this;
			$(window).on('mousewheel',function(){
				if (This.lineWidth < 213) return;
				This.lineWidth = 0;
				This.line.removeClass('active').text('').css('width',0);
				This.catchAll.addClass('active');
				$.each($('.fish',this.obj),function(){
					var fish = $(this),
						info = $(this).data('info').gold;
					$(this).addClass('catch');
					setTimeout(function(){
						This.catchAll.removeClass('active').addClass('end');
						fish.attr('class','coin').css({'width':60,'height':60}).animate({'width':30,'height':30,'left':230,'top':680,'opacity':0.5},1000,function(){
							$(this).remove();
							This.catchAll.removeClass('end');
						}).find('img').attr('src','image/coin'+ (info<100?1:2) +'.png');
						This.goldAudio.play();
					},1000);
				})
			})
		}
	};

	//海鱼构造函数
	function Fish(obj,config){
		this.wrapper = $(config.wrapper,obj)
		this.init();
	};
    //海鱼原型
    Fish.prototype = {
    	//初始化
    	init : function(){
    		// this.prop = cal();		//概率数组
    		this.handler();
    		//创建概率函数
    		// function cal(){
    		// 	var arr = [];
    		// 	for(var i = 0;i<14;i++){
    		// 		arr.push(i*i)
    		// 	}
    		// 	return arr;
    		// }
				var appear = 0
				gameData.fish.forEach(function (item) {
					var nowAppear =  appear + item.appear
					item.appear = nowAppear
					appear = nowAppear
				})
    	},
    	//处理事件
    	handler: function(){
    		// var This = this;
    		// this.cL = setInterval(function(){
    		// 	var createNum = Math.random()*169,
	    	// 		num = $.grep(This.prop,function(value){
	    	// 		return createNum < value;
	    	// 	}).length-1;
    		// 	This.create(gameData.fish[num])},600
    		// );
				var This = this;
    		this.cL = setInterval(function () {
    			var createNum = Math.random() * 100
	    		var	num = $.grep(gameData.fish, function(item){
	    			return createNum > item.appear
	    		}).length
    			This.create(gameData.fish[num])
				}, 600)
    	},
    	//创建小鱼
    	create : function(data){
    		var This = this,
					screenWidth = $('.game-wrapper').width(),
					screenHeight = $('.game-wrapper').height(),
    			rT = Math.floor(Math.random() * (screenWidth * 0.75)),
    			dir = Math.random() < 0.5,
    			Class = data.class,
	    		$fish = $('<div>'),
	    		$fishImg = new Image(),
					viewPortProp = 1000 / screenHeight
    		$fish.addClass('fish fish-'+ Class).data('info',{'degree' : data.degree,'value' : data.value,'gold' : data.gold});
    		$fishImg.src = 'image/' + data.img;
    		$fish.append($fishImg).appendTo(This.wrapper);
    		$fishImg.onload = function(){
    			var iw = this.offsetWidth / viewPortProp,			//容器宽度
    				ih = this.offsetHeight / Class / viewPortProp,	//容器高度
    				it = dir ? -iw : screenHeight + iw,			//初始left
    				tt = dir ? screenHeight + iw : -iw,			//目标始left
    				mt = Math.random() * 400 - 200;
						console.log(Math.min(rT + mt, screenWidth * 0.8))
    			if(!dir) $fish.addClass('reverse');
    			$fish.css({'width':iw,'height':ih,'left':it,'top':rT - ih}).find('img').css('width', iw)
    			This.move($fish,tt,Math.max(rT + mt, screenWidth * 0.2),it,rT - ih,data.speed,function(){$fish.remove()});
    			this.onload = null;
    		}
    	},
    	//海鱼运动
    	move : function($fish,tx,ty,x,y,time,fn){
    		var startTime = new Date()
				var minsX = tx - x
				var minsY = ty - y
			$fish[0].timer = setInterval(function(){
					var durTime = new Date - startTime
					var prop = durTime/time
					var nowX = prop*minsX
					var nowY = prop*minsY
					$($fish).css({'left':nowX + x,'top':nowY + y})
					if(prop >= 1){
						clearInterval($fish[0].timer)
						fn()
					}
			},20);
		}
    };

	//捕鱼达人构造函数
	function FinshMan(obj,config){
		this.game = obj;
		this.config = config;
		this.init();
	};

	//捕鱼达人原型
	FinshMan.prototype = {
		//初始化
		init : function(){
			new Battery(this.game,this.config.basic);
			new Fish(this.game,this.config.fish);
		},
	}
	$.fn.game = function(obj,config){
		new FinshMan(obj,config);
	}
})();
