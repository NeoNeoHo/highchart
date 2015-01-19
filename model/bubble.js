/**
 * Module dependencies.
 */

var hosts = [
    '192.168.1.77:9042',
    '192.168.1.42:9042',
    '192.168.1.99:9042',
    '192.168.1.88:9042'
];

var express = require('express');
var routes = require('../routes');
var user = require('../routes/user');
var http = require('http');
var path = require('path');
var async = require('async');
var app = express();
var pg = require('pg');
var Q = require('q');

// all environments
app.set('port', process.env.PORT || 5009);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, '../views')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


var market_index = {
    tw: "TWSE Index",
    cn: "SHSZ300 Index",
    jp: "TPX500 Index",
    hk: "HSI Index",
};

var country_name = {
    tw: "Taiwan",
    cn: "China",
    jp: "Japan",
    hk: "Hong Kong",
};

var get_typhoon_all_data = function(market){
    var def = Q.defer();
    var conString_market = "postgres://benson:benson@192.168.1.99:5432/" + 'www';
    pg.connect(conString_market, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT da, green_diff,gray,ticker_size from public.typhoon where market=$1 order by da desc;";
        console.log(sqlstr);
        client.query(sqlstr, [market], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                var nav = 1;
                for(var i=0; i<=rows.length-180; i++) {
                    var row = rows[i];
                    var row_data = [row.green_diff, row.gray, row.ticker_size];
                    data.push(row_data);
                }
                var jsonString = JSON.stringify(data,null);
                console.log('get_typhoon_all_data')
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_typhoon_last_month_data = function(market){
    var def = Q.defer();
    var conString_market = "postgres://benson:benson@192.168.1.99:5432/" + 'www';
    pg.connect(conString_market, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT da, green_diff,gray,ticker_size from public.typhoon where market=$1 order by da desc limit 21;";
        console.log(sqlstr);
        client.query(sqlstr, [market], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                var nav = 1;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    var row_data = [row.green_diff, row.gray, row.ticker_size];
                    data.push(row_data);
                }
                var jsonString = JSON.stringify(data,null);
                console.log('get_typhoon_last_month_data')
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_typhoon_short_ma_last_month_data = function(market){
    var def = Q.defer();
    var conString_market = "postgres://benson:benson@192.168.1.99:5432/" + 'www';
    pg.connect(conString_market, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT da, green_diff_2,gray_2,ticker_size from public.typhoon where market=$1 order by da desc limit 21;";
        console.log(sqlstr);
        client.query(sqlstr, [market], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                var nav = 1;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    var row_data = [row.green_diff_2, row.gray_2, row.ticker_size];
                    data.push(row_data);
                }
                var jsonString = JSON.stringify(data,null);
                console.log('get_typhoon_short_ma_last_month_data')
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_slope_data = function(market, date){
    // 1-01-01
    // 2-02-02
    var def = Q.defer();
    var conString_market = "postgres://benson:benson@192.168.1.99:5432/" + 'www';
    pg.connect(conString_market, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT x1,y1,x2,y2 from public.typhoon where market=$1 and da=$2;";
        console.log(sqlstr);
        client.query(sqlstr, [market, date], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                var nav = 1;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    data.push( [row.x1, row.y1]);
                    data.push( [row.x2, row.y2]);
                }
                var jsonString = JSON.stringify(data,null);
                console.log('get_slope_data')
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_x_std_line_data = function(market){
    var def = Q.defer();
    var conString_market = "postgres://benson:benson@192.168.1.99:5432/" + 'www';
    pg.connect(conString_market, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT x1 from public.typhoon where market=$1 and da=$2;";
        console.log(sqlstr);
        client.query(sqlstr, [market, '1-00-00'], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                var nav = 1;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    data.push( [row.x1]);
                }
                var jsonString = JSON.stringify(data,null);
                console.log('get_x_std_line_data')
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_y_std_line_data = function(market){
    var def = Q.defer();
    var conString_market = "postgres://benson:benson@192.168.1.99:5432/" + 'www';
    pg.connect(conString_market, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT y1 from public.typhoon where market=$1 and da=$2;";
        console.log(sqlstr);
        client.query(sqlstr, [market, '0-01-00'], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                var nav = 1;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    data.push( [row.y1]);
                }
                var jsonString = JSON.stringify(data,null);
                console.log('get_y_std_line_data')
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_text_std1_data = function(market){
    var def = Q.defer();
    var conString_market = "postgres://benson:benson@192.168.1.99:5432/" + 'www';
    pg.connect(conString_market, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT std from public.typhoon where market=$1 and da=$2;";
        console.log(sqlstr);
        client.query(sqlstr, [market, '1-00-00'], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                var nav = 1;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    data.push( [row.std]);
                }
                var jsonString = JSON.stringify(data,null);
                console.log('get_text_std1_data')
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_text_std2_data = function(market){
    var def = Q.defer();
    var conString_market = "postgres://benson:benson@192.168.1.99:5432/" + 'www';
    pg.connect(conString_market, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT std from public.typhoon where market=$1 and da=$2;";
        console.log(sqlstr);
        client.query(sqlstr, [market, '0-01-00'], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                var nav = 1;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    data.push( [row.std]);
                }
                var jsonString = JSON.stringify(data,null);
                console.log('get_text_std2_data')
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_date= function(market){
    var def = Q.defer();
    var conString_market = "postgres://benson:benson@192.168.1.99:5432/" + 'www';
    pg.connect(conString_market, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT da from public.typhoon where market=$1 order by da desc limit 1;";
        console.log(sqlstr);
        client.query(sqlstr, [market], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                var nav = 1;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    data.push( [row.da]);
                }
                // var jsonString = JSON.stringify(data,null);
                // console.log('get_date')
                def.resolve(data);
                client.end();
            }
        });
    });
    return def.promise;
};

app.get('/typhoon/:market', function(req, res){
    var market = req.params.market;
    var render_data = {
        name: market_index[market],
        market: market,
    };

    var promises = [];

    var p1 = get_typhoon_all_data(market);
    var p2 = get_typhoon_last_month_data(market);
    var p3 = get_typhoon_short_ma_last_month_data(market);
    var p4 = get_slope_data(market,'1-01-01');
    var p5 = get_slope_data(market,'1-02-02');
    var p6 = get_x_std_line_data(market);
    var p7 = get_y_std_line_data(market);
    var p8 = get_text_std1_data(market);
    var p9 = get_text_std2_data(market);
    var p10 = get_date(market);

    promises.push(p1);
    promises.push(p2);
    promises.push(p3);
    promises.push(p4);
    promises.push(p5);
    promises.push(p6);
    promises.push(p7);
    promises.push(p8);
    promises.push(p9);
    promises.push(p10);

    Q.all(promises)
    .then(function(data){
        render_data.typhoon = data[0];
        render_data.typhoon_last_month = data[1];
        render_data.typhoon_short_last_month = data[2];
        render_data.slope1 = data[3];
        render_data.slope2 = data[4];
        render_data.x_std_line = data[5];
        render_data.y_std_line = data[6];
        render_data.text_std1 = data[7];
        render_data.text_std2 = data[8];
        render_data.date = data[9];
        res.render('typhoon.jade', render_data);
    });
})
app.get('/typhoon', function(req, res){
    res.render('typhoon.jade');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
