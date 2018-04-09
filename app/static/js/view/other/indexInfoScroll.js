/**
 * 针对首页右侧的滚动功能
 */
class Banner {
    //初始化
    constructor(op) {
        this.op = op;
        this.err = '';
        this.dom = null;
        if (!this.op) {
            this.err = 'option is null';
        } else if (!this.op.container) {
            this.err = 'option.container is null';
        } else if (!(this.dom = document.querySelector(this.op.container))) {
            this.err = 'container is null';
        };

        if (this.err) {
            console.error(this.err);
            return;
        };
        this.scrollTimer = null;
        this.scrollDoms = null;
        this.initPosition = 0;
        this.direction = this.op.direction || 'level';
        this._Arrangement();
    };
    //滚动准备
    _Arrangement() {
        let self = this;
        let itemNode = self.dom.querySelectorAll('.wang-banner-item');

        if (!itemNode.length) return;
        self.itemWH = itemNode[0].clientHeight;
        //设置高度
        self.dom.style.height = itemNode.length > 8 ? 8 * self.itemWH : itemNode.length * self.itemWH + 'px';

        let containerH = self.dom.offsetHeight;
        let containerWH = self.dom.offsetHeight;

        self.showNum = containerWH / self.itemWH;
        self.itemPosition = containerH - self.itemWH;

        //设置位置
        itemNode.forEach(function(item, index) {
            if (index < self.showNum) {
                item.style.top = self.itemPosition - (self.itemWH * index) + 'px';
            } else {
                self.initPosition = -self.itemWH;
                item.style.top = self.initPosition + 'px';
            };
        });
        //如果只有n子节点那就啥都不干了 不用动\
        if (itemNode.length <= 8) return;
        //滚动
        self.scrollTimer = setInterval(function() {
            self._Scroll.call(self);
        }, self.op.duration);
    };
    //滚动
    _Scroll() {
        let self = this;
        self.scrollDoms = this.dom.querySelectorAll('.wang-banner-item');

        self.scrollDoms.forEach(function(element, index) {
            if (index < (self.showNum + 1)) {
                element.style.transition = self.op.transition + 'ms';
                element.style.top = element.offsetTop + self.itemWH + 'px';
                if (!index) self._Back(element);
            };
        });
    };
    //归位
    _Back(element) {
        //克隆一个节点
        let self = this;
        setTimeout(function() {
            if (element.offsetTop >= self.dom.clientHeight) {
                let newElement = element.cloneNode(true);
                newElement.style.top = (self.initPosition || -element.clientHeight) + 'px';
                element.parentNode.appendChild(newElement);
                element.parentNode.removeChild(element);
            };
        }, (self.op.transition + 100));
    };
    //停止
    Stop() {
        clearInterval(this.scrollTimer);
    };
    //开始
    Start() {
        this._Arrangement();
    };
};

module.exports = Banner;