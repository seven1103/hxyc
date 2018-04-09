module.exports = () => {
    let { remote, ipcRenderer } = require('electron');
    //初始化Vue 准备初始数据，后期初始数据将使用缓存
    let initData = require(C.JS_VIEW + 'init/poor');
    let cacheDataFn = require(C.JS_VIEW + 'other/data');
    let Page = require(C.JS_VIEW + 'other/page');
    //读取缓存
    let cacheDataPlan = cacheDataFn.FindCache(C.PLAN);
    let cacheDataFAMILY_LIST = cacheDataFn.FindCache(C.FAMILY_LIST);
    if (cacheDataPlan) initData.plan = cacheDataPlan;
    if (cacheDataFAMILY_LIST) initData.list = cacheDataFAMILY_LIST;
    let subJson = {
        index_page: 0,
        item_count: 10,
        //镇id
        town_id: '',
        //村ID
        village_id: '',
        //贫困属性
        property: -1,
        //享受政策
        solution: -1,
        //脱贫状态
        status: -1,
        //贫困户状态类型，如老人户等等
        types: remote.getGlobal('setVal').poorTypes || -1,
        //姓名
        family_name: '',
        //证件号
        id_card: '',
        //2017/10/26 该接口添加is_family_list（0:贫困户列表,1：帮扶干部列表）
        is_family_list:0
    };
    //引入条件查询组件
    require(C.JS_VIEW + 'template/search')();
    //处理身份证等方法
    let R = W.ReplaceCode;
    let vue = new Vue({
        el: '.vue-content',
        data() {
            return initData;
        },
        //过滤器
        filters: { R },
        methods: {
            //搜索按钮
            search(params) {
                W.LoadingBox();
                subJson = params;
                params.index_page = 0;
                cacheDataFn.GetData(C.FAMILY_LIST, params, data => {
                    vue.list = data;
                    //清除高亮
                    removeActive();
                    //重置分页按钮
                    Page.pageInit({
                        curPage: 1,
                        countPage: Math.ceil(data.item_page / 10),
                        container: document.querySelector('.page-box'),
                        click: pageClick
                    });
                });
            },
            //点击查看详情
            showDetail(event, id) {
                let tr = W.GetParent('tr', event.target);
                let tBody = tr.parentNode;
                let trs = tBody.querySelectorAll('tr');
                let boxRight = $('.box-right')[0];
                W.LoadingBox();
                trs.forEach(element => {
                    element.classList.remove('wang-active-color-td');
                });
                tr.classList.add('wang-active-color-td');
                //请求详情
                cacheDataFn.GetData(C.FAMILY_INFO, { family_id: id }, data => {
                    if (!boxRight.classList.contains('active')) boxRight.classList.add('active');
                    this.d = data;
                }, 'POST', true);
            },
            //处理头像
            src: W.GetAvatar
        },
        mounted() {
            //分页
            // Page.pageInit({
            //     curPage: 1,
            //     countPage: Math.ceil(this.list.item_page / 10),
            //     container: document.querySelector('.page-box'),
            //     click: pageClick
            // });
        },
        //计算属性
        computed: {
            //重置一些需要格式化的数据，例如性别，学历等
            lists() {
                let newArr = this.list.list.map((item) => {
                    //性别
                    item.sex = W.GetSex(item.sex);
                    //文化程度
                    item.edu = W.GetEdu(item.edu);
                    //贫困属性
                    item.property = W.GetPro(item.property);
                    //脱贫状态
                    item.status = W.GetStatus(item.status);
                    //身份证
                    item.id_card = W.GetCard(item.id_card);
                    return item;
                });
                return newArr;
            },
            //格式详情数据
            detail() {
                //贫困属性等
                this.d.family.property = W.GetPro(this.d.family.property);
                this.d.family.standard = W.GetSta(this.d.family.standard);
                this.d.family.cause = W.GetCau(this.d.family.causes);
                this.d.family.status = W.GetStatus(this.d.family.status);
                this.d.family.martyr_sib = this.d.family.martyr_sib ? '是' : '否';

                //家庭成员
                this.d.members_list.forEach((item, i, arr) => {
                    arr[i].sex = W.GetSex(item.sex);
                    arr[i].id_card = W.GetCard(item.id_card);
                    arr[i].relation = W.GetRel(item.relation);
                });
                return this.d;
            }
        }
    });
    //请求服务器数据
    cacheDataFn.GetData(C.PLAN, null, data => vue.plan = data, 'GET');
    cacheDataFn.GetData(C.FAMILY_LIST, subJson, data => {
        vue.list = data;
        //重置分页
        Page.pageInit({
            curPage: 1,
            countPage: Math.ceil(data.item_page / 10),
            container: document.querySelector('.page-box'),
            click: pageClick
        });
    });

    //分页点击事件
    function pageClick(page) {
        W.LoadingBox();
        subJson.index_page = (page - 1) * 10;
        cacheDataFn.GetData(C.FAMILY_LIST, subJson, data => {
            vue.list = data;
            //清除高亮
            removeActive();
        });
    };

    //清除高亮以及隐藏详情 
    function removeActive() {
        document.querySelectorAll('.poor-table tr').forEach(item => {
            item.classList.remove('wang-active-color-td');
        });
        //隐藏详情
        document.querySelector('.box-right').classList.remove('active');
    };

    // 监听加载新数据
    remote.ipcMain.on('reloadListData', (event, arg) => {
        W.LoadingBox();
        //重置所有提交数据
        subJson = {
            index_page: 0,
            item_count: 10,
            //镇id
            town_id: '',
            //村ID
            village_id: '',
            //贫困属性
            property: -1,
            //享受政策
            solution: -1,
            //脱贫状态
            status: -1,
            //贫困户状态类型，如老人户等等
            types: arg || -1,
            //姓名
            family_name: '',
            //证件号
            id_card: ''
        };
        //发起请求
        cacheDataFn.GetData(C.FAMILY_LIST, subJson, data => {
            vue.list = data;
            //重置分页
            Page.pageInit({
                curPage: 1,
                countPage: Math.ceil(data.item_page / 10),
                container: document.querySelector('.page-box'),
                click: pageClick
            });
        });
    });
};