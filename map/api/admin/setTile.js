var session = require('express-session');
var pg = require('pg');
var config = require("../../config");
var connectionString = config.postgres;


var createTile=function(req,res){
    var result = {}
    var pgString = connectionString + config.db.cdczonegis;
    var pgClient = new pg.Client(pgString);
    console.log(req.body)
    if (req.body) {
        // 先確認圖層名稱否已被使用
        var strSql = 'SELECT * FROM tiles WHERE "Name" = $1;';
        var sqlParmeter = [req.body.Name];
        pgClient.connect();
        pgClient.query(strSql, sqlParmeter, function(err, row) {
            if (err) {
                result.error = "sql_failed"
                result.errorMsg = "資料庫搜尋失敗，請確認網路環境是否正常。"
                res.send(result)
            } else {
                if (row.rowCount > 0) {
                    pgClient.end();
                    result.error = "tile_exists"
                    result.errorMsg = "該圖層名稱已被使用。"
                    res.send(result)
                } else {
                    // 繼續
                    strSql = 'INSERT INTO tiles ("Name", "Source", "Format", "Frequency", "Table", "DateCreate", "Description", "Enable", "FunctionName") VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);';
                    sqlParmeter = [req.body.Name, req.body.Source, req.body.Format, req.body.Frequency, req.body.Table, new Date(), req.body.Description, 1, req.body.FunctionName];
                    pgClient.query(strSql, sqlParmeter, function(err, row) {
                        pgClient.end();
                        if (err) {
                            console.log(err)
                            result.error = "sql_failed"
                            result.errorMsg = "資料新增失敗。"
                        } else {
                            result.success = true
                        }

                        res.send(result)
                    })
                }
            }
        });
    } else {
        result.error = "protocol_failed"
        result.errorMsg = "協定失敗，遺失主體。"
        res.send(result)
    }
}

var updateTile=function(req,res){
    var result = {}
    var pgString = connectionString + config.db.cdczonegis;
    var pgClient = new pg.Client(pgString);
    pgClient.connect();
    var strSql = 'UPDATE tiles SET "Name"=$1, "Source"=$2, "Format"=$3, "Frequency"=$4, "Table"=$5, "Description"=$6, "Enable"=$7 WHERE "ID"=$8;';
    var sqlParmeter = [req.body.Name, req.body.Source, req.body.Format, req.body.Frequency, req.body.Table, req.body.Description, req.body.Enable, req.body.ID]
    console.log(sqlParmeter)
    pgClient.query(strSql, sqlParmeter, function(err, row) {
        pgClient.end();
        if (err) {
            result.error = "sql_failed"
            result.errorMsg = "資料修改失敗。(" + err + ")"
        } else {
            result.success = true
        }
        res.send(result);
    });
}

var deleteTile=function(req,res){
    var result = {}
    var pgString = connectionString + config.db.cdczonegis;
    var pgClient = new pg.Client(pgString);
    pgClient.connect();
    var strSql = 'DELETE FROM tiles WHERE "ID" = $1;';
    var sqlParmeter = [req.body.ID]
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



module.exports = {createTile ,updateTile,deleteTile};