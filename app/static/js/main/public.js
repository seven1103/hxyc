/**
 * 页面加载完成的时候需要事先准备的事
 */
module.exports = () => {
    const { ipcRenderer, webContents, remote } = require('electron');
    const fs = require('fs');
    const curWindow = remote.getCurrentWindow();
    let filterName = ['javascript:;', 'javascript:void(0)', '#'];
    let filename = W.GetFileName({ isSuffix: true });
    //拦截所有 带有href 或 data-href标签的点击事件做跳转
    document.addEventListener('click', event => {
        let target = event.target;
        let targetConfig = target.dataset;
        let href = target.href || targetConfig.href;

        //过滤
        if (!href) return;
        if (target.href === filterName[0] || target.href === filterName[1] || target.href === filterName[2]) return;
        //阻止默认事件
        event.stopPropagation();
        event.preventDefault();
        target.onclick && target.onclick(event);
        //读取配置
        targetConfig.url = href;
        //显示webView
        W.ShowView(targetConfig);
    }, true);

    //监听body背景图片加载完成
    let backUrl = document.defaultView.getComputedStyle(document.body, null).backgroundImage;
    let imgUrl = (/\"(.*)"/).exec(backUrl);
    let bodyBackgroundImg = new Image();
    imgUrl = imgUrl ? imgUrl[1] : '';
    //背景图片加载完成后通知主渲染进程显示进场动画
    bodyBackgroundImg.onload = bodyBackgroundImg.onerror = () => {
        ipcRenderer.send('eventForward', 'rendered', filename);
    };

    bodyBackgroundImg.src = imgUrl;

    //检测脚本是否存在
    filename = C.JS_VIEW + filename + '.js';
    if (fs.existsSync(filename)) {
        require(filename)();
    };

    //运行common.js
    require(C.JS + 'common.js')();
};