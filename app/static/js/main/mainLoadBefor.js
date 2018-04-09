/**
 * @在main.html加载之前预加载的JS可被main.html中的JS引用
 */
const { remote, ipcRenderer } = require('electron');
//当前窗口
const curWindow = remote.getCurrentWindow();
//获取配置
global.C = curWindow.setting;
//自定义类库
global.W = require(C.JS + 'functions');
//文件模块
const fs = require('fs');
//读取文件
let temppath = W.ReplacePath(C.VIEW + W.GetFileName());
let html = fs.readFileSync(temppath).toString();
let zIndex = -1;
window.addEventListener('DOMContentLoaded', () => {
    document.write(html);
    //准备webviews
    require(C.JS_MAIN + 'webviews')(fs, curWindow);
    //public.js
    require(C.JS_MAIN + 'public')();
});
//监听显示
ipcRenderer.on('showWindow', (event, arg, emitId) => {
    let viewId = arg.targetView;
    let webView = document.getElementById(viewId);
    let temp = curWindow.temps[viewId];
    let contents = webView.getWebContents();
    if (!temp) {
        showView(arg);
        return;
    };
    //通过投放JS脚本执行渲染子窗口
    let script = 'document.write(`' + temp + '<script>require(' + "(C.JS_MAIN + 'public')" + ')()<\/script>`);';
    contents.executeJavaScript(script, false, function() {
        showView(arg);
        curWindow.temps[viewId] = null;
    });

    //showView
    function showView(arg) {
        //状态，用于表明此页面已经被渲染过
        webView.dataset.status = 1;
        webView.style.zIndex = ++zIndex;
        webView.style.animationDuration = arg.duration;
        //设置进入时的动画效果,为了方便后退的动画
        webView.dataset.in = arg.in;
        webView.dataset.duration = arg.duration;
        //是否打开调试窗口 如果主窗口开发者模式为false 则打开窗口时设置调试窗口无效
        C.WINDOW.dev && arg.dev && webView.openDevTools();
        setTimeout(() => {
            //清除动画
            webView.classList.remove(arg.in);
            //发送显示完毕回调
            ipcRenderer.sendTo(emitId, 'showed', viewId);
            //延迟动画事件 + 100毫秒执行回调
        }, parseInt(arg.duration) + 100);
    };
});

//关闭窗口 （后退）
ipcRenderer.on('backWindow', (event, arg) => {
    //TODO 如果zIndex == -1 那么证明已经是main.html 执行退出app
    if (zIndex <= -1) {
        ipcRenderer.send('exitApp');
        return;
    };
    //查找状态为当前的webView
    let webviews = document.querySelectorAll('webview');
    let curWebView = null;
    for (let i = 0; i < webviews.length; i++) {
        if (webviews[i].style.zIndex == zIndex) {
            curWebView = webviews[i];
            break;
        };
    };
    if (!curWebView) return;
    let dataset = curWebView.dataset;
    let _in = dataset.in;
    let duration = dataset.duration;
    let out = _in.replace(/(In)/, 'Out');
    let backZindex = zIndex - 2 > -1 ? -1 : zIndex - 2;
    zIndex--;
    curWebView.classList.add(out);

    setTimeout(() => {
        curWebView.style.zIndex = backZindex;
        curWebView.style.opacity = 0;
        curWebView.dataset.isCur = 'hide';
        //清除动画
        curWebView.classList.remove(out);
        //延迟动画事件 + 100毫秒执行回调
    }, parseInt(duration) + 100);
});

ipcRenderer.on('rendered', (event, arg) => {
    let id = W.GetFileName({ url: arg, isSuffix: true });
    if (id == 'main') return;
    let webView = document.getElementById(id);
    let _in = webView.dataset.in;
    webView.style.zIndex = ++zIndex;
    webView.style.opacity = 1;
    webView.style.animationDuration = arg.duration;
    webView.classList.add('animated');
    webView.classList.add(_in);
});