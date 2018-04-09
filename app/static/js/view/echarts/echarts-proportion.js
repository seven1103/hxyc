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
        //members 没用
        total += item.count;
        return {
            name: W.GetPro(item._id),
            value: item.count
        };
    });
    return {
        legend: [{
            orient: 'vertical',
            y: '30%',
            x: '58%',
            itemWidth: 7,
            itemHeight: 7,
            data: newArr,
            textStyle: {
                color: color1,
                fontSize: font1
            }
        }, {
            orient: 'vertical',
            y: '30%',
            x: '84%',
            itemWidth: 0,
            itemHeight: 0,
            align: 'right',
            data: newArr,
            textStyle: {
                color: color2,
                fontSize: font1
            },
            formatter: function(name) {
                for (let val of newArr) {
                    if (val.name === name)
                        return parseFloat(val.value / total * 100).toFixed(2) + '%';
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
            x: 'center',
            textStyle: {
                color: color1,
                fontWeight: '500',
                fontSize: font2,
            }
        },
        series: [{
            type: 'pie',
            center: ['28%', '60%'],
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
                        color: color2,
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
            color: ['#FF3E32', '#FFFF31', '#41FFFF', '#9158BC', '#FFBF01', '#FF7F00', '#FF4301', '#82017F', '#FE0000']
        }]
    };
};