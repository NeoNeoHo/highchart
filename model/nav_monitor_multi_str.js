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
var app = express();
var pg = require('pg');
var Q = require('q');
pg.defaults.poolSize = 50;


// all environments
app.set('port', process.env.PORT || 9992);
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
    au: "AS30 Index",
    de: "DAX Index",
    cn: "SHSZ300 Index",
    jp: "TPX Index",
    in: "SENSEX Index",
    us: "SPX Index",
    hk: "HSI Index",
    uk: "UKX Index",
    asia_basket: "Asia",
    global_basket: "Global",
};
var market_index_future = {
    tw: "FT1 Index",
    cn: "IFB1 Index",
    jp: "TP1 Index",
};

var get_model_nav = function(market, strategy){
    var def = Q.defer();
    var conString_market = "postgres://benson:benson@192.168.1.99:5432/" + market;
    console.log(strategy);
    pg.connect(conString_market, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT da,nav from public.model_nav_multi_strategy where da>=$1 and strategy=$2 order by da asc;";
        // console.log(sqlstr);
        client.query(sqlstr, ['2010-06-01', strategy], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                var nav = 1;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    var t_stamp = new Date(row.da).getTime();
                    var row_data = [t_stamp,row.nav];
                    data.push(row_data);
                }

                var jsonString = JSON.stringify(data,null);
                // console.log(jsonString);
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_index_nav = function(market){
    var def = Q.defer();
    var conString_daily = "postgres://benson:benson@192.168.1.99:5432/daily";
    pg.connect(conString_daily, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT to_char(da,'YYYY-MM-DD') as da,cl from public.price where code=$1 and da>=$2 order by da asc;";
        client.query(sqlstr, [market_index[market], '2010-06-01'], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                var first_price = rows[0].cl;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    var t_stamp = new Date(row.da).getTime();
                    var row_data = [t_stamp,row.cl/first_price];
                    data.push(row_data);
                }
                var jsonString = JSON.stringify(data,null);
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_future_spread = function(market){
    var def = Q.defer();
    var conString_daily = "postgres://benson:benson@192.168.1.99:5432/daily";
    pg.connect(conString_daily, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT to_char(a.da,'YYYY-MM-DD') as da, (a.cl-b.cl)/b.cl*100 as spread from public.price a inner join public.price b on a.code=$1 and b.code=$2 and a.da=b.da and a.da>=$3 order by a.da asc;";
        client.query(sqlstr, [market_index_future[market], market_index[market], '2010-06-01'], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    var t_stamp = new Date(row.da).getTime();
                    var row_data = [t_stamp,row.spread];
                    data.push(row_data);
                }
                var jsonString = JSON.stringify(data,null);
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_real_nav = function(market){
    var def = Q.defer();
    var conString_market = "postgres://benson:benson@192.168.1.99:5432/" + market;
    pg.connect(conString_market, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT to_char(da,'YYYY-MM-DD') as da,nav from public.aum where da>=$1 order by da asc;";
        client.query(sqlstr,['2014-09-22'], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                var first_price = rows[0].nav;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    var t_stamp = new Date(row.da).getTime();
                    var row_data = [t_stamp,row.nav/first_price];
                    data.push(row_data);
                }
                var jsonString = JSON.stringify(data,null);
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_nav_of_strategy = function(market, strategy){
    var def = Q.defer();   
    var conString_daily = "postgres://benson:benson@192.168.1.99:5432/" + market ;
    pg.connect(conString_daily, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT da, nav from model_nav_multi_strategy where strategy=$1 and da >$2 order by da asc;";
        // console.log(sqlstr);
        client.query(sqlstr, [strategy, '2010-06-01'], function(err, result) {
            if (err) {
                def.reject(err);
                console.log(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    var t_stamp = new Date(row.da).getTime();
                    var row_data = [t_stamp,row.nav];
                    data.push(row_data);
                }
                outdata = {
                    strategy: strategy,
                    data: data
                }
                def.resolve(outdata);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_strategy_codes = function(market){
    var def = Q.defer();
    var conString_daily = "postgres://benson:benson@192.168.1.99:5432/"+market ;
    pg.connect(conString_daily, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT distinct strategy from model_nav_multi_strategy order by strategy asc;";
        client.query(sqlstr, [], function(err, result) {
            if (err) {
                def.reject(err);
                console.log(err);
            }
            else {
                var data = {};
                var rows = result.rows;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];                    
                    var row_data = row.strategy;
                    data[i] = row_data;
                }
                def.resolve(data);
                client.end();
            }
        });
    });
    return def.promise;
};


var get_strategy_codes_price = function(market){
    console.log(market);
    var def = Q.defer();
    get_strategy_codes(market)
    .then(function(codes){
        ps = [];
        codes_num = Object.keys(codes).length;
        for (var i = 0; i < codes_num; i++) {
            code = codes[i];
            p = get_nav_of_strategy(market, code);
            ps.push(p);
        }
        Q.all(ps)
        .then(function(data){
            returndata = {};
            for (var i = 0; i < data.length; i++) {
                subdata = data[i];
                lcode = subdata.strategy;
                ldata = subdata.data;
                // console.log(ldata);
                returndata[lcode] = ldata;
            }
            var jsonString = JSON.stringify(returndata,null);
            def.resolve(jsonString);            
            client.end();
        });
    });
    return def.promise;
};
app.get('/chart/monitor/:market/:strategy', function(req, res){
    var market = req.params.market;
    var strategy = req.params.strategy;
    var render_data = {
        name: market_index[market],
        market: market,
        strategy: strategy,
    };

    var promises = [];

    var p1 = get_index_nav(market);
    var p2 = get_model_nav(market,strategy);
    var p3 = get_future_spread(market);
    var p4 = get_strategy_codes_price(market);
    var p5 = get_strategy_codes(market);


    promises.push(p1);
    promises.push(p2);
    promises.push(p3);
    promises.push(p4);
    promises.push(p5);


    Q.all(promises)
    .then(function(data){
        render_data.index_nav = data[0];
        render_data.model_nav = data[1];
        render_data.future_spread = data[2];
        render_data.strategy_codes_price = data[3];
        render_data.strategy_codes = JSON.stringify(data[4], null);
        res.render('nav_monitor_multi_str.jade', render_data);
    });

});

app.get('/monitor', function(req, res){
    res.render('nav_monitor_multi_str.jade');
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
