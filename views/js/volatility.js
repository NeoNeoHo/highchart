$(function() {
    var data = window.data;
    // var name = window.name;
        // create the chart
        $('#volatility').highcharts('StockChart', {
            title: {
                text: name + '  Volatility',
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
                text: 'From 2005 to present',
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
                // load: function () {
                //     var ch = this;
                //     setTimeout(function(){
                //         ch.exportChart();
                //     },1);
                // }
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
                // height: 360,
                // opposite: true,
                gridLineWidth: 1
             }],
            series : [{
                name : name,
                type: 'line',
                data : data,
                tooltip: {
                    valueDecimals: 2
                }
            }]
        });
});
