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
var posix = require('posix');
posix.setrlimit('nproc', { soft: 10000});
var limits = posix.getrlimit('nproc');
console.log(limits);
pg.defaults.poolSize = 50;

// all environments
app.set('port', process.env.PORT || 9990);
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

var get_model_nav = function(market, which_table){
    var def = Q.defer();
    var conString_market = "postgres://benson:benson@192.168.1.99:5432/" + market;
    pg.connect(conString_market, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        if (which_table == 'claude' || market != 'cn'){
            sqlstr = "SELECT to_char(da,'YYYY-MM-DD') as da,alpha from public.model_alpha where da>=$1 order by da asc;";
        }
        if (which_table == 'benson' && market == 'cn'){
            sqlstr = "SELECT to_char(da,'YYYY-MM-DD') as da,alpha from public.model_alpha_benson where da>=$1 order by da asc;";
        }
        console.log(sqlstr);
        client.query(sqlstr, ['2012-05-25'], function(err, result) {
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
                console.log('get_model_nav');
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_index_nav_daily = function(market){
    var def = Q.defer();
    var conString_daily = "postgres://benson:benson@192.168.1.99:5432/daily";
    pg.connect(conString_daily, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT to_char(da,'YYYY-MM-DD') as da,cl from public.price where code=$1 and da>=$2 order by da asc;";
        client.query(sqlstr, [market_index[market], '2010-04-16'], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    var t_stamp = new Date(row.da).getTime();
                    // console.log(t_stamp)
                    var row_data = [t_stamp,row.cl];
                    data.push(row_data);
                }
                var jsonString = JSON.stringify(data,null);
                console.log('get_index_nav_daily');
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_macd_forest_c_daily = function(market){
    var def = Q.defer();
    var conString_daily = "postgres://postgres:postgres@192.168.1.42:5433/trend_monitor";
    pg.connect(conString_daily, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        // sqlstr = "SELECT to_char(da,'YYYY-MM-DD hh:mi:ss') as da,c_above_0 from public.bomins_daily_macd_forest_c_d where code=$1 and da>=$2 order by da asc;";
        sqlstr = "SELECT to_char(da,'YYYY-MM-DD') as da,c_above_0 from public.bomins_daily_macd_forest_c_d where code=$1 and da>=$2 order by da asc;";
        client.query(sqlstr, [market_index[market], '2010-04-16'], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    var t_stamp = new Date(row.da).getTime();
                    // console.log(t_stamp)
                    var row_data = [t_stamp,row.c_above_0];
                    data.push(row_data);
                }
                var jsonString = JSON.stringify(data,null);
                console.log('get_macd_forest_c_daily');
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_index_wt = function(market){
    var def = Q.defer();
    var conString_daily = "postgres://benson:benson@192.168.1.99:5432/daily";
    pg.connect(conString_daily, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT to_char(da,'YYYY-MM-DD') as da,wt from public.xt where code=$1 and da>=$2 order by da asc;";
        client.query(sqlstr, [market_index[market], '2010-04-16'], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    var t_stamp = new Date(row.da).getTime();
                    // console.log(t_stamp)
                    var row_data = [t_stamp,row.wt];
                    data.push(row_data);
                }
                var jsonString = JSON.stringify(data,null);
                console.log('get_index_wt');
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_pool_alpha_count = function(market){
    var table_map = {
        cn: "alpha_cn",
        tw: "alpha_tw",
        jp: "alpha_jp",
    };
    var def = Q.defer();
    var conString_daily = "postgres://postgres:postgres@192.168.1.42:5433/alpha_monitor";
    pg.connect(conString_daily, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT da,measure from " + table_map[market] +" where strategy='pool_alpha_count' and da>=$1 order by da asc;";
        // console.log(table_map[market]);
        client.query(sqlstr, ['2010-04-16'], function(err, result) {
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
                    // console.log(t_stamp)
                    var row_data = [t_stamp,row.measure-0.5];
                    data.push(row_data);
                }
                var jsonString = JSON.stringify(data,null);
                console.log('get_pool_alpha_count');
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_vender_list = function(market){
    var def = Q.defer();
    var conString_daily = "postgres://benson:benson@192.168.1.99:5432/" + market ;
    pg.connect(conString_daily, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT distinct(vender_code) from vender_class_weight;";
        client.query(sqlstr, [], function(err, result) {
            if (err) {
                def.reject(err);
                console.log(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    var row_data = row.vender_code;
                    data.push(row_data);
                }
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_price_of_code = function(code){
    var def = Q.defer();   
    var conString_daily = "postgres://benson:benson@192.168.1.99:5432/daily" ;
    pg.connect(conString_daily, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT to_char(da,'YYYY-MM-DD') as da, cl from price where code=$1 and da >$2 order by da asc;";
        client.query(sqlstr, [code, '2010-04-16'], function(err, result) {
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
                    var row_data = [t_stamp,row.cl];
                    data.push(row_data);
                }
                outdata = {
                    code: code,
                    data: data
                }
                def.resolve(outdata);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_vender_codes = function(market){
    var def = Q.defer();
    var conString_daily = "postgres://benson:benson@192.168.1.99:5432/"+market ;
    pg.connect(conString_daily, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT distinct vender_code from vender_class_weight ;";
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
                    var row_data = row.vender_code;
                    data[i] = row_data;
                }
                def.resolve(data);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_vender_codes_price = function(market){
    console.log(market);
    var def = Q.defer();
    get_vender_codes(market)
    .then(function(codes){
        ps = [];
        codes_num = Object.keys(codes).length;
        for (var i = 0; i < codes_num; i++) {
            code = codes[i];
            p = get_price_of_code(code);
            ps.push(p);
        }
        Q.all(ps)
        .then(function(data){
            returndata = {};
            for (var i = 0; i < data.length; i++) {
                subdata = data[i];
                lcode = subdata.code;
                ldata = subdata.data;
                returndata[lcode] = ldata;
            }
            var jsonString = JSON.stringify(returndata,null);
            def.resolve(jsonString);            
            // client.end();
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
        client.query(sqlstr, [market_index_future[market], market_index[market], '2012-05-25'], function(err, result) {
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

app.get('/market_nose/:market', function(req, res){
    var market = req.params.market;
    var render_data = {
        name: market_index[market],
        market: market,
    };

    var promises = [];

    var p1 = get_index_nav_daily(market);
    var p2 = get_macd_forest_c_daily(market);
    var p3 = get_index_wt(market);
    var p4 = get_pool_alpha_count(market);
    var p5 = get_vender_codes_price(market);
    var p6 = get_vender_codes(market);

    promises.push(p1);
    promises.push(p2);
    promises.push(p3);
    promises.push(p4);
    promises.push(p5);
    promises.push(p6);


    Q.all(promises)
    .then(function(data){
        render_data.index_nav = data[0];
        render_data.macd_forest_c = data[1];
        render_data.index_wt = data[2];
        render_data.pool_alpha_count = data[3];
        render_data.vender_codes_price = data[4];
        render_data.vender_codes = JSON.stringify(data[5],null);
        // console.log(data[5]);
        res.render('market_nose.jade', render_data);
    });

});

app.get('/market_nose', function(req, res){
    res.render('market_nose.jade');
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

