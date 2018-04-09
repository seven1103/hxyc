/**
 *  政策比例图 初始数据结构
 */
module.exports = data => {
    let fonts = parseFloat($(document.documentElement).css('font-size'));
    let font1 = fonts * 0.15;
    let font2 = fonts * 0.2;
    let color1 = '#19b3fb';
    let color2 = '#43FFFF';

    let moneyArr = [];
    let numArr = [];
    let wekkArr = []
        //重组数据添加
    data.forEach(item => {
        moneyArr.push(item.sales_money);
        numArr.push(item.sales_num);
        wekkArr.push(item.week_num);
    });

    return {
        tooltip: {
            trigger: 'axis'
        },
        color: ["#17B3FB", "red"],
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [{
            type: 'category',
            data: wekkArr,
            axisPointer: {
                type: 'shadow'
            },
            axisTick: {
                show: false,
            },
            axisLabel: {
                interval: 0,
                show: true,
                textStyle: {
                    color: '#55a4ca',
                    //fontSize: 8
                    fontSize: fonts * 0.15
                }
            },
            lineStyle: {
                color: '#383434'
            },
        }],
        yAxis: [{
            type: 'value',
            axisTick: {
                show: false,
            },
            axisLabel: {
                show: true,
                textStyle: {
                    color: color1,
                    fontSize: '0.1rem'
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#1E2229'
                }
            },
            max: Math.max.apply(null, moneyArr)
        }, {
            type: 'value',
            axisTick: {
                show: false
            },
            axisLabel: {
                show: false,
                textStyle: {
                    color: color1
                }
            },
            max: Math.max.apply(null, numArr),
            min: 0,
            axisLine: {
                show: false
            },
            splitLine: {
                show: false
            }
        }],
        series: [{
            name: '成交商品数',
            type: 'line',
            data: numArr,
        }, {
            name: '成交金额',
            type: 'line',
            data: moneyArr,
            lineStyle: {
                normal: {
                    color: 'red'
                }
            },
        }]
    };
};