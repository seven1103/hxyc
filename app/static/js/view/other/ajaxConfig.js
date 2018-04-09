//统一处理jQuery AJAX
$.ajaxSetup({
    type: 'post',
    dataType: 'json',
    timeout: 60000,
    data: { region_id: W.GetStorage('region_info').region_id },
    error(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        let message = '';
        switch (jqXHR.status) {
            case (0):
                message = "无法链接服务器";
                break;
            case (500):
                //message = "服务器系统内部错误";
                break;
            case (404):
                message = "没有找到服务器地址";
                break;
            case (403):
                message = "无权限执行此操作";
                break;
            case (408):
                message = "请求超时";
                break;
            default:
                message = "未知错误";
                break;
        };
        W.LoadingBox('hide');
        //某些接口不需要提示
        if (this.url.indexOf('work_flow') != -1 || this.url.indexOf('get_version')) return;
        if (!message) return;
        setTimeout(() => {
            W.DiaLog({ message: message + ':' + errorThrown });
        }, 500)
    }
});