'use strict';
const express = require('express');
// const basicAuth = require('express-basic-auth')
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const routes = require('./routes/index');
const User = require('./models/User');
const errorHandlers = require('./handlers/errorHandlers');
require('./handlers/passport');

process.on("unhandledRejection", function handleWarning( reason, promise ) {
  console.log("[PROCESS] Unhandled Promise Rejection");
  console.log( reason );
});


mongoose.connect('mongodb://localhost:27017/testbot');
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

// app.use(basicAuth({
//     users: { 'test': 'test' }
// }))
const MongoStore = require('connect-mongo')(session);    

const app = express();

app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// populates req.cookies with any cookies that came along with the request
// app.use(cookieParser());

// Sessions allow us to store data on visitors from request to request
// This keeps users logged in and allows us to send flash messages
app.use(session({
  secret: 'dirty secret',
  key: 123456,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// // Passport JS is what we use to handle our logins
app.use(passport.initialize());
app.use(passport.session());


app.use('/', routes);


app.use(errorHandlers.notFound);

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('Something broke!');
});


app.listen(app.get('port'), function(){
  console.log('Started on port', app.get('port'))
})
