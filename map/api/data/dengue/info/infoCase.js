var geojsonBoundary = require('../../geojson');
var misc = require('../../misc');

var pg = require('pg');
var config = require('../../../../config');
var connectionString = config.postgres;
var pgString = connectionString + config.db.cdczonegis;

var turf = require('@turf/turf')

// InfoWindow：摘要
var summary = function (req, res) {}
// InfoWindow：地理資訊
var geo = function (req, res) {}
// InfoWindow：就醫
var hospital = function (req, res) {
    var client = new pg.Client(pgString);

    var strSql = 'SELECT "dws_report_dengue_gis"."REPORT","hospital"."ID","hospital"."NAME","hospital"."lon","hospital"."lat" FROM  "dws_report_dengue_gis"' +
        ' LEFT JOIN "dws_report_detail"' +
        ' ON "dws_report_dengue_gis"."REPORT" = "dws_report_detail"."REPORT"' +
        ' LEFT JOIN "hospital" ON "dws_report_detail"."REPORT_HOSPITAL" = "hospital"."ID"' +
        ' WHERE "dws_report_dengue_gis"."REPORT" = $1';
    var sqlParmeter = [req.body.report];
    client.connect();
    client.query(strSql, sqlParmeter, function (err, row) {
        client.end();
        var result = {};
        if (err) {
            console.log('err: ' + err)
            result.error = true;
            result.errorMessage = err;
        } else {
            result.data = row.rows;
        }
        res.send(result);
    });
}
// InfoWindow：環域分析
var area = function (req, res) {
    var client = new pg.Client(pgString);
    client.connect();

    // ['個案情形', '醫療院所/醫療資源', '最近一次布氏指數', '平均布氏指數']
    var date_start = new Date(req.body.date_start);
    date_start = new Date(date_start.getFullYear(), date_start.getMonth(), date_start.getDate());
    var date_end = new Date(req.body.date_end);
    date_end = new Date(date_end.getFullYear(), date_end.getMonth(), date_end.getDate() + 1);
    var points = req.body.points ? JSON.parse(req.body.points) : null;
    if (points) {
        if (req.body.point_type == '所有關聯點位') {

        }
    } else {
        points = [{
            lat: req.body.lat,
            lng: req.body.lng
        }]
    }
    switch (req.body.result_type) {
        case '個案情形':
            var strSql = 'SELECT "REPORT","SICK_DATE","GENDER_DESC","SICK_AGE","LON","LAT"' +
                ' FROM "dws_report_dengue_gis"' +
                ' WHERE "LON" >= $1 AND "LON" <= $2 AND "LAT" >= $3 AND "LAT" <= $4 AND "SICK_DATE" >= $5 AND "SICK_DATE" < $6 ORDER BY "SICK_DATE"';
            // console.log('date_end: ' + date_end)
            var sqlParmeter = [req.body.xmin, req.body.xmax, req.body.ymin, req.body.ymax, date_start, date_end];
            client.query(strSql, sqlParmeter, function (err, row) {
                if (err) {
                    console.log('err: ' + err)
                } else {
                    client.end();
                    var result = {};
                    result.type = 'FeatureCollection';
                    result.features = [];
                    row.rows.forEach(function (obj) {
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
                    var circle = getMultiCircle(points, req.body.distance);
                    // var circle = getCircle(req.body.lat, req.body.lng, req.body.distance);
                    var pointWithin = turf.pointsWithinPolygon(result, circle);

                    res.send(pointWithin);
                }
            });
            break;
        case '醫療院所/醫療資源':
            var strSql = 'SELECT "ID","AKA","TEL","lon","lat"' +
                ' FROM "hospital"' +
                ' WHERE "lon" >= $1 AND "lon" <= $2 AND "lat" >= $3 AND "lat" <= $4 ORDER BY "ID"';
            var sqlParmeter = [req.body.xmin, req.body.xmax, req.body.ymin, req.body.ymax];
            client.query(strSql, sqlParmeter, function (err, row) {
                if (err) {
                    console.log('err: ' + err)
                } else {
                    client.end();
                    var result = {};
                    result.type = 'FeatureCollection';
                    result.features = [];
                    row.rows.forEach(function (obj) {
                        var geojson = {};
                        geojson.type = 'Feature';
                        geojson.geometry = {
                            type: 'Point',
                            coordinates: [
                                obj.lon,
                                obj.lat
                            ]
                        };
                        geojson.properties = obj;
                        result['features'].push(geojson);
                    });
                    var circle = getMultiCircle(points, req.body.distance);
                    // var circle = getCircle(req.body.lat, req.body.lng, req.body.distance);
                    var pointWithin = turf.pointsWithinPolygon(result, circle);

                    res.send(pointWithin);
                }
            });
            break;
        case '最近一次布氏指數':
            var result = {
                "type": "FeatureCollection",
                "crs": {
                    "type": "name",
                    "properties": {
                        "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
                    }
                },
                features: []
            }
            var q_county = [];
            var q_town = [];
            var q_village = [];
            var circle = getMultiCircle(points, req.body.distance);
            // var circle = getCircle(req.body.lat, req.body.lng, req.body.distance);
            geojsonBoundary.boundaryVillages.features.forEach(function (feature) {
                var intersects = [];
                if (feature.geometry.type == 'MultiPolygon') {
                    feature.geometry.coordinates.forEach(function (coord) {
                        try {
                            var polygon = turf.polygon(coord);
                            var intersect = turf.intersect(polygon, circle);
                            if (intersect) {
                                // console.log(feature.properties.COUNTYNAME + feature.properties.COUNTYNAME + feature.properties.VILLNAME)
                                intersects.push(intersect);
                                if (q_county.indexOf(feature.properties.COUNTYNAME) < 0) {
                                    q_county.push(feature.properties.COUNTYNAME);
                                }
                                if (q_town.indexOf(feature.properties.TOWNNAME) < 0) {
                                    q_town.push(feature.properties.TOWNNAME);
                                }
                                if (q_village.indexOf(feature.properties.VILLNAME) < 0) {
                                    q_village.push(feature.properties.VILLNAME);
                                }
                            } else {

                            }
                        } catch (err) {

                        }
                    })
                } else if (feature.geometry.type == 'Polygon') {
                    try {
                        var intersect = turf.intersect(feature.geometry, circle);
                        if (intersect) {
                            console.log(feature.properties.COUNTYNAME + feature.properties.COUNTYNAME + feature.properties.VILLNAME)
                            intersects.push(intersect);
                            if (q_county.indexOf(feature.properties.COUNTYNAME) < 0) {
                                q_county.push(feature.properties.COUNTYNAME);
                            }
                            if (q_town.indexOf(feature.properties.TOWNNAME) < 0) {
                                q_town.push(feature.properties.TOWNNAME);
                            }
                            if (q_village.indexOf(feature.properties.VILLNAME) < 0) {
                                q_village.push(feature.properties.VILLNAME);
                            }
                        } else {

                        }
                    } catch (err) {

                    }
                }
                if (intersects.length > 0) {
                    var feature_clone = JSON.parse(JSON.stringify(feature));
                    feature_clone.geometry.type = 'MultiPolygon';
                    feature_clone.geometry.coordinates = [];
                    intersects.forEach(function (intersect) {
                        if (intersect.geometry.type == 'Polygon') {
                            feature_clone.geometry.coordinates.push(intersect.geometry.coordinates);
                        } else if (intersect.geometry.type == 'MultiPolygon') {
                            intersect.geometry.coordinates.forEach(function (coord) {
                                feature_clone.geometry.coordinates.push(coord);
                            })
                        }
                    })
                    result.features.push(feature_clone);
                }
            })
            var strSql = 'SELECT id, "COUNTY_NAME", "TOWN_NAME", "NAME" AS "VILLAGE_NAME", checkdate, isoweek, isoyear, p_container_amount, c_household, exponent, series' +
                ' FROM "ic_mosquitoinfo"' +
                ' LEFT JOIN "DIM_TOWN_C"' +
                ' ON "ic_mosquitoinfo"."town" = "DIM_TOWN_C"."TOWN_ID"' +
                ' LEFT JOIN "DIM_VILLAGE_C"' +
                ' ON "ic_mosquitoinfo"."village" = "DIM_VILLAGE_C"."ID"' +
                ' WHERE "checkdate" >= $1 AND "checkdate" < $2'
            var sqlParmeter = [date_start, date_end]
            if (q_county.length > 0) {
                var strCounty = '';
                q_county.forEach(function (county) {
                    if (strCounty.length != 0) {
                        strCounty += ',';
                    }
                    sqlParmeter.push(county);
                    strCounty += '$' + sqlParmeter.length;
                })
                strSql += ' AND "COUNTY_NAME" IN (' + strCounty + ')';
            }
            if (q_town.length > 0) {
                var strTown = '';
                q_town.forEach(function (town) {
                    if (strTown.length != 0) {
                        strTown += ',';
                    }
                    sqlParmeter.push(town);
                    strTown += '$' + sqlParmeter.length;
                })
                strSql += ' AND "TOWN_NAME" IN (' + strTown + ')';
            }
            if (q_village.length > 0) {
                var strVillage = '';
                q_village.forEach(function (village) {
                    if (strVillage.length != 0) {
                        strVillage += ',';
                    }
                    sqlParmeter.push(village);
                    strVillage += '$' + sqlParmeter.length;
                })
                strSql += ' AND "NAME" IN (' + strVillage + ')';
            }
            strSql += ' ORDER BY "COUNTY_NAME", "TOWN_NAME", "NAME", "checkdate" DESC';
            client.query(strSql, sqlParmeter, function (err, row) {
                if (err) {
                    console.log(err);
                }
                client.end();
                var pointObj = {};
                row.rows.forEach(function (datarow) {
                    datarow["checkdate"] = new Date(datarow["checkdate"]).toLocaleDateString();
                    if (!pointObj[datarow["COUNTY_NAME"]]) {
                        pointObj[datarow["COUNTY_NAME"]] = {};
                    }
                    if (!pointObj[datarow["COUNTY_NAME"]][datarow["TOWN_NAME"]]) {
                        pointObj[datarow["COUNTY_NAME"]][datarow["TOWN_NAME"]] = {};
                    }
                    if (!pointObj[datarow["COUNTY_NAME"]][datarow["TOWN_NAME"]][datarow["VILLAGE_NAME"]]) {
                        pointObj[datarow["COUNTY_NAME"]][datarow["TOWN_NAME"]][datarow["VILLAGE_NAME"]] = {};
                    }
                    if (!pointObj[datarow["COUNTY_NAME"]][datarow["TOWN_NAME"]][datarow["VILLAGE_NAME"]][datarow["checkdate"]]) {
                        pointObj[datarow["COUNTY_NAME"]][datarow["TOWN_NAME"]][datarow["VILLAGE_NAME"]][datarow["checkdate"]] = {
                            containers: 0,
                            households: 0,
                        }
                    }
                    var objCheck = pointObj[datarow["COUNTY_NAME"]][datarow["TOWN_NAME"]][datarow["VILLAGE_NAME"]][datarow["checkdate"]];
                    objCheck.containers += parseInt(datarow["p_container_amount"]);
                    objCheck.households += parseInt(datarow["c_household"]);
                })
                result.features.forEach(function (feature) {
                    // geometry: {
                    //     type: "MultiPolygon",
                    //     coordinates: Array(1)
                    // }
                    // properties: {
                    //     COUNTY_ID: "10013",
                    //     VILLAGE_ID: "016",
                    //     VILLAGE: "船頭里",
                    //     COUNTY: "屏東縣",
                    //     TOWN: "東港鎮",
                    //     …
                    // }
                    // type: "Feature"


                    if (pointObj[feature.properties["COUNTYNAME"]] &&
                        pointObj[feature.properties["COUNTYNAME"]][feature.properties["TOWNNAME"]] &&
                        pointObj[feature.properties["COUNTYNAME"]][feature.properties["TOWNNAME"]][feature.properties["VILLNAME"]]) {
                        // console.log(feature.properties["COUNTY"] + feature.properties["TOWN"] + feature.properties["VILLAGE"])
                        var obj = pointObj[feature.properties["COUNTYNAME"]][feature.properties["TOWNNAME"]][feature.properties["VILLNAME"]];
                        var date_max = '';
                        Object.keys(obj).forEach(function (strDate) {
                            if (strDate > date_max) {
                                date_max = strDate;
                            }
                        })
                        if (date_max && date_max.length > 0 && obj[date_max] && obj[date_max].households != 0) {
                            feature.properties['checkdate'] = new Date(date_max);
                            feature.properties['bi_point'] = Math.round(obj[date_max].containers / (obj[date_max].households / 100));
                            feature.properties['bi_level'] = misc.getBiLevel(feature.properties['bi_point']);
                            feature.properties['bi_hasdata'] = true;
                        }
                    } else {
                        feature.properties['bi_hasdata'] = false;
                    }
                })
                res.send(result);
            })
            break;
        case '平均布氏指數':
            var result = {
                "type": "FeatureCollection",
                "crs": {
                    "type": "name",
                    "properties": {
                        "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
                    }
                },
                features: []
            }
            var q_county = [];
            var q_town = [];
            var q_village = [];
            var circle = getMultiCircle(points, req.body.distance);
            // var circle = getCircle(req.body.lat, req.body.lng, req.body.distance);
            // var  
            geojsonBoundary.boundaryVillages.features.forEach(function (feature) {
                var intersects = [];
                if (feature.geometry.type == 'MultiPolygon') {
                    feature.geometry.coordinates.forEach(function (coord) {
                        try {
                            var polygon = turf.polygon(coord);
                            var intersect = turf.intersect(polygon, circle);
                            if (intersect) {
                                // console.log(feature.properties.COUNTYNAME + feature.properties.COUNTYNAME + feature.properties.VILLNAME)
                                intersects.push(intersect)
                                if (q_county.indexOf(feature.properties.COUNTYNAME) < 0) {
                                    q_county.push(feature.properties.COUNTYNAME);
                                }
                                if (q_town.indexOf(feature.properties.TOWNNAME) < 0) {
                                    q_town.push(feature.properties.TOWNNAME);
                                }
                                if (q_village.indexOf(feature.properties.VILLNAME) < 0) {
                                    q_village.push(feature.properties.VILLNAME);
                                }
                            } else {

                            }
                        } catch (err) {

                        }
                    })
                } else if (feature.geometry.type == 'Polygon') {
                    try {
                        var intersect = turf.intersect(feature.geometry, circle)
                        if (intersect) {
                            console.log(feature.properties.COUNTYNAME + feature.properties.COUNTYNAME + feature.properties.VILLNAME)
                            intersects.push(intersect)
                            if (q_county.indexOf(feature.properties.COUNTYNAME) < 0) {
                                q_county.push(feature.properties.COUNTYNAME);
                            }
                            if (q_town.indexOf(feature.properties.TOWNNAME) < 0) {
                                q_town.push(feature.properties.TOWNNAME);
                            }
                            if (q_village.indexOf(feature.properties.VILLNAME) < 0) {
                                q_village.push(feature.properties.VILLNAME);
                            }
                        } else {

                        }
                    } catch (err) {

                    }
                }
                if (intersects.length > 0) {
                    var feature_clone = JSON.parse(JSON.stringify(feature));
                    feature_clone.geometry.type = 'MultiPolygon';
                    feature_clone.geometry.coordinates = [];
                    intersects.forEach(function (intersect) {
                        if (intersect.geometry.type == 'Polygon') {
                            feature_clone.geometry.coordinates.push(intersect.geometry.coordinates);
                        } else if (intersect.geometry.type == 'MultiPolygon') {
                            intersect.geometry.coordinates.forEach(function (coord) {
                                feature_clone.geometry.coordinates.push(coord);
                            })
                        }
                    })
                    result.features.push(feature_clone);
                }
            })
            var strSql = 'SELECT id, "COUNTY_NAME", "TOWN_NAME", "NAME" AS "VILLAGE_NAME", checkdate, isoweek, isoyear, p_container_amount, c_household, exponent, series' +
                ' FROM "ic_mosquitoinfo"' +
                ' LEFT JOIN "DIM_TOWN_C"' +
                ' ON "ic_mosquitoinfo"."town" = "DIM_TOWN_C"."TOWN_ID"' +
                ' LEFT JOIN "DIM_VILLAGE_C"' +
                ' ON "ic_mosquitoinfo"."village" = "DIM_VILLAGE_C"."ID"' +
                ' WHERE "checkdate" >= $1 AND "checkdate" < $2';
            var sqlParmeter = [date_start, date_end];
            if (q_county.length > 0) {
                var strCounty = '';
                q_county.forEach(function (county) {
                    if (strCounty.length != 0) {
                        strCounty += ',';
                    }
                    sqlParmeter.push(county);
                    strCounty += '$' + sqlParmeter.length;
                })
                strSql += ' AND "COUNTY_NAME" IN (' + strCounty + ')';
            }
            if (q_town.length > 0) {
                var strTown = '';
                q_town.forEach(function (town) {
                    if (strTown.length != 0) {
                        strTown += ',';
                    }
                    sqlParmeter.push(town);
                    strTown += '$' + sqlParmeter.length;
                })
                strSql += ' AND "TOWN_NAME" IN (' + strTown + ')';
            }
            if (q_village.length > 0) {
                var strVillage = '';
                q_village.forEach(function (village) {
                    if (strVillage.length != 0) {
                        strVillage += ',';
                    }
                    sqlParmeter.push(village);
                    strVillage += '$' + sqlParmeter.length;
                })
                strSql += ' AND "NAME" IN (' + strVillage + ')';
            }
            strSql += ' ORDER BY "COUNTY_NAME", "TOWN_NAME", "NAME", "checkdate"';
            client.query(strSql, sqlParmeter, function (err, row) {
                if (err) {
                    console.log(err);
                }
                client.end();
                var pointObj = {};
                row.rows.forEach(function (datarow) {
                    datarow["checkdate"] = new Date(datarow["checkdate"]).toLocaleDateString();
                    if (!pointObj[datarow["COUNTY_NAME"]]) {
                        pointObj[datarow["COUNTY_NAME"]] = {};
                    }
                    if (!pointObj[datarow["COUNTY_NAME"]][datarow["TOWN_NAME"]]) {
                        pointObj[datarow["COUNTY_NAME"]][datarow["TOWN_NAME"]] = {};
                    }
                    if (!pointObj[datarow["COUNTY_NAME"]][datarow["TOWN_NAME"]][datarow["VILLAGE_NAME"]]) {
                        pointObj[datarow["COUNTY_NAME"]][datarow["TOWN_NAME"]][datarow["VILLAGE_NAME"]] = {};
                    }
                    if (!pointObj[datarow["COUNTY_NAME"]][datarow["TOWN_NAME"]][datarow["VILLAGE_NAME"]][datarow["checkdate"]]) {
                        pointObj[datarow["COUNTY_NAME"]][datarow["TOWN_NAME"]][datarow["VILLAGE_NAME"]][datarow["checkdate"]] = {
                            containers: 0,
                            households: 0,
                        }
                    }
                    var objCheck = pointObj[datarow["COUNTY_NAME"]][datarow["TOWN_NAME"]][datarow["VILLAGE_NAME"]][datarow["checkdate"]];
                    objCheck.containers += parseInt(datarow["p_container_amount"]);
                    objCheck.households += parseInt(datarow["c_household"]);
                })
                result.features.forEach(function (feature) {
                    // geometry: {
                    //     type: "MultiPolygon",
                    //     coordinates: Array(1)
                    // }
                    // properties: {
                    //     COUNTY_ID: "10013",
                    //     VILLAGE_ID: "016",
                    //     VILLAGE: "船頭里",
                    //     COUNTY: "屏東縣",
                    //     TOWN: "東港鎮",
                    //     …
                    // }
                    // type: "Feature"

                    feature.properties['bi_hasdata'] = false
                    if (pointObj[feature.properties["COUNTYNAME"]] &&
                        pointObj[feature.properties["COUNTYNAME"]][feature.properties["TOWNNAME"]] &&
                        pointObj[feature.properties["COUNTYNAME"]][feature.properties["TOWNNAME"]][feature.properties["VILLNAME"]]) {
                        // console.log(feature.properties["COUNTY"] + feature.properties["TOWN"] + feature.properties["VILLAGE"])
                        var obj = pointObj[feature.properties["COUNTYNAME"]][feature.properties["TOWNNAME"]][feature.properties["VILLNAME"]];
                        if (Object.keys(obj).length > 0) {
                            feature.properties['bi_hasdata'] = true;
                            var totalContainers = 0;
                            var totalHouseholds = 0;
                            feature.properties['checkdate'] = [];
                            feature.properties['bi_level'] = [];
                            Object.keys(obj).forEach(function (strDate) {
                                totalContainers += obj[strDate].containers;
                                totalHouseholds += obj[strDate].households;
                            })
                            feature.properties['checkdate'].push('平均');
                            feature.properties['bi_level'].push(totalHouseholds > 0 ? misc.getBiLevel(Math.round(totalContainers / (totalHouseholds / 100))) : 0);
                            Object.keys(obj).forEach(function (strDate) {
                                feature.properties['checkdate'].push(new Date(strDate));
                                feature.properties['bi_level'].push(misc.getBiLevel(Math.round(obj[strDate].containers / (obj[strDate].households / 100))));
                            })
                        }
                    }
                })
                res.send(result);
            })
            break;
        case '高風險農園':
            var strSql = 'SELECT * FROM "vegetable_garden"' +
                ' WHERE "Longitude" >= $1 AND "Longitude" <= $2 AND "Latitude" >= $3 AND "Latitude" <= $4';
            // console.log('date_end: ' + date_end)
            var sqlParmeter = [req.body.xmin, req.body.xmax, req.body.ymin, req.body.ymax];
            client.query(strSql, sqlParmeter, function (err, row) {
                if (err) {
                    console.log('err: ' + err)
                } else {
                    client.end();
                    var result = {};
                    result.type = 'FeatureCollection';
                    result.features = [];
                    row.rows.forEach(function (obj) {
                        var geojson = {};
                        geojson.type = 'Feature';
                        geojson.geometry = {
                            type: 'Point',
                            coordinates: [
                                obj.Longitude,
                                obj.Latitude
                            ]
                        };
                        geojson.properties = obj;
                        result['features'].push(geojson);
                    });
                    var circle = getMultiCircle(points, req.body.distance);
                    // var circle = getCircle(req.body.lat, req.body.lng, req.body.distance);
                    var pointWithin = turf.pointsWithinPolygon(result, circle);

                    res.send(pointWithin);
                }
            });
            break;
    }

    function getExtent(lat, lng, distance) {
        var point = turf.point([lng, lat]);
        var options = {
            units: 'kilometers'
        };

        var pointTop = turf.destination(point, distance / 1000, 0, options);
        var pointRight = turf.destination(point, distance / 1000, 90, options);
        var pointDown = turf.destination(point, distance / 1000, 180, options);
        var pointLeft = turf.destination(point, distance / 1000, 270, options);

        var ymax = pointTop.geometry.coordinates[1];
        var xmax = pointRight.geometry.coordinates[0];
        var ymin = pointDown.geometry.coordinates[1];
        var xmin = pointLeft.geometry.coordinates[0];

        return {
            xmin: xmin,
            xmax: xmax,
            ymin: ymin,
            ymax: ymax
        }
    }

    function getCircle(lat, lng, distance) {
        var center = [lng, lat];
        var radius = distance / 1000;
        var options = {
            steps: 256,
            units: 'kilometers',
            properties: {}
        }

        return turf.circle(center, radius, options);
    }

    function getMultiCircle(latlngs, distance) {
        var circles = [];
        latlngs.forEach(function (latlng) {
            circles.push(getCircle(latlng.lat, latlng.lng, distance));
        })
        for (var i = 1; i < circles.length; i++) {
            circles[0] = turf.union(circles[0], circles[i]);
        }

        return circles.length > 0 ? circles[0] : null;
    }
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
    summary,
    geo,
    hospital,
    area
};