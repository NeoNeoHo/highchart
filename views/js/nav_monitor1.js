$(function() {    
    var model_nav = window.model_nav;
    var index_nav = window.index_nav;
    var real_nav = window.real_nav;
    var market = window.market;
    var future_spread = window.future_spread;
    var inventory_beta = window.inventory_beta;
    var p_alpha_sum = window.p_alpha_sum;
    var n_alpha_sum = window.n_alpha_sum;
    real_nav = Normalize_nav(real_nav, model_nav);
    var model_nav_ma_10 = SMA(model_nav, 10);
    var model_nav_ma_20 = SMA(model_nav, 20);
    var model_nav_ma_50 = SMA(model_nav, 50);
    var model_nav_ma_100 = SMA(model_nav, 100);
    var annaul_curve = Annaul_curve(model_nav, 0.15);
    var p_alpha_sum_20 = SMA(p_alpha_sum, 20);
    var n_alpha_sum_20 = SMA(n_alpha_sum, 20);
    
    var cumulated_model_mdd_info = get_cumulated_mdd_info(model_nav);
    var cumulated_real_mdd_info = get_cumulated_mdd_info(real_nav);
    var model_dd = get_drawdown_info(model_nav);
    var real_dd = get_drawdown_info(real_nav);

    var cumulated_model_roundup = get_cumulated_roundup_info(model_nav);
    var model_roundup = Roundup(model_nav);
    var cumulated_real_roundup = get_cumulated_roundup_info(real_nav);
    var real_roundup = Roundup(real_nav);

    var model_performance = get_performance(model_nav);
    var real_performance = get_performance(real_nav);
    var model_drawdown_info = get_drawdown_period(model_nav);
    var real_drawdown_info = get_drawdown_period(real_nav);


    if (market == 'cn'){
        var derking_nav = window.derking_nav;
    }else{
        var derking_nav = [];
    }


    // Summary table
    $('#realnav').text((real_nav[real_nav.length-1][1] / real_nav[0][1]).toFixed(4));
    $('#realannaul').text(real_performance.annaul.toFixed(2));
    $('#realsharpe').text(real_performance.sharpe.toFixed(2));
    $('#realcalmar').text(real_performance.calmar.toFixed(2));
    $('#realmdd').text(real_performance.mdd.toFixed(2));
    $('#realdrawdown_period').html(real_drawdown_info.start_date + '</br> ~</br>' + real_drawdown_info.end_date + '</br></br> For ' + real_drawdown_info.num_date + ' day(s)');
    $('#realdrawdown').text(real_drawdown_info.drawdown.toFixed(2));

    $('#modelnav').text((model_nav[model_nav.length-1][1] / real_nav[0][1]).toFixed(4));
    $('#modelannaul').text(model_performance.annaul.toFixed(2));
    $('#modelsharpe').text(model_performance.sharpe.toFixed(2));
    $('#modelcalmar').text(model_performance.calmar.toFixed(2));
    $('#modelmdd').text(model_performance.mdd.toFixed(2));
    $('#modeldrawdown_period').html(model_drawdown_info.start_date + '</br> ~</br>' + model_drawdown_info.end_date + '</br></br> For ' + model_drawdown_info.num_date + ' day(s)');
    $('#modeldrawdown').text(model_drawdown_info.drawdown.toFixed(2));

    $('#itemnav').text('Inception Nav');
    $('#itemreal').text('Real');
    $('#itemmodel').text('Model');
    $('#itemannaul').text('Annaul');
    $('#itemsharpe').text('Sharpe');
    $('#itemcalmar').text('Calmar');
    $('#itemmdd').text('MDD');
    $('#itemdrawdown_period').text('Drawdown Period');
    $('#itemdrawdown').text('Last Drawdown');


    // Highchart 
    $('#nav_monitor').highcharts('StockChart', {
        title: {
            text: name + ' Nav Monitor',
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
            get_yAxis_element('Model Nav', null, 440),
            get_yAxis_element('Inventory Beta', 580, 120, opposite=true),
            get_yAxis_element('Market Alpha (Total Pool)', 720, 240),
            get_yAxis_element('Future Spread %', 980, 120, opposite=true),
            get_yAxis_element('DrawDown', 1100, 120),
            get_yAxis_element('DrawDown Days', 1260, 120, opposite=true),
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

        series : [
            get_series_element('Model Nav','line',0,'#696969',model_nav),
            get_series_element('Index Nav','line',0,'#000000',index_nav),
            get_series_element('Real Nav','line',0,'#FF69B4',real_nav),

            get_series_element('Model Nav SMA 10','line',0,'#FFA500',model_nav_ma_10),
            get_series_element('Model Nav SMA 20','line',0,'#FF0000',model_nav_ma_20),
            get_series_element('Model Nav SMA 50','line',0,'#0000FF',model_nav_ma_50),
            get_series_element('Model Nav SMA 100','line',0,'#006400',model_nav_ma_100),

            // get_series_element('Derking Nav','line',0,'#8B4513',derking_nav,dashStyle='dash'),
            // get_series_element('Annaul Return 15%','line',0,'#006400',annaul_curve,dashStyle='dash'),
            get_series_element('Inventory Beta','line',1,'#006400',inventory_beta),
            get_series_element('Positive Accu. Alpha SMA 20','line',2,'#FF0000',p_alpha_sum_20),
            get_series_element('Negative Accu. Alpha SMA 20','line',2,'#006400',n_alpha_sum_20),
            get_series_element('Future Spread %','column',3,'#FF0000',future_spread),
            
            get_series_element('Cumulated Model DrawDown','line',4,'#4169E1',cumulated_model_mdd_info.mdd),
            get_series_element('Cumulated Real DrawDown','line',4,'#FF0000',cumulated_real_mdd_info.mdd),
            get_series_element('Model DrawDown','area',4,'#4169E1',model_dd.dd),
            get_series_element('Real DrawDown','area',4,'#FF0000',real_dd.dd),

            get_series_element('Model DrawDown Days','line',5,'#FF0000',model_dd.days),

            // get_series_element('Cumulated Model RoundUp','line',4,'#006400',cumulated_model_roundup),
            // get_series_element('Model RoundUp','area',4,'#006400',model_roundup),
            // get_series_element('Cumulated Real RoundUp','line',4,'#FF0000',cumulated_real_roundup),
            // get_series_element('Real RoundUp','area',4,'#FF0000',real_roundup),
        ]
    });

});
