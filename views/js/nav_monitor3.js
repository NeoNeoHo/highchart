$(function() {    
    var model_nav_benson = window.model_nav_benson;
    var index_nav = window.index_nav;
    var real_nav = window.real_nav;
    var market = window.market;
    var future_spread = window.future_spread;
    real_nav = Normalize_nav(real_nav, model_nav_benson);
    var model_nav_benson_ma_10 = SMA(model_nav_benson, 10);
    var model_nav_benson_ma_20 = SMA(model_nav_benson, 20);
    var model_nav_benson_ma_50 = SMA(model_nav_benson, 50);
    var model_nav_benson_ma_100 = SMA(model_nav_benson, 100);
    var index_daily_return = get_daily_return(index_nav,1);

    var bias_model_10 = get_bias(model_nav_benson, model_nav_benson_ma_10);
    var bias_model_20 = get_bias(model_nav_benson_ma_10, model_nav_benson_ma_20);
    var bias_model_50 = get_bias(model_nav_benson_ma_20, model_nav_benson_ma_50);
    var bias_model_100 = get_bias(model_nav_benson_ma_50, model_nav_benson_ma_100);

    var log_bias_model_20 = get_log_bias(model_nav_benson, model_nav_benson_ma_20);

    var axis_fontsize = '30px';
    var title_fontsize = '30px';
    var subtitle_fontsize = '20px';
    var tooltip_fontsize = '20px';

    if (market == 'cn'){
        var model_daily_alpha = get_daily_return(model_nav_benson,0.8);
    }else{
        var model_daily_alpha = get_daily_return(model_nav_benson,1);
    }
    var model_daily_return = time_series_add(model_daily_alpha,index_daily_return);
    var model_return_nav = get_return_nav(model_daily_return);
    var model_index_spread = time_series_minus(model_return_nav, index_nav);



    // Highchart 
    $('#nav_monitor2').highcharts('StockChart', {
        title: {
            text: name + ' Nav Monitor',
            style:{
                fontSize: '32px',
                color:'#000080'
            }
        },

        legend: {
            enabled: true,
            floating: true,
            align: 'left',
            backgroundColor: '#FFFFFF',
            borderWidth: 2,
            layout: 'vertical',
            verticalAlign: 'top',
            x: 100,
            y: 100,
            shadow: true
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
            get_yAxis_element('Model Return Nav V.S. Index', null, 460),
            get_yAxis_element('Bias Model vs SMA-20', 600, 120, opposite=true, plotLines=[{value: 0, width: 2, color: 'rgba(223, 83, 83, 1)', zIndex: -1}]),
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
        },

        series : [
            // get_series_element('Model Nav','line',0,'#696969',model_nav_benson),
            get_series_element('Index Nav','line',0,'#000000',index_nav),
            // get_series_element('Real Nav','line',0,'#FF69B4',real_nav),

            // get_series_element('Model Nav SMA 10','line',0,'#FFA500',model_nav_benson_ma_10),
            // get_series_element('Model Nav SMA 20','line',0,'#FF0000',model_nav_benson_ma_20),
            // get_series_element('Model Nav SMA 50','line',0,'#0000FF',model_nav_benson_ma_50),
            // get_series_element('Model Nav SMA 100','line',0,'#006400',model_nav_benson_ma_100),

            // get_series_element('Derking Nav','line',0,'#8B4513',derking_nav,dashStyle='dash'),
            // get_series_element('Annaul Return 15%','line',0,'#006400',annaul_curve,dashStyle='dash'),

            get_series_element('Model Return','line',0,'#0000FF',model_return_nav),
            get_series_element('Model Spread','line',0,'#FF0000',model_index_spread),

            get_series_element('Bias','line',1,'#FF0000',log_bias_model_20),
        ]
    });
});
