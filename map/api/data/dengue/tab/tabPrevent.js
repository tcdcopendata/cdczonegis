var pg = require('pg');
var config = require('../../../../config');
var connectionString = config.postgres;
var pgString = connectionString + config.db.cdczonegis;

// 病例個案：搜尋儀表板
var query = function (req, res) {
    var client = new pg.Client(pgString);
    client.connect();

    var strSql = 'SELECT * FROM "spray_record"' +
        ' WHERE "GEOMETRY" IS NOT NULL';
    var sqlParameter = [];
    var date_start;
    var date_end;
    var items_execute = [];
    var items_city = [];
    if (req.body) {
        // 時間
        if (req.body.start) {
            date_start = new Date(req.body.start)
            if (!isNaN(date_start.getTime())) {
                date_start = new Date(date_start.getFullYear(), date_start.getMonth(), date_start.getDate())
                sqlParameter.push(date_start);
                strSql += ' AND "DATE" >= $' + sqlParameter.length;
            }
        }
        if (req.body.end) {
            date_end = new Date(req.body.end)
            if (!isNaN(date_end.getTime())) {
                date_end = new Date(date_end.getFullYear(), date_end.getMonth(), date_end.getDate() + 1)
                sqlParameter.push(date_end);
                strSql += ' AND "DATE" < $' + sqlParameter.length;
            }
        }
        // 防治時間
        if (req.body.execute && req.body.execute.length > 0) {
            var today = new Date();
            today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            today = today.setDate(today.getDate() - 13);
            items_execute = req.body.execute.split('&');
            if (items.indexOf('14日內執行') >= 0 && items.indexOf('15日以上執行') >= 0) {

            } else if (items.indexOf('14日內執行') >= 0) {
                sqlParameter.push(today);
                strSql += ' AND "DATE" => $' + sqlParameter.length;
            } else if (items.indexOf('15日以上執行') >= 0) {
                sqlParameter.push(today);
                strSql += ' AND "DATE" < $' + sqlParameter.length;
            }
        }
        // 城市
        if (req.body.city) {
            items_city = req.body.city.split(',');
            if (items_city.length == 1) {
                sqlParameter.push(items_city[0]);
                strSql += ' AND "CITY_NAME" = $' + sqlParameter.length;
            } else if (items_city.length == 2) {
                sqlParameter.push(items_city[0]);
                strSql += ' AND "CITY_NAME" = $' + sqlParameter.length;
                sqlParameter.push(items_city[1]);
                strSql += ' AND "DISTRICT_NAME" = $' + sqlParameter.length;
            } else if (items_city.length == 3) {
                sqlParameter.push(items_city[0]);
                strSql += ' AND "CITY_NAME" = $' + sqlParameter.length;
                sqlParameter.push(items_city[1]);
                strSql += ' AND "DISTRICT_NAME" = $' + sqlParameter.length;
                sqlParameter.push(items_city[2]);
                strSql += ' AND "VILLAGE_NAME" = $' + sqlParameter.length;
            }
        }
    }
    strSql += ' ORDER BY "DATE"';
    client.query(strSql, sqlParameter, function (err, row) {
        if (err) {
            console.log('err: ' + err)
        }
        client.end();
        var resultAll = {};
        // 個案週次統計
        resultAll.week_line = [];
        var week_count = {};
        var week_id = 0;
        var d_s = date_start;
        var d_e = date_end;
        var count_day = (d_e.getTime() - d_s.getTime()) / (1000 * 60 * 60 * 24);
        for (var x = 0; x <= count_day; x++) {
            var date = new Date(d_s.getFullYear(), d_s.getMonth(), d_s.getDate() + x);
            var year = date.getFullYear();
            var month = date.getMonth();
            var week = date.getWeek();

            if (!week_count[year]) {
                week_count[year] = {};
            }
            if (!week_count[year][month]) {
                week_count[year][month] = {};
            }
            if (!week_count[year][month][week]) {
                week_count[year][month][week] = {
                    id: week_id,
                    week: week,
                    count: 0
                }
                week_id++;
            }
        }
        // 執行時間
        resultAll.execute = []
        resultAll.execute[0] = {
            type: '14日內執行',
            count: 0
        }
        resultAll.execute[1] = {
            type: '15日以上執行',
            count: 0
        }
        var today_compare = new Date();
        today_compare = new Date(today_compare.getFullYear(), today_compare.getMonth(), today_compare.getDate());
        today_compare.setDate(today_compare.getDate() - 13);
        // 城市
        resultAll.city = [];
        var resultCityObject = {};
        row.rows.forEach(function (datarow) {
            // 週次
            var date = new Date(datarow['DATE']);
            var year = date.getFullYear();
            var month = date.getMonth();
            var week = date.getWeek();
            week_count[year][month][week].count++;

            // 執行時間
            if (date.getTime() >= today_compare.getTime()) {
                resultAll.execute[0].count++;
            } else {
                resultAll.execute[1].count++;
            }

            // 城市
            var city = datarow['CITY_NAME']
            if (items_city.length == 1) {
                city = datarow['CITY_NAME'] + ',' + datarow['DISTRICT_NAME']
            } else if (items_city.length == 2) {
                city = datarow['CITY_NAME'] + ',' + datarow['DISTRICT_NAME'] + ',' + datarow['VILLAGE_NAME']
            } else if (items_city.length == 3) {
                city = datarow['CITY_NAME'] + ',' + datarow['DISTRICT_NAME'] + ',' + datarow['VILLAGE_NAME']
            }
            if (!resultCityObject[city]) {
                resultCityObject[city] = {
                    type: city,
                    count: 0
                }
            }
            resultCityObject[city].count++;
        })
        // 週次
        var result_temp = []
        Object.keys(week_count).forEach(function (year) {
            Object.keys(week_count[year]).forEach(function (month) {
                Object.keys(week_count[year][month]).forEach(function (week) {
                    result_temp.push(week_count[year][month][week]);
                })
            })
        })
        result_temp.sort(function (a, b) {
            return a.id - b.id;
        })

        if (result_temp.length > 1) {
            resultAll.week_line.push(result_temp[0]);
            var length = result_temp.length;
            for (var x = 1; x < length; x++) {
                if (result_temp[x].week == resultAll.week_line[resultAll.week_line.length - 1].week) {
                    resultAll.week_line[resultAll.week_line.length - 1].count += result_temp[x].count
                } else {
                    resultAll.week_line.push(result_temp[x]);
                }
            }
        } else {
            resultAll.week_line = result_temp;
        }
        // result = result_temp
        var id_resort = 0;
        resultAll.week_line.forEach(function (obj) {
            obj.id = id_resort++;
        })
        // 城市
        Object.keys(resultCityObject).forEach(function (city) {
            resultAll.city.push(resultCityObject[city]);
        })
        resultAll.city.sort(function (a, b) {
            return b.count - a.count;
        })
        res.send(resultAll);
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