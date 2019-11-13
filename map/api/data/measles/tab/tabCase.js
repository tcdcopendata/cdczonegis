var pg = require('pg');
var config = require('../../../../config');
var connectionString = config.postgres;
var pgString = connectionString + config.db.cdczonegis;

// 病例個案：搜尋儀表板
var query = function (req, res) {
    var client = new pg.Client(pgString);
    client.connect();

    var strSql = 'SELECT "LON","LAT","dws_report_measles_gis"."REPORT","DISEASE","SICK_DATE","dws_report_measles_niis"."Resultcode",' +
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
        '"INFECTED_COUNTRY_NAME"' +

        ' FROM "dws_report_measles_gis"' +
        ' LEFT JOIN "dws_report_measles_niis" ON "dws_report_measles_gis"."REPORT" = "dws_report_measles_niis"."REPORT"' +
        ' WHERE "DISEASE" IN (\'055\')';
    // ' WHERE "LON" IS NOT NULL AND "LAT" IS NOT NULL' +
    //     ' AND "DISEASE" IN (\'061\', \'0654\')'
    var sqlParmeter = [];
    var date_start;
    var date_end;
    var items_city = [];
    var items_age = [];
    var items_country = [];
    var items_mmr = [];
    if (req.body) {
        // console.log('sdfafdasfa: ' + req.body);
        // 時間
        if (req.body.start) {
            date_start = new Date(req.body.start)
            if (!isNaN(date_start.getTime())) {
                date_start = new Date(date_start.getFullYear(), date_start.getMonth(), date_start.getDate())
                sqlParmeter.push(date_start);
                strSql += ' AND "SICK_DATE" >= $' + sqlParmeter.length;
            }
        }
        if (req.body.end) {
            date_end = new Date(req.body.end)
            if (!isNaN(date_end.getTime())) {
                date_end = new Date(date_end.getFullYear(), date_end.getMonth(), date_end.getDate() + 1)
                sqlParmeter.push(date_end);
                strSql += ' AND "SICK_DATE" < $' + sqlParmeter.length;
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
        // 性別
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
        // 國家
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
                    strSqlmmr += '"dws_report_measles_niis"."Resultcode" = 3';
                }
                if (items_mmr.indexOf('1劑') >= 0) {
                    if (strSqlmmr.length != 0) {
                        strSqlmmr += ' OR ';
                    }
                    strSqlmmr += '"dws_report_measles_niis"."Resultcode" = 1';
                }
                if (items_mmr.indexOf('2劑') >= 0) {
                    if (strSqlmmr.length != 0) {
                        strSqlmmr += ' OR ';
                    }
                    strSqlmmr += '"dws_report_measles_niis"."Resultcode" = 2';
                }
                if (items_mmr.indexOf('不明') >= 0) {
                    if (strSqlmmr.length != 0) {
                        strSqlmmr += ' OR ';
                    }
                    strSqlmmr += '"dws_report_measles_niis"."Resultcode" = 0';
                }
                strSql += ' AND (' + strSqlmmr + ')'
                console.log(' AND (' + strSqlmmr + ')');
            }
        }
    }
    strSql += ' ORDER BY "SICK_DATE"'
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
            } else {
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
            type: '0',
            count: 0
        }
        resultAll.age[1] = {
            type: '1-6',
            count: 0
        }
        resultAll.age[2] = {
            type: '7-19',
            count: 0
        }
        resultAll.age[3] = {
            type: '20-39',
            count: 0
        }
        resultAll.age[4] = {
            type: '40+',
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
        // 疫苗接種情形 order: ["未接種", "1劑", "2劑", "不明"],
        resultAll.mmr = [];
        resultAll.mmr[0] = {
            type: '未接種',
            count: 0
        }
        resultAll.mmr[1] = {
            type: '1劑',
            count: 0
        }
        resultAll.mmr[2] = {
            type: '2劑',
            count: 0
        }
        resultAll.mmr[3] = {
            type: '不明',
            count: 0
        }
        // 國家
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
            var date = new Date(datarow['SICK_DATE']);
            var year = date.getFullYear();
            var month = date.getMonth();
            var week = date.getWeek();
            week_count[year][month][week].count++;
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
                    if (age < 1 && items_age.indexOf(resultAll.age[0].type) >= 0) {
                        resultAll.age[0].count++
                    } else if (age < 7 && items_age.indexOf(resultAll.age[1].type) >= 0) {
                        resultAll.age[1].count++
                    } else if (age < 20 && items_age.indexOf(resultAll.age[2].type) >= 0) {
                        resultAll.age[2].count++
                    } else if (age < 40 && items_age.indexOf(resultAll.age[3].type) >= 0) {
                        resultAll.age[3].count++
                    } else if (items_age.indexOf(resultAll.age[3].type) >= 0) {
                        resultAll.age[4].count++
                    }
                } else {
                    if (age < 1) {
                        resultAll.age[0].count++
                    } else if (age < 7) {
                        resultAll.age[1].count++
                    } else if (age < 20) {
                        resultAll.age[2].count++
                    } else if (age < 40) {
                        resultAll.age[3].count++
                    } else {
                        resultAll.age[4].count++
                    }
                }
            }
            // 性別
            var GENDER = datarow['GENDER_DESC']
            switch (GENDER) {
                case 'F':
                    resultAll.gender[0].count++
                    break
                case 'M':
                    resultAll.gender[1].count++
                    break
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
            // 疫苗接種情形 order: ["未接種", "1劑", "2劑", "不明"],
            var mmr = parseInt(datarow['Resultcode'])
            if (mmr != NaN) {
                if (items_mmr.length > 0) {
                    if (mmr == 3 && items_mmr.indexOf(resultAll.mmr[0].type) >= 0) {
                        resultAll.mmr[0].count++;
                    }
                    if (mmr == 1 && items_mmr.indexOf(resultAll.mmr[1].type) >= 0) {
                        resultAll.mmr[1].count++;
                    }
                    if (mmr == 2 && items_mmr.indexOf(resultAll.mmr[2].type) >= 0) {
                        resultAll.mmr[2].count++;
                    }
                    if (mmr == 0 && items_mmr.indexOf(resultAll.mmr[3].type) >= 0) {
                        resultAll.mmr[3].count++;
                    }
                } else {
                    if (mmr == 3) {
                        resultAll.mmr[0].count++;
                    }
                    if (mmr == 1) {
                        resultAll.mmr[1].count++;
                    }
                    if (mmr == 2) {
                        resultAll.mmr[2].count++;
                    }
                    if (mmr == 0) {
                        resultAll.mmr[3].count++;
                    }
                }
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

module.exports = {
    query
};