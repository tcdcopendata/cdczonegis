var pg = require('pg');
var config = require('../../../../config');
var pgStringZone = config.pgService.cdczone + config.db.cdczone;
var pgStringTrace = config.pgService.cdctrace + config.db.cdctrace;

// InfoWindow：摘要
var summary = function (req, res) {
    var result = {};
    try {
        var client = new pg.Client(pgStringZone);
        var strSql = 'SELECT "measles_cluster_info".* FROM "measles_cluster_relation"' +
            ' LEFT JOIN "measles_cluster_info"' +
            ' ON "measles_cluster_relation"."info_id" = "measles_cluster_info"."id"' +
            ' WHERE "measles_cluster_relation"."case_report" = $1';
        var sqlParameter = [req.body.report];
        client.connect();
        client.query(strSql, sqlParameter, function (err, rowCluster) {
            client.end();
            if (err) {
                console.log('err: ' + err);
                result.error = true;
                result.errorMessage = err;
                res.send(result);
            } else {
                if (rowCluster.rows && rowCluster.rows.length == 1) {
                    result.report_first = rowCluster.rows[0]['report_first'];
                    if (rowCluster.rows[0]['case_name']) {
                        result.cluster_name = rowCluster.rows[0]['case_name'];
                    } else if (rowCluster.rows[0]['epidemic_no']) {
                        result.cluster_name = "流行案例編號：" + rowCluster.rows[0]['epidemic_no'];
                    } else {
                        result.cluster_name = "無";
                    }
                }
                res.send(result);
            }
        });
    } catch (e) {

    }
    // WHERE "case_report" = '1073800000468'
}
// InfoWindow：地理資訊
var geo = function (req, res) {
    var result = {};
    try {
        var clientContact = new pg.Client(pgStringTrace);
        var strSqlContact =
            'SELECT DISTINCT "DISEASE_FEATURE" ->> \'CONTACT_PLACE\' AS "CONTACT_PLACE", COUNT(*) AS COUNT' +
            ' FROM "CONTACT_PERSON"' +
            ' WHERE "REPORT_ID" = $1' +
            ' GROUP BY "DISEASE_FEATURE" ->> \'CONTACT_PLACE\'' +
            ' ORDER BY "DISEASE_FEATURE" ->> \'CONTACT_PLACE\'';
        var sqlParameter = [req.body.report];
        clientContact.connect();
        clientContact.query(strSqlContact, sqlParameter, function (errContact, rowContact) {
            clientContact.end();
            if (errContact) {
                console.log('err: ' + errContact);
                result.error = true;
                result.errorMessage = errContact;
                res.send(result);
            } else {
                if (rowContact.rows && rowContact.rows.length > 0) {
                    var clientGeom = new pg.Client(pgStringZone);
                    var strSqlGeomPlace = '';
                    var sqlGeomParameter = [];
                    rowContact.rows.forEach(function (contact) {
                        if (contact && contact.CONTACT_PLACE) {
                            if (strSqlGeomPlace != '') {
                                strSqlGeomPlace += ',';
                            }
                            sqlGeomParameter.push(contact.CONTACT_PLACE);
                            strSqlGeomPlace += '$' + sqlGeomParameter.length;
                        }
                    })
                    var strSqlGeom = 'SELECT * FROM "contact_place_geom" WHERE "place" IN (' + strSqlGeomPlace + ')';
                    clientGeom.connect();
                    clientGeom.query(strSqlGeom, sqlGeomParameter, function (errGeom, rowGeom) {
                        clientGeom.end();
                        if (errGeom) {
                            console.log('err: ' + errGeom);
                            result.error = true;
                            result.errorMessage = errGeom;
                            res.send(result);
                        } else {
                            var objGeom = {};
                            if (rowGeom.rows && rowGeom.rows.length > 0) {
                                rowGeom.rows.forEach(function (obj) {
                                    if (obj.place) {
                                        objGeom[obj.place] = obj;
                                    }
                                })
                            }
                            result.geojson = {};
                            result.geojson.type = 'FeatureCollection';
                            result.geojson.features = [];
                            rowContact.rows.forEach(function (contact) {
                                var obj = objGeom[contact.CONTACT_PLACE];
                                if (obj && obj.lng && obj.lat) {
                                    var geojson = {};
                                    geojson.type = 'Feature';
                                    geojson.geometry = {
                                        type: 'Point',
                                        coordinates: [
                                            obj.lng,
                                            obj.lat
                                        ]
                                    };
                                    geojson.properties = obj;
                                    geojson.properties.count = contact.count;
                                    result.geojson['features'].push(geojson);
                                }
                            });
                            res.send(result);
                        }
                    });
                } else {
                    result.error = true;
                    result.errorMessage = '無搜尋結果';
                    res.send(result);
                }
            }
        });
    } catch (tryError) {
        console.log('tryError: ' + tryError);
        result.error = true;
        result.errorMessage = tryError;
        res.send(result);
    }
}
// InfoWindow：就醫
var hospital = function (req, res) {
    var client = new pg.Client(pgStringZone);

    var strSql = 'SELECT "dws_report_measles_gis"."REPORT","hospital"."ID","hospital"."NAME","hospital"."lon","hospital"."lat" FROM  "dws_report_measles_gis"' +
        ' LEFT JOIN "hospital" ON "dws_report_measles_gis"."REPORT_HOSPITAL" = "hospital"."ID"' +
        ' WHERE "dws_report_measles_gis"."REPORT" = $1';
    var sqlParmeter = [req.body.report];
    client.connect();
    client.query(strSql, sqlParmeter, function (err, row) {
        client.end();
        var result = {};
        if (err) {
            console.log('err: ' + err)
            result.error = true;
            result.errorMessage = err;
        } else {
            result.data = row.rows;
        }
        res.send(result);
    });
}
// InfoWindow：接觸者
var contact = function (req, res) {
    var time_execute = new Date().getTime();
    var i = 1;
    var client = new pg.Client(pgStringTrace);

    // var strSql =
    //     'SELECT "CONTACT_DATE","GENDER","AGE","lon","lat" FROM "CONTACT_PERSON"' +
    //     ' LEFT JOIN "contact_person_gis"' +
    //     ' ON "CONTACT_PERSON"."contact_person_id" = "contact_person_gis"."contact_person_id"';

    // var strSqlContact = 'select DISTINCT "SYMPTOM", COUNT(*) from "HEALTH_TRACE_RECORD" compA where "CREATE_DATE" = ' +
    //     '(select MAX(compB."CREATE_DATE") from "HEALTH_TRACE_RECORD" compB' +
    //     ' where compA."contact_person_id" = compB."contact_person_id") GROUP BY "SYMPTOM"';

    var strSql = 'SELECT "SYMPTOM","contact_person_gis"."lon","contact_person_gis"."lat",' +
        '"CONTACT_DATE","AGE","DISEASE_FEATURE","RESIDENTIAL_COUNTY_NAME" FROM "CONTACT_PERSON"' +
        ' LEFT JOIN' +

        ' (SELECT "contact_person_id","SYMPTOM" FROM "HEALTH_TRACE_RECORD" compA WHERE "CREATE_DATE" =' +

        ' (select MAX(compB."CREATE_DATE")' +
        ' FROM "HEALTH_TRACE_RECORD" compB WHERE compA."contact_person_id" = compB."contact_person_id")' +

        ' ORDER BY "contact_person_id") AS SYMP' +

        ' ON SYMP."contact_person_id" = "CONTACT_PERSON"."contact_person_id"' +
        ' LEFT JOIN "contact_person_gis" ON "contact_person_gis"."contact_person_id" = "CONTACT_PERSON"."contact_person_id"' +

        ' WHERE "REPORT_ID" = $1';
    var sqlParmeter = [req.body.report];
    client.connect();
    client.query(strSql, sqlParmeter, function (err, row) {
        console.log('execute: ' + (new Date().getTime() - time_execute));
        client.end();
        var result = {};
        if (err) {
            console.log('err: ' + err);
            result.error = true;
            result.errorMessage = err;
        } else {
            if (row.rows && row.rows.length > 0) {
                result.geojson = {};
                result.geojson.type = 'FeatureCollection';
                result.geojson.features = [];
                row.rows.forEach(function (obj) {
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
                        result.geojson['features'].push(geojson);
                    }
                });
                result.count = {};
                result.count.contact_count = row.rows.length;
                result.count.contact_situation = 0;
                result.count.contact_risk = 0;
                result.count.contact_watch = 0;
                result.count.contact_imig = 0;
                result.count.contact_imig_total = 0;
                result.count.contact_mmr = 0;
                result.count.contact_mmr_total = 0;
                result.count.last_watch = new Date(1900, 0, 1);
                result.count.watch_main = [req.body.county];
                result.count.watch_sub = [];
                var date_now = new Date();
                row.rows.forEach(function (contact) {
                    var date_contact = new Date(contact["CONTACT_DATE"]);
                    if (contact["SYMPTOM"]) {
                        result.count.contact_situation++;
                    }
                    if (contact["AGE"]) {
                        var age = contact["AGE"].split('歲')[0];
                        var feature = contact['DISEASE_FEATURE'];
                        if (age && age.length > 0) {
                            age = parseInt(age);
                            if (!isNaN(age) && age <= 6) {
                                result.count.contact_risk++;
                            }
                            if (!isNaN(age) && age <= 1) {
                                result.count.contact_imig_total++;
                                if (feature && feature.VACCINE_RECORD &&
                                    feature.VACCINE_RECORD.IMIG_DATE &&
                                    feature.VACCINE_RECORD.IMIG_DATE.length > 0 &&
                                    feature.VACCINE_RECORD.IMIG_DATE != 'null') {
                                    result.count.contact_imig++;
                                }
                            }
                            if (!isNaN(age) && age >= 1 && age <= 6) {
                                result.count.contact_mmr_total++;
                                if (feature && feature.VACCINE_RECORD &&
                                    feature.VACCINE_RECORD.MMR_72 &&
                                    feature.VACCINE_RECORD.MMR_72.length > 0 &&
                                    feature.VACCINE_RECORD.MMR_72 != 'null') {
                                    result.count.contact_mmr++;
                                }
                            }
                        }
                    }
                    var days = (date_now.getTime() - date_contact.getTime()) / (1000 * 60 * 60 * 24);
                    if (days <= 18) {
                        result.count.contact_watch++;
                    }

                    if (date_contact.getTime() > result.count.last_watch.getTime()) {
                        result.count.last_watch = date_contact;
                    }
                    if (contact['RESIDENTIAL_COUNTY_NAME']) {
                        var county = contact['RESIDENTIAL_COUNTY_NAME'].trim();
                        if (county &&
                            county.length > 0 &&
                            result.count.watch_main.indexOf(county) < 0 &&
                            result.count.watch_sub.indexOf(county) < 0) {
                            result.count.watch_sub.push(county);
                        }
                    }
                });
                result.count.last_watch = new Date(result.count.last_watch.getTime() + 18 * 24 * 60 * 60 * 1000);
            }
        }
        console.log('execute: ' + (new Date().getTime() - time_execute));
        res.send(result);
    });
}
// InfoWindow：群聚
var cluster = function (req, res) {
    var clientZone = new pg.Client(pgStringZone);
    var strSqlZone =
        'SELECT ABC."case_report","measles_cluster_info".* FROM "measles_cluster_relation"' +
        ' LEFT JOIN "measles_cluster_info" ON "measles_cluster_relation"."info_id" = "measles_cluster_info"."id"' +
        ' RIGHT JOIN "measles_cluster_relation" AS ABC ON ABC."info_id" = "measles_cluster_info"."id"' +
        ' WHERE "measles_cluster_relation"."case_report" = $1';
    var sqlParmeterZone = [req.body.report];
    clientZone.connect();
    clientZone.query(strSqlZone, sqlParmeterZone, function (errZone, rowZone) {
        clientZone.end();
        var result = {};
        if (errZone) {
            result.error = true;
            result.errorMessage = '群聚搜尋錯誤：' + errZone;
            res.send(result);
        } else {
            if (rowZone.rows && rowZone.rows.length > 0) {
                var case_report = [];
                result.event = {};
                result.event.report_first = rowZone.rows[0]['report_first'];
                if (rowZone.rows[0]['case_name']) {
                    result.event.case_name = rowZone.rows[0]['case_name'];
                } else if (rowZone.rows[0]['epidemic_no']) {
                    result.event.case_name = "流行案例編號：" + rowZone.rows[0]['epidemic_no'];
                } else {
                    result.event.case_name = "無";
                }
                result.event.sickdate_first = new Date(rowZone.rows[0]['sickdate_first']);
                result.event.sickdate_last = new Date(rowZone.rows[0]['sickdate_last']);
                result.event.case_count = 0;
                result.event.residence_city = rowZone.rows[0]['residence_city'];
                rowZone.rows.forEach(function (rowDataZone) {
                    case_report.push(rowDataZone['case_report']);
                    var case_count = parseInt(rowDataZone['case_count']);
                    if (!isNaN(case_count)) {
                        result.event.case_count += case_count;
                    }
                });
                var clientTrace = new pg.Client(pgStringTrace);
                var strSqlTrace =
                    'SELECT "SYMPTOM","contact_person_gis"."lon","contact_person_gis"."lat",' +
                    '"CONTACT_DATE","AGE","DISEASE_FEATURE","RESIDENTIAL_COUNTY_NAME" FROM "CONTACT_PERSON"' +
                    ' LEFT JOIN' +

                    ' (select "contact_person_id","SYMPTOM" from "HEALTH_TRACE_RECORD" compA where "CREATE_DATE" =' +

                    ' (select MAX(compB."CREATE_DATE")' +
                    ' from "HEALTH_TRACE_RECORD" compB where compA."contact_person_id" = compB."contact_person_id")' +

                    ' ORDER BY "contact_person_id") AS SYMP' +

                    ' ON SYMP."contact_person_id" = "CONTACT_PERSON"."contact_person_id"' +
                    ' LEFT JOIN "contact_person_gis" ON "contact_person_gis"."contact_person_id" = "CONTACT_PERSON"."contact_person_id"' +

                    ' WHERE "REPORT_ID" IN(';
                var strSqlTraceIn = '';
                var sqlParmeterTrace = case_report;
                for (var x = 0; x < case_report.length; x++) {
                    if (x == 0) {
                        strSqlTraceIn += '$' + (x + 1).toString();
                    } else {
                        strSqlTraceIn += ',$' + (x + 1).toString();
                    }
                }
                strSqlTrace += strSqlTraceIn + ')';
                clientTrace.connect();
                clientTrace.query(strSqlTrace, sqlParmeterTrace, function (errTrace, rowTrace) {
                    clientTrace.end();
                    if (errTrace) {
                        console.log('errTrace: ' + errTrace);
                        result.error = true;
                        result.errorMessage = '群聚關連接觸者搜尋錯誤：' + errTrace;
                    } else {
                        var row = rowTrace;
                        if (row.rows && row.rows.length > 0) {
                            result.geojson = {};
                            result.geojson.type = 'FeatureCollection';
                            result.geojson.features = [];
                            row.rows.forEach(function (obj) {
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
                                }

                                result.geojson['features'].push(geojson);
                            });
                            result.count = {};
                            result.count.contact_count = row.rows.length;
                            result.count.contact_situation = 0;
                            result.count.contact_risk = 0;
                            result.count.contact_watch = 0;
                            result.count.contact_imig = 0;
                            result.count.contact_imig_total = 0;
                            result.count.contact_mmr = 0;
                            result.count.contact_mmr_total = 0;
                            result.count.last_watch = new Date(1900, 0, 1);
                            result.count.watch_main = [req.body.county];
                            result.count.watch_sub = [];
                            var date_now = new Date();
                            row.rows.forEach(function (contact) {
                                var date_contact = new Date(contact["CONTACT_DATE"]);
                                if (contact["SYMPTOM"]) {
                                    result.count.contact_situation++;
                                }
                                if (contact["AGE"]) {
                                    var age = contact["AGE"].split('歲')[0];
                                    var feature = contact['DISEASE_FEATURE'];
                                    if (age && age.length > 0) {
                                        age = parseInt(age);
                                        if (!isNaN(age) && age <= 6) {
                                            result.count.contact_risk++;
                                        }
                                        if (!isNaN(age) && age <= 1) {
                                            result.count.contact_imig_total++;
                                            if (feature && feature.VACCINE_RECORD &&
                                                feature.VACCINE_RECORD.IMIG_DATE &&
                                                feature.VACCINE_RECORD.IMIG_DATE.length > 0 &&
                                                feature.VACCINE_RECORD.IMIG_DATE != 'null') {
                                                result.count.contact_imig++;
                                            }
                                        }
                                        if (!isNaN(age) && age >= 1 && age <= 6) {
                                            result.count.contact_mmr_total++;
                                            if (feature && feature.VACCINE_RECORD &&
                                                feature.VACCINE_RECORD.MMR_72 &&
                                                feature.VACCINE_RECORD.MMR_72.length > 0 &&
                                                feature.VACCINE_RECORD.MMR_72 != 'null') {
                                                result.count.contact_mmr++;
                                            }
                                        }
                                    }
                                }
                                var days = (date_now.getTime() - date_contact.getTime()) / (1000 * 60 * 60 * 24);
                                if (days <= 18) {
                                    result.count.contact_watch++;
                                }

                                if (date_contact.getTime() > result.count.last_watch.getTime()) {
                                    result.count.last_watch = date_contact;
                                }
                                if (contact['RESIDENTIAL_COUNTY_NAME']) {
                                    var county = contact['RESIDENTIAL_COUNTY_NAME'].trim();
                                    if (county &&
                                        county.length > 0 &&
                                        result.count.watch_main.indexOf(county) < 0 &&
                                        result.count.watch_sub.indexOf(county) < 0) {
                                        result.count.watch_sub.push(county);
                                    }
                                }
                            });
                            result.count.last_watch = new Date(result.count.last_watch.getTime() + 18 * 24 * 60 * 60 * 1000);
                        }
                    }
                    res.send(result);
                });
            } else {
                res.send(result);
            }
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
    summary,
    geo,
    hospital,
    contact,
    cluster
};