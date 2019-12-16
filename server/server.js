const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose');
const config = require('./config');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mask = require('mongoosemask');
const path = require('path');
const log4js = require('log4js');
const morganBody = require('morgan-body');

const app = express();
const logger = log4js.getLogger();

log4js.configure(config.log4js);
mongoose.connect(config.database.url, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);

app.use(log4js.connectLogger(log4js.getLogger('access'), config.express));
app.use(cors());
app.use(mask(['_id', '__v']));
app.use(bodyParser.urlencoded({ 'extended': 'true' })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request

if (config.morgan.enabled) morganBody(app, config.morgan.options);

app.use(express.static(path.join(__dirname, '../dist')));

require('./routes.js')(app);

app.get('*', function(req, res) {
    console.log(path.resolve(__dirname, '../dist/index.html'));
    res.sendFile(path.resolve(__dirname, '../dist/index.html'));                               
});

app.use((err, req, res, next) => {
  logger.error('root error handler', err);
  if (err.message) {
    const errd = config.errors[err.message];
    if (errd) {
      res.status(errd.status).json({ error: errd.message })
    } else {
      res.status(500);
      res.json({ error: err.message ? err.message : err });
    }
  }
});

app.listen(process.env.PORT || 8080);
