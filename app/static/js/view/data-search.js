module.exports = () => {
    //初始化Vue 准备初始数据，后期初始数据将使用缓存
    let initData = require(C.JS_VIEW + 'init/data-search');
    let cacheDataFn = require(C.JS_VIEW + 'other/data');
    //读取缓存
    let cacheDataTown = cacheDataFn.FindCache(C.TOWN, true);
    let cacheDataInfo = cacheDataFn.FindCache(C.DATAINFO);
    if (cacheDataTown) initData.town = cacheDataTown;
    if (cacheDataInfo) initData.info = cacheDataInfo;
    //保存原始村镇列表数据
    let oldListData = JSON.parse(JSON.stringify(initData.town));
    //添加额外字段
    initData.search_keyword = '';
    let vue = new Vue({
        el: '.vue-content',
        data() {
            return initData;
        },
        methods: {
            //详情
            showDetail(event, id) {
                let target = event.target;
                let subJson = {};
                let name = target.tagName === 'A' ? 'town_id' : 'village_id';
                subJson[name] = id;
                W.LoadingBox();
                cacheDataFn.GetData(C.DATAINFO, subJson, data => vue.info = data, 'POST', true);
                curActive(target);
            },
            //搜索
            search() {
                let subJson = { village_name: this.search_keyword };
                W.LoadingBox();
                cacheDataFn.GetData(C.TOWN, subJson, data => vue.town = data, 'POST', true, true);
            },
            //村数据下拉回收
            down: slideToggle
        },
        mounted() {
            etEcharts.call(this);
        },
        watch: {
            "search_keyword" (newVal, oldVal) {
                //使用原始数据，
                //为什么原始数据要parse,又要stringify 吃多了没事干转来转去
                //因为直接绑到vue对象上 vue会污染原始数据，这时候是个 引用关系
                //转换过之后就是赋值关系
                if (!newVal) this.town = JSON.parse(JSON.stringify(oldListData));
            },
            "info.proportion": etEcharts,
            "info.poor_reason": etEcharts,
            "info.policy": etEcharts
        }
    });

    //加载服务器数据
    cacheDataFn.GetData(C.TOWN, null, data => {
        vue.town = data;
        //保存原始数据
        oldListData.town = JSON.parse(JSON.stringify(data));
        //默认加载第一个镇的数据
        let subJson = { town_id: data.town_list[0]._id };
        cacheDataFn.GetData(C.DATAINFO, subJson, data => vue.info = data, 'POST', true);
    }, 'POST', true, true);

    //加载图表
    function etEcharts() {
        //贫困结构比例,致贫原因，政策帮扶信息比例图 init
        let echartsPoor = echarts.init(document.querySelector('#searchScale'));
        let echartsWhy = echarts.init(document.querySelector('#searchWhy'));
        let echartsHelp = echarts.init(document.querySelector('#searchHelp'));
        //读取图表配置初始数据 option
        let echartsPoorInit = require(C.JS_VIEW + 'echarts/echarts-proportion')(this.info.proportion);
        let echartsWhyInit = require(C.JS_VIEW + 'echarts/echarts-why')(this.info.poor_reason);
        let echartsHelpInit = require(C.JS_VIEW + 'echarts/echarts-help')(this.info.policy);
        //加载
        echartsPoor.setOption(echartsPoorInit);
        echartsWhy.setOption(echartsWhyInit);
        echartsHelp.setOption(echartsHelpInit);
        //重置
        echartsPoor.resize();
        echartsWhy.resize();
        echartsHelp.resize();
    };

    //下拉回收
    function slideToggle(event) {
        let target = W.GetParent('span', event.target);
        let content = target.parentNode.querySelector('ul');
        $(content).stop().slideToggle();
        $(target).hide(0).siblings('span').show(0);
    };
    //当前村镇高亮
    function curActive(target) {
        //TODO 高亮当前村镇
        let className = 'wang-active-color';
        //清除原来的高亮
        let doms = document.querySelectorAll('.left-address-list>li');

        doms.forEach(element => {
            element.querySelector('a').classList.remove(className);
            $('li', element).removeClass(className);
        });

        if (target.tagName === 'LI') {
            target.parentNode.parentNode.querySelector('a').classList.add(className);
        };
        target.classList.add(className);
    };
};