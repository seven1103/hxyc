/**
 * 页面上用到的功能封装，与function.js不同 那个文件是整体需要的，而不是现在这个项目需要的
 * 
 * @class Fn
 */
class Fn {

    constructor() {
        this.radioSize = 1;
    };
    /**
     * 创建圆点
     * 
     * @memberof Fn
     */
    CreateRadio(datas, imageDom, container) {
        //获取img原始尺寸，当前尺寸以计算比例
        let naturalWidth = imageDom.naturalWidth;
        let naturalHeight = imageDom.naturalHeight;
        let curWidth = imageDom.offsetWidth;
        let curHeight = imageDom.offsetHeight;
        // let zoom = {
        //     w: parseInt(100 - curWidth / naturalWidth * 100) / 100,
        //     h: parseInt(100 - curHeight / curHeight * 100) / 100
        // };

        let zoom = {
            w: curWidth / naturalWidth ,
            h: curHeight / naturalHeight 
        };

        let fargment = document.createDocumentFragment();
        datas.forEach((item, index) => {
            fargment.appendChild(this._CreateHtml(item, index, zoom));
        });
        //创建
        container.appendChild(fargment);
    };

    _CreateHtml(data, index, zoom) {
        data.length = data.length * this.radioSize;
        let self = this;
        //地区详情内容
        let mapInfo = document.querySelector('.map-wang-areainfo');
        let mapInfoP = mapInfo.querySelectorAll('p');
        //创建父元素以及动画盒子
        let oDiv = document.createElement('div');
        let size = Math.ceil((data.isArea || data.isFixed) ? 10 : 40 * (data.length / 100)) * 3;

        //单独判断彦洞乡 如果是则缩小圆点显示比例
        //let region_id = JSON.parse(window.localStorage.getItem('region_info')).region_id;
        //if(region_id == '522628000000')size /= 5;
        let store = JSON.parse(window.localStorage.getItem('region_info'));
        if(store.change) size /= store.change*0.01;

        let position = this._CalcXY(data, zoom, size);
        let color = this._ReturnColor(data);
        

        let oDivCss = `width:${size}px;height:${size}px;left:${position.x}px;top:${position.y}px;background-color:${color};`;
        //创建动画盒子
        let fargmentChild = document.createDocumentFragment();
        let cssTest = 'height:100%;width:100%;border:1px solid ' + color + ';border-radius: 50%;position: absolute;';
        //固定区域名称不需要地震波
        if (!data.isFixed) {
            for (let i = 1; i < 4; i++) {
                let oDivChild = document.createElement('div');
                oDivChild.classList.add('line' + i);
                oDivChild.style.cssText = cssTest;
                fargmentChild.appendChild(oDivChild);
            };
        };

        //地区需要使用空心圆点
        if (data.isFixed) {
            oDivCss += 'border-color:#38DBDC;background-color:transparent;';
        };
        //父元素属性
        oDiv.className = 'wang-radio-box Map-circle';
        oDiv.style.cssText = oDivCss;
        oDiv.dataset.data = JSON.stringify(data);
        oDiv.dataset.index = index;
        oDiv.appendChild(fargmentChild);

        oDiv.addEventListener('mouseenter', function(event) {
            let target = event.target;
            //修改显示信息内容
            let d = JSON.parse(this.dataset.data);
            mapInfoP[0].innerText = '地区名: ' + d.name;
            mapInfoP[1].innerText = (d.isFixed || d.isArea) ? '' : '贫困发生率: ' + ((d.length / self.radioSize) || 0) + '%';
            mapInfo.style.left = target.offsetLeft + target.offsetWidth + 10 + 'px';
            mapInfo.style.top = target.offsetTop + 'px';
            mapInfo.style.display = 'block';
            //self.createLinkLine(this, mapInfo);
        });
        oDiv.addEventListener('mouseleave', function() {
            //let curCanvas = document.getElementById('canvas_' + this.dataset.index);
            mapInfo.style.display = 'none';
        });

        return oDiv;
    };

    _CalcXY(data, zoom, size) {
        // return {
        //     x: data.x - parseInt(data.x * zoom.w) - (size / 2),
        //     y: data.y - parseInt(data.y * zoom.h) - (size / 2),
        // };
        // return {
        //     x : data.x * zoom.w - (zoom.w * size / 2),
        //     y : data.y * zoom.h - (zoom.h * size / 2)
        // }
        return {
            x : data.x * zoom.w,
            y : data.y * zoom.h
        }
    };

    _ReturnColor(data) {
        if (data.isArea) return '#CE06A8';
        if (data.isFixed) return '#38DBDC';
        return data.length <= (3 * this.radioSize) ? '#38DBDC' : (data.length > (10 * this.radioSize) ? '#C70300' : '#CECF2B');
    };

    //创建canvas连接线 链接信息框 
    createLinkLine(el, areaInfo) {
        //检测所需canvas是否已存在
        var oldCanvas = document.getElementById('canvas_' + el.dataset.index);
        if (oldCanvas) {
            oldCanvas.style.display = 'block';
            return;
        };
        var area_x = areaInfo.offsetLeft; //577
        var area_y = areaInfo.offsetTop; //0
        var area_w = areaInfo.offsetWidth;
        var area_h = areaInfo.offsetHeight;
        var this_x = el.offsetLeft;
        var this_y = el.offsetTop;
        //需要多出来的像素
        var n = 5;
        //canvas所需宽度高度偏移量
        var canvas_w = area_x - this_x - el.offsetWidth + n;
        var canvas_h = this_y - area_y - area_h + n;
        var canvas_x = this_x + el.offsetWidth;
        var canvas_y = area_y + area_h - n;
        //点的坐标
        var cxt_init_x = 0;
        var cxt_init_y = canvas_h;
        //线的坐标
        var cxt_line_x = canvas_w;
        var cxt_line_y = 0;
        //创建画布
        var oCanvas = document.createElement('canvas');
        var cxt = oCanvas.getContext('2d');
        oCanvas.style.position = 'absolute';
        oCanvas.style.zIndex = 10;
        oCanvas.id = 'canvas_' + el.dataset.index;
        oCanvas.width = canvas_w;
        oCanvas.height = canvas_h;
        // oCanvas.style.background = 'red';
        oCanvas.style.left = canvas_x + 'px';
        oCanvas.style.top = canvas_y + 'px';
        cxt.fillStyle = '#FFF';
        //点
        cxt.moveTo(cxt_init_x, cxt_init_y);
        //线
        cxt.lineTo(cxt_line_x + (n * 2), cxt_line_y - (n * 2));
        cxt.lineTo(cxt_line_x + (n * 2), cxt_line_y - n);
        cxt.closePath();
        cxt.fill();
        el.parentNode.appendChild(oCanvas);
    };
}

module.exports = new Fn();