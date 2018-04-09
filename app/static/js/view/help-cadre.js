module.exports = () => {
    //查看结构
    // $.ajax({
    //         url: C.HELPMEMBER
    //     })
    //初始化Vue 准备初始数据，后期初始数据将使用缓存
    let initData = require(C.JS_VIEW + 'init/help-cadre');
    let cacheDataFn = require(C.JS_VIEW + 'other/data');
    let Page = require(C.JS_VIEW + 'other/page');
    let className = 'wang-active-color';
    //读取缓存
    let cacheDataList = cacheDataFn.FindCache(C.HELPCOM);
    let cacheDataMlist = cacheDataFn.FindCache(C.HELPMEMBER);
    if (cacheDataList) initData.list = cacheDataList;
    if (cacheDataMlist) initData.m_list = cacheDataMlist;
    //console.log(cacheDataMlist);
    //添加额外字段用于搜索
    initData.key_word = '';
    initData.seach_type = 0;
    //用于分页
    initData.pid = '';
    //保存旧数据
    let oldData = JSON.parse(JSON.stringify(initData.list));
    let R = W.ReplaceCode;
    let vue = new Vue({
        el: '.vue-content',
        data() {
            return initData;
        },
        //过滤器
        filters: { R },
        methods: {
            changeType(ele) {
                this.seach_type = ele.target.value;
                console.log(this.seach_type); 
            },
            search() {
                let subJson = { company_name: this.key_word, item_count: 10 };
                W.LoadingBox();
                //判断当前搜索类型
                if(this.seach_type==0){
                     cacheDataFn.GetData(C.HELPCOM, subJson, data => {
                        vue.list = data;
                        companyJson.has_more = data.has_more;
                        companyJson.next_start = data.next_start;
                    }, 'POST', true);
                }else{
                    loadMemberList('keyword','','',this.key_word);
                }
                // cacheDataFn.GetData(C.HELPCOM, subJson, data => {
                //     vue.list = data;
                //     companyJson.has_more = data.has_more;
                //     companyJson.next_start = data.next_start;
                // }, 'POST', true);
                
            },
            showDetail(event, id) {
                // this.key_word = '';
                // initData.pid = id;
                W.LoadingBox();
                loadMemberList(id);
                colorActive(event);
            },
            showRight(event, type, id) {
                let host = '';
                let section_index = 0;
                let subJson = { user_id: id };
                switch (type) {
                    case 'f':
                        //结对贫困户
                        host = C.MEMBBER_FAMILY;
                        section_index = 0;
                        break;
                    case 'g':
                        //商品发布
                        host = C.GOODS;
                        section_index = 1;
                        break;
                    case 'v':
                        //走访次数
                        host = C.VISITS;
                        section_index = 2;
                        break;
                    case 'w':
                        //发布务工
                        host = C.SENDWORK;
                        section_index = 3;
                        break;
                };
                //TODO 显示右侧数据
                W.LoadingBox();
                //关闭所有右侧详情部分,箭头回收
                document.querySelectorAll('.wang-goods-detail').forEach(element => {
                    let spans = element.parentNode.querySelectorAll('.wang-goods-thumbnail-text .hu-price span');
                    if (!spans.length) return;
                    spans[2].style.display = element.style.display = 'none';
                    spans[1].style.display = 'block';
                });
                //获取数据
                cacheDataFn.GetData(host, subJson, data => {
                    /**
                     * 设置同一天的日期只显示一次
                     * update2017/9/5
                     * author:seven
                     */
                    let time = '';
                    data.list.map(item => {
                        let btime = new Date(item.timed * 1000).toLocaleDateString();
                        if (time == btime) {
                            item.timed = null;
                        } else {
                            time = btime;
                        }
                    });

                    vue[type] = data;
                    //显示详情窗口
                    let detailWindows = document.querySelectorAll('.grad3>section');
                    let dWindow = detailWindows[section_index];
                    detailWindows.forEach(element => {
                        element.classList.remove('active');
                    });
                    dWindow.classList.add('active');
                }, 'POST', true);
                thisColor(event);
            },
            //下拉回收 后期待封装
            downUp(event, type) {
                let target = W.GetParent('span', event.target);
                let ul = target.parentNode.querySelector('ul');
                let ulParent = target.parentNode.parentNode.parentNode.querySelectorAll('li ul');
                if (type == 1) {
                    let parent = target.parentNode.parentNode.parentNode.parentNode;
                    ul = parent.querySelector('.wang-goods-detail');
                    ulParent = parent.parentNode.querySelectorAll('.wang-goods-detail');
                };
                //清除所有
                ulParent.forEach(item => $(item).slideUp());
                $(ul).stop().slideToggle();
                $(target).hide(0).siblings('span').show(0);
            },
            GetDel(del) {
                let msg = '';
                if (del.ready == 1) {
                    msg = '有现货';
                } else {
                    let sDate = new Date(del.start * 1000).toLocaleDateString();
                    let eDate = new Date(del.end * 1000).toLocaleDateString();
                    msg = sDate + '至' + eDate;
                };
                return msg;
            },
            GetTags: W.GetTags,
            src: W.GetAvatar,
            GetPro: W.GetPro,
            GetSta: W.GetSta,
            GetCau: W.GetCau,
            GetSex: W.GetSex,
            GetRel: W.GetRel,
            GetEdu: W.GetEdu
        },
        watch: {
            "key_word" (newVal, oldVal) {
                // if (!newVal)
                //     this.list = oldData;
                let subJson = { company_name: this.key_word, item_count: 10 };
                W.LoadingBox();
                //判断当前搜索类型
                if(this.seach_type==0){
                     cacheDataFn.GetData(C.HELPCOM, subJson, data => {
                        vue.list = data;
                        companyJson.has_more = data.has_more;
                        companyJson.next_start = data.next_start;
                    }, 'POST', true);
                }else{
                    loadMemberList('keyword','','',this.key_word);
                }
            }
        },
    });
    //加载单位列表
    // cacheDataFn.GetData(C.HELPCOM, null, data => {
    //     vue.list = data;
    //     oldData = JSON.parse(JSON.stringify(data));
    //     //加载全部的数据
    //     loadMemberList('');
    // }, 'POST', true);

    /**
     * 单位列表分页
     * author：seven
     * date:2017/9/5
     */
    let companyJson = {
        company_name: vue.key_word,
        item_count: 10,
        next_start: '',
        has_more: ''
    };
        //初始加载单位列表
    cacheDataFn.GetData(C.HELPCOM, companyJson, data => {
        vue.list = data;
        oldData = JSON.parse(JSON.stringify(data));
        companyJson.has_more = data.has_more;
        companyJson.next_start = data.next_start;
        //加载全部的数据
        loadMemberList('');
    }, 'POST', true);
    document.querySelector('.left-address-list.help-scroll').addEventListener('scroll', function() {
        if (this.scrollHeight - this.scrollTop === this.clientHeight) {
            if (companyJson.has_more) {
                W.LoadingBox();
                companyJson.company_name = vue.key_word;
                cacheDataFn.GetData(C.HELPCOM, companyJson, data => {
                    W.LoadingBox('hide');
                    vue.list.list = vue.list.list.concat(data.list);
                    oldData = JSON.parse(JSON.stringify(data));
                    companyJson.has_more = data.has_more;
                    companyJson.next_start = data.next_start;
                    //加载全部的数据
                    loadMemberList('');
                }, 'POST', true);
            }
        }
    });
        //分页点击事件
    function pageClick(page) {
        W.LoadingBox();
        if(vue.key_word){
            loadMemberList('keyword', page, true,vue.key_word);
        }else{
            loadMemberList(initData.pid, page, true);
        };
        
    };
    //加载干部列表  keyword可能是空 用于搜索
    function loadMemberList(id, page, isPage,keyword) {
        page = page || 1;
        let subJson = {
            index_page: (page - 1) * 6,
            item_count: 6,
            keyword : keyword || ''
        };

        if(id == 'keyword'){
            subJson.keyword = keyword;
        }else{
            subJson.company_id = id;
        };

        cacheDataFn.GetData(C.HELPMEMBER, subJson, data => {
            vue.m_list = data;
            if (isPage) {
                removeActive();
            } else {
                //重置分页
                Page.pageInit({
                    curPage: 1,
                    countPage: Math.ceil(data.item_count / 6),
                    container: document.querySelector('.page-box'),
                    click: pageClick
                });

                //清除高亮，关闭详情
                removeActive();
            };
        }, 'POST', false);
    };

    //干部高亮 因为结构不同 不好统一使用一个函数，分开写
    function thisColor(event) {
        let target = W.GetParent('p', event.target);
        let pS = target.parentNode.parentNode.parentNode.querySelectorAll('.hover-list p');

        pS.forEach(element => {
            element.classList.remove(className);
        });

        target.classList.add(className);
    };

    //高亮
    function colorActive(event) {
        let target = W.GetParent('li', event.target);

        //清除所有
        let lis = target.parentNode.querySelectorAll('li');

        lis.forEach(element => {
            element.classList.remove(className);
        });
        removeActive();
        target.classList.add(className);
    };
    //清除高亮
    function removeActive() {
        let mLis = document.querySelectorAll('.help-middle-list li');
        let sections = document.querySelectorAll('.grad3 section');
        //清除干部列表所有的高亮
        mLis.forEach(element => {
            element.querySelectorAll('p').forEach(_element => {
                _element.classList.remove(className);
            });
        });

        //关闭所有详情窗口
        sections.forEach(element => {
            element.classList.remove('active');
        });

    };
};
