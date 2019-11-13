var pg = require('pg');
var config = require('../../../../config');
var connectionString = config.postgres;
var pgString = connectionString + config.db.cdczonegis;

// 摘要: 歷年同期確定病例數比較 (本土/境外移入)
var compare = function (req, res) {
    var year = new Date().getFullYear()
    if (req.query && req.query.year) {
        year = parseInt(req.query.year)
        if (isNaN(year)) {
            year = new Date().getFullYear()
        }
    }

    var client = new pg.Client(pgString);
    client.connect();

    var counties = []
    if (req.body && req.body.county) {
        counties = req.body.county.split(',')
    }
    var strSqlCounties = ''
    var sqlParameterCounties = []
    if (counties.length > 0) {
        strSqlCounties += ' AND "RESIDENCE_COUNTY_NAME" IN ('
        var count = 1
        counties.forEach(function (county) {
            if (count > 1) {
                strSqlCounties += ','
            }
            strSqlCounties += '$' + count
            sqlParameterCounties.push(county)
            count++
        })
        strSqlCounties += ')'
    }
    var dists = []
    if (req.body && req.body.dist) {
        dists = req.body.dist.split(',')
    }
    var sqlParameterDists = []
    if (dists.length > 0) {
        strSqlCounties += ' AND "RESIDENCE_TOWN_NAME" IN ('
        var count = 1 + sqlParameterCounties.length
        strSqlCounties += '$' + count
        sqlParameterDists.push(req.body.dist)
        strSqlCounties += ')'
    }

    var strSql = 'SELECT DISTINCT date_part(\'year\', "SICK_DATE") AS sick_year, "IMMIGRATION" AS is_out_region, COUNT(*) AS count' +
        ' FROM dws_report_dengue_gis' +
        ' WHERE "DETERMINED_STATUS" = 5' +
        strSqlCounties +
        ' GROUP BY sick_year, is_out_region' +
        ' ORDER BY sick_year, is_out_region'
    var sqlParmeter = [];
    if (sqlParameterCounties.length > 0) {
        sqlParmeter = sqlParameterCounties
    }
    if (sqlParameterDists.length > 0) {
        sqlParameterDists.forEach(function (dist) {
            sqlParmeter.push(dist)
        })
    }
    client.query(strSql, sqlParmeter, function (err, row) {
        client.end();
        if (err) console.log('err: ' + err)
        var result = []
        row.rows.forEach(function (row_data) {
            var isInResult = false
            result.forEach(function (result_data) {
                if (result_data.sick_year == row_data.sick_year) {
                    isInResult = true
                    if (row_data.is_out_region == '0') {
                        result_data['本土病例'] = parseInt(row_data.count)
                    } else {
                        result_data['境外移入病例'] = parseInt(row_data.count)
                    }
                }
            })
            if (!isInResult) {
                var obj = {
                    sick_year: row_data.sick_year,
                    '本土病例': 0,
                    '境外移入病例': 0
                }

                if (row_data.is_out_region == '0') {
                    obj['本土病例'] = parseInt(row_data.count)
                } else {
                    obj['境外移入病例'] = parseInt(row_data.count)
                }
                result.push(obj)
            }
        })
        res.send(result);
    })
}

// // 摘要: 入夏後本土病例統計 (xxxx年5月迄今) // 先排確診再排通報
var summer = function (req, res) {
    var year = new Date().getFullYear()
    if (new Date().getMonth() < 4) {
        year = year - 1;
    }
    if (req.query && req.query.year) {
        var year_temp = parseInt(req.query.year)
        if (!isNaN(year_temp)) {
            year = year_temp
        }
    }
    var date_start = new Date(year, 4, 1)
    var date_end = new Date(year + 1, 4, 1)

    var client = new pg.Client(pgString);
    client.connect();

    var strSql = 'SELECT DISTINCT "RESIDENCE_COUNTY_NAME","RESIDENCE_TOWN_NAME","RESIDENCE_VILLAGE_NAME",' +
        ' "DETERMINED_STATUS",' +
        ' "DISEASE",' +
        ' "HAS_SC",' +
        ' "DEATH_CNT",' +
        ' COUNT(*) AS "COUNT"' +
        ' FROM "dws_report_dengue_gis"' +
        ' WHERE "DISEASE" IN (\'061\', \'0654\')' +
        ' AND "IMMIGRATION" = 0'
    // GROUP BY "RESIDENCE_COUNTY_NAME","RESIDENCE_TOWN_NAME","RESIDENCE_VILLAGE_NAME","DETERMINED_STATUS","DISEASE","DEATH_CNT",report_supplement_syndrome."dengue_q40"
    // ORDER BY "RESIDENCE_COUNTY_NAME","RESIDENCE_TOWN_NAME","RESIDENCE_VILLAGE_NAME","DETERMINED_STATUS","DISEASE","DEATH_CNT",report_supplement_syndrome."dengue_q40"
    var sqlParmeter = [];
    sqlParmeter.push(date_start);
    strSql += ' AND "SICK_DATE" >= $' + sqlParmeter.length;
    sqlParmeter.push(date_end);
    strSql += ' AND "SICK_DATE" < $' + sqlParmeter.length;
    strSql += ' GROUP BY "RESIDENCE_COUNTY_NAME","RESIDENCE_TOWN_NAME","RESIDENCE_VILLAGE_NAME","DETERMINED_STATUS","DISEASE","DEATH_CNT","HAS_SC"'
    strSql += ' ORDER BY "RESIDENCE_COUNTY_NAME","RESIDENCE_TOWN_NAME","RESIDENCE_VILLAGE_NAME","DETERMINED_STATUS","DISEASE","DEATH_CNT","HAS_SC"'

    client.query(strSql, sqlParmeter, function (err, row) {
        console.log('err: ' + err)
        client.end();

        var counties = []
        if (req.body && req.body.county) {
            counties = req.body.county.split(',')
        }
        var dists = []
        if (req.body && req.body.dist) {
            dists = req.body.dist.split(',')
        }
        var villages = []
        var permission_level = 0
        if (req.body && req.body.permission_level) {
            permission_level = parseInt(req.body.permission_level)
            if (isNaN(permission_level)) {
                permission_level = 0
            }
        }
        var result = []
        var obj_result = {
            '全國': {
                '行政區': '全國',
                '通報病例': 0,
                '確定病例': 0,
                '重症病例': 0,
                '死亡病例': 0
            }
        }
        if (permission_level == 2) {
            obj_result['全區'] = {
                '行政區': '全區',
                '通報病例': 0,
                '確定病例': 0,
                '重症病例': 0,
                '死亡病例': 0
            }
        }
        row.rows.forEach(function (datarow) {
            var city = datarow['RESIDENCE_COUNTY_NAME']
            var dist = datarow['RESIDENCE_TOWN_NAME']
            var village = datarow['RESIDENCE_VILLAGE_NAME']
            var count_report = 0
            var count_confirm = 0
            var count_illness = 0
            var count_death = 0

            var count = parseInt(datarow['COUNT'])
            // 通報
            // count_report += count
            // 確診
            if (!isNaN(parseInt(datarow['DETERMINED_STATUS'])) && parseInt(datarow['DETERMINED_STATUS']) == 5) {
                count_confirm += count
                count_report += count
            } else {
                count_report += count
            }
            // 重症
            if (!isNaN(parseInt(datarow['DETERMINED_STATUS'])) && parseInt(datarow['DETERMINED_STATUS']) == 5 && datarow['HAS_SC'] == '有') {
                count_illness += count
            }
            // 死亡
            if (!isNaN(parseInt(datarow['DETERMINED_STATUS'])) && parseInt(datarow['DETERMINED_STATUS']) == 5 && datarow['DEATH_CNT'] == 1) {
                count_death += count
            }

            obj_result['全國']['通報病例'] += count_report
            obj_result['全國']['確定病例'] += count_confirm
            obj_result['全國']['重症病例'] += count_illness
            obj_result['全國']['死亡病例'] += count_death

            var countKey = ''
            switch (permission_level) {
                case 1:
                    if (!obj_result[city]) {
                        obj_result[city] = {
                            '行政區': city,
                            '通報病例': 0,
                            '確定病例': 0,
                            '重症病例': 0,
                            '死亡病例': 0
                        }
                    }
                    obj_result[city]['通報病例'] += count_report
                    obj_result[city]['確定病例'] += count_confirm
                    obj_result[city]['重症病例'] += count_illness
                    obj_result[city]['死亡病例'] += count_death
                    break;
                case 2:
                    if (counties.indexOf(city) >= 0) {
                        obj_result['全區']['通報病例'] += count_report
                        obj_result['全區']['確定病例'] += count_confirm
                        obj_result['全區']['重症病例'] += count_illness
                        obj_result['全區']['死亡病例'] += count_death
                        if (!obj_result[city]) {
                            obj_result[city] = {
                                '行政區': city,
                                '通報病例': 0,
                                '確定病例': 0,
                                '重症病例': 0,
                                '死亡病例': 0
                            }
                        }
                        obj_result[city]['通報病例'] += count_report
                        obj_result[city]['確定病例'] += count_confirm
                        obj_result[city]['重症病例'] += count_illness
                        obj_result[city]['死亡病例'] += count_death
                    }
                    break;
                case 3:
                    if (city == counties[0]) {
                        if (!obj_result[dist]) {
                            obj_result[dist] = {
                                '行政區': dist,
                                '通報病例': 0,
                                '確定病例': 0,
                                '重症病例': 0,
                                '死亡病例': 0
                            }
                        }
                        obj_result[dist]['通報病例'] += count_report
                        obj_result[dist]['確定病例'] += count_confirm
                        obj_result[dist]['重症病例'] += count_illness
                        obj_result[dist]['死亡病例'] += count_death
                    }
                    break;
                case 4:
                    if (city == counties[0] && dist == dists[0]) {
                        if (!obj_result[village]) {
                            obj_result[village] = {
                                '行政區': village,
                                '通報病例': 0,
                                '確定病例': 0,
                                '重症病例': 0,
                                '死亡病例': 0
                            }
                        }
                        obj_result[village]['通報病例'] += count_report
                        obj_result[village]['確定病例'] += count_confirm
                        obj_result[village]['重症病例'] += count_illness
                        obj_result[village]['死亡病例'] += count_death
                    }
                    break;
                default:
                    break;
            }
        })

        var obj_array = []
        Object.keys(obj_result).forEach(function (key) {
            if (key != '全國' && key != '全區') {
                obj_array.push(obj_result[key])
            }
        })
        obj_array.sort(function (a, b) {
            if (b['確定病例'] == a['確定病例']) {
                return b['通報病例'] - a['通報病例']
            } else {
                return b['確定病例'] - a['確定病例']
            }
        })

        // 先放全國全區
        result.push(obj_result['全國'])
        if (permission_level == 2) {
            result.push(obj_result['全區'])
            for (var i = 0; i < obj_array.length; i++) {
                result.push(obj_array[i])
            }
        } else {
            if (obj_array.length > 5) {
                obj_result['其他'] = {
                    '行政區': '其他',
                    '通報病例': 0,
                    '確定病例': 0,
                    '重症病例': 0,
                    '死亡病例': 0
                }
                for (var i = 5; i < obj_array.length; i++) {
                    obj_result['其他']['通報病例'] += obj_array[i]['通報病例']
                    obj_result['其他']['確定病例'] += obj_array[i]['確定病例']
                    obj_result['其他']['重症病例'] += obj_array[i]['重症病例']
                    obj_result['其他']['死亡病例'] += obj_array[i]['死亡病例']
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
// 摘要：歷年確定病例趨勢比較
var trend = function (req, res) {
    var year_last = new Date().getFullYear()
    if (req.query && req.query.year) {
        year_last = parseInt(req.query.year)
        if (isNaN(year_last)) {
            year_last = new Date().getFullYear()
        }
    }
    var years = []
    for (var y = 0; y < 4; y++) {
        years.push(year_last - y)
    }

    var counties = []
    if (req.body && req.body.county) {
        counties = req.body.county.split(',')
    }
    var strSqlCounties = ''
    var sqlParameterCounties = []
    if (counties.length > 0) {
        strSqlCounties += ' AND "RESIDENCE_COUNTY_NAME" IN ('
        var count = 3
        counties.forEach(function (county) {
            if (count > 3) {
                strSqlCounties += ','
            }
            strSqlCounties += '$' + count
            sqlParameterCounties.push(county)
            count++
        })
        strSqlCounties += ')'
    }
    var dists = []
    if (req.body && req.body.dist) {
        dists = req.body.dist.split(',')
    }
    var sqlParameterDists = []
    if (dists.length > 0) {
        strSqlCounties += ' AND "RESIDENCE_TOWN_NAME" IN ('
        var count = 3 + sqlParameterCounties.length
        strSqlCounties += '$' + count
        sqlParameterDists.push(req.body.dist)
        strSqlCounties += ')'
    }

    var client = new pg.Client(pgString);
    client.connect();
    var strSql = 'SELECT "SICK_DATE" FROM "dws_report_dengue_gis" WHERE "DETERMINED_STATUS" = 5'
    strSql += ' AND "SICK_DATE" >= $1'
    strSql += ' AND "SICK_DATE" < $2'
    strSql += strSqlCounties
    var date_start = new Date(year_last - 3, 0, 1)
    var date_end = new Date(year_last + 1, 0, 1)
    sqlParmeter = [date_start, date_end]
    if (sqlParameterCounties.length > 0) {
        sqlParameterCounties.forEach(function (county) {
            sqlParmeter.push(county)
        })
    }
    if (sqlParameterDists.length > 0) {
        sqlParameterDists.forEach(function (dist) {
            sqlParmeter.push(dist)
        })
    }
    client.query(strSql, sqlParmeter, function (err, row) {
        client.end();
        var result = [];
        var week_count = {}
        for (var w = 1; w <= 53; w++) {
            week_count[w] = {}
            years.forEach(function (year) {
                week_count[w][year] = 0
            })
        }
        var week_count_head52 = {}
        week_count_head52[52] = {}
        years.forEach(function (year) {
            week_count_head52[52][year] = 0
        })
        week_count_head52[53] = {}
        years.forEach(function (year) {
            week_count_head52[53][year] = 0
        })

        row.rows.forEach(function (datarow) {
            var date = new Date(datarow['SICK_DATE'])
            if (!isNaN(date.getTime())) {
                if (date.getMonth() == 0 && date.getWeek() > 50) {
                    week_count_head52[date.getWeek()][date.getFullYear()] = week_count_head52[date.getWeek()][date.getFullYear()] + 1
                } else {
                    week_count[date.getWeek()][date.getFullYear()] = week_count[date.getWeek()][date.getFullYear()] + 1
                }
            }
        })

        var result = []
        var is52 = false
        years.forEach(function (year) {
            if (week_count_head52[52][year] > 0) {
                is52 = true
            }
        })
        var is53 = false
        years.forEach(function (year) {
            if (week_count_head52[53][year] > 0) {
                is53 = true
            }
        })
        if (is52) {
            var obj = {}
            obj.Week = -1
            years.forEach(function (year) {
                obj[year] = week_count_head52[52][year]
            })
            result.push(obj)
        }
        if (is52 || is53) {
            var obj = {}
            obj.Week = 0
            years.forEach(function (year) {
                obj[year] = week_count_head52[53][year]
            })
            result.push(obj)
        }

        for (var w = 1; w <= 53; w++) {
            var obj = {}
            obj.Week = w
            years.forEach(function (year) {
                obj[year] = week_count[w][year]
            })
            result.push(obj)
        }
        res.send(result)
    })
}
// 摘要：登革熱通報個案隱藏期趨勢
var hidden = function (req, res) {
    var year = new Date().getFullYear()
    if (req.query && req.query.year) {
        year = parseInt(req.query.year)
        if (isNaN(year)) {
            year = new Date().getFullYear()
        }
    }

    var counties = []
    if (req.body && req.body.county) {
        counties = req.body.county.split(',')
    }
    var strSqlCounties = ''
    var sqlParameterCounties = []
    if (counties.length > 0) {
        strSqlCounties += ' AND "RESIDENCE_COUNTY_NAME" IN ('
        var count = 3
        counties.forEach(function (county) {
            if (count > 3) {
                strSqlCounties += ','
            }
            strSqlCounties += '$' + count
            sqlParameterCounties.push(county)
            count++
        })
        strSqlCounties += ')'
    }
    var dists = []
    if (req.body && req.body.dist) {
        dists = req.body.dist.split(',')
    }
    var sqlParameterDists = []
    if (dists.length > 0) {
        strSqlCounties += ' AND "RESIDENCE_TOWN_NAME" IN ('
        var count = 3 + sqlParameterCounties.length
        strSqlCounties += '$' + count
        sqlParameterDists.push(req.body.dist)
        strSqlCounties += ')'
    }

    var client = new pg.Client(pgString);
    client.connect();
    var strSql = 'SELECT "RESIDENCE_COUNTY_NAME", "RESIDENCE_TOWN_NAME", "SICK_DATE", "REPORT_DATE" FROM "dws_report_dengue_gis"'
    strSql += ' WHERE "SICK_DATE" >= $1'
    strSql += ' AND "SICK_DATE" < $2'
    strSql += strSqlCounties
    var date_start = new Date(year, 0, 1)
    var date_end = new Date(year + 1, 0, 1)
    sqlParmeter = [date_start, date_end]
    if (sqlParameterCounties.length > 0) {
        sqlParameterCounties.forEach(function (county) {
            sqlParmeter.push(county)
        })
    }
    if (sqlParameterDists.length > 0) {
        sqlParameterDists.forEach(function (dist) {
            sqlParmeter.push(dist)
        })
    }
    client.query(strSql, sqlParmeter, function (err, row) {
        client.end();

        var areas = ['全國', '南高屏']
        var permission_level = 0
        if (req.body && req.body.permission_level) {
            permission_level = parseInt(req.body.permission_level)
            if (isNaN(permission_level)) {
                permission_level = 0
            }
        }
        switch (permission_level) {
            case 1:
                break;
            case 2:
                areas = ['統計值']
                break;
            case 3:
                areas = ['統計值']
                break;
            case 4:
                areas = ['統計值']
                break;
            default:
                break;
        }

        var week_count = {}
        for (var w = 1; w <= 53; w++) {
            week_count[w] = {}
            areas.forEach(function (area) {
                week_count[w][area] = {
                    'count': 0,
                    'report_days': 0
                }
            })
        }
        var week_count_head52 = {}
        week_count_head52[52] = {}
        week_count_head52[53] = {}
        areas.forEach(function (area) {
            week_count_head52[52][area] = {
                'count': 0,
                'report_days': 0
            }
            week_count_head52[53][area] = {
                'count': 0,
                'report_days': 0
            }
        })


        row.rows.forEach(function (datarow) {
            var date_sick = new Date(datarow['SICK_DATE'])
            date_sick = new Date(date_sick.getFullYear(), date_sick.getMonth(), date_sick.getDate())
            var date_report = new Date(datarow['REPORT_DATE'])
            date_report = new Date(date_report.getFullYear(), date_report.getMonth(), date_report.getDate())
            var county = datarow['RESIDENCE_COUNTY_NAME']

            areas.forEach(function (area) {
                isCount = false
                if (area == '全國') {
                    isCount = true
                } else if (area == '南高屏') {
                    if (county == '臺南市' || county == '臺南縣' || county == '台南市' || county == '台南縣' ||
                        county == '高雄市' || county == '屏東縣' || county == '屏東市') {
                        isCount = true
                    }
                } else {
                    isCount = true
                }

                if (isCount) {
                    if (!isNaN(date_sick.getTime()) && !isNaN(date_report.getTime())) {
                        var days = (date_report.getTime() - date_sick.getTime()) / (1000 * 60 * 60 * 24)
                        if (date_sick.getMonth() == 0 && date_sick.getWeek() > 50) {
                            week_count_head52[date_sick.getWeek()][area]['count'] += 1
                            week_count_head52[date_sick.getWeek()][area]['report_days'] += days
                        } else {
                            week_count[date_sick.getWeek()][area]['count'] += 1
                            week_count[date_sick.getWeek()][area]['report_days'] += days
                        }
                    }
                }
            })
        })


        // var average_report_days = 0
        // var average_count = 0

        // areas.forEach(function(area) {
        //     average_count += week_count_head52[52][area].count
        //     average_report_days += week_count_head52[52][area].report_days
        //     average_count += week_count_head52[53][area].count
        //     average_report_days += week_count_head52[53][area].report_days

        //     for (var w = 1; w <= 53; w++) {
        //         average_count += week_count[w][area].count
        //         average_report_days += week_count[w][area].report_days
        //     }
        // })

        var result = []
        // var average = (average_count == 0) ? 0 : (average_report_days / average_count)
        is52 = false
        is53 = false
        areas.forEach(function (area) {
            if (week_count_head52[52][area].count > 0) {
                is52 = true
            }
            if (week_count_head52[53][area].count > 0) {
                is53 = true
            }
        })

        if (is52) {
            var obj = {}
            obj.Week = -1
            obj['參考值'] = 3
            areas.forEach(function (area) {
                obj[area] =
                    week_count_head52[52][area].count > 0 ?
                    (week_count_head52[52][area].report_days / week_count_head52[52][area].count) :
                    0
            })
            result.push(obj)
        }
        if (is52 || is53) {
            var obj = {}
            obj.Week = 0
            obj['參考值'] = 3
            areas.forEach(function (area) {
                obj[area] =
                    week_count_head52[53][area].count > 0 ?
                    (week_count_head52[53][area].report_days / week_count_head52[53][area].count) :
                    0
            })
            result.push(obj)
        }

        for (var w = 1; w <= 53; w++) {
            var obj = {}
            obj.Week = w
            obj['參考值'] = 3
            areas.forEach(function (area) {
                obj[area] =
                    week_count[w][area].count > 0 ?
                    (week_count[w][area].report_days / week_count[w][area].count) :
                    0
            })
            result.push(obj)
        }
        res.send(result)
    })
}
// 摘要：近26週確定病例研判趨勢
var determine = function (req, res) {
    var year = new Date().getFullYear()
    if (req.query && req.query.year) {
        year = parseInt(req.query.year)
        if (isNaN(year)) {
            year = new Date().getFullYear()
        }
    }

    var date_end = new Date();
    // var date_end = new Date('2015-12-31')
    date_end = new Date(date_end.getFullYear(), date_end.getMonth(), date_end.getDate() + 1)
    var date_start = new Date(date_end.getFullYear(), date_end.getMonth(), date_end.getDate() - 26 * 7 + 1)

    var counties = []
    if (req.body && req.body.county) {
        counties = req.body.county.split(',')
    }
    var strSqlCounties = ''
    var sqlParameterCounties = []
    if (counties.length > 0) {
        strSqlCounties += ' AND "RESIDENCE_COUNTY_NAME" IN ('
        var count = 3
        counties.forEach(function (county) {
            if (count > 3) {
                strSqlCounties += ','
            }
            strSqlCounties += '$' + count
            sqlParameterCounties.push(county)
            count++
        })
        strSqlCounties += ')'
    }
    var dists = []
    if (req.body && req.body.dist) {
        dists = req.body.dist.split(',')
    }
    var sqlParameterDists = []
    if (dists.length > 0) {
        strSqlCounties += ' AND "RESIDENCE_TOWN_NAME" IN ('
        var count = 3 + sqlParameterCounties.length
        strSqlCounties += '$' + count
        sqlParameterDists.push(req.body.dist)
        strSqlCounties += ')'
    }
    var permission_level = 0
    if (req.body && req.body.permission_level) {
        permission_level = parseInt(req.body.permission_level)
        if (isNaN(permission_level)) {
            permission_level = 0
        }
    }
    var keyName = 'RESIDENCE_COUNTY_NAME'
    if (permission_level == 3) {
        keyName = 'RESIDENCE_TOWN_NAME'
    }
    if (permission_level == 4) {
        keyName = 'RESIDENCE_VILLAGE_NAME'
    }

    var strSql = 'SELECT DISTINCT "SICK_DATE", "' + keyName + '",' +
        ' COUNT(*) AS "COUNT" FROM "dws_report_dengue_gis" WHERE "DETERMINED_STATUS" = 5'
    var client = new pg.Client(pgString);
    client.connect();

    var sqlParmeter = [];
    sqlParmeter.push(date_start);
    strSql += ' AND "SICK_DATE" >= $' + sqlParmeter.length;
    sqlParmeter.push(date_end);
    strSql += ' AND "SICK_DATE" < $' + sqlParmeter.length;
    strSql += strSqlCounties
    if (sqlParameterCounties.length > 0) {
        sqlParameterCounties.forEach(function (county) {
            sqlParmeter.push(county)
        })
    }
    if (sqlParameterDists.length > 0) {
        sqlParameterDists.forEach(function (dist) {
            sqlParmeter.push(dist)
        })
    }
    strSql += ' GROUP BY "SICK_DATE", "' + keyName + '"'
    strSql += ' ORDER BY "SICK_DATE", "' + keyName + '"'
    console.log('strSql: ' + strSql)
    console.log('sqlParmeter: ' + sqlParmeter.length)
    client.query(strSql, sqlParmeter, function (err, row) {
        client.end();

        if (err) console.log('err: ' + err)
        var result = []
        if (row.rows.length == 0) {
            res.send(result)
            return
        }

        var week_count = {}
        var week_id = 0

        var d_s = date_start
        var d_e = date_end

        // var cities = ['台北市', '新北市', '基隆市', '宜蘭縣', '宜蘭市', '金門縣',
        //     '連江縣', '桃園市', '新竹縣', '新竹市', '苗栗縣',
        //     '台中市', '彰化縣', '南投縣', '雲林縣', '嘉義縣',
        //     '嘉義市', '台南市', '高雄市', '屏東縣', '屏東市', '澎湖縣',
        //     '花蓮縣', '台東縣'
        // ]
        var keyItems = ['台北市', '新北市', '基隆市', '宜蘭縣', '金門縣',
            '連江縣', '桃園市', '新竹縣', '新竹市', '苗栗縣',
            '台中市', '彰化縣', '南投縣', '雲林縣', '嘉義縣',
            '嘉義市', '台南市', '高雄市', '屏東縣', '澎湖縣',
            '花蓮縣', '台東縣'
        ]

        if (permission_level == 2) {
            keyItems = counties
        }
        var count_day = (d_e.getTime() - d_s.getTime()) / (1000 * 60 * 60 * 24)

        if (permission_level == 3 || permission_level == 4) {
            var keyArray = []
            row.rows.forEach(function (datarow) {
                var keyItem = datarow[keyName]
                if (keyArray.indexOf(keyItem) < 0) {
                    keyArray.push(keyItem)
                }
            })
            keyItems = keyArray
        }

        keyItems.forEach(function (item) {
            if (!week_count[item]) {
                week_count[item] = {}
            }
            for (var x = 0; x <= count_day; x++) {
                var date = new Date(d_s.getFullYear(), d_s.getMonth(), d_s.getDate() + x)
                var year = date.getFullYear()
                var month = date.getMonth()
                var week = date.getWeek()

                if (!week_count[item][year]) {
                    week_count[item][year] = {}
                }
                if (!week_count[item][year][month]) {
                    week_count[item][year][month] = {}
                }
                if (!week_count[item][year][month][week]) {
                    week_count[item][year][month][week] = {
                        id: week_id,
                        city: item,
                        week: week,
                        count: 0
                    }
                    week_id++
                }
            }
        })

        row.rows.forEach(function (datarow) {
            var keyItem = datarow[keyName]
            // var city = datarow['RESIDENCE_COUNTY_NAME']
            var date = new Date(datarow['SICK_DATE'])
            var year = date.getFullYear()
            var month = date.getMonth()
            var week = date.getWeek()
            var count = parseInt(datarow['COUNT'])

            week_count[keyItem][year][month][week].count += count
        })
        keyItems.forEach(function (item) {
            var result_temp = []
            Object.keys(week_count[item]).forEach(function (year) {
                Object.keys(week_count[item][year]).forEach(function (month) {
                    Object.keys(week_count[item][year][month]).forEach(function (week) {
                        result_temp.push(week_count[item][year][month][week])
                    })
                })
            })

            result_temp.sort(function (a, b) {
                return a.id - b.id
            })

            var result_values = []
            if (result_temp.length > 1) {
                result_values.push(result_temp[0])
                var length = result_temp.length
                for (var x = 1; x < length; x++) {
                    if (result_temp[x].week == result_values[result_values.length - 1].week) {
                        result_values[result_values.length - 1].count += result_temp[x].count
                    } else {
                        result_values.push(result_temp[x])
                    }
                }
            } else {
                result_values = result_temp
            }

            var id_resort = 0
            result_values.forEach(function (obj) {
                obj.id = id_resort++
            })

            result.push({
                id: item,
                values: result_values
            })
        })

        res.send(result)
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
    summer,
    trend,
    hidden,
    determine
};