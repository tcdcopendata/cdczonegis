var express = require('express');
var session = require('express-session');
var langZhtw = require('../public/language/map/zh-tw');
var langEn = require('../public/language/map/en');
var router = express.Router();

var pg = require('pg');
var config = require("../config");
var connectionString = config.postgres;

var soap = require('soap');
var api = require('../api/api.js');

function renderOut(req,res,ejsName){
    res.render(ejsName, {
        Language: api.admin.check.checkLanguage(req),
        User: {
            username: req.session.username,
            userid: req.session.userid,
            permission: req.session.permission,
            org_name: req.session.org_name,
            email: req.session.email
        }
    });
}

router.get('/admin'           , api.sys.sysLogApi, api.admin.check.checkSession,function(req,res){renderOut(req,res,'admin_permission')});
router.get('/admin/permission', api.sys.sysLogApi, api.admin.check.checkSession,function(req,res){renderOut(req,res,"admin_permission")});
router.get('/admin/tile'      , api.sys.sysLogApi, api.admin.check.checkSession,function(req,res){renderOut(req,res,"admin_tile")});
router.get('/admin/other'     , api.sys.sysLogApi, api.admin.check.checkSession,function(req,res){renderOut(req,res,"admin_other")});


router.all('/admin/permission/list_user'   , api.sys.sysLogApi, api.admin.check.checkSession, function(req,res){api.admin.listUser.list_all_user(req,res)});
router.post('/admin/permission/create_user', api.sys.sysLogApi, function(req, res) {});
router.post('/admin/permission/update_user', api.sys.sysLogApi, api.admin.check.checkSession, api.admin.setUser.updateUser);
router.post('/admin/permission/delete_user', api.sys.sysLogApi, api.admin.check.checkSession, api.admin.setUser.deleteUser);
router.post('/admin/permission/create_tile', api.sys.sysLogApi, api.admin.setTile.createTile);
router.post('/admin/permission/update_tile', api.sys.sysLogApi, api.admin.setTile.updateTile);
router.post('/admin/permission/delete_tile', api.sys.sysLogApi, api.admin.setTile.deleteTile);
router.all('/admin/permission/list_tile'   , api.sys.sysLogApi, function(req,res){api.admin.listUser.sql_list_user(req,res,'SELECT * FROM tiles ORDER BY "ID";')});

//list 自己層級下的使用者
router.all('/admin/permission/list_under_user',api.sys.sysLogApi, 
function(req, res, next) {
    api.admin.check.checkSession(req,res)
    api.admin.check.checkPermission(req,res)
    var userType=parseInt(req.session.permission);
    var user_org_id=parseInt(req.session.org_id);
    var user_org_name=req.session.org_name;
    var user_org_level=parseInt(req.session.org_level);
    switch (userType){
        case 3:
        api.admin.listUser.list_all_user(req,res)
        break
        case 2:
        api.admin.listUser.check_city_list(req,res,userType,user_org_id,user_org_name,user_org_level)
        break
        case 1:
        break
    }
});

module.exports = router;