var pg = require('pg');
var config = require('../../../../config');
var connectionString = config.postgres;
var pgString = connectionString + config.db.cdczonegis;

// 複合查詢地圖點位
var points = function (req, res) {
    var client = new pg.Client(pgString);
    client.connect();

    var strSql = 'SELECT ' +
        // 醫療院所
        '"DIM_TOWN_C"."COUNTY_NAME","DIM_TOWN_C"."TOWN_NAME",' +
        '"hospital"."lon","hospital"."lat","hospital"."ADDRESS",' +
        '"hospital"."HOSPITAL_LEVEL","hospital"."ID","hospital"."NAME","hospital"."ns1","hospital"."TEL","hospital"."specialcategory",' +
        // 個案
        '"REPORT","GENDER_DESC","SICK_AGE",' +
        //隱藏期
        '"REPORT_DATE","TRAVEL_DATETO","TRAVEL2_DATETO","TRAVEL3_DATETO",' +
        // '"REPORT_DATE",' +
        // '"DIAGNOSE_DATE",' +
        '"SICK_DATE"' +
        ' FROM "dws_report_dengue_gis"' +
        ' LEFT JOIN "hospital"' +
        ' ON "dws_report_dengue_gis"."REPORT_HOSPITAL"="hospital"."ID"' +
        ' LEFT JOIN "DIM_TOWN_C"' +
        ' ON "hospital"."COUNTY"="DIM_TOWN_C"."COUNTY_ID" AND "hospital"."TOWN"="DIM_TOWN_C"."TOWN_ID"' +
        ' WHERE "hospital"."lon" IS NOT NULL AND "hospital"."lat" IS NOT NULL' +
        ' AND "DISEASE" IN (\'061\', \'0654\')'

    var sqlParameter = []
    var date_start;
    var date_end;
    var date_column = "SICK_DATE";
    var items_city = [];
    var items_category = [];
    var items_ns1 = [];
    var items_hidden = [];
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
            date_start = new Date(req.body.start)
            if (!isNaN(date_start.getTime())) {
                date_start = new Date(date_start.getFullYear(), date_start.getMonth(), date_start.getDate())
                sqlParameter.push(date_start);
                strSql += ' AND "' + date_column + '" >= $' + sqlParameter.length;
            }
        }
        if (req.body.end) {
            date_end = new Date(req.body.end)
            if (!isNaN(date_end.getTime())) {
                date_end = new Date(date_end.getFullYear(), date_end.getMonth(), date_end.getDate() + 1)
                sqlParameter.push(date_end);
                strSql += ' AND "' + date_column + '" < $' + sqlParameter.length;
            }
        }
        // 診斷/確診
        if (req.body.medical_static_determine) {
            var items = req.body.medical_static_determine.split('&')
            if (items.indexOf('診斷中個案') >= 0) {
                strSql += ' AND "DETERMINED_STATUS" = 0';
            } else if (items.indexOf('確診個案') >= 0) {
                strSql += ' AND "DETERMINED_STATUS" = 5';
            } else {
                strSql += ' AND "DETERMINED_STATUS" IN (0,5)';
            }
        }
        // 城市
        if (req.body.city) {
            items_city = req.body.city.split(',')
            if (items_city.length == 1) {
                sqlParameter.push(items_city[0]);
                strSql += ' AND "COUNTY_NAME" = $' + sqlParameter.length;
            } else if (items_city.length == 2) {
                sqlParameter.push(items_city[0]);
                strSql += ' AND "COUNTY_NAME" = $' + sqlParameter.length;
                sqlParameter.push(items_city[1]);
                strSql += ' AND "TOWN_NAME" = $' + sqlParameter.length;
            }
        }
        if (req.body.category && req.body.category.length > 0) {
            items_category = req.body.category.split('&')
            if (items_category.length > 0) {
                var strSqlCategory = '';
                if (items_category.indexOf('醫學中心') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('1');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('區域醫院') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('2');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('地區醫院') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('3');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('診所') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('4');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('藥局') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('5');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('居家護理') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('6');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('康復之家') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('7');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('助產所') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('8');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('檢驗所') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('9');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('物理治療所') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('A');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('特約醫事放射機構') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('B');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('不詳') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('X');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                strSql += ' AND (' + strSqlCategory + ')'
            }
        }
        if (req.body.ns1 && req.body.ns1.length > 0) {
            items_ns1 = req.body.ns1.split('&');
            if (items_ns1.indexOf('是') >= 0 && items_ns1.indexOf('否') >= 0) {

            } else if (items_ns1.indexOf('是') >= 0) {
                sqlParameter.push('1');
                strSql += ' AND hospital."ns1" = $' + sqlParameter.length;
            } else if (items_ns1.indexOf('否') >= 0) {
                strSql += ' AND hospital."ns1" IS NULL';
            }
        }
    }
    strSql += ' ORDER BY "' + date_column + '"'
    client.query(strSql, sqlParameter, function (err, row) {
        if (err) console.log('err: ' + err)
        client.end();
        var result = {};
        var resultObj = {};
        result.type = 'FeatureCollection';
        result.features = [];
        row.rows.forEach(function (obj) {
            if (!resultObj[obj['ID']]) {
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
                geojson.properties['case_count'] = 0;
                geojson.properties['cases'] = [];
                resultObj[obj['ID']] = geojson;
            }
            resultObj[obj['ID']].properties.specialcategory = obj.specialcategory;
            resultObj[obj['ID']].properties.ADDRESS = obj.ADDRESS;
            resultObj[obj['ID']].properties.TEL = obj.TEL;
            resultObj[obj['ID']].properties['case_count']++;
            resultObj[obj['ID']].properties['cases'].push({
                'REPORT': obj.REPORT,
                'SICK_DATE': obj.SICK_DATE,
                'GENDER_DESC': obj.GENDER_DESC,
                'SICK_AGE': obj.SICK_AGE,
            });
        });
        Object.keys(resultObj).forEach(function (id) {
            result['features'].push(resultObj[id]);
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