const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose');
const config = require('./config');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mask = require('mongoosemask');
const path = require('path');

const app = express();

mongoose.connect(config.database.url, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);

app.use(cors());
app.use(morgan('combined')); // log every request to the console
app.use(bodyParser.urlencoded({ 'extended': 'true' })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request
app.use(mask(['_id', '__v']));

app.use(express.static(path.join(__dirname, '../dist')));

require('./routes.js')(app);

app.get('*', function(req, res) {
    console.log(path.resolve(__dirname, '../dist/index.html'));
    res.sendFile(path.resolve(__dirname, '../dist/index.html'));                               
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500);
  res.json({ error: err.message ? err.message : err });
});

app.listen(process.env.PORT || 8080);
