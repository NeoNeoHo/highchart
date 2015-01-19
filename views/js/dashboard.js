$(function() {
    var data = window.data;
    var nav = window.nav;
    var mdd = window.mdd;
    var green_60 = window.green_60;
    var red_60 = window.red_60;
    var gray_60 = window.gray_60;
    var green_60_100 = window.green_60_100;
    var red_60_100 = window.red_60_100;
    var gray_60_100 = window.gray_60_100;
    var alpha_ratio = window.alpha_ratio;
    var pn_ratio_sma_20 = window.pn_ratio_sma_20;
    var index_cl_return_20 = window.index_cl_return_20;

    var nav_max = find_max(nav).toFixed(2);
    var nav_min = find_min(nav).toFixed(2);

    var index_max = find_max(data).toFixed(0);
    var index_min = find_min(data).toFixed(0);


    var mdd_min = find_min(mdd).toFixed(2);

    var gray_min = find_min(gray_60).toFixed(2);
    var gray_max = find_max(gray_60).toFixed(2);
    var gray_level = Math.max(Math.abs(gray_min),Math.abs(gray_max));

    var green_red_min = Math.min(find_min(green_60),find_min(red_60)).toFixed(2);

    


    var green_red_max = Math.max(find_max(green_60),find_max(red_60)).toFixed(2);

    var alpha_ratio_min = find_min(alpha_ratio).toFixed(2);
    var alpha_ratio_max = find_max(alpha_ratio).toFixed(2);

        $('#dashboard').highcharts('StockChart', {
            title: {
                text: name + '  Dashboard',
                style:{
                    fontSize: '32px',
                    color:'#000080'
                }
            },
            exporting:{
                sourceHeight:700,
                sourceWidth:1024,
                chartOptions: {
                subtitle: null
                }
            },
            subtitle:{
                text: 'From 2011 to present',
                // x: -40,
                // align: 'right',
                style:{
                    fontSize: '16px',
                    color: '#000000'
                }
            },
            chart: {
                plotBorderWidth: 2,
            },

            rangeSelector : {
                buttons : [{
                    type : 'all',
                    count : 1,
                    text : 'All'
                },{
                    type: 'year',
                    count: 1,
                    text: '1y'
                },{
                    type: 'month',
                    count: 6,
                    text: '6m'
                }],
                selected : 0,
                inputEnabled : false

            },
             yAxis: [{
                title: {
                    text: 'Index'       // no. 0
                },
                min: index_min,
                max: index_max,
                tickInterval: (index_max - index_min)/2,
                opposite: true,
                offset: 0,
                height: 100,
                gridLineWidth: 0
             },{
                title: {
                    text: 'nav'        // no. 1
                },
                min: nav_min,
                max: nav_max,
                tickInterval: (nav_max - nav_min)/2,
                offset: 0,
                height: 100,
            },{
                title: {
                    text: 'green and red line' // green  no. 2
                },
                min: green_red_min,
                max: green_red_max,
                tickInterval: (green_red_max - green_red_min)/2,
                top: 206,
                offset: 0,
                height: 140,
                lineWidth: 2,
                
            },{
                title:{
                    text: 'gray_60',       // no. 3
                },
                min: -gray_level,
                max: gray_level,
                tickInterval: gray_level,
                top: 346,
                offset: 0,
                height: 100,
                lineWidth: 0.5,
                opposite: true,
                plotLines : [{
                    value : 0,
                    color : 'red',
                    //dashStyle : 'line',
                    width : 2,
                    label : {
                        text : ''
                    }
                }]  
                
            },{
                title: {
                    text: 'mdd'            // no. 4
                },
                min: mdd_min,
                max: 0,
                //tickInterval: (0.001-mdd_min)/2,
                top: 446,
                offset: 0,
                height: 50,
                
            },{
                title: {
                    text: '(p-n) alpha-ratio'            // no. 5
                },
                min: alpha_ratio_min,
                max: alpha_ratio_max,
                //tickInterval: (alpha_ratio_max-alpha_ratio_min)/2,
                top: 496,
                offset: 0,
                height: 140,
                lineWidth: 0.5,
                opposite: true,
                plotLines : [{
                    value : 0,
                    color : 'black',
                    dashStyle : 'line',
                    zIndex: 5,
                    width : 2,
                    label : {
                        text : ''
                    }
                },{
                    value : -0.1,
                    color : 'red',
                    dashStyle : 'line',
                    zIndex: 6,
                    width : 2,
                    label : {
                        text : ''
                    }
                }]      
            },{
                title: {
                    text: 'Index_return_20_days'            // no. 6
                },
                top: 636,
                offset: 0,
                height: 80,
                lineWidth: 0.5,
            }
            ],
            series : [{
                name : name,
                type: 'line',
                data : data,
                tooltip: {
                    valueDecimals: 2
                }
            },{
                name : "nav",
                type: 'line',
                color: '#0000FF',
                data : nav,
                yAxis: 1,
                tooltip: {
                    valueDecimals: 2
                }
            },{
                name : "green_60",
                type: 'line',
                color: '#008B45',
                data : green_60,
                yAxis: 2,
                tooltip: {
                    valueDecimals: 2
                }
            },{
                name : "green_60_100",
                type: 'line',
                color: '#008B45',
                data : green_60_100,
                yAxis: 2,
                tooltip: {
                    valueDecimals: 2
                }
            },{
                name : "red_60",
                type: 'line',
                color: '#FF0000',
                data : red_60,
                yAxis: 2,
                tooltip: {
                    valueDecimals: 2
                }
            },{
                name : "red_60_100",
                type: 'line',
                color: '#FF0000',
                data : red_60_100,
                yAxis: 2,
                tooltip: {
                    valueDecimals: 2
                }
            },{
                name : "gray_60",
                type: 'line',
                color: '#8B8682',
                data : gray_60,
                yAxis: 3,
                tooltip: {
                    valueDecimals: 2
                }
            },{
                name : "gray_60_100",
                type: 'line',
                color: '#8B8682',
                data : gray_60_100,
                yAxis: 3,
                tooltip: {
                    valueDecimals: 2
                }
            },{
                name : "mdd",
                type: 'line',
                color: '#FF7F00',
                data : mdd,
                yAxis: 4,
                tooltip: {
                    valueDecimals: 2
                }
            },{
                name : "(p-n) alpha-ratio",
                type: 'line',
                color: '#FF7F00',
                data : alpha_ratio,
                yAxis: 5,
                zIndex: 0,
                tooltip: {
                    valueDecimals: 2
                },
            },{
                name : "(p-n) alpha-ratio",
                type: 'line',
                color: '#008B45',
                data : pn_ratio_sma_20,
                yAxis: 5,
                zIndex: 100,
                tooltip: {
                    valueDecimals: 2
                }
            },{
                name : "Index_return_20_days",
                type: 'line',
                color: '#008B45',
                data : index_cl_return_20,
                yAxis: 6,
                tooltip: {
                    valueDecimals: 2
                }
            }
            ]
        });
});

var find_min = function(data){
    var temp_min = 100000;
    for (var i=0;i<data.length;i++){
        if (data[i][1] < temp_min){
            temp_min = data[i][1];
        }
    }
    return temp_min;
};

var find_max = function(data){
    var temp_max = -1000;
    for (var i=0;i<data.length;i++){
        if (data[i][1] > temp_max){
            temp_max = data[i][1];
        }
    }
    return temp_max;
};