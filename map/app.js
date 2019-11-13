var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./routes/index');
var admin = require('./routes/admin');
var userdata = require('./routes/userdata');
var utils = require('./routes/utils');
var dataRoute = require('./routes/dataRoute');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//get client ip
app.set('trust proxy', '127.0.0.1');

//cors
app.use(function (req, res, next) {
    // res.header("Access-Control-Allow-Origin", "https://cdcdenguetest.azurewebsites.net/");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 43200000 }));

app.use(session({
    secret: 'cdczone38886588',
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 120 * 60 * 1000 }
}));

// app.use('/login', login);
app.use('/', routes);
app.use('/', admin);
app.use('/', userdata);
app.use('/utils', utils);
app.use('/data', dataRoute);

// third library
app.use('/lib/d3-tip', express.static(__dirname + '/node_modules/d3-tip/dist/'));
app.use('/lib', express.static(__dirname + '/node_modules/leaflet/dist/'));
app.use('/lib', express.static(__dirname + '/node_modules/toastr/build/'));
app.use('/lib', express.static(__dirname + '/node_modules/tour/dist/'));
app.use('/lib', express.static(__dirname + '/node_modules/dropbox/dist/'));
app.use('/lib', express.static(__dirname + '/node_modules/sweetalert/dist/'));
app.use('/lib', express.static(__dirname + '/node_modules/sweetalert2/dist/'));
app.use('/lib', express.static(__dirname + '/node_modules/plotly.js/dist/'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.render('404');
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;