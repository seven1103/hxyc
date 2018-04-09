module.exports = () => {
    //TODO 这里执行需要操作DOM的代码  注意 到了这里已经是DOM加载完毕了（但不包括link,img等外部资源的完成）
    //这里的代码可能在页面动画完成之前运行
    //计算REM
    let docEle = document.documentElement;
    let width = docEle.clientWidth;
    let height = docEle.clientHeight;
    docEle.style.fontSize = width / 1920 * 100 + "px";
    //设置title 所有页面都是
    let region = JSON.parse(window.localStorage.region_info);
    let header = document.querySelector('.header');
    if (header) {
        let newImg = new Image();
        newImg.onload = () => {
            header.appendChild(newImg);
        };
        newImg.src = region.title_picture || '../static/images/title.png';
    };
    //头部时间
    function displayTime() {
        var elt = document.getElementById("clock"); // 通过id= "clock"找到元素
        var now = new Date(); // 得到当前时间
        var nowDate = now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日';
        elt.innerHTML = '<p style="text-align:center;font-size:0.3rem">' + nowDate + '</p><p style="text-align:center;">' + now.toLocaleTimeString() + '</p>';
        setTimeout(displayTime, 1000); //在1秒后再次执行
    };
    displayTime();
};