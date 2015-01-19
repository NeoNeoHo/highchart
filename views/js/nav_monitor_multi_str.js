$(function() {    
    var model_nav = window.model_nav;
    var index_nav = window.index_nav;
    // var real_nav = window.real_nav;
    var market = window.market;
    var strategy = window.strategy;
    var future_spread = window.future_spread;
    var strategy_codes_price = window.strategy_codes_price;
    var strategy_codes = window.strategy_codes;
    // alert(strategy_codes_price);
    strategy_num = Object.keys(strategy_codes).length;
    // real_nav = Normalize_nav(real_nav, model_nav);
    var model_nav_ma_10 = SMA(model_nav, 10);
    var model_nav_ma_20 = SMA(model_nav, 20);
    var model_nav_ma_50 = SMA(model_nav, 50);
    var model_nav_ma_100 = SMA(model_nav, 100);
    // var annaul_curve = Annaul_curve(model_nav, 0.15);
    
    var cumulated_model_mdd_info = get_cumulated_mdd_info(model_nav);
    // var cumulated_real_mdd_info = get_cumulated_mdd_info(real_nav);
    var model_dd = get_drawdown_info(model_nav);

    // var real_dd = get_drawdown_info(real_nav);

    // var model_performance = get_performance(model_nav);
    // var real_performance = get_performance(real_nav);
    // var model_drawdown_info = get_drawdown_period(model_nav);
    // var real_drawdown_info = get_drawdown_period(real_nav);


    ///////////////////////////////////////  Put Plotting Series Here  ///////////////////////////////////////////////////
    series_array = [];
    for (var i = 0; i<strategy_num; i++){
        strategy_code = strategy_codes[i];
        series_array.push(get_series_element(strategy_code,'line',0,color='',strategy_codes_price[strategy_code]));
        // alert(strategy_code);
    }
    series_array.push(get_series_element('Model Nav','line',0,'#000000',model_nav,'','','',4));
    series_array.push(get_series_element('Index Nav','line',0,'#000000',index_nav));
    series_array.push(get_series_element('Model Nav SMA 10','line',0,'#FFA500',model_nav_ma_10));
    series_array.push(get_series_element('Model Nav SMA 20','line',0,'#FF0000',model_nav_ma_20));
    series_array.push(get_series_element('Model Nav SMA 50','line',0,'#0000FF',model_nav_ma_50));
    series_array.push(get_series_element('Model Nav SMA 100','line',0,'#006400',model_nav_ma_100));
    series_array.push(get_series_element('Future Spread %','column',1,'#FF0000',future_spread));
    // series_array.push(get_series_element('Cumulated Model DrawDown','line',2,'#4169E1',cumulated_model_mdd_info.mdd));
    series_array.push(get_series_element('Model DrawDown','area',2,'#4169E1',model_dd.dd));
    series_array.push(get_series_element('Model DrawDown Days','line',3,'#FF0000',model_dd.days));
    /////////////////////////////////////// Other Plotting Option Setting  /////////////////////////////////////////////////

    // Highchart 
    $('#nav_monitor').highcharts('StockChart', {
        title: {
            text: strategy + ' Nav Monitor',
            style:{
                fontSize: '32px',
                color:'#000080'
            }
        },

        legend: {
            enabled: true,
            // floating: true,
            // align: 'left',
            backgroundColor: '#FFFFFF',
            borderWidth: 2,
            // layout: 'vertical',
            // verticalAlign: 'top',
            // x: 100,
            // y: 100,
            // shadow: true
        },

        exporting:{
            sourceHeight:860,
            sourceWidth:1600,
            chartOptions: {
            subtitle: null
            }
        },

        subtitle:{
            text: 'From 2010 to present',
            style:{
                fontSize: '24px',
                color: '#000000'
            }
        },

        chart: {
            plotBorderWidth: 2,
            zoomType: 'x',
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
                count: 1,
                text: '1m'
            }],
            selected : 0,
            inputEnabled : true

        },

        xAxis:{
            startOnTick: false,
            endOnTick: false,
            labels:{
                format: '{value:%Y-%m}',
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                }
            },
        },

        yAxis: [
            get_yAxis_element('Model Nav', null, 640),
            get_yAxis_element('Future Spread %', 780, 120, opposite=true),
            get_yAxis_element('DrawDown', 920, 120),
            get_yAxis_element('DrawDown Days', 1060, 120, opposite=true),
            // get_yAxis_element('Round-Up', 1200, 120),
        ],

        plotOptions: {
            series: {
                animation: {
                    duration: 1000
                },
                dataGrouping: {
                    enabled: false
                }
            },
            area: {
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            },
            column: {
                allowPointSelect: true,
            }
        },
        series : series_array
    });

});
