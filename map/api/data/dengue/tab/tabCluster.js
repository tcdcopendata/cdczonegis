var pg = require('pg');
var config = require('../../../../config');
var connectionString = config.postgres;
var pgString = connectionString + config.db.cdczonegis;

// 病例群聚：搜尋儀表板
var query = function (req, res) {
    var client = new pg.Client(pgString);
    client.connect();

    // 先搜尋群聚個案，再搜尋所有個案並加入
    // 群聚 14天算2週 15天算3週

    var strSql = 'SELECT * FROM "dengue_cluster_info"' +
        ' WHERE "lon" IS NOT NULL AND "lat" IS NOT NULL'
    var sqlParmeter = [];

    var items_city = [];
    var items_case_count = [];
    var items_remain = [];

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
        if (req.body.case_count && req.body.case_count.length > 0) {
            items_case_count = req.body.case_count.split('&');
            if (items_case_count.length > 0) {
                var strSql_case_count = '';
                if (items_case_count.indexOf('2人') >= 0) {
                    if (strSql_case_count.length != 0) {
                        strSql_case_count += ' OR ';
                    }
                    strSql_case_count += '"case_count" = 2';
                }
                if (items_case_count.indexOf('3-5人') >= 0) {
                    if (strSql_case_count.length != 0) {
                        strSql_case_count += ' OR ';
                    }
                    strSql_case_count += '"case_count" BETWEEN 3 AND 5';
                }
                if (items_case_count.indexOf('6-10人') >= 0) {
                    if (strSql_case_count.length != 0) {
                        strSql_case_count += ' OR ';
                    }
                    strSql_case_count += '"case_count" BETWEEN 6 AND 10';
                }
                if (items_case_count.indexOf('11人以上') >= 0) {
                    if (strSql_case_count.length != 0) {
                        strSql_case_count += ' OR ';
                    }
                    strSql_case_count += '"case_count" >= 11';
                }
                strSql += ' AND (' + strSql_case_count + ')';
            }
        }
        if (req.body.remain && req.body.remain.length > 0) {
            items_remain = req.body.remain.split('&');
            if (items_remain.length > 0) {
                var strSql_remain = ''
                if (items_remain.indexOf('1-2週') >= 0) {
                    if (strSql_remain.length != 0) {
                        strSql_remain += ' OR ';
                    }
                    strSql_remain += '"remain" BETWEEN 1 AND 14';
                }
                if (items_remain.indexOf('3-4週') >= 0) {
                    if (strSql_remain.length != 0) {
                        strSql_remain += ' OR ';
                    }
                    strSql_remain += '"remain" BETWEEN 15 AND 28';
                }
                if (items_remain.indexOf('5-8週') >= 0) {
                    if (strSql_remain.length != 0) {
                        strSql_remain += ' OR ';
                    }
                    strSql_remain += '"remain" BETWEEN 29 AND 56';
                }
                if (items_remain.indexOf('9週以上') >= 0) {
                    if (strSql_remain.length != 0) {
                        strSql_remain += ' OR ';
                    }
                    strSql_remain += '"remain" >= 57';
                }
                strSql += ' AND (' + strSql_remain + ')';
            }
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
        resultAll.week_line_people = [];
        var week_count = {};
        var week_count_people = {};
        var week_id = 0;
        var week_id_people = 0;
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

            if (!week_count_people[year]) {
                week_count_people[year] = {};
            }
            if (!week_count_people[year][month]) {
                week_count_people[year][month] = {};
            }
            if (!week_count_people[year][month][week]) {
                week_count_people[year][month][week] = {
                    id: week_id_people,
                    week: week,
                    count: 0
                };
                week_id_people++;
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
        var resultCityObject = {};
        // 群聚規模
        resultAll.case_count = [];
        resultAll.case_count[0] = {
            type: '2人',
            count: 0
        };
        resultAll.case_count[1] = {
            type: '3-5人',
            count: 0
        };
        resultAll.case_count[2] = {
            type: '6-10人',
            count: 0
        };
        resultAll.case_count[3] = {
            type: '11人以上',
            count: 0
        };
        // 群聚持續時間
        resultAll.remain = []
        resultAll.remain[0] = {
            type: '1-2週',
            count: 0
        };
        resultAll.remain[1] = {
            type: '3-4週',
            count: 0
        };
        resultAll.remain[2] = {
            type: '5-8週',
            count: 0
        };
        resultAll.remain[3] = {
            type: '9週以上',
            count: 0
        };
        row.rows.forEach(function (datarow) {
            // 週次
            var date = new Date(datarow['sickdate_first'])
            var year = date.getFullYear()
            var month = date.getMonth()
            var week = date.getWeek()
            week_count[year][month][week].count++;
            week_count_people[year][month][week].count += parseInt(datarow['case_count']);
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
            // 城市
            var city = datarow['residence_city']
            if (items_city.length == 1) {
                city = datarow['residence_city'] + ',' + datarow['residence_dist']
            } else if (items_city.length == 2) {
                city = datarow['residence_city'] + ',' + datarow['residence_dist'] + ',' + datarow['residence_village']
            } else if (items_city.length == 3) {
                city = datarow['residence_city'] + ',' + datarow['residence_dist'] + ',' + datarow['residence_village']
            }
            console.log(city)
            if (!resultCityObject[city]) {
                resultCityObject[city] = {
                    type: city,
                    count: 0
                }
            }
            resultCityObject[city].count++;
            // 群聚規模
            var case_count = parseInt(datarow['case_count'])
            if (case_count != NaN) {
                if (items_case_count.length > 0) {
                    if (case_count == 2 && items_case_count.indexOf(resultAll.case_count[0].type) >= 0) {
                        resultAll.case_count[0].count++
                    } else if (case_count <= 5 && items_case_count.indexOf(resultAll.case_count[1].type) >= 0) {
                        resultAll.case_count[1].count++
                    } else if (case_count <= 10 && items_case_count.indexOf(resultAll.case_count[2].type) >= 0) {
                        resultAll.case_count[2].count++
                    } else if (case_count >= 11 && items_case_count.indexOf(resultAll.case_count[3].type) >= 0) {
                        resultAll.case_count[3].count++
                    }
                } else {
                    if (case_count == 2) {
                        resultAll.case_count[0].count++
                    } else if (case_count <= 5) {
                        resultAll.case_count[1].count++
                    } else if (case_count <= 10) {
                        resultAll.case_count[2].count++
                    } else if (case_count >= 11) {
                        resultAll.case_count[3].count++
                    }
                }
            }
            // 群聚規模
            var remain = parseInt(datarow['remain'])
            if (remain != NaN) {
                if (items_remain.length > 0) {
                    if (remain >= 1 && remain <= 14 && items_case_count.indexOf(resultAll.remain[0].type) >= 0) {
                        resultAll.remain[0].count++
                    } else if (remain >= 15 && remain <= 28 && items_case_count.indexOf(resultAll.remain[1].type) >= 0) {
                        resultAll.remain[1].count++
                    } else if (remain >= 29 && remain <= 56 && items_case_count.indexOf(resultAll.remain[2].type) >= 0) {
                        resultAll.remain[2].count++
                    } else if (remain >= 57 && items_case_count.indexOf(resultAll.remain[3].type) >= 0) {
                        resultAll.remain[3].count++
                    }
                } else {
                    if (remain >= 1 && remain <= 14) {
                        resultAll.remain[0].count++
                    } else if (remain >= 15 && remain <= 28) {
                        resultAll.remain[1].count++
                    } else if (remain >= 29 && remain <= 56) {
                        resultAll.remain[2].count++
                    } else if (remain >= 57) {
                        resultAll.remain[3].count++
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
        // 人數
        var result_temp_people = [];
        Object.keys(week_count_people).forEach(function (year) {
            Object.keys(week_count_people[year]).forEach(function (month) {
                Object.keys(week_count_people[year][month]).forEach(function (week) {
                    result_temp_people.push(week_count_people[year][month][week])
                })
            })
        })
        result_temp_people.sort(function (a, b) {
            return a.id - b.id
        })

        if (result_temp_people.length > 1) {
            resultAll.week_line_people.push(result_temp_people[0]);
            var length = result_temp_people.length;
            for (var x = 1; x < length; x++) {
                if (result_temp_people[x].week == resultAll.week_line_people[resultAll.week_line_people.length - 1].week) {
                    resultAll.week_line_people[resultAll.week_line_people.length - 1].count += result_temp_people[x].count;
                } else {
                    resultAll.week_line_people.push(result_temp_people[x]);
                }
            }
        } else {
            resultAll.week_line_people = result_temp_people;
        }
        // result = result_temp
        var id_resort_people = 0;
        resultAll.week_line_people.forEach(function (obj) {
            obj.id = id_resort_people++;
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