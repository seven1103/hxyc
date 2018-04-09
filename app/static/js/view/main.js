module.exports = () => {
    //设置验证码
    let verify = W.CreateCode();
    let v_code = verify.code;
    const { remote } = require('electron');
    //设置默认数据
    let loginJson = {
        username: '',
        password: '',
        verify: '',
        verify_base64: verify.base64
    };

    let vue = new Vue({
        el: '.vue-content',
        data: loginJson,
        methods: {
            //切换验证码
            changeVerify() {
                verify = W.CreateCode();
                this.verify_base64 = verify.base64;
                v_code = verify.code;
            },
            //登陆按钮
            login() {
                let message = '';
                if (!this.username) {
                    message = '请输入用户名';
                } else if (!this.password) {
                    message = '请输入密码';
                } else if (!this.verify) {
                    message = '请输验证码';
                } else if (this.verify != v_code) {
                    message = '验证码错误';
                };
                if (message) {
                    W.DiaLog({ message: message });
                    this.changeVerify();
                    return;
                };
                let subJson = {
                    username: this.username,
                    password: this.password
                };
                //发送登陆请求
                sendLogin(subJson);
            }
        }
    });

    let sendLogin = subJson => {
        W.LoadingBox();
        $.ajax({
            url: C.LOGIN,
            data: subJson,
            type: 'post',
            dataType: 'json',
            success(res) {
                W.LoadingBox('hide');
                if (res.code) {
                    W.DiaLog({ message: res.result.msg + ',code:' + res.code });
                    return;
                };
                //TODO 登陆成功后需要保存地区ID
                W.ShowView({ url: 'index.html', dev: true });
                //保存地区信息
                W.SetStorage('region_info', res.result);
            }
        });
    };

    //头部，左侧菜单栏hover事件
    let status = {};
    $('#leftNav,#opt_panel_box').hover(menuShowHide, menuShowHide);

    //头部与左侧的显示隐藏
    function menuShowHide() {
        let webviews = document.querySelectorAll('webview');
        let isShow = false;
        //判断主页面是否显示层级最高 如果是那么不响应菜单
        for (let view of webviews) {
            if (this.id != 'leftNav' || view.dataset.status == 1) {
                isShow = true;
                break;
            };
        };
        if (!isShow) return;
        let element = this.id == 'leftNav' ? 'navlook' : 'opt_panel';
        let childDiv = this.querySelector('.' + element);
        let method = this.id == 'leftNav' ? 'left' : 'top';
        let methodJson = {};
        methodJson[method] = (status[this.id] ? -1.4 : 0) + 'rem';
        $(childDiv).stop().animate(methodJson);
        status[this.id] = !status[this.id];
    };

    //菜单高亮定位
    $('.navscoll').css('top', $('#nav_list li').eq(0).offset().top);

    //菜单点击跳转
    $('#nav_list li').click(function() {
        $('#nav_list li').removeClass('active');
        $('.navscoll').css('top', $('#nav_list li').eq($(this).index()).addClass('active').offset().top);
        W.ShowView({ url: this.dataset.link, dev: true });
    });

    //右上角菜单
    const cWindow = remote.getCurrentWindow();
    $('#panel_1_span,#panel_1,.minimizeBtn').click(() => cWindow.minimize());
    $('#panel_2_span,panel_2,.closeBtn').click(() => cWindow.close());

    //监听跳转至poor页面左侧菜单栏对应
    remote.ipcMain.on('showPoor', event => {
        $('#nav_list li').removeClass('active');
        $('.navscoll').css('top', $('#nav_list li').eq(2).addClass('active').offset().top);
    });

    /**
     * 开启更新模块 预计检测间隔。每半小时检测一次 调试时 10秒一次 
     * 一旦检测到有更新则停止检测
     */
    let time = C.WINDOW.dev ? 2000 : 60000;
    let version = require(C.ROOT_PATH + '/package.json').version;
    let intvalId = setInterval(update, time);
    let tisp = document.querySelector('.wang-update');
    let desc = tisp.querySelector('.desc');
    let upStatus = tisp.querySelector('.progress-status');
    let progress = tisp.querySelector('progress');
    let zipTotal = tisp.querySelector('.zipTotal');
    let speed = tisp.querySelector('.speed');
    let downPro = tisp.querySelector('.downPro');
    let speedTime = null;
    let tSize = 0;
    let dSize = 0;
    /**
     * 新增更新模块
     */

    //进入时先检测一次

    function update() {
        let Update = require(C.JS_MAIN + 'update');
        $.get(C.GETVERSION, res => up(res, Update), 'json');
    };
    /**
     * 获取远程服务器数据后操作
     * 
     * @param {any} res 
     */
    function up(res, Update) {

        res = res.result;
        if (!res || !res.url) return;
        let up = new Update({
            host: res.url,
            version: res.version_id,
            rootdir: C.ROOT_PATH,
            stateFun: showDwonloadTisp
        });

        /**
         * 设置更新描述 描述字段中 info 以 | 分割多个描述
         */
        let fragment = document.createDocumentFragment();
        let strArr = [];
        if (res.info.indexOf('|') != -1) {
            strArr = res.info.split('|');
        } else {
            strArr = [res.info];
        };
        //遍历
        strArr.forEach((item, index) => {
            let p = document.createElement('p');
            p.innerHTML = (index + 1) + '、' + item;
            fragment.appendChild(p);
        });
        //添加到容器中
        desc.innerHTML = '';
        desc.appendChild(fragment);
        //停止定时器
        if (up._GetVersion(res.version_id) > up._GetVersion(version)) {
            clearInterval(intvalId);
            tisp.style.display = '-webkit-box';
        };
    };
    /**
     * 显示提示框下载进度
     */
    function showDwonloadTisp(state) {
        state.progress = state.progress || downPro.innerHTML;
        state.downSize = state.downSize || 0;
        state.totalSize = state.totalSize || 0;
        //设置下载状态
        upStatus.innerHTML = returnStatus(state.state);
        //设置下载进度条,设置下载进度百分比
        progress.value = state.progress;
        downPro.innerHTML = state.progress;
        //设置总大小
        zipTotal.innerHTML = (state.totalSize / 1024).toFixed(2);
        //设置下载速度
        tSize = state.totalSize;
        dSize = state.downSize;
        calcSpees(state);
        //更新完成提示用户并退出 延迟500毫秒 关闭应用
        if (state.state === 'removed') closeApp();
    };

    /**
     * 计算下载速度
     */
    let dSizes = 0;

    function calcSpees(state) {
        if (speedTime) return;
        speedTime = setInterval(() => {
            if (dSize >= tSize) {
                clearInterval(speedTime);
                speed.innerHTML = 0;
            } else {
                let company = 'KB';
                let s = dSize - dSizes;
                //换算单位
                if (s >= 1024) {
                    company = 'MB';
                    s = (s / 1024).toFixed(2);
                } else {
                    s = s.toFixed(2)
                };
                speed.innerHTML = s + company;
                dSizes = dSize;
            };
        }, 1000);
    };
    /**
     * 返回状态字符串
     */
    function returnStatus(status) {
        let str = '';
        switch (status) {
            case "downstart":
                str = '开始下载';
                break;
            case "downloading":
                str = '正在下载.....';
                break;
            case "downloaded":
                str = '下载完成,准备解压';
                break;
            case "unzipstart":
                str = '正在解压';
                break;
            case "unzipend":
                str = '解压完成';
                break;
            case "removed":
                str = '更新完成，重启后生效';
                break;
        };
        return str;
    };
    /**
     * 退出应用
     */
    function closeApp() {
        setTimeout(() => {
            W.DiaLog({ message: '升级完成，请稍后手动重启打开应用' });
            remote.app.relaunch();
            remote.app.exit();
        }, 500);
    };
    //设置登录界面的版本号
    document.querySelector('.version span').innerHTML = version;
};