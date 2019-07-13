var GAME_CONFIG = {
	animationTimer: 12,	// 运动计时器
	createFishTime: 700, // 创建鱼的时间
	bulletSpeen: 500, // 导弹速度 500
}

//游戏数据
var GAME_DATA = {
	battery : {
		cannon : ['cannon1.png','cannon2.png','cannon3.png','cannon4.png','cannon5.png','cannon6.png','cannon7.png'],
		bullet : ['bullet1.png','bullet2.png','bullet3.png','bullet4.png','bullet5.png','bullet6.png','bullet7.png'],
		bulletDis : [
						{
						   'img':'web1.png',
						   'scale' : 43,
						   'power' : 1,
						},
						{
						   'img':'web2.png',
						   'scale' : 54,
						   'power' : 1.1,
						},
						{
						   'img':'web3.png',
						   'scale' : 61,
						   'power' : 1.2,
						},
						{
						   'img':'web4.png',
						   'scale' : 86,
						   'power' : 1.3,
						},
						{
						   'img':'web5.png',
						   'scale' : 76,
						   'power' : 1.4,
						},
						{
						   'img':'web6.png',
						   'scale' : 90,
						   'power' : 1.5,
						},
						{
						   'img':'web7.png',
						   'scale' : 110,
						   'power' : 1.6
						},
					]
	},
	fish : [
		{
			'img' : 'fish1.png',
			'class'	: 8,
			'speed' : 14000,
			'degree' : 40,
			'value' : 10,
			'appear' : 22.7,
			'gold' : 'glod-1.png',
			'width': 55,
			'height': 296
		},
		{
			'img' : 'fish2.png',
			'class'	: 8,
			'speed' : 20000,
			'degree' : 34,
			'value' : 20,
			'appear' : 16,
			'gold' : 'glod-2.png',
			'width': 78,
			'height': 512
		},
		{
			'img' : 'fish3.png',
			'class'	: 8,
			'speed' : 25000,
			'degree' : 30,
			'value' : 30,
			'appear' : 14,
			'gold' : 'glod-3.png',
			'width': 72,
			'height': 448
		},
		{
			'img' : 'fish4.png',
			'class'	: 8,
			'speed' : 23000,
			'degree' : 24,
			'value' : 40,
			'appear' : 11,
			'gold' : 'glod-4.png',
			'width': 77,
			'height': 472
		},
		{
			'img' : 'fish5.png',
			'class'	: 8,
			'speed' : 20000,
			'degree' : 20,
			'value' : 50,
			'appear' : 10,
			'gold' : 'glod-5.png',
			'width': 107,
			'height': 976
		},
		{
			'img' : 'fish6.png',
			'class'	: 12,
			'speed' : 15000,
			'degree' : 14,
			'value' : 60,
			'appear' : 8,
			'gold' : 'glod-6.png',
			'width': 105,
			'height': 948
		},
		{
			'img' : 'fish7.png',
			'class'	: 10,
			'speed' : 18000,
			'degree' : 10,
			'value' : 80,
			'appear' : 6,
			'gold' : 'glod-7.png',
			'width': 92,
			'height': 1510
		},
		{
			'img' : 'fish8.png',
			'class'	: 12,
			'speed' : 21000,
			'degree' : 8,
			'value' : 100,
			'appear' : 4,
			'gold' : 'glod-8.png',
			'width': 174,
			'height': 1512
		},
		{
			'img' : 'fish9.png',
			'class'	: 12,
			'speed' : 18000,
			'degree' : 5,
			'value' : 150,
			'appear' : 4,
			'gold' : 'glod-9.png',
			'width': 166,
			'height': 2196
		},
		{
			'img' : 'fish10.png',
			'class'	: 10,
			'speed' : 20000,
			'degree' : 2.5,
			'value' : 180,
			'appear' : 2.2,
			'gold' : 'glod-10.png',
			'width': 178,
			'height': 1870
		},
		{
			'img' : 'fish11.png',
			'class'	: 10,
			'speed' : 18000,
			'degree' : 1.5,
			'value' : 250,
			'appear' : 1.1,
			'gold' : 'glod-11.png',
			'width': 178,
			'height': 1870
		},
		{
			'img' : 'shark1.png',
			'class'	: 12,
			'speed' : 12000,
			'degree' : 1,
			'value' : 300,
			'appear' : 0.6,
			'gold' : 'glod-13.png',
			'width': 509,
			'height': 3240
		},
		{
			'img' : 'shark2.png',
			'class'	: 12,
			'speed' : 13000,
			'degree' : 0.6,
			'value' : 600,
			'appear' : 0.4,
			'gold' : 'glod-14.png',
			'width': 516,
			'height': 3276
		},
	]
}
