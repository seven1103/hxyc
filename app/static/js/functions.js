/**
 * @自用JS类库
 */
class W {
    /**
     * 初始化
     * @param {Object} Config 配置对象
     * @memberof W 导出对象
     */
    constructor() {
        let path = require('path');
        const { remote, ipcRenderer } = require('electron');
        /**
         * remote 渲染进程提供主进程部分方法
         */
        this.remote = remote;
        /**
         * 显示提示框|错误框
         */
        this.dialog = remote.dialog;
        /**
         * 渲染进程发送异步消息方法
         */
        this.ipcRenderer = ipcRenderer;
        this.C = global.C || require(path.resolve(__dirname, '../../') + '/config.js');
    };
    /**
     * 替换路径地址为正斜杠
     * 
     * @param {String} path 路径字符串
     * @memberof W.ReplacePath
     */
    ReplacePath(path = '') {
        return path.replace(/\\/g, '/');
    };
    /**
     * 替换模板中的Javascript标签上的类型
     * 
     * @param {any} html 
     * @returns 
     * @memberof W
     */
    RepLaceJavaScript(html) {
        return html.replace(/language="Javascript_norun"/gi, 'language="Javascript"');
    };
    /**
     * 获取url上的文件名部分
     * @memberof W.FileName
     * @param {Object}  opt [可选]是否截取后缀默认不截取后缀
     */
    GetFileName(opt = {}) {
        let url = opt.url || window.location.href;
        url = this.ReplacePath(url);
        if (!url) {
            console.error('url is null');
            return;
        };
        let urlArr = url.split('/');
        let filename = urlArr[urlArr.length - 1];
        if (opt.isSuffix) {
            filename = filename.split('.')[0];
        };
        return filename;
    };
    /**
     * 显示webView窗口
     * 
     * @param {any} opt.url 目标view
     * @param {any} opt.in  进场动画
     * @param {any} opt.duration 持续时间
     * @param {any} opt.dev 调试窗口
     * @returns 
     * @memberof W
     */
    ShowView(opt) {
        if (!opt.url) {
            console.error('url is not null');
            return;
        };
        //使用默认的打开动画 rotateInUpLeft
        opt.in = opt.in || 'zoomIn';
        opt.duration = opt.duration || 0;

        let viewId = this.GetFileName({ url: opt.url, isSuffix: true });
        let CurrentFileName = this.GetFileName({ isSuffix: true });
        //如果目标页面是自己则不做响应
        if (viewId === CurrentFileName) return;
        //配置参数
        let showViewConfig = {
            targetView: viewId,
            in: opt.in,
            duration: parseInt(opt.duration) + 'ms',
            dev: opt.dev
        };
        //向主进程发送事件转发到主渲染进程
        this.ipcRenderer.send('eventForward', 'showWindow', showViewConfig);
    };
    /**
     * 后退当前窗口，如果当前窗口是main.html 则执行退出应用
     * 
     * @memberof W
     */
    BackView() {
        this.ipcRenderer.send('eventForward', 'backWindow');
    };
    /**
     * 重新加载当前webView
     * 
     * @memberof W
     */
    ReloadPage() {
        this.ipcRenderer.send('reload');
    };
    /**
     * 设置本地储存 以JSON保存
     * 
     * @param {any} name 
     * @param {any} val 
     * @memberof W
     */
    SetStorage(name, val) {
        try {
            val = JSON.stringify(val);
            window.localStorage.setItem(name, val);
        } catch (error) {
            console.error('save error val not JSON');
        };
    };
    /**
     * 读取本地储存返回JSON
     * 
     * @param {any} name 
     * @returns 
     * @memberof W
     */
    GetStorage(name) {
        try {
            return JSON.parse(window.localStorage.getItem(name));
        } catch (error) {
            console.error('get error val not JSON');
        };
    };
    /**
     * 统一封装弹窗
     * 
     * @memberof W
     */
    DiaLog(opt) {
        opt.type = opt.type || 'info';
        this.dialog.showMessageBox(opt);
    };
    /**
     * 生成数字验证码 使用node模块
     * 
     * @returns 
     * @memberof W
     */
    CreateCode() {
        var captchapng = require('captchapng');
        //随机字符串
        let a = 65;
        let b = 90;
        let c = a - b;
        let code = parseInt(Math.random() * 9000 + 1000);
        let png = new captchapng(100, 30, code);
        let img = '';
        png.color(0, 0, 0, 0); // First color: background (red, green, blue, alpha) 
        png.color(80, 80, 80, 255);
        img = png.getBase64();
        return { code: code, base64: 'data:image/png;base64,' + img };
    };
    /**
     * 递归获取指定标签
     * 
     * @param {any} targetname 标签名称 li
     * @param {any} target     当前元素
     * @returns 
     * @memberof W
     */
    GetParent(targetname, target) {
        targetname = targetname.toLocaleUpperCase();
        let tgname = target.tagName;
        if (targetname === tgname) {
            return target;
        } else if (tgname === 'BODY') {
            return;
        } else {
            return this.GetParent(targetname, target.parentNode);
        };
    };
    /**
     * 格式时间戳
     * 
     * @param {any} time 
     * @memberof W
     */
    FormAt(time) {
        let newDate = new Date(time * 1000);
        let h = newDate.getHours();
        let m = newDate.getMinutes();
        let d = newDate.toLocaleDateString();
        return d + ' ' + h + ':' + m;
    };
    //-------------------分割线，以下方法作用公用方法，以上为辅助功能-----------------------
    /**
     * 等待Loading
     * 
     * @param {any} isShow 
     * @memberof W
     */
    LoadingBox(isShow) {
        isShow = isShow || 'show';
        if (isShow == 'show') {
            var loadingDivBox = document.createElement('div');
            var winWidth = window.innerWidth;
            var winHeight = window.innerHeight;
            var loadingDivBoxCss = 'width:' + winWidth + 'px;height:' + winHeight + 'px;position:fixed;left:0;top:0;z-index:999;background:rgba(0,0,0,0.5)';
            var loadCss = '';
            var html = `
				<div class="loading wang-loading" style="display:none;">
					<div class="loader-inner ball-beat" style="text-align: center;margin-top:-94px">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
			`;
            loadingDivBox.style.cssText = loadingDivBoxCss;
            loadingDivBox.classList.add('wang-loading-box');
            loadingDivBox.innerHTML = html;
            document.body.appendChild(loadingDivBox);
            //居中
            let loadingCenter = loadingDivBox.querySelector('.wang-loading');
            let t = (loadingDivBox.offsetHeight - loadingCenter.offsetHeight) / 2;
            loadingCenter.style.marginTop = (t) + 'px';
            loadingCenter.style.display = 'block';
        } else {
            if (document.querySelector('.wang-loading-box')) {
                document.body.removeChild(document.querySelector('.wang-loading-box'));
            };
        };
    };
    /**
     * 格式头像路径
     * 
     * @param {any} avatar 
     * @returns 
     * @memberof W
     */
    GetAvatar(avatar) {
        let src = '';
        if (avatar) {
            src = C.IMGHOST + avatar;
        } else {
            src = "../static/images/icon/avator_default.png";
        };
        return src;
    };
    /**
     * 获取性别
     * 
     * @param {any} code 
     * @memberof W
     */
    GetSex(code) {
        return code == 1 ? '男' : (code == 2 ? '女' : '未知');
    };
    /**
     * 处理身份证号
     * 
     * @param {any} code 
     * @memberof W
     */
    GetCard(id_card) {
        return id_card ? id_card.substr(0, 6) + "******" + id_card.substring(id_card.length - 4, id_card.length) : '';
    };
    /**
     * 返回关系
     * 
     * @param {any} code 
     * @memberof W
     */
    GetRel(code) {
        //# 与户主关系: [0=未知/1=户主/2=配偶/3=之子/4=之女/5=之儿媳/6=之女婿/7=之孙子
        //8=之孙女/9=之外孙子/10=之外孙女/11=之父/12=之母/13=之岳父/14=之岳母/15=之公公
        //16=之婆婆/17=之祖父/18=之祖母/19=之外祖父/20=之外祖母/99=其他]
        let relJson = {
            "0": '未知',
            "1": '户主',
            "2": '配偶',
            "3": '之子',
            "4": '之女',
            "5": '之儿媳',
            "6": '之女婿',
            "7": '之孙子',
            "8": '之孙女',
            "9": '之外孙子',
            "10": '之外孙女',
            "11": '之父',
            "12": '之母',
            "13": '之岳父',
            "14": '之岳母',
            "15": '之公公',
            "16": '之婆婆',
            "17": '之祖父',
            "18": '之祖母',
            "19": '之外祖父',
            "20": '之外祖母',
            "99": '其他'
        };
        return relJson[code] || '未知';
    };
    /**
     * 返回贫困户属性
     * 
     * @param {any} code 
     * @memberof W
     */
    GetPro(code) {
        let arr = ['未知', '一般贫困户', '低保户', '五保户', '低保贫困户', '一般农户', '五保贫困户'];
        return arr[code] || '未知';
    };
    /**
     * 返回识别标准
     * 
     * @param {any} code 
     * @memberof W
     */
    GetSta(code) {
        let arr = ['未知', '国家标准', '省定标准', '市定标准'];
        return arr[code] || '未知';
    };
    /**
     * 返回脱贫状态
     * 
     * @param {any} code 
     * @memberof W
     */
    GetStatus(code) {
        let arr = ['未脱贫', '已脱贫', '预脱贫', '返贫'];
        return arr[code] || '未知';
    };
    /**
     * 返回六个一批方案
     * 
     * @param {any} code 
     * @memberof W
     */
    GetSol(code) {
        let arr = ['发展生产', '易地搬迁', '生态补偿', '发展教育', '社会保障', '医疗求助'];
        return arr[code] || '未知';
    };
    /**
     * 返回致贫原因
     * 
     * @param {any} code 
     * @memberof W
     */
    GetCau(code,isEcharts) {
        let arr = ['其他', '因病', '因残', '','因灾', '缺土地', '缺水', '缺技术', '缺劳力', '缺资金', '交通条件落后', '因学'];
        let str = '';
        if(isEcharts){
            str = arr[code];
        }else{
            code = code == -1 ? [] : code;
            code.forEach(item => {
                str += arr[item] + '、';
            });

            str = str.substring(0,str.length-1);
        };
        
        return str || '未知';
    };
    /**
     * 返回户主健康状况
     * 
     * @param {any} code 
     * @memberof W
     */
    GetHea(code) {
        let arr = ['未知', '健康', '长期慢性病', '患有大病', '残疾'];
        return arr[code] || '未知';
    };
    /**
     * 返回文化程度
     * 
     * @param {any} code 
     * @memberof W
     */
    GetEdu(code) {
        let arr = ['未知', '文盲或半文盲', '小学', '初中', '高中', '大专及以上', '学龄前儿童'];
        return arr[code] || '未知';
    };
    /**
     * 返回搬迁可能存在的困难
     * 
     * @param {any} code 
     * @memberof W
     */
    GetDif(code) {
        let arr = ['缺乏资金', '搬迁后找不到工作', '搬迁后生活没着落', '其它'];
        return arr[code] || '未知';
    };
    /**
     * 下拉 回收
     * 
     * @param {any} event 
     * @memberof W
     */
    SlideToggle(event) {
        let target = event.target;
        let content = target.parentNode.parentNode.querySelector('section');
        $(content).stop().slideToggle();
        $(target).hide(0).siblings('img').show(0);
    };
    /**
     * 福利待遇
     * 
     * @param {any} code 
     * @returns 
     * @memberof W
     */
    GetTags(code) {
        let arr = ['包吃', '包住', '五险', '一金'];
        return arr[code] || '';
    };
    /**
     * 处理身份证等字符串，取开始跟结束处其他部分用*替换
     * @param {any} firstLength 开始处 
     * @param {any} lastLength  结束处 
     * @param {any} strLength   星星数 
     * @memberof W
     */
    ReplaceCode(value, firstLength, lastLength, strLength = 4) {
        firstLength = parseInt(firstLength);
        lastLength = parseInt(lastLength);
        firstLength = isNaN(firstLength) ? 0 : firstLength;
        lastLength = isNaN(lastLength) ? 0 : lastLength;
        let argmentsLength = parseInt(firstLength) + parseInt(lastLength);
        let str = '';
        for (let i = 0; i < strLength; i++) { str += '*' };
        //判断是否为空或长度不小于参数的和
        if (!value || value.length < argmentsLength) {
            //console.warn('值为空或长度不足');
            return value;
        };
        //开始获取开始，结束的下标数
        let start = value.substr(0, firstLength);
        let end = value.substr(-lastLength, lastLength);
        return start + str + end;
    };
    /**
     * 等级转换
     */
    GCons(level) {
        let arr= ['一','二','三','四','五'];
        return arr[level] || '无';
    }
};
//导出对象
module.exports = new W();