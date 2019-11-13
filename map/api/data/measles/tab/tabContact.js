var pg = require('pg');
var config = require('../../../../config');
var pgString = config.pgService.cdctrace + config.db.cdctrace;

var query = function (req, res) {
    var client = new pg.Client(pgString);
    client.connect();

    // 先搜尋群聚個案，再搜尋所有個案並加入
    // 群聚 14天算2週 15天算3週

    var strSql =
        'SELECT "CONTACT_DATE","GENDER","AGE","lon","lat",' +
        '"RESIDENTIAL_COUNTY_NAME","RESIDENTIAL_TOWN_NAME"' +
        // '"lon","lat"' +
        ' FROM "CONTACT_PERSON"' +
        ' LEFT JOIN "contact_person_gis"' +
        ' ON "CONTACT_PERSON"."contact_person_id" = "contact_person_gis"."contact_person_id"' +
        // ' LEFT JOIN "contact_person_gis"' +
        // ' ON "CONTACT_PERSON"."contact_person_id" = "contact_person_gis"."contact_person_id"' +
        ' WHERE 1=1';
    var sqlParmeter = [];
    var items_city = [];
    if (req.body) {
        if (req.body.start) {
            date_start = new Date(req.body.start);
            if (!isNaN(date_start.getTime())) {
                date_start = new Date(date_start.getFullYear(), date_start.getMonth(), date_start.getDate());
                sqlParmeter.push(date_start);
                strSql += ' AND "CONTACT_DATE" >= $' + sqlParmeter.length;
            }
        }
        if (req.body.end) {
            date_end = new Date(req.body.end);
            if (!isNaN(date_end.getTime())) {
                date_end = new Date(date_end.getFullYear(), date_end.getMonth(), date_end.getDate() + 1);
                sqlParmeter.push(date_end);
                strSql += ' AND "CONTACT_DATE" < $' + sqlParmeter.length;
            }
        }
        if (req.body.watch) {
            var items = req.body.watch.split('&');
            var end_date = new Date();
            end_date = new Date(end_date.getFullYear(), end_date.getMonth(), end_date.getDate());
            // if (items.indexOf('未結案') >= 0) {
            //     strSql += ' AND "closed" = false';
            // } else if (items.indexOf('已結案') >= 0) {
            //     strSql += ' AND "closed" = true';
            // }
        }
        if (req.body.city) {
            items_city = req.body.city.split(',');
            if (items_city.length == 1) {
                sqlParmeter.push(items_city[0]);
                strSql += ' AND "RESIDENTIAL_COUNTY_NAME" = $' + sqlParmeter.length;
            } else if (items_city.length == 2) {
                sqlParmeter.push(items_city[0]);
                strSql += ' AND "RESIDENTIAL_COUNTY_NAME" = $' + sqlParmeter.length;
                sqlParmeter.push(items_city[1]);
                strSql += ' AND "RESIDENTIAL_TOWN_NAME" = $' + sqlParmeter.length;
            }
        }
    }
    strSql += ' ORDER BY "CONTACT_DATE"';
    client.query(strSql, sqlParmeter, function (err, row) {
        if (err) {
            console.log('err: ' + err);
        }
        client.end();
        var resultAll = {};
        // 無定位資料
        var tempRow = [];
        var tempNoLocateRow = [];
        row.rows.forEach(function (datarow) {
            if (datarow['lon'] && datarow['lon'] != 0 &&
                datarow['lat'] && datarow['lat'] != 0) {
                tempRow.push(datarow);
            } else {
                tempNoLocateRow.push(datarow);
            }
        });
        row.rows = tempRow;
        resultAll.noLocateData = tempNoLocateRow;

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
                };
                week_id++;
            }
        }
        // 未結案/已結案
        resultAll.watch = [];
        resultAll.watch[0] = {
            type: '進行中',
            count: 0
        };
        resultAll.watch[1] = {
            type: '已完成',
            count: 0
        };
        // 城市
        resultAll.city = [];
        var resultCityObject = {};
        row.rows.forEach(function (datarow) {
            // 週次
            var date = new Date(datarow['CONTACT_DATE']);
            var year = date.getFullYear();
            var month = date.getMonth();
            var week = date.getWeek();
            week_count[year][month][week].count++;
            var date_now = new Date();
            var count_day = (date_now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
            // 未結案/已結案
            // var watch = datarow['closed']
            // closed = closed == false ? '未結案' : '已結案'
            // switch (closed) {
            //     case '未結案':
            //         resultAll.closed[0].count++
            //         break
            //     case '已結案':
            //         resultAll.closed[1].count++
            //         break
            // }
            if (count_day <= 18) {
                resultAll.watch[0].count++;
            } else {
                resultAll.watch[1].count++;
            }
            // 城市
            var city = datarow['RESIDENTIAL_COUNTY_NAME']
            if (items_city.length == 1) {
                city = datarow['RESIDENTIAL_COUNTY_NAME'] + ',' + datarow['RESIDENTIAL_TOWN_NAME']
            } else if (items_city.length == 2) {
                city = datarow['RESIDENTIAL_COUNTY_NAME'] + ',' + datarow['RESIDENTIAL_TOWN_NAME']
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

module.exports = {
    query
};