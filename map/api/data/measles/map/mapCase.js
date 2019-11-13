var pg = require('pg');
var config = require('../../../../config');
var connectionString = config.postgres;
var pgString = connectionString + config.db.cdczonegis;

// 複合查詢地圖點位
var points = function (req, res) {
    var client = new pg.Client(pgString);
    client.connect();

    var strSql = 'SELECT "LON","LAT","dws_report_measles_gis"."REPORT","IMMIGRATION","GENDER_DESC","SICK_AGE","DISEASE","SICK_DATE",' +
        '"DETERMINED_STATUS","DETERMINED_STATUS_DESC",' +
        //權限判斷
        '"RESIDENCE_COUNTY_NAME",' +
        '"RESIDENCE_TOWN_NAME",' +
        '"RESIDENCE_VILLAGE_NAME",' +
        //國家
        '"INFECTED_COUNTRY_NAME",' +
        //個資
        // '"NAME_S",' +
        '"ADDRESS",' +
        '"PHB_RECEIVED_DATE",' +
        '"REPORT_DATE",' +
        '"DIAGNOSE_DATE"' +
        // '"TEL_HOME",' +
        ' FROM "dws_report_measles_gis"' +
        ' LEFT JOIN "dws_report_measles_niis" ON "dws_report_measles_gis"."REPORT" = "dws_report_measles_niis"."REPORT"' +
        ' WHERE "LON" IS NOT NULL AND "LAT" IS NOT NULL' +
        ' AND "DISEASE" IN (\'055\')';
    var sqlParmeter = [];
    var date_start;
    var date_end;
    var items_city = [];
    var items_age = [];
    var items_country = [];
    var items_mmr = [];
    if (req.body) {
        // 時間
        if (req.body.start) {
            // console.log('有start喔')
            date_start = new Date(req.body.start)
            if (!isNaN(date_start.getTime())) {
                date_start = new Date(date_start.getFullYear(), date_start.getMonth(), date_start.getDate())
                sqlParmeter.push(date_start);
                strSql += ' AND "SICK_DATE" >= $' + sqlParmeter.length;
            }
        }
        if (req.body.end) {
            // console.log('有end喔')
            date_end = new Date(req.body.end)
            if (!isNaN(date_end.getTime())) {
                date_end = new Date(date_end.getFullYear(), date_end.getMonth(), date_end.getDate() + 1)
                sqlParmeter.push(date_end);
                strSql += ' AND "SICK_DATE" < $' + sqlParmeter.length;
            }
        }
        // 診斷/確診
        if (req.body.case_static_determine) {
            console.log('有case_static_determine喔')
            var items = req.body.case_static_determine.split('&')
            if (items.indexOf('診斷中個案') >= 0) {
                strSql += ' AND "DETERMINED_STATUS" = 0';
            } else if (items.indexOf('確診個案') >= 0) {
                strSql += ' AND "DETERMINED_STATUS" = 5';
            } else {
                strSql += ' AND "DETERMINED_STATUS" IN (0,5)';
            }
        }
        // 本土/境外移入
        if (req.body.immigration && req.body.immigration.length > 0) {
            // console.log('有immigration喔')
            var items = req.body.immigration.split('&')
            if (items.indexOf('本土') >= 0 && items.indexOf('境外移入') >= 0) {

            } else if (items.indexOf('本土') >= 0) {
                strSql += ' AND ("IMMIGRATION" IS NULL OR "IMMIGRATION" = 0)';
            } else if (items.indexOf('境外移入') >= 0) {
                // strSql += ' AND dws_report_measles_gis."IMMIGRATION" = 1';
                strSql += ' AND "IMMIGRATION" <> 0';
            }
        }
        if (req.body.city) {
            // console.log('有city喔')
            items_city = req.body.city.split(',')
            if (items_city.length == 1) {
                sqlParmeter.push(items_city[0]);
                strSql += ' AND "RESIDENCE_COUNTY_NAME" = $' + sqlParmeter.length;
            } else if (items_city.length == 2) {
                sqlParmeter.push(items_city[0]);
                strSql += ' AND "RESIDENCE_COUNTY_NAME" = $' + sqlParmeter.length;
                sqlParmeter.push(items_city[1]);
                strSql += ' AND "RESIDENCE_TOWN_NAME" = $' + sqlParmeter.length;
            } else if (items_city.length == 3) {
                sqlParmeter.push(items_city[0]);
                strSql += ' AND "RESIDENCE_COUNTY_NAME" = $' + sqlParmeter.length;
                sqlParmeter.push(items_city[1]);
                strSql += ' AND "RESIDENCE_TOWN_NAME" = $' + sqlParmeter.length;
                sqlParmeter.push(items_city[2]);
                strSql += ' AND "RESIDENCE_VILLAGE_NAME" = $' + sqlParmeter.length;
            }
        }
        // 年齡層
        if (req.body.age && req.body.age.length > 0) {
            // console.log('有age喔')
            items_age = req.body.age.split('&')
            if (items_age.length > 0) {
                var strSqlAge = ''
                if (items_age.indexOf('0') >= 0) {
                    if (strSqlAge.length != 0) {
                        strSqlAge += ' OR ';
                    }
                    strSqlAge += 'dws_report_measles_gis."SICK_AGE" = 0';
                }
                if (items_age.indexOf('1-6') >= 0) {
                    if (strSqlAge.length != 0) {
                        strSqlAge += ' OR ';
                    }
                    strSqlAge += 'dws_report_measles_gis."SICK_AGE" BETWEEN 1 AND 6';
                }
                if (items_age.indexOf('7-19') >= 0) {
                    if (strSqlAge.length != 0) {
                        strSqlAge += ' OR ';
                    }
                    strSqlAge += 'dws_report_measles_gis."SICK_AGE" BETWEEN 7 AND 19';
                }
                if (items_age.indexOf('20-39') >= 0) {
                    if (strSqlAge.length != 0) {
                        strSqlAge += ' OR ';
                    }
                    strSqlAge += 'dws_report_measles_gis."SICK_AGE" BETWEEN 20 AND 39';
                }
                if (items_age.indexOf('40+') >= 0) {
                    if (strSqlAge.length != 0) {
                        strSqlAge += ' OR ';
                    }
                    strSqlAge += 'dws_report_measles_gis."SICK_AGE" >= 40';
                }
                strSql += ' AND (' + strSqlAge + ')'
            }
        }
        if (req.body.gender && req.body.gender.length > 0) {
            // console.log('有gender喔')
            var items_gender = req.body.gender.split('&')
            if (items_gender.indexOf('女') >= 0 && items_gender.indexOf('男') >= 0) {

            } else if (items_gender.indexOf('女') >= 0) {
                sqlParmeter.push('F');
                strSql += ' AND "GENDER_DESC" = $' + sqlParmeter.length;
            } else if (items_gender.indexOf('男') >= 0) {
                sqlParmeter.push('M');
                strSql += ' AND "GENDER_DESC" = $' + sqlParmeter.length;
            }
        }
        if (req.body.country && req.body.country.length > 0) {
            console.log('有country喔')
            items_country = req.body.country.split('&')
            if (items_country.length > 0) {
                strSqlCountry = ''
                items_country.forEach(function (country) {
                    if (strSqlCountry.length > 0) {
                        strSqlCountry += ','
                    }
                    sqlParmeter.push(country)
                    strSqlCountry += '$' + sqlParmeter.length
                })
                strSql += ' AND "INFECTED_COUNTRY_NAME" IN (' + strSqlCountry + ')'
            }
        }
        // 疫苗接種情形 order: ["未接種", "1劑", "2劑", "不明"],
        if (req.body.mmr && req.body.mmr.length > 0) {
            console.log('req.body.mmr: ' + req.body.mmr);
            items_mmr = req.body.mmr.split('&');
            if (items_mmr.length > 0) {
                var strSqlmmr = ''
                if (items_mmr.indexOf('未接種') >= 0) {
                    if (strSqlmmr.length != 0) {
                        strSqlmmr += ' OR ';
                    }
                    strSqlmmr += 'dws_report_measles_niis."Resultcode" = 3';
                }
                if (items_mmr.indexOf('1劑') >= 0) {
                    if (strSqlmmr.length != 0) {
                        strSqlmmr += ' OR ';
                    }
                    strSqlmmr += 'dws_report_measles_niis."Resultcode" = 1';
                }
                if (items_mmr.indexOf('2劑') >= 0) {
                    if (strSqlmmr.length != 0) {
                        strSqlmmr += ' OR ';
                    }
                    strSqlmmr += 'dws_report_measles_niis."Resultcode" = 2';
                }
                if (items_mmr.indexOf('不明') >= 0) {
                    if (strSqlmmr.length != 0) {
                        strSqlmmr += ' OR ';
                    }
                    strSqlmmr += 'dws_report_measles_niis."Resultcode" = 0';
                }
                strSql += ' AND (' + strSqlmmr + ')'
            }
        }
    }
    strSql += ' ORDER BY "SICK_DATE"'
    client.query(strSql, sqlParmeter, function (err, row) {
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
                    obj.LON,
                    obj.LAT
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