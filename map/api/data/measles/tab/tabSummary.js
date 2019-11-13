var pg = require('pg');
var config = require('../../../../config');
var connectionString = config.postgres;
var pgStringZone = config.pgService.cdczone + config.db.cdczone;
var pgStringTrace = config.pgService.cdctrace + config.db.cdctrace;

// 摘要: 歷年同期確定病例數比較 (本土/境外移入)
var compare = function (req, res) {
    var year = new Date().getFullYear()
    if (req.query && req.query.year) {
        year = parseInt(req.query.year);
        if (isNaN(year)) {
            year = new Date().getFullYear();
        }
    }

    var client = new pg.Client(pgStringZone);
    client.connect();

    var sqlParameter = [];

    var counties = [];
    if (req.body && req.body.county) {
        counties = req.body.county.split(',');
    } else if (req.session && req.session.city) {
        counties = req.session.city.split(',');
    }
    var strSqlCounties = '';
    if (counties.length > 0) {
        counties.forEach(function (county) {
            if (strSqlCounties != '') {
                strSqlCounties += ',';
            }
            sqlParameter.push(county);
            strSqlCounties += '$' + sqlParameter.length;
        })
        strSqlCounties = ' AND "RESIDENCE_COUNTY_NAME" IN (' + strSqlCounties + ')';
    }
    var dists = [];
    if (req.body && req.body.dist) {
        dists = req.body.dist.split(',');
    } else if (req.session && req.session.dist) {
        dists = req.session.dist.split(',');
    }
    var strSqlDists = '';
    if (dists.length > 0) {
        dists.forEach(function (dist) {
            if (strSqlDists != '') {
                strSqlDists += ',';
            }
            sqlParameter.push(dist);
            strSqlDists += '$' + sqlParameter.length;
        })
        strSqlDists = ' AND "RESIDENCE_TOWN_NAME" IN (' + strSqlDists + ')';
    }

    var start_date = new Date(year - 9, 0, 1);
    sqlParameter.push(start_date);

    var strSql = 'SELECT DISTINCT date_part(\'year\', "SICK_DATE") AS sick_year, "IMMIGRATION" AS is_out_region, COUNT(*) AS count' +
        ' FROM dws_report_measles_gis' +
        ' WHERE "DETERMINED_STATUS" = 5' +
        strSqlCounties +
        strSqlDists +
        ' AND "SICK_DATE" >= $' + sqlParameter.length +
        ' GROUP BY sick_year, is_out_region' +
        ' ORDER BY sick_year, is_out_region';
    client.query(strSql, sqlParameter, function (err, row) {
        client.end();
        if (err) console.log('err: ' + err);
        var result = [];
        var resultObj = {};
        for (var x = year - 9; x <= year; x++) {
            var obj = {
                sick_year: x,
                '本土病例': 0,
                '境外移入病例': 0
            }
            resultObj[x] = obj;
        }
        row.rows.forEach(function (row_data) {
            if (row_data.is_out_region == '0') {
                resultObj[row_data.sick_year]['本土病例'] += parseInt(row_data.count);
            } else {
                resultObj[row_data.sick_year]['境外移入病例'] += parseInt(row_data.count);
            }
        })
        Object.keys(resultObj).sort().forEach(function (keyYear) {
            result.push(resultObj[keyYear]);
        });
        res.send(result);
    })
}

// // 摘要: 年度病例統計 // 先排確診再排通報
var counting = function (req, res) {
    var year = new Date().getFullYear()
    if (req.query && req.query.year) {
        var year_temp = parseInt(req.query.year)
        if (!isNaN(year_temp)) {
            year = year_temp
        }
    }
    var date_start = new Date(year, 0, 1);
    var date_end = new Date(year + 1, 0, 1);

    var client = new pg.Client(pgStringZone);
    client.connect();

    var strSql = 'SELECT DISTINCT "RESIDENCE_COUNTY_NAME","RESIDENCE_TOWN_NAME","RESIDENCE_VILLAGE_NAME","IMMIGRATION",' +
        ' "DETERMINED_STATUS",' +
        ' COUNT(*) AS "COUNT"' +
        ' FROM "dws_report_measles_gis"'
    var sqlParmeter = [];
    sqlParmeter.push(date_start);
    strSql += ' WHERE "SICK_DATE" >= $' + sqlParmeter.length;
    sqlParmeter.push(date_end);
    strSql += ' AND "SICK_DATE" < $' + sqlParmeter.length;
    strSql += ' GROUP BY "RESIDENCE_COUNTY_NAME","RESIDENCE_TOWN_NAME","RESIDENCE_VILLAGE_NAME","DETERMINED_STATUS","IMMIGRATION"';
    strSql += ' ORDER BY "RESIDENCE_COUNTY_NAME","RESIDENCE_TOWN_NAME","RESIDENCE_VILLAGE_NAME","DETERMINED_STATUS","IMMIGRATION"';

    client.query(strSql, sqlParmeter, function (err, row) {
        console.log('err: ' + err)
        client.end();

        var counties = [];
        if (req.body && req.body.county) {
            counties = req.body.county.split(',');
        } else if (req.session && req.session.city) {
            counties = req.session.city.split(',');
        }
        var dists = [];
        if (req.body && req.body.dist) {
            dists = req.body.dist.split(',');
        } else if (req.session && req.session.dist) {
            dists = req.session.dist.split(',');
        }
        console.log('dists: ' + dists);
        var permission_level = 0;
        if (req.body && req.body.permission_level) {
            permission_level = parseInt(req.body.permission_level)
            if (isNaN(permission_level)) {
                permission_level = 0;
            }
        } else if (req.session && req.session.org_level) {
            permission_level = parseInt(req.session.org_level)
            if (isNaN(permission_level)) {
                permission_level = 0;
            }
        }
        console.log('req.body.permission_level: ' + req.body.permission_level);
        console.log('req.session.org_level: ' + req.session.org_level);
        console.log('permission_level: ' + permission_level);
        var result = [];
        var obj_result = {
            '全國': {
                '行政區': '全國',
                '通報病例': 0,
                '確定病例(本土)': 0,
                '確定病例(境外)': 0
            }
        }
        if (permission_level == 2) {
            obj_result['全區'] = {
                '行政區': '全區',
                '通報病例': 0,
                '確定病例(本土)': 0,
                '確定病例(境外)': 0
            }
        }
        row.rows.forEach(function (datarow) {
            var city = datarow['RESIDENCE_COUNTY_NAME'];
            var dist = datarow['RESIDENCE_TOWN_NAME'];
            var village = datarow['RESIDENCE_VILLAGE_NAME'];
            var count_report = 0;
            var count_confirm = 0;
            var count_confirm_foreign = 0;

            var count = parseInt(datarow['COUNT']);
            // 通報
            // count_report += count
            // 確診
            if (!isNaN(parseInt(datarow['DETERMINED_STATUS'])) && parseInt(datarow['DETERMINED_STATUS']) == 5) {
                if (datarow['IMMIGRATION'] == '0') {
                    count_confirm += count;
                } else {
                    count_confirm_foreign += count;
                }
            }
            count_report += count;

            obj_result['全國']['通報病例'] += count_report;
            obj_result['全國']['確定病例(本土)'] += count_confirm;
            obj_result['全國']['確定病例(境外)'] += count_confirm_foreign;

            var countKey = '';
            switch (permission_level) {
                case 1:
                    if (!obj_result[city]) {
                        obj_result[city] = {
                            '行政區': city,
                            '通報病例': 0,
                            '確定病例(本土)': 0,
                            '確定病例(境外)': 0
                        }
                    }
                    obj_result[city]['通報病例'] += count_report;
                    obj_result[city]['確定病例(本土)'] += count_confirm;
                    obj_result[city]['確定病例(境外)'] += count_confirm_foreign;
                    break;
                case 2:
                    if (counties.indexOf(city) >= 0) {
                        obj_result['全區']['通報病例'] += count_report;
                        obj_result['全區']['確定病例(本土)'] += count_confirm;
                        obj_result['全區']['確定病例(境外)'] += count_confirm_foreign;
                        if (!obj_result[city]) {
                            obj_result[city] = {
                                '行政區': city,
                                '通報病例': 0,
                                '確定病例(本土)': 0,
                                '確定病例(境外)': 0
                            }
                        }
                        obj_result[city]['通報病例'] += count_report;
                        obj_result[city]['確定病例(本土)'] += count_confirm;
                        obj_result[city]['確定病例(境外)'] += count_confirm_foreign;
                    }
                    break;
                case 3:
                    if (city == counties[0]) {
                        if (!obj_result[dist]) {
                            obj_result[dist] = {
                                '行政區': dist,
                                '通報病例': 0,
                                '確定病例(本土)': 0,
                                '確定病例(境外)': 0
                            }
                        }
                        obj_result[dist]['通報病例'] += count_report;
                        obj_result[dist]['確定病例(本土)'] += count_confirm;
                        obj_result[dist]['確定病例(境外)'] += count_confirm_foreign;
                    }
                    break;
                case 4:
                    if (city == counties[0] && dist == dists[0]) {
                        if (!obj_result[village]) {
                            obj_result[village] = {
                                '行政區': village,
                                '通報病例': 0,
                                '確定病例(本土)': 0,
                                '確定病例(境外)': 0
                            }
                        }
                        obj_result[village]['通報病例'] += count_report
                        obj_result[village]['確定病例(本土)'] += count_confirm;
                        obj_result[village]['確定病例(境外)'] += count_confirm_foreign;
                    }
                    break;
                default:
                    break;
            }
        })

        var obj_array = []
        Object.keys(obj_result).forEach(function (key) {
            if (key != '全國' && key != '全區') {
                obj_array.push(obj_result[key]);
            }
        })
        obj_array.sort(function (a, b) {
            if ((b['確定病例(本土)'] == a['確定病例(本土)']) && (b['確定病例(境外)'] == a['確定病例(境外)'])) {
                return b['通報病例'] - a['通報病例'];
            } else if ((b['確定病例(本土)'] == a['確定病例(本土)'])) {
                return b['確定病例(境外)'] - a['確定病例(境外)'];
            } else {
                return b['確定病例(本土)'] - a['確定病例(本土)'];
            }
        })

        // 先放全國全區
        result.push(obj_result['全國']);
        if (permission_level == 2) {
            result.push(obj_result['全區']);
            for (var i = 0; i < obj_array.length; i++) {
                result.push(obj_array[i]);
            }
        } else {
            if (obj_array.length > 5) {
                obj_result['其他'] = {
                    '行政區': '其他',
                    '通報病例': 0,
                    '確定病例(本土)': 0,
                    '確定病例(境外)': 0
                }
                for (var i = 5; i < obj_array.length; i++) {
                    obj_result['其他']['通報病例'] += obj_array[i]['通報病例'];
                    obj_result['其他']['確定病例(本土)'] += obj_array[i]['確定病例(本土)'];
                    obj_result['其他']['確定病例(境外)'] += obj_array[i]['確定病例(境外)'];
                }
            }
            var max = 5
            if (obj_array.length < 5) {
                max = obj_array.length
            }
            for (var i = 0; i < max; i++) {
                result.push(obj_array[i])
            }
            if (obj_result['其他']) {
                result.push(obj_result['其他'])
            }
        }
        // console.log('result: ' + JSON.stringify(result))
        res.send(result)
    });
}

var mmr = function (req, res) {
    var year = new Date().getFullYear();
    if (req.query && req.query.year) {
        year = parseInt(req.query.year);
        if (isNaN(year)) {
            year = new Date().getFullYear();
        }
    }

    var client = new pg.Client(pgStringZone);
    client.connect();

    var sqlParameter = [];

    var counties = [];
    if (req.body && req.body.county) {
        counties = req.body.county.split(',');
    } else if (req.session && req.session.city) {
        counties = req.session.city.split(',');
    }
    var strSqlCounties = '';
    if (counties.length > 0) {
        counties.forEach(function (county) {
            if (strSqlCounties != '') {
                strSqlCounties += ',';
            }
            sqlParameter.push(county);
            strSqlCounties += '$' + sqlParameter.length;
        })
        strSqlCounties = ' AND "dws_report_measles_gis"."RESIDENCE_COUNTY_NAME" IN (' + strSqlCounties + ')';
    }
    var dists = [];
    if (req.body && req.body.dist) {
        dists = req.body.dist.split(',');
    } else if (req.session && req.session.dist) {
        dists = req.session.dist.split(',');
    }
    var strSqlDists = '';
    if (dists.length > 0) {
        dists.forEach(function (dist) {
            if (strSqlDists != '') {
                strSqlDists += ',';
            }
            sqlParameter.push(dist);
            strSqlDists += '$' + sqlParameter.length;
        })
        strSqlDists = ' AND "dws_report_measles_gis"."RESIDENCE_TOWN_NAME" IN (' + strSqlDists + ')';
    }

    var start_date = new Date(year - 9, 0, 1);
    sqlParameter.push(start_date);

    var strSql = 'SELECT DISTINCT date_part(\'year\',"dws_report_measles_gis"."SICK_DATE") AS sick_year,"dws_report_measles_niis"."Resultcode", COUNT(*) AS count' +
        ' FROM "dws_report_measles_gis"' +
        ' LEFT JOIN "dws_report_measles_niis"' +
        ' ON "dws_report_measles_gis"."REPORT" = "dws_report_measles_niis"."REPORT"' +
        ' WHERE "DETERMINED_STATUS" = 5' +
        strSqlCounties +
        strSqlDists +
        ' AND "dws_report_measles_gis"."SICK_DATE" >= $' + sqlParameter.length +
        ' GROUP BY sick_year, "dws_report_measles_niis"."Resultcode"' +
        ' ORDER BY sick_year, "dws_report_measles_niis"."Resultcode"';
    client.query(strSql, sqlParameter, function (err, row) {
        client.end();
        if (err) console.log('err: ' + err);
        var result = [];
        var resultObj = {};

        for (var x = year - 9; x <= year; x++) {
            var obj = {
                sick_year: x,
                '無接種': 0,
                '接種1劑': 0,
                '接種2劑': 0,
                '不明': 0
            }
            resultObj[x] = obj;
        }
        row.rows.forEach(function (row_data) {
            // 0不明 3無接踵
            switch (row_data.Resultcode) {
                case 3:
                    resultObj[row_data.sick_year]['無接種'] += row_data.count;
                    break;
                case 1:
                    resultObj[row_data.sick_year]['接種1劑'] += row_data.count;
                    break;
                case 2:
                    resultObj[row_data.sick_year]['接種2劑'] += row_data.count;
                    break;
                case 0:
                    resultObj[row_data.sick_year]['不明'] += row_data.count;
                    break;
                // default:
                //     resultObj[row_data.sick_year]['不明'] += row_data.count;
                //     break;
            }
        })
        Object.keys(resultObj).sort().forEach(function (key) {
            result.push(resultObj[key]);
        })
        res.send(result);
    })
}

var cluster = function (req, res) {
    var year = new Date().getFullYear()
    if (req.query && req.query.year) {
        var year_temp = parseInt(req.query.year)
        if (!isNaN(year_temp)) {
            year = year_temp
        }
    }
    var date_start = new Date(year, 1, 1);
    var date_end = new Date(year, 12, 31 + 1);

    var clientZone = new pg.Client(pgStringZone);
    var strSqlZone =
        'SELECT "measles_cluster_info".*,"case_report" FROM "measles_cluster_info"' +
        ' RIGHT JOIN "measles_cluster_relation" ON "measles_cluster_relation"."info_id" = "measles_cluster_info"."id"';

    var sqlParameterZone = [];
    sqlParameterZone.push(date_start);
    strSqlZone += ' WHERE "sickdate_first" >= $' + sqlParameterZone.length;
    sqlParameterZone.push(date_end);
    strSqlZone += ' AND "sickdate_first" < $' + sqlParameterZone.length;

    var counties = [];
    if (req.body && req.body.county) {
        counties = req.body.county.split(',');
    } else if (req.session && req.session.city) {
        counties = req.session.city.split(',');
    }
    var strSqlCounties = '';
    if (counties.length > 0) {
        counties.forEach(function (county) {
            if (strSqlCounties != '') {
                strSqlCounties += ',';
            }
            sqlParameterZone.push(county);
            strSqlCounties += '$' + sqlParameterZone.length;
        })
        strSqlCounties = ' AND "measles_cluster_info"."residence_city" IN (' + strSqlCounties + ')';
    }
    strSqlZone += strSqlCounties;
    var dists = [];
    if (req.body && req.body.dist) {
        dists = req.body.dist.split(',');
    } else if (req.session && req.session.dist) {
        dists = req.session.dist.split(',');
    }
    var strSqlDists = '';
    if (dists.length > 0) {
        dists.forEach(function (dist) {
            if (strSqlDists != '') {
                strSqlDists += ',';
            }
            sqlParameterZone.push(dist);
            strSqlDists += '$' + sqlParameterZone.length;
        })
        strSqlDists = ' AND "measles_cluster_info"."residence_dist" IN (' + strSqlDists + ')';
    }
    strSqlZone += strSqlDists;
    strSqlZone += ' ORDER BY "report_first" DESC;'

    clientZone.connect();
    clientZone.query(strSqlZone, sqlParameterZone, function (errZone, rowZone) {
        var result = {};
        var resultObj = {};
        var reportClusterMapping = {};
        clientZone.end();
        if (errZone) {
            console.log('errZone cluster: ' + errZone)
            result.error = errZone;
            result.errorMessage = '搜尋群聚個案錯誤';
            res.send(result);
        } else {
            if (rowZone.rows && rowZone.rows.length > 0) {
                var caseReportArray = [];
                rowZone.rows.forEach(function (objZone) {
                    var obj_report_first = objZone['report_first'];
                    var obj_case_report = objZone['case_report'];
                    if (obj_report_first && !resultObj[obj_report_first]) {
                        resultObj[obj_report_first] = {
                            case_name: '',
                            case_count: 0,
                            contact_watch: 0,
                            contact_watch_situation: 0,
                            last_watch: null,
                            case_report: []
                        }
                        if (objZone['case_name'] && objZone['case_name'].length > 0 && objZone['case_name'] != 'null') {
                            resultObj[obj_report_first].case_name = objZone['case_name'];
                        } else if (objZone['epidemic_no'] && objZone['epidemic_no'].length > 0 && objZone['epidemic_no'] != 'null') {
                            resultObj[obj_report_first].case_name = '流行案例編號：' + objZone['epidemic_no'];
                        } else {
                            resultObj[obj_report_first].case_name = '無';
                        }
                    }
                    resultObj[obj_report_first].case_count++;
                    if (obj_case_report && caseReportArray.indexOf(obj_case_report) < 0) {
                        caseReportArray.push(obj_case_report);
                    }
                    if (obj_case_report) {
                        var case_report = obj_case_report;
                        resultObj[obj_report_first].case_report.push(case_report);
                        caseReportArray.push(case_report);
                        reportClusterMapping[obj_case_report] = obj_report_first;
                    }
                });
                var clientTrace = new pg.Client(pgStringTrace);

                var strSqlTrace =
                    'SELECT "REPORT_ID","SYMPTOM","CONTACT_DATE","TRACE_DATE" FROM "CONTACT_PERSON"' +
                    ' LEFT JOIN' +
                    ' (select "contact_person_id","SYMPTOM","TRACE_DATE" from "HEALTH_TRACE_RECORD" compA where "CREATE_DATE" =' +
                    ' (select MAX(compB."CREATE_DATE")' +
                    ' from "HEALTH_TRACE_RECORD" compB where compA."contact_person_id" = compB."contact_person_id")' +
                    ' ORDER BY "contact_person_id") AS SYMP' +
                    ' ON SYMP."contact_person_id" = "CONTACT_PERSON"."contact_person_id"' +
                    ' LEFT JOIN "contact_person_gis" ON "contact_person_gis"."contact_person_id" = "CONTACT_PERSON"."contact_person_id"' +
                    ' WHERE "REPORT_ID" IN(';
                var strSqlTraceIn = '';
                var sqlParmeterTrace = caseReportArray;
                for (var x = 0; x < caseReportArray.length; x++) {
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
                        if (rowTrace.rows && rowTrace.rows.length > 0) {
                            rowTrace.rows.forEach(function (rowData) {
                                var report_id = rowData['REPORT_ID'];
                                var report_first = reportClusterMapping[report_id];
                                var contact_date = rowData['CONTACT_DATE'] ? new Date(rowData['CONTACT_DATE']) : null;
                                var trace_date = rowData['TRACE_DATE'] ? new Date(rowData['TRACE_DATE']) : null;
                                if (contact_date) {
                                    var now_date = new Date();
                                    var days = (now_date.getTime() - contact_date.getTime()) / (1000 * 60 * 60 * 24);
                                    if (days < 18) {
                                        resultObj[report_first].contact_watch++;
                                        if (rowData['SYMPTOM']) {
                                            resultObj[report_first].contact_watch_situation++;
                                        }
                                    }
                                }
                                if (trace_date) {
                                    if (!resultObj[report_first].last_watch || trace_date.getTime() > resultObj[report_first].last_watch.getTime()) {
                                        resultObj[report_first].last_watch = trace_date;
                                    }
                                }

                            });
                        }
                    }
                    result.data = [];
                    Object.keys(resultObj).forEach(function (report) {
                        result.data.push({
                            '群聚事件名稱': resultObj[report].case_name,
                            '個案總數': resultObj[report].case_count,
                            '目前監測人數': resultObj[report].contact_watch,
                            '有症狀人數': resultObj[report].contact_watch_situation,
                            '最後監測日期': resultObj[report].last_watch
                        });
                    });
                    // result_temp.sort(function (a, b) {
                    //     return a.id - b.id
                    // })
                    res.send(result);
                });
            } else {
                res.send(result);
            }
        }
        clientZone.end();

    });
}

var age = function (req, res) {
    var year = new Date().getFullYear()
    if (req.query && req.query.year) {
        year = parseInt(req.query.year);
        if (isNaN(year)) {
            year = new Date().getFullYear();
        }
    }

    var client = new pg.Client(pgStringZone);
    client.connect();

    var sqlParameter = [];

    var counties = [];
    if (req.body && req.body.county) {
        counties = req.body.county.split(',');
    } else if (req.session && req.session.city) {
        counties = req.session.city.split(',');
    }
    var strSqlCounties = '';
    if (counties.length > 0) {
        counties.forEach(function (county) {
            if (strSqlCounties != '') {
                strSqlCounties += ',';
            }
            sqlParameter.push(county);
            strSqlCounties += '$' + sqlParameter.length;
        })
        strSqlCounties = ' AND "RESIDENCE_COUNTY_NAME" IN (' + strSqlCounties + ')';
    }
    var dists = [];
    if (req.body && req.body.dist) {
        dists = req.body.dist.split(',');
    } else if (req.session && req.session.dist) {
        dists = req.session.dist.split(',');
    }
    var strSqlDists = '';
    if (dists.length > 0) {
        dists.forEach(function (dist) {
            if (strSqlDists != '') {
                strSqlDists += ',';
            }
            sqlParameter.push(dist);
            strSqlDists += '$' + sqlParameter.length;
        })
        strSqlDists = ' AND "RESIDENCE_TOWN_NAME" IN (' + strSqlDists + ')';
    }

    var start_date = new Date(year - 9, 0, 1);
    sqlParameter.push(start_date);

    var strSql = 'SELECT DISTINCT date_part(\'year\', "SICK_DATE") AS sick_year, "SICK_AGE" AS age, COUNT(*) AS count' +
        ' FROM dws_report_measles_gis' +
        ' WHERE "DETERMINED_STATUS" = 5' +
        strSqlCounties +
        strSqlDists +
        ' AND "dws_report_measles_gis"."SICK_DATE" >= $' + sqlParameter.length +
        ' GROUP BY sick_year, age' +
        ' ORDER BY sick_year, age';

    client.query(strSql, sqlParameter, function (err, row) {
        client.end();
        if (err) console.log('err: ' + err);
        var result = [];
        var resultObj = {};

        for (var x = year - 9; x <= year; x++) {
            var obj = {
                sick_year: x,
                '<1歲': 0,
                '1-19歲': 0,
                '20-39歲': 0,
                '≧40歲': 0
            }
            resultObj[x] = obj;
        }

        row.rows.forEach(function (row_data) {
            if (!isNaN(parseInt(row_data.age))) {
                if (row_data.age < 1) {
                    resultObj[row_data.sick_year]['<1歲'] += parseInt(row_data.count);
                } else if (row_data.age < 20) {
                    resultObj[row_data.sick_year]['1-19歲'] += parseInt(row_data.count);
                } else if (row_data.age < 40) {
                    resultObj[row_data.sick_year]['20-39歲'] += parseInt(row_data.count);
                } else {
                    resultObj[row_data.sick_year]['≧40歲'] += parseInt(row_data.count);
                }
            }
            Object.keys(resultObj).sort().forEach(function (year) {
                result.push(resultObj[year]);
            });
        })
        res.send(result);
    })
}

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
    compare,
    counting,
    mmr,
    cluster,
    age
};