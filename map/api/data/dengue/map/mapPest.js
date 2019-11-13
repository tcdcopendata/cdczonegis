var pg = require('pg');
var config = require('../../../../config');
var connectionString = config.postgres;
var pgString = connectionString + config.db.cdczonegis;

// 誘卵桶點位資料
var pointsBucket = function (req, res, next) {
    var client = new pg.Client(pgString);
    client.connect();

    try {
        var strSql = 'SELECT bucket_record."bucket_id", "country", "town", "village", "investigate_date", "egg_count", "note", "position"' +
            ' FROM "bucket_record"' +
            ' LEFT JOIN "bucket"' +
            ' ON "bucket_record"."bucket_id" = "bucket"."bucket_id" WHERE 1=1';
        var sqlParmeter = [];

        // limit: 筆數限制
        // start: 起始日
        // end: 結束日
        var date_start = new Date().getFullYear() + '-01-01';
        var date_end = new Date().getFullYear() + '-12-31';
        var items_pest_static_check = [];
        var items_city = [];
        if (req.body) {
            if (req.body.start) {
                date_start = new Date(req.body.start);
                if (!isNaN(date_start.getTime())) {
                    date_start = new Date(date_start.getFullYear(), date_start.getMonth(), date_start.getDate());
                    sqlParmeter.push(date_start);
                    strSql += ' AND bucket_record."investigate_date" >= $' + sqlParmeter.length;
                }
            }
            if (req.body.end) {
                date_end = new Date(req.body.end)
                if (!isNaN(date_end.getTime())) {
                    date_end = new Date(date_end.getFullYear(), date_end.getMonth(), date_end.getDate() + 1);
                    sqlParmeter.push(date_end);
                    strSql += ' AND bucket_record."investigate_date" < $' + sqlParmeter.length;
                }
            }
            if (req.body.city) {
                items_city = req.body.city.split(',');
                if (items_city.length == 1) {
                    sqlParmeter.push(items_city[0]);
                    strSql += ' AND bucket_record."country" = $' + sqlParmeter.length;
                } else if (items_city.length == 2) {
                    sqlParmeter.push(items_city[0]);
                    strSql += ' AND bucket_record."country" = $' + sqlParmeter.length;
                    sqlParmeter.push(items_city[1]);
                    strSql += ' AND bucket_record."town" = $' + sqlParmeter.length;
                } else if (items_city.length == 3) {
                    sqlParmeter.push(items_city[0]);
                    strSql += ' AND bucket_record."country" = $' + sqlParmeter.length;
                    sqlParmeter.push(items_city[1]);
                    strSql += ' AND bucket_record."town" = $' + sqlParmeter.length;
                    sqlParmeter.push(items_city[2]);
                    strSql += ' AND bucket_record."village" = $' + sqlParmeter.length;
                }
            }
            if (req.body.pest_static_check) {
                // 最近一次調查結果 / 平均調查結果
                items_pest_static_check = req.body.pest_static_check.split('&');
            }
        }
        strSql += ' ORDER BY "country", "town", "village", "investigate_date" DESC';
        client.query(strSql, sqlParmeter, function (err, row) {
            if (err) {
                console.log('pest_bucket_points err: ' + err);
            }
            client.end();
            var result = {};
            result.type = 'FeatureCollection';
            result.features = [];
            var bucket_ids = {};
            row.rows.forEach(function (obj) {
                if (obj.position && obj.position.x && obj.position.y) {
                    if (!bucket_ids[obj['bucket_id']]) {
                        var geojson = {};
                        geojson.type = 'Feature';
                        geojson.geometry = {
                            type: 'Point',
                            coordinates: [obj.position.x, obj.position.y],
                        };
                        geojson.properties = {};
                        geojson.properties['LON'] = obj.position.x;
                        geojson.properties['LAT'] = obj.position.y;
                        geojson.properties['bucket_id'] = obj['bucket_id'];
                        geojson.properties['country'] = obj['country'];
                        geojson.properties['town'] = obj['town'];
                        geojson.properties['village'] = obj['village'];
                        geojson.properties.record = [];
                        bucket_ids[obj['bucket_id']] = geojson;
                    }
                    var record = {};
                    record['investigate_date'] = obj['investigate_date'];
                    record['egg_count'] = parseInt(obj['egg_count']);
                    record['note'] = obj['note'];
                    bucket_ids[obj['bucket_id']].properties.record.push(record);
                    bucket_ids[obj['bucket_id']].properties['check_type'] = items_pest_static_check[0];
                    // 最近一次調查結果 / 平均調查結果
                }
            });
            Object.keys(bucket_ids).forEach(function (bucket_id) {
                var eggsTotal = 0;
                bucket_ids[bucket_id].properties.record.forEach(function (record) {
                    eggsTotal += record['egg_count'];
                });
                bucket_ids[bucket_id].properties['egg_average'] =
                    eggsTotal == 0 ? 0 : (eggsTotal / bucket_ids[bucket_id].properties.record.length);
                result['features'].push(bucket_ids[bucket_id]);
            });
            res.send(result);
        });
    } catch (e) {
        console.log('/dengue/map/pest_bucket_points error: ' + e);
    }
}

var pointsVegetable = function (req, res, next) {
    var client = new pg.Client(pgString);
    client.connect();

    try {
        var strSql = 'SELECT * FROM "vegetable_garden"';
        var sqlParameter = [];
        client.query(strSql, sqlParameter, function (err, row) {
            if (err) {
                console.log('pest_vegetable_points err: ' + err);
            }
            client.end();
            var result = {};
            result.type = 'FeatureCollection';
            result.features = [];
            row.rows.forEach(function (obj) {
                if (obj.Latitude && obj.Longitude) {
                    var geojson = {};
                    geojson.type = 'Feature';
                    geojson.geometry = {
                        type: 'Point',
                        coordinates: [obj.Longitude, obj.Latitude],
                    };
                    geojson.properties = obj;
                    result.features.push(geojson);
                }
            });
            res.send(result);
        });
    } catch (e) {
        console.log('/dengue/map/pest_vegetable_points error: ' + e);
    }
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

module.exports = { pointsBucket, pointsVegetable };