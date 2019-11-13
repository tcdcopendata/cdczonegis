var pg = require('pg');
var config = require('../../config');
var connectionString = config.postgres;
var pgString = connectionString + config.db.cdczonegis;

module.exports = function (req, res, next) {
    var client = new pg.Client(pgString);
    client.connect();

    var strSql = 'INSERT INTO "log_login" ("userid","status","logtime") VALUES ($1,$2,$3);'
    var userid = (req.session && req.session.useruid) ? req.session.useruid : '';
    var ip = req.ip.replace('::ffff:', '');
    var status = (req.session && req.session.loginstatus) ? req.session.loginstatus : '無狀態';
    var sqlParameter = [userid, status, new Date()];
    client.query(strSql, sqlParameter, function (err, row) {
        if (err) {
            console.log('err: ' + err)
        }
        client.end();
    })
    if (next) {
        next();
    }
}