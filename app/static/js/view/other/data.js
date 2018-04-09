/**
 * 存放初始数据以及公共数据
 * 例如部分页面有同样的数据列表结构（村镇查询,贫困户）
 * 所有读取数据列表都在这里做好主要为了统一做缓存
 */

class InitData {

    //对象初始化
    constructor() {
        this.region_id = W.GetStorage('region_info').region_id;
        this.md5 = require('md5');
    };

    /**
     * 查找缓存
     * 
     * @param {any} name 
     * @memberof InitData
     */
    FindCache(url, isRepeat) {
        let name = W.GetFileName({ url: url.substring(0, url.length - 1) });
        name = isRepeat ? name + '_1' : name;
        let cache = W.GetStorage(name);
        return cache;
    };
    /**
     * 比较缓存
     */
    CompareCache(newVal, url, isRepeat) {
        //读取缓存
        let name = W.GetFileName({ url: url.substring(0, url.length - 1) });
        let cache = this.FindCache(url, isRepeat);
        let data = null;
        name = isRepeat ? name + '_1' : name;
        try {
            let newValStr = this.md5(JSON.stringify(newVal));
            let cacheMd5 = this.md5(JSON.stringify(cache));
            if (cacheMd5 === newValStr) {
                //console.log('使用缓存，不再做其他操作', url);
                data = cache;
            } else {
                //console.log('有最新数据，使用最新的', url);
                //console.log(name);
                W.SetStorage(name, newVal);
                data = newVal;
            };
            return data;
        } catch (error) {
            console.error('cache error');
        };
    };
    /**
     * 获取数据封装
     * 
     * @memberof InitData
     */
    GetData(url, data, callback, method, isCache, isRepeat) {
        //先查找缓存 暂不使用，
        //如果使用缓存那么程序则不执行任何操作包括回调
        //目前每个接口初始vue之前都会先查找缓存，那么就是说已经读取过一次缓存
        //那么再来获取数据时如果使用缓存就没有必要再执行一次回调
        //使用者直接使用第一次读取的缓存即可
        // let cache = this.FindCache(url);
        // if (cache) {
        //     callback && callback(cache);
        // };
        data = data || {};
        data.region_id = this.region_id;
        $.ajax({
            url: url,
            data: data,
            type: method || 'POST',
            success: res => {
                W.LoadingBox('hide');
                if (res.code != 0) {
                    W.DiaLog({ message: res.result.msg + ',code:' + res.code });
                    return;
                };
                //判断是否使用缓存
                let result = null;
                if (isCache) {
                    result = res.result;
                    //console.log('使用缓存,并执行回调');
                } else {
                    //如果使用缓存,检测到与服务器返回数据一致则返回null null则不执行回调
                    result = this.CompareCache(res.result, url, isRepeat);
                    //console.log('使用缓存,不执行回调');
                };
                result && callback && callback(result);
            }
        });
    };
    /**
     * 获取index数据
     * 
     * @memberof InitData
     */
    GetIndex(subJson = {}, callback) {
        this.GetData(C.INDEX, subJson, callback);
    };
    /**
     * 获取word_flow数据
     * 
     * @param {any} [subJson={}] 
     * @param {any} callback 
     * @memberof InitData
     */
    GetWordFlow(subJson = {}, callback) {
        this.GetData(C.WORK, subJson, callback);
    };
};

module.exports = new InitData();