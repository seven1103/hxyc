/*********
 * 作者：大男人主义
 * 日期：2016-05-25
 * 名称：原生JS元素拖拽插件（兼容IE7+ IE6未测试）
 * 使用方法：
 * 初始化插件 new EffEct();
 * 接收三个参数：
 * 	1、被拖拽元素id。例：new EffEct('box');
 *  2、可选参数：object。例：new EffEct('box',options)
		options.position 如果元素设置定位样式可使用自定义，不选默认为absolute
		options.overflow 可以指定是否限制被拖动元素是否超出用户设置的对象范围，
			true = document,也可以传入某元素id，不传不限制被拖动元素范围
 * 方法：drag()。例：new EffEct().drag();接收callback，程序返回拖动中的元素坐标
 * 版本号1.0  ....待更新，下版本更新多元素拖拽
 ******* */
//构造函数
function EffEct(elemId,obj){
	this.box = document.getElementById(elemId);
	this.options = obj;
};

//原型
EffEct.prototype.Drag = function(callback){
	//获取对象元素定位信息
	this.cssStyle = this.box.currentStyle || window.getComputedStyle(this.box,null);
	//如果用户没穿颇为方式默认 绝对定位
	this.options.position = this.options.position ||'absolute';
	//判断对象元素是否已有定位属性
	if(this.cssStyle.position == 'static'){
		//如果没有定位属性，或为默认，则使用绝对定位
		this.box.style.position = this.options.position;
	};
	
	if(document.getElementById(this.options.overflow)){
		var elem = document.getElementById(this.options.overflow);
		this.box.style.left = elem.offsetLeft+20  + 'px';
		this.box.style.top = elem.offsetTop + elem.offsetHeight + 100 - 20 - this.box.offsetHeight + 'px';
	};
	var evX =0;evY = 0;
	var This = this;
	//注册对象元素的鼠标按下事件
	this.box.onmousedown = function(ev){
		var _this = this;
		ev = ev || window.event;
		evX = ev.clientX - this.offsetLeft;
		evY = ev.clientY - this.offsetTop;
		//鼠标移动
		document.onmousemove = function(ev){
			ev = ev || window.event;
			//动态改变对象元素坐标
			_this.style.left = ev.clientX - evX + 'px';
			_this.style.top = ev.clientY - evY + 'px';
			//判断用户是否启用超出禁止
			if(This.options.overflow){
				var overflow = This.IsOverFlow(This.options.overflow);
				//判断 超出状态是否为真
				if(overflow.state){
					_this.style.left = overflow.left;
					_this.style.top = overflow.top;
				};
			};
			//如果drag()有callback则返回坐标信息给用户
			callback&&callback({x:_this.offsetLeft,y:_this.offsetTop});
			return false;
		};
		//鼠标抬起
		document.onmouseup = function(){
			document.onmousemove = null;
			this.onmouseup = null;
		};
	};
};
//判断对象元素是否超出范围
EffEct.prototype.IsOverFlow = function(off){
	var elem = this.box;
	var left = elem.offsetLeft;
	var top = elem.offsetTop;
	var width = elem.offsetWidth;
	var height = elem.offsetHeight;
	var intX = 0;
	var intY = 0;
	//获取超出对象，如果为对象则使用对象限制拖动元素
	var winScAvaWidth = document.getElementById(off) || window.screen.availWidth;

	var winScAvaHeight = document.getElementById(off) || document.body.offsetHeight;
	//判断是否为对象
	if(isNaN(winScAvaWidth)){
		//初始lrft,top
		intX = winScAvaWidth.offsetLeft + 20;
		intY = winScAvaHeight.offsetTop;
		//限制元素坐标
		winScAvaWidth = winScAvaWidth.offsetWidth + winScAvaWidth.offsetLeft;
		winScAvaHeight = (winScAvaHeight.offsetHeight + 100);
		console.log(winScAvaHeight);
	}
	var state = {state:false};
	//判断对象元素是否超出浏览器窗口右侧
	if(left + width >= winScAvaWidth){
		state.state = true;
		state.left = winScAvaWidth - width + 'px';
		state.top = top<intY?intY + 'px':top;
	};
	//判断对象元素是否超出浏览器窗口左侧
	if(left <= intX){
		state.state = true;
		state.left = intX + 'px';
		state.top = top<intY?intY + 'px':top;
	};
	//判断对象元素是否超出浏览器窗口头部
	if(top <= intY){
		state.state = true;
		//判断拖动对象left是否小于限制对象初始值，是则输出限制对象初始值，否则判断是否超出document宽度
		state.left = left<intX ?intX + 'px':(left + width >= winScAvaWidth?winScAvaWidth - width + 'px':left + 'px');
		state.top = intY + 'px';
	};
	//判断对象元素是否超出浏览器底部
	if(top + height + 20 >= winScAvaHeight){
		state.state = true;
		//判断拖动对象left是否小于限制对象初始值，是则输出限制对象初始值，否则判断是否超出document宽度
		state.left = left<intX?intX + 'px':(left + width >= winScAvaWidth?winScAvaWidth - width + 'px':left + 'px');
		state.top = winScAvaHeight - height - 20 + 'px';
	};
	return state;
};

module.exports = EffEct;


