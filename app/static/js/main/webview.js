/**
 * 这个文件是所有webview加载之前先加载的文件，用于操作文档加载之前的事
 */
//获取窗口对象
const { remote, ipcRenderer } = require('electron');
//当前窗口对象
global.curWindow = remote.getCurrentWindow();
//获取配置
global.C = curWindow.setting;
//自定义类库
global.W = require(C.JS + 'functions');