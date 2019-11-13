var pg = require('pg');
var config = require('../../../../config');
var connectionString = config.postgres;
var pgString = connectionString + config.db.cdczonegis;

// 病例個案：搜尋儀表板
var query = function (req, res) {
    var client = new pg.Client(pgString);
    client.connect();

    var strSql = 'SELECT "LON","LAT","REPORT","DISEASE","SICK_DATE","DIAGNOSE_DATE",' +
        '"DETERMINED_STATUS","DETERMINED_STATUS_DESC",' +
        //本土/境外移入
        '"IMMIGRATION",' +
        //年齡層
        '"SICK_AGE",' +
        //性別
        '"GENDER_DESC",' +
        //權限判斷
        '"RESIDENCE_COUNTY_NAME",' +
        '"RESIDENCE_TOWN_NAME",' +
        '"RESIDENCE_VILLAGE_NAME",' +
        //感染國家
        '"INFECTED_COUNTRY_NAME",' +
        //重症死亡
        '"HAS_SC",' +
        '"DEATH_CNT",' +
        //血清型
        // ' "PATHOGEN_DETAIL_NAME",' +
        //NS1
        '"NS1_RESULT",' +
        //隱藏期
        '"REPORT_DATE","TRAVEL_DATETO","TRAVEL2_DATETO","TRAVEL3_DATETO"' +

        ' FROM "dws_report_dengue_gis"' +
        ' WHERE "DISEASE" IN (\'061\', \'0654\')'
    // ' WHERE "LON" IS NOT NULL AND "LAT" IS NOT NULL' +
    //     ' AND "DISEASE" IN (\'061\', \'0654\')'
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
            date_start = new Date(req.body.start)
            if (!isNaN(date_start.getTime())) {
                date_start = new Date(date_start.getFullYear(), date_start.getMonth(), date_start.getDate())
                sqlParmeter.push(date_start);
                strSql += ' AND "' + date_column + '" >= $' + sqlParmeter.length;
            }
        }
        if (req.body.end) {
            date_end = new Date(req.body.end)
            if (!isNaN(date_end.getTime())) {
                date_end = new Date(date_end.getFullYear(), date_end.getMonth(), date_end.getDate() + 1)
                sqlParmeter.push(date_end);
                strSql += ' AND "' + date_column + '" < $' + sqlParmeter.length;
            }
        }
        // 診斷/確診
        if (req.body.case_static_determine) {
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
            var items = req.body.immigration.split('&')
            if (items.indexOf('本土') >= 0 && items.indexOf('境外移入') >= 0) {

            } else if (items.indexOf('本土') >= 0) {
                strSql += ' AND ("IMMIGRATION" IS NULL OR "IMMIGRATION" = 0)';
            } else if (items.indexOf('境外移入') >= 0) {
                strSql += ' AND "IMMIGRATION" <> 0';
            }
        }
        // 城市
        if (req.body.city) {
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
                if (items_age.indexOf('0-14') >= 0) {
                    if (strSqlAge.length != 0) {
                        strSqlAge += ' OR ';
                    }
                    strSqlAge += 'dws_report_dengue_gis."SICK_AGE" BETWEEN 0 AND 14';
                }
                if (items_age.indexOf('15-49') >= 0) {
                    if (strSqlAge.length != 0) {
                        strSqlAge += ' OR ';
                    }
                    strSqlAge += 'dws_report_dengue_gis."SICK_AGE" BETWEEN 15 AND 49';
                }
                if (items_age.indexOf('50-64') >= 0) {
                    if (strSqlAge.length != 0) {
                        strSqlAge += ' OR ';
                    }
                    strSqlAge += 'dws_report_dengue_gis."SICK_AGE" BETWEEN 50 AND 64';
                }
                if (items_age.indexOf('65+') >= 0) {
                    if (strSqlAge.length != 0) {
                        strSqlAge += ' OR ';
                    }
                    strSqlAge += 'dws_report_dengue_gis."SICK_AGE" >= 65';
                }
                strSql += ' AND (' + strSqlAge + ')'
            }
        }
        // 性別
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
            items_ns1 = req.body.ns1.split('&')
            if (items_ns1.indexOf('陽性') >= 0 && items_ns1.indexOf('陰性') >= 0) {

            } else if (items_ns1.indexOf('陽性') >= 0) {
                strSql += ' AND "NS1_RESULT" = \'NS1陽性\'';
            } else if (items_ns1.indexOf('陰性') >= 0) {
                strSql += ' AND "NS1_RESULT" <> \'NS1陽性\'';
            }
        }
        if (req.body.illness && req.body.illness.length > 0) {
            items_illness = req.body.illness.split('&')
            if (items_illness.indexOf('重症') >= 0 && items_illness.indexOf('非重症') >= 0) {

            } else if (items_illness.indexOf('重症') >= 0) {
                strSql += ' AND "HAS_SC" = \'有\''
            } else if (items_illness.indexOf('非重症') >= 0) {
                strSql += ' AND "HAS_SC" <> \'有\''
            }
        }
        if (req.body.death && req.body.death.length > 0) {
            items_death = req.body.death.split('&')
            if (items_death.indexOf('死亡') >= 0 && items_death.indexOf('非死亡') >= 0) {

            } else if (items_death.indexOf('死亡') >= 0) {
                strSql += ' AND "DEATH_CNT" = 1'
            } else if (items_death.indexOf('非死亡') >= 0) {
                strSql += ' AND "DEATH_CNT" <> 1'
            }
        }
        if (req.body.country && req.body.country.length > 0) {
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
        if (err) {
            console.log('err: ' + err)
        }
        client.end();
        // 先處理row 挑出未定位資料
        var tempRow = [];
        var tempNoLocateRow = [];
        row.rows.forEach(function (datarow) {
            if (datarow['LON'] && datarow['LON'] != 0 &&
                datarow['LAT'] && datarow['LAT'] != 0) {
                tempRow.push(datarow);
            }
            else {
                tempNoLocateRow.push(datarow);
            }
        });
        row.rows = tempRow;

        var resultAll = {}
        resultAll.noLocateData = tempNoLocateRow;
        // 個案週次統計
        resultAll.week_line = []
        var week_count = {}
        var week_id = 0
        var d_s = date_start
        var d_e = date_end
        var count_day = (d_e.getTime() - d_s.getTime()) / (1000 * 60 * 60 * 24)
        for (var x = 0; x <= count_day; x++) {
            var date = new Date(d_s.getFullYear(), d_s.getMonth(), d_s.getDate() + x)
            var year = date.getFullYear()
            var month = date.getMonth()
            var week = date.getWeek()

            if (!week_count[year]) {
                week_count[year] = {}
            }
            if (!week_count[year][month]) {
                week_count[year][month] = {}
            }
            if (!week_count[year][month][week]) {
                week_count[year][month][week] = {
                    id: week_id,
                    week: week,
                    count: 0
                }
                week_id++
            }
        }
        // 隱藏期
        resultAll.week_hidden = []
        var week_count_hidden = {}
        var week_id_hidden = 0
        for (var x = 0; x <= count_day; x++) {
            var date = new Date(d_s.getFullYear(), d_s.getMonth(), d_s.getDate() + x)
            var year = date.getFullYear()
            var month = date.getMonth()
            var week = date.getWeek()

            if (!week_count_hidden[year]) {
                week_count_hidden[year] = {}
            }
            if (!week_count_hidden[year][month]) {
                week_count_hidden[year][month] = {}
            }
            if (!week_count_hidden[year][month][week]) {
                week_count_hidden[year][month][week] = {
                    id: week_id_hidden,
                    week: week,
                    report_days: 0,
                    count: 0
                }
                week_id_hidden++
            }
        }
        // 本土/境外移入
        resultAll.immigration = []
        resultAll.immigration[0] = {
            type: '本土',
            count: 0
        }
        resultAll.immigration[1] = {
            type: '境外移入',
            count: 0
        }
        // 城市
        resultAll.city = []
        var resultCityObject = {}
        // 年齡層
        resultAll.age = []
        resultAll.age[0] = {
            type: '0-14',
            count: 0
        }
        resultAll.age[1] = {
            type: '15-49',
            count: 0
        }
        resultAll.age[2] = {
            type: '50-64',
            count: 0
        }
        resultAll.age[3] = {
            type: '65+',
            count: 0
        }
        // 性別
        resultAll.gender = []
        resultAll.gender[0] = {
            type: '女',
            count: 0
        }
        resultAll.gender[1] = {
            type: '男',
            count: 0
        }
        // ns1
        resultAll.ns1 = []
        resultAll.ns1[0] = {
            type: '陰性',
            count: 0
        }
        resultAll.ns1[1] = {
            type: '陽性',
            count: 0
        }
        // 重症
        resultAll.illness = []
        resultAll.illness[0] = {
            type: '重症',
            count: 0
        }
        resultAll.illness[1] = {
            type: '非重症',
            count: 0
        }
        // 死亡
        resultAll.death = [];
        resultAll.death[0] = {
            type: '死亡',
            count: 0
        }
        resultAll.death[1] = {
            type: '非死亡',
            count: 0
        }
        resultAll.country = [];
        if (items_country.length > 0) {
            var c_count = 0;
            items_country.forEach(function (country) {
                resultAll.country[c_count] = {
                    type: country,
                    count: 0
                }
                c_count++;
            })
        }
        var resultCountryObject = {};
        row.rows.forEach(function (datarow) {
            // 週次
            var date = new Date(datarow[date_column]);
            var year = date.getFullYear();
            var month = date.getMonth();
            var week = date.getWeek();
            week_count[year][month][week].count++;
            // 隱藏期
            var date_sick = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var date_report = new Date(datarow['REPORT_DATE']);
            // 新增：判斷三個旅遊日
            ['TRAVEL_DATETO', 'TRAVEL2_DATETO', 'TRAVEL3_DATETO'].forEach(function (datacolumn) {
                var date = new Date(datarow[datacolumn]);
                if (date.toString() != "Invalid Date") {
                    if (date.getTime() > date_report.getTime()) {
                        date_report = date;
                    }
                }
            });
            date_report = new Date(date_report.getFullYear(), date_report.getMonth(), date_report.getDate());
            var report_days = (date_report.getTime() - date_sick.getTime()) / (1000 * 60 * 60 * 24);
            week_count_hidden[year][month][week].count += 1;
            week_count_hidden[year][month][week].report_days += report_days;
            // 本土/境外移入
            var IMMIGRATION = datarow['IMMIGRATION'];
            IMMIGRATION = IMMIGRATION == 0 ? '本土' : '境外移入'
            switch (IMMIGRATION) {
                case '本土':
                    resultAll.immigration[0].count++
                    break
                case '境外移入':
                    resultAll.immigration[1].count++
                    break
            }
            // 城市
            var city = datarow['RESIDENCE_COUNTY_NAME']
            if (items_city.length == 1) {
                city = datarow['RESIDENCE_COUNTY_NAME'] + ',' + datarow['RESIDENCE_TOWN_NAME']
            } else if (items_city.length == 2) {
                city = datarow['RESIDENCE_COUNTY_NAME'] + ',' + datarow['RESIDENCE_TOWN_NAME'] + ',' + datarow['RESIDENCE_VILLAGE_NAME']
            } else if (items_city.length == 3) {
                city = datarow['RESIDENCE_COUNTY_NAME'] + ',' + datarow['RESIDENCE_TOWN_NAME'] + ',' + datarow['RESIDENCE_VILLAGE_NAME']
            }
            if (!resultCityObject[city]) {
                resultCityObject[city] = {
                    type: city,
                    count: 0
                }
            }
            resultCityObject[city].count++;
            // 年齡層
            var age = parseInt(datarow['SICK_AGE'])
            if (age != NaN) {
                if (items_age.length > 0) {
                    if (age < 15 && items_age.indexOf(resultAll.age[0].type) >= 0) {
                        resultAll.age[0].count++
                    } else if (age < 50 && items_age.indexOf(resultAll.age[1].type) >= 0) {
                        resultAll.age[1].count++
                    } else if (age < 65 && items_age.indexOf(resultAll.age[2].type) >= 0) {
                        resultAll.age[2].count++
                    } else if (items_age.indexOf(resultAll.age[3].type) >= 0) {
                        resultAll.age[3].count++
                    }
                } else {
                    if (age < 15) {
                        resultAll.age[0].count++
                    } else if (age < 50) {
                        resultAll.age[1].count++
                    } else if (age < 65) {
                        resultAll.age[2].count++
                    } else {
                        resultAll.age[3].count++
                    }
                }
            }
            // 性別
            var GENDER = datarow['GENDER_DESC']
            switch (GENDER) {
                case '女':
                    resultAll.gender[0].count++
                    break
                case '男':
                    resultAll.gender[1].count++
                    break
            }
            // ns1
            var test_ns1 = datarow['NS1_RESULT'];
            if (items_ns1.length > 0) {
                if (test_ns1 == 'NS1陽性') {
                    if (items_ns1.indexOf('陽性') >= 0) {
                        resultAll.ns1[1].count++
                    }
                } else {
                    if (items_ns1.indexOf('陰性') >= 0) {
                        resultAll.ns1[0].count++
                    }
                }
            } else {
                if (test_ns1 == 'NS1陽性') {
                    resultAll.ns1[1].count++
                } else {
                    resultAll.ns1[0].count++
                }
            }
            // 重症
            if (req.body.illness && req.body.illness.length > 0) {
                items_illness = req.body.illness.split('&')
                if (items_illness.indexOf('重症') >= 0 && items_illness.indexOf('非重症') >= 0) {

                } else if (items_illness.indexOf('重症') >= 0) {
                    strSql += ' AND "HAS_SC" = "有"'
                } else if (items_illness.indexOf('非重症') >= 0) {
                    strSql += ' AND "HAS_SC" <> "有"'
                }
            }

            var test_illness = datarow['HAS_SC']
            if (items_illness.length > 0) {
                if (test_illness == '有') { // 重症
                    if (items_illness.indexOf('重症') >= 0) {
                        resultAll.illness[0].count++
                    }
                } else {
                    if (items_illness.indexOf('非重症') >= 0) {
                        resultAll.illness[1].count++
                    }
                }
            } else {
                if (test_illness == '有') { // 重症
                    resultAll.illness[0].count++
                } else {
                    resultAll.illness[1].count++
                }
            }
            //死亡
            var death_cnt = parseInt(datarow['DEATH_CNT'])
            if (items_death.length > 0) {
                if (death_cnt && !isNaN(death_cnt) && death_cnt > 0) { //死亡個案
                    if (items_death.indexOf('死亡') >= 0) {
                        resultAll.death[0].count++
                    }
                } else {
                    if (items_death.indexOf('非死亡') >= 0) {
                        resultAll.death[1].count++
                    }
                }
            } else {
                if (death_cnt && !isNaN(death_cnt) && death_cnt > 0) { //死亡個案
                    resultAll.death[0].count++
                } else {
                    resultAll.death[1].count++
                }
            }
            // 國家
            var country = datarow['INFECTED_COUNTRY_NAME']
            if (items_country.length > 0) {
                if (items_country.indexOf(country) >= 0) {
                    resultAll.country[items_country.indexOf(country)].count++
                }
            } else {
                if (!resultCountryObject[country]) {
                    resultCountryObject[country] = {
                        type: country,
                        count: 0
                    }
                }
                resultCountryObject[country].count++
            }
        })
        // 週次
        var result_temp = []
        Object.keys(week_count).forEach(function (year) {
            Object.keys(week_count[year]).forEach(function (month) {
                Object.keys(week_count[year][month]).forEach(function (week) {
                    result_temp.push(week_count[year][month][week])
                })
            })
        })
        result_temp.sort(function (a, b) {
            return a.id - b.id
        })

        if (result_temp.length > 1) {
            resultAll.week_line.push(result_temp[0])
            var length = result_temp.length
            for (var x = 1; x < length; x++) {
                if (result_temp[x].week == resultAll.week_line[resultAll.week_line.length - 1].week) {
                    resultAll.week_line[resultAll.week_line.length - 1].count += result_temp[x].count
                } else {
                    resultAll.week_line.push(result_temp[x])
                }
            }
        } else {
            resultAll.week_line = result_temp
        }
        // result = result_temp
        var id_resort = 0
        resultAll.week_line.forEach(function (obj) {
            obj.id = id_resort++
        })
        // 隱藏期
        result_temp = []
        Object.keys(week_count_hidden).forEach(function (year) {
            Object.keys(week_count_hidden[year]).forEach(function (month) {
                Object.keys(week_count_hidden[year][month]).forEach(function (week) {
                    result_temp.push(week_count_hidden[year][month][week])
                })
            })
        })
        result_temp.sort(function (a, b) {
            return a.id - b.id
        })
        var result_temp2 = []
        if (result_temp.length > 1) {
            result_temp2.push(result_temp[0])
            var length = result_temp.length
            for (var x = 1; x < length; x++) {
                if (result_temp[x].week == result_temp2[result_temp2.length - 1].week) {
                    result_temp2[result_temp2.length - 1].count += result_temp[x].count
                    result_temp2[result_temp2.length - 1].report_days += result_temp[x].report_days
                } else {
                    result_temp2.push(result_temp[x])
                }
            }
        } else {
            result_temp2 = result_temp
        }
        result_temp = result_temp2
        id_resort = 0
        result_temp.forEach(function (temp) {
            var obj = {}
            obj.id = id_resort
            obj.Week = temp.week
            obj['參考值'] = 3
            obj['隱藏期'] = temp.count == 0 ? 0 : temp.report_days / temp.count
            resultAll.week_hidden.push(obj)
            id_resort++
        })
        // 城市
        Object.keys(resultCityObject).forEach(function (city) {
            resultAll.city.push(resultCityObject[city])
        })
        resultAll.city.sort(function (a, b) {
            return b.count - a.count
        })
        Object.keys(resultCountryObject).forEach(function (country) {
            resultAll.country.push(resultCountryObject[country])
        })
        resultAll.country.sort(function (a, b) {
            return b.count - a.count
        })
        res.send(resultAll)
    })
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

module.exports = { query };