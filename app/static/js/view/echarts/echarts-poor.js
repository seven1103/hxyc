/**
 * 贫困户比例图 初始数据结构
 */
module.exports = data => {
    let ducFontSize = parseFloat($(document.documentElement).css('font-size'));
    let font1 = ducFontSize * 0.15;
    let font2 = ducFontSize * 0.2;
    let color1 = '#19b3fb';
    let color2 = '#43FFFF';

    //重组数据添加name
    let newPoor = [];
    //总数
    let total = 0;
    data.map(item => total += item.count);
    for (let item of data) {
        let nameStr = W.GetPro(item._id);
        if (!nameStr) {
            continue;
        } else {
            newPoor.push({
                name: nameStr,
                value: item.count,
                num: parseFloat((item.count / total * 100).toFixed(2)),
                _id: item._id,
            });
        };
    };

    return {
        legend: [{
            orient: 'vertical',
            y: '8%',
            x: '45%',
            itemWidth: 4,
            itemHeight: 4,
            data: newPoor,
            textStyle: {
                fontSize: font1,
                color: color1
            }
        }, {
            orient: 'vertical',
            y: '8%',
            x: '75%',
            itemWidth: 0,
            itemHeight: 0,
            data: newPoor,
            textStyle: {
                fontSize: font1,
                color: color2
            },
            formatter: (name) => {
                for (let val of newPoor) {
                    if (val.name === name) return val.num + '%';
                };
            }
        }, ],
        tooltip: {
            show: true,
            formatter: '{d}%'
        },
        title: {
            text: '贫困结构比例',
            y: '5%',
            x: '8%',
            textStyle: {
                color: color1,
                fontWeight: '500',
                fontSize: font2,
            }
        },
        series: [{
            type: 'pie',
            center: ['20%', '53%'],
            radius: ['35%', '60%'],
            hoverAnimation: false,
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
            data: newPoor
        }]
    };
};