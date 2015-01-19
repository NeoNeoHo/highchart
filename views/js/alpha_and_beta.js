$(function() {
    var alpha_and_beta = window.alpha_and_beta;
    var port_alpha_and_beta = window.port_alpha_and_beta;
    var top_alpha_rank_data = window.top_alpha_rank_data;
    var top_beta_rank_data = window.top_beta_rank_data;
    var top_rank_alpha_related_beta = window.top_rank_alpha_related_beta;
    var top_rank_beta_related_alpha = window.top_rank_beta_related_alpha;
    var volatility = window.volatility; 
    var index_pr = window.index_pr;  
    var axis_fontsize = '30px';
    var title_fontsize = '30px';
    var subtitle_fontsize = '20px';
    var tooltip_fontsize = '20px';

    // $.get("/data/volatility/").suucess(function(data){

    //     volatility = data

    // })

    volatility = Normalize_Vol(volatility);
    
    $('#alpha_and_beta').highcharts(
    {
        chart: {
            type: 'scatter',
            zoomType: 'xy'
        },
        title: {
            text: 'Stock Alpha v.s. Beta',
            style:{fontSize: title_fontsize}
        },
        subtitle: {
            text: 'Source from: ' + date,
            style:{fontSize: subtitle_fontsize}
        },
        xAxis: {
            title: {
                enabled: true,
                text: 'Alpha',
                style: {fontSize: axis_fontsize}
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true,
            plotLines: [{value: 0, width: 2, color: 'rgba(223, 83, 83, .5)', zIndex: -1}]
        },
        yAxis: {
            title: {
                text: 'Beta',
                style: {fontSize: axis_fontsize}
            }
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            verticalAlign: 'top',
            x: 100,
            y: 70,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
            borderWidth: 1
        },

         plotOptions: {
            scatter: {
                marker: {
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<b style="font-size: 20px">{series.name}</b><br>',
                    pointFormat: '<p style="font-size: 20px">alpha: {point.x}, beta: {point.y}, <br><b style="font-size: 20px">code: {point.code}</b></p>',
                    style: {fontSize: tooltip_fontsize}
                }
            }
        },
        series : [
        {
            name : 'Pool Alpha and Beta',
            type: 'scatter',
            color: 'rgba(223, 83, 83, .5)',
            // data : [],
            data : alpha_and_beta,
            tooltip: {
                valueDecimals: 2
            }
        },
        {
            name : 'Portfolio Alpha and Beta',
            type: 'scatter',
            color: 'rgba(0, 0, 191, .5)',
            // data : [],
            data : port_alpha_and_beta,
            tooltip: {
                valueDecimals: 2
            }
        }
        ]
    });


    $('#top_alpha_rank').highcharts({
        title: {
            text: 'Sorted: Alpha',
            style: {fontSize: title_fontsize}
        },
        subtitle: {
            text: 'Source from: ' + date,
            style: {fontSize: subtitle_fontsize}
        },
        xAxis: {
            type: 'category',
            labels: {
                enabled: false,
                rotation: -45,
                style: {
                    fontSize: '16px',
                    fontFamily: 'Arial'
                }
            }
        },
        yAxis: [{
            title: {
                text: 'Alpha',
                style: {fontSize: title_fontsize}
            }
        },{
            opposite: true,
            title: {
                text: 'Beta',
                style: {fontSize: title_fontsize}
            }
        }],
        legend: {
            enabled: false
        },
        tooltip: {
            headerFormat: '<b style="font-size: 20px">{point.key}</b><br>',
            pointFormat: '<p style="font-size: 20px">Alpha: <b style="font-size: 20px">{point.y:.1f} </b></p>'
        },
        series: [{
            type: 'column',
            name: 'Alpha',
            data: top_alpha_rank_data,
        },{
            type: 'line',
            name: 'Beta',
            data: top_rank_alpha_related_beta,
            yAxis: 1,
            tooltip: {
                valueDecimals: 2
            }
        }]
    });


    $('#top_beta_rank').highcharts({
        title: {
            text: 'Sorted: Beta',
            style: {fontSize: title_fontsize}
        },
        subtitle: {
            text: 'Source from: ' + date,
            style: {fontSize: subtitle_fontsize}
        },
        xAxis: {
            type: 'category',
            labels: {
                enabled: false,
                rotation: -45,
                style: {
                    fontSize: '16px',
                    fontFamily: 'Arial'
                }
            }
        },
        yAxis: [{
            title: {
                text: 'Beta',
                style: {fontSize: title_fontsize}
            }
        },{
            opposite: true,
            title: {
                text: 'Alpha',
                style: {fontSize: title_fontsize}
            }
        }],
        legend: {
            enabled: false
        },
        tooltip: {
            headerFormat: '<b style="font-size: 20px">{point.key}</b><br>',
            pointFormat: '<p style="font-size: 20px">Beta: <b style="font-size: 20px">{point.y:.2f} </b></p>'
        },
        series: [{
            type: 'column',
            name: 'Beta',
            data: top_beta_rank_data,
        },{
            type: 'line',
            name: 'Alpha',
            data: top_rank_beta_related_alpha,
            yAxis: 1,
            tooltip: {
                valueDecimals: 2
            }
        }]
    });

    $('#volatility').highcharts('StockChart', {
        chart: {
            zoomType: 'x',
        },
        rangeSelector : {
            selected : 4
        },
        title : {
            text : 'Market Volatility',
            style: {fontSize: title_fontsize}
        },
        yAxis: [
            get_yAxis_element('Volatility', null, null, opposite=false),
            get_yAxis_element('Index', null, null, opposite=true),
        ],
        tooltip: {
            shared: true
        },
        series : [
        {
            name : 'Volatility',
            id: 'volatility',
            data : volatility,
            yAxis : 0,
            tooltip: {
                valueDecimals: 2
            }
        },
        {
            type : 'flags',
            yAxis : 0,
            data : [{
                x : new Date(date).getTime(),//Date.UTC(2008, 3, 25),
                title : date,
                text : 'Euro Contained by Channel Resistance'
            }, 
            ],
            onSeries : 'volatility',
            shape : 'circlepin',
            width : 50,
        },
        get_series_element('Index','line',1,'#696969',index_pr),
        ]
    });
});



var Normalize_Vol = function(data){
    var factor = data[0][1];
    var num_data = data.length;
    var return_data = [];
    for (var i=0;i<num_data;i++){
        return_data.push([data[i][0], data[i][1] / factor]);
    }
    return return_data;
};

