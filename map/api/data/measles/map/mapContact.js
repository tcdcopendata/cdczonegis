var pg = require('pg');
var config = require('../../../../config');
var pgString = config.pgService.cdctrace + config.db.cdctrace;

// 複合查詢地圖點位
var points = function (req, res) {
    var client = new pg.Client(pgString);
    client.connect();
    var strSql =
        'SELECT "CONTACT_DATE","GENDER","AGE","lon","lat","RESIDENTIAL_COUNTY_NAME","RESIDENTIAL_TOWN_NAME" FROM "CONTACT_PERSON"' +
        ' LEFT JOIN "contact_person_gis"' +
        ' ON "CONTACT_PERSON"."contact_person_id" = "contact_person_gis"."contact_person_id" WHERE 1=1';
    var sqlParameter = [];
    if (req.body) {
        // 時間
        if (req.body.start) {
            // console.log('有start喔')
            date_start = new Date(req.body.start)
            if (!isNaN(date_start.getTime())) {
                date_start = new Date(date_start.getFullYear(), date_start.getMonth(), date_start.getDate())
                sqlParameter.push(date_start);
                strSql += ' AND "CONTACT_DATE" >= $' + sqlParameter.length;
            }
        }
        if (req.body.end) {
            // console.log('有end喔')
            date_end = new Date(req.body.end)
            if (!isNaN(date_end.getTime())) {
                date_end = new Date(date_end.getFullYear(), date_end.getMonth(), date_end.getDate() + 1)
                sqlParameter.push(date_end);
                strSql += ' AND "CONTACT_DATE" < $' + sqlParameter.length;
            }
        }
        if (req.body.city) {
            // console.log('有city喔')
            items_city = req.body.city.split(',')
            if (items_city.length == 1) {
                sqlParameter.push(items_city[0]);
                strSql += ' AND "RESIDENTIAL_COUNTY_NAME" = $' + sqlParameter.length;
            } else if (items_city.length == 2) {
                sqlParameter.push(items_city[0]);
                strSql += ' AND "RESIDENTIAL_COUNTY_NAME" = $' + sqlParameter.length;
                sqlParameter.push(items_city[1]);
                strSql += ' AND "RESIDENTIAL_TOWN_NAME" = $' + sqlParameter.length;
            }
        }
    }
    strSql += ' ORDER BY "CONTACT_DATE"';
    client.query(strSql, sqlParameter, function (err, row) {
        if (err) console.log('err: ' + err)
        client.end();
        var result = {};
        result.type = 'FeatureCollection';
        result.features = [];
        row.rows.forEach(function (obj) {
            var geojson = {};
            geojson.type = 'Feature';
            geojson.geometry = {
                type: 'Point',
                coordinates: [
                    obj.lon,
                    obj.lat
                ]
            };
            geojson.properties = obj;

            result['features'].push(geojson);
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
    points
};