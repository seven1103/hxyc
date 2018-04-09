/**
 * 配置文件
 * 
 * @class CONFIG
 */
class CONFIG {
    //初始化类
    constructor() {
        let self = this;
        //本地静态资源路径
        this.ROOT_PATH = __dirname.replace(/\\/g, '/');
        this.STATIC = this.ROOT_PATH + '/static/';
        this.CSS = this.STATIC + 'css/';
        this.IMAGES = this.STATIC + 'images/';
        this.FONTS = this.STATIC + 'fonts/';
        this.JS = this.STATIC + 'js/';
        this.JS_MAIN = this.JS + 'main/';
        this.JS_VIEW = this.JS + 'view/';
        this.VIEW = this.ROOT_PATH + '/view/';
        //主进程窗口配置
        this.WINDOW = {
            title: '精准云帮扶',
            show: false,
            center: true,
            autoHideMenuBar: true,
            dev: false, //调试模式
            fullscreen: true, //全屏
            webPreferences: { //预设
                preload: self.JS_MAIN + 'mainLoadBefor.js',
            }
        };
        //图片远程路径
        this.IMGHOST = 'http://img.cdn.gzhxyc.com/';
        //远程API路径
        //this.HOST = 'https://api-demo-assist.gzhxyc.com/bdata';
        // this.HOST = 'http://192.168.0.184:8880/bdata';
        this.HOST = 'https://api-assist.gzhxyc.com/bdata';
        //登陆
        this.LOGIN = this.HOST + '/login/login/';
        //首页
        this.INDEX = this.HOST + '/index/index_big_data/';
        //首页右侧
        this.WORK = this.HOST + '/index/work_flow/';
        //村镇数据条件查询数据列表
        this.TOWN = this.HOST + '/town/town_list/';
        //贫困户数据统计
        this.PLAN = this.HOST + '/family/plan/';
        //贫困户列表 也是帮扶档案贫困户列表
        this.FAMILY_LIST = this.HOST + '/family/family_list/';
        //贫困户详情 也是帮扶档案贫困户详情
        this.FAMILY_INFO = this.HOST + '/family/info/';
        //帮扶档案统计 —— 左边数据
        this.ARCHIVES = this.HOST + '/family/policy/';
        //乡镇详情
        this.DATAINFO = this.HOST + '/town/data_info/';
        //帮扶单位列表
        this.HELPCOM = this.HOST + '/cadre/company_list/';
        //帮扶干部列表
        this.HELPMEMBER = this.HOST + '/cadre/cadre_list/';
        //帮扶干部发布商品
        this.GOODS = this.HOST + '/cadre/help/goods/';
        //帮扶干部走访列表
        this.VISITS = this.HOST + '/cadre/help/visits/';
        //帮扶干部发布务工
        this.SENDWORK = this.HOST + '/cadre/help/send_work/';
        //帮扶干部绝对贫困户
        this.MEMBBER_FAMILY = this.HOST + '/family/help_family_list/';
        //获取新版本号以及补丁下载地址
        this.GETVERSION = this.HOST + '/login/get_version/';
        // this.GETVERSION = 'http://192.168.3.74:8001/up.php';
        //商品企业列表
        this.SHOPCOM = this.HOST + '/family/company_list/';
        //企业认购列表
        this.GOODSCOMLIST = this.HOST + '/family/goods_list/';
    }
};
module.exports = new CONFIG();