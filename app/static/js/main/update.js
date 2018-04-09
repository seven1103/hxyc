class Update {

    constructor(opt) {
        if (!opt || !opt.host) return; //throw new Error('option.host is null');
        this.c = opt;
        this._Init();
    };

    _Init() {
        this.fs = require('fs');
        this.request = require('request');
        this.unzip = require('unzip');
        this.path = require('path');
        this.package = require(this.c.rootdir + '/package.json');
        this.version = this._GetVersion(this.package.version);
        this.parentPath = this.path.resolve(this.c.rootdir, '../');
        this.zipPath = this.parentPath + '/update.zip';
        this.outPath = this.parentPath + '/app';
        this.downSize = 0;
        this.totalSize = 0;
        if (this._GetVersion(this.c.version) > this.version) this._Download();
    };
    _GetVersion(str) {
        if (str.indexOf('.') == -1) throw new Error('option.version format 0.0.0');
        let arr = str.split('.');
        let v = '';
        arr.forEach(function(item) {
            if (isNaN(item)) throw new Error('option.version is NaN');
            v += item;
        }, this);
        return parseInt(v);
    };
    _Download() {
        let strame = this.fs.createWriteStream(this.zipPath);

        let req = this.request({
            method: 'GET',
            uri: this.c.host
        });

        req.pipe(strame);

        req.on('response', res => {
            let totalSizeMB = res.headers['content-length'] / Math.pow(1024, 1);
            this.totalSize = parseFloat(totalSizeMB);
            this.c.stateFun && this.c.stateFun({
                state: 'downstart',
                type: 'downloader',
                totalSize: this.totalSize,
                downSize: 0,
                progress: 0
            });
        });

        req.on('data', chunk => {
            this.downSize += parseFloat(chunk.length / Math.pow(1024, 1));
            this.c.stateFun && this.c.stateFun({
                state: 'downloading',
                type: 'downloader',
                totalSize: this.totalSize,
                downSize: this.downSize,
                progress: (this.downSize / this.totalSize * 100).toFixed(2)
            });
        });

        req.on('end', () => {
            this.c.stateFun && this.c.stateFun({
                state: 'downloaded',
                type: 'downloader',
                totalSize: this.totalSize,
                downSize: this.downSize,
                progress: (this.downSize / this.totalSize * 100).toFixed(2)
            });
            this._UpZip();
        });

        req.on('err', (err) => {
            this.c.errorFun && this.c.errorFun(err);
        });
    };

    _UpZip() {
        this.c.stateFun && this.c.stateFun({
            state: 'unzipstart',
            type: 'unzip',
            downSize: this.downSize,
            totalSize: this.totalSize,
        });
        let strame = this.fs.createReadStream(this.zipPath);
        // console.log(this.zipPath, this.outPath);
        // let zipData = new this.unzip(this.zipPath);
        // console.log(zipData);
        // //解压目标路径，是否覆盖
        // zipData.extractAllTo(this.outPath, true);
        // //解压完成
        // this.c.stateFun && this.c.stateFun({
        //     state: 'unzipend',
        //     type: 'unzip',
        //     downSize: this.downSize,
        //     totalSize: this.totalSize,
        // });
        // this.fs.unlink(this.zipPath, (err) => {
        //     if (!err) {
        //         this.c.stateFun && this.c.stateFun({
        //             state: 'removed',
        //             type: 'removefile',
        //             downSize: this.downSize,
        //             totalSize: this.totalSize,
        //         });
        //     }
        // });
        //--------------------------------
        let un = this.unzip.Extract({
            path: this.outPath
        });
        let d = strame.pipe(un);
        d.on('finish', () => {
            this.c.stateFun && this.c.stateFun({
                state: 'unzipend',
                type: 'unzip',
                downSize: this.downSize,
                totalSize: this.totalSize,
            });
            this.fs.unlink(this.zipPath, (err) => {
                if (!err) {
                    this.c.stateFun && this.c.stateFun({
                        state: 'removed',
                        type: 'removefile',
                        downSize: this.downSize,
                        totalSize: this.totalSize,
                    });
                }
            });
        });
    };

}
module.exports = Update;