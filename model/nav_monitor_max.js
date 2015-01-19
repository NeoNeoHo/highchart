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


// all environments
app.set('port', process.env.PORT || 9995);
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
    au: " ",
    de: " ",
    cn: "IFB1 Index",
    jp: "TP1 Index",
    in: " ",
    us: " ",
    hk: " ",
    uk: " ",
    asia_basket: "",
    global_basket: "",
};

var get_model_nav = function(market, which_table){
    var def = Q.defer();
    var conString_market = "postgres://benson:benson@192.168.1.99:5432/" + market;
    pg.connect(conString_market, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        if (which_table == 'max' || market != 'cn'){
            sqlstr = "SELECT to_char(da,'YYYY-MM-DD') as da,alpha from public.model_alpha_max where da>=$1 order by da asc;";
        }
        if (which_table == 'benson' && market == 'cn'){
            sqlstr = "SELECT to_char(da,'YYYY-MM-DD') as da,alpha from public.model_alpha_benson where da>=$1 order by da asc;";
        }
        client.query(sqlstr, ['2010-06-25'], function(err, result) {
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
                    nav = nav*(1+row.alpha);
                    var row_data = [t_stamp,nav];
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

var get_index_nav = function(market){
    var def = Q.defer();
    var conString_daily = "postgres://benson:benson@192.168.1.99:5432/daily";
    pg.connect(conString_daily, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT to_char(da,'YYYY-MM-DD') as da,cl from public.price where code=$1 and da>=$2 order by da asc;";
        client.query(sqlstr, [market_index[market], '2010-06-25'], function(err, result) {
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
        client.query(sqlstr, [market_index_future[market], market_index[market], '2010-06-25'], function(err, result) {
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

var get_derking_nav = function(market){
    var def = Q.defer();
    var conString_www = "postgres://benson:benson@192.168.1.99:5432/www";
    pg.connect(conString_www, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT to_char(da,'YYYY-MM-DD') as da,nav from public.derking1 where da>=$1 order by da asc;";
        client.query(sqlstr, ['2007-05-25'], function(err, result) {
            if (err) {
                def.reject(err);
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
                var jsonString = JSON.stringify(data,null);
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_inventory_beta = function(market){
    var def = Q.defer();
    var conString_daily = "postgres://benson:benson@192.168.1.99:5432/" + market;
    pg.connect(conString_daily, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT to_char(da,'YYYY-MM-DD') as da,beta from public.inventory_beta where da>=$1 order by da asc;";
        client.query(sqlstr, ['2012-05-25'], function(err, result) {
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
                    var row_data = [t_stamp,row.beta];
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

var get_market_alpha_sum = function(market, p_or_n){
    var def = Q.defer();
    var conString_daily = "postgres://benson:benson@192.168.1.99:5432/www" ;
    pg.connect(conString_daily, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT to_char(da,'YYYY-MM-DD') as da, " + p_or_n +" as alpha from public.market_alpha_sum where market = '" + market + "' and da>=" + "'2010-06-25' and which_pool = 'big_pool' order by da asc;";
        client.query(sqlstr, [], function(err, result) {
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
                    var row_data = [t_stamp,row.alpha];
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

app.get('/chart/monitor2/:market', function(req, res){
    var market = req.params.market;
    var render_data = {
        name: market_index[market],
        market: market,
    };

    var promises = [];

    var p1 = get_index_nav(market);
    var p2 = get_model_nav(market,'max');
    var p3 = get_real_nav(market);
    var p4 = get_future_spread(market);
    var p5 = get_derking_nav(market);
    var p6 = get_model_nav(market,'benson');
    var p7 = get_inventory_beta(market);
    var p8 = get_market_alpha_sum(market, 'p_alpha_sum');
    var p9 = get_market_alpha_sum(market, 'n_alpha_sum');

    promises.push(p1);
    promises.push(p2);
    promises.push(p3);
    promises.push(p4);
    promises.push(p5);
    promises.push(p6);
    promises.push(p7);
    promises.push(p8);
    promises.push(p9);

    Q.all(promises)
    .then(function(data){
        render_data.index_nav = data[0];
        render_data.model_nav = data[1];
        render_data.real_nav = data[2];
        render_data.future_spread = data[3];
        render_data.derking_nav = data[4];
        render_data.model_nav_benson = data[5];
        render_data.inventory_beta = data[6];
        render_data.p_alpha_sum = data[7];
        render_data.n_alpha_sum = data[8];
        res.render('nav_monitor_max.jade', render_data);
    });

});

app.get('/monitor', function(req, res){
    res.render('nav_monitor_max.jade');
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
