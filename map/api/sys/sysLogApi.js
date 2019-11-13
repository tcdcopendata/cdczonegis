var pg = require('pg');
var config = require('../../config');
var connectionString = config.postgres;
var pgString = connectionString + config.db.cdczonegis;

module.exports = function (req, res, next) {
    var client = new pg.Client(pgString);
    client.connect();

    var strSql = 'INSERT INTO "log_api" ("userid","path","logtime","variables") VALUES ($1,$2,$3,$4);'
    var userid = (req.session && req.session.useruid) ? req.session.useruid : '';
    var ip = req.ip.replace('::ffff:', '');
    var variables = req.body ? req.body : {};
    var sqlParameter = [userid, req.url, new Date(), variables];
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