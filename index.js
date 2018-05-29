'use strict';
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/User');
const Item = require('./models/Item');
const routes = require('./routes/index');
const errorHandlers = require('./handlers/errorHandlers');
 // console.log(Item);

mongoose.connect('mongodb://localhost:27017/testbot');
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});


const app = express();

app.set('port', (process.env.PORT || 3000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use('/', routes);


app.use(errorHandlers.notFound);


app.listen(app.get('port'), function(){
  console.log('Started on port', app.get('port'))
})
