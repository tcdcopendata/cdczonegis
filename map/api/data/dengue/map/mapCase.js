var pg = require('pg');
var config = require('../../../../config');
var connectionString = config.postgres;
var pgString = connectionString + config.db.cdczonegis;

// 複合查詢地圖點位
var points = function (req, res) {
    var client = new pg.Client(pgString);
    client.connect();

    var strSql = 'SELECT "LON","LAT","REPORT","IMMIGRATION","GENDER_DESC","SICK_AGE","DISEASE","SICK_DATE","DIAGNOSE_DATE",' +
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
        '"DIAGNOSE_DATE",' +
        // '"TEL_HOME",' +
        //重症死亡
        ' "HAS_SC",' +
        ' "DEATH_CNT",' +
        //血清型
        ' "PATHOGEN_DETAIL_NAME",' +
        //NS1
        ' "NS1_RESULT"' +

        ' FROM "dws_report_dengue_gis"' +
        ' WHERE "LON" IS NOT NULL AND "LAT" IS NOT NULL' +
        ' AND "DISEASE" IN (\'061\', \'0654\')'
    var sqlParmeter = []
    var date_start
    var date_end
    var date_column = "SICK_DATE";
    var items_city = []
    var items_age = []
    var items_ns1 = []
    var items_illness = []
    var items_death = []
    var items_country = []
    if (req.body) {
        // 時間
        if (req.body.timeType) {
            switch (req.body.timeType) {
                case '發病日':
                    date_column = 'SICK_DATE';
                    break;
                case '診斷日':
                    date_column = 'DIAGNOSE_DATE';
                    break;
                case '疾管署收到日':
                    date_column = 'REPORT_DATE';
                    break;
            }
        }
        if (req.body.start) {
            // console.log('有start喔')
            date_start = new Date(req.body.start)
            if (!isNaN(date_start.getTime())) {
                date_start = new Date(date_start.getFullYear(), date_start.getMonth(), date_start.getDate())
                sqlParmeter.push(date_start);
                strSql += ' AND "' + date_column + '" >= $' + sqlParmeter.length;
            }
        }
        if (req.body.end) {
            // console.log('有end喔')
            date_end = new Date(req.body.end)
            if (!isNaN(date_end.getTime())) {
                date_end = new Date(date_end.getFullYear(), date_end.getMonth(), date_end.getDate() + 1)
                sqlParmeter.push(date_end);
                strSql += ' AND "' + date_column + '" < $' + sqlParmeter.length;
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
                // strSql += ' AND dws_report_dengue_gis."IMMIGRATION" = 1';
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
        if (req.body.age && req.body.age.length > 0) {
            // console.log('有age喔')
            items_age = req.body.age.split('&')
            if (items_age.length > 0) {
                var strSqlAge = ''
                if (items_age.indexOf('0-14') >= 0) {
                    if (strSqlAge.length != 0) {
                        strSqlAge += ' OR ';
                    }
                    strSqlAge += '"SICK_AGE" BETWEEN 0 AND 14';
                }
                if (items_age.indexOf('15-49') >= 0) {
                    if (strSqlAge.length != 0) {
                        strSqlAge += ' OR ';
                    }
                    strSqlAge += '"SICK_AGE" BETWEEN 15 AND 49';
                }
                if (items_age.indexOf('50-64') >= 0) {
                    if (strSqlAge.length != 0) {
                        strSqlAge += ' OR ';
                    }
                    strSqlAge += '"SICK_AGE" BETWEEN 50 AND 64';
                }
                if (items_age.indexOf('65+') >= 0) {
                    if (strSqlAge.length != 0) {
                        strSqlAge += ' OR ';
                    }
                    strSqlAge += '"SICK_AGE" >= 65';
                }
                strSql += ' AND (' + strSqlAge + ')'
            }
        }
        if (req.body.gender && req.body.gender.length > 0) {
            // console.log('有gender喔')
            var items_gender = req.body.gender.split('&')
            if (items_gender.indexOf('女') >= 0 && items_gender.indexOf('男') >= 0) {

            } else if (items_gender.indexOf('女') >= 0) {
                sqlParmeter.push('女');
                strSql += ' AND "GENDER_DESC" = $' + sqlParmeter.length;
            } else if (items_gender.indexOf('男') >= 0) {
                sqlParmeter.push('男');
                strSql += ' AND "GENDER_DESC" = $' + sqlParmeter.length;
            }
        }
        if (req.body.ns1 && req.body.ns1.length > 0) {
            // console.log('有ns1喔')
            items_ns1 = req.body.ns1.split('&')
            if (items_ns1.indexOf('陽性') >= 0 && items_ns1.indexOf('陰性') >= 0) {

            } else if (items_ns1.indexOf('陽性') >= 0) {
                strSql += ' AND "NS1_RESULT" = \'NS1陽性\''
            } else if (items_ns1.indexOf('陰性') >= 0) {
                strSql += ' AND "NS1_RESULT" <> \'NS1陽性\''
            }
        }
        if (req.body.illness && req.body.illness.length > 0) {
            // console.log('有illness喔')
            items_illness = req.body.illness.split('&')
            if (items_illness.indexOf('重症') >= 0 && items_illness.indexOf('非重症') >= 0) {

            } else if (items_illness.indexOf('重症') >= 0) {
                strSql += ' AND "HAS_SC" = \'有\''
            } else if (items_illness.indexOf('非重症') >= 0) {
                strSql += ' AND "HAS_SC" <> \'有\''
            }
        }
        if (req.body.death && req.body.death.length > 0) {
            console.log('有death喔')
            items_death = req.body.death.split('&')
            if (items_death.indexOf('死亡') >= 0 && items_death.indexOf('非死亡') >= 0) {

            } else if (items_death.indexOf('死亡') >= 0) {
                strSql += ' AND "DEATH_CNT" = 1'
            } else if (items_death.indexOf('非死亡') >= 0) {
                strSql += ' AND "DEATH_CNT" <> 1'
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
    }
    strSql += ' ORDER BY "' + date_column + '"'
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

module.exports = { points };