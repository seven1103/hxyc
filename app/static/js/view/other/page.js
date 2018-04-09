/**
 * 创建分页
 */
let Page = {
    pageInit: function(option) {
        //当前页数
        option.curPage = option.curPage || 1;
        //总页数
        option.countPage = option.countPage || 1;
        //分页按妞最大数 默认5
        option.pageSize = option.pageSize || 5;
        //按妞选中时的样子
        option.activeClass = option.activeClass || 'span-active';
        //创建DOM
        this.pageCreateHtml(option);
    },
    pageCreateHtml: function(option) {
        var _this = this;
        //prev
        var oImgPrev = new Image();
        //next
        var oImgNext = new Image();
        //home
        var homeSpan = document.createElement('span');
        //content
        var oAbbr = document.createElement('abbr');
        //countPagrNum
        var oA = document.createElement('a');
        var fargment = document.createDocumentFragment();
        homeSpan.innerText = '首页';
        oImgPrev.src = '../static/images/help08.png';
        oImgPrev.classList.add('pre-img');
        oImgNext.src = '../static/images/help07.png';
        oImgNext.classList.add('next-img');
        oA.innerText = '共' + option.countPage + '页';
        //保持当前页码在中间部分 开始显示的页码往后顺延2个数
        var pageSplit = option.curPage - Math.ceil(option.pageSize / 2);
        var initPage = pageSplit + 1;
        var endPage;
        //如果开始显示页码小于1则从1开始显示
        initPage = initPage < 1 ? 1 : initPage;
        //结束页码等于 开始页码 + 按妞数
        endPage = initPage + option.pageSize;
        //结束页码是否大于总页数
        if (endPage > option.countPage) {
            endPage = option.countPage + 1;
            initPage = endPage - option.pageSize;
            initPage = initPage < 1 ? 1 : initPage;
        };
        //创建按妞
        for (var i = initPage; i < endPage; i++) {
            if (i > option.countPage) break;
            var oSpan = document.createElement('span');
            oSpan.innerText = i;
            if (i == option.curPage) oSpan.classList.add(option.activeClass);
            oAbbr.appendChild(oSpan);
            oSpan.onclick = function() {
                _this.pageClickEvent.call(this, option);
            };
        };

        //添加分割按妞月以及最后一页
        var splitBtn = document.createElement('span');
        var lastPageBtn = document.createElement('span');
        splitBtn.innerText = '....';
        lastPageBtn.innerText = option.countPage;
        //判断是否有需要添加
        if (initPage < option.countPage - option.pageSize + 1) {
            oAbbr.appendChild(splitBtn);
            oAbbr.appendChild(lastPageBtn);
        };

        //添加到容器
        fargment.appendChild(homeSpan);
        fargment.appendChild(oImgPrev);
        fargment.appendChild(oAbbr);
        fargment.appendChild(oImgNext);
        fargment.appendChild(oA);
        option.container.innerHTML = '';
        option.container.appendChild(fargment);
        //绑定点击事件
        homeSpan.onclick = oImgPrev.onclick = oImgNext.onclick = lastPageBtn.onclick = function() {
            _this.pageClickEvent.call(this, option)
        };

        //      homeSpan.onclick = function(){
        //      	_this.pageClickEvent.call(this,option);
        //      };
    },
    pageClickEvent: function(op) {
        var targetPage = 0;
        if (this.classList.contains(op.activeClass)) return;
        //判断是否上下页按妞
        if (this.tagName == 'IMG') {
            if (this.classList.contains('pre-img')) {
                //上一页
                var n = op.curPage - 1;
                targetPage = n < 1 ? 1 : n;
            } else {
                //下一页
                var n = op.curPage + 1;
                targetPage = n > op.countPage ? op.countPage : n;
            };
        } else {
            targetPage = parseInt(this.innerText) == NaN ? 1 : parseInt(this.innerText);
        };
        op.curPage = targetPage;
        Page.pageInit(op);
        op.click && op.click.call(this, op.curPage);
    }
};

module.exports = Page;