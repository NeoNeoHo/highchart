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
var cql = require('node-cassandra-cql');
var daily_client = new cql.Client({hosts: hosts, keyspace: 'daily'});
var report_client = new cql.Client({hosts: hosts, keyspace: 'report'});
var hourly_client = new cql.Client({hosts: hosts, keyspace: 'hourly'});
var forecast_client = new cql.Client({hosts: hosts, keyspace: 'forecast'});
var security_client = new cql.Client({hosts: hosts, keyspace: 'security'});

// all environments
app.set('port', process.env.PORT || 5005);
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
    //global: "global"
};

app.get('/chart/dashboard/:market', function(req, res){
    var market = req.params.market;
    var country = market_index[market];
    console.log(country);
    async.series({
            index: function(callback){
                daily_client.execute('SELECT date,index_cl FROM bomin_william_dashboard WHERE market=? and date>=? order by date desc',
                    [market, '2011-09-15'],
                    cql.types.consistencies.one,
                    function(err, result) {
                        if (err) console.log(err);
                        else {
                            var data = [];
                            var rows = result.rows;
                            for(var i=rows.length-1; i>=0; i--) {
                                var row = rows[i];
                                var t_stamp = new Date(row[0]).getTime();
                                var row_data = [t_stamp,row[1]];
                                data.push(row_data);
                            }
                            var jsonString = JSON.stringify(data,null);
                            callback(null,jsonString);
                        }
                        console.log('Yes');
                    }
                );
            },
            alpha: function(callback){
                daily_client.execute('SELECT date, nav, mdd, green_60, red_60, gray_60, green_60_100, red_60_100, gray_60_100, num_stocks, num_positive_alpha, num_negative_alpha, pn_ratio_sma_20, index_cl_return_20 FROM bomin_william_dashboard WHERE market=? and date>? order by date desc',
                    [market, '2011-09-15'],
                    cql.types.consistencies.quorum,
                    function(err, result) {
                        if (err) console.log(err);
                        else {
                            var data = {};
                            data.nav = [];
                            data.mdd = [];
                            data.green_60 = [];
                            data.red_60 = [];
                            data.gray_60 = [];
                            data.green_60_100 = [];
                            data.red_60_100 = [];
                            data.gray_60_100 = [];
                            data.alpha_ratio = [];
                            data.pn_ratio_sma_20 = [];
                            data.index_cl_return_20 = [];

                            var rows = result.rows;
                            for(var i=rows.length-1; i>=0; i--) {
                                var row = rows[i];
                                var t_stamp = new Date(row[0]).getTime();
                                var nav = [t_stamp, row[1]];
                                var mdd = [t_stamp, row[2]];
                                var green_60 = [t_stamp, row[3]];
                                var red_60 = [t_stamp, row[4]];
                                var gray_60 = [t_stamp, row[5]];
                                var green_60_100 = [t_stamp, row[6]];
                                var red_60_100 = [t_stamp, row[7]];
                                var gray_60_100 = [t_stamp, row[8]];
                                var index_cl_return_20 = [t_stamp, row[13]];
                                if ((row[10] + row[11]) != 0){
                                    var alpha_ratio = [t_stamp, (row[10]-row[11])/(row[10]+row[11])];
                                }else {
                                    var alpha_ratio = [t_stamp, 0];
                                }
                                var pn_ratio_sma_20 = [t_stamp, row[12]];
                                

                                data.nav.push(nav);
                                data.mdd.push(mdd);
                                data.green_60.push(green_60);
                                data.red_60.push(red_60);
                                data.gray_60.push(gray_60);
                                data.green_60_100.push(green_60_100);
                                data.red_60_100.push(red_60_100);
                                data.gray_60_100.push(gray_60_100);
                                data.alpha_ratio.push(alpha_ratio);
                                data.pn_ratio_sma_20.push(pn_ratio_sma_20);
                                data.index_cl_return_20.push(index_cl_return_20);
                                
                            }
                            callback(null,data);
                        }
                        console.log('No');
                    }
                );
            }
        },
        function(err, results){
            res.render('dashboard.jade',{
                name:country,
                data: results.index,
                nav: JSON.stringify(results.alpha.nav),
                mdd: JSON.stringify(results.alpha.mdd),
                green_60: JSON.stringify(results.alpha.green_60),
                red_60: JSON.stringify(results.alpha.red_60),
                gray_60: JSON.stringify(results.alpha.gray_60),
                green_60_100: JSON.stringify(results.alpha.green_60_100),
                red_60_100: JSON.stringify(results.alpha.red_60_100),
                gray_60_100: JSON.stringify(results.alpha.gray_60_100),
                alpha_ratio: JSON.stringify(results.alpha.alpha_ratio),
                pn_ratio_sma_20: JSON.stringify(results.alpha.pn_ratio_sma_20),
                index_cl_return_20: JSON.stringify(results.alpha.index_cl_return_20),
            });
        
        });
});

app.get('/dashboard', function(req, res){
    res.render('dashboard.jade');
});
console.log('No, Crash !!');

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
