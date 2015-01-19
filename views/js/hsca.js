$(function() {
    var data = window.data;
    var cci = window.cci;
    var ccima = window.ccima;
    var h180 = window.h180;
    var h180ma = window.h180ma;
    var slope1 = window.slope1;
    var slope1ma = window.slope1ma;
    var slope2 = window.slope2;
    var slope2ma = window.slope2ma;
    var total = window.total;
    var totalma = window.totalma;
    var wt = window.wt;
    var wt_ma = window.wt_ma;

    // console.log(window.data);
        // create the chart
        $('#hsca').highcharts('StockChart', {
            title: {
                text: name + '  4 in 1',
                style:{
                    fontSize: '32px',
                    color:'#000080'
                }
            },
            exporting:{
                sourceHeight:860,
                sourceWidth:1600,
                chartOptions: {
                subtitle: null
                }
            },
            subtitle:{
                text: 'From 2013 to present',
                // x: -40,
                // align: 'right',
                style:{
                    fontSize: '16px',
                    color: '#000000'
                }
            },
            chart: {
                plotBorderWidth: 2,
                events: {
                load: function () {
                    var ch = this;
                    setTimeout(function(){
                        ch.exportChart();
                    },1);
                }
            }
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
                    text: 'Index'
                },
                offset: 0,
                height: 720,
                opposite: true,
                gridLineWidth: 0
             },{
                title: {
                    text: 'H180'
                },
                min: 0,
                max: 100,
                tickInterval: 50,
                offset: 0,
                height: 180,
            },{
                title: {
                    text: 'Slope'
                },
                min: 0,
                max: 100,
                tickInterval: 50,
                top: 285,
                offset: 0,
                height: 180,
                
            },{
                title: {
                    text: 'CCI'
                },
                min: 0,
                max: 100,
                tickInterval: 50,
                top: 465,
                offset: 0,
                height: 180,
                lineWidth: 2,
                
            },{
                title:{
                    text: 'Average',
                },
                min: 0,
                max: 100,
                tickInterval: 50,
                top: 645,
                offset: 0,
                height: 180,
                lineWidth: 2,
                
            },{
                title:{
                    text: 'Wt',
                },
                min: -2,
                max: 2,
                tickInterval: 2,
                top: 825,
                offset: 0,
                height: 180,
                lineWidth: 2,
                
            }
            ],
            series : [{
                name : name,
                type: 'candlestick',
                data : data,
                tooltip: {
                    valueDecimals: 2
                }
            },{
                name : "H180",
                type: 'line',
                color: '#4876FF',
                data : h180,
                yAxis: 1,
                tooltip: {
                    valueDecimals: 2
                }
            },{
                name : "H180 MA",
                type: 'line',
                color: '#FF0000',
                data : h180ma,
                yAxis: 1,
                tooltip: {
                    valueDecimals: 2
                }
            },{
                name : "Slope1",
                type: 'line',
                color: '#4876FF',
                data : slope1,
                yAxis: 2,
                tooltip: {
                    valueDecimals: 2
                }
            },{
                name : "Slope1 MA",
                type: 'line',
                color: '#FF0000',
                data : slope1ma,
                yAxis: 2,
                tooltip: {
                    valueDecimals: 2
                }
            },{
                name : "Slope2",
                type: 'line',
                color: '#008B00',
                data : slope2,
                yAxis: 2,
                tooltip: {
                    valueDecimals: 2
                }
            },{
                name : "Slope2 MA",
                type: 'line',
                color: '#9C9C9C',
                data : slope2ma,
                yAxis: 2,
                tooltip: {
                    valueDecimals: 2
                }
            },{
               name : "CCI",
                type: 'line',
                color: '#4876FF',
                data : cci,
                yAxis: 3,
                tooltip: {
                    valueDecimals: 2
                } 
            },{
                name : "CCI MA",
                type: 'line',
                color: '#FF0000',
                data : ccima,
                yAxis: 3,
                tooltip: {
                    valueDecimals: 2
                }
            },{
               name : "Average",
                type: 'line',
                color: '#4876FF',
                data : total,
                yAxis: 4,
                tooltip: {
                    valueDecimals: 2
                }  
            },{
               name : "Average MA",
                type: 'line',
                color: '#FF0000',
                data : totalma,
                yAxis: 4,
                tooltip: {
                    valueDecimals: 2
                } 
            },{
               name : "Wt",
                type: 'line',
                color: '#4876FF',
                data : wt,
                yAxis: 5,
                tooltip: {
                    valueDecimals: 2
                } 
            },{
               name : "Wt MA",
                type: 'line',
                color: '#FF0000',
                data : wt_ma,
                yAxis: 5,
                tooltip: {
                    valueDecimals: 2
                } 
            }
            ]
        });
});
