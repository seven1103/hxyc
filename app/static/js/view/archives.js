module.exports = () => {
    //初始化Vue 准备初始数据，后期初始数据将使用缓存
    let initData = require(C.JS_VIEW + 'init/archives');
    let cacheDataFn = require(C.JS_VIEW + 'other/data');
    let Page = require(C.JS_VIEW + 'other/page');
    //读取缓存
    let cacheDataPolicy = cacheDataFn.FindCache(C.ARCHIVES);
    let cacheDataFAMILY_LIST = cacheDataFn.FindCache(C.FAMILY_LIST, true);
    if (cacheDataPolicy) initData.policy = cacheDataPolicy;
    if (cacheDataFAMILY_LIST) initData.list = cacheDataFAMILY_LIST;
    //分页时需要使用旧的查询数据
    let oldSearch = '';
    //引入条件查询组件
    require(C.JS_VIEW + 'template/search')();

    //请求服务器数据
    let subJson = {
        index_page: 0,
        item_count: 6,
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
        //姓名
        family_name: '',
        //证件号
        id_card: '',
        is_family_list : 1
    };
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
            search(params) {
                W.LoadingBox();
                subJson = params;
                //设置分页查询数据
                oldSearch = params.family_name;
                params.index_page = 0;
                params.item_count = 6;
                //2017/10/26 该接口添加is_family_list（0:贫困户列表,1：帮扶干部列表）
                params.is_family_list = 1;
                cacheDataFn.GetData(C.FAMILY_LIST, params, data => {
                    vue.list = data;
                    //清除高亮
                    removeActive();
                    //重置分页按钮
                    Page.pageInit({
                        curPage: 1,
                        countPage: Math.ceil(data.item_page / 6),
                        container: document.querySelector('.page-box'),
                        click: pageClick
                    });
                }, 'POST', false, true);
            },
            //点击查看详情
            showDetail(event, id) {
                let li = W.GetParent('li', event.target);
                let lis = li.parentNode.querySelectorAll('li');
                let boxRight = $('.box-right')[0];
                W.LoadingBox();
                lis.forEach(element => {
                    element.classList.remove('active');
                });
                li.classList.add('active');
                //请求详情
                cacheDataFn.GetData(C.FAMILY_INFO, { family_id: id }, data => {
                    if (!boxRight.classList.contains('active')) boxRight.classList.add('active');
                    this.d = data;
                }, 'POST', true);
            },
            //处理头像23
            src: W.GetAvatar,
            //格式化日期
            formAt(timed){
                return new Date(timed * 1000).toLocaleDateString();
            },
            GCons(level) {
                let arr= ['一','二','三','四','五'];
                return arr[level] || '无';
            },
            //搬迁可能的困难
            dif: W.GetDif,
            //详情下拉
            down: W.SlideToggle,
            up: W.SlideToggle
        },
        mounted() {
            //分页
            Page.pageInit({
                curPage: 1,
                countPage: Math.ceil(this.list.item_page / 6),
                container: document.querySelector('.page-box'),
                click: pageClick
            });
        },
        //计算属性
        computed: {
            //格式详情数据
            detail() {
                //贫困属性等
                this.d.family.property = W.GetPro(this.d.family.property);
                this.d.family.standard = W.GetSta(this.d.family.standard);
                this.d.family.cause = W.GetCau(this.d.family.causes);
                this.d.family.solution = W.GetSol(this.d.family.solution);
                this.d.family.status = W.GetStatus(this.d.family.status);
                this.d.family.martyr_sib = this.d.family.martyr_sib ? '是' : '否';

                //家庭成员
                this.d.members_list.forEach((item, i, arr) => {
                    arr[i].sex = W.GetSex(item.sex);
                    arr[i].id_card = W.GetCard(item.id_card);
                    arr[i].relation = W.GetRel(item.relation);
                });

                this.d.solutions = this.d.solutions || {};

                for (let k in this.d.solutions) {
                    this.d.solutions[k].images = this.d.solutions[k].images || [];
                };

                return this.d;
            }
        }
    });

    cacheDataFn.GetData(C.ARCHIVES, null, data => vue.policy = data);
    cacheDataFn.GetData(C.FAMILY_LIST, subJson, data => {
        vue.list = data;
        //重置分页
        Page.pageInit({
            curPage: 1,
            countPage: Math.ceil(data.item_page / 6),
            container: document.querySelector('.page-box'),
            click: pageClick
        });
    }, 'POST', false, true);

    //分页点击事件
    function pageClick(page) {
        W.LoadingBox();
        subJson.family_name = oldSearch;
        subJson.index_page = (page - 1) * 6;
        cacheDataFn.GetData(C.FAMILY_LIST, subJson, data => {
            vue.list = data;
            //清除高亮
            removeActive();
        }, 'POST', false, true);
    };

    //清除高亮以及隐藏详情 
    function removeActive() {
        document.querySelectorAll('.company-middle-list li').forEach(item => {
            item.classList.remove('active');
        });
        //隐藏详情
        document.querySelector('.box-right').classList.remove('active');
    };
};