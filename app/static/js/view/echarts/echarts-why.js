/**
 * 贫困结构比例，主要致贫原因
 */
module.exports = data => {

    var fonts = parseFloat($(document.documentElement).css('font-size'));
    let font1 = fonts * 0.15;
    var font2 = fonts * 0.2;
    let color1 = '#19b3fb';
    let color2 = '#43ffff';
    let total = 0;
    let newArr = data.map(item => {
        total += item.count;
        return {
            name: W.GetCau(item._id,true),
            value: item.count
        };
    });
    //重新排序，字多的放前面
    newArr.sort(function(a, b) {
        return b.name.length - a.name.length;
    });

    //空格数
    var sp = '';
    var dWidth = document.body.offsetWidth;
    var sum = parseInt((dWidth - 1366 + dWidth) / 100);
    if (dWidth > 1440) sum -= 5;
    for (var i = 0; i < sum - 3; i++) {
        sp += ' ';
    };
    return {
        legend: [{
            orient: 'vertical',
            y: '30%',
            x: '44%',
            height: '60%',
            z:2,
            itemWidth: 7,
            itemHeight: 7,
            data: newArr,
            //formatter: '{name}' + sp + '',
            formatter(name){
                let str = '           ';
                if(name == '交通条件落后')str = '';
                return name + sp + str;
            },
            textStyle: {
                fontSize: font1,
                color: color1
            }
        }, {
            orient: 'vertical',
            y: '30%',
            x: '63%',
            z:1,
            itemWidth: 0,
            itemHeight: 0,
            height: '60%',
            data: newArr,
            align: 'right',
            textStyle: {
                color: color2,
                fontSize: font1
            },
            formatter: function(name) {
                for (let val of newArr) {
                    if (val.name === name)
                        return parseFloat(val.value / total * 100).toFixed(2) + '%' + sp;
                };
            }
        }, ],
        tooltip: {
            show: true,
            formatter: '{d}%'
        },
        title: {
            text: '贫困户致贫原因',
            y: '5%',
            x: 'center',
            textStyle: {
                color: color1,
                fontWeight: '500',
                fontSize: font2,
            }
        },
        series: [{
            type: 'pie',
            center: ['25%', '60%'],
            radius: ['35%', '65%'],
            label: {
                normal: {
                    show: false,
                    textStyle: {
                        color: color2,
                    },
                    position: 'inside',
                    formatter: "{d}%",
                },
                emphasis: {
                    show: false,
                    textStyle: {
                        color: color2
                    },
                    position: 'inside',
                    formatter: "{d}%",
                }
            },
            itemStyle: {
                normal: {
                    label: {
                        show: false
                    },
                    labelLine: {
                        show: false
                    },
                },
            },
            data: newArr,
            color: ['#80C31C', '#008638', '#00947E', '#019FC5', '#0C50A3', '#14007D', '#FFFF01', '#FFBF01', '#FF7F00', '#FF4301', '#82017F', '#FE0000']
        }]
    };
};