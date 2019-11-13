// var pg = require('pg');
// var config = require('../../../../config');
// var connectionString = config.postgres;

// var express = require('express');
// const CachedFs = require('cachedfs');
// const fs = new CachedFs();
// var path = require('path')
// var router = express.Router();

// var turf = require('@turf/turf')
// const boundary_villages = geojson_boundary('village')
// function geojson_boundary(type) {
//     var jsonPath = path.join(__dirname, '..', '..', '..', '..', 'geojson', 'boundary_' + type + '.geojson');
//     var geojson = JSON.parse(fs.readFileSync(jsonPath))
//     return geojson
// }
// // 計算布氏指數
// function getBiLevel(point) {
//     if (point < 1) return 0;
//     else if (point < 5) return 1;
//     else if (point < 10) return 2;
//     else if (point < 20) return 3;
//     else if (point < 35) return 4;
//     else if (point < 50) return 5;
//     else if (point < 75) return 6;
//     else if (point < 100) return 7;
//     else if (point < 200) return 8;
//     else return 9;
// }
// // 計算住宅級數
// function getHouseLevel(point) {
//     if (point < 1) return 0;
//     else if (point < 4) return 1;
//     else if (point < 8) return 2;
//     else if (point < 18) return 3;
//     else if (point < 29) return 4;
//     else if (point < 38) return 5;
//     else if (point < 50) return 6;
//     else if (point < 60) return 7;
//     else if (point < 77) return 8;
//     else return 9;
// }
// // 計算容器級數
// function getContainerLevel(point) {
//     if (point < 1) return 0;
//     else if (point < 3) return 1;
//     else if (point < 6) return 2;
//     else if (point < 10) return 3;
//     else if (point < 15) return 4;
//     else if (point < 21) return 5;
//     else if (point < 28) return 6;
//     else if (point < 32) return 7;
//     else if (point < 41) return 8;
//     else return 9;
// }
// // 計算成蟲級數
// function getWormLevel(point) {
//     if (point < 1) return 0;
//     else if (point < 4) return 1;
//     else if (point < 11) return 2;
//     else if (point < 31) return 3;
//     else if (point < 101) return 4;
//     else if (point < 301) return 5;
//     else if (point < 1001) return 6;
//     else if (point < 3001) return 7;
//     else if (point < 10001) return 8;
//     else return 9;
// }
// // 週資料排序
// function reorderWeekLine(week_count) {
//     var week_line = [];
//     var result_temp = [];
//     Object.keys(week_count).forEach(function (year) {
//         Object.keys(week_count[year]).forEach(function (month) {
//             Object.keys(week_count[year][month]).forEach(function (week) {
//                 result_temp.push(week_count[year][month][week])
//             })
//         })
//     })
//     result_temp.sort(function (a, b) {
//         return a.id - b.id;
//     })
//     if (result_temp.length > 1) {
//         week_line.push(result_temp[0]);
//         var length = result_temp.length;
//         for (var x = 1; x < length; x++) {
//             if (result_temp[x].week == week_line[week_line.length - 1].week) {
//                 week_line[week_line.length - 1].count += result_temp[x].count;
//             } else {
//                 week_line.push(result_temp[x]);
//             }
//         }
//     } else {
//         week_line = result_temp;
//     }
//     // result = result_temp
//     var id_resort = 0;
//     week_line.forEach(function (obj) {
//         obj.id = id_resort++;
//     })

//     return week_line;
// };
// // 週次計算
// Date.prototype.getWeek = function () {
//     var target = new Date(this.valueOf());
//     var dayNr = (this.getDay() + 6) % 7;
//     target.setDate(target.getDate() - dayNr + 3);
//     var firstThursday = target.valueOf();
//     target.setMonth(0, 1);
//     if (target.getDay() != 4) {
//         target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
//     }
//     return 1 + Math.ceil((firstThursday - target) / 604800000);
// }

module.exports = {};