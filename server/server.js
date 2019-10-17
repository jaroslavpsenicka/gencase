var express = require('express');
var mongoose = require('mongoose');
var config = require('./config');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var log4js = require('log4js');
var mask = require('mongoosemask');
var path = require('path');
var elasticsearch = require('elasticsearch');

var logger = log4js.getLogger('[app]');

const app = express();

logger.info('Connecting to database', config.database.url);
mongoose.connect(config.database.url, { useNewUrlParser: true, useUnifiedTopology: true });

logger.info('Connecting to elasticsearch', config.elasticsearch.url);
var esclient = new elasticsearch.Client({ host: config.elasticsearch.url });

app.use(log4js.connectLogger(log4js.getLogger('[http]'), { level: log4js.levels.DEBUG }));
app.use(express.static(__dirname + '/app'));
app.use(morgan('combined')); // log every request to the console
app.use(bodyParser.urlencoded({ 'extended': 'true' })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request
app.use(mask(['_id', '__v']));
app.use(function(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
});

app.use(express.static(path.join(__dirname, '../client')));

require('./routes.js')(app);
app.get('*', function(req, res) {
    console.log(path.resolve(__dirname, '../client/index.html'));
    res.sendFile(path.resolve(__dirname, '../client/index.html'));                               
});

app.listen(process.env.PORT || 8080);
