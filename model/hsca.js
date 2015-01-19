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
app.set('port', process.env.PORT || 5001);
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
    //global: "global"
};

app.get('/chart/hsca/:market', function(req, res){
    var market = req.params.market;
    var market_index_name = market_index[market];
    console.log(market_index_name);
    async.series({
            ohlc: function(callback){
                daily_client.execute('SELECT date,open,high,low,close FROM william_4_in_1 WHERE market=? and date>? order by date desc',
                    [market, '2013-05-19'],
                    cql.types.consistencies.one,
                    function(err, result) {
                        if (err) console.log(err);
                        else {
                            var data = [];
                            var rows = result.rows;
                            for(var i=rows.length-1; i>=0; i--) {
                                var row = rows[i];
                                var t_stamp = new Date(row[0]).getTime();
                                var row_data = [t_stamp,row[1],row[2],row[3],row[4]];
                                data.push(row_data);
                                console.log(row_data)
                            }
                            var jsonString = JSON.stringify(data,null);

                            callback(null,jsonString);
                        }
                    }
                );
            },
            hsca: function(callback){
                daily_client.execute('SELECT date, cci, ccima, h180, h180ma, slope1, slope1ma, slope2, slope2ma, total, totalma FROM william_4_in_1 WHERE market=? and date>? order by date desc',
                    [market, '2013-05-19'],
                    cql.types.consistencies.quorum,
                    function(err, result) {
                        if (err) console.log(err);
                        else {
                            var data = {};
                            data.cci = [];
                            data.ccima = [];
                            data.h180 = [];
                            data.h180ma = [];
                            data.slope1 = [];
                            data.slope1ma = [];
                            data.slope2 = [];
                            data.slope2ma = [];
                            data.total = [];
                            data.totalma = [];
                            var rows = result.rows;
                            for(var i=rows.length-1; i>=0; i--) {
                                var row = rows[i];
                                var t_stamp = new Date(row[0]).getTime();
                                var cci = [t_stamp, row[1]];
                                var ccima = [t_stamp, row[2]];
                                var h180 = [t_stamp, row[3]];
                                var h180ma = [t_stamp, row[4]];
                                var slope1 = [t_stamp, row[5]];
                                var slope1ma = [t_stamp, row[6]]
                                var slope2 = [t_stamp, row[7]];
                                var slope2ma = [t_stamp, row[8]]
                                var total = [t_stamp, row[9]]
                                var totalma = [t_stamp, row[10]]
                                data.cci.push(cci);
                                data.ccima.push(ccima);
                                data.h180.push(h180);
                                data.h180ma.push(h180ma);
                                data.slope1.push(slope1);
                                data.slope1ma.push(slope1ma);
                                data.slope2.push(slope2);
                                data.slope2ma.push(slope2ma);
                                data.total.push(total);
                                data.totalma.push(totalma);

                            }
                            callback(null,data);
                        }
                    }
                );
            },
            wt: function(callback){
                daily_client.execute('SELECT date, wt, wtma FROM trend WHERE code=? and date>? order by date desc',
                    [market_index_name, '2013-05-19'],
                    cql.types.consistencies.quorum,
                    function(err, result) {
                        if (err) console.log(err);
                        else {
                            var data = {};
                            data.wt = [];
                            data.wt_ma = [];

                            var rows = result.rows;
                            for(var i=rows.length-1; i>=0; i--) {
                                var row = rows[i];
                                var t_stamp = new Date(row[0]).getTime();
                                var wt = [t_stamp, row[1]];
                                var wt_ma = [t_stamp, row[2]];

                                data.wt.push(wt);
                                data.wt_ma.push(wt_ma);

                            }
                            callback(null,data);
                        }
                    }
                );
            }
        },
        function(err, results){
            res.render('hsca.jade',{
                name:market_index_name,
                data: results.ohlc,
                cci: JSON.stringify(results.hsca.cci),
                ccima: JSON.stringify(results.hsca.ccima),
                h180: JSON.stringify(results.hsca.h180),
                h180ma: JSON.stringify(results.hsca.h180ma),
                slope1: JSON.stringify(results.hsca.slope1),
                slope1ma: JSON.stringify(results.hsca.slope1ma),
                slope2: JSON.stringify(results.hsca.slope2),
                slope2ma: JSON.stringify(results.hsca.slope2ma),
                total: JSON.stringify(results.hsca.total),
                totalma: JSON.stringify(results.hsca.totalma),
                wt: JSON.stringify(results.wt.wt),
                wt_ma: JSON.stringify(results.wt.wt_ma),
                

            });
        
        });
});

app.get('/hsca', function(req, res){
    res.render('hsca.jade');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
