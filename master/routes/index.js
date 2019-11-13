var express = require('express');
var session = require('express-session');
var httpProxy = require('http-proxy');
var request = require('request');
var router = express.Router();
var fs = require('fs');
// var ssl = require('../sslLicense');

var proxy = httpProxy.createProxyServer({
    xfwd: true,
    secure: true,
    // ssl: ssl,
});

/* GET home page. */
router.get('/', function(req, res, next) {
    // res.render('index');
    // proxy.web(req, res, {//     target: 'http://127.0.0.1:1001/'
    // });
    res.redirect('/map');
});

router.get('/404', function(req, res, next) {
    // res.render('index');
    // proxy.web(req, res, {//     target: 'http://127.0.0.1:1001/'
    // });
    res.status(404).render('notfound');
});

router.all(['/:name', '/:name/*'], function(req, res, next) {
    var name = req.params.name.toLowerCase();
    req.url = req.url.replace('/' + req.params.name, '');
    switch (name) {
        case 'map':
            proxy.web(req, res, {
                target: 'http://127.0.0.1:1001/'
            });
            break;
        case 'map_core':
            proxy.web(req, res, {
                target: 'http://127.0.0.1:1002/'
            });
            break;
        case 'data':
            proxy.web(req, res, {
                target: 'http://127.0.0.1:1003/'
            });
            break;
        case 'landmark':
            proxy.web(req, res, {
                target: 'http://127.0.0.1:1004/'
            });
            break;
        case 'icp_data':
            proxy.web(req, res, {
                target: 'http://127.0.0.1:1005/'
            });
            break;
        case 'proxy':
            var url = req.url.replace('?', '');
            // var j = request.jar();
            // var cookie = request.cookie('locale=zh_TW; gvc=MjUzNTY0MzUwNjAyNDQ1MjM1Mjk0Nzk2ODM4MDk2MzQzODM5NjAw; seen-signup-modal=VHJ1ZQ%3D%3D; puc=OGU0OTEwMzE%3D; js_csrf=-tW_twnPOevA84T4OjjkFdCb; t=-tW_twnPOevA84T4OjjkFdCb; developer_lang=js');
            // j.setCookie(cookie, url);
            req.pipe(request({
                url: url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36'
                }
            })).on('error', function(err) {
                console.log('Error piping request object to request(): ', err);
                res.writeHead(404);
                res.end();
            }).pipe(res).on('error', function(err) {
                console.log('Error piping response from request() to response object : ', err);
                res.writeHead(404);
                res.end();
            });
            break;
        default:
            res.render('notfound');
            res.end();
            break;
    }
});

proxy.on('error', function(err, req, res) {
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });
    res.end(err.message);
});

module.exports = router;