var session = require('express-session');
var pg = require('pg');
var config = require("../../config");
var connectionString = config.postgres;



var deleteUser=function(req,res){
    var result = {}
    var pgString = connectionString + config.db.cdczonegis;
    var pgClient = new pg.Client(pgString);
    pgClient.connect();
    var strSql = 'DELETE FROM users WHERE "USER_ID" = $1;';
    var sqlParmeter = [req.body.USER_ID]
    pgClient.query(strSql, sqlParmeter, function(err, row) {
        pgClient.end();
        if (err) {
            result.error = "sql_failed"
            result.errorMsg = "資料刪除失敗。"
        } else {
            result.success = true
        }
        res.send(result);
    });
}

var updateUser=function(req,res){
    var result = {}
    var pgString = connectionString + config.db.cdczonegis;
    var pgClient = new pg.Client(pgString);
    pgClient.connect();
    var strSql = 'UPDATE users SET "USER_NAME"=$1, "EMAIL"=$2,"ORGANIZATION_ID"=$9, "ORGANIZATION_NAME"=$3, "TEL"=$4, "USER_TYPE_NAME"=$5, "USER_TYPE_ID"=$6, "USER_STATUS"=$7 WHERE "USER_ID"=$8;';
    var sqlParmeter = [req.body.USER_NAME, req.body.EMAIL, req.body.ORGANIZATION_NAME, req.body.TEL, req.body.USER_TYPE_NAME, req.body.USER_TYPE_ID, req.body.USER_STATUS, req.body.USER_ID,req.body.ORGANIZATION_ID]
    console.log(sqlParmeter)
    pgClient.query(strSql, sqlParmeter, function(err, row) {
        pgClient.end();
        if (err) {
            result.error = "sql_failed"
            result.errorMsg = "資料修改失敗。(" + err + ")"
        } else {
            result.success = true
        }
        //判斷更新對象如果是本人
         if(req.session.userid==req.body.USER_ID){
            req.session.userid = req.body.USER_ID;
            req.session.username = req.body.USER_NAME;
            req.session.permission = req.body.USER_TYPE_ID;
            req.session.org_name = req.body.ORGANIZATION_NAME;
            req.session.org_id = req.body.ORGANIZATION_ID;
            req.session.org_level = req.body.ORGANIZATION_LEVEL;
            req.session.email = req.body.EMAIL;
            }
        res.send(result);
    });
}

module.exports = {deleteUser,updateUser };