$(function() {    
    // var model_nav = window.model_nav;
    var index_nav = window.index_nav;
    var index_ma_20 = SMA(index_nav, 3);
    var index_ma_40 = SMA(index_nav, 6);
    var index_ma_180 = SMA(index_nav, 30);
    var index_ma_300 = SMA(index_nav, 50);

    var macd_forest_c = window.macd_forest_c;

    var index_wt = window.index_wt;

    var pool_alpha_count = window.pool_alpha_count;
    var vender_codes_price = window.vender_codes_price;
    var vender_codes = window.vender_codes;
    vender_num = Object.keys(vender_codes).length;
    // var real_nav = window.real_nav;
    // var market = window.market;
    // var future_spread = window.future_spread;
    // real_nav = Normalize_nav(real_nav, model_nav);
    // var model_nav_ma_10 = SMA(model_nav, 10);
    // var model_nav_ma_20 = SMA(model_nav, 20);
    // var model_nav_ma_50 = SMA(model_nav, 50);
    // var model_nav_ma_100 = SMA(model_nav, 100);
    // var annaul_curve = Annaul_curve(model_nav, 0.15);
    
    // var cumulated_model_mdd_info = get_cumulated_mdd_info(model_nav);
    // var cumulated_real_mdd_info = get_cumulated_mdd_info(real_nav);
    // var model_dd = get_drawdown_info(model_nav);
    // var real_dd = get_drawdown_info(real_nav);

    // var cumulated_model_roundup = get_cumulated_roundup_info(model_nav);
    // var model_roundup = Roundup(model_nav);
    // var cumulated_real_roundup = get_cumulated_roundup_info(real_nav);
    // var real_roundup = Roundup(real_nav);

    // var model_performance = get_performance(model_nav);
    // var real_performance = get_performance(real_nav);
    // var model_drawdown_info = get_drawdown_period(model_nav);
    // var real_drawdown_info = get_drawdown_period(real_nav);


    ///////////////////////////////////////  Put Plotting Series Here  ///////////////////////////////////////////////////
    series_array = [];
    for (var i = 0; i<vender_num; i++){
        vender_code = vender_codes[i];
        series_array.push(get_series_element(vender_code,'area',3,color='',get_bias(vender_codes_price[vender_code], SMA(vender_codes_price[vender_code], 20))));
    }
    for (var i = 0; i<vender_num; i++){
        vender_code = vender_codes[i];
        // series_array.push(get_series_element(vender_code,'column',4,color='',time_series_minus(get_daily_return(vender_codes_price[vender_code],1) , get_daily_return(index_nav,1))));
        series_array.push(get_series_element(vender_code,'column',4,color='',get_daily_return(vender_codes_price[vender_code],1)));
    }
    series_array.push(get_series_element('Index Nav','line',0,'#000000',index_nav,dataGrouping='groupingUnits'));
    series_array.push(get_series_element('Index Nav SMA 20','line',0,'#FFA500',index_ma_20));
    series_array.push(get_series_element('Index Nav SMA 40','line',0,'#FF0000',index_ma_40));
    series_array.push(get_series_element('Index Nav SMA 180','line',0,'#0000FF',index_ma_180));
    series_array.push(get_series_element('Index Nav SMA 300','line',0,'#006400',index_ma_300));
    series_array.push(get_series_element('MACD Forest C','line',1,'#FF0000',macd_forest_c));
    series_array.push(get_series_element('Wt','line',1,'#0000FF',index_wt));
    series_array.push(get_series_element('Pool Alpha Count','areaspline',2,'#FFA500', pool_alpha_count));

    /////////////////////////////////////// Other Plotting Option Setting  /////////////////////////////////////////////////
    var groupingUnits = [[
                'week',                         // unit name
                [1]                             // allowed multiples
            ], [
                'month',
                [1, 2, 3, 4, 6]
            ]];

    /////////////////////////////////////// Highchart Plotting Main Area  ///////////////////////////////////////////////////
    $('#market_nose').highcharts('StockChart', {
        title: {
            text: name + ' Index Senser',
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
            text: 'From 2012 to present',
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
            selected : 2,
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
            get_yAxis_element('Index Price', null, 440),
            get_yAxis_element('MACD C & Wt', 580, 240, opposite=false, plotLines=[{value: 0, width: 2, color: 'rgba(0, 0, 0, 1)', zIndex: -1}]),
            get_yAxis_element('Alpha Count Ratio', 860, 240, opposite=false),
            get_yAxis_element('Vender Bias %', 1140, 240),
            get_yAxis_element('Vender Return', 1400, 240),
        ],

        plotOptions: {
            series: {
                animation: {
                    duration: 1000
                },
                dataGrouping: {
                    enabled: true
                }
            },
            area: {
                stacking: 'normal',
                lineColor: '#ffffff',
                lineWidth: 1,
                marker: {
                    lineWidth: 1,
                    lineColor: '#ffffff'
                }
            },
            column: {
                stacking: 'percent',
            }
        },
        series: series_array
    });

});
