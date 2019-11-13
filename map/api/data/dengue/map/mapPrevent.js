var pg = require('pg');
var config = require('../../../../config');
var connectionString = config.postgres;
var pgString = connectionString + config.db.cdczonegis;

// 複合查詢地圖點位
var polygons = function (req, res) {
    var client = new pg.Client(pgString);
    client.connect();

    var strSql = 'SELECT * FROM "spray_record"' +
        ' WHERE "GEOMETRY" IS NOT NULL';
    var sqlParameter = [];
    var date_start;
    var date_end;
    var items_execute = [];
    var items_city = [];
    if (req.body) {
        // 時間
        if (req.body.start) {
            date_start = new Date(req.body.start)
            if (!isNaN(date_start.getTime())) {
                date_start = new Date(date_start.getFullYear(), date_start.getMonth(), date_start.getDate())
                sqlParameter.push(date_start);
                strSql += ' AND "DATE" >= $' + sqlParameter.length;
            }
        }
        if (req.body.end) {
            date_end = new Date(req.body.end)
            if (!isNaN(date_end.getTime())) {
                date_end = new Date(date_end.getFullYear(), date_end.getMonth(), date_end.getDate() + 1)
                sqlParameter.push(date_end);
                strSql += ' AND "DATE" < $' + sqlParameter.length;
            }
        }
        // 防治時間
        if (req.body.execute && req.body.execute.length > 0) {
            var today = new Date();
            today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            today = today.setDate(today.getDate() - 13);
            items_execute = req.body.execute.split('&');
            if (items.indexOf('14日內執行') >= 0 && items.indexOf('15日以上執行') >= 0) {

            } else if (items.indexOf('14日內執行') >= 0) {
                sqlParameter.push(today);
                strSql += ' AND "DATE" => $' + sqlParameter.length;
            } else if (items.indexOf('15日以上執行') >= 0) {
                sqlParameter.push(today);
                strSql += ' AND "DATE" < $' + sqlParameter.length;
            }
        }
        // 城市
        if (req.body.city) {
            items_city = req.body.city.split(',');
            if (items_city.length == 1) {
                sqlParameter.push(items_city[0]);
                strSql += ' AND "CITY_NAME" = $' + sqlParameter.length;
            } else if (items_city.length == 2) {
                sqlParameter.push(items_city[0]);
                strSql += ' AND "CITY_NAME" = $' + sqlParameter.length;
                sqlParameter.push(items_city[1]);
                strSql += ' AND "DISTRICT_NAME" = $' + sqlParameter.length;
            } else if (items_city.length == 3) {
                sqlParameter.push(items_city[0]);
                strSql += ' AND "CITY_NAME" = $' + sqlParameter.length;
                sqlParameter.push(items_city[1]);
                strSql += ' AND "DISTRICT_NAME" = $' + sqlParameter.length;
                sqlParameter.push(items_city[2]);
                strSql += ' AND "VILLAGE_NAME" = $' + sqlParameter.length;
            }
        }
    }
    strSql += ' ORDER BY "DATE"';
    client.query(strSql, sqlParameter, function (err, row) {
        if (err) console.log('err: ' + err)
        client.end();
        var result = {};
        result.type = 'FeatureCollection';
        result.features = [];
        row.rows.forEach(function (obj) {
            var geojson = {};
            geojson.type = 'Feature';
            geojson.geometry = obj.GEOMETRY;
            geojson.properties = {};
            Object.keys(obj).forEach(function (property) {
                // if (property != 'GEOMETRY') {
                //     geojson.properties[property] = obj[property];
                // }
                geojson.properties[property] = obj[property];
            })
            result.features.push(geojson);
        });
        if (res) {
            res.send(result);
        } else {
            return result
        }
    });
}

// 週次計算
Date.prototype.getWeek = function () {
    var target = new Date(this.valueOf());
    var dayNr = (this.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    var firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() != 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000);
}

module.exports = {
    polygons
};