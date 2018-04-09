/**
 * 村镇数据查询条件搜索组件
 */
module.exports = () => {
    //获取村镇数据
    let initData = require(C.JS_VIEW + 'init/town');
    let cacheDataFn = require(C.JS_VIEW + 'other/data');
    let cacheDataTown = cacheDataFn.FindCache(C.TOWN);
    if (cacheDataTown) initData.town_list = cacheDataTown.town_list;
    //搜索数据
    initData.searchJson = {
        item_count: 10,
        //镇id
        town_id: '',
        //村ID
        village_id: '',
        //贫困属性
        property: -1,
        //享受政策
        solution: -1,
        types: -1,
        //脱贫状态
        status: -1,
        //姓名
        family_name: '',
        //证件号
        id_card: '',
    };
    //显示的值
    initData.show = {
        town: '所有乡镇',
        village: '请选择'
    };
    //村数据结构
    initData.village = [];
    //设置Vue组件
    Vue.component('wang-search', {
        data() {
            return initData;
        },
        created() {
            cacheDataFn.GetData(C.TOWN, null, data => this.town_list = data.town_list);
        },
        //选择列表的显示隐藏
        mounted() {
            let classNames = '.sel-country,.poor-village,.poor-property,.poor-policy,.poor-status';
            let uls = $('.poor-middle-sel ul');
            let isShow = {};
            $(document).on('click', classNames, function() {
                let oSpan = $(this);
                let ul = oSpan.children('ul');
                let bottom = -(ul.height() + 2);
                uls.css('display', 'none');
                ul.css({ 'bottom': bottom, 'display': isShow[ul[0].className] ? 'none' : 'block' });
                isShow[ul[0].className] = !isShow[ul[0].className];
            });

            $(document).on('click', 'body', function(event) {
                let element = event.target;
                let clasNamesArr = classNames.split(',');
                let status = false;
                for (let val of clasNamesArr) {
                    val = val.replace(/\./, '');
                    if (element.classList.contains(val) || element.parentNode.classList.contains(val)) {
                        status = true;
                        break;
                    }
                };

                if (status) return;

                uls.css('display', 'none');
            });

            //贫困属性等选择
            $('.poor-property li,.poor-policy li,.poor-status li').click(function() {
                let $parent = $(this).parent();
                let $oSpan = $parent.siblings('span');
                let jsonName = $parent[0].dataset.type;
                initData.searchJson[jsonName] = this.dataset._id;
                $oSpan.html($(this).html());
            });
        },
        methods: {
            //选择镇
            selTown(village) {
                initData.searchJson.town_id = village._id;
                this.show.town = village.town_name;
                this.village = village.vill_list;
                //修改村的显示值 与 id
                this.show.village = '请选择';
                initData.searchJson.village_id = '';
            },
            //选择村
            selVillage(village) {
                initData.searchJson.village_id = village.v_id;
                this.show.village = village.v_name;
            },
            //搜索按钮
            search() {
                this.$emit('search', this.searchJson);
            }
        },
        template: `
            <section class="poor-middle-sel poor-middle-intro">
                <div class="sel-country">
                    <span>{{show.town}}</span>
                    <ul class="sel-country-list">
                        <li @click="selTown({_id:'',town_name:'所有乡镇',vill_list:[]})">所有乡镇</li>
                        <li v-for="(item,index) in town_list" @click="selTown(item)">{{item.town_name}}</li> 
                    </ul>
                </div>
                <div class="poor-village">
                    <span>{{show.village}}</span>
                    <ul class="poor-village-list">
                        <li v-if="!village.length">无</li>
                        <li v-else v-for="(item,index) in village" @click="selVillage(item)">{{item.v_name}}</li>
                    </ul>
                </div>
                <div class="poor-property">
                    <span>脱贫属性</span>
                    <ul class="poor-property-list" data-type="property">
                        <li data-_id="-1">全部属性</li>
                        <li data-_id="1">一般贫困户</li>
                        <li data-_id="2">低保户</li>
                        <li data-_id="3">五保户</li>
                        <li data-_id="4">低保贫困户</li>
                        <li data-_id="5">一般农户</li>
                        <li data-_id="6">五保贫困户</li>
                    </ul>
                </div>
                <div class="poor-policy">
                    <span>享受政策</span>
                    <ul class="poor-policy-list" data-type="solution">
                        <li data-_id="-1">全部政策</li>
                        <li data-_id="0">产业帮扶</li>
                        <li data-_id="1">易地扶贫</li>
                        <li data-_id="2">生态补偿</li>
                        <li data-_id="3">发展教育</li>
                        <li data-_id="4">民政兜底扶持</li>
                        <li data-_id="5">医疗保障</li>
                        <li data-_id="6">就业扶持</li>
                        <li data-_id="7">财政金融扶贫</li>
                        <li data-_id="8">危房改造</li>
                        <li data-_id="9">村基础设施</li>
                    </ul>
                </div>
                <div class="poor-status">
                    <span>脱贫状态</span>
                    <ul class="poor-status-list" data-type="status">
                        <li data-_id="-1">全部状态</li>
                        <li data-_id="0">未脱贫</li>
                        <li data-_id="1">已脱贫</li>
                        <li data-_id="2">预脱贫</li>
                        <li data-_id="3">返贫</li>
                    </ul>
                </div>
                <div class="poor-name">
                    <input v-model="searchJson.family_name" class="wang-user-name" type="text" placeholder="贫困户姓名" />
                </div>
                <div class="poor-card">
                    <input v-model="searchJson.id_card" class="wang-user-code" type="text" placeholder=" 贫困户证件号码" />
                </div>
                <img @click="search" class="wang-search-btn-poor" src="../static/images/icon/icon_search_normal.png" />
            </section>
        `
    });

};