/**
 * 创建预置的webviews 
 * 将创建view/下的所有.html文件 不会创建public 下的模板文件
 */
module.exports = (fs, curWindow) => {
    // 获取 -> 过滤 -> 加载 -> 创建模板内存 -> 样式 -> 创建 -> 设置
    class PreloadWebviews {
        //获取
        constructor() {
            this._files = [];
            let self = this;
            //创建模板数组
            curWindow.temps = {};
            fs.readdir(C.VIEW, (err, files) => {
                if (err) {
                    console.error('程序出现致命错误,无法加载子页面:' + err);
                    return;
                };
                self._Filter(files);
            });
        };

        //过滤
        _Filter(files) {
            let regExp = /\.html$/;
            let self = this;
            files.forEach((item) => {
                if (regExp.test(item) && item.indexOf('main.html') == -1) self._files.push(item);
            });
            self._Load(self._files);
        };

        //加载
        _Load(files) {
            let self = this;
            let fragment = document.createDocumentFragment();
            let cssText = `
                position:fixed;
                z-index : -1;
                left : 0;
                top : 0;
                opacity:0;
                background:#FFF;
            `;
            let rootCssText = `width:100%;height:100%;`;
            for (let i = 0, j = files.length; i < j; i++) {
                let webview = document.createElement('webview');
                let webviewRoot = webview.shadowRoot.lastChild;
                let tempPath = C.VIEW + files[i];

                self._GetInnerHtml(tempPath);

                //打开node环境
                webview.nodeintegration = true;
                //预加载公用文件
                webview.preload = C.JS_MAIN + '/webview.js';
                webview.style.cssText = cssText + rootCssText;
                //设置webviewRoot样式 实际上webview样式设置这个对象才有效
                webviewRoot.style.cssText = rootCssText;

                webview.id = W.GetFileName({ url: files[i], isSuffix: true });

                webview.src = tempPath;
                //监听停止加载时判断是否为重新加载 如果是则重新运行public
                webview.addEventListener('did-stop-loading', (curView) => {
                    if (curView.target.dataset.status == 1) {
                        let scriptCode = `
                            let sDom = document.createElement('script');
                            sDom.innerHTML = 'require(C.JS_MAIN + "public")()';
                            document.head.appendChild(sDom);
                        `;
                        webview.getWebContents().executeJavaScript(scriptCode);
                    };
                });
                fragment.appendChild(webview);
            };
            document.body.appendChild(fragment);
        };
        //获取文件内容
        _GetInnerHtml(filename) {
            let self = this;
            fs.readFile(filename, (err, html) => {
                self._CompileTemp(html.toString(), filename);
            });
        };
        //编译模板并放置与内存
        _CompileTemp(innerhtml, name) {
            let html = innerhtml;
            html = W.RepLaceJavaScript(html);
            //获取文件名，并去掉后缀
            name = W.GetFileName({ url: name, isSuffix: true });
            curWindow.temps[name] = html;
        };
    };

    new PreloadWebviews();
};