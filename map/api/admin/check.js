var express = require('express');
var router = express.Router();
var langZhtw = require('../../public/language/map/zh-tw');
var langEn = require('../../public/language/map/en');


var checkSession=function(req,res,next){
    if (!req.session || !req.session.userid) {
        res.redirect('/map/authorize');
        return;
    }
    if(next){
        next()
    }

}

var checkLanguage=function (req) {
    var lang = langZhtw;
    if (req && req.query && req.query.lang) {
        switch (req.query.lang.toLowerCase()) {
            case 'zh-tw':
                return langZhtw;
            case 'en':
                return langEn;
        }
    }
    return lang;
}


var checkPermission=function (req,res,next){
    var userType=req.session.permission;
    if (!userType==3) {
        res.redirect('/map');
        return;
    }
    if(next){
        next()
    }
    
}

module.exports = { checkSession,checkLanguage,checkPermission};