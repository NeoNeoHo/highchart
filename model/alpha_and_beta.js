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
app.set('port', process.env.PORT || 9997);
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
    jp: "TPX500 Index",
    in: "SENSEX Index",
    us: "SPX Index",
    hk: "HSI Index",
    uk: "UKX Index",
    asia_basket: "Asia",
    global_basket: "Global",
};


var get_alpha_and_beta = function(market, date, is_port){
    var def = Q.defer();
    var conString_www = "postgres://benson:benson@192.168.1.99:5432/www";
    pg.connect(conString_www, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        if (is_port == 0) {
           sqlstr = "SELECT alpha, beta, code from public.alpha_and_beta where market=$1 and da=$2;";
        }
        if (is_port == 1) {
            sqlstr = "SELECT alpha, beta, code from public.alpha_and_beta where market=$1 and da=$2 and is_port=1;";
        }
        client.query(sqlstr, [market, date], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    data.push({'x':row.alpha, 'y':row.beta, 'z':20, 'code':row.code});
                }
                var jsonString = JSON.stringify(data,null);
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_top_rank_alpha = function(market, date, is_port){
    var def = Q.defer();
    var conString_www = "postgres://benson:benson@192.168.1.99:5432/www";
    pg.connect(conString_www, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        if (is_port == 0) {
           sqlstr = "SELECT alpha, beta, code from public.alpha_and_beta where market=$1 and da=$2 order by alpha desc;";
        }
        if (is_port == 1) {
           sqlstr = "SELECT alpha, beta, code from public.alpha_and_beta where market=$1 and da=$2 and is_port=1 order by alpha desc;";
        }
        client.query(sqlstr, [market, date], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    data.push([row.code, row.alpha]);
                }
                var jsonString = JSON.stringify(data,null);
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_top_rank_alpha_related_beta = function(market, date, is_port){
    var def = Q.defer();
    var conString_www = "postgres://benson:benson@192.168.1.99:5432/www";
    pg.connect(conString_www, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        if (is_port == 0) {
            sqlstr = "SELECT alpha, beta, code from public.alpha_and_beta where market=$1 and da=$2 order by alpha desc;";
        }
        if (is_port == 1) {
            sqlstr = "SELECT alpha, beta, code from public.alpha_and_beta where market=$1 and da=$2 and is_port = 1 order by alpha desc;";   
        }
        client.query(sqlstr, [market, date], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    data.push([row.code, row.beta]);
                }
                var jsonString = JSON.stringify(data,null);
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_top_rank_beta = function(market, date, is_port){
    var def = Q.defer();
    var conString_www = "postgres://benson:benson@192.168.1.99:5432/www";
    pg.connect(conString_www, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        if (is_port == 0) {
            sqlstr = "SELECT alpha, beta, code from public.alpha_and_beta where market=$1 and da=$2 order by beta desc;";
        }
        if (is_port == 1) {
            sqlstr = "SELECT alpha, beta, code from public.alpha_and_beta where market=$1 and da=$2 and is_port=1 order by beta desc;";   
        }
        client.query(sqlstr, [market, date], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    data.push([row.code, row.beta]);
                }
                var jsonString = JSON.stringify(data,null);
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_top_rank_beta_related_alpha = function(market, date, is_port){
    var def = Q.defer();
    var conString_www = "postgres://benson:benson@192.168.1.99:5432/www";
    pg.connect(conString_www, function(err, client) {
        var sqlstr;
        if (err) {
            console.log(err);
            def.reject(err);
        }
        if (is_port == 0) {
            sqlstr = "SELECT alpha, beta, code from public.alpha_and_beta where market=$1 and da=$2 order by beta desc;";
        }
        if (is_port == 1) {
            sqlstr = "SELECT alpha, beta, code from public.alpha_and_beta where market=$1 and da=$2 and is_port = 1 order by beta desc;";   
        }
        client.query(sqlstr, [market, date], function(err, result) {
            if (err) {
                console.log(err);
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                for(var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    data.push([row.code, row.alpha]);
                }                
                var jsonString = JSON.stringify(data,null);
                def.resolve(jsonString);                
                client.end();
            }
        });

    });
    return def.promise;
};

var get_volatility = function(market){
    var def = Q.defer();
    var conString_www = "postgres://benson:benson@192.168.1.99:5432/www";
    pg.connect(conString_www, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT to_char(da,'YYYY-MM-DD') as da,volatility from public.market_volatility where market=$1 and da>$2 order by da asc;";
        client.query(sqlstr, [market, '2005-09-01'], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                for (var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    var t_stamp = new Date(row.da).getTime();
                    data.push([t_stamp, row.volatility]);
                }
                var jsonString = JSON.stringify(data,null);
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_index = function(market){
    var def = Q.defer();
    var conString_daily = "postgres://benson:benson@192.168.1.99:5432/daily";
    pg.connect(conString_daily, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT to_char(da,'YYYY-MM-DD') as da,cl from public.price where code=$1 and da>$2 order by da asc;";
        client.query(sqlstr, [market_index[market], '2005-09-01'], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                for (var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    var t_stamp = new Date(row.da).getTime();
                    data.push([t_stamp, row.cl]);
                }
                var jsonString = JSON.stringify(data,null);
                def.resolve(jsonString);
                client.end();
            }
        });
    });
    return def.promise;
};

var get_volatility2 = function(market){
    var def = Q.defer();
    var conString_www = "postgres://benson:benson@192.168.1.99:5432/www";
    pg.connect(conString_www, function(err, client) {
        var sqlstr;
        if (err) {
            def.reject(err);
        }
        sqlstr = "SELECT to_char(da,'YYYY-MM-DD') as da,volatility from public.market_volatility where market=$1 and da>$2 order by da asc;";
        client.query(sqlstr, [market, '2005-09-01'], function(err, result) {
            if (err) {
                def.reject(err);
            }
            else {
                var data = [];
                var rows = result.rows;
                for (var i=0; i<=rows.length-1; i++) {
                    var row = rows[i];
                    var t_stamp = new Date(row.da).getTime();
                    data.push([t_stamp, row.volatility]);
                }               
                def.resolve(data);
                client.end();
            }
        });
    });
    return def.promise;
};


app.get('/data/volatility/:market', function(req, res){
    var market = req.params.market;
    get_volatility2(market).then(function(data){
        res.json(data);
    });
});

app.get('/chart/alpha_and_beta/:market/:date', function(req, res){
    var market = req.params.market;
    var date = req.params.date;
    var render_data = {
        name: market_index[market],
        date: date
    };

    var promises = [];

    var p1 = get_alpha_and_beta(market, date, is_port=0);
    var p2 = get_alpha_and_beta(market, date, is_port=1);
    var p3 = get_top_rank_alpha(market, date, is_port=1);
    var p4 = get_top_rank_beta(market, date, is_port=1);
    var p5 = get_top_rank_alpha_related_beta(market, date, is_port=1);
    var p6 = get_top_rank_beta_related_alpha(market, date, is_port=1);
    var p7 = get_volatility(market);
    var p8 = get_index(market);


    promises.push(p1);
    promises.push(p2);
    promises.push(p3);
    promises.push(p4);
    promises.push(p5);
    promises.push(p6);
    promises.push(p7);
    promises.push(p8);

    Q.all(promises)
    .then(function(data){
        render_data.alpha_and_beta = data[0];
        render_data.port_alpha_and_beta = data[1];            
        render_data.top_alpha_rank_data = data[2];
        render_data.top_beta_rank_data = data[3];
        render_data.top_rank_alpha_related_beta = data[4];
        render_data.top_rank_beta_related_alpha = data[5];
        render_data.volatility = data[6];
        render_data.index_pr = data[7];
        res.render('alpha_and_beta.jade', render_data);
    });
});

app.get('/alpha_and_beta', function(req, res){
    res.render('alpha_and_beta.jade');
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
