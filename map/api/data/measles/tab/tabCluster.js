var pg = require('pg');
var config = require('../../../../config');
var connectionString = config.postgres;
var pgString = connectionString + config.db.cdczonegis;

var query = function (req, res) {
    var client = new pg.Client(pgString);
    client.connect();

    // 先搜尋群聚個案，再搜尋所有個案並加入
    // 群聚 14天算2週 15天算3週

    // var strSql = 'SELECT * FROM "measles_cluster_info" WHERE "sickdate_first" IS NOT NULL AND "sickdate_last" IS NOT NULL';
    var strSql = 'SELECT "measles_cluster_info".* FROM "measles_cluster_info"' +
        ' RIGHT JOIN "measles_cluster_relation" ON "measles_cluster_relation"."info_id" = "measles_cluster_info"."id"' +
        ' RIGHT JOIN "dws_report_measles_gis" ON "dws_report_measles_gis"."REPORT" = "measles_cluster_relation"."case_report"' +
        ' WHERE "sickdate_first" IS NOT NULL AND "sickdate_last" IS NOT NULL';
    var sqlParmeter = [];

    var items_city = [];

    if (req.body) {
        if (req.body.start) {
            date_start = new Date(req.body.start);
            if (!isNaN(date_start.getTime())) {
                date_start = new Date(date_start.getFullYear(), date_start.getMonth(), date_start.getDate());
                sqlParmeter.push(date_start);
                strSql += ' AND "sickdate_first" >= $' + sqlParmeter.length;
            }
        }
        if (req.body.end) {
            date_end = new Date(req.body.end);
            if (!isNaN(date_end.getTime())) {
                date_end = new Date(date_end.getFullYear(), date_end.getMonth(), date_end.getDate() + 1);
                sqlParmeter.push(date_end);
                strSql += ' AND "sickdate_first" < $' + sqlParmeter.length;
            }
        }
        if (req.body.closed) {
            var items = req.body.closed.split('&');
            if (items.indexOf('未結案') >= 0) {
                strSql += ' AND "closed" = false';
            } else if (items.indexOf('已結案') >= 0) {
                strSql += ' AND "closed" = true';
            }
        }
        if (req.body.city) {
            items_city = req.body.city.split(',');
            if (items_city.length == 1) {
                sqlParmeter.push(items_city[0]);
                strSql += ' AND "residence_city" = $' + sqlParmeter.length;
            } else if (items_city.length == 2) {
                sqlParmeter.push(items_city[0]);
                strSql += ' AND "residence_city" = $' + sqlParmeter.length;
                sqlParmeter.push(items_city[1]);
                strSql += ' AND "residence_dist" = $' + sqlParmeter.length;
            } else if (items_city.length == 3) {
                sqlParmeter.push(items_city[0]);
                strSql += ' AND "residence_city" = $' + sqlParmeter.length;
                sqlParmeter.push(items_city[1]);
                strSql += ' AND "residence_dist" = $' + sqlParmeter.length;
                sqlParmeter.push(items_city[2]);
                strSql += ' AND "residence_village" = $' + sqlParmeter.length;
            }
        }
        if (req.body.cluster_static_info && req.body.cluster_static_info != -1) {
            sqlParmeter.push(req.body.cluster_static_info);
            strSql += ' AND "measles_cluster_info"."id" = $' + sqlParmeter.length;
        }
    }
    strSql += ' ORDER BY "sickdate_first"';
    client.query(strSql, sqlParmeter, function (err, row) {
        if (err) {
            console.log('err: ' + err);
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
                };
                week_id++;
            }
        }
        // 未結案/已結案
        resultAll.closed = [];
        resultAll.closed[0] = {
            type: '未結案',
            count: 0
        };
        resultAll.closed[1] = {
            type: '已結案',
            count: 0
        };
        // 城市
        resultAll.city = [];
        resultAll.cluster = [];
        var resultCityObject = {};
        var resultClusterObject = {};
        row.rows.forEach(function (datarow) {
            // 週次
            var date = new Date(datarow['sickdate_first']);
            var year = date.getFullYear();
            var month = date.getMonth();
            var week = date.getWeek();
            week_count[year][month][week].count++;
            // 未結案/已結案
            var closed = datarow['closed']
            closed = closed == false ? '未結案' : '已結案'
            switch (closed) {
                case '未結案':
                    resultAll.closed[0].count++
                    break
                case '已結案':
                    resultAll.closed[1].count++
                    break
            }
            // 群聚事件
            var id = datarow['id'];
            var case_name = '';
            if (datarow['case_name']) {
                case_name = datarow['case_name'];
            } else if (datarow['epidemic_no']) {
                case_name = "流行案例編號：" + datarow['epidemic_no'];
            } else {
                case_name = "無";
            }
            resultClusterObject[id] = {
                id: id,
                case_name: case_name
            };

            // 城市
            var city = datarow['residence_city']
            if (items_city.length == 1) {
                city = datarow['residence_city'] + ',' + datarow['residence_dist']
            } else if (items_city.length == 2) {
                city = datarow['residence_city'] + ',' + datarow['residence_dist'] + ',' + datarow['residence_village']
            } else if (items_city.length == 3) {
                city = datarow['residence_city'] + ',' + datarow['residence_dist'] + ',' + datarow['residence_village']
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
        // 群聚事件
        Object.keys(resultClusterObject).forEach(function (id) {
            resultAll.cluster.push(resultClusterObject[id]);
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