var misc = require('../../misc');

var pg = require('pg');
var config = require('../../../../config');
var connectionString = config.postgres;
var pgString = connectionString + config.db.cdczonegis;

// 病媒誘卵：搜尋儀表板
var query = function (req, res) {
    var client = new pg.Client(pgString);

    var strSqlVillages = 'SELECT "DIM_TOWN_C"."COUNTY_NAME" AS "city",' +
        '"DIM_TOWN_C"."TOWN_NAME" AS "dist",' +
        '"DIM_VILLAGE_C"."NAME" AS "village"' +
        ' FROM "DIM_TOWN_C"' +
        ' INNER JOIN "DIM_VILLAGE_C"' +
        ' ON "DIM_TOWN_C"."TOWN_ID" = "DIM_VILLAGE_C"."TOWN"' +
        ' ORDER BY city,dist,village';

    // 病媒蚊調查
    var strSqlMosquito = 'SELECT id,"COUNTY_NAME","TOWN_NAME","NAME" AS "VILLAGE_NAME",checkdate,isoweek,isoyear,' +
        ' p_household,c_household,p_container_amount,c_container_amount,get_cnt1,get_cnt2,get_cnt3,get_cnt4' +
        ' FROM "ic_mosquitoinfo"' +
        ' LEFT JOIN "DIM_TOWN_C"' +
        ' ON "ic_mosquitoinfo"."town" = "DIM_TOWN_C"."TOWN_ID"' +
        ' LEFT JOIN "DIM_VILLAGE_C"' +
        ' ON "ic_mosquitoinfo"."village" = "DIM_VILLAGE_C"."ID"' +
        ' WHERE 1=1'
    var sqlParamMosquito = [];

    // 誘卵桶
    var strSqlBucketRecordCal = 'SELECT * FROM "bucket_record_cal" WHERE 1=1';
    var sqlParamBucketRecordCal = [];

    var date_start;
    var date_end;
    var items_pest_static_check = [];
    var items_check_mosquito = [];
    var items_check_bucket = [];
    var items_city = [];
    var items_bi = [];
    var items_bucket_positive = [];
    var items_bucket_egg = [];
    if (req.body) {
        if (req.body.start) {
            date_start = new Date(req.body.start);
            if (!isNaN(date_start.getTime())) {
                date_start = new Date(date_start.getFullYear(), date_start.getMonth(), date_start.getDate());
                sqlParamMosquito.push(date_start);
                strSqlMosquito += ' AND ic_mosquitoinfo."checkdate" >= $' + sqlParamMosquito.length;
                sqlParamBucketRecordCal.push(date_start);
                strSqlBucketRecordCal += ' AND "starttime" >= $' + sqlParamBucketRecordCal.length;
            }
        }
        if (req.body.end) {
            date_end = new Date(req.body.end)
            if (!isNaN(date_end.getTime())) {
                date_end = new Date(date_end.getFullYear(), date_end.getMonth(), date_end.getDate() + 1);
                sqlParamMosquito.push(date_end);
                strSqlMosquito += ' AND ic_mosquitoinfo."checkdate" < $' + sqlParamMosquito.length;
                sqlParamBucketRecordCal.push(date_end);
                strSqlBucketRecordCal += ' AND "endtime" < $' + sqlParamBucketRecordCal.length;
            }
        }
        if (req.body.pest_static_check) {
            // 最近一次調查結果 / 平均調查結果
            items_pest_static_check = req.body.pest_static_check.split('&');
        }
        // 病媒
        if (req.body.bi && req.body.bi.length > 0) {
            items_bi = req.body.bi.split('&');
        }
        if (req.body.check_mosquito && req.body.check_mosquito.length > 0) {
            items_check_mosquito = req.body.check_mosquito.split('&');
        }
        // 誘卵桶
        if (req.body.bucket_positive && req.body.bucket_positive.length > 0) {
            items_bucket_positive = req.body.bucket_positive.split('&');
        }
        if (req.body.bucket_egg && req.body.bucket_egg.length > 0) {
            items_bucket_egg = req.body.bucket_egg.split('&');
        }
        if (req.body.check_bucket && req.body.check_bucket.length > 0) {
            items_check_bucket = req.body.check_bucket.split('&');
        }
        if (req.body.city) {
            items_city = req.body.city.split(',');
            if (items_city.length == 1) {
                sqlParamMosquito.push(items_city[0]);
                strSqlMosquito += ' AND "COUNTY_NAME" = $' + sqlParamMosquito.length;
                sqlParamBucketRecordCal.push(items_city[0]);
                strSqlBucketRecordCal += ' AND "city" = $' + sqlParamBucketRecordCal.length;
            } else if (items_city.length == 2) {
                console.log(items_city[0] + items_city[1]);
                sqlParamMosquito.push(items_city[0]);
                strSqlMosquito += ' AND "COUNTY_NAME" = $' + sqlParamMosquito.length;
                sqlParamMosquito.push(items_city[1]);
                strSqlMosquito += ' AND "TOWN_NAME" = $' + sqlParamMosquito.length;
                sqlParamBucketRecordCal.push(items_city[0]);
                strSqlBucketRecordCal += ' AND "city" = $' + sqlParamBucketRecordCal.length;
                sqlParamBucketRecordCal.push(items_city[1]);
                strSqlBucketRecordCal += ' AND "district" = $' + sqlParamBucketRecordCal.length;
            } else if (items_city.length == 3) {
                sqlParamMosquito.push(items_city[0]);
                strSqlMosquito += ' AND "COUNTY_NAME" = $' + sqlParamMosquito.length;
                sqlParamMosquito.push(items_city[1]);
                strSqlMosquito += ' AND "TOWN_NAME" = $' + sqlParamMosquito.length;
                sqlParamMosquito.push(items_city[2]);
                strSqlMosquito += ' AND "NAME" = $' + sqlParamMosquito.length;
                sqlParamBucketRecordCal.push(items_city[0]);
                strSqlBucketRecordCal += ' AND "city" = $' + sqlParamBucketRecordCal.length;
                sqlParamBucketRecordCal.push(items_city[1]);
                strSqlBucketRecordCal += ' AND "district" = $' + sqlParamBucketRecordCal.length;
                sqlParamBucketRecordCal.push(items_city[2]);
                strSqlBucketRecordCal += ' AND "village" = $' + sqlParamBucketRecordCal.length;
            }
        }
    }
    strSqlMosquito += " ORDER BY county,town,village,checkdate DESC;"
    strSqlBucketRecordCal += " ORDER BY city,district,village,starttime DESC;"
    client.connect();

    client.query(strSqlVillages, function (errVillages, rowVillages) {
        client.query(strSqlMosquito, sqlParamMosquito, function (errMosquito, rowMosquito) {
            client.query(strSqlBucketRecordCal, sqlParamBucketRecordCal, function (errBucketRecordCal, rowBucketRecordCal) {
                client.end();
                if (errVillages) {
                    console.log('errVillages: ' + errVillages);
                }
                if (errMosquito) {
                    console.log('errMosquito: ' + errMosquito);
                }
                if (errBucketRecordCal) {
                    console.log('errBucketRecordCal: ' + errBucketRecordCal);
                }

                var isAverage = true;
                if (items_pest_static_check.length == 1 && items_pest_static_check[0] == '最近一次調查結果') {
                    isAverage = false;
                }

                var objVillages = {};
                var arrayVillages = [];
                rowVillages.rows.forEach(function (datarow) {
                    var city = datarow['city'];
                    var dist = datarow['dist'];
                    var village = datarow['village'];
                    if ((city.indexOf('其') >= 0 && city.indexOf('他') >= 0) ||
                        (dist.indexOf('其') >= 0 && dist.indexOf('他') >= 0) ||
                        (village.indexOf('其') >= 0 && village.indexOf('他') >= 0)) {

                    } else {
                        if (!objVillages[city]) {
                            objVillages[city] = {};
                        }
                        if (!objVillages[city][dist]) {
                            objVillages[city][dist] = {};
                        }
                        if (!objVillages[city][dist][village]) {
                            objVillages[city][dist][village] = {
                                // 單筆資料
                                data_mosquito: [],
                                data_bucket: [],
                                // 日期？
                                checkdate: new Date(datarow['checkdate']),
                                // 病媒調查資料統計
                                c_household: 0, // 調查戶數
                                p_household: 0, // 陽性戶數
                                c_container_amount: 0, // 調查容器數
                                p_container_amount: 0, // 陽性容器數
                                worm_cnt: 0, // 雌蟲數

                                bi_point: 0, // 布氏指數
                                house_point: 0, // 住宅指數
                                container_point: 0, // 容器指數
                                worm_point: 0, // 成蟲指數

                                bi_level: 0, // 布氏級數
                                house_level: 0, // 住宅級數
                                container_level: 0, // 容器級數
                                worm_level: 0, // 成蟲級數
                                // 誘卵桶資料統計
                                positiverate: 0,
                                totaleggs: 0,

                                // 統計調查次數
                                count: 0,
                                count_mosquito: 0,
                                count_bucket: 0
                            };
                        }
                    }
                });

                var resultAll = {};

                // 病媒統計
                rowMosquito.rows.forEach(function (datarow) {
                    var city = datarow['COUNTY_NAME'];
                    var dist = datarow['TOWN_NAME'];
                    var village = datarow['VILLAGE_NAME'];
                    if ((objVillages[city] && objVillages[city][dist] && objVillages[city][dist][village]) &&
                        (isAverage || objVillages[city][dist][village].count_mosquito <= 0)) {
                        objVillages[city][dist][village].c_household += !isNaN(parseInt(datarow["c_household"])) ? parseInt(datarow["c_household"]) : 0;
                        objVillages[city][dist][village].p_household += !isNaN(parseInt(datarow["p_household"])) ? parseInt(datarow["p_household"]) : 0;
                        objVillages[city][dist][village].c_container_amount += !isNaN(parseInt(datarow["c_container_amount"])) ? parseInt(datarow["c_container_amount"]) : 0;
                        objVillages[city][dist][village].p_container_amount += !isNaN(parseInt(datarow["p_container_amount"])) ? parseInt(datarow["p_container_amount"]) : 0;
                        objVillages[city][dist][village].worm_cnt += parseInt(datarow["get_cnt1"]) + parseInt(datarow["get_cnt2"]) + parseInt(datarow["get_cnt3"]) + parseInt(datarow["get_cnt4"]);
                        objVillages[city][dist][village].count_mosquito++;
                        objVillages[city][dist][village].data_mosquito.push(datarow);
                    }
                });

                // 誘卵桶統計
                rowBucketRecordCal.rows.forEach(function (datarow) {
                    var city = datarow['city'];
                    var dist = datarow['district'];
                    var village = datarow['village'];

                    if (isAverage || (objVillages[city] && objVillages[city][dist] && objVillages[city][dist][village] &&
                            objVillages[city][dist][village].count_bucket <= 0)) {
                        objVillages[city][dist][village].positiverate += parseFloat(datarow["positiverate"]);
                        objVillages[city][dist][village].totaleggs += parseInt(datarow["totaleggs"]);
                        objVillages[city][dist][village].count_bucket++;
                        objVillages[city][dist][village].data_bucket.push(datarow);
                    }
                });

                // 計算
                Object.keys(objVillages).forEach(function (city) {
                    Object.keys(objVillages[city]).forEach(function (dist) {
                        Object.keys(objVillages[city][dist]).forEach(function (village) {
                            var objValues = objVillages[city][dist][village];
                            // bi 
                            if (objValues.c_household > 0) {
                                objVillages[city][dist][village].bi_point = Math.round(objValues.p_container_amount / objValues.c_household * 100);
                                objVillages[city][dist][village].bi_level = misc.getBiLevel(objVillages[city][dist][village].bi_point);
                            }
                            // house
                            if (objValues.c_household > 0) {
                                objVillages[city][dist][village].house_point = Math.round(objValues.p_household / objValues.c_household * 100);
                                objVillages[city][dist][village].house_level = misc.getHouseLevel(objVillages[city][dist][village].house_point);
                            }
                            // container
                            if (objValues.c_container_amount > 0) {
                                objVillages[city][dist][village].container_point = Math.round(objValues.p_container_amount / objValues.c_container_amount * 100);
                                objVillages[city][dist][village].container_level = misc.getContainerLevel(objVillages[city][dist][village].container_point);
                            }
                            // worm
                            if (objValues.c_household > 0) {
                                objVillages[city][dist][village].worm_point = Math.round(objValues.worm_cnt / objValues.c_household * 100);
                                objVillages[city][dist][village].worm_level = misc.getWormLevel(objVillages[city][dist][village].worm_point);
                            }

                            if (objValues.count_bucket > 0) {
                                // positive rate
                                objVillages[city][dist][village].positiverate /= objValues.count_bucket;
                                // total eggs
                                objVillages[city][dist][village].totaleggs /= objValues.count_bucket;
                            }
                        });
                    });
                });

                // 過濾資料
                var objVillagesKeep = {};
                Object.keys(objVillages).forEach(function (city) {
                    Object.keys(objVillages[city]).forEach(function (dist) {
                        Object.keys(objVillages[city][dist]).forEach(function (village) {
                            var objValues = objVillages[city][dist][village];
                            var isKeep = true;
                            if (items_check_mosquito.length > 0) {
                                var isKeepCheck = false;
                                items_check_mosquito.forEach(function (item) {
                                    switch (item) {
                                        case '有調查里別':
                                            if (objValues.count_mosquito > 0) {
                                                isKeepCheck = true;
                                            }
                                            break;
                                        case '無調查里別':
                                            if (objValues.count_mosquito <= 0) {
                                                isKeepCheck = true;
                                            }
                                            break;
                                    }
                                });
                                if (!isKeepCheck) {
                                    isKeep = false;
                                }
                            }
                            if (items_bi.length > 0) {
                                var isKeepBi = false;
                                items_bi.forEach(function (item) {
                                    switch (item) {
                                        case '未調查':
                                            if (objValues.count_mosquito > 0) {
                                                isKeepBi = true;
                                            }
                                            break;
                                        case '0級':
                                        case '1級':
                                        case '2級':
                                        case '3級':
                                        case '4級':
                                        case '5級':
                                        case '6級':
                                        case '7級':
                                        case '8級':
                                        case '9級':
                                            var level = parseInt(item.replace('級', ''));
                                            if (objValues.bi_level == level) {
                                                isKeepBi = true;
                                            }
                                            break;
                                    }
                                });
                                if (!isKeepBi) {
                                    isKeep = false;
                                }
                            }
                            if (items_check_bucket.length > 0) {
                                var isKeepCheck = false;
                                items_check_bucket.forEach(function (item) {
                                    switch (item) {
                                        case '有調查里別':
                                            if (objValues.count_bucket > 0) {
                                                isKeepCheck = true;
                                            }
                                            break;
                                        case '無調查里別':
                                            if (objValues.count_bucket <= 0) {
                                                isKeepCheck = true;
                                            }
                                            break;
                                    }
                                });
                                if (!isKeepCheck) {
                                    isKeep = false;
                                }
                            }
                            if (items_bucket_positive.length > 0) {
                                var isKeepPositive = false;
                                items_bucket_positive.forEach(function (item) {
                                    switch (item) {
                                        case '未調查':
                                            if (objValues.count_bucket <= 0) {
                                                isKeepPositive = true;
                                            }
                                            break;
                                        case '< 30%':
                                            if (objValues.positiverate < 30) {
                                                isKeepPositive = true;
                                            }
                                            break;
                                        case '30-59%':
                                            if (objValues.positiverate >= 30 && objValues.positiverate < 60) {
                                                isKeepPositive = true;
                                            }
                                            break;
                                        case '>= 60%':
                                            if (objValues.positiverate >= 60) {
                                                isKeepPositive = true;
                                            }
                                            break;
                                    }
                                });
                                if (!isKeepPositive) {
                                    isKeep = false;
                                }
                            }
                            if (items_bucket_egg.length > 0) {
                                var isKeepEgg = false;
                                items_bucket_egg.forEach(function (item) {
                                    switch (item) {
                                        case '未調查':
                                            if (objValues.count_bucket <= 0) {
                                                isKeepEgg = true;
                                            }
                                            break;
                                        case '< 250粒':
                                            if (objValues.totaleggs < 250) {
                                                isKeepEgg = true;
                                            }
                                            break;
                                        case '250-499粒':
                                            if (objValues.totaleggs >= 250 && objValues.totaleggs < 500) {
                                                isKeepEgg = true;
                                            }
                                            break;
                                        case '500粒以上':
                                            if (objValues.totaleggs >= 500) {
                                                isKeepEgg = true;
                                            }
                                            break;
                                    }
                                });
                                if (!isKeepEgg) {
                                    isKeep = false;
                                }
                            }
                            if (items_city.length > 0) {
                                var isKeepCity = false;
                                if (items_city.length == 0) {
                                    isKeepCity = true;
                                } else if (items_city.length == 1) {
                                    if (city == items_city[0]) {
                                        isKeepCity = true;
                                    }
                                } else if (items_city.length == 2) {
                                    if (city == items_city[0] && dist == items_city[1]) {
                                        isKeepCity = true;
                                    }
                                } else if (items_city.length == 3) {
                                    if (city == items_city[0] && dist == items_city[1] && village == items_city[2]) {
                                        isKeepCity = true;
                                    }
                                }
                                if (!isKeepCity) {
                                    isKeep = false;
                                }
                            }

                            if (isKeep) {
                                if (!objVillagesKeep[city]) {
                                    objVillagesKeep[city] = {};
                                }
                                if (!objVillagesKeep[city][dist]) {
                                    objVillagesKeep[city][dist] = {};
                                }
                                if (!objVillagesKeep[city][dist][village]) {
                                    objVillagesKeep[city][dist][village] = objValues;
                                }
                                // 最後塞進array
                                arrayVillages.push(objValues);
                            }
                        });
                    });
                });

                var itemList_checkMosquito = ["有調查里別", "無調查里別"];
                var itemList_bi = ['未調查', '0級', '1級', '2級', '3級', '4級', '5級', '6級', '7級', '8級', '9級'];
                var itemList_checkBucket = ["有調查里別", "無調查里別"];
                var itemList_positiverate = ["未調查", "< 30%", "30-59%", ">= 60%"];
                var itemList_totaleggs = ["未調查", "< 250粒", "250-499粒", "500粒以上"];
                resultAll.bi = [];
                itemList_bi.forEach(function (tag) {
                    resultAll.bi.push({
                        type: tag,
                        count: 0
                    });
                });
                resultAll.check_mosquito = [];
                itemList_checkMosquito.forEach(function (tag) {
                    resultAll.check_mosquito.push({
                        type: tag,
                        count: 0
                    });
                });
                resultAll.bucket_positive = [];
                itemList_positiverate.forEach(function (tag) {
                    resultAll.bucket_positive.push({
                        type: tag,
                        count: 0
                    });
                });
                resultAll.bucket_egg = [];
                itemList_totaleggs.forEach(function (tag) {
                    resultAll.bucket_egg.push({
                        type: tag,
                        count: 0
                    });
                });
                resultAll.check_bucket = [];
                itemList_checkBucket.forEach(function (tag) {
                    resultAll.check_bucket.push({
                        type: tag,
                        count: 0
                    });
                });
                arrayVillages.forEach(function (objValue) {
                    // 有無調查 mosquito
                    if (objValue.count_mosquito > 0) {
                        resultAll.check_mosquito[0].count++;
                        // bi
                        resultAll.bi[objValue.bi_level + 1].count++;
                    } else {
                        resultAll.check_mosquito[1].count++;
                        resultAll.bi[0].count++;
                    }
                    // 有無調查 bucket
                    if (objValue.count_bucket > 0) {
                        resultAll.check_bucket[0].count++;
                        // positive
                        if (objValue.positiverate < 30) {
                            resultAll.bucket_positive[1].count++;
                        } else if (objValue.positiverate < 60) {
                            resultAll.bucket_positive[2].count++;
                        } else {
                            resultAll.bucket_positive[3].count++;
                        }
                        // egg
                        if (objValue.totaleggs < 250) {
                            resultAll.bucket_egg[1].count++;
                        } else if (objValue.totaleggs < 500) {
                            resultAll.bucket_egg[2].count++;
                        } else {
                            resultAll.bucket_egg[3].count++;
                        }
                    } else {
                        resultAll.check_bucket[1].count++;
                        resultAll.bucket_positive[0].count++;
                        resultAll.bucket_egg[0].count++;
                    }
                });

                // 調查地區
                resultAll.city = [];
                var resultCityObject = {};
                Object.keys(objVillagesKeep).forEach(function (city) {
                    Object.keys(objVillagesKeep[city]).forEach(function (dist) {
                        Object.keys(objVillagesKeep[city][dist]).forEach(function (village) {
                            var cityObj = city;
                            if (items_city.length == 1) {
                                cityObj = city + ',' + dist;
                            } else if (items_city.length == 2) {
                                cityObj = city + ',' + dist + ',' + village;
                            } else if (items_city.length == 3) {
                                cityObj = city + ',' + dist + ',' + village;
                            }
                            if (!resultCityObject[cityObj]) {
                                resultCityObject[cityObj] = {
                                    type: cityObj,
                                    count: 0
                                }
                            }
                            resultCityObject[cityObj].count++;
                        });
                    });
                });
                Object.keys(resultCityObject).forEach(function (city) {
                    resultAll.city.push(resultCityObject[city])
                })
                resultAll.city.sort(function (a, b) {
                    return b.count - a.count
                })

                // ================ 週次統計曲線圖 ================
                // 週次統計初始化
                resultAll.week_line = [];
                var week_count = {};
                resultAll.week_bucket = [];
                var week_count_bucket = {};
                resultAll.week_bucket_egg = [];
                var week_count_bucket_egg = {};

                var d_s = date_start;
                var d_e = date_end;
                var count_day = (d_e.getTime() - d_s.getTime()) / (1000 * 60 * 60 * 24);
                // 建立week_count,week_count_bucket,week_count_bucket_egg
                for (var x = 0; x <= count_day; x++) {
                    var date = new Date(d_s.getFullYear(), d_s.getMonth(), d_s.getDate() + x);
                    // var year = date.getFullYear();
                    // var month = date.getMonth();
                    var week = date.getWeek();
                    var week_id = date.getDateofWeekStart().getTime();

                    week_count[week_id] = {
                        id: date.getDateofWeekStart().getTime(),
                        week: week,
                        count: 0,
                        totalCount: 0
                    };

                    week_count_bucket[week_id] = {
                        id: date.getDateofWeekStart().getTime(),
                        week: week,
                        count: 0,
                        totalCount: 0
                    };

                    week_count_bucket_egg[week_id] = {
                        id: date.getDateofWeekStart().getTime(),
                        week: week,
                        count: 0,
                        totalCount: 0
                    };
                }
                // 布氏指數3級以上
                rowMosquito.rows.forEach(function (datarow) {
                    var bi_point = Math.round(parseInt(datarow['p_container_amount']) / parseInt(datarow['c_household']) * 100);
                    var bi_level = misc.getBiLevel(bi_point);

                    var date = new Date(datarow['checkdate']);
                    var week = date.getWeek();
                    var week_id = date.getDateofWeekStart().getTime();
                    if (bi_level >= 3) {
                        week_count[week_id].count++;
                    }
                    week_count[week_id].totalCount++;
                });
                Object.keys(week_count).forEach(function (week_id) {
                    if (week_count[week_id].totalCount > 0) {
                        week_count[week_id].count =
                            week_count[week_id].count / week_count[week_id].totalCount * 100;
                    }
                });
                Object.keys(week_count).forEach(function (week_id) {
                    resultAll.week_line.push(week_count[week_id]);
                });
                resultAll.week_line.sort(function (a, b) {
                    return a.id - b.id;
                })
                // 誘卵桶陽性率
                rowBucketRecordCal.rows.forEach(function (datarow) {
                    var positiverate = parseInt(datarow['positiverate']);

                    var date = new Date(datarow['starttime']);
                    var week = date.getWeek();
                    var week_id = date.getDateofWeekStart().getTime();
                    week_count_bucket[week_id].count += positiverate;
                    week_count_bucket[week_id].totalCount++;
                });
                Object.keys(week_count_bucket).forEach(function (week_id) {
                    if (week_count_bucket[week_id].totalCount > 0) {
                        week_count_bucket[week_id].count =
                            Math.round(week_count_bucket[week_id].count / week_count_bucket[week_id].totalCount);
                    }
                });
                Object.keys(week_count_bucket).forEach(function (week_id) {
                    resultAll.week_bucket.push(week_count_bucket[week_id]);
                });
                resultAll.week_bucket.sort(function (a, b) {
                    return a.id - b.id;
                })
                // 誘卵桶總卵數
                rowBucketRecordCal.rows.forEach(function (datarow) {
                    var totaleggs = parseInt(datarow['totaleggs']);

                    var date = new Date(datarow['starttime']);
                    var week = date.getWeek();
                    var week_id = date.getDateofWeekStart().getTime();
                    week_count_bucket_egg[week_id].count += totaleggs;
                    week_count_bucket_egg[week_id].totalCount++;
                });
                Object.keys(week_count_bucket_egg).forEach(function (week_id) {
                    if (week_count_bucket_egg[week_id].totalCount > 0) {
                        week_count_bucket_egg[week_id].count =
                            Math.round(week_count_bucket_egg[week_id].count / week_count_bucket_egg[week_id].totalCount);
                    }
                });
                Object.keys(week_count_bucket_egg).forEach(function (week_id) {
                    resultAll.week_bucket_egg.push(week_count_bucket_egg[week_id]);
                });
                resultAll.week_bucket_egg.sort(function (a, b) {
                    return a.id - b.id;
                })
                resultAll.objVillages = objVillagesKeep;
                res.send(resultAll)
            });

        });
    });
}

// 週資料排序
function reorderWeekLine(week_count) {
    var week_line = [];
    var result_temp = [];
    Object.keys(week_count).forEach(function (year) {
        Object.keys(week_count[year]).forEach(function (month) {
            Object.keys(week_count[year][month]).forEach(function (week) {
                result_temp.push(week_count[year][month][week])
            })
        })
    })
    result_temp.sort(function (a, b) {
        return a.id - b.id;
    })
    if (result_temp.length > 1) {
        week_line.push(result_temp[0]);
        var length = result_temp.length;
        for (var x = 1; x < length; x++) {
            if (result_temp[x].week == week_line[week_line.length - 1].week) {
                week_line[week_line.length - 1].count += result_temp[x].count;
            } else {
                week_line.push(result_temp[x]);
            }
        }
    } else {
        week_line = result_temp;
    }
    // result = result_temp
    var id_resort = 0;
    week_line.forEach(function (obj) {
        obj.id = id_resort++;
    })

    return week_line;
};
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
Date.prototype.getDateofWeekStart = function () {
    var target = new Date(this.valueOf());
    target.setDate(target.getDate() - target.getDay());
    return target;
};

Date.prototype.yyyymmdd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd
    ].join('');
};

module.exports = {
    query
};