var pg = require('pg');
var config = require('../../../../config');
var connectionString = config.postgres;
var pgStringZone = config.pgService.cdczone + config.db.cdczone;
var pgStringTrace = config.pgService.cdctrace + config.db.cdctrace;

// 複合查詢地圖點位
var points = function (req, res) {
    var client = new pg.Client(pgStringZone);
    client.connect();

    var strSql =
        'SELECT "measles_cluster_info"."sickdate_first",' +
        '"measles_cluster_info"."sickdate_last",' +
        '"measles_cluster_info"."report_first",' +
        '"LON", "LAT",' +
        '"REPORT", "IMMIGRATION", "GENDER_DESC", "SICK_AGE", "DISEASE", "SICK_DATE",' +
        '"DETERMINED_STATUS", "DETERMINED_STATUS_DESC",' +
        '"RESIDENCE_COUNTY_NAME","RESIDENCE_TOWN_NAME","RESIDENCE_VILLAGE_NAME",' +
        '"INFECTED_COUNTRY_NAME",' +
        // '"NAME_S",' +
        '"ADDRESS",' +
        '"PHB_RECEIVED_DATE",' +
        '"REPORT_DATE",' +
        '"DIAGNOSE_DATE"' +
        // '"TEL_HOME"' +
        ' FROM "dws_report_measles_gis"' +
        ' LEFT JOIN "measles_cluster_relation"' +
        ' ON "dws_report_measles_gis"."REPORT" = "measles_cluster_relation"."case_report"' +
        ' LEFT JOIN "measles_cluster_info"' +
        ' ON "measles_cluster_info"."id" = "measles_cluster_relation"."info_id"' +
        ' WHERE "LON" IS NOT NULL AND "LAT" IS NOT NULL' +
        ' AND "DISEASE" IN(\'055\') AND "measles_cluster_info"."sickdate_first" IS NOT NULL';

    // 'SELECT "LON","LAT","REPORT","IMMIGRATION","GENDER_DESC","SICK_AGE","DISEASE","SICK_DATE",' +
    // '"DETERMINED_STATUS","DETERMINED_STATUS_DESC",' +
    // //權限判斷
    // '"RESIDENCE_COUNTY_NAME",' +
    // '"RESIDENCE_TOWN_NAME",' +
    // '"RESIDENCE_VILLAGE_NAME",' +
    // //國家
    // '"INFECTED_COUNTRY_NAME",' +
    // //個資
    // // '"NAME_S",' +
    // '"ADDRESS",' +
    // '"PHB_RECEIVED_DATE",' +
    // '"REPORT_DATE",' +
    // '"DIAGNOSE_DATE"' +
    // // '"TEL_HOME",' + 

    // ' FROM "dws_report_measles_gis"' +
    // ' WHERE "LON" IS NOT NULL AND "LAT" IS NOT NULL' +
    // ' AND "DISEASE" IN (\'055\')'
    var sqlParameter = []
    var date_start
    var date_end
    var items_city = []
    if (req.body) {
        // 時間
        if (req.body.start) {
            // console.log('有start喔')
            date_start = new Date(req.body.start)
            if (!isNaN(date_start.getTime())) {
                date_start = new Date(date_start.getFullYear(), date_start.getMonth(), date_start.getDate())
                sqlParameter.push(date_start);
                strSql += ' AND "measles_cluster_info"."sickdate_first" >= $' + sqlParameter.length;
            }
        }
        if (req.body.end) {
            // console.log('有end喔')
            date_end = new Date(req.body.end)
            if (!isNaN(date_end.getTime())) {
                date_end = new Date(date_end.getFullYear(), date_end.getMonth(), date_end.getDate() + 1)
                sqlParameter.push(date_end);
                strSql += ' AND "measles_cluster_info"."sickdate_first" < $' + sqlParameter.length;
            }
        }
        if (req.body.city) {
            // console.log('有city喔')
            items_city = req.body.city.split(',')
            if (items_city.length == 1) {
                sqlParameter.push(items_city[0]);
                strSql += ' AND "RESIDENCE_COUNTY_NAME" = $' + sqlParameter.length;
            } else if (items_city.length == 2) {
                sqlParameter.push(items_city[0]);
                strSql += ' AND "RESIDENCE_COUNTY_NAME" = $' + sqlParameter.length;
                sqlParameter.push(items_city[1]);
                strSql += ' AND "RESIDENCE_TOWN_NAME" = $' + sqlParameter.length;
            } else if (items_city.length == 3) {
                sqlParameter.push(items_city[0]);
                strSql += ' AND "RESIDENCE_COUNTY_NAME" = $' + sqlParameter.length;
                sqlParameter.push(items_city[1]);
                strSql += ' AND "RESIDENCE_TOWN_NAME" = $' + sqlParameter.length;
                sqlParameter.push(items_city[2]);
                strSql += ' AND "RESIDENCE_VILLAGE_NAME" = $' + sqlParameter.length;
            }
        }
        if (req.body.cluster_static_info && req.body.cluster_static_info != -1) {
            sqlParameter.push(req.body.cluster_static_info);
            strSql += ' AND "measles_cluster_info"."id" = $' + sqlParameter.length;
        }
    }
    strSql += ' ORDER BY "SICK_DATE"'
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

var pointsContact = function (req, res) {
    var result = {};
    try {
        var client = new pg.Client(pgStringZone);
        client.connect();

        var strSql =
            'SELECT "dws_report_measles_gis"."REPORT"' +
            ' FROM "dws_report_measles_gis"' +
            ' LEFT JOIN "measles_cluster_relation"' +
            ' ON "dws_report_measles_gis"."REPORT" = "measles_cluster_relation"."case_report"' +
            ' LEFT JOIN "measles_cluster_info"' +
            ' ON "measles_cluster_info"."id" = "measles_cluster_relation"."info_id"' +
            ' WHERE "DISEASE" IN(\'055\') AND "measles_cluster_info"."sickdate_first" IS NOT NULL';
        var sqlParameter = []
        var date_start
        var date_end
        var items_city = []
        if (req.body) {
            // 時間
            if (req.body.start) {
                // console.log('有start喔')
                date_start = new Date(req.body.start)
                if (!isNaN(date_start.getTime())) {
                    date_start = new Date(date_start.getFullYear(), date_start.getMonth(), date_start.getDate())
                    sqlParameter.push(date_start);
                    strSql += ' AND "measles_cluster_info"."sickdate_first" >= $' + sqlParameter.length;
                }
            }
            if (req.body.end) {
                // console.log('有end喔')
                date_end = new Date(req.body.end)
                if (!isNaN(date_end.getTime())) {
                    date_end = new Date(date_end.getFullYear(), date_end.getMonth(), date_end.getDate() + 1)
                    sqlParameter.push(date_end);
                    strSql += ' AND "measles_cluster_info"."sickdate_first" < $' + sqlParameter.length;
                }
            }
            if (req.body.city) {
                // console.log('有city喔')
                items_city = req.body.city.split(',')
                if (items_city.length == 1) {
                    sqlParameter.push(items_city[0]);
                    strSql += ' AND "RESIDENCE_COUNTY_NAME" = $' + sqlParameter.length;
                } else if (items_city.length == 2) {
                    sqlParameter.push(items_city[0]);
                    strSql += ' AND "RESIDENCE_COUNTY_NAME" = $' + sqlParameter.length;
                    sqlParameter.push(items_city[1]);
                    strSql += ' AND "RESIDENCE_TOWN_NAME" = $' + sqlParameter.length;
                } else if (items_city.length == 3) {
                    sqlParameter.push(items_city[0]);
                    strSql += ' AND "RESIDENCE_COUNTY_NAME" = $' + sqlParameter.length;
                    sqlParameter.push(items_city[1]);
                    strSql += ' AND "RESIDENCE_TOWN_NAME" = $' + sqlParameter.length;
                    sqlParameter.push(items_city[2]);
                    strSql += ' AND "RESIDENCE_VILLAGE_NAME" = $' + sqlParameter.length;
                }
            }
            if (req.body.cluster_static_info && req.body.cluster_static_info != -1) {
                sqlParameter.push(req.body.cluster_static_info);
                strSql += ' AND "measles_cluster_info"."id" = $' + sqlParameter.length;
            }
        }
        strSql += ' ORDER BY "SICK_DATE"'
        client.query(strSql, sqlParameter, function (err, row) {
            client.end();
            if (err) {
                console.log('err: ' + err)
            } else {
                result.type = 'FeatureCollection';
                result.features = [];
                if (row && row.rows && row.rows.length > 0) {
                    var clientContact = new pg.Client(pgStringTrace);
                    clientContact.connect();
                    var sqlParameterContact = [];
                    var strSqlContactReport = '';
                    row.rows.forEach(function (caseReport) {
                        if (strSqlContactReport != '') {
                            strSqlContactReport += ','
                        }
                        sqlParameterContact.push(caseReport['REPORT']);
                        strSqlContactReport += '$' + sqlParameterContact.length;
                    });

                    var strSqlContact =
                        'SELECT "SYMPTOM","contact_person_gis"."lon","contact_person_gis"."lat",' +
                        '"CONTACT_DATE","AGE","DISEASE_FEATURE","RESIDENTIAL_COUNTY_NAME","RESIDENTIAL_TOWN_NAME" FROM "CONTACT_PERSON"' +
                        ' LEFT JOIN' +

                        ' (SELECT "contact_person_id","SYMPTOM" FROM "HEALTH_TRACE_RECORD" compA WHERE "CREATE_DATE" =' +

                        ' (select MAX(compB."CREATE_DATE")' +
                        ' FROM "HEALTH_TRACE_RECORD" compB WHERE compA."contact_person_id" = compB."contact_person_id")' +

                        ' ORDER BY "contact_person_id") AS SYMP' +

                        ' ON SYMP."contact_person_id" = "CONTACT_PERSON"."contact_person_id"' +
                        ' LEFT JOIN "contact_person_gis" ON "contact_person_gis"."contact_person_id" = "CONTACT_PERSON"."contact_person_id"' +

                        ' WHERE "REPORT_ID" IN (' + strSqlContactReport + ')';

                    clientContact.query(strSqlContact, sqlParameterContact, function (errContact, rowContact) {
                        clientContact.end();
                        if (errContact) {
                            console.log('errContact: ' + errContact);
                            result.error = true;
                            result.errorMessage = errContact;
                        } else {
                            if (rowContact.rows && rowContact.rows.length > 0) {
                                result.features = [];
                                rowContact.rows.forEach(function (obj) {
                                    if (obj.lon && obj.lat) {
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
                                        result.features.push(geojson);
                                    }
                                });
                            }
                        }
                        res.send(result);
                    })
                } else {
                    res.send(result);
                }
            }
        });
    } catch (tryError) {
        result.error = true;
        result.errorMessage = tryError;
        res.send(result);
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

module.exports = {
    points,
    pointsContact
};