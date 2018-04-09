/**
 * 首页控制模块
 */
module.exports = () => {
    //加载公共运行方法
    let region = JSON.parse(window.localStorage.region_info);
    let fn = require(C.JS_VIEW + 'other/fn');
    let Scroll = require(C.JS_VIEW + 'other/indexInfoScroll');
    let ScrollFn = null;
    let vue = null;
    let first = null;
    //初始化Vue 准备初始数据，后期初始数据将使用缓存
    let initData = require(C.JS_VIEW + 'init/index');
    let cacheDataFn = require(C.JS_VIEW + 'other/data');
    //查找缓存
    let cacheDataIndex = cacheDataFn.FindCache(C.INDEX);
    // let cacheDataWork = cacheDataFn.FindCache(C.WORK);
    //如果缓存存在使用缓存否则使用初始数据
    if (cacheDataIndex) initData.info = cacheDataIndex;
    // if (cacheDataWork) initData.work = cacheDataWork;
    //地图坐标清空补使用缓存
    initData.info.poor_info = [];
    //first = cacheDataWork.work_flow?cacheDataWork.work_flow[0]:{};
    //设置额外字段，用于地图背景
    initData.mapBg = region.map || '../static/images/map_bg.png';
    initData.anaStatus = true;
    //设置图表
    let setEcharts = function(poor_proportion, policy_help, dynamic_data) {

        //贫困结构比例,政策帮扶信息比例图 init
        let echartsPoor = echarts.init(document.querySelector('.eacharts-poor'));
        let echartsHelp = echarts.init(document.querySelector('.eacharts-help'));
        let eachartsGoodsDom = document.querySelectorAll('.eacharts-goods');
        //读取图表配置初始数据 option
        let echartsPoorInit = require(C.JS_VIEW + 'echarts/echarts-poor')(this.info.poor_proportion);
        let echartsHelpInit = require(C.JS_VIEW + 'echarts/echarts-help')(this.info.policy_help);
        //加载
        echartsPoor.setOption(echartsPoorInit);
        echartsHelp.setOption(echartsHelpInit);
        //商品销售数据--这里是个数组可能有多个周的图表
        eachartsGoodsDom.forEach((item, index) => {
            //读取图表配置初始数据 option
            let echartsGoods = echarts.init(document.querySelector('.eacharts-goods-' + index));
            let echartsGoodsInit = require(C.JS_VIEW + 'echarts/echarts-goods')(this.info.dynamic_data[index].week);
            echartsGoods.setOption(echartsGoodsInit);
            echartsGoods.resize();
        });
        //重置
        echartsPoor.resize();
        echartsHelp.resize();
    };
    vue = new Vue({
        el: '.vue-content',
        data() {
            return initData;
        },
        //生命周期：安装完成钩子 这里主要加载图表
        mounted() {
            setEcharts.call(this);
            //设置滚动，右侧分享动态的滚动
            ScrollFn = new Scroll({
                container: '.right-porson-info',
                duration: 3000,
                transition: 300
            });
            //设置右上角信息滚动
            let scrollStatus = true;
            setInterval(() => {
                $('.wang-info-banner li').eq(0).animate({
                    "marginLeft": ('' + (-scrollStatus * 50) + '%')
                }, function() {
                    scrollStatus = !scrollStatus;
                });
            }, 5000);
            //启动拖拽
            
            let Drag = require('./lib/drag-oop');
            //选项
            var option = {
                position:'fixed',
                overflow:'dragBox' 	//true为禁止超出
            };
            //初始化组件
            setTimeout(() => {
                new Drag('drag-obj',option).Drag();
            });
        },
        methods: {
            //地图加载完毕
            mapLoaded(e) {
                //数据，目前使用默认数据，后端弄好后替换变量即可
                let mapContainer = document.querySelector('#map');
                let imgDom = mapContainer.querySelector('img');
                //清除原有的点
                mapContainer.querySelectorAll('.wang-radio-box').forEach(element => {
                    element.parentNode.removeChild(element);
                });
                //重组地图数据
                let mapInfo = this.info.poor_info.map(item => {
                    return {
                        name: item.name,
                        length: item.ratio,
                        y: item.lat,
                        x: item.lng
                    };
                });
                //创建圆点
                fn.CreateRadio(mapInfo, imgDom, mapContainer);
            },
            //重新加载所有数据index_big_data,workflow
            reloadData() {
                W.LoadingBox();
                //加载首页数据
                cacheDataFn.GetData(C.INDEX, null, data => vue.info = data);
                //首次加载右侧数据，这里需要做缓存
                cacheDataFn.GetData(C.WORK, null, data => {
                    vue.work = data;
                    first = data.work_flow[0];
                });
            },
            //数据分析显示隐藏
            avaSlide(event) {
                let $group = $('.ana-item-group');
                $group.slideToggle(150, () => {
                    this.anaStatus = !this.anaStatus;
                });
            },
            //打开贫困户 使用事件转发进行传参，因页面打开一次之后之后再打开将不会再次运行代码使用转发消息做监听
            openPoor(type) {
                let { ipcRenderer } = require('electron');
                //设置主进程全局变量
                ipcRenderer.send('setGlobalVar', type);
                //发送消息
                ipcRenderer.send('reloadListData', type);
                //改变左侧导航栏
                ipcRenderer.send('showPoor');
                W.ShowView({ url: 'poor.html', dev: true });
            },
            //计算头像SRC
            src: W.GetAvatar,
            //格式化日期
            fromAt: W.FormAt
        },
        //监听值的变化 动态修改图表
        watch: {
            "info.poor_proportion" () {
                console.log('数据发生了变化');
                setEcharts.call(this);
            },
            "info.policy_help" () {
                console.log('数据发生了变化');
                setEcharts.call(this);
            },
            "info.dynamic_data" () {
                console.log('数据发生了变化');
                setEcharts.call(this);
            },
            "work.work_flow" () {
                //暂停2秒后继续滚动
                ScrollFn.Stop();
                setTimeout(() => ScrollFn.Start(), 2000);
                console.log('发生了变化');
            },
            "work.information" (newVal, oldVal) {
                console.log(newVal, oldVal);
                //检查哪一个字段更新了
                for (let k in newVal) {
                    if (newVal[k] != oldVal[k]) {
                        console.log(k, '变化了');
                        let dom = $('.wang-' + k);
                        dom.addClass('trans');
                        setTimeout(() => {
                            dom.removeClass('trans');
                        }, 800);
                    };
                };
            },
            //动态的商品变化同步到周交易数据中
            "work.information.sales" (newVal) {
                this.info.dynamic_data[0].goods_sales = newVal;
            },
            "work.information.sales_money" (newVal) {
                this.info.dynamic_data[0].total_sales = newVal;
            },
            //地图坐标
            "info.poor_info" (e) {
                this.mapLoaded();
            }
        }
    });

    //加载首页数据
    cacheDataFn.GetData(C.INDEX, null, data => vue.info = data);
    //首次加载右侧数据，不做缓存//这里需要做缓存
    cacheDataFn.GetData(C.WORK, null, data => {
        vue.work = data;
        first = data.work_flow[0];
    }, 'POST', true);
    //间隔10秒更新一次右侧数据 使用ajax,不使用缓存
    setInterval(() => {
        //需要准备第一条数据的ID 跟 时间戳
        let region_id = W.GetStorage('region_info').region_id;
        let subJson = { region_id: region_id };
        if (first) {
            subJson._id = first._id;
            subJson.timed = first.crate_time;
        };
        $.ajax({
            url: C.WORK,
            data: subJson,
            success(res) {
                console.log('发起了新的请求');
                //这个接口如果报错则不提示任何信息，因为这是间隔请求的
                if (res.code != 0) return;
                //追加新数据
                res.result.work_flow.forEach((item, index) => {
                    vue.work.work_flow.push(item);
                    //设置最新数据的id，create_time
                    if (!index) {
                        //console.log(item);
                        first._id = item._id;
                        first.crate_time = item.crate_time;
                    };
                });
                //替换右上的数据并且监听变化需要使用zoom动画
                vue.work.information = res.result.information;
            }
        });
    }, 60000);
};