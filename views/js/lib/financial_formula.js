var SMA = function(data, width){
    var data_ma = [];
    var moving_sum = 0;
    cl_data = data[1].length-1;
    for (var i=0;i<width;i++){
        moving_sum = moving_sum + data[i][cl_data];
        data_ma.push([data[i][0],data[i][cl_data]]);
    }
    for (var i=width;i<data.length;i++){
        moving_sum = moving_sum + data[i][cl_data] - data[i-width][cl_data];
        data_ma.push([data[i][0],moving_sum / width]);
    }
    return data_ma;
};

var Annaul_curve = function(data, set_annaul_ret){
    var annaul_curve = [];
    var daily_ret = set_annaul_ret / 252;
    var ret = 1;
    for (var i=0;i<data.length;i++){
        annaul_curve.push([data[i][0],ret]);
        ret = ret * (1 + daily_ret);
    }
    return annaul_curve;
};

var Normalize_nav = function(data, model_data){
    var first_day = data[0][0];
    var num_model_data = model_data.length;
    var factor = 1;
    for (var i=num_model_data-1;i>=0;i--){
        if (first_day == model_data[i][0]){
            factor = model_data[i][1];
            break;
        }
    }
    var num_data = data.length;
    var return_data = [];
    for (var i=0;i<num_data;i++){
        return_data.push([data[i][0], data[i][1] * factor]);
    }
    return return_data;
};

var time_series_add = function(data1, data2) {
    var result = [];
    for (var i=0; i < data1.length; i++) {
        result.push([data1[i][0], data1[i][1] + data2[i][1]]);
    }
    return result;
};

var time_series_minus = function(data1, data2) {
    var result = [];
    for (var i=0; i < data1.length; i++) {
        result.push([data1[i][0], data1[i][1] - data2[i][1]]);
    }
    return result;
};

var get_daily_return = function(data, ratio) {
    var daily_return =[];
    var ret = 0;
    daily_return.push([data[0][0], 0]);
    for (var i = 1; i < data.length; i++) {
        ret = (data[i][1]/data[i-1][1] - 1) / ratio;
        daily_return.push([data[i][0], ret]);
    }
    return daily_return;
};

var get_return_nav = function(data) {
    var result = [];
    var nav = 1;
    result.push([data[0][0], 1]);
    for (var i = 1; i < data.length; i++) {
        nav = nav * (1 + data[i][1]);
        result.push([data[i][0], nav]);
    }
    return result;
};


var get_cumulated_mdd_info = function(data){
    var cumulated_mdd_info = {mdd:[], days:[]};
    var mdds = [];
    var peak = -100;
    var mdd = 0;
    var days = [];
    var day = 0;
    var num_data = data.length;
    for (var i = 0; i < num_data; i ++){
        if (data[i][1] < peak){
            local_dd = (peak-data[i][1])/peak*100;
            if (local_dd > mdd){
                mdd = local_dd;
            }
        }else{
            peak = data[i][1];
        }
        mdds.push([data[i][0], mdd]);
    }
    cumulated_mdd_info.mdd = mdds;
    return cumulated_mdd_info;
};

var get_drawdown_info = function(data){
    var drawdown_info = {dd:[], days:[]};
    var drawdown = [];
    var peak = -100;
    var mdd = 0;
    var day = 0;
    var days = [];
    var num_data = data.length;
    for (var i = 0; i < num_data; i ++){
        if (data[i][1] < peak){
            mdd = (peak-data[i][1])/peak*100;
            day++;
        }else{
            peak = data[i][1];
            mdd = 0;
            day = 0;
        }
        drawdown.push([data[i][0], mdd]);
        days.push([data[i][0], day]);
    }
    drawdown_info.dd = drawdown;
    drawdown_info.days = days;
    return drawdown_info;
};

var get_cumulated_roundup_info = function(data){
    var cumulated_roundups = [];
    var lastpeak = data[0][1];
    var peak = lastpeak;
    var roundup = 0;
    var local_roundup = 0;
    var num_data = data.length;
    for (var i = 0; i < num_data; i ++){
        if (data[i][1] >= peak){
            local_roundup = (data[i][1]-lastpeak)/lastpeak*100;
            peak = data[i][1];
            if (local_roundup > roundup){
                roundup = local_roundup;
            }
        }else{
            lastpeak = peak;
        }
        cumulated_roundups.push([data[i][0], roundup]);
    }
    return cumulated_roundups;
};

var Roundup = function(data){
    var roundups = [];
    var lastpeak = data[0][1];
    var peak = lastpeak;
    var roundup = 0;
    var num_data = data.length;
    for (var i = 0; i < num_data; i ++){
        if (data[i][1] >= peak){
            roundup = (data[i][1]-lastpeak)/lastpeak*100;
            peak = data[i][1];
        }else{
            lastpeak = peak;
            roundup = 0;
        }
        roundups.push([data[i][0], roundup]);
    }
    return roundups;
};

var get_performance = function(data){
    var performance = {annaul:0, sharpe:0, calmar:0, mdd:0};
    performance.annaul = get_annaul_return(data);
    performance.sharpe = get_sharpe_ratio(data);
    performance.calmar = get_calmar_ratio(data);
    var mdd_data_info = get_cumulated_mdd_info(data);
    performance.mdd = mdd_data_info.mdd[mdd_data_info.mdd.length-1][1];
    return performance;
};

var get_sharpe_ratio = function(data){
    var num_data = data.length;
    var data_nav_return = [];
    for (var i=1;i<num_data;i++){
        data_nav_return.push((data[i][1]-data[i-1][1])/data[i-1][1]);
    }
    var mean = Mean(data_nav_return);
    var std = Stdev(data_nav_return);
    return mean/std*Math.sqrt(252);
};

var get_annaul_return = function(data){
    var ret = data[data.length-1][1]/data[0][1];
    return (Math.pow(ret, 252/data.length) - 1) * 100;
};

var get_calmar_ratio = function(data){
    var cumulated_mdd_info = get_cumulated_mdd_info(data);
    return get_annaul_return(data) / cumulated_mdd_info.mdd[data.length-1][1];
};

var get_drawdown_period = function(data){
    var drawdown = get_drawdown_info(data);
    var drawdown_info = {start_date:'', end_date:'', num_date:0, drawdown:0};
    var num_date = 0;
    if (drawdown.dd.length == 1){
        var counter = 0;
        drawdown_info.start_date = '';
        drawdown_info.end_date = '';
        drawdown_info.drawdown = 0;
        drawdown_info.num_date = 0;
        return drawdown_info;
    }
    else {
        var counter = drawdown.dd.length-2;
    }

    while (drawdown.dd[counter][1] == 0){
        counter--;
        if (counter <= 1){
            break;
        }
    }
    var a = new Date(drawdown.dd[counter+1][0]);
    drawdown_info.end_date = a.getFullYear() + '/' + (a.getMonth()+1) + '/' + a.getDate();
    peak_dd = drawdown.dd[counter+1][1];
    while (drawdown.dd[counter][1] != 0){
        if (drawdown.dd[counter][1] >= peak_dd){
            peak_dd = drawdown.dd[counter][1];
        }
        counter--;
        num_date++;
    }
    var b = new Date(drawdown.dd[counter][0]);
    drawdown_info.start_date = b.getFullYear() + '/' + (b.getMonth()+1) + '/' + b.getDate();
    drawdown_info.drawdown = peak_dd;
    drawdown_info.num_date = num_date;
    return drawdown_info;
};

var Variance = function(arr){
    var len = 0;
    var sum=0;
    for(var i=0;i<arr.length;i++){
        if (arr[i] == ""){}
        else{
            len = len + 1;
            sum = sum + parseFloat(arr[i]); 
        }
    }
    var v = 0;
    if (len > 1){
        var mean = sum / len;
        for(var i=0;i<arr.length;i++){
            if (arr[i] == ""){}
            else{
                v = v + (arr[i] - mean) * (arr[i] - mean);              
            }        
        }
        return v / len;
    }
    else{
         return 0;
    }    
};

var Stdev = function(data){
    var stdev = Math.sqrt(Variance(data));
    return stdev;
};

//calculate the mean of a number array
var Mean = function(arr){
    var len = 0;
    var sum = 0;   
    for(var i=0;i<arr.length;i++){
        if (arr[i] == ""){}
        else{
         len = len + 1;
         sum = sum + parseFloat(arr[i]); 
        }
    }
    return sum / len;    
};

var Max = function(data){
    var max = data[0];
    for (var i=0;i<data.length;i++){
        if (data[i]>max){
            max = data[i]
        }
    }
    return max;
};

var Min = function(data){
    var min = data[0];
    for (var i=0;i<data.length;i++){
        if (data[i]<min){
            min = data[i]
        }
    }
    return min;
};

var get_bias = function(data_lead, data_lag){
    var data_bias = [];
    for (var i=0;i<data_lead.length;i++){
        bias = (data_lead[i][1] - data_lag[i][1]) / data_lead[i][1] * 100;
        data_bias.push([data_lead[i][0], bias]);
    }
    return data_bias;
};

var get_log_bias = function(data_lead, data_lag){
    var data_bias = [];
    for (var i=0;i<data_lead.length;i++){
        bias = Math.log(data_lead[i][1] / data_lag[i][1]);
        data_bias.push([data_lead[i][0], bias]);
    }
    return data_bias;
};

var get_histogram = function(data, width){
    var raw_data = [];
    for (var i=0;i<data.length;i++){
        raw_data.push(parseFloat(data[i][1]));
    }
    var linewidth = Math.abs((Max(raw_data) - Min(raw_data))) / width;
    var mini = Min(raw_data);
    for (var i=0, histogram_count=[];i<width;i++){
        histogram_count.push(0);
    }

    for (var i=0;i<raw_data.length;i++){
        histogram_count[Math.floor((raw_data[i]-mini)/linewidth)] ++;
    }

    for (var i=0, histogram=[];i<width;i++){
        histogram.push([Min(raw_data)+linewidth*(i), histogram_count[i]]);
    }
    return histogram;
};

var get_current_histogram_dict = function(histogram, bias_data, num_dict){
    var hist_dict = [];
    for (var i=bias_data.length-num_dict;i<bias_data.length;i++){
        var today_bias = bias_data[i][1];
        for (var j=0;j<histogram.length-1;j++){
            if (today_bias >= histogram[j][0] && today_bias < histogram[j+1][0]){
                var a = new Date(bias_data[i][0]);
                title = a.getFullYear() + '/' + (a.getMonth()+1) + '/' + a.getDate();
                hist_dict.push({x:histogram[j][0], y:histogram[j][1], title:title});
            }
        }
    }
    return hist_dict;
};

