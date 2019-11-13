var pg = require('pg');
var config = require('../../../../config');
var connectionString = config.postgres;
var pgString = connectionString + config.db.cdczonegis;

// 病例群聚地圖點位
var points = function (req, res) {
    var client = new pg.Client(pgString);
    client.connect();

    // 先搜尋群聚個案，再搜尋所有個案並加入
    // 群聚 14天算2週 15天算3週

    var strSql = 'SELECT * FROM "dengue_cluster_info"' +
        ' WHERE "lon" IS NOT NULL AND "lat" IS NOT NULL';
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
                sqlParmeter.push(date_end);;
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
            items_remain = req.body.remain.split('&')
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
    strSql += ' ORDER BY "sickdate_first"'
    client.query(strSql, sqlParmeter, function (err_group, row_group) {
        if (err_group) { console.log('err_group: ' + err_group) }
        client.end();
        var count_id = 0;
        var result = {};
        result.type = 'FeatureCollection';
        result.features = [];
        console.log('row_group.rows.length: ' + row_group.rows.length);
        row_group.rows.forEach(function (obj) {
            obj.LON = obj.lon;
            obj.LAT = obj.lat;
            var geojson = {};
            geojson.type = 'Feature';
            geojson.geometry = {
                type: 'Point',
                coordinates: [
                    obj.LON,
                    obj.LAT
                ]
            };
            geojson.properties = obj;

            result['features'].push(geojson);
        });

        if (res) {
            res.send(result);
        } else {
            return result;
        }
    });
}

var polygons = function (req, res) {
    var client = new pg.Client(pgString);
    client.connect();

    // 先搜尋群聚個案，再搜尋所有個案並加入
    // 群聚 14天算2週 15天算3週

    var strSql = 'SELECT * FROM "dengue_cluster_info"' +
        ' WHERE "GeoJSON" IS NOT NULL';
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
                sqlParmeter.push(date_end);;
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
            items_remain = req.body.remain.split('&')
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
    strSql += ' ORDER BY "sickdate_first"'
    client.query(strSql, sqlParmeter, function (err_group, row_group) {
        if (err_group) { console.log('err_group: ' + err_group) }
        client.end();
        var count_id = 0;
        var result = {};
        result.type = 'FeatureCollection';
        result.features = [];

        var resultObj = {};
        row_group.rows.forEach(function (obj) {
            var geojson = obj.GeoJSON;
            if (obj.code1 && !resultObj[obj.code1]) {
                resultObj[obj.code1] = {};
                if (geojson.features && geojson.features.length > 0) {
                    geojson = geojson.features[0].geometry;
                }
                resultObj[obj.code1].geometry = geojson;
                resultObj[obj.code1].properties = {};
                resultObj[obj.code1].properties.closed = true;
                Object.keys(obj).forEach(function(column){
                    if (column != 'GeoJSON') {
                        resultObj[obj.code1].properties[column] = obj[column];
                    }
                })
            }
            // if (obj['closed'] != null) {
            //     if (!obj['closed']) {
            //         resultObj[geojson.name].properties.closed = false;
            //     }
            // }
        });

        Object.keys(resultObj).forEach(function (name) {
            result['features'].push(resultObj[name]);
        })

        if (res) {
            res.send(result);
        } else {
            return result;
        }
    });
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

module.exports = { points, polygons };