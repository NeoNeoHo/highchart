$(function() {    
    var model_nav = window.model_nav;
    var index_nav = window.index_nav;
    var market = window.market;
    var strategy = window.strategy;
    var model_nav_ma_10 = SMA(model_nav, 10);
    var model_nav_ma_20 = SMA(model_nav, 20);
    var model_nav_ma_50 = SMA(model_nav, 50);
    var model_nav_ma_100 = SMA(model_nav, 100);

    var bias_model_10 = get_bias(model_nav, model_nav_ma_10);
    var bias_model_20 = get_bias(model_nav_ma_10, model_nav_ma_20);
    var bias_model_50 = get_bias(model_nav_ma_20, model_nav_ma_50);
    var bias_model_100 = get_bias(model_nav_ma_50, model_nav_ma_100);
    var bias_model_summation_1 = time_series_add(bias_model_10,bias_model_20);
    var bias_model_summation_2 = time_series_add(bias_model_summation_1,bias_model_50);
    var bias_model_summation_3 = time_series_add(bias_model_summation_2,bias_model_100);
    var bias_model_summation_3_sma_20 = SMA(bias_model_summation_3, 20);
    var bias_model_summation_3_sma_50 = SMA(bias_model_summation_3, 50);
    var log_bias_model_20 = get_log_bias(model_nav, model_nav_ma_20);

    var histogram_model_10 = get_histogram(bias_model_10,100);
    var histogram_model_20 = get_histogram(bias_model_20,100);
    var histogram_model_50 = get_histogram(bias_model_50,100);
    var histogram_model_100 = get_histogram(bias_model_100,100);
    var hist_flag_dict_10 = get_current_histogram_dict(histogram_model_10, bias_model_10, 3);
    var hist_flag_dict_20 = get_current_histogram_dict(histogram_model_20, bias_model_20, 3);
    var hist_flag_dict_50 = get_current_histogram_dict(histogram_model_50, bias_model_50, 3);
    var hist_flag_dict_100 = get_current_histogram_dict(histogram_model_100, bias_model_100, 3);

    var axis_fontsize = '30px';
    var title_fontsize = '30px';
    var subtitle_fontsize = '20px';
    var tooltip_fontsize = '20px';

    $('#bias_histogram').highcharts({
        title: {
            text: strategy + ' Bias Histogram',
            style:{
                fontSize: '32px',
                color:'#000080'
            }
        },
        chart: {
            plotBorderWidth: 2,
            zoomType: 'x',
        },
        legend: {
            enabled: false,
            floating: true,
            align: 'right',
            backgroundColor: '#FFFFFF',
            borderWidth: 2,
            layout: 'vertical',
            verticalAlign: 'top',
            x: -100,
            y: 100,
            shadow: true
        },
        plotOptions: {
            column: {
                groupPadding: 0,
                pointPadding: 0,
                // borderWidth: 0
            }
        },
        xAxis:{
            title: {
                enabled: true,
                text: 'Bias %',
                style: {fontSize: axis_fontsize}
            },
            startOnTick: false,
            endOnTick: false,
            labels:{
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                }
            },
        },
        yAxis: [
            get_yAxis_element('10-Day Bias', null, 200),
            get_yAxis_element('10 to 20-Day Bias', 280, 200),
            get_yAxis_element('20 to 50-Day Bias', 520, 200),
            get_yAxis_element('50 to 100-Day Bias', 740, 200),
        ],
        series: [
            get_series_element('Histogram of 10-Day Bias','column',yAxis=0,'#FFA500',histogram_model_10, id='histogram_model_10'),
            get_series_element('Histogram of 20-Day Bias','column',1,'#FF0000',histogram_model_20, id='histogram_model_20'),
            get_series_element('Histogram of 50-Day Bias','column',2,'#0000FF',histogram_model_50, id='histogram_model_50'),
            get_series_element('Histogram of 100-Day Bias','column',3,'#006400',histogram_model_100, id='histogram_model_100'),
            get_flag_element(hist_flag_dict_10, 'histogram_model_10', yAxis=0, 'squarepin', 60),
            get_flag_element(hist_flag_dict_20, 'histogram_model_20', 1, 'squarepin', 60),
            get_flag_element(hist_flag_dict_50, 'histogram_model_50', 2, 'squarepin', 60),
            get_flag_element(hist_flag_dict_100, 'histogram_model_100', 3, 'squarepin', 60),
        ]

    });


    $('#bias_figure').highcharts({
        title: {
            text: strategy + ' Bias Histogram',
            style:{
                fontSize: '32px',
                color:'#000080'
            }
        },
        chart: {
            plotBorderWidth: 2,
            zoomType: 'x',
        },
        legend: {
            enabled: false,
            floating: true,
            align: 'right',
            backgroundColor: '#FFFFFF',
            borderWidth: 2,
            layout: 'vertical',
            verticalAlign: 'top',
            x: -100,
            y: 100,
            shadow: true
        },
        plotOptions: {
            series: {
                animation: {
                    duration: 1000
                },
                dataGrouping: {
                    enabled: false
                },
                marker: {
                    enabled: false
                }
            },
        },
        xAxis:{
            type: 'datetime',
            title: {
                enabled: true,
                text: 'Date',
                style: {fontSize: axis_fontsize}
            },
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
            get_yAxis_element('10-Day Bias %', null, 200, opposite=false, plotLines=[{value: 0, width: 2, color: '#FFA500', zIndex: -1}]),
            get_yAxis_element('10 to 20-Day Bias', 280, 200, opposite=false, plotLines=[{value: 0, width: 2, color: '#FF0000', zIndex: -1}]),
            get_yAxis_element('20 to 50-Day Bias', 520, 200, opposite=false, plotLines=[{value: 0, width: 2, color: '#0000FF', zIndex: -1}]),
            get_yAxis_element('50 to 100-Day Bias', 740, 200,opposite=false, plotLines=[{value: 0, width: 2, color: '#006400', zIndex: -1}]),
            get_yAxis_element('Bias Summary', 960, 200,opposite=false, plotLines=[{value: 0, width: 2, color: '#006400', zIndex: -1}]),
            get_yAxis_element('Bias Sumation', 1180, 200,opposite=false, plotLines=[{value: 0, width: 2, color: '#006400', zIndex: -1}]),
        ],
        series: [
            get_series_element('Histogram of 10-Day Bias','line',yAxis=0,'#FFA500',bias_model_10),
            get_series_element('Histogram of 20-Day Bias','line',1,'#FF0000',bias_model_20),
            get_series_element('Histogram of 50-Day Bias','line',2,'#0000FF',bias_model_50),
            get_series_element('Histogram of 100-Day Bias','line',3,'#006400',bias_model_100),
            get_series_element('Histogram of 10-Day Bias','line',yAxis=4,'#FFA500',bias_model_10),
            get_series_element('Histogram of 20-Day Bias','line',4,'#FF0000',bias_model_20),
            get_series_element('Histogram of 50-Day Bias','line',4,'#0000FF',bias_model_50),
            get_series_element('Histogram of 100-Day Bias','line',4,'#006400',bias_model_100),
            get_series_element('Regression Sum','line',5,'#006400',bias_model_summation_3),
            get_series_element('SMA 20','line',5,'#FF0000',bias_model_summation_3_sma_20),
            get_series_element('SMA 50','line',5,'#0000FF',bias_model_summation_3_sma_50),
        ]

    });

});
