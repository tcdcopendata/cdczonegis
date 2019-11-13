var pg = require('pg');
var config = require('../../../../config');
var connectionString = config.postgres;
var pgString = connectionString + config.db.cdczonegis;

// 病例個案：搜尋儀表板
var query = function (req, res) {
    var client = new pg.Client(pgString);
    client.connect();

    var strSql = 'SELECT ' +
        // 醫療院所
        '"DIM_TOWN_C"."COUNTY_NAME","DIM_TOWN_C"."TOWN_NAME",' +
        '"hospital"."lon","hospital"."lat","hospital"."ADDRESS",' +
        '"hospital"."HOSPITAL_LEVEL","hospital"."ID","hospital"."NAME","hospital"."ns1","hospital"."TEL","hospital"."specialcategory",' +
        // 個案
        '"REPORT","GENDER_DESC","SICK_AGE",' +
        //隱藏期
        '"REPORT_DATE","TRAVEL_DATETO","TRAVEL2_DATETO","TRAVEL3_DATETO",' +
        // '"REPORT_DATE",' +
        // '"DIAGNOSE_DATE",' +
        '"SICK_DATE"' +
        ' FROM "dws_report_dengue_gis"' +
        ' LEFT JOIN "hospital"' +
        ' ON "dws_report_dengue_gis"."REPORT_HOSPITAL"="hospital"."ID"' +
        ' LEFT JOIN "DIM_TOWN_C"' +
        ' ON "hospital"."COUNTY"="DIM_TOWN_C"."COUNTY_ID" AND "hospital"."TOWN"="DIM_TOWN_C"."TOWN_ID"' +
        ' WHERE "hospital"."lon" IS NOT NULL AND "hospital"."lat" IS NOT NULL' +
        ' AND "DISEASE" IN (\'061\', \'0654\')'

    var sqlParameter = []
    var date_start;
    var date_end;
    var date_column = "SICK_DATE";
    var items_city = [];
    var items_category = [];
    var items_ns1 = [];
    var items_hidden = [];
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
                sqlParameter.push(date_start);
                strSql += ' AND "' + date_column + '" >= $' + sqlParameter.length;
            }
        }
        if (req.body.end) {
            date_end = new Date(req.body.end)
            if (!isNaN(date_end.getTime())) {
                date_end = new Date(date_end.getFullYear(), date_end.getMonth(), date_end.getDate() + 1)
                sqlParameter.push(date_end);
                strSql += ' AND "' + date_column + '" < $' + sqlParameter.length;
            }
        }
        //診斷/確診
        if (req.body.medical_static_determine) {
            var items = req.body.medical_static_determine.split('&')
            if (items.indexOf('診斷中個案') >= 0) {
                strSql += ' AND "DETERMINED_STATUS" = 0';
            } else if (items.indexOf('確診個案') >= 0) {
                strSql += ' AND "DETERMINED_STATUS" = 5';
            } else {
                strSql += ' AND "DETERMINED_STATUS" IN (0,5)';
            }
        }
        // 城市
        if (req.body.city) {
            items_city = req.body.city.split(',')
            if (items_city.length == 1) {
                sqlParameter.push(items_city[0]);
                strSql += ' AND "COUNTY_NAME" = $' + sqlParameter.length;
            } else if (items_city.length == 2) {
                sqlParameter.push(items_city[0]);
                strSql += ' AND "COUNTY_NAME" = $' + sqlParameter.length;
                sqlParameter.push(items_city[1]);
                strSql += ' AND "TOWN_NAME" = $' + sqlParameter.length;
            }
        }
        if (req.body.category && req.body.category.length > 0) {
            items_category = req.body.category.split('&')
            if (items_category.length > 0) {
                var strSqlCategory = '';
                if (items_category.indexOf('醫學中心') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('1');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('區域醫院') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('2');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('地區醫院') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('3');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('診所') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('4');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('藥局') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('5');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('居家護理') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('6');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('康復之家') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('7');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('助產所') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('8');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('檢驗所') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('9');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('物理治療所') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('A');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('特約醫事放射機構') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('B');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                if (items_category.indexOf('不詳') >= 0) {
                    if (strSqlCategory.length != 0) {
                        strSqlCategory += ' OR ';
                    }
                    sqlParameter.push('X');
                    strSqlCategory += 'hospital."specialcategory"=$' + sqlParameter.length;
                }
                strSql += ' AND (' + strSqlCategory + ')'
            }
        }
        if (req.body.ns1 && req.body.ns1.length > 0) {
            items_ns1 = req.body.ns1.split('&');
            if (items_ns1.indexOf('是') >= 0 && items_ns1.indexOf('否') >= 0) {

            } else if (items_ns1.indexOf('是') >= 0) {
                sqlParameter.push('1');
                strSql += ' AND hospital."ns1" = $' + sqlParameter.length;
            } else if (items_ns1.indexOf('否') >= 0) {
                strSql += ' AND hospital."ns1" IS NULL';
            }
        }
    }
    strSql += ' ORDER BY "' + date_column + '"'
    client.query(strSql, sqlParameter, function (err, row) {
        if (err) {
            console.log('err: ' + err)
        }
        client.end();
        // 先處理row 挑出未定位資料
        var tempRow = [];
        var tempNoLocateRow = [];
        row.rows.forEach(function (datarow) {
            if (datarow['lon'] && datarow['lon'] != 0 &&
                datarow['lat'] && datarow['lat'] != 0) {
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



        // var items_city = [];
        // var items_category = [];
        // var items_ns1 = [];
        // var items_hidden = [];

        // ['醫學中心', '區域醫院', '地區醫院', '診所', '藥局', '居家護理',
        //             '康復之家', '助產所', '檢驗所', '物理治療所', '特約醫事放射機構', '不詳'],
        //             item: [],
        //                 display: [],
        //                     query: null
        // },
        // ns1: {
        //     title: '提供快篩醫療機構',
        //         order: ['是', '否'],
        //             item: [],
        //                 display: [],
        //                     query: null
        // },
        // hidden: {
        //     title: '平均隱藏期',
        //         order: ['<= 3', '> 3'],

        // category
        resultAll.category = [];
        var typeCategory = ['醫學中心', '區域醫院', '地區醫院', '診所', '藥局', '居家護理', '康復之家', '助產所', '檢驗所', '物理治療所', '特約醫事放射機構', '不詳'];
        typeCategory.forEach(function(type){
            resultAll.category.push({
                type: type,
                count:0
            })
        });
        // 城市
        resultAll.city = [];
        var resultCityObject = {};
        // ns1
        resultAll.ns1 = [];
        resultAll.ns1[0] = {
            type: '是',
            count: 0
        }
        resultAll.ns1[1] = {
            type: '否',
            count: 0
        }
        // hidden
        resultAll.hidden = [];
        resultAll.hidden[0] = {
            type: '<= 3',
            count: 0
        }
        resultAll.hidden[1] = {
            type: '> 3',
            count: 0
        }
        
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

            // hidden
            if (report_days <= 3) {
                resultAll.hidden[0].count++;
            } else {
                resultAll.hidden[1].count++;
            }
            
            // category
            var category = datarow['specialcategory'];
            var dicCategory = {
                "1": "醫學中心",
                "2": "區域醫院",
                "3": "地區醫院",
                "4": "診所",
                "5": "藥局",
                "6": "居家護理",
                "7": "康復之家",
                "8": "助產所",
                "9": "檢驗所",
                "A": "物理治療所",
                "B": "特約醫事放射機構",
                "X": "不詳"
            }
            var strCategory = dicCategory[category] ? dicCategory[category]: "不詳";
            resultAll.category[typeCategory.indexOf(strCategory)].count++;
            // 城市
            var city = datarow['COUNTY_NAME'];
            if (items_city.length == 1) {
                city = datarow['COUNTY_NAME'] + ',' + datarow['TOWN_NAME'];
            } else if (items_city.length == 2) {
                city = datarow['COUNTY_NAME'] + ',' + datarow['TOWN_NAME'];
            }
            if (!resultCityObject[city]) {
                resultCityObject[city] = {
                    type: city,
                    count: 0
                }
            }
            resultCityObject[city].count++;
            // ns1
            var ns1 = (datarow['ns1'] && datarow['ns1'] == '1') ? 0 : 1;
            resultAll.ns1[ns1].count++;
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