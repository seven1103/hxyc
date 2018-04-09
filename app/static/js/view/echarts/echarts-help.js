/**
 *  政策比例图 初始数据结构
 */
module.exports = data => {
    let fonts = parseFloat($(document.documentElement).css('font-size'));
    let font1 = fonts * 0.15;
    let font2 = fonts * 0.2;
    let color1 = '#19b3fb';
    let color2 = '#43FFFF';
    //let name = ['发展生产', '易地搬迁', '生态补偿', '发展教育', '社会保障', '医疗救助'];
    let name = ['产业帮扶', '易地扶贫搬迁', '生态补偿', '发展教育', '民政兜底扶持', '医疗保障','就业扶持','财政金融扶贫','危房改造','村基础设施建设'];
    let nameArr = [];
    let familyArr = [];
    let peopleArr = [];

    for (let item of data) {
        let nameStr = name[item._id];
        if (!nameStr) continue;
        nameArr.push(nameStr);
        familyArr.push(item.family);
        peopleArr.push(item.people);
    };

    return {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            itemWidth: 8,
            itemHeight: 8,
            textStyle: {
                color: color1,
                fontSize: font1,
            },
            y: '0',
            x: 'center',
            data: ['帮扶户数', '帮扶人数'],
        },
        color: ["#17B3FB", "#43ffff"],
        grid: {
            width: '100%',
            height: '70%',
            top: '20%',
            left: '0',
            containLabel: true
        },
        xAxis: [{
            type: 'category',
            nameTextStyle: {
                fontSize: '20rem',
            },
            data: nameArr,
            axisPointer: {
                type: 'shadow'
            },
            axisTick: {
                show: false,
            },
            axisLabel: {
                interval: 0,
                rotate:20,
                show: true,
                textStyle: {
                    color: '#55a4ca',
                    fontSize: fonts * 0.10
                }
            },
        }],
        yAxis: [{
            type: 'value',
            name:'单位:  百',
            nameTextStyle:{
                color: color1,
                fontSize: fonts * 0.1
            },
            axisTick: {
                show: false,
            },
            axisLabel: {
                // formatter: '{value}/户',
                formatter: function(value){
                    return value/100;
                },
                show: true,
                textStyle: {
                    color: color1,
                    //fontSize: 8
                    fontSize: fonts * 0.1
                }
            },
            splitLine: {
                show: false
            }
        }, {
            type: 'value',
            axisTick: {
                show: false,
            },
            axisLabel: {
                formatter: '{value}/人',
                show: false,
                textStyle: {
                    color: '#1b7f7f',
                    //fontSize: 8
                    fontSize: fonts * 0.1
                }
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#1E2229'
                }
            }
        }],
        series: [{
            name: '帮扶户数',
            type: 'bar',
            barWidth: '30%',
            data: familyArr,
        }, {
            name: '帮扶人数',
            type: 'line',
            yAxisIndex: 1,
            data: peopleArr
        }]
    };
};