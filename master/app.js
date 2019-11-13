var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');

var routes = require('./routes/index');
var page_map2 = require('./routes/map2');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// 108.07.16 修改以因應轉址攻擊 by Chase
app.use(function (req, res, next) {
    while (req.url.indexOf('//') >= 0) {
        req.url = req.url.replace('//', '/');
    }
    if (req.url.substr(-1) == '/' && req.url.length > 1)
        res.redirect(301, req.url.slice(0, -1));
    else
        next();
});

app.all('*', ensureSecure); // at top of routing calls
// app.use('/map2', page_map2);
app.use('/', routes);

function ensureSecure(req, res, next) {
    if (req.secure) {
        // OK, continue
        return next();
    };
    // handle port numbers if you need non defaults
    // res.redirect('https://' + req.host + req.url); // express 3.x
    res.redirect(301, 'https://' + req.hostname + req.url); // express 4.x
}

// app.use(function (req, res, next) {
//     console.log('喔齁');
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        statusHandle(err, req, res);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

function statusHandle(err, req, res) {
    if (err) {
        console.log('err.status: ' + err.status);
        switch (err.status) {
            case 404:
                res.render('notfound');
                break;
            case 500:
            default:
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: err
                });
                break;
        }
    } else {
        console.log('咦？');
    }
    res.end();
}

module.exports = app;