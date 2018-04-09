/**
 * @main 入口文件
 */
const C = require('./config');
const { app, BrowserWindow, remote, ipcMain, ipcRenderer, webContents } = require('electron');
const url = require('url');
const path = require('path');
let mWindow = null;
/**
 * 设置全局共享数据
 */
global.setVal = {
    poorTypes: -1
};
/**
 * 监听app初始化完成
 */
app.once('ready', () => {
    //创建主窗口
    mWindow = new BrowserWindow(C.WINDOW);
    //开发者模式
    C.WINDOW.dev && mWindow.webContents.openDevTools();
    //是否全屏
    mWindow.setFullScreen(C.WINDOW.fullscreen);
    //加载主页面
    mWindow.loadURL(`file://${C.VIEW}/main.html`);
    //添加设置
    mWindow.setting = C;
    /**
     * 监听window可以显示
     */
    mWindow.once('ready-to-show', () => mWindow.show());
    //禁止重复运行程序
    const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
        if (mWindow) {
            if (mWindow.isMinimized()) mWindow.restore();
            mWindow.focus();
        };
    });
    //如果程序已经存在则退出
    if (shouldQuit) {
        app.quit();
    };
});
/**
 * 监听所有窗口都被关闭则退应用
 */
app.once('window-all-closed', () => app.quit());

/**
 * 监听事件转发
 */

ipcMain.on('eventForward', (event, eventName, arg) => {
    const webs = webContents.getAllWebContents();
    let targetView = null;
    let sendArgments = null;
    //查找main.html的 webContents
    for (var i = 0; i < webs.length; i++) {
        if (webs[i].history.length && webs[i].history[0].indexOf('main.html') != -1) {
            targetView = webs[i];
            break;
        };
    };

    switch (eventName) {
        case 'showWindow':
            sendArgments = event.sender.id;
            break;
    };
    targetView.send(eventName, arg, sendArgments);
});

ipcMain.on('setGlobalVar', (event, arg) => {
    global.setVal = {
        poorTypes: arg || -1
    };
});