var express = require('express');

var app = express();


//get client ip
app.set('trust proxy', '127.0.0.1');

//cors
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/', express.static(__dirname + '/public'));
// third library
// app.use('/lib', express.static(__dirname + '/node_modules/leaflet/dist/'));
// app.use('/lib', express.static(__dirname + '/node_modules/leaflet-draw/dist/'));


app.use('/lib', express.static(__dirname + '/node_modules/toastr/build/'));
app.use('/lib', express.static(__dirname + '/node_modules/font-awesome/css/'));

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;