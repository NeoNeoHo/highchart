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

// all environments
app.set('port', process.env.PORT || 9999);
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

app.get('/chart/volatility/:market', function(req, res){
	database_name = "www"
	var conString = "postgres://benson:benson@192.168.1.99:5432/" + database_name 
    var market = req.params.market;
    var market_index_name = market_index[market];
    console.log(market_index_name);
    async.series({
		    ohlc: function(callback){
		    	pg.connect(conString, function(err, client) {
			      	var sqlstr;
			      	if (err) {
			        	console.dir(err);
			      	}
		        	sqlstr = 'SELECT da,volatility from public.market_volatility where market=$1 and da>$2 order by da desc;';
			      	client.query(sqlstr, [market, '2005-09-01'], function(err, result) {
				        if (err) {
				          	console.error('error running query', err);
				       	}
				       	else {
		                    var data = [];
		                    var rows = result.rows;
		                    for(var i=rows.length-1; i>=0; i--) {
		                        var row = rows[i];
		                        
		                        var t_stamp = new Date(row.da).getTime();
		                        
		                        var row_data = [t_stamp,row.volatility];
		                        
		                        data.push(row_data);
		                    }
		                    var jsonString = JSON.stringify(data,null);

		                    callback(null,jsonString);
		                }
				    });
			    });
		    }
	    },
	    function(err, results){
	        res.render('volatility.jade',{
	            name: market_index_name,
	            data: results.ohlc,
	        });
	        console.log(market_index_name)
	    });
});

app.get('/volatility', function(req, res){
    res.render('volatility.jade');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
