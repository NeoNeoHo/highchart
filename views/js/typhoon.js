$(function () {
    var typhoon = window.typhoon;
    var typhoon_last_month = window.typhoon_last_month;
    var typhoon_short_last_month = window.typhoon_short_last_month;
    var slope1 = window.slope1;
    var slope2 = window.slope2;
    var x_std_line = window.x_std_line;
    var y_std_line = window.y_std_line;
    var text_std1 = window.text_std1;
    var text_std2 = window.text_std2;
    var date = window.date;

    var typhoon_area=[];
    var alarm_area=[];
    var pos_y;
    var hight;
    var y_mini_1=0;
    var x_max_1=0;
    var y_mini_2=0;
    var x_max_2=0;
    for (var i=0;i<typhoon.length;i++){
        if (typhoon[i][1] < y_mini_1){
            y_mini_1 = typhoon[i][1];
        }
    }
    for (var i=0;i<typhoon.length;i++){
        if (typhoon[i][0] > x_max_1){
            x_max_1 = typhoon[i][0];
        }
    }
    for (var i=0;i<typhoon_short_last_month.length;i++){
        if (typhoon_short_last_month[i][1] < y_mini_2){
            y_mini_2 = typhoon_short_last_month[i][1];
        }
    }
    for (var i=0;i<typhoon_short_last_month.length;i++){
        if (typhoon_short_last_month[i][0] > x_max_2){
            x_max_2 = typhoon_short_last_month[i][0];
        }
    }
    x_max = Math.max(x_max_1, x_max_2);
    y_mini = Math.min(y_mini_1, y_mini_2);
    for (var i=x_std_line;i<=x_max+100;i++){
        var rows=[i,-y_std_line,y_mini-200];
        typhoon_area.push(rows);
    }
    for (var i=0;i<=x_std_line;i=i+0.01){
        var rows=[i,-y_std_line,y_mini-200];
        alarm_area.push(rows);
    }
    var chart = new Highcharts.Chart({
            chart: {
            renderTo: 'typhoon_container',
            type: 'bubble',
            zoomType: 'xy',
            borderWidth: 0,
            borderRadius: 0,
            plotBorderWidth: 0,
        },

        title: {
            text: 'Warning System - ' + name + ' Portfolio , Revise on ' + date,
            style:{
                fontFamily:'sans-serif',
                fontSize:'30px'
            }
        },
        exporting:{
            sourceHeight:960,
            sourceWidth:1200,
            chartOptions: {
            subtitle: null
            }
        },
        xAxis: {
            title: {
                enabled: true,
                text: 'Difference Between Negative Alpha and its Moving Average',
                style:{
                fontFamily:'sans-serif',
                fontSize:'20px'
                }
            },
            max: x_max+10,
            plotLines : [{
                value : 0,
                color : 'black',
                width : 2,
            },{
                value : x_std_line,
                color : '#696969',
                width : 1,
                label:{
                    text: text_std1 + " STD",
                    style:{
                        fontSize:'16px',
                        fontWeight:'bold'
                    }
                }
            },{
                value : x_std_line/3*4,
                color : '#696969',
                width : 1,
                label:{
                    text: text_std1*4/3 + " STD",
                    style:{
                        fontSize:'16px',
                        fontWeight:'bold'
                    }
                }
            },{
                value : x_std_line/3*8,
                color : '#696969',
                width : 1,
                label:{
                    text: text_std1*8/3 + " STD",
                    style:{
                        fontSize:'16px',
                        fontWeight:'bold'
                    }
                }
            }],
            tartOnTick: true,
            endOnTick: true,
            showLastLabel: true,
            gridLineWidth: 1
        },
        yAxis: {
            title: {
                text: 'Total alpha',
                style:{
                fontFamily:'sans-serif',
                fontSize:'20px'
                }
            },
            min: y_mini,
 
            plotLines : [{
                    value : 0,
                    color : 'black',
                    width : 2
            },{
                value : -y_std_line,
                color : '#696969',
                width : 1,
                label:{
                    text: text_std2 + " STD",
                    style:{
                        fontSize:'16px',
                        fontWeight:'bold'
                    }
                }
            },{
                value : -y_std_line*2,
                color : '#696969',
                width : 1,
                label:{
                    text: text_std2*2 + " STD",
                    style:{
                        fontSize:'16px',
                        fontWeight:'bold'
                    }
                }
            }],

        },
        plotOptions: {
            bubble:{
                minSIze:'0.1',
                maxSize:'30'
            }
        },

        legend: {
            layout: 'vertical',
            align: 'left',
            verticalAlign: 'top',
            x: 850,
            y: 70,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
            borderWidth: 1
        },
        series: [{
            name: 'Historical',
            type: 'scatter',
            zoomType: 'xy',
            data: typhoon,
            
            marker: {
                symbol: 'circle', 
                lineColor: 'rgba(0,0,0,1)',
                radius: 2.5,
                fillColor: {
                    radialGradient: { cx: 0.4, cy: 0.3, r: 0.7 },
                    stops: [
                         [0, 'rgba(190,190,190,0.5)'],
                         [1, 'rgba(100,100,100,0.5)']//Highcharts.Color(Highcharts.getOptions().colors[1]).setOpacity(0.5).get('rgba')]
                    ]
                }

            }
        },{
            name: 'Current_60_WMA',
            data: typhoon_last_month,
            marker: {
                lineColor: 'rgba(105,105,105,1)',
                 fillColor: {
                     radialGradient: { cx: 0.4, cy: 0.3, r: 0.7 },
                     stops: [
                         [0, 'rgba(255,193,193,0.5)'],
                         [1, 'rgba(255,0,0,0.3)']//Highcharts.Color(Highcharts.getOptions().colors[2]).setOpacity(0.5).get('rgba')]
                     ]
                 }
            }
        },{
            name: 'current_10_WMA',
            data: typhoon_short_last_month,
            marker: {
                lineColor: 'rgba(0,139,0,1)',
                 fillColor: {
                     radialGradient: { cx: 0.4, cy: 0.3, r: 0.7 },
                     stops: [
                         [0, 'rgba(84,255,159,0.5)'],
                         [1, 'rgba(0,139,0,0.8)']//Highcharts.Color(Highcharts.getOptions().colors[2]).setOpacity(0.5).get('rgba')]
                     ]
                 }
            }
        },
        // {
        //     name: 'Linear Regression of all',
        //     type: 'line',
        //     data: [pos1[0],pos2[0]],
        //     color: '#3A5FCD',
        //     dashStyle : 'shortdash',
        //     marker: {
        //             enabled: false
        //     }
        // },
        // {
        //     name: 'Linear Regression of Last 20 Days',
        //     type: 'line',
        //     data: [pos3[0],pos4[0]],
        //     color: 'red',
        //     dashStyle : 'shortdash',
        //     marker: {
        //             enabled: false
        //     }
        // },
        {
            name: 'Typhoon Area',
            type: 'arearange',
            data: typhoon_area,
            zIndex: -1,
            color: 'rgba(255,193,193,.5)'

        },
        {
            name: 'Alarm Area',
            type: 'arearange',
            data: alarm_area,
            zIndex: -1,
            color: 'rgba(238,232,170,.5)'

        }
        ]
    });
    // var rectangle;
    // rectangle = chart.renderer.rect(1000,500,100,100,0).css({
    //     strokeWidth: '.5',
    //     fill: 'rgba(255, 215, 0, .5)',
    //     //fillOpacity: '.1'
    // }).add();
});
    
