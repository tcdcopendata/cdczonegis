G = {};
G.apiUrl = '/data/' + LanguageValue.LanguageCode + '/';
G.util = {
    //移除字串, remove可為string or string array
    remove: function(target, remove) {
        var string;
        if (typeof remove === "string") {
            string = target.replace(remove, "");
        } else {
            string = target;
            remove.forEach(function(r) {
                string = string.replace(r, "");
            });
        }
        return string;
    },

    //判斷字串是否包含key, key可為string or string array
    contain: function(target, key, lowerCase) {
        var contain;
        if (lowerCase) {
            if (typeof target === "string") {
                contain = target.toLowerCase().indexOf(key) !== -1;
            } else {
                contain = false;
                target.forEach(function(t) {
                    contain = contain || t.toLowerCase() === key;
                });
            }
        } else {
            contain = target.indexOf(key) !== -1;
        }
        return contain;
    },

    //取得字串中的數字
    number: function(target) {
        return target.match(/\d+/g).join('');
    },

    numberWithCommas: function(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    removeNumber: function(target) {
        return target.replace(/\d+/g, '');
    },

    //target的foreach, 可用於dom array foreach
    each: function(target, callback) {
        [].forEach.call(target, callback);
    },

    getFileExtension: function(name) {
        var temp = name.split('.');
        return temp[temp.length - 1];
    },

    getRandomId: function() {
        var random = Math.random().toString();
        return G.util.remove(random, '0.');
    },


    bboxContainsPoint: function(p, bbox) {
        return bbox[0] <= p.x && p.x <= bbox[2] && bbox[1] <= p.y && p.y <= bbox[3];
    },

    //leaflet.js
    circleContainsPoint: function(p, geometry, radius, weight, stroke) {
        var center = L.point(geometry[0]),
            w2 = stroke ? weight / 2 : 0;

        return (p.distanceTo(center) <= radius + w2);
    },

    polylineFindBound: function(geometry) {
        var bounds = {};
        bounds.num = 0;
        bounds.sumX = 0;
        bounds.sumY = 0;
        bounds.maxX = 0;
        bounds.maxY = 0;
        bounds.minX = 100000;
        bounds.minY = 100000;
        // var number = geometry.length;
        var type = geometry[0].geometry.type;
        if (type == "MultiPolygon") {
            for (i = 0, len = geometry[0].geometry.coordinates.length; i < len; i++) {
                part = geometry[0].geometry.coordinates[i];
                for (j = 0, len2 = part.length; j < len2; j++) {
                    multiple = part[j];
                    for (k = 0, len3 = multiple.length; k < len3; k++) {
                        bounds.num++;
                        p = multiple[k];
                        bounds.sumX = bounds.sumX + p[0];
                        bounds.sumY = bounds.sumY + p[1];
                        if (p[0] > bounds.maxX) {
                            bounds.maxX = p[0];
                        }
                        if (p[0] < bounds.minX) {
                            bounds.minX = p[0];
                        }
                        if (p[1] > bounds.maxY) {
                            bounds.maxY = p[1];
                        }
                        if (p[1] < bounds.minY) {
                            bounds.minY = p[1];
                        }
                    }
                }
            }
        } else {
            for (i = 0, len = geometry.length; i < len; i++) {
                type = geometry[i].geometry.type;
                if (type == "Polygon") {
                    part = geometry[i].geometry.coordinates[0];
                    for (j = 0, len2 = part.length; j < len2; j++) {
                        bounds.num++;
                        p = part[j];
                        bounds.sumX = bounds.sumX + p[0];
                        bounds.sumY = bounds.sumY + p[1];
                        if (p[0] > bounds.maxX) {
                            bounds.maxX = p[0];
                        }
                        if (p[0] < bounds.minX) {
                            bounds.minX = p[0];
                        }
                        if (p[1] > bounds.maxY) {
                            bounds.maxY = p[1];
                        }
                        if (p[1] < bounds.minY) {
                            bounds.minY = p[1];
                        }
                    }
                } else if (type == "Point") {
                    p = geometry[i].geometry.coordinates;
                    bounds.num++;
                    bounds.sumX = bounds.sumX + p[0];
                    bounds.sumY = bounds.sumY + p[1];
                    if (p[0] > bounds.maxX) {
                        bounds.maxX = p[0];
                    }
                    if (p[0] < bounds.minX) {
                        bounds.minX = p[0];
                    }
                    if (p[1] > bounds.maxY) {
                        bounds.maxY = p[1];
                    }
                    if (p[1] < bounds.minY) {
                        bounds.minY = p[1];
                    }

                } else if (type == "LineString") {
                    if (geometry[i].bbox) {
                        p = geometry[i].bbox;
                        bounds.sumX = bounds.sumX + p[0];
                        bounds.sumY = bounds.sumY + p[1];
                        bounds.sumX = bounds.sumX + p[2];
                        bounds.sumY = bounds.sumY + p[3];
                        bounds.num += 2;
                        if (p[2] > bounds.maxX) {
                            bounds.maxX = p[2];
                        }
                        if (p[0] < bounds.minX) {
                            bounds.minX = p[0];
                        }
                        if (p[3] > bounds.maxY) {
                            bounds.maxY = p[3];
                        }
                        if (p[1] < bounds.minY) {
                            bounds.minY = p[1];
                        }
                    } else {
                        for (var k = 0; k < geometry[i].geometry.coordinates.length; k++) {
                            p = geometry[i].geometry.coordinates[k];
                            bounds.num++;
                            bounds.sumX = bounds.sumX + p[0];
                            bounds.sumY = bounds.sumY + p[1];
                            if (p[0] > bounds.maxX) {
                                bounds.maxX = p[0];
                            }
                            if (p[0] < bounds.minX) {
                                bounds.minX = p[0];
                            }
                            if (p[1] > bounds.maxY) {
                                bounds.maxY = p[1];
                            }
                            if (p[1] < bounds.minY) {
                                bounds.minY = p[1];
                            }
                        }


                    }

                }
            }
        }


        // do {
        //     var type = geometry[j].geometry.type;
        //     if (type == "Polygon") {
        //         for (i = 0, len = geometry.length; i < len; i++) {
        //             part = geometry[i].geometry.coordinates[0];
        //             for (j = 0, len2 = part.length; j < len2; j++) {
        //                 bounds.num++;
        //                 p = part[j];
        //                 bounds.sumX = bounds.sumX + p[0];
        //                 bounds.sumY = bounds.sumY + p[1];
        //                 if (p[0] > bounds.maxX) {
        //                     bounds.maxX = p[0];
        //                 }
        //                 if (p[0] < bounds.minX) {
        //                     bounds.minX = p[0];
        //                 }
        //                 if (p[1] > bounds.maxY) {
        //                     bounds.maxY = p[1];
        //                 }
        //                 if (p[1] < bounds.minY) {
        //                     bounds.minY = p[1];
        //                 }
        //             }
        //         }
        //     } else if (type == "Point") {
        //         for (i = 0, len = geometry.length; i < len; i++) {
        //             p = geometry[i].geometry.coordinates;
        //             bounds.num++;
        //             bounds.sumX = bounds.sumX + p[0];
        //             bounds.sumY = bounds.sumY + p[1];
        //             if (p[0] > bounds.maxX) {
        //                 bounds.maxX = p[0];
        //             }
        //             if (p[0] < bounds.minX) {
        //                 bounds.minX = p[0];
        //             }
        //             if (p[1] > bounds.maxY) {
        //                 bounds.maxY = p[1];
        //             }
        //             if (p[1] < bounds.minY) {
        //                 bounds.minY = p[1];
        //             }
        //         }

        //     } else if (type == "LineString") {
        //         for (i = 0, len = geometry.length; i < len; i++) {
        //             p = geometry[i].bbox;
        //             bounds.sumX = bounds.sumX + p[0];
        //             bounds.sumY = bounds.sumY + p[1];
        //             bounds.sumX = bounds.sumX + p[2];
        //             bounds.sumY = bounds.sumY + p[3];
        //             bounds.num += 2;
        //             if (p[2] > bounds.maxX) {
        //                 bounds.maxX = p[2];
        //             }
        //             if (p[0] < bounds.minX) {
        //                 bounds.minX = p[0];
        //             }
        //             if (p[3] > bounds.maxY) {
        //                 bounds.maxY = p[3];
        //             }
        //             if (p[1] < bounds.minY) {
        //                 bounds.minY = p[1];
        //             }
        //         }
        //     } else if (type == "MultiPolygon") {
        //         for (i = 0, len = geometry[0].geometry.coordinates.length; i < len; i++) {
        //             part = geometry[0].geometry.coordinates[i];
        //             for (j = 0, len2 = part.length; j < len2; j++) {
        //                 multiple = part[j];
        //                 for (k = 0, len3 = multiple.length; k < len3; k++) {
        //                     bounds.num++;
        //                     p = multiple[k];
        //                     bounds.sumX = bounds.sumX + p[0];
        //                     bounds.sumY = bounds.sumY + p[1];
        //                     if (p[0] > bounds.maxX) {
        //                         bounds.maxX = p[0];
        //                     }
        //                     if (p[0] < bounds.minX) {
        //                         bounds.minX = p[0];
        //                     }
        //                     if (p[1] > bounds.maxY) {
        //                         bounds.maxY = p[1];
        //                     }
        //                     if (p[1] < bounds.minY) {
        //                         bounds.minY = p[1];
        //                     }
        //                 }
        //             }
        //         }
        //     }

        // }

        if (bounds.num > 0) {
            bounds.meanX = bounds.sumX / bounds.num;
            bounds.meanY = bounds.sumY / bounds.num;
        }
        return bounds;
    },

    polylineContainsPoint: function(p, geometry, weight) {
        var i, j, k, len, len2, dist,
            part, p1, p2,
            w = weight / 2;

        if (L.Browser.touch) {
            w += 10; // polyline click tolerance on touch devices
        }

        for (i = 0, len = geometry.length; i < len; i++) {
            part = geometry[i];

            for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
                if (!closed && (j === 0)) {
                    continue;
                }

                // distance from a point to a segment between two points
                // return closest point on segment or distance to that point
                p1 = part[k];
                p2 = part[j];

                var dist;
                var x = p1[0],
                    y = p1[1],
                    dx = p2[0] - x,
                    dy = p2[1] - y,
                    dot = dx * dx + dy * dy,
                    t;

                if (dot > 0) {
                    t = ((p.x - x) * dx + (p.y - y) * dy) / dot;

                    if (t > 1) {
                        x = p2[0];
                        y = p2[1];
                    } else if (t > 0) {
                        x += dx * t;
                        y += dy * t;
                    }
                }

                dx = p.x - x;
                dy = p.y - y;
                dist = Math.sqrt(dx * dx + dy * dy);

                if (dist <= w) {
                    return true;
                }
            }
        }
        return false;
    },

    //leaflet.js
    polygonContainsPoint: function(p, geometry) {
        var inside = false,
            part, p1, p2,
            i, j, k,
            len, len2;

        // TODO optimization: check if within bounds first

        // if (L.Polyline.prototype._containsPoint.call(this, p, true)) {
        //  // click on polygon border
        //  return true;
        // }

        // ray casting algorithm for detecting if point is in polygon

        for (i = 0, len = geometry.length; i < len; i++) {
            part = geometry[i];

            for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
                p1 = part[j];
                p2 = part[k];

                if (((p1[1] > p.y) !== (p2[1] > p.y)) &&
                    (p.x < (p2[0] - p1[0]) * (p.y - p1[1]) / (p2[1] - p1[1]) + p1[0])) {
                    inside = !inside;
                }
            }
        }

        return inside;
    },

    getQuadKey: function(lat, lon, zoom) {
        var number = {};
        number.x = parseInt(Math.floor((lon + 180) / 360 * (1 << zoom)));
        number.y = parseInt(Math.floor((1 - Math.log(Math.tan(lat.toRad()) + 1 / Math.cos(lat.toRad())) / Math.PI) / 2 * (1 << zoom)));
        number.z = zoom;
        var quadKey = calculateQuadKey(number.x, number.y, number.z);
        return quadKey;
    },
    calculateQuadKey: function(x, y, z) {

        var quadKey = ''
        for (var i = z; i = 0; i--) {
            var digit = 0;
            mask = 1 << (i - 1)
            if ((x & mask) != 0) {
                digit += 1
            }
            if ((y & mask) != 0) {
                digit += 2
            }
            alert(digit);
            quadKey += str(digit)
        }
        return quadKey
    }
};

/**
 * Trigger Event
 * @param {DOM} element - 事件觸發對象
 * @param {String} eventName - 事件名稱
 */
G.dispatchEvent = function(element, eventName) {
    if ("createEvent" in document) {
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent(eventName, false, true);
        element.dispatchEvent(evt);
    } else {
        element.fireEvent('on' + eventName);
    }
};

//Get Data
G.dataProcess = {
    /**
     * Get Binary
     * @param {String} url - API Url
     * @param {Function} success - success callback function
     */
    ajaxPbf: function(url, success) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', url, true);
        xmlhttp.responseType = 'arraybuffer';
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    var pbf = new Pbf(new Uint8Array(xmlhttp.response));
                    success(pbf);
                }
            }
        };
        xmlhttp.send(null);
    },

    fileExtName: function(fileName) {
        return fileName.split(".").pop();
    },

    fileToArrayBuffer: function(file, callback) {
        var reader = new FileReader();

        // If we use onloadend, we need to check the readyState.
        reader.onloadend = function(evt) {
            if (evt.target.readyState == FileReader.DONE) { // DONE == 2
                callback(null, evt.target.result);
            } else {
                callback("error");
            }
        };

        // var blob = file.slice(0, file.size);
        // reader.readAsArrayBuffer(blob);
        reader.readAsArrayBuffer(file);
    },

    fileToText: function(file, callback) {
        var reader = new FileReader();

        // If we use onloadend, we need to check the readyState.
        reader.onloadend = function(evt) {
            if (evt.target.readyState == FileReader.DONE) { // DONE == 2
                callback(null, evt.target.result);
            } else {
                callback("error");
            }
        };

        reader.readAsText(file);
    },

    base64ToBlob: function(base64, mime) {
    mime = mime || "";
    var sliceSize = 1024;
    var byteChars = window.atob(base64);
    var byteArrays = [];

    for (
      var offset = 0, len = byteChars.length;
      offset < len;
      offset += sliceSize
    ) {
      var slice = byteChars.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mime });
  }
};

//time
G.time = {
    today: new Date(),
    week1ago: new Date(),
    month1ago: new Date(),
    month2ago: new Date()
};
G.time.week1ago.setDate(G.time.week1ago.getDate() - 7);
G.time.month1ago.setMonth(G.time.month1ago.getMonth() - 1);
G.time.month2ago.setMonth(G.time.month2ago.getMonth() - 2);
G.time.yyyyMMdd = function(datetime, join) {
    var yyyy = datetime.getFullYear().toString();
    var mm = (datetime.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = datetime.getDate().toString();
    return [yyyy, (mm[1] ? mm : "0" + mm[0]), (dd[1] ? dd : "0" + dd[0])].join(join ? join : '');
};
G.time.yyyyMMddhms = function(datetime, join) {
    var yyyy = datetime.getFullYear().toString();
    var mm = (datetime.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = datetime.getDate().toString();
    var h = datetime.getHours().toString();
    var m = datetime.getMinutes().toString();
    var s = datetime.getSeconds().toString();
    var output = [yyyy, (mm[1] ? mm : "0" + mm[0]), (dd[1] ? dd : "0" + dd[0])].join(join ? join : '') + " " + [(h[1] ? h : "0" + h[0]), (m[1] ? m : "0" + m[0]), (s[1] ? s : "0" + s[0])].join(':');
    return output;

}

//color
G.color = {
    //隨機顏色,return hex
    random: function() {
        var letters = "0123456789ABCDEF".split("");
        var color = "#";
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    },

    //hex string to rgb object
    hexToRgb: function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    //hex string to rgba string
    hexToRgba: function(hex, opacity) {
        var rgb = this.hexToRgb(hex);
        return "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + opacity + ");";
    },

    //rgb value to hex string
    rgbToHex: function(r, g, b) {
        if (typeof g == 'undefined' || typeof b == 'undefined') {
            var rgb = r.match(/\d+/g, '');
            r = Number(rgb[0]);
            g = Number(rgb[1]);
            b = Number(rgb[2]);
        }

        var hex = [
            r.toString(16),
            g.toString(16),
            b.toString(16)
        ];
        hex.forEach(function(val, index) {
            if (val.length === 1) {
                hex[index] = "0" + val;
            }
        });
        return hex.join("").toUpperCase();
    },

    //hex string + opacity to argb string
    hexToAbgr: function(hex, opacity) {
        var a = (opacity !== "") ? Math.floor(opacity * 255).toString(16) : (255).toString(16),
            b, g, r;
        if (hex.indexOf("#") !== -1) {
            r = hex.slice(1, 3);
            g = hex.slice(3, 5);
            b = hex.slice(5, 7);
        }
        a = (a.length > 1) ? a : "0" + a;
        r = (r.length > 1) ? r : "0" + r;
        g = (g.length > 1) ? g : "0" + g;
        b = (b.length > 1) ? b : "0" + b;
        return a + b + g + r;
    },

    pattern: {}
};

//Geocloud Canvas Polygon Pattern
G.color.patternList = [
    ["0010", "0011", "0012", "0020", "0030", "0041", "0042", "0050", "0060", "0070", "0080", "0090", "0100", "0101", "0120", "0121", "0130", "0131", "0132", "0140", "0150", "0151", "0161", "0162", "0170", "0180", "1", "1010", "1020", "1021", "1022", "1023", "1024", "1025", "1030", "1040", "1050", "1060", "1061", "1070", "1080", "1090", "1100", "1110", "1111", "1120", "1121", "1130", "1131", "1132"],
    ["1133", "1134", "1135", "1136", "1140", "1150", "1160", "1170", "1171", "1180", "1181", "1182", "1183", "1190", "1200", "1210", "1211", "1212", "1220", "1221", "1222", "1223", "1224", "1225", "1226", "1227", "1230", "1240", "1250", "1260", "1261", "1262", "1263", "1270", "1271", "1272", "1280", "1290", "1300", "1310", "1311", "1312", "1313", "1314", "1315", "1316", "1317", "1320", "1321", "1322"],
    ["1323", "1324", "1330", "1340", "1350", "1360", "1370", "1371", "1380", "1381", "1390", "1391", "1392", "1393", "1394", "1395", "1396", "1397", "1398", "1400", "1410", "1420", "1421", "1422", "1430", "1431", "1432", "1433", "1434", "1435", "1436", "1440", "1450", "1451", "1452", "1470", "1480", "1490", "1500", "1510", "1521", "1530", "1531", "1533", "1534", "1535", "1540", "1550", "1561", "1562"],
    ["1570", "1580", "1590", "1600", "1610", "1620", "1630", "1631", "1632", "1640", "1641", "1650", "1660", "1661", "1662", "1670", "1671", "1680", "1690", "1691", "1692", "1693", "1694", "1700", "1710", "1720", "1730", "1731", "1732", "1733", "1734", "1735", "1740", "1751", "1760", "1761", "1770", "1780", "1791", "1792", "1793", "1800", "1810", "1820", "1830", "1831", "1832", "1840", "1850", "1851"],
    ["1852", "1853", "1854", "1855", "1856", "1857", "1861", "1870", "1880", "1891", "1900", "1901", "1902", "1910", "1920", "1930", "1940", "1950", "1960", "1970", "1980", "1990", "2", "2000", "2010", "2020", "2030", "2031", "2040", "2050", "2051", "2060", "2071", "2072", "2073", "2074", "2075", "2076", "2080", "2090", "2110", "2120", "2130", "2141", "2142", "2143", "2170", "3", "4011", "4012"],
    ["4020", "4030", "4031", "4032", "4033", "4034", "4041", "4042", "4043", "4044", "4050", "4060", "4070", "4080", "5010", "5021", "5022", "5023", "5024", "5025", "5026", "5030", "5040", "5041", "5042", "5050", "5060", "5061", "5062", "5070", "5071", "5072", "5073", "5080", "5090", "5100", "5110", "5120", "5130", "5131", "5140", "5150", "5160", "5170", "5180", "5190", "5200", "5201", "5210", "5211"],
    ["5220", "5230", "5231", "5232", "5240", "5241", "5242", "5250", "6010", "6011", "6020", "6021", "6022", "6023", "6024", "6040", "6041", "6050", "6051", "6060", "6061", "6062", "6063", "6064", "6070", "6110", "7000", "7001", "7003", "7004", "7005", "7010", "7011", "7012", "7013", "7014", "7015", "7016", "7017", "7018", "7019", "701A", "701B", "701C", "7030", "7034", "7062", "7063", "7065", "7081"],
    ["7091", "7095", "7100", "7101", "7102", "7103", "7901", "8000", "8010", "9010", "9020", "9030", "A1", "A10", "A11", "A111", "A113", "A12", "A13", "A131", "A133", "A13a", "A13c", "A2", "A3", "A4", "A400", "A5", "A6", "A7", "A8", "A9", "An1", "An2", "An3", "B1", "B2", "B3", "B4", "B5", "B6", "Ba2", "Cg1", "Cg2", "Cg3", "Cl2", "E1", "E101", "E102", "E103"],
    ["E104", "E105", "E2", "E3", "E4", "E5", "E6", "Gb2", "Gn1", "L200", "L201", "L202", "L203", "L204", "L205", "L211", "Ms3", "Qs3", "Qz1", "Qz3", "Ss3", "T100", "T110", "T120", "T121", "T122", "T123", "T130", "T140", "T150", "T151", "T152", "T160", "T170", "T171", "T172", "T180", "T190", "T191", "T192", "T200", "T210", "T220", "T230", "Z101", "Z102", "Z103", "Z104", "Z105", "Z106", "ZZZZ"]
];
G.color.patternList.forEach(function(imgList, index) {
    var images = new Image();
    images.onload = function() {
        var image = this;

        imgList.forEach(function(img, index2) {
            //pattern canvas
            var p = document.createElement("canvas");
            var ptx = p.getContext("2d");
            p.width = 120;
            p.height = 90;
            ptx.drawImage(image, 0, 90 * index2, 120, 90, 0, 0, 120, 90);

            //pattern
            var c = document.createElement("canvas"),
                ctx = c.getContext("2d"),
                pat = ctx.createPattern(p, "repeat");
            G.color.pattern['p' + img] = pat;
        });
    };
    //images.src = '/' + LanguageValue.FolderName + '/stylesheets/images/geologics/Stratum' + index + '.png';
	images.src = '/map_core/style/images/geologics/Stratum' + index + '.png';
    images.setAttribute('crossOrigin', 'anonymous');
});

document.head.appendChild(document.createElement("style"));
G.stylesheet = document.styleSheets[document.styleSheets.length - 1];

//depends on Proj4js
proj4.defs("EPSG:3825", "+proj=tmerc +lat_0=0 +lon_0=119 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
proj4.defs("EPSG:3826", "+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
proj4.defs("EPSG:3827", "+proj=tmerc +lat_0=0 +lon_0=119 +k=0.9999 +x_0=250000 +y_0=0 +ellps=aust_SA +towgs84=-752,-358,-179,-0.0000011698,0.0000018398,0.0000009822,0.00002329 +units=m +no_defs");
proj4.defs("EPSG:3828", "+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=aust_SA +towgs84=-752,-358,-179,-0.0000011698,0.0000018398,0.0000009822,0.00002329 +units=m +no_defs");

G.proj4 = {
    wgs84: proj4("EPSG:4326"),
    twd97: proj4("EPSG:3826"),
    twd97P: proj4("EPSG:3825"),
    twd67: proj4("EPSG:3828"),
    twd67P: proj4("EPSG:3827")
};

// proj4.defs["EPSG:3825"] = "+proj=tmerc +lat_0=0 +lon_0=119 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
// proj4.defs["EPSG:3826"] = "+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
// proj4.defs["EPSG:3827"] = "+proj=tmerc +lat_0=0 +lon_0=119 +k=0.9999 +x_0=250000 +y_0=0 +ellps=aust_SA +towgs84=-752,-358,-179,-0.0000011698,0.0000018398,0.0000009822,0.00002329 +units=m +no_defs";
// proj4.defs["EPSG:3828"] = "+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=aust_SA +towgs84=-752,-358,-179,-0.0000011698,0.0000018398,0.0000009822,0.00002329 +units=m +no_defs";

// G.proj4js = {
//     wgs84: new proj4.Proj("EPSG:4326"),
//     twd97: new proj4.Proj("EPSG:3826"),
//     twd97P: new proj4.Proj("EPSG:3825"),
//     twd67: new proj4.Proj("EPSG:3828"),
//     twd67P: new proj4.Proj("EPSG:3827")
// };
G.ui = {};

/**
 * Create DOM
 * @param {String} tagName - HTML標籤名稱
 * @param {String} className - class name
 * @param {innerHTML} content - DOM內容
 * @param {DOM} container - 要新增於的對象
 * @return {DOM} el - Create DOM
 */
G.ui.create = function(tagName, className, content, container) {
    var el = L.DomUtil.create(tagName, className, container);
    el.innerHTML = content;
    return el;
};

G.ui.removeContent = function(container) {
    container.innerHTML = ''
    return container
}

/**
 * Create Input(Slider)
 * @param {Number} value - 初始handle值
 * @param {Number} min - 最小值
 * @param {Number} max - 最大值
 * @param {Number} step - step
 * @param {Function} inputEvent - Input的input事件
 * @param {Function} changeEvent - Input的Change事件
 * @return {DOM} slider - Create DOM
 */
G.ui.slider = function(value, min, max, step, inputEvent, changeEvent) {
    var slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = value;
    if (inputEvent) {
        slider.addEventListener('input', inputEvent);
    }
    if (changeEvent) {
        slider.addEventListener('change', changeEvent);
    }
    return slider;
};

/**
 * Create Input(Color)
 * @param {Function} changeEvent - Input的Change事件
 * @return {DOM} color - Create DOM
 */
G.ui.color = function(changeEvent) {
    var color = document.createElement('input');
    color.type = (L.Browser.ie) ? 'text' : 'color';
    color.style.width = '100%';
    if (changeEvent) {
        color.addEventListener('change', changeEvent);
    }
    return color;
};

/**
 * Create EditLayer Button
 * @param {Object} source - 被編輯的圖層
 * @param {Object} ostyle - 該圖層的style
 * @param {Object} gmap - G.Map Object
 * @param {Object} removeLayer - 被移除的圖層
 * @return {DOM} button - Create DOM
 */
G.ui.layerToEditButton = function(source, ostyle, gmap, removeLayer) {
    var button = document.createElement('button');
    button.className = 'geocloud-button geocloud-theme3';
    button.textContent = removeLayer ? '編輯' : '複製於手繪圖層編輯';
    button.addEventListener('click', function() {
        var geojson = source.toGeoJSON ? source.toGeoJSON() : source;
        var style = L.extend({}, ostyle);
        var tStyle = L.extend({}, ostyle);
        tStyle.fillColor = style.fillColorType === 'pattern' ? G.color.pattern[tStyle.fillColor] : style.fillColor;

        var map = gmap.mainMap;
        var viceMap = gmap.mainMap;
        gmap.viceMap = viceMap;
        // var viceMap = gmap.viceMap;

        var tempLayer = L.geoJson(geojson, {
            style: tStyle,
            pointToLayer: G.geo.set.Point.style
        });

        var copyLayer = tempLayer.getLayers()[0];
        var feature = copyLayer.feature;
        var type = feature.geometry.type;
        feature.style = style;

        var popupContent = [];

        //Edit
        if (type.indexOf('Point') !== -1) {
            var editControl = gmap.editPopup.point;
            var tempHtml = document.createElement('div');
            tempHtml.innerHTML = style.html;
            var tempMarker = tempHtml.firstElementChild;
            editControl.color.input.value = tempMarker.style.color;
            editControl.direct.input.value = G.util.number(tempMarker.firstElementChild.style.transform);
            editControl.direct.input.span = editControl.direct.input.value;
            if (tempMarker.children[1]) {
                editControl.dip.input.value = tempMarker.children[1].textContent;
                editControl.dip.input.span = editControl.dip.input.value;
            }
            editControl.layer = copyLayer;
            popupContent = popupContent.concat(editControl.table);
        } else if (type.indexOf('LineString') !== -1) {
            var editControl = gmap.editPopup.polyline;
            [
                'color',
                'weight',
                'dashArray',
                'opacity'
            ].forEach(function(el) {
                editControl[el].input.value = style[el];
                G.dispatchEvent(editControl[el].input, 'input');
            });
            editControl.layer = copyLayer;
            popupContent = popupContent.concat(editControl.table);
        } else if (type.indexOf('Polygon') !== -1) {
            var editControl = gmap.editPopup.polygon;
            [
                'color',
                'weight',
                'dashArray',
                'opacity',
                'fillColor',
                'fillOpacity'
            ].forEach(function(el) {
                editControl[el].input.value = style[el];
                G.dispatchEvent(editControl[el].input, 'input');

                if (el === 'fillColor') {
                    var fillType = gmap.editPopup.polygon.fillColor.input.parentElement.previousElementSibling;
                    if (style.fillColorType === 'pattern') {
                        var code = style.fillColor;
                        fillType.children[1].click();
                        G.util.each(gmap.editPopup.polygon.fillColor.pattern.children, function(p) {
                            if ('p' + p.title === code) {
                                p.classList.add('active');
                            } else {
                                p.classList.remove('active');
                            }
                        });
                        editControl.fillColorDelegate = G.color.pattern[code];
                    } else {
                        fillType.children[0].click();
                    }
                }
            });
            editControl.layer = copyLayer;
            popupContent = popupContent.concat(editControl.table);
        }

        popupContent = popupContent.concat(G.ui.popupEditingButtons(copyLayer, gmap, removeLayer));
        copyLayer.bindPopup(G.ui.popupContent(popupContent));

        viceMap.addLayer(copyLayer);
        // viceMap.show();
        gmap.drawPanels.disable();
        map.closePopup();

        if (type !== 'Point' && type !== 'MultiPoint') {
            copyLayer.openPopup();
        }

        if (type.indexOf('Multi') !== -1) {
            if (type === 'MultiPoint') {
                copyLayer.eachLayer(function(copyLayerChild) {
                    copyLayerChild.dragging.enable();
                });
            } else {
                copyLayer.eachLayer(function(copyLayerChild) {
                    copyLayerChild.editing.enable();
                });
            }
        } else {
            type === 'Point' ? copyLayer.dragging.enable() : copyLayer.editing.enable();
        }
    });
    return button;
};

/**
 * Create EditLayer Confirm Button
 * @param {Object} copyLayer - 要複製的圖層
 * @param {Object} gmap - G.Map Object
 * @param {Object} removeLayer - 被移除的圖層
 * @return {DOM} button - Create DOM
 */
G.ui.layerEditConfirmButton = function(copyLayer, gmap, removeLayer) {
    var button = document.createElement('button');
    button.className = 'geocloud-button geocloud-theme3';
    button.textContent = '確定';
    button.addEventListener('click', function() {
        var viceMap = gmap.viceMap;
        var overLayers = gmap.overLayers;

        var feature = copyLayer.feature;
        var style = feature.style;
        var type = feature.geometry.type;

        if (type.indexOf('Multi') !== -1) {
            copyLayer.eachLayer(function(el) {
                el.editing.disable();
            });
        } else {
            if (type === 'Point') {
                copyLayer.dragging.disable();
            } else {
                copyLayer.editing.disable();
            }
        }
        // viceMap.hide();
        viceMap.closePopup();
        gmap.drawPanels.enable();

        //Edit
        var layerGroup;
        var tStyle = L.extend({}, style);
        tStyle.fillColor = style.fillColorType === 'pattern' ? G.color.pattern[tStyle.fillColor] : style.fillColor;
        var tempLayer = L.geoJson(copyLayer.toGeoJSON(), {
            style: tStyle,
            pointToLayer: G.geo.set.Point.style

        });
        var newLayer = tempLayer.getLayers()[0];
        newLayer.feature.style = style;

        if (type.indexOf('Point') !== -1) {
            layerGroup = overLayers.Point;
        } else if (type.indexOf('LineString') !== -1) {
            layerGroup = overLayers.Polyline;
        } else if (type.indexOf('Polygon') !== -1) {
            layerGroup = overLayers.Polygon;
        }

        layerGroup.removeLayer(removeLayer);
        layerGroup.addLayer(newLayer);
        viceMap.removeLayer(copyLayer);

        var popupContent = G.ui.popupEditButtons(newLayer, style, gmap, layerGroup);
        newLayer.bindPopup(G.ui.popupContent(popupContent));
    });
    return button;
};

/**
 * Create EditLayer Cancel Button
 * @param {Object} copyLayer - 要複製的圖層
 * @param {Object} gmap - G.Map Object
 * @return {DOM} button - Create DOM
 */
G.ui.layerEditCancelButton = function(copyLayer, gmap) {
    var button = document.createElement('button');
    button.className = 'geocloud-button geocloud-theme3';
    button.textContent = '取消';
    button.addEventListener('click', function() {
        var type = copyLayer.feature.geometry.type;

        if (type.indexOf('Multi') !== -1) {
            copyLayer.eachLayer(function(el) {
                el.editing.disable();
            });
        } else {
            if (type === 'Point') {
                copyLayer.dragging.disable();
            } else {
                copyLayer.editing.disable();
            }
        }

        var viceMap = gmap.viceMap;
        viceMap.removeLayer(copyLayer);
        viceMap.hide();
        viceMap.closePopup();
        map.drawPanels.enable();
    });
    return button;
};

/**
 * Create Layer Remove Button
 * @param {Object} layer - 要被移除的圖層
 * @param {Object} layerGroup - 該圖層所屬的群組
 * @return {DOM} button - Create DOM
 */
G.ui.layerRemoveButton = function(layer, layerGroup) {
    var button = document.createElement('button');
    button.style['margin'] = '10px'
    button.style['width'] = '50px'
    button.className = 'geocloud-button geocloud-theme3';
    button.textContent = '移除';
    button.addEventListener('click', function() {
        layerGroup.removeLayer(layer);
    });
    return button;
};

/**
 * Create Edit Point Layer Style Popup
 * @return {DOM} Point Style UI - Create DOM
 */
G.ui.PopupPointStyle = function() {
    var self = this;

    self.color = {
        input: G.ui.color(function() {
            G.util.each(self.marker.children, function(el) {
                el.style.color = this.value;
            }.bind(this));

            var tempHtml = document.createElement('div');
            tempHtml.innerHTML = self.layer.feature.style.html;
            tempHtml.firstElementChild.style.color = this.value;
            self.layer.feature.style.html = tempHtml.innerHTML;
            self.layer.setIcon(L.divIcon(self.layer.feature.style));
        })
    };
    self.direct = {
        span: G.ui.create('span', 'value', 0),
        input: G.ui.slider(0, 0, 360, 1, function() {
            var value = this.value;
            var direct = Number(-value) * (Math.PI / 180);
            var s = -14;
            var top = Math.cos(direct) * s + 10;
            var left = Math.sin(direct) * s + 8;

            self.direct.span.textContent = value;
            G.util.each(self.marker.children, function(el) {
                el.firstElementChild.style.transform = 'rotate(' + value + 'deg)';

                var span = el.children[1];
                if (span) {
                    span.style.top = top + "px";
                    span.style.left = left + "px";
                }
            });

            var tempHtml = document.createElement('div');
            tempHtml.innerHTML = self.layer.feature.style.html;
            tempHtml.querySelector('i').style.transform = 'rotate(' + value + 'deg)';
            var tempSpan = tempHtml.querySelector('span');
            if (tempSpan) {
                tempSpan.style.top = top + "px";
                tempSpan.style.left = left + "px";
            }
            self.layer.feature.style.html = tempHtml.innerHTML;
            self.layer.setIcon(L.divIcon(self.layer.feature.style));
        })
    };
    self.dip = {
        span: G.ui.create('span', 'value', 0),
        input: G.ui.slider(0, 0, 90, 1, function() {
            var value = this.value;
            self.dip.span.textContent = value;
            G.util.each(self.marker.children, function(el) {
                var span = el.children[1];
                span ? span.textContent = value : '';
            });

            var tempHtml = document.createElement('div');
            tempHtml.innerHTML = self.layer.feature.style.html;
            var tempSpan = tempHtml.querySelector('span');
            tempSpan ? tempSpan.textContent = value : '';
            self.layer.feature.style.html = tempHtml.innerHTML;
            self.layer.setIcon(L.divIcon(self.layer.feature.style));
        })
    };
    var pointMarkers = [
        'geo-icon-A101',
        'geo-icon-A201',
        'geo-icon-A301',
        'geo-icon-A401',
        'fa-map-marker',
        'geo2-icon-GAS',
        'fa-dot-circle-o',
        'fa-child'
    ];

    var table = L.DomUtil.create('table', 'geocloud-popup-edit-table');
    table.style.width = '164px';
    ['color', 'direct', 'dip', 'marker'].forEach(function(option) {
        var tr = L.DomUtil.create('tr', '', table);
        var td1 = L.DomUtil.create('td', '', tr);
        var td2 = L.DomUtil.create('td', '', tr);
        switch (option) {
            case "color":
                td1.textContent = LanguageValue.Color;
                td2.appendChild(self.color.input);
                break;
            case "direct":
                td1.textContent = LanguageValue.DipDirection;
                td1.appendChild(document.createElement('br'));
                td1.appendChild(self.direct.span);
                td2.appendChild(self.direct.input);
                break;
            case "dip":
                td1.textContent = LanguageValue.DipAngle;
                td1.appendChild(document.createElement('br'));
                td1.appendChild(self.dip.span);
                td2.appendChild(self.dip.input);
                break;
            case "marker":
                td1.textContent = '符號';
                var markerArea = L.DomUtil.create('div', 'marker-area', td2);
                pointMarkers.forEach(function(el) {
                    var marker = L.DomUtil.create('div', 'marker', markerArea);
                    L.DomUtil.create('i', 'fa ' + el, marker);
                    marker.addEventListener('click', function() {
                        var tempHtml = document.createElement('div');
                        tempHtml.innerHTML = self.layer.feature.style.html;
                        var tempMarker = tempHtml.firstElementChild;
                        tempMarker.firstElementChild.className = 'fa ' + el;
                        tempMarker.children[1] ? tempMarker.removeChild(tempMarker.children[1]) : '';

                        if (/geo-icon-A201|geo-icon-A301|geo-icon-A401/gi.test(el)) {
                            var span = G.ui.create('span', 'value', 0, tempMarker);
                            var directValue = self.direct.input.value;
                            var dipValue = self.dip.input.value;
                            var direct = Number(-directValue) * (Math.PI / 180);
                            var s = -14;
                            var top = Math.cos(direct) * s + 10;
                            var left = Math.sin(direct) * s + 8;

                            span.textContent = dipValue;
                            span.style.top = top + "px";
                            span.style.left = left + "px";
                        }
                        self.layer.feature.style.html = tempHtml.innerHTML;
                        self.layer.setIcon(L.divIcon(self.layer.feature.style));
                    });

                    marker.style.color = '#000';

                    if (/geo-icon-A201|geo-icon-A301|geo-icon-A401/gi.test(el)) {
                        var span = G.ui.create('span', 'value', 0, marker);
                        span.style.top = '-4px';
                        span.style.left = '8px';
                    }
                });
                self.marker = markerArea;
                break;
        }
    });
    self.table = table;
};

G.ui.popupPointStyle = function() {
    return new G.ui.PopupPointStyle();
};

/**
 * Create Edit Polyline Layer Style Popup
 * @return {DOM} Polyline Style UI - Create DOM
 */
G.ui.PopupPolylineStyle = function() {
    var self = this;

    self.color = {
        input: G.ui.color(function() {
            self.layer.feature.style.color = this.value;
            self.layer.setStyle(self.layer.feature.style);
        })
    };
    self.weight = {
        span: G.ui.create('span', 'value', 1),
        input: G.ui.slider(1, 0, 10, 0.1, function() {
            self.weight.span.textContent = this.value;
        }, function() {
            self.layer.feature.style.weight = this.value;
            self.layer.setStyle(self.layer.feature.style);
        })
    };
    self.dashArray = {
        span: G.ui.create('span', 'value', 0),
        input: G.ui.slider(0, 0, 24, 0.1, function() {
            self.dashArray.span.textContent = this.value;
        }, function() {
            self.layer.feature.style.dashArray = this.value;
            self.layer.setStyle(self.layer.feature.style);
        })
    };
    self.opacity = {
        span: G.ui.create('span', 'value', 1),
        input: G.ui.slider(1, 0, 1, 0.1, function() {
            self.opacity.span.textContent = this.value;
        }, function() {
            self.layer.feature.style.opacity = this.value;
            self.layer.setStyle(self.layer.feature.style);
        })
    };

    var table = L.DomUtil.create('table', 'geocloud-popup-edit-table');
    table.style.width = '164px';
    for (var option in self) {
        var tr = L.DomUtil.create('tr', '', table);
        var td1 = L.DomUtil.create('td', '', tr);
        var td2 = L.DomUtil.create('td', '', tr);
        switch (option) {
            case "color":
                td1.textContent = LanguageValue.Color;
                td2.appendChild(self.color.input);
                break;
            case "weight":
                td1.textContent = LanguageValue.Width;
                td1.appendChild(document.createElement('br'));
                td1.appendChild(self.weight.span);
                td2.appendChild(self.weight.input);
                break;
            case "dashArray":
                td1.textContent = LanguageValue.Dash;
                td1.appendChild(document.createElement('br'));
                td1.appendChild(self.dashArray.span);
                td2.appendChild(self.dashArray.input);
                break;
            case "opacity":
                td1.textContent = LanguageValue.Opcity;
                td1.appendChild(document.createElement('br'));
                td1.appendChild(self.opacity.span);
                td2.appendChild(self.opacity.input);
                break;
        }
    }
    self.table = table;
};

G.ui.popupPolylineStyle = function() {
    return new G.ui.PopupPolylineStyle();
};

/**
 * Create Edit Polygon Layer Style Popup
 * @return {DOM} Polygon Style UI - Create DOM
 */
G.ui.PopupPolygonStyle = function() {
    var self = this;

    self.color = {
        input: G.ui.color(function() {
            var style = self.layer.feature.style;
            style.color = this.value;
            self.layer.setStyle(L.extend({}, style, {
                fillColor: self.fillColorDelegate
            }));
        })
    };
    self.weight = {
        span: G.ui.create('span', 'value', 1),
        input: G.ui.slider(1, 0, 10, 0.1, function() {
            self.weight.span.textContent = this.value;
        }, function() {
            var style = self.layer.feature.style;
            style.weight = this.value;
            self.layer.setStyle(L.extend({}, style, {
                fillColor: self.fillColorDelegate
            }));
        })
    };
    self.dashArray = {
        span: G.ui.create('span', 'value', 0),
        input: G.ui.slider(0, 0, 24, 0.1, function() {
            self.dashArray.span.textContent = this.value;
        }, function() {
            var style = self.layer.feature.style;
            style.dashArray = this.value;
            self.layer.setStyle(L.extend({}, style, {
                fillColor: self.fillColorDelegate
            }));
        })
    };
    self.opacity = {
        span: G.ui.create('span', 'value', 1),
        input: G.ui.slider(1, 0, 1, 0.1, function() {
            self.opacity.span.textContent = this.value;
        }, function() {
            var style = self.layer.feature.style;
            style.opacity = this.value;
            self.layer.setStyle(L.extend({}, style, {
                fillColor: self.fillColorDelegate
            }));
        })
    };
    self.fillColor = {
        input: G.ui.color(function() {
            //editControl.fillColorDelegate = this.value;
            var style = self.layer.feature.style;
            //style.fillColorType = 'color';
            style.fillColor = this.value;
            self.layer.setStyle(L.extend({}, style, {
                fillColor: self.fillColorDelegate
            }));
        })
    };
    self.fillOpacity = {
        span: G.ui.create('span', 'value', 0.6),
        input: G.ui.slider(0.6, 0, 1, 0.1, function() {
            self.fillOpacity.span.textContent = this.value;
        }, function() {
            var style = self.layer.feature.style;
            style.fillOpacity = this.value;
            self.layer.setStyle(L.extend({}, style, {
                fillColor: self.fillColorDelegate
            }));
        })
    };

    var table = L.DomUtil.create('table', 'geocloud-popup-edit-table');
    table.style.width = '164px';
    for (var option in self) {
        var tr = L.DomUtil.create('tr', '', table);
        var td1 = L.DomUtil.create('td', '', tr);
        var td2 = L.DomUtil.create('td', '', tr);
        switch (option) {
            case "color":
                td1.textContent = LanguageValue.Color;
                td2.appendChild(self.color.input);
                break;
            case "weight":
                td1.textContent = LanguageValue.Width;
                td1.appendChild(document.createElement('br'));
                td1.appendChild(self.weight.span);
                td2.appendChild(self.weight.input);
                break;
            case "dashArray":
                td1.textContent = LanguageValue.Dash;
                td1.appendChild(document.createElement('br'));
                td1.appendChild(self.dashArray.span);
                td2.appendChild(self.dashArray.input);
                break;
            case "opacity":
                td1.textContent = LanguageValue.Opcity;
                td1.appendChild(document.createElement('br'));
                td1.appendChild(self.opacity.span);
                td2.appendChild(self.opacity.input);
                break;
            case "fillColor":
                var polygonFillColor = G.ui.create('span', 'switch active', LanguageValue.Polygon + LanguageValue.Color, td1);
                var polygonFillPattern = G.ui.create('span', 'switch', LanguageValue.Polygon + LanguageValue.Legend, td1);
                var fillColorArea = self.fillColor.input;
                //var fillColorArea = "#FF0000";
                var patternArea = L.DomUtil.create('div', 'pattern-area', td2);
                td2.appendChild(fillColorArea);
                self.fillColor.pattern = patternArea;
                G.color.patternList.forEach(function(imgList, index) {
                    imgList.forEach(function(img, index2) {
                        var pattern = L.DomUtil.create('div', 'pattern', patternArea);
                        pattern.title = img;
                        pattern.style.background = "url('map_core/style/images/geologics/Stratum" + index + ".png') center no-repeat";
                        pattern.style.backgroundPosition = '0px ' + -90 * index2 + 'px';
                        pattern.addEventListener('click', function() {
                            G.util.each(patternArea.children, function(el) {
                                el.classList.remove('active');
                            });
                            this.classList.add('active');

                            self.fillColorDelegate = G.color.pattern['p' + img];
                            var style = self.layer.feature.style;
                            style.fillColorType = 'pattern';
                            style.fillColor = 'p' + img;
                            self.layer.setStyle(L.extend({}, style, {
                                fillColor: self.fillColorDelegate
                            }));
                        });
                    });
                });
                patternArea.firstElementChild.classList.add('active');
                polygonFillColor.addEventListener('click', function() {
                    polygonFillColor.classList.add('active');
                    polygonFillPattern.classList.remove('active');
                    fillColorArea.style.display = '';
                    patternArea.style.display = 'none';
                });
                polygonFillPattern.addEventListener('click', function() {
                    polygonFillColor.classList.remove('active');
                    polygonFillPattern.classList.add('active');
                    fillColorArea.style.display = 'none';
                    patternArea.style.display = '';
                });
                patternArea.style.display = 'none';
                break;
            case "fillOpacity":
                td1.textContent = LanguageValue.FillOpcity;
                td1.appendChild(document.createElement('br'));
                td1.appendChild(self.fillOpacity.span);
                td2.appendChild(self.fillOpacity.input);
                break;
        }
    }
    self.table = table;
};

G.ui.popupPolygonStyle = function() {
    return new G.ui.PopupPolygonStyle();
};

/**
 * Create EditLayer Buttons of Popup
 * @param {Object} layer - 被編輯的圖層
 * @param {Object} style - 該圖層的style
 * @param {Object} gmap - G.Map Object
 * @param {Object} layerGroup - 圖層所屬的群組
 * @return {[DOM]} Buttons - Create DOM
 */
G.ui.popupEditButtons = function(layer, style, gmap, layerGroup) {
    return [
        // G.ui.layerToEditButton(layer, style, gmap, layer),
        G.ui.layerRemoveButton(layer, layerGroup)
    ];
};

/**
 * Create Editing Buttons of Popup
 * @param {Object} copyLayer - 被編輯的圖層
 * @param {Object} gmap - G.Map Object
 * @param {Object} removeLayer - 要移除的圖層
 * @return {[DOM]} Buttons - Create DOM
 */
G.ui.popupEditingButtons = function(copyLayer, gmap, removeLayer) {
    return [
        G.ui.layerEditConfirmButton(copyLayer, gmap, removeLayer),
        G.ui.layerEditCancelButton(copyLayer, gmap)
    ];
};

/**
 * Create Popup
 * @param {[DOM or String]} content - popup的內容，為DOM or String陣列
 * @return {DOM} popupDiv - Create DOM
 */
G.ui.popupContent = function(content) {
    var popupDiv = document.createElement('div');
    content.forEach(function(c) {
        if (typeof c === 'number' || typeof c === 'string') {
            popupDiv.appendChild(document.createTextNode(c));
            popupDiv.appendChild(document.createElement('br'));
        } else if (c.nodeName) {
            popupDiv.appendChild(c);
        }
        // popupDiv.appendChild(document.createElement('br'));
    });
    popupDiv.style['width'] = 'auto'
    popupDiv.style['min-width'] = '120px'
    popupDiv.style['margin'] = '10px'
    return popupDiv;
};

/**
 * Create Geocloud Style Button
 * @param {DOM} container - 要新增於的對象
 * @param {String} content - 按鈕的文字
 * @param {Function} clickEvent - click事件
 * @return {DOM} button - Create DOM
 */
G.ui.button = function(container, content, clickEvent) {
    var button = L.DomUtil.create('button', 'geocloud-button geocloud-theme', container);
    button.type = 'button';
    button.textContent = content;
    button.addEventListener('click', clickEvent);
    return button;
};

/**
 * Create Geocloud Style Panel Button
 * @param {DOM} container - 要新增於的對象
 * @param {DOM or String} iconClassName - 按鈕的內容
 * @param {String} title - 按鈕的title
 * @param {Function} clickEvent - click事件
 * @return {DOM} button - Create DOM
 */
G.ui.panelButton = function(container, iconClassName, title, clickEvent) {
    var button = L.DomUtil.create('div', 'geocloud-panelButton', container);
    if (typeof iconClassName === 'string') {
        L.DomUtil.create('i', iconClassName, button);
    } else {
        button.appendChild(iconClassName);
    }
    var buttonTitle = L.DomUtil.create('div', 'geocloud-panelButton-title', button);
    button.title = title;
    buttonTitle.textContent = title;
    button.addEventListener('click', clickEvent);
    return button;
};

/**
 * Create Geocloud Bulb Button
 * @param {DOM} container - 要新增於的對象
 * @param {String} title - 按鈕的title
 * @param {Function} clickEvent - click事件
 * @return {DOM} button - Create DOM
 */
G.ui.bulbButton = function(container, title, clickEvent) {
    var button = G.ui.panelButton(container, 'fa cgs-icon-bulb', title, function() {
        this.classList.toggle('active');
    });
    button.addEventListener('click', clickEvent);
    return button;
};

/**
 * Create Layer Bar 圖層控制Bar
 * @param {String} name - 圖層名稱
 * @param {DOM} container - 要新增於的對象
 * @param {String} title - 圖層的title
 * @param {Object} group - 圖層的所歸類的群組
 * @param {Function} clickEvent - click事件
 * @return {DOM} bar - Create DOM
 */
G.ui.layerBar = function(name, container, title, group, clickEvent) {
    var bar = L.DomUtil.create('li', 'geocloud-layerBar', container);
    var button = L.DomUtil.create('a', '', bar);
    bar.setAttribute('layer-name', name);
    bar.setAttribute('layer-group', group);
    button.href = "#";
    button.role = "button";
    button.innerHTML = '<i class="fa cgs-icon-bulb"></i>' + title;
    L.DomEvent.on(button, 'click', L.DomEvent.preventDefault);

    button.addEventListener('click', function() {
        this.classList.toggle('active');
    });
    button.addEventListener('click', clickEvent);
    return bar;
};

G.ui.layerZoom = function(gmap, bounds) {

    var bound = [
        [bounds.minY, bounds.minX],
        [bounds.maxY, bounds.maxX]
    ];
    //L.rectangle(bound, { color: "#ff7800", weight: 1 }).addTo(gmap.mainMap);

    gmap.mainMap.fitBounds(bound);
    // var boundCenter = [bounds.meanY, bounds.meanX];
    // gmap.mainMap.setView(boundCenter);
};
// G.ui.layerZoom = function(name,contains,title,clickEvent){
//     var layerZoom = L.DomUtil.create('li', 'geocloud-layerBar', container);
//     var button = L.DomUtil.create('a', '', layerZoom);
// };
/**
 * Create Modal (動態長區塊)
 * @param {DOM} container - 要新增於的對象
 * @return {DOM} modal - Create DOM
 */
G.ui.modal = function(container) {
    var modal = L.DomUtil.create('div', 'geocloud-modal', container);
    modal.style.display = 'none';
    modal.show = function(content) {
        // alert("modal");
        modal.style.display = '';
        window.setTimeout(function() {
            modal.style.transform = 'scale(1)';
        }, 10);

        G.util.each(modal.children, function(el) {
            if (el === content) {
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });
    };
    modal.hide = function() {
        modal.style.display = 'none';
        modal.style.transform = 'scale(0)';
    };
    return modal;
};

/**
 * Create Modal Content
 * @param {DOM} container - 要新增於的對象
 * @param {String} title - Modal Content DOM title
 * @param {String} className - Modal Content DOM class
 * @return {DOM} modal - Create DOM
 */
G.ui.modalContent = function(container, title, className) {
    var content = L.DomUtil.create('div', 'geocloud-modal-content ' + className, container);
    var contentTitle = L.DomUtil.create('div', 'title', content);
    var area = L.DomUtil.create('div', 'area', content);
    var footer = L.DomUtil.create('div', 'footer', content);
    contentTitle.textContent = title;
    content.area = area;
    content.footer = footer;
    content.changeContentTitle = function(newTitle) {
        contentTitle.textContent = newTitle;
    };
    return content;
};
/**
 * Add Mousemove Event for popupContent
 * @param {DOM} map - gmap.Mainmap - G.Map Object
 * @param {DOM} vtLayers - gmap.vectorTileLayers - G.Map Object
 * @param {Array/String} option - layerOptions(Geo)/ layerName
 * @param {bool} display - display popup (true/false)
 */

G.ui.mousemoveEvent = function(map, vtLayers, option, click, drag, popupContentView) {
    var mousemoveEvent;
    var mousemoveVTEvent = G.vectorTile.mouseEvent(map, vtLayers, option, false, drag, popupContentView);
    map.on('click', G.vectorTile.mouseEvent(map, vtLayers, option, click, drag, popupContentView));
    map.on('mousemove', function(e) {
        clearTimeout(mousemoveEvent);
        mousemoveEvent = setTimeout(function() {
            mousemoveVTEvent(e);
        }, 10);
    });
};

G.ui.mouseLayerEvent = function(map, name, popupContentView, drag) {
    if(G.ui.mouseLayerEvent.mouseclick) {
        map.off('click', G.ui.mouseLayerEvent.mouseclick);
    }
    if(G.ui.mouseLayerEvent.mousemove) {
        map.off('mousemove', G.ui.mouseLayerEvent.mousemove);
    }
    
    var mousemoveTimerEvent;
    var mousemoveVTEvent = G.vectorTile.mouseLayerEvent(map, name, false, popupContentView, drag)
    G.ui.mouseLayerEvent.mouseclick = G.vectorTile.mouseLayerEvent(map, name, true, popupContentView, drag)
    G.ui.mouseLayerEvent.mousemove = function(e) {
        clearTimeout(mousemoveTimerEvent);
        mousemoveTimerEvent = setTimeout(function() {
            mousemoveVTEvent(e);
        }, 10);
    }
    map.on('click', G.ui.mouseLayerEvent.mouseclick)
    map.on('mousemove', G.ui.mouseLayerEvent.mousemove);
};

/**
 * Create toggle Event for button
 * @param {DOM} objName - Object
 */
G.ui.toggleEvent = function(objName) {
    if (objName.style.display == 'block' || objName.style.display == '') {
        objName.style.display = 'none';
    } else {
        objName.style.display = 'block';
    }
};

G.ui.toastEvent = function(msg) {

}
//Chart
G.chart = {};

/**
 * Create Chart Modal
 * @param {DOM} modal - modal dom
 * @return {DOM} panel - Create DOM
 */
G.chart.modal = function(modal) {
    var panel = G.ui.modalContent(modal, '', 'geocloud-modal-chart');
    var close = G.ui.create('button', 'geocloud-button geocloud-theme', LanguageValue.Close, panel.footer);
    close.addEventListener('click', function() {
        panel.area.innerHTML = '';
        modal.hide();
    });
    return panel;
};

/**
 * Create Scatter Plot
 * @param {Object} data - input data
 * @return {DOM} container - svg container
 */
G.chart.scatterplot = function(data) {
    var container = L.DomUtil.create('div', 'chart');
    var svgs = {};
    var orientation = ['dN', 'dE', 'dH'];

    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
    };

    var width = 558 - margin.left - margin.right;
    var height = 180 - margin.top - margin.bottom;

    orientation.forEach(function(type) {
        svgs[type] = d3.select(container).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    });

    //var color = d3.scale.category10();
    var color = function(type) {
        var rcolor;
        switch (type) {
            case "dN":
                rcolor = "#00BCD4";
                break;
            case "dE":
                rcolor = "#4CAF50";
                break;
            case "dH":
                rcolor = "#E91E63";
                break;
        }
        return rcolor;
    };

    data.forEach(function(d) {
        var year = new Date(Math.floor(+d.Date).toString()),
            nextYear = new Date(Math.floor(+d.Date + 1).toString());
        var date = new Date(year.getTime() + (nextYear - year) * (+d.Date % 1));
        d.date = date;
    });

    //x-axis
    var timed = d3.extent(data, function(d) {
            return d.date;
        }),
        dayd = (timed[1] - timed[0]) / 86400000,
        tFormat = (dayd > 750) ? "%Y" : "%Y %b",
        tTick = (dayd > 750) ? {
            f: d3.time.years,
            t: 1
        } : {
            f: d3.time.months,
            t: 3
        };

    var x = d3.time.scale()
        .range([0, width]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(tTick.f, tTick.t)
        .tickFormat(d3.time.format(tFormat));

    x.domain(timed).nice();

    orientation.forEach(function(type) {
        var svg = svgs[type];
        data.forEach(function(d) {
            d.data = +d[type];
        });

        var y = d3.scale.linear()
            .range([height, 0]);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        y.domain(d3.extent(data, function(d) {
            return d.data;
        })).nice();

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text(LanguageValue.Time);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            //.attr("transform", "rotate(-90)")
            .attr("x", 46)
            .attr("dx", ".71em")
            .style("text-anchor", "end")
            .text(type + "(mm)");

        //zero x-axis
        svg.append("line")
            .attr("x1", x(x.domain()[0]))
            .attr("x2", x(x.domain()[1]))
            .attr("y1", y(0)) // whatever the y-val should be
            .attr("y2", y(0))
            .attr("class", "zero-axis")
            .style("stroke", "#ccc");

        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 1)
            .attr("cx", function(d) {
                return x(d.date);
            })
            .attr("cy", function(d) {
                return y(d.data);
            })
            .style("fill", function(d) {
                return color(type);
            });

        var legend = svg.selectAll(".legend")
            .data([type])
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) {
                return "translate(0," + i * 20 + ")";
            });

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) {
                return d;
            });
    });

    return container;
};

/**
 * Create Bar Chart
 * @param {Object} data - input data
 * @param {Object} yAxisTitle - y軸標題
 * @return {DOM} container - svg container
 */
G.chart.barchart = function(data, yAxisTitle, type) {
    var container = L.DomUtil.create('div', 'chart');

    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
    };

    var width = 558 - margin.left - margin.right;
    var height = 260 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);


    if (type == "tfHour") {
    	var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")        
    	.tickFormat(d3.time.format("%y/%m"));
    } else {
    	var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(d3.time.format("%m/%d"));
    }


    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .x(function(d) {
            return x(d.date);
        })
        .y(function(d) {
            return y(d.data);
        });

    var svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    data.forEach(function(d) {
        d.date = parseDate(d.DataCreationDate);
        if (type == "tenMin") {
            d.data = +d.RF10min;
        } else if (type == "oneHour") {
            d.data = +d.RF1hr;
        } else if (type == "twHour") {
            d.data = +d.RF12hr;
        } else {
            d.data = +d.RF24hr;
        }

    });

    x.domain(d3.extent(data, function(d) {
        return d.date;
    }));
    y.domain(d3.extent(data, function(d) {
        return d.data;
    }));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(yAxisTitle);

    svg.selectAll("bar")
        .data(data)
        .enter().append("rect")
        .style("fill", "#2196f3")
        .attr("x", function(d) {
            return x(d.date);
        })
        //.attr("width", x.rangeBand())
        .attr("width", 2)
        .attr("y", function(d) {
            return y(d.data);
        })
        .attr("height", function(d) {
            return height - y(d.data);
        });

    return container;
};

//Dropbox
if (typeof dropbox_checkAuth !== 'undefined' && dropbox_checkAuth()) {
	G.Dropbox = {};

	/**
	 * Get Geology Compass Data
	 * @param {Function} success - success function
	 * @param {Function} failed - failed function
	 */
	G.Dropbox.GeologyCompass = function(success, failed) {
		dropbox_authorize(success, failed);
	};

	/**
	 * Get Geology Other Data
	 * @param {Function} success - success function
	 * @param {Function} failed - failed function
	 */
	G.Dropbox.GeologyData = function(success, failed) {
		dropbox_authorize(success, failed, 'GeologyData');
		// dropbox_authorize(success, failed, 'GeologyCompass');
	};

	/**
	 * Get Geology File Name
	 * @param {String} link - dropbox file link
	 * @return {String} name - dropbox file name
	 */
	G.Dropbox.getFileName = function(link) {
		var name1 = link.toLowerCase().split('/');
		var name2 = name1[name1.length - 1].split('_');
		return name2[name2.length - 1];
	};
	G.Dropbox.getDataFileName = function(link) {
		var name1 = link.toLowerCase().split('/');
		var name2 = name1[name1.length - 1].split('_');
		return name2[0];
	};
	G.Dropbox.getImgName = function(link){
		var name1 = link.toLowerCase().split('/');
		var name2 = name1[name1.length - 1].split('.');
		return name2[0];
	};
}
//Vector Tile
G.vectorTile = {};

/**
 * Draw Image to Canvas
 * @param {Object} ctx - canvas.getContext("2d")
 * @param {Object} geom - geometry
 * @param {Object} style - style
 * @param {Number} ratio - ratio
 * @return {Array} bbox - image bbox
 */
G.vectorTile.image = function (ctx, geom, style, ratio) {
    var x, y, width, height;
    if (style.iconUrl == "http://www.geologycloud.tw/map/images/typhoon-position.png") {
        for (var index = 0; index < geom.length; index++) {
            x = geom[index][0] * ratio;
            y = geom[index][1] * ratio;
            width = 0;
            height = 0;
            var bbox = [
                [x, y],
                [x + width, y + height]
            ];

            var img = new Image();
            img.onload = function () {
                ctx.drawImage(img, x, y, width, height);
            };
            img.src = style.iconUrl;
        }

    } else {
        if (style.iconAnchor) {
            x = geom[0] * ratio - style.iconAnchor[0];
            y = geom[1] * ratio - style.iconAnchor[1];
        } else {
            x = geom[0] * ratio;
            y = geom[1] * ratio;
        }


        if (style.iconSize) {
            width = style.iconSize[0];
            height = style.iconSize[1];
        } else {
            width = 0;
            height = 0;
        }

        var bbox = [
            [x, y],
            [x + width, y + height]
        ];

        var img = new Image();
        img.onload = function () {
            ctx.drawImage(img, x, y, width, height);
        };
        img.src = style.iconUrl;
    }
    return bbox;
};

/**
 * Draw DivIcon to Canvas
 * @param {Object} ctx - canvas.getContext("2d")
 * @param {Object} geom - geometry
 * @param {Object} style - style
 * @param {Number} ratio - ratio
 * @return {Array} bbox - image bbox
 */
G.vectorTile.icon = function (ctx, geom, style, ratio) {
    var x, y, width, height;
    var iconinfo = style.html.split('"');
    var iconinfo_type = G.util.remove(iconinfo[3], "fa ");
    var iconinfo_1 = iconinfo[1].split(":");
    var iconinfo_2 = iconinfo_1[1].split(";");
    var iconinfo_color = iconinfo_2[0];
    var iconIndex = {
        'geo-icon-A101': '\ue800',
        'geo-icon-A201': '\ue803',
        'geo-icon-A301': '\ue804',
        'geo-icon-A401': '\ue805',
        'fa-map-marker': '\uf041',
        'geo2-icon-GAS': '\ue800',
        'fa-dot-circle-o': '\uf192',
        'fa-child': '\uf1ae'
    };

    if (style.iconAnchor) {
        x = geom[0] * ratio - style.iconAnchor[0];
        y = geom[1] * ratio - style.iconAnchor[1];
    } else {
        x = geom[0] * ratio;
        y = geom[1] * ratio;
    }

    if (style.iconSize) {
        width = style.iconSize[0];
        height = style.iconSize[1];
    } else {
        width = 0;
        height = 0;
    }

    var bbox = [
        [x, y],
        [x + width, y + height]
    ];

    ctx.font = '20px FontAwesome';
    ctx.fillStyle = iconinfo_color;
    ctx.fillText(iconIndex[iconinfo_type], x + width / 2, y + height / 2);

    return bbox;
};

/**
 * G.vectorTile.imageCheck Class(For Create imageCheck)
 * @param {Number} zoom
 * @param {Number} x
 * @param {Number} y
 * @param {Array} bbox
 * @param {Object} feature - tileIndex feature
 * @param {Object} outOfBounds - outOfBounds collection
 * @return {Object} this - G.vectorTile.imageCheck Object
 */
G.vectorTile.imageCheck = function (zoom, x, y, bbox, feature, outOfBounds) {
    this.zoom = zoom;
    this.x = x;
    this.y = y;
    this.bbox = bbox;
    this.feature = feature;
    this.outOfBounds = outOfBounds;
};
G.vectorTile.imageCheck.prototype.isOutOfBounds = function (xOffset, yOffset) {
    var tile = ['tile', this.zoom, this.x + xOffset, this.y + yOffset].join('-');
    var tempFeature = $.extend(true, {}, this.feature);
    this.outOfBounds[tile] = this.outOfBounds[tile] || [];
    this.outOfBounds[tile].push(tempFeature);
    return tempFeature.geometry;
};
G.vectorTile.imageCheck.prototype.left = function () {
    if (this.bbox[0][0] < 0) {
        var geometry = this.isOutOfBounds(-1, 0);
        geometry[0][0] = geometry[0][0] + 4096;
    }
};
G.vectorTile.imageCheck.prototype.top = function () {
    if (this.bbox[0][1] < 0) {
        var geometry = this.isOutOfBounds(0, -1);
        geometry[0][1] = geometry[0][1] + 4096;
    }
};
G.vectorTile.imageCheck.prototype.right = function () {
    if (this.bbox[1][0] > 256) {
        var geometry = this.isOutOfBounds(1, 0);
        geometry[0][0] = geometry[0][0] - 4096;
    }
};
G.vectorTile.imageCheck.prototype.bottom = function () {
    if (this.bbox[1][1] > 256) {
        var geometry = this.isOutOfBounds(0, 1);
        geometry[0][1] = geometry[0][1] - 4096;
    }
};
G.vectorTile.imageCheck.prototype.leftTop = function () {
    if (this.bbox[0][0] < 0 && this.bbox[0][1] < 0) {
        var geometry = this.isOutOfBounds(-1, -1);
        geometry[0][0] = geometry[0][0] + 4096;
        geometry[0][1] = geometry[0][1] + 4096;
    }
};
G.vectorTile.imageCheck.prototype.rightBottom = function () {
    if (this.bbox[1][0] > 256 && this.bbox[1][1] > 256) {
        var geometry = this.isOutOfBounds(1, 1);
        geometry[0][0] = geometry[0][0] - 4096;
        geometry[0][1] = geometry[0][1] - 4096;
    }
};

/**
 * Create Vector Tile Draw Function
 * @param {Object} tileIndex
 * @param {Object} styleOptions
 * @return {Function} draw function
 */
G.vectorTile.draw = function (tileIndex, styleOptions) {
    return function (canvas, tilePoint, zoom) {
        var ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';
        canvas.classList.add(['geocloud', 'title', zoom, tilePoint.x, tilePoint.y].join('-'));

        var tile = tileIndex.getTile(zoom, tilePoint.x, tilePoint.y);
        if (!tile) {
            // console.log('tile empty');
            return;
        }

        var features = tile.features;
        var outOfBounds = tileIndex.outOfBounds;
        outOfBounds.checked['z' + zoom] = outOfBounds.checked['z' + zoom] || [];

        features.forEach(function (feature, index) {
            var type = feature.type;

            var style = Object.assign({}, {
                color: '#9E9E9E',
                radius: 3,
                opacity: 1,
                weight: 1,
                fillColor: '#FAFAFA',
                fillOpacity: 0.6
            }, styleOptions(feature.tags));

            if (!style.iconUrl && style.html) {
                var geom = feature.geometry[0];
                var ratio = 0.0625;
                var bbox = G.vectorTile.icon(ctx, geom, style, ratio);
                feature.style = style;

                var featureIndex = ['xy', tilePoint.x, tilePoint.y, index].join('-');
                if (outOfBounds.checked['z' + zoom].indexOf(featureIndex) === -1) {
                    outOfBounds.checked['z' + zoom].push(featureIndex); // 
                    var imgCheck = new G.vectorTile.imageCheck(zoom, tilePoint.x, tilePoint.y, bbox, feature, outOfBounds);
                    ["left", "top", "right", "bottom", "leftTop", "rightBottom"].forEach(function (check) {
                        imgCheck[check]();
                    });
                }
            } else if (!style.iconUrl && !style.html) { //style.iconUrl
                ctx.strokeStyle = style.color;
                ctx.lineWidth = style.weight;
                ctx.fillStyle = style.fillColorType === 'pattern' ? G.color.pattern[style.fillColor] : style.fillColor;
                ctx.beginPath();
                if (style.dashArray) {
                    // var tmp_dasharray = style.dashArray.toString();
                    // var tmp_dash = tmp_dasharray.split('.');
                    ctx.setLineDash([style.dashArray, style.dashArray]);
                }

                for (var j = 0; j < feature.geometry.length; j++) {
                    var geom = feature.geometry[j];
                    var ratio = 0.0625; //  256 / 4096(extent)

                    if (type === 1) {
                        var ratio = 0.0625;
                        //(x, y, r, sAngle, eAngle, counterclockwise)
                        ctx.arc(geom[0] * ratio, geom[1] * ratio, style.radius, 0, 2 * Math.PI, false);
                        continue;
                    }


                    for (var k = 0; k < geom.length; k++) {
                        var p = geom[k];
                        var x = p[0] * ratio;
                        var y = p[1] * ratio;
                        if (k) ctx.lineTo(x, y);
                        else ctx.moveTo(x, y);
                    }
                }

                ctx.globalAlpha = style.fillOpacity;
                if (type === 3 || type === 1) ctx.fill('evenodd');

                ctx.globalAlpha = style.opacity;
                ctx.lineCap = 'round';
                ctx.stroke();
            } else {
                ctx.strokeStyle = style.color;
                ctx.lineWidth = style.weight;
                ctx.fillStyle = style.fillColorType === 'pattern' ? G.color.pattern[style.fillColor] : style.fillColor;
                ctx.beginPath();
                if (style.dashArray) {
                    // var tmp_dasharray = style.dashArray.toString();
                    // var tmp_dash = tmp_dasharray.split('.');
                    ctx.setLineDash([style.dashArray, style.dashArray]);
                }

                for (var j = 0; j < feature.geometry.length; j++) {
                    var geom = feature.geometry[j];
                    var ratio = 0.0625; //  256 / 4096(extent)

                    if (type === 1) {
                        var ratio = 0.0625;
                        //(x, y, r, sAngle, eAngle, counterclockwise)
                        ctx.arc(geom[0] * ratio, geom[1] * ratio, style.radius, 0, 2 * Math.PI, false);
                        continue;
                    }


                    for (var k = 0; k < geom.length; k++) {
                        var p = geom[k];
                        var x = p[0] * ratio;
                        var y = p[1] * ratio;
                        if (k) ctx.lineTo(x, y);
                        else ctx.moveTo(x, y);
                    }
                }

                ctx.globalAlpha = style.fillOpacity;
                if (type === 3 || type === 1) ctx.fill('evenodd');

                ctx.globalAlpha = style.opacity;
                ctx.lineCap = 'round';
                ctx.stroke();




                var geom = feature.geometry[0];
                var ratio = 0.0625;
                ctx.fillStyle = style.fillColor;

                var bbox = G.vectorTile.image(ctx, geom, style, ratio);
                feature.style = style;

                var featureIndex = ['xy', tilePoint.x, tilePoint.y, index].join('-');
                if (outOfBounds.checked['z' + zoom].indexOf(featureIndex) === -1) {
                    outOfBounds.checked['z' + zoom].push(featureIndex);

                    var imgCheck = new G.vectorTile.imageCheck(zoom, tilePoint.x, tilePoint.y, bbox, feature, outOfBounds);
                    ["left", "top", "right", "bottom", "leftTop", "rightBottom"].forEach(function (check) {
                        imgCheck[check]();
                    });
                }
            }
        });

        //out of bounds
        var outOfBoundsFeatures = outOfBounds[['tile', zoom, tilePoint.x, tilePoint.y].join('-')];
        if (outOfBoundsFeatures) {
            outOfBoundsFeatures.forEach(function (feature) {
                var geom = feature.geometry[0];
                var ratio = 0.0625;
                if (!feature.style.iconUrl) {
                    G.vectorTile.icon(ctx, geom, styleOptions(feature.tags), ratio);
                } else {
                    G.vectorTile.image(ctx, geom, styleOptions(feature.tags), ratio);
                }

            });
        }
    };
};

// Vector Tile Default Set
G.vectorTile.defaultSet = {
    style: function (properties) {
        return properties.__style;
    },

    set: function (feature, layer) {
        var style = feature.style;
        var gmap = this.gmap;
        var layerGroup = gmap.overLayers[el];

        var popupContent = G.ui.popupEditButtons(layer, style, gmap, layerGroup);
        layer.bindPopup(G.ui.popupContent(popupContent));
    }
};

/**
 * Create Leaflet.js TileLayer Canvas
 * @param {Object} tileIndex
 * @param {Object} name - layer name
 * @param {Object} zIndex - layer z-index
 * @param {Object} map - geocloud main map
 * @return {Object} tileLayer canvas
 */
G.vectorTile.canvasTile = function (tileIndex, name, zIndex, map) {
    var canvasTile = L.tileLayer.canvas({
        maxZoom: 22,
        zIndex: zIndex
    });
    canvasTile.drawTile = G.vectorTile.draw(tileIndex, function (properties) {
        if (G.geo.set[name]) {
            return G.geo.set[name].style(properties)
        } else {
            return G.vectorTile.defaultSet.style(properties)
        }
    });

    canvasTile.addTo(map);
    canvasTile.getContainer().classList.add("geocloud-vtile-" + name);
    canvasTile.on("load", function () {
        // console.log(map);
        // console.log(canvasTile);
        var outOfBounds = Object.keys(tileIndex.outOfBounds).length > 1;
        var zoom = map.getZoom();
        if (outOfBounds && !canvasTile.alreadyOpen.has(zoom)) {
            canvasTile.alreadyOpen.add(zoom);
            canvasTile.redraw();
        }
    });
    canvasTile.alreadyOpen = new Set();
    return canvasTile;
};

/**
 * Create Leaflet.js Vector Tile MouseEvent
 * @param {Object} map - geocloud main map
 * @param {Object} vtLayers - vector tile layer
 * @param {Object} layerOptions - Geocloud Layer Options
 * @param {Boolean} click
 * @return {Object} tileLayer canvas
 */
G.vectorTile.mouseEvent = function (map, vtLayers, layerOptions, click, drag, popupContentView) {
    var mapContainer = map.getContainer();
    var popup = L.popup();

    return function (e) {
        var tempTile = map.getPanes().tilePane.querySelector('.leaflet-tile');
        var x = ((e.layerPoint.x - parseInt(tempTile.style.left)) % 256 + 256) % 256;
        var y = ((e.layerPoint.y - parseInt(tempTile.style.top)) % 256 + 256) % 256;

        //event point
        var ePoint = L.point([x * 16, y * 16]);
        var latlng = e.latlng;
        var tileZ = map.getZoom();
        var tileX = Math.floor((latlng.lng + 180) / 360 * Math.pow(2, tileZ));
        var tileY = (Math.floor((1 - Math.log(Math.tan(latlng.lat * Math.PI / 180) + 1 / Math.cos(latlng.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, tileZ)));

        var inside = false;
        mapContainer.style.cursor = '';
        // sort.reverse().filter(function(name) {
        if (layerOptions.geo) {
            layerOptions.geo.slice().reverse().filter(function (name) {
                return vtLayers[name] && vtLayers[name].getContainer().style.display === '';
            }).some(function (name) {
                var vectorTile = G.geo.tile.indices[name].getTile(tileZ, tileX, tileY);
                var outOfBounds = G.geo.tile.indices[name].outOfBounds[["tile", tileZ, tileX, tileY].join("-")];
                var features = vectorTile && vectorTile.features ? vectorTile.features : [];
                features = outOfBounds ? features.concat(outOfBounds) : features;
                features.some(function (feature) {
                    if (feature.type === 1) {
                        var style = feature.style;
                        if (feature.style && feature.style.iconUrl) {
                            var style = feature.style;
                            var geometry = feature.geometry[0];
                            var bbox = [geometry[0] - style.iconAnchor[0] * 16, geometry[1] - style.iconAnchor[1] * 16];
                            bbox = bbox.concat([bbox[0] + style.iconSize[0] * 16, bbox[1] + style.iconSize[1] * 16]);
                            inside = G.util.bboxContainsPoint(ePoint, bbox);
                        } else {
                            inside = G.util.circleContainsPoint(ePoint, feature.geometry, 3 * 16, 0.4 * 16, true);
                        }
                    } else if (feature.type === 2) {
                        inside = G.util.polylineContainsPoint(ePoint, feature.geometry, 10 * 16);
                    } else if (feature.type === 3) {
                        inside = G.util.polygonContainsPoint(ePoint, feature.geometry);
                    }

                    if (inside) {
                        mapContainer.style.cursor = 'pointer';
                        if (click) {
                            var popupContent = [];
                            var properties = feature.tags;
                            var style = G.geo.set[name].style(properties);

                            var popupContent = [];
                            for (var p in properties) {
                                if (p !== 'Gid') {
                                    var tempString = p + "：" + properties[p];
                                    if (G.util.contain(tempString, 'script ')) {
                                        popupContent.push(tempString);
                                    } else {
                                        var element = document.createElement('div');
                                        element.innerHTML = tempString;
                                        popupContent.push(element);
                                    }
                                }
                            }

                            // if (feature.type !== 1) {
                            //  popupContent.push(G.ui.layerToEditButton(feature, style, gmap));
                            // }

                            var defaultPopupContentView = G.ui.popupContent(popupContent)
                            if (popupContentView) {
                                defaultPopupContentView = popupContentView(properties, map, popup)
                            }
                            defaultPopupContentView = G.ui.Zone_PopupInfoWindow[name](properties, map, popup)

                            popup.setLatLng(latlng)
                                // .setContent(G.ui.popupContent(popupContent))
                                .setContent(defaultPopupContentView)
                                .openOn(map);
                            if (drag) {
                                var draggable = new L.Draggable(popup._container, popup._wrapper);
                                draggable.enable();
                            }
                        }
                    }
                    return inside;
                });
                return inside;
            });
        } else {
            name = layerOptions;
            if (G.geo.tile.indices[name] && vtLayers[name].getContainer().style.display === '') {
                var vectorTile = G.geo.tile.indices[name].getTile(tileZ, tileX, tileY);
                var outOfBounds = G.geo.tile.indices[name].outOfBounds[["tile", tileZ, tileX, tileY].join("-")];
                var features = vectorTile && vectorTile.features ? vectorTile.features : [];
                features = outOfBounds ? features.concat(outOfBounds) : features;
                features.some(function (feature) {
                    if (feature.type === 1) {
                        var style = feature.style;
                        if (feature.style && feature.style.iconUrl) {
                            var style = feature.style;
                            var geometry = feature.geometry[0];
                            var bbox = [geometry[0] - style.iconAnchor[0] * 16, geometry[1] - style.iconAnchor[1] * 16];
                            bbox = bbox.concat([bbox[0] + style.iconSize[0] * 16, bbox[1] + style.iconSize[1] * 16]);
                            inside = G.util.bboxContainsPoint(ePoint, bbox);
                        } else {
                            inside = G.util.circleContainsPoint(ePoint, feature.geometry, 3 * 16, 0.4 * 16, true);
                        }
                    } else if (feature.type === 2) {
                        inside = G.util.polylineContainsPoint(ePoint, feature.geometry, 10 * 16);
                    } else if (feature.type === 3) {
                        inside = G.util.polygonContainsPoint(ePoint, feature.geometry);
                    }

                    if (inside) {
                        mapContainer.style.cursor = 'pointer';
                        if (click) {
                            var popupContent = [];
                            var properties = feature.tags;
                            if (G.util.contain(name, "潛勢")) {
                                var style = G.geo.set["Liquefaction"].style(properties);
                                popupContent = G.geo.set["Liquefaction"].set(properties);
                            } else {
                                var style = G.geo.set["SensitiveArea"].style(properties);
                                popupContent = G.geo.set["SensitiveArea"].set(name);
                            }

                            // if (feature.type !== 1) {
                            //  popupContent.push(G.ui.layerToEditButton(feature, style, gmap));
                            // }

                            popup.setLatLng(latlng)
                                .setContent(G.ui.popupContent(popupContent))
                                .openOn(map);
                        }
                    }
                    return inside;
                });
            }
            //if (G.util.contain(name, 'sensitive_')) { name = G.util.remove(name, 'sensitive_') }

        }
    };
};
G.vectorTile.mouseLayerEvent = function (map, name, click, popupContentView, drag) {
    var mapContainer = map.getContainer();
    var popup = L.popup();

    return function (e) {
        var tempTile = map.getPanes().tilePane.querySelector('.leaflet-tile');
        var x = ((e.layerPoint.x - parseInt(tempTile.style.left)) % 256 + 256) % 256;
        var y = ((e.layerPoint.y - parseInt(tempTile.style.top)) % 256 + 256) % 256;

        //event point
        var ePoint = L.point([x * 16, y * 16]);
        var latlng = e.latlng;
        var tileZ = map.getZoom();
        var tileX = Math.floor((latlng.lng + 180) / 360 * Math.pow(2, tileZ));
        var tileY = (Math.floor((1 - Math.log(Math.tan(latlng.lat * Math.PI / 180) + 1 / Math.cos(latlng.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, tileZ)));

        var inside = false;
        mapContainer.style.cursor = '';

        var vectorTile = G.geo.tile.indices[name] ? G.geo.tile.indices[name].getTile(tileZ, tileX, tileY) : null;
        var outOfBounds = G.geo.tile.indices[name] ? G.geo.tile.indices[name].outOfBounds[["tile", tileZ, tileX, tileY].join("-")] : null;
        var features = vectorTile && vectorTile.features ? vectorTile.features : [];
        features = outOfBounds ? features.concat(outOfBounds) : features;
        features.some(function (feature) {
            if (feature.type === 1) {
                var style = feature.style;
                if (feature.style && feature.style.iconUrl) {
                    var style = feature.style;
                    var geometry = feature.geometry[0];
                    var bbox = [geometry[0] - style.iconAnchor[0] * 16, geometry[1] - style.iconAnchor[1] * 16];
                    bbox = bbox.concat([bbox[0] + style.iconSize[0] * 16, bbox[1] + style.iconSize[1] * 16]);
                    inside = G.util.bboxContainsPoint(ePoint, bbox);
                } else if (feature.style) {
                    // console.log('喔齁');
                } else {
                    inside = G.util.circleContainsPoint(ePoint, feature.geometry, 12 * 16, 0.4 * 16, true);
                }
            } else if (feature.type === 2) {
                inside = G.util.polylineContainsPoint(ePoint, feature.geometry, 10 * 16);
            } else if (feature.type === 3) {
                inside = G.util.polygonContainsPoint(ePoint, feature.geometry);
            }

            if (inside) {
                mapContainer.style.cursor = 'pointer';
                if (click) {
                    var popupContent = [];
                    var properties = feature.tags;
                    var style = G.geo.set[name].style(properties);

                    var popupContent = [];
                    for (var p in properties) {
                        if (p !== 'Gid') {
                            var tempString = p + "：" + properties[p];
                            if (G.util.contain(tempString, 'script ')) {
                                popupContent.push(tempString);
                            } else {
                                var element = document.createElement('div');
                                element.innerHTML = tempString;
                                popupContent.push(element);
                            }
                        }
                    }

                    // if (feature.type !== 1) {
                    //  popupContent.push(G.ui.layerToEditButton(feature, style, gmap));
                    // }

                    var defaultPopupContentView
                    if (popupContentView) {
                        defaultPopupContentView = popupContentView(properties, map, popup)
                    }

                    if (defaultPopupContentView) {
                        popup.setLatLng(latlng)
                            // .setContent(G.ui.popupContent(popupContent))
                            .setContent(defaultPopupContentView)
                            .openOn(map);
                        if (drag) {
                            var draggable = new L.Draggable(popup._container, popup._wrapper);
                            // popup.dragging = draggable;
                            defaultPopupContentView.dragging = draggable;
                            draggable.enable();
                        }
                    }
                }
            }
            return inside;
        });
        return inside;
    };
};
//SVG
G.svg = {};

G.svg.cloud_upload = function(oSize) {
    var size = oSize ? oSize : 30;
    return '<svg fill="#000000" height="' + size + '" viewBox="0 0 24 24" width="' + size + '" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M0 0h24v24H0z" fill="none"/>' +
        '<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>' +
        '</svg>';
};

G.svg.burst_mode = function(oSize) {
    var size = oSize ? oSize : 30;
    return '<svg fill="#000000" height="' + size + '" viewBox="0 0 24 24" width="' + size + '" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M0 0h24v24H0V0z" fill="none"/>' +
        '<path d="M1 5h2v14H1zm4 0h2v14H5zm17 0H10c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zM11 17l2.5-3.15L15.29 16l2.5-3.22L21 17H11z"/>' +
        '</svg>';
};

G.svg.geo = function(oSize) {
    var size = oSize ? oSize : 30;
    return '<svg fill="#000000" height="' + size + '" viewBox="0 0 512 512" width="' + size + '" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M0 0h512v512H0z" fill="none"/>' +
        '<path d="m293.18986,85.73065l-279.3125,80.03125l0,99.8125c0,0 108.38275,70.7285 118.09375,170.5625l36.5,-38.46875l22.9375,-38.0625l20.1875,10.90625l112.28125,-40.8125c0,0 7.36725,15.13475 22.90625,28.34375c15.539,13.207 32.24999,22.15625 32.24999,22.15625l40.7813,-53.21875l-12.0313,-17.875c0,0 14.3575,-22.44725 29.9375,-26.15625c28.582,-6.806 26.6958,13.3765 60.9688,1.6875l0,-106.84375l-205.50004,-92.0625zm5.9375,48.6875c8.538,0 16.88325,0.769 24.78125,2.25c3.202,0.601 5.52875,1.543 7.59375,2.375c2.041,0.821 3.79325,1.50675 6.15625,1.84375c1.332,0.191 3.5345,0.4295 6.0625,0.6875c7.521,0.768 17.81025,1.80475 22.28125,3.59375c3.457,1.384 5.1645,4.17275 6.81254,6.84375c1.563,2.535 3.0447,4.931 6.0937,6.375c4.647,2.201 11.28,2.4375 15.875,2.4375c1.292,0 2.4925,-0.01125 3.5625,-0.03125c0.883,-0.016 1.696,-0.03125 2.375,-0.03125c0.114,0 11.4428,0.12475 12.4688,4.46875c0.271,1.146 -0.089,2.684 -1.9688,3.625c-1.175,0.587 -3.0605,1.06425 -5.4375,1.65625c-2.373,0.591 -7.8235,1.957 -8.9375,3.125c0.109,1.343 1.042,3.26475 1.875,4.96875c1.1,2.247 2.25,4.55925 2.25,6.78125c0,3.464 -2.4782,7.15625 -9.4062,7.15625c-0.879,0 -1.8063,-0.0655 -2.7813,-0.1875l-1.6562,-0.1875c-4.925,-0.62 -8.3683,-1.07 -11.2813,-1c-2.678,0.061 -3.7092,0.83 -3.90624,1c-0.766,1.133 -6.65425,9.4675 -15.03125,11.0625c-4.823,0.919 -8.68225,1.0965 -13.15625,1.3125c-2.967,0.143 -6.32625,0.30375 -10.40625,0.71875c-9.184,0.933 -20.48875,5.57225 -21.59375,6.03125c-1.472,0.758 -15.138,7.419 -42.625,9.125c-3.536,0.22 -9.81575,1.328 -17.09375,2.625c-13.762,2.457 -32.60325,5.84375 -48.15625,5.84375c-3.674,0 -7.0625,-0.1885 -10.0625,-0.5625c-4.566,-0.566 -7.18975,-1.4905 -10.21875,-2.5625c-2.844,-1.008 -6.0535,-2.15825 -11.9375,-3.40625c-12.146,-2.575 -23.635,-4.14125 -23.75,-4.15625l-0.3125,-0.0312c-0.019,-0.005 -2.72675,-0.71875 -7.46875,-0.71875c-4.743,0 -12.3895,0.7145 -21.8125,4.0625c-1.613,0.572 -3.64325,0.875 -6.03125,0.875c-2.661,0 -4.87475,-0.359 -4.96875,-0.375l-0.375,-0.0625l-1.40625,-0.71875c-2.833,-0.262 -6.41125,-1.0035 -7.40625,-3.8125c-0.675,-1.906 0.2555,-3.7385 1.3125,-4.8125c2.237,-2.695 5.18325,-4.61375 8.03125,-6.46875c5.561,-3.62 10.82475,-7.054 12.84375,-16.25c0.981,-4.471 5.54275,-8.84675 9.96875,-13.09375c2.141,-2.055 4.17,-3.9945 5.5,-5.6875c0.956,-1.217 1.75125,-2.46525 2.53125,-3.65625c2.499,-3.813 5.0735,-7.73925 12.0625,-10.28125c3.781,-1.374 10.479,-3.291 20.875,-4.5l0.1875,0c8.191,-0.961 11.181,-2.1215 18.625,-5.3125c5.314,-2.277 14.36075,-3.926 22.34375,-5.375c3.908,-0.71 7.60675,-1.379 10.09375,-2c3.513,-0.879 10.03525,-1.0155 18.28125,-1.1875c10.398,-0.217 23.32775,-0.472 34.59375,-2.375c7.791,-1.314 15.784,-2 23.75,-2l0,-0.00005zm0,5c-7.688,0 -15.38925,0.6685 -22.90625,1.9375c-11.628,1.963 -24.78175,2.2165 -35.34375,2.4375c-7.618,0.158 -14.19025,0.29025 -17.15625,1.03125c-2.646,0.662 -6.41525,1.36975 -10.40625,2.09375c-7.338,1.332 -16.48625,2.97625 -21.28125,5.03125c-8.074,3.46 -11.394,4.6785 -20,5.6875l-0.1875,0c-9.916,1.152 -16.22,2.93575 -19.75,4.21875c-5.427,1.974 -7.26275,4.78775 -9.59375,8.34375c-0.838,1.279 -1.69325,2.58375 -2.78125,3.96875c-1.546,1.968 -3.69775,4.03875 -5.96875,6.21875c-3.706,3.557 -7.9065,7.5765 -8.5625,10.5625c-2.458,11.197 -9.418,15.741 -15,19.375c-2.638,1.717 -5.124,3.3405 -6.875,5.4375c0.549,0.184 1.52,0.40625 3.125,0.53125l0.46875,0.0312l1.59375,0.78125c0.652,0.088 2.11525,0.28125 3.78125,0.28125c1.792,0 3.316,-0.21875 4.375,-0.59375c10.094,-3.587 18.33175,-4.34375 23.46875,-4.34375c4.813,0 7.85275,0.6375 8.59375,0.8125c1.339,0.183 12.35475,1.7245 23.96875,4.1875c6.206,1.316 9.75275,2.58775 12.59375,3.59375c2.979,1.055 5.12925,1.8125 9.15625,2.3125c2.795,0.346 5.9695,0.53125 9.4375,0.53125c15.11,0 33.69925,-3.33 47.28125,-5.75c7.734,-1.379 13.8655,-2.48175 17.6875,-2.71875c27.312,-1.693 40.52625,-8.52575 40.65625,-8.59375l0.1875,-0.0937c0.516,-0.22 12.77825,-5.3825 23.15625,-6.4375c4.213,-0.428 7.62825,-0.604 10.65625,-0.75c4.287,-0.207 7.98875,-0.36575 12.46875,-1.21875c5.604,-1.068 10.472,-6.87925 11.875,-9.03125c0.358,-0.529 2.32525,-2.997 7.90629,-3.125c3.251,-0.068 6.858,0.38425 12,1.03125l1.6562,0.21875c0.771,0.096 1.4843,0.125 2.1563,0.125c1.642,0 4.4062,-0.27225 4.4062,-2.15625c0,-1.065 -0.9087,-2.93775 -1.7187,-4.59375c-1.18,-2.411 -2.4063,-4.90225 -2.4063,-7.40625c0,-4.283 5.7543,-5.9515 11.6563,-7.4375c-0.912,-0.111 -1.8653,-0.1875 -2.7813,-0.1875c-0.653,0 -1.4322,0.01625 -2.2812,0.03125c-1.097,0.02 -2.3313,0.03125 -3.6563,0.03125c-5.078,0 -12.4732,-0.3055 -18.0312,-2.9375c-4.388,-2.08 -6.48654,-5.491 -8.18754,-8.25c-1.388,-2.25 -2.48125,-4.0415 -4.40625,-4.8125c-3.819,-1.528 -14.1195,-2.58625 -20.9375,-3.28125c-2.582,-0.264 -4.819,-0.4845 -6.25,-0.6875c-2.962,-0.424 -5.19875,-1.3235 -7.34375,-2.1875c-1.941,-0.781 -3.93925,-1.58475 -6.65625,-2.09375c-7.595,-1.425 -15.61275,-2.15625 -23.84375,-2.15625zm-16.5625,5.21875c0.73694,0.0092 1.45137,0.04425 2.09375,0.09375c5.138,0.396 6.7525,2.17725 6.6875,3.28125c-0.055,0.928 -5.28125,1.375 -5.28125,1.375c0,0 -2.55825,0.18875 -6.90625,1.34375c-4.346,1.154 -10.668,5.19 -13.875,11c-2.032,3.678 -6.69,2.80075 -7.875,1.21875c-1.427,-1.901 -3.53225,-1.60075 -5.03125,-1.21875c-2.649,0.68 -3.78125,2.78125 -3.78125,2.78125c0,0 -3.93175,7.3365 -7.09375,9.3125c-3.161,1.977 -7.53125,-1.96875 -7.53125,-1.96875c-1.185,-2.766 2.375,-3.96875 2.375,-3.96875c0,0 2.08325,-0.40425 3.65625,-2.28125c1.572,-1.875 0.82625,-3.40675 2.28125,-5.59375c1.457,-2.188 1.5125,-2.576 5.6875,-4.875c5.199,-2.865 10.904,-1.4345 13,-1.9375c3.026,-0.726 2.30225,-1.63725 5.40625,-4.28125c3.913,-3.3355 11.02892,-4.3457 16.1875,-4.28125zm-28.34375,1.28125c1.13241,-0.0048 3.229,0.18425 1.75,1.71875c-1.67,1.731 -4.69775,1.02325 -9.71875,2.15625c-14.253,3.216 -17.556,10.7695 -37.625,10.4375c-12.008,-0.2 -18.65475,2.2065 -25.71875,4.5625c-7.065,2.355 -4.3715,1.33475 -7.0625,2.34375c-2.69,1.01 -14.43725,1.9385 -20.15625,6.3125c-5.72,4.373 -17.995,12.33075 -16.625,9.46875c0,0 11.257,-12.9675 14.5,-17.1875c3.426,-4.46 17.44075,-5.1015 20.46875,-5.4375c3.029,-0.338 4.95075,-0.72475 8.96875,-1.09375c4.021,-0.371 9.1155,-3.685 21.5625,-6.375c12.448,-2.692 15.7035,-5.126 22.8125,-5.25c7.111,-0.123 26.1875,-1.625 26.1875,-1.625c0,0 0.27878,-0.02966 0.65625,-0.03125zm50.21875,0.09375c0.68897,0.0043 1.6345,0.1375 2.84375,0.40625c4.835,1.075 5.6405,3.30625 5.4375,4.90625c-0.762,6.023 -11.9375,7.84375 -11.9375,7.84375c-8.06,2.15 -19.118,2.054 -21,1.25c-1.881,-0.808 -1.2315,-1.5685 2.6875,-4.5625c4.064,-3.105 8.8125,-3.4375 8.8125,-3.4375c3.604,-0.473 5.79775,-1.06075 6.84375,-1.21875c8.865,-1.344 5.5625,-3.40625 5.5625,-3.40625c-1.20825,-0.8055 -1.31691,-1.79405 0.75,-1.78125zm21.625,1.34375c2.842,2.436 17.8365,3.18 23.9375,3.25c8.902,0.104 12.1225,3.15675 9.6875,3.96875c-2.435,0.812 -29.04675,3.1605 -33.96875,4.4375c-9.254,2.403 -4.93575,-1.90775 -2.09375,-4.34375c2.842,-2.437 2.4375,-7.3125 2.4375,-7.3125zm-120.46875,16.84375c4.17834,0.08409 1.65075,1.179 -0.375,2.53125l-2.71875,1.78125l-11.6875,9.03125c0,0 -19.82075,2.677 -16.21875,-1.375c0,0 11.7045,-10.7865 24.3125,-11.6875c3.15175,-0.22525 5.29472,-0.30928 6.6875,-0.28125zm-185.25,8.1875c0,0 13.26575,8.59775 19.09375,12.09375c5.828,3.496 34.642,32.559 37.75,34.5c3.107,1.943 17.8885,23.31075 22.9375,31.46875c5.051,8.158 40.78125,52.8125 40.78125,52.8125l7,8.5625c6.992,8.547 16.3125,61.75 16.3125,61.75l-10.875,19.4375c-1.553,-31.078 -17.3285,-67.8375 -26.4375,-80.8125c-12.818,-18.26 -15.9275,-13.5925 -45.0625,-52.4375c-20.24,-26.986 -61.5,-53.96875 -61.5,-53.96875l0,-33.40625zm325.3125,4.34375c0.67613,0.0205 1.411,0.3445 2.3125,1c0,0 1.353,3.76075 -1,5.09375c-2.578,1.462 -5.27675,1.81325 -8.71875,1.15625c-3.441,-0.655 -5.4535,-1.0625 -6.4375,-1.0625c-0.984,0 -4.91625,-0.2365 -5.40625,-0.1875c-3.121,0.313 -9.28125,-2.1875 -9.28125,-2.1875c-1.146,-0.818 -0.633,-0.51575 -1.125,-0.84375c-0.492,-0.328 -1.31675,-1.96875 2.78125,-1.96875c4.098,0 3.12125,0.5155 8.53125,0.1875c5.41,-0.328 6.71275,-0.1795 8.84375,0.3125l2.125,0.5c0,0 4.09425,-0.0093 5.40625,-1.15625c0.656,-0.5735 1.29262,-0.86425 1.96875,-0.84375zm11.5,0.53125c2.35613,-0.00037 5.09775,0.38675 5.34375,0.46875c0.492,0.164 1.31475,0.1485 1.96875,0.3125c0.656,0.164 7.375,0.8125 7.375,0.8125c0,0 1.79649,-0.31275 1.18749,1.03125c-0.52,1.143 -4.11874,0.504 -8.21874,3.125c-4.098,2.623 -3.47725,3.88025 -5.28125,2.40625c-1.803,-1.475 -5.40625,-6.375 -5.40625,-6.375c-1.3115,-1.3935 0.67512,-1.78088 3.03125,-1.78125zm-146.125,6c1.27969,-0.0125 2.32825,0.89025 0.625,2.34375c-1.404,1.195 -19.515,10.30575 -26.125,8.96875c-6.606,-1.337 -14.40925,-7.17925 -7.65625,-8.53125c6.754,-1.35 14.39075,-0.4375 19.34375,-0.4375c4.953,0 11.12525,-1.22425 12.53125,-2.03125c0.38525,-0.22075 0.85469,-0.30833 1.28125,-0.3125zm96.15625,0.34375c0.45428,-0.0671 1.01313,0.11312 1.78125,0.625c2.458,1.638 4.9375,1.96875 4.9375,1.96875c0,0 2.777,1.4535 6.875,2.4375c4.098,0.983 0.98175,1.1465 -3.28125,1.3125c-4.262,0.162 -6.55075,1.14875 -11.46875,1.96875c-4.918,0.82 -18.375,-2.125 -18.375,-2.125c-1.803,-2.13 7.70675,-1.6495 11.96875,-1.8125c4.262,-0.164 4.73675,-0.42575 5.59375,-1.96875c0.56375,-1.01406 0.96933,-2.25871 1.96875,-2.40625zm189.09374,1.75l0,29.40625c0,0 -18.7027,14.04625 -45.9687,15.53125c-21.318,1.16 -32.625,9.8125 -32.625,9.8125c-14.068,12.277 -40.1875,20.84375 -40.1875,20.84375c0,0 -5.83379,-5.119 -21.09379,-7.75c-18.458,-3.183 -34.375,0 -34.375,0c0,0 55.35229,-21.88275 61.90629,-24.21875c18.158,-6.475 21.7975,-4.79275 36.0625,-9.46875c31.617,-10.364 76.2812,-34.15625 76.2812,-34.15625zm-148.40624,2.65625c1.85569,-0.17227 5.15625,1.28125 5.15625,1.28125c3.279,0.983 1.6825,4.38425 -2.6875,4.28125c-1.965,-0.047 -11.02875,-0.858 -14.46875,0.5c-8.426,3.33 -12.625,2.3125 -12.625,2.3125c0,0 -4.76575,-2.6095 -2.46875,-2.9375c2.295,-0.326 3.57225,-0.9375 6.03125,-0.9375c2.459,0 5.54025,-1.60575 6.78125,-2.46875c2.393,-1.664 6.22075,-0.1405 8.84375,0.1875c2.623,0.326 3.758,0.756 4.25,-1.375c0.123,-0.53275 0.56894,-0.78633 1.1875,-0.84375zm-194.25,2.65625c1.167,-0.0171 2.21412,0.0415 3.09375,0.125c2.028,0.193 3.05625,0.25425 3.53125,0.28125c-0.799,-0.176 1.106,0.063 0,0c0.045,0.011 0.0892,0.0233 0.15625,0.0312c5.533,0.693 10.7825,3.392 4.6875,6.375c-7.519,3.681 -13.975,5.37775 -19.25,6.59375c-4.357,1.006 -18.79425,3.2555 -18.78125,1.3125c0.009,-1.332 14.2395,-3.74375 15.1875,-4.21875c3.98,-1.989 2.21975,-5.24325 -3.78125,-2.53125c-11.744,5.307 -9.9375,1.59375 -9.9375,1.59375c2.93212,-6.74537 16.92475,-9.44256 25.09375,-9.5625l0,0.00005zm108.75,2.5625c6.35126,-0.13967 14.35563,1.37375 24.90625,3.25c16.881,3.001 27.81075,2.5205 29.09375,3.9375c2.371,2.617 -13.123,2.21875 -17.625,1.84375c-4.5,-0.374 -17.871,1.65525 -30.625,4.28125c-12.756,2.625 -23.40025,1.3125 -36.53125,0.5625c-6.719,-0.384 -15.15225,-1.58425 -27.53125,4.96875c-18.352,9.715 -20.78125,4.09375 -20.78125,4.09375c0,0 6.80075,-4.4295 9.84375,-5.4375c7.254,-2.402 11.96875,-3.84375 11.96875,-3.84375c0,0 7.123,-1.96675 10.5,-4.59375c3.375,-2.625 6.5,-3.59275 7.625,-4.34375c1.125,-0.75 7.3105,0.1865 11.8125,1.3125c4.502,1.125 9.998,0.40725 17.5,-3.71875c2.81325,-1.54725 6.03299,-2.2287 9.84375,-2.3125zm-64.09375,5.90625c4.07088,-0.13663 7.15625,0.725 7.15625,1.625c0,1.802 -6.77,3.148 -14.875,6.75c-8.105,3.602 -12.74275,6.28325 -14.09375,4.03125c-1.35,-2.251 8.6875,-8.0625 8.6875,-8.0625c3.9785,-3.0555 9.05412,-4.20712 13.125,-4.34375zm-27.21875,2.53125c1.91335,-0.0198 3.65844,0.36175 5.09375,1.375c0,0 -7.12225,3.35475 -6.15625,6.84375c0.965,3.49 -22.95525,2.7405 -18.40625,-0.1875c0,0 11.17756,-7.94551 19.46875,-8.03125zm-78.15625,21l117.96875,73.84375l0,16.625c0,0 -28.85,-14.09925 -37.125,-17.28125c-8.274,-3.184 -28.4575,-4.9005 -32.0625,-8.8125c-3.605,-3.912 -16.94475,-27.488 -25.21875,-35.125c-8.274,-7.637 -22.9255,-25.432 -23.5625,-29.25zm239.09375,36.65625c9.62692,0.11713 20.89738,1.946 32.28125,7.4375c24.32599,11.736 53.28129,60.875 53.28129,60.875l-9.375,12.9375c0,0 -17.8728,-29.92975 -31.4688,-45.46875c-13.59799,-15.539 -41.20299,-19.414 -60.62499,-18.25c-19.424,1.166 -101.9375,36.40625 -101.9375,36.40625l0,-17.0625l90.28125,-32.5625c0,0 11.51763,-4.50771 27.5625,-4.3125zm0.0937,70.4375c3.36529,-0.0462 13.6355,1.18887 27.5,15.65625c17.06399,17.805 18.78129,29.3125 18.78129,29.3125c0,0 -30.23979,-16.994 -47.46879,-44.875c0,0 0.41089,-0.0831 1.1875,-0.0937l0,-0.00005z"/>' +
        '</svg>';
};

G.svg.tile = function(oSize) {
    var size = oSize ? oSize : 30;
    return '<svg fill="#000000" height="' + size + '" viewBox="0 0 512 512" width="' + size + '" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M0 0h512v512H0z" fill="none"/>' +
        '<path d="m18.99232,77.95844c-8.038,0 -14.5624,6.5245 -14.5624,14.5625l0,233.4375c0,8.039 6.5244,14.5625 14.5624,14.5625l368,0c8.04,0 14.5626,-6.5235 14.5626,-14.5625l0,-233.4375c0,-8.038 -6.5216,-14.5625 -14.5626,-14.5625l-368,0zm32.25,18.875l85.8438,0l0,11.9687l-85.8438,0c-3.9429,0 -7.1562,3.1848 -7.1562,7.0938l0,51l-12.1875,0l0,-51c0,-10.502 8.6868,-19.0625 19.3437,-19.0625zm217.6563,0l85.8437,0c10.658,0 19.3438,8.5605 19.3438,19.0625l0,51l-12.1875,0l0,-51c0,-3.909 -3.2112,-7.0938 -7.1563,-7.0938l-85.8437,0l0,-11.9687zm-63.9687,43.9687l0.1874,0c6.7271,0 12.1876,5.4605 12.1876,12.1876l0,43.4062l43.4374,0c6.7271,0 12.1563,5.4605 12.1563,12.1875l0,0.1875c0,6.727 -5.4292,12.1875 -12.1563,12.1875l-43.4374,0l0,43.4063c0,6.728 -5.4615,12.1874 -12.1876,12.1874l-0.1874,0c-6.7271,0 -12.1563,-5.4594 -12.1563,-12.1874l0,-43.4063l-43.4375,0c-6.727,0 -12.1875,-5.4605 -12.1875,-12.1875l0,-0.1875c0,-6.727 5.4605,-12.1875 12.1875,-12.1875l43.4375,0l0,-43.4062c0,-6.7271 5.4292,-12.1876 12.1563,-12.1876zm222.3124,5.625l0,202.1876c0,7.489 -6.0715,13.5624 -13.5624,13.5624l-330.875,0l0,15.2813c0,7.487 6.0734,13.5313 13.5624,13.5313l342.8126,0c7.4899,0.0009 13.5624,-6.0433 13.5624,-13.5313l0,-217.4687c0,-7.4881 -6.0715,-13.5626 -13.5624,-13.5626l-11.9376,0zm56.4063,73.1563l0,185.2813c0,6.861 -5.5422,12.4374 -12.4063,12.4374l-303.25,0l0,14c0,6.8631 5.5433,12.4376 12.4063,12.4376l314.1875,0c6.863,0 12.4375,-5.5746 12.4375,-12.4376l0,-199.2812c0,-6.861 -5.5745,-12.4375 -12.4375,-12.4375l-10.9375,0zm-451.75,32l12.1875,0l0,51c0,3.909 3.2133,7.0937 7.1562,7.0937l85.8438,0l0,11.9688l-85.8438,0c-10.6569,0 -19.3437,-8.5605 -19.3437,-19.0625l0,-51zm330,0l12.1875,0l0,51c0,10.502 -8.6858,19.0625 -19.3438,19.0625l-85.8437,0l0,-11.9688l85.8437,0c3.9451,0 7.1563,-3.1847 7.1563,-7.0937l0,-51z"/>' +
        '</svg>';
};

G.svg.draw = function(oSize) {
    var size = oSize ? oSize : 30;
    return '<svg fill="#000000" height="' + size + '" viewBox="0 0 512 512" width="' + size + '" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M0 0h512v512H0z" fill="none"/>' +
        '<path d="m23.68554,110.94201c-7.828,0 -14.1562,6.3595 -14.1562,14.1875l0,285.3125c0,7.827 6.3292,14.1875 14.1562,14.1875l461.9688,0c7.827,0 14.1562,-6.3605 14.1562,-14.1875l0,-285.3125c-0.001,-7.828 -6.3292,-14.1875 -14.1562,-14.1875l-461.9688,0zm450.875,5.125c1.098,0.079 2.0773,0.22775 2.9063,0.46875c5.79,1.681 5.4062,6.75 5.4062,6.75c-6.497,8.206 -13.9062,19.1875 -13.9062,19.1875c-3.071,-12.958 -17.0938,-14.9375 -17.0938,-14.9375c9.151,-3.037 22.6875,-11.46875 22.6875,-11.46875zm-27.5625,15.28125c15.598,4.196 16.9063,15.28125 16.9063,15.28125c0,0 -4.805,4.024 -12.375,10.375c0.527,1.725 0.8125,3.57375 0.8125,5.46875l0,210.03125c0,10.311 -8.4088,18.7187 -18.7188,18.7187l-357.875,0c-10.311,0 -18.6875,-8.4087 -18.6875,-18.7187l0,-210.03125c0,-10.311 8.3765,-18.71875 18.6875,-18.71875l356.7188,0c8.786,-7.518 14.5312,-12.40625 14.5312,-12.40625zm-371.25,23.53125c-4.178,0 -7.5937,3.41575 -7.5937,7.59375l0,114.34375c7.81,-10.931 25.5732,-25.0525 38.7812,-30.0625c57.764,-21.91 78.1268,5.03525 74.8438,29.65625c-3.283,24.621 -14.7848,40.229 10.6562,36.125c25.441,-4.104 22.013,11.22695 24.625,18.87505c3.291,9.6379 19.6563,-2.7813 19.6563,-2.7813c-1.427,-1.036 0.25,-2.75 0.25,-2.75l6.375,-9.0313c0,0 0.6482,4.2453 6.5312,5.4063l-9.8437,6.375c0,0 -1.8875,1.035 -3.3125,0c0,0 -5.4303,15.1355 -22.2813,13.3125c-11.406,-1.233 4.2755,-32.68925 -35.9375,-10.5312c-40.213,22.1579 -12.31,-29.56405 -18.875,-60.75005c-6.565,-31.186 -32.825,-27.08275 -56.625,-15.59375c-13.855,6.688 -26.5825,18.662 -34.8125,27.5l0,89.9375c0,4.178 3.3845,7.5937 7.5625,7.5937l357.875,0c4.178,0 7.5938,-3.4157 7.5938,-7.5937l0,-206.84375c-29.741,24.948 -78.8315,65.536 -81.9375,68.5c-17.481,16.687 -65.75,67.90625 -65.75,67.90625c-15.964,-8.539 -23.75,-23 -23.75,-23c0,0 26.336,-20.79525 71.625,-57.40625c3.567,-2.884 47.9645,-41.03025 78.0625,-66.78125l-343.7188,0zm187.375,133.40625c6.071,10.194 22.25,19.34375 22.25,19.34375l-29.0312,11.4687c-8.326,-1.855 -8.8125,-7.1562 -8.8125,-7.1562l15.5937,-23.65625z"/>' +
        '</svg>';
};

G.svg.threed = function(oSize) {
    var size = oSize ? oSize : 30;
    return '<svg fill="#000000" height="' + size + '" viewBox="0 0 512 512" width="' + size + '" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M0 0h512v512H0z" fill="none"/>' +
        '<path d="m25.9036,84.26483c-7.826,0 -14.15625,6.19175 -14.15625,13.84375l0,320.3125c0,7.651 6.33025,13.84375 14.15625,13.84375l459.65625,0c7.828,0 14.1875,-6.19275 14.1875,-13.84375l0,-320.3125c0,-7.652 -6.3595,-13.84375 -14.1875,-13.84375l-459.65625,0zm102.09375,31.1875c1.97962,-0.0215 3.9755,0.0237 6,0.0937c6.904,0.237 13.445,0.97275 19.625,2.21875c6.159,1.242 11.95425,2.97575 17.40625,5.21875c5.434,2.232 10.53525,4.9675 15.28125,8.1875c4.731,3.212 9.09925,6.929 13.15625,11.125c3.333,3.426 6.25,6.92025 8.75,10.53125c0.149,0.214 0.2905,0.44025 0.4375,0.65625l66.6875,-32l96.15625,3.28125c5.242,0.179 10.158,0.4525 14.75,0.8125c4.574,0.361 8.84325,0.80475 12.78125,1.34375c3.93,0.54 7.54075,1.18725 10.84375,1.90625c3.295,0.715 6.2595,1.51425 8.9375,2.40625c3.59,1.209 7.051,2.634 10.375,4.25c3.316,1.615 6.5095,3.4185 9.5625,5.4375c3.043,2.02 5.93775,4.23225 8.71875,6.65625c2.775,2.416 5.44975,5.053 7.96875,7.875c2.516,2.817 4.88075,5.767 7.09375,8.875c2.213,3.105 4.2725,6.351 6.1875,9.75c1.908,3.394 3.67025,6.94 5.28125,10.625c1.609,3.685 3.056,7.524 4.375,11.5c1.314,3.976 2.47475,8.16775 3.46875,12.59375c0.996,4.424 1.818,9.08875 2.5,13.96875c0.678,4.875 1.1975,9.9795 1.5625,15.3125c0.365,5.331 0.578,10.8935 0.625,16.6875c0.05,5.086 -0.0555,9.97575 -0.3125,14.71875c-0.26,4.745 -0.65775,9.31775 -1.21875,13.71875c-0.559,4.401 -1.262,8.6295 -2.125,12.6875c-0.863,4.061 -1.8925,7.9645 -3.0625,11.6875c-1.426,4.554 -3,8.89125 -4.75,13.03125c-1.75,4.148 -3.676,8.10975 -5.75,11.84375c-2.078,3.742 -4.31175,7.26275 -6.71875,10.59375c-2.408,3.338 -4.97775,6.47425 -7.71875,9.40625c-2.068,2.221 -4.33425,4.33175 -6.78125,6.34375c-2.451,2.014 -5.1055,3.947 -7.9375,5.75c-2.836,1.806 -5.8375,3.49975 -9.0625,5.09375c-3.227,1.599 -6.66025,3.08275 -10.28125,4.46875c-2.713,1.029 -5.65375,1.94825 -8.84375,2.78125c-3.195,0.833 -6.6385,1.58375 -10.3125,2.21875c-3.688,0.637 -7.60725,1.185 -11.78125,1.625c-4.186,0.441 -8.6325,0.79225 -13.3125,1.03125l-98.71875,5.09375l-60.78125,-28.375c-2.94,3.959 -6.247,7.803 -10,11.5c-4.467,4.404 -9.2535,8.2875 -14.3125,11.6875c-5.077,3.414 -10.444,6.346 -16.125,8.75c-5.702,2.414 -11.70825,4.2935 -18.03125,5.6875c-6.346,1.401 -13.018,2.3155 -20,2.6875c-6.643,0.354 -13.02225,0.23925 -19.15625,-0.34375c-6.159,-0.584 -12.0545,-1.6565 -17.6875,-3.1875c-5.652,-1.537 -11.04025,-3.53925 -16.15625,-6.03125c-5.133,-2.502 -9.9805,-5.50275 -14.5625,-8.96875c-4.595,-3.477 -8.74425,-7.23975 -12.40625,-11.34375c-3.668,-4.115 -6.87075,-8.5735 -9.59375,-13.3125c-0.4864,-0.84688 -0.95277,-1.69466 -1.40625,-2.5625c-0.097,-0.186 -0.18425,-0.3745 -0.28125,-0.5625c-5.37328,-10.21139 -10.7526,-20.41253 -16.125,-30.625c-0.796,-1.514 -1.5255,-3.05625 -2.1875,-4.65625c-0.658,-1.601 -1.25525,-3.2495 -1.78125,-4.9375c-0.523,-1.686 -0.95575,-3.4155 -1.34375,-5.1875c-0.387,-1.771 -0.71675,-3.5805 -0.96875,-5.4375l38.96875,-5.1875l31.28125,18.96875c0.402,2.781 0.962,5.41225 1.625,7.90625c0.17,-0.022 0.332,-0.0375 0.5,-0.0625c0.349,-0.052 0.68825,-0.1195 1.03125,-0.1875c0.192,-0.037 0.40575,-0.0537 0.59375,-0.0937c0.359,-0.074 0.7095,-0.162 1.0625,-0.25c0.159,-0.04 0.31075,-0.08 0.46875,-0.125c0.551,-0.148 1.092,-0.321 1.625,-0.5c0.132,-0.046 0.27425,-0.10725 0.40625,-0.15625c0.422,-0.147 0.838,-0.29675 1.25,-0.46875c0.147,-0.063 0.2915,-0.1235 0.4375,-0.1875c0.473,-0.205 0.94625,-0.42425 1.40625,-0.65625c0.05,-0.026 0.076,-0.0395 0.125,-0.0625c0.5,-0.263 1.013,-0.55375 1.5,-0.84375c0.132,-0.081 0.243,-0.166 0.375,-0.25c0.397,-0.246 0.7975,-0.48 1.1875,-0.75c0.117,-0.081 0.22575,-0.167 0.34375,-0.25c0.477,-0.343 0.94625,-0.71375 1.40625,-1.09375c0.092,-0.075 0.18925,-0.14075 0.28125,-0.21875c0.374,-0.317 0.76,-0.664 1.125,-1c0.13,-0.122 0.25,-0.22175 0.375,-0.34375c0.442,-0.423 0.8885,-0.8535 1.3125,-1.3125c1.351,-1.457 2.52525,-3.02775 3.53125,-4.71875c1.003,-1.691 1.80675,-3.5105 2.46875,-5.4375c0.66,-1.926 1.15075,-3.962 1.46875,-6.125c0.319,-2.165 0.4615,-4.471 0.4375,-6.875c-0.021,-2.274 -0.18525,-4.4065 -0.53125,-6.4375c-0.345,-2.034 -0.86325,-3.959 -1.53125,-5.75c-0.668,-1.793 -1.506,-3.48025 -2.5,-5.03125c-0.992,-1.556 -2.14775,-2.96625 -3.46875,-4.28125c-0.165,-0.166 -0.33,-0.31475 -0.5,-0.46875c-0.026,0.004 -0.0678,-0.005 -0.0937,0l-36.75,-4.40625l4.0625,-29.90625l9.9375,-2.40625l13.875,-3.78125c0.126,-0.098 0.253,-0.18025 0.375,-0.28125c1.373,-1.133 2.56975,-2.3705 3.59375,-3.6875c1.022,-1.316 1.85925,-2.71775 2.53125,-4.21875c0.463,-1.033 0.85725,-2.09675 1.15625,-3.21875l-0.0625,-0.34375l0.15625,-0.0312c0.098,-0.392 0.172,-0.7865 0.25,-1.1875c0.327,-1.688 0.48375,-3.47175 0.46875,-5.34375c-0.019,-1.593 -0.13725,-3.09725 -0.40625,-4.53125c-0.267,-1.436 -0.6705,-2.7875 -1.1875,-4.0625c-0.519,-1.274 -1.1675,-2.47975 -1.9375,-3.59375c-0.77,-1.117 -1.6645,-2.13575 -2.6875,-3.09375c-1.022,-0.956 -2.1215,-1.80925 -3.3125,-2.53125c-1.188,-0.725 -2.4545,-1.3245 -3.8125,-1.8125c-0.824,-0.297 -1.70775,-0.539 -2.59375,-0.75c-0.382,1.867 -0.67725,3.80775 -0.90625,5.84375l-31.4375,18.75l-37.1875,-5.96875c0.475,-2.234 0.9915,-4.3755 1.5625,-6.4375c0.573,-2.063 1.17575,-4.0505 1.84375,-5.9375c0.67,-1.889 1.38925,-3.664 2.15625,-5.375c0.765,-1.714 1.60575,-3.36625 2.46875,-4.90625c6.01985,-10.73211 12.04462,-21.45739 18.0625,-32.1875c0.034,-0.059 0.0618,-0.1285 0.0937,-0.1875c1.57655,-2.81293 3.26571,-5.40504 5.0625,-7.8125c1.881,-2.523 3.9315,-4.893 6.1875,-7.125c2.251,-2.229 4.6925,-4.315 7.3125,-6.25c2.616,-1.935 5.42325,-3.731 8.40625,-5.375c2.976,-1.641 6.13075,-3.151 9.46875,-4.5c3.332,-1.35 6.75925,-2.49675 10.28125,-3.46875c3.516,-0.974 7.1105,-1.776 10.8125,-2.375c3.693,-0.598 7.499,-0.99075 11.375,-1.21875c1.935,-0.114 3.89538,-0.19725 5.875,-0.21875l0,-0.00005zm144.4375,10.71875l-62.15625,29.8125c1.607,2.604 3.02775,5.2405 4.21875,7.9375c0.304,0.687 0.56775,1.39975 0.84375,2.09375l57.28125,-21.875l-0.1875,-17.96875zm0.21875,22.09375l-55.96875,21.40625c0.636,1.948 1.16375,3.90625 1.59375,5.90625c0.428,1.992 0.74375,4.0155 0.96875,6.0625l53.5625,-17.9375l-0.15625,-15.4375zm-140.71875,13.9375c-1.7,0 -3.397,0.0945 -5,0.3125c-1.847,0.251 -3.659,0.67175 -5.375,1.21875c-1.715,0.545 -3.3025,1.39575 -4.9375,2.09375c-10.908,4.662 -15.5625,11.53125 -15.5625,11.53125c-0.445,0.83 -0.88525,1.6785 -1.28125,2.5625c-0.583,1.301 -1.0905,2.6445 -1.5625,4.0625l53.625,-15.8125c-0.631,-0.478 -1.30175,-0.957 -1.96875,-1.375c-1.533,-0.963 -3.1935,-1.7835 -4.9375,-2.4375c-1.774,-0.666 -3.6825,-1.16925 -5.6875,-1.53125c-2.029,-0.362 -4.19575,-0.579 -6.46875,-0.625c-0.283,-0.008 -0.56175,0 -0.84375,0zm197.1875,5.25l1.59375,172.75l38.5625,-1.4375c3.561,-0.133 6.8845,-0.31625 9.9375,-0.53125c3.043,-0.216 5.834,-0.48325 8.375,-0.78125c2.533,-0.295 4.80675,-0.62 6.84375,-1c2.039,-0.381 3.85725,-0.788 5.40625,-1.25c2.018,-0.598 3.94125,-1.2935 5.78125,-2.0625c1.842,-0.767 3.584,-1.6255 5.25,-2.5625c1.658,-0.938 3.23175,-1.9525 4.71875,-3.0625c1.484,-1.109 2.8795,-2.31075 4.1875,-3.59375c1.307,-1.278 2.53775,-2.73525 3.71875,-4.40625c1.18,-1.671 2.32,-3.562 3.375,-5.625c1.055,-2.061 2.04075,-4.297 2.96875,-6.75c0.926,-2.45 1.79275,-5.0955 2.59375,-7.9375c0.801,-2.84 1.4725,-5.93525 2.0625,-9.28125c0.592,-3.343 1.08775,-6.93425 1.46875,-10.78125c0.377,-3.85 0.6465,-7.9575 0.8125,-12.3125c0.168,-4.354 0.2295,-8.98075 0.1875,-13.84375c-0.042,-4.861 -0.1955,-9.42275 -0.4375,-13.71875c-0.242,-4.297 -0.58625,-8.3325 -1.03125,-12.0625c-0.441,-3.736 -0.978,-7.17175 -1.625,-10.34375c-0.645,-3.176 -1.403,-6.0735 -2.25,-8.6875c-0.854,-2.614 -1.76925,-5.07225 -2.78125,-7.40625c-1.014,-2.335 -2.1325,-4.54375 -3.3125,-6.59375c-1.18,-2.057 -2.43525,-3.978 -3.78125,-5.75c-1.348,-1.772 -2.76725,-3.384 -4.28125,-4.875c-1.518,-1.491 -3.155,-2.867 -4.875,-4.125c-1.721,-1.266 -3.54275,-2.4075 -5.46875,-3.4375c-1.93,-1.029 -3.95675,-1.952 -6.09375,-2.75c-2.141,-0.802 -4.37175,-1.4935 -6.71875,-2.0625c-1.756,-0.439 -3.9555,-0.8345 -6.5625,-1.1875c-2.607,-0.355 -5.62775,-0.6665 -9.09375,-0.9375c-3.477,-0.271 -7.401,-0.5005 -11.75,-0.6875c-4.359,-0.187 -9.15625,-0.3355 -14.40625,-0.4375l-23.375,-0.46875zm-56.28125,0.34375l-53.3125,17.84375c0.032,0.719 0.0877,1.43425 0.0937,2.15625c0.035,3.834 -0.30375,7.547 -0.96875,11.125l54.3125,-15.59375l-0.125,-15.53125l0.00005,0zm-117.625,3.4375l-56.15625,16.59375c0.37,0.111 0.73575,0.21375 1.09375,0.34375c1.534,0.552 2.98775,1.26875 4.34375,2.09375c1.354,0.823 2.6435,1.778 3.8125,2.875c1.166,1.091 2.20375,2.30375 3.09375,3.59375c0.196,0.285 0.3795,0.578 0.5625,0.875l49.8125,-12.28125c-0.053,-0.352 -0.1235,-0.7165 -0.1875,-1.0625c-0.343,-1.883 -0.834,-3.706 -1.5,-5.375c-0.66,-1.652 -1.48975,-3.20725 -2.46875,-4.65625c-0.704,-1.042 -1.52725,-2.049 -2.40625,-3zm117.8125,16.15625l-55.34375,15.875c-0.129,0.473 -0.26425,0.9695 -0.40625,1.4375c-1.625,5.327 -4.09325,10.35675 -7.40625,15.09375c-0.23,0.327 -0.48075,0.63975 -0.71875,0.96875l64.03125,-16.3125l-0.15625,-17.0625zm-110.90625,1.875l-48.34375,11.9375c0.528,1.361 0.93875,2.8075 1.21875,4.3125c0.298,1.587 0.45175,3.27125 0.46875,5.03125c0.02,2.043 -0.147,4.031 -0.5,5.875l42.96875,-9.46875c0.621,-1.014 1.17825,-2.043 1.65625,-3.125c0.868,-1.959 1.54375,-4.0985 1.96875,-6.3125c0.428,-2.244 0.61875,-4.64225 0.59375,-7.15625c-0.004,-0.369 -0.0192,-0.73075 -0.0312,-1.09375l-0.00005,0zm-123.15625,0.25l-8.28125,16.9375l32.9375,5.28125l23.625,-14.125l-11.0625,-1.84375l-0.59375,-0.0937l-34.59375,-5.8125l-2.03125,-0.34375l0,-0.00005zm234.25,18.96875l-68.21875,17.375c-2.284,2.52 -4.83125,4.94325 -7.65625,7.28125c-1.021,0.844 -2.0935,1.679 -3.1875,2.5l0.0625,6.5l79.1875,-15.1875l-0.1875,-18.46875zm-119.03125,3.3125l-40.4375,8.90625c-0.158,0.416 -0.319,0.81875 -0.5,1.21875c-0.765,1.705 -1.74325,3.3195 -2.90625,4.8125c-0.15,0.194 -0.31175,0.3725 -0.46875,0.5625l26.1875,-5.90625l0.125,-0.0312l0.0937,-0.0312l0.0937,0l0.125,-0.0312l0.21875,-0.0625l0.1875,-0.0312c0.046,-0.011 0.0962,-0.0445 0.15625,-0.0625c0.119,-0.035 0.21975,-0.0647 0.34375,-0.0937c0.64,-0.162 1.3095,-0.34625 1.9375,-0.53125c0.101,-0.029 0.21575,-0.0597 0.34375,-0.0937c0.052,-0.015 0.10825,-0.0152 0.15625,-0.0312l0.0312,0c0.095,-0.036 0.18125,-0.093 0.28125,-0.125c0.087,-0.029 0.1985,-0.0617 0.3125,-0.0937c0.059,-0.018 0.1315,-0.0112 0.1875,-0.0312c0.519,-0.173 1.03175,-0.38175 1.59375,-0.59375c0.104,-0.04 0.18025,-0.0627 0.28125,-0.0937l0.0312,-0.0312c0.025,-0.009 0.0708,-0.0212 0.0937,-0.0312c0.77,-0.301 1.44275,-0.574 2.09375,-0.875c0.083,-0.044 0.14875,-0.094 0.21875,-0.125c0.062,-0.031 0.1165,-0.0647 0.1875,-0.0937l0.0937,-0.0312c0.103,-0.058 0.2055,-0.10325 0.3125,-0.15625c0.579,-0.289 1.09275,-0.591 1.59375,-0.875c0.103,-0.058 0.2135,-0.10425 0.3125,-0.15625l0.0625,-0.0312c0.152,-0.088 0.328,-0.2045 0.5,-0.3125l0.21875,-0.125c0.044,-0.025 0.10525,-0.0647 0.15625,-0.0937l0.0625,-0.0312c0.056,-0.038 0.0992,-0.0587 0.15625,-0.0937c0.337,-0.215 0.68925,-0.4485 1.03125,-0.6875l0.0937,-0.0625l0.1875,-0.15625l0.1875,-0.125l0.0937,-0.0937l0.1875,-0.125c0.085,-0.062 0.169,-0.1225 0.25,-0.1875c0.322,-0.243 0.65475,-0.484 0.96875,-0.75c0.917,-0.762 1.7605,-1.57425 2.5625,-2.40625l0.0004,-0.00095zm-38.8125,17.0625l-32.53125,8.84375l-3.34375,24.71875l30.875,3.71875l0.0312,-0.15625l4.96875,-37.125l0.00005,0zm158.0625,2.09375l-79.1875,15.15625l0.0312,3.15625c2.535,1.056 4.9895,2.2435 7.3125,3.5625c3.085,1.751 5.9715,3.7205 8.6875,5.9375l63.3125,-8.84375l-0.15625,-18.96875l0.00005,0zm-82.21875,6.8125c-3.55,2.462 -7.42625,4.8195 -11.65625,7.0625c4.097,0.814 7.98125,1.88675 11.65625,3.21875c0.037,0.016 0.0557,0.0485 0.0937,0.0625l-0.0937,-10.34375zm82.4375,16.125l-59.53125,8.3125c1.548,1.492 3.0285,3.05375 4.4375,4.71875c2.421,2.856 4.557,5.87425 6.375,9.03125c0.479,0.825 0.90675,1.654 1.34375,2.5l47.5625,-1.625l-0.1875,-22.9375zm-150.15625,13c-1.063,0.211 -2.149,0.40825 -3.25,0.65625c-1.283,0.29 -2.5985,0.62975 -3.9375,0.96875c1.178,1.259 2.23525,2.6185 3.15625,4.0625c1.102,1.721 2.04225,3.5835 2.78125,5.5625c0.317,0.849 0.59175,1.726 0.84375,2.625l-0.0312,-0.875l41.4375,-1.375c-0.02,-0.018 -0.0425,-0.0435 -0.0625,-0.0625c-1.563,-1.581 -3.20825,-2.9765 -4.90625,-4.1875c-1.692,-1.209 -3.50375,-2.27 -5.34375,-3.125c-1.843,-0.854 -3.761,-1.53325 -5.75,-2.03125c-2.005,-0.504 -4.1375,-0.81975 -6.3125,-0.96875l-18.625,-1.25l-0.00005,0zm150.40625,13.84375l-45.8125,1.59375c0.492,1.157 0.954,2.33425 1.375,3.53125c1.223,3.45 2.15125,7.0565 2.78125,10.8125c0.166,0.993 0.3115,1.99 0.4375,3l41.40625,2.75l-0.1875,-21.6875zm-106.1875,1.625l-43.9375,1.4375c0.039,0.211 0.088,0.413 0.125,0.625c0.37,2.183 0.56975,4.5235 0.59375,6.9375c0.024,2.545 -0.12875,4.97725 -0.46875,7.28125c-0.15,1.028 -0.3375,2.04425 -0.5625,3.03125l51.5,3.28125c-0.113,-2.167 -0.32725,-4.279 -0.65625,-6.25c-0.46,-2.756 -1.14525,-5.36525 -2.03125,-7.78125c-0.881,-2.396 -1.97925,-4.65175 -3.28125,-6.71875c-0.399,-0.632 -0.83925,-1.23575 -1.28125,-1.84375zm-104.4375,17.15625l-34.96875,4.65625c0.139,0.772 0.30475,1.52525 0.46875,2.28125c0.372,1.688 0.8165,3.3525 1.3125,4.9375c0.493,1.59 1.0605,3.1675 1.6875,4.6875c0.623,1.507 1.3105,3.0105 2.0625,4.4375l1.625,3.09375l-0.375,-2.71875l2.9375,-0.40625l37.03125,-5.1875l1.28125,-0.1875l10.25,-1.4375l-23.3125,-14.15625zm169.78125,4.125c0.111,1.567 0.1705,3.16325 0.1875,4.78125c0.031,3.405 -0.13275,6.725 -0.46875,10l41.53125,7.9375l-0.1875,-19.96875l-41.0625,-2.75zm-110.59375,1.53125c-0.014,0.048 -0.0173,0.11125 -0.0312,0.15625c-0.725,2.108 -1.649,4.11675 -2.75,5.96875c-1.105,1.862 -2.42225,3.61575 -3.90625,5.21875c-0.421,0.452 -0.85725,0.9095 -1.40625,1.4375c-0.118,0.113 -0.246,0.22175 -0.375,0.34375l-0.0625,0.0625c-0.188,0.176 -0.39275,0.323 -0.59375,0.5l57.59375,10.59375c0.582,-1.274 1.1075,-2.5835 1.5625,-3.9375c0.882,-2.619 1.54475,-5.45025 1.96875,-8.40625c0.376,-2.599 0.56975,-5.34875 0.59375,-8.21875l-52.59375,-3.34375l0,-0.375l-0.00005,0zm-13.40625,16.90625l-0.3125,0.1875c-0.601,0.356 -1.13425,0.6695 -1.65625,0.9375c-0.065,0.035 -0.1265,0.0658 -0.1875,0.0937c-0.493,0.249 -1.0325,0.49175 -1.5625,0.71875c-0.106,0.049 -0.2015,0.08 -0.3125,0.125l-0.15625,0.0625c-0.467,0.192 -0.93125,0.36225 -1.40625,0.53125l-0.0937,0.0625c-0.101,0.037 -0.2105,0.0588 -0.3125,0.0937c-0.618,0.209 -1.2215,0.4005 -1.8125,0.5625c-0.125,0.035 -0.244,0.0598 -0.375,0.0937l-0.15625,0.0312c-0.388,0.1 -0.7865,0.19625 -1.1875,0.28125c-0.198,0.043 -0.408,0.082 -0.625,0.125c-0.37,0.069 -0.76825,0.1305 -1.15625,0.1875c-0.033,0.006 -0.0577,0.0253 -0.0937,0.0312c0.76,2.355 1.609,4.57825 2.625,6.65625c0.15,0.309 0.342,0.60425 0.5,0.90625l50.28125,15.1875c0.113,-0.048 0.2015,-0.077 0.3125,-0.125c0.079,-0.034 0.2085,-0.086 0.3125,-0.125l0.0625,-0.0312c0.077,-0.043 0.13975,-0.089 0.21875,-0.125c0.105,-0.045 0.19525,-0.0577 0.28125,-0.0937c0.063,-0.027 0.1265,-0.0648 0.1875,-0.0937c0.384,-0.181 0.811,-0.3935 1.375,-0.6875c0.062,-0.033 0.1225,-0.0637 0.1875,-0.0937l0.0312,0c0.6,-0.317 1.25075,-0.71125 1.96875,-1.15625c0.075,-0.046 0.1235,-0.0577 0.1875,-0.0937l0.0625,-0.0625c0.088,-0.062 0.16,-0.10025 0.25,-0.15625c0.525,-0.337 1.0615,-0.7015 1.5625,-1.0625c0.081,-0.058 0.155,-0.1245 0.25,-0.1875l0.0625,-0.0312c0.057,-0.046 0.10425,-0.086 0.15625,-0.125l0.1875,-0.125l0.0625,-0.0312c0.493,-0.37 1.034,-0.8165 1.625,-1.3125c0.035,-0.028 0.0567,-0.0677 0.0937,-0.0937l0.0312,0c0.071,-0.068 0.1155,-0.1255 0.1875,-0.1875c0.51,-0.442 1.03325,-0.92925 1.53125,-1.40625c0.076,-0.071 0.14875,-0.1265 0.21875,-0.1875l0.0625,-0.0312c0.095,-0.1 0.15675,-0.187 0.21875,-0.25c0.69,-0.678 1.244,-1.2515 1.75,-1.8125c1.725,-1.903 3.23825,-3.96325 4.53125,-6.15625l-59.96875,-11.03125l0.00005,-0.0002zm123.25,0.25c-0.161,1.072 -0.3615,2.1295 -0.5625,3.1875c-0.719,3.742 -1.7015,7.40675 -2.9375,10.96875l45.75,14.5l-0.1875,-20.625l-42.0625,-8.03125zm-124.6875,17.59375l5.34375,4.21875c0.378,0.299 0.76875,0.6095 1.21875,0.9375c0.071,0.052 0.14875,0.078 0.21875,0.125l0.1875,0.15625c0.274,0.19 0.55075,0.39975 0.84375,0.59375c0.129,0.088 0.27625,0.168 0.40625,0.25l0.0937,0.0625c0.272,0.174 0.5325,0.332 0.8125,0.5l0.0625,0.0312c0.137,0.08 0.27225,0.173 0.40625,0.25l0.1875,0.125l0.125,0.0625c0.12,0.069 0.23975,0.1325 0.34375,0.1875l0.21875,0.125l0.21875,0.0937l0.0937,0.0937l0.125,0.0312c0.361,0.187 0.7105,0.36425 1.0625,0.53125l0.1875,0.0937l0.125,0.0625c0.433,0.203 0.88575,0.40075 1.34375,0.59375l0.15625,0.0937l0.1875,0.0625l0.1875,0.0625c0.222,0.089 0.43325,0.19725 0.65625,0.28125l0.0312,0l0.15625,0.0625c0.096,0.034 0.2085,0.0568 0.3125,0.0937l0.1875,0.0937c0.31,0.107 0.6245,0.2135 0.9375,0.3125l0.1875,0.0625l0.0625,0l0.0625,0.0312l0.21875,0.0625c0.327,0.097 0.6225,0.19725 0.9375,0.28125c0.178,0.048 0.35125,0.077 0.53125,0.125c0.336,0.085 0.7035,0.169 1.0625,0.25l0.21875,0.0625l0.1875,0.0312c0.032,0.005 0.072,0.0183 0.125,0.0312c0.457,0.095 0.93925,0.171 1.40625,0.25l0.0937,0.0312c0.497,0.082 0.9675,0.1275 1.4375,0.1875l0.125,0.0312l0.125,0.0312c0.091,0.008 0.19225,-0.009 0.28125,0c0.341,0.039 0.68125,0.092 1.03125,0.125c0.185,0.014 0.38975,0.0172 0.59375,0.0312l0.25,0.0312c0.086,0.009 0.19525,0.0263 0.28125,0.0312c0.189,0.01 0.3645,-0.009 0.5625,0l0.0937,0l0.1875,0.0312l0.0937,0l0.0937,0c0.396,0.012 0.755,0.0273 1.125,0.0312l0.125,0l0.15625,0l0.125,0l0.15625,0l0.0625,0l0.1875,0l0.0937,0l0.1875,0c0.361,-0.005 0.749,-0.0202 1.125,-0.0312c0.688,-0.028 1.428,-0.0793 2.25,-0.15625l0.1875,-0.0312c0.063,-0.007 0.1255,0.006 0.1875,0c0.109,-0.016 0.2005,-0.0505 0.3125,-0.0625c0.494,-0.053 1.005,-0.1165 1.5,-0.1875c0.081,-0.013 0.18625,-0.0192 0.28125,-0.0312l0.0625,0c0.049,-0.007 0.083,-0.0252 0.125,-0.0312c0.104,-0.021 0.23775,-0.0455 0.34375,-0.0625c0.454,-0.077 0.88475,-0.156 1.34375,-0.25c0.036,-0.006 0.0617,0.006 0.0937,0l-36.71875,-11.09375l0.00045,0.00075zm119.84375,0.21875c-0.179,0.439 -0.3765,0.8755 -0.5625,1.3125c-2.144,5.053 -4.8205,9.90675 -8.0625,14.59375l56,26.15625l-0.25,-27.09375l-47.125,-14.96875z"/>' +
        '</svg>';
};
G.svg.information = function(oSize) { //尚未更新
    var size = oSize ? oSize : 30;
    return '<svg fill="#000000" height="' + size + '" viewBox="0 0 380.731 380.731" width="' + size + '" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M0 0h512v512H0z" fill="none"/>' +
        '<path d="M378.27,174.512c-8.783-3.561-21.691-20.321-35.391-38.051c-24.84-32.23-53.004-68.753-83.352-68.753   c-40.097,0-61.975,24.353-69.544,34.862c-8.47-9.521-31.644-31.603-64.223-31.603c-25.578,0-56.763,36.611-84.247,68.911   c-15.871,18.63-30.859,36.227-38.864,38.952c-1.51,0.523-2.55,1.905-2.643,3.485c-0.093,1.586,0.784,3.085,2.237,3.765   c13.442,6.338,27.222,23.446,43.175,43.245c22.319,27.722,47.625,59.139,81.238,72.035c20.466,7.843,42.46,11.666,67.266,11.666   c23.731,0,46.725-3.626,64.095-6.763c29.86-5.415,74.511-64.763,101.175-100.234c8.517-11.34,17.336-23.057,19.555-24.486   c1.289-0.738,2.08-2.167,1.975-3.666C380.629,176.376,379.688,175.069,378.27,174.512z M337.047,186.101   c-17.742,11.729-62.102,35.599-133.15,38.865c-73.424,3.322-127.648-22.621-150.874-36.401   c15.812-3.689,29.221-11.125,41.281-17.823c13.675-7.581,25.497-14.134,37.824-14.134c15.244,0,30.267,4.938,42.333,8.911   c9.684,3.189,17.369,5.688,23.011,5.27c5.077-0.337,11.805-2.324,19.589-4.642c11.84-3.509,26.584-7.877,40.793-7.877   c10.213,0,23.308,6.083,37.168,12.531C308.779,177.225,322.918,183.801,337.047,186.101z"/>' +
        '</svg>';

};
G.svg.feedback = function(oSize) {
    var size = oSize ? oSize : 30;
    return '<svg fill="#000000" height="' + size + '" viewBox="0 0 1792 1792" width="' + size + '" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M0 0h512v512H0z" fill="none"/>' +
        '<path d="M1664 1504v-768q-32 36-69 66-268 206-426 338-51 43-83 67t-86.5 48.5-102.5 24.5h-2q-48 0-102.5-24.5t-86.5-48.5-83-67q-158-132-426-338-37-30-69-66v768q0 13 9.5 22.5t22.5 9.5h1472q13 0 22.5-9.5t9.5-22.5zm0-1051v-24.5l-.5-13-3-12.5-5.5-9-9-7.5-14-2.5h-1472q-13 0-22.5 9.5t-9.5 22.5q0 168 147 284 193 152 401 317 6 5 35 29.5t46 37.5 44.5 31.5 50.5 27.5 43 9h2q20 0 43-9t50.5-27.5 44.5-31.5 46-37.5 35-29.5q208-165 401-317 54-43 100.5-115.5t46.5-131.5zm128-37v1088q0 66-47 113t-113 47h-1472q-66 0-113-47t-47-113v-1088q0-66 47-113t113-47h1472q66 0 113 47t47 113z"/>' +
        '</svg>';
};
G.svg.liquefaction = function(oSize) {
    var size = oSize ? oSize : 30;
    return '<svg fill="#000000" height="' + size + '" viewBox="0 0 512 512" width="' + size + '" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M480.539,299.651c-29.904,38.074-59.474,75.723-89.053,113.384' + 'c0.457,0.311,0.901,0.734,1.003,0.663c14.008-9.713,27.259-6.967,40.914,1.414c13.35,8.194,26.955,16.23,41.242,22.54' + 'c8.33,3.679,18.217,3.834,27.93,5.674c0,19.396,0,39.24,0,59.511c-163.642,0-327.235,0-491.36,0c0-21.11,0-42.43,0-64.01' + 'c14.665,3.99,27.127-0.912,38.642-9.486c7.216-5.374,14.573-9.594,24.244-6.604c1.559,0.482,4.704-1.639,6.058-3.378' + 'c25.664-33.009,51.151-66.156,76.713-99.244c43.488-56.296,87.003-112.57,130.878-169.337' + 'c18.492,14.218,36.833,28.323,55.706,42.835c-10.219,13.308-20.28,26.439-30.373,39.547' +
        'c-57.968,75.275-115.957,150.536-173.84,225.877c-1.469,1.911-6.188,4.491-0.195,7.488' + 'c69.226-89.893,138.385-179.696,207.875-269.928C391.502,230.977,435.809,265.152,480.539,299.651z M384.895,262.224' +
        'c-7.824,10.157-15.386,19.97-23.155,30.056c8.04,6.155,15.77,12.071,23.694,18.139c7.893-10.277,15.317-19.942,23.026-29.979' + 'C400.48,274.271,392.914,268.423,384.895,262.224z M308.584,409.445c8.074-10.306,15.689-20.022,23.488-29.972' + 'c-8.266-6.336-15.844-12.146-23.647-18.128c-7.829,10.191-15.341,19.973-23.001,29.946' + 'C293.33,397.49,300.703,403.267,308.584,409.445z M347.393,233.155c-8.03,10.441-15.436,20.071-23.092,30.028' + 'c7.982,6.259,15.463,12.125,23.169,18.17c7.9-10.312,15.384-20.079,23.031-30.063C362.534,245.038,355.207,239.287,347.393,233.155z' + ' M270.984,380.495c7.953-10.351,15.432-20.087,23.106-30.079c-7.999-6.296-15.318-12.055-23.083-18.165' + 'c-7.75,10.054-15.273,19.809-23.115,29.981C255.61,368.335,262.92,374.117,270.984,380.495z M171.491,461.349' +
        'c7.911,6.24,15.331,12.094,23.102,18.228c7.903-10.462,15.377-20.354,23.099-30.573c-7.918-6.026-15.334-11.668-23.148-17.613' + 'C186.693,441.593,179.277,451.229,171.491,461.349z M346.45,438.595c7.825-10.144,15.264-19.785,23.093-29.934' + 'c-7.769-6.134-15.261-12.049-23.109-18.245c-7.761,10.079-15.307,19.881-23.125,30.036C331.21,426.647,338.7,432.52,346.45,438.595z' + ' M422.851,291.314c-7.896,10.253-15.358,19.941-23.116,30.013c7.706,6.066,15.213,11.977,23.116,18.196' + 'c7.857-10.2,15.42-20.02,23.124-30.021C438.158,303.354,430.783,297.553,422.851,291.314z M273.914,250.862' + 'c-8.25-6.396-15.975-12.382-24.123-18.697c-7.478,9.813-14.672,19.253-22.135,29.046c8.354,6.456,16.19,12.512,24.136,18.651' + 'C259.354,269.949,266.384,260.734,273.914,250.862z M308.965,282.887c-7.908,10.317-15.393,20.081-23.092,30.126' + 'c8.212,6.133,15.69,11.719,23.6,17.625c7.894-10.274,15.395-20.035,23.085-30.045C324.461,294.518,317.138,289.02,308.965,282.887z' +
        ' M361.265,371.104c7.829,6.008,15.379,11.801,23.137,17.755c8.036-10.232,15.677-19.964,23.591-30.042' + 'c-8.096-6.064-15.705-11.761-23.606-17.677C376.541,351.307,369.089,360.965,361.265,371.104z M346.955,359.787' + 'c7.943-10.367,15.444-20.153,23.077-30.114c-8.072-6.138-15.488-11.773-23.187-17.624c-7.897,10.326-15.378,20.104-22.988,30.056' + 'C331.861,348.231,339.133,353.798,346.955,359.787z M209.405,412.058c7.896,6.04,15.324,11.723,23.125,17.689' + 'c7.711-9.831,15.242-19.433,23.131-29.491c-7.799-6.145-15.284-12.042-23.119-18.216' + 'C224.795,392.092,217.35,401.751,209.405,412.058z M131.948,384.934c-7.591,10.032-14.755,19.502-22.079,29.182' + 'c8.423,6.335,16.057,12.076,24.056,18.096c7.393-9.525,14.586-18.792,22.111-28.488' + 'C147.943,397.412,140.231,391.395,131.948,384.934z M171.427,383.424c7.791-9.857,15.058-19.051,22.582-28.568' + 'c-8.302-6.432-16.01-12.4-24.1-18.668c-7.488,9.855-14.686,19.323-22.097,29.075C155.955,371.524,163.374,377.231,171.427,383.424z' + ' M285.309,186.277c-7.551,9.903-14.659,19.226-22.151,29.052c8.223,6.18,16.106,12.106,24.159,18.159' + 'c7.637-9.865,14.685-18.968,22.051-28.484C301.324,198.743,293.615,192.743,285.309,186.277z M210.354,333.165' + 'c7.612-9.864,14.745-19.109,22.09-28.627c-8.226-6.494-15.735-12.424-23.59-18.624c-7.515,9.69-14.722,18.983-22.112,28.512' + 'C194.607,320.67,202.122,326.633,210.354,333.165z M293.094,429.341c-7.826-6.018-15.208-11.694-23.057-17.728' +
        'c-7.599,9.899-14.993,19.53-22.675,29.537c7.832,5.978,15.364,11.723,23.171,17.681' + 'C278.246,448.751,285.514,439.251,293.094,429.341z M290.164,462.875c21.721,9.995,33.806,8.442,40.483-5.246' + 'c-7.319-5.634-14.72-11.329-22.617-17.409C302.024,447.836,296.144,455.292,290.164,462.875z M232.081,460.356' + 'c-6.431,8.423-12.341,16.163-18.251,23.904c5.013-2.408,9.128-5.721,13.717-8.134c4.52-2.377,9.518-3.846,15.053-6.002' + 'C239.033,466.811,235.893,463.897,232.081,460.356z"/>' +
        '</svg>';
};
G.svg.geologicalsensitive = function(oSize) {
    var size = oSize ? oSize : 30;
    return '<svg fill="#000000" height="' + size + '" viewBox="0 0 512 512" width="' + size + '" xmlns="http://www.w3.org/2000/svg">' +
        // '<path d="M0 0h512v512H0z" fill="none"/>' +
        // '<path d="M778 626l21 8c-41 103-158 153-260 112l8-21c91 36 194-8 231-99z m71 28l21 9c-57 141-218 210-360 153l9-21c130 52 278-11 330-141z m-132-52l21 8c-27 69-106 103-175 75l8-21c58 23 123-5 146-62z m-574-524c33-105 145-164 251-132l-7 22c-94-29-193 23-222 117l-22-7z m-51-16l-22-7c46-145 201-227 346-182l-7 22c-133-41-276 34-317 167z m282-53l-7 21c-59-18-122 15-140 74l-21-7c22-71 97-110 168-88z m220 142c0 0 60 53 190 136 131 82 188 97 188 97s-19 46-56 94l-409-258c30-22 59-44 87-69z m-386 227l380 244c-19 12-45 21-83 22l-371-239c22-7 47-16 74-27z m89-38l367 236c-5 0-11 1-17 2-16 3-28 20-48 36l-376-241c23-10 48-21 74-33z m108-56c30-17 61-36 91-57l412 261c-20 25-45 49-74 68l-429-272z m417 279c-12 6-24 11-37 15-45 13-68 9-87 5l-387-249c26-13 54-27 82-43l429 272z m-559 15c-99 28-223-102-236-143 0 0 4 0 13-3l223 146z m-145-168l362 232c-9 0-18-1-27-3-53-9-137-88-169-70-2 1-4 2-6 3l-221-144c15-4 36-10 61-18z m489-374c144 172 367 274 367 274l-1 35c-211-91-371-258-371-258-244 199-577 303-577 303l2-45c290-78 580-309 580-309z m4-39c0 0-162 105-255 167-93 61-331 141-331 141l3-73c278-92 586-329 586-329 163 202 356 295 356 295l2 78c-220-107-361-279-361-279z"/>' +
        '<path d="M155.771,26.331C69.74,26.331,0,96.071,0,182.102c0,37.488,13.25,71.883,35.314,98.761' +
        'c3.404-27.256,30.627-50.308,68.8-61.225c13.946,12.994,31.96,20.878,51.656,20.878c19.233,0,36.894-7.487,50.698-19.936' +
        'c38.503,11.871,65.141,36.27,66.017,64.63c24.284-27.472,39.056-63.555,39.056-103.108' +
        'C311.541,96.071,241.801,26.331,155.771,26.331z M155.771,222.069c-9.944,0-19.314-2.732-27.634-7.464' +
        'c-20.05-11.409-33.855-34.756-33.855-61.711c0-38.143,27.583-69.176,61.489-69.176c33.909,0,61.489,31.033,61.489,69.176' +
        'c0,27.369-14.237,51.004-34.786,62.215C174.379,219.523,165.346,222.069,155.771,222.069z"/>' +
        '</svg>';
};

G.svg.line = function(oColor) {
    var size = 30;
    return '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 100 100" > <path d="M 10 50 L 50 10" style="fill:none;stroke:red;stroke-width:3;stroke-opacity:1;STROKE-DASHARRAY:5 5;stroke-linecap:round;" /></svg>';
};

G.svg.user = function(oSize) {
    var size = oSize ? oSize : 30;
    return '<img src="/map/登入資訊.svg" width="' + size + '" heifht="' + size + '">';
};


G.svg.user2 = function(oSize) {
    var size = oSize ? oSize : 30;
    return '<svg fill="#000000" height="' + size + '" viewBox="0 0 32 32" width="' + size + '" xmlns="http://www.w3.org/2000/svg">' +
        // '<path d="M0 0h512v512H0z" fill="none"/>' +
        // '<path d="M778 626l21 8c-41 103-158 153-260 112l8-21c91 36 194-8 231-99z m71 28l21 9c-57 141-218 210-360 153l9-21c130 52 278-11 330-141z m-132-52l21 8c-27 69-106 103-175 75l8-21c58 23 123-5 146-62z m-574-524c33-105 145-164 251-132l-7 22c-94-29-193 23-222 117l-22-7z m-51-16l-22-7c46-145 201-227 346-182l-7 22c-133-41-276 34-317 167z m282-53l-7 21c-59-18-122 15-140 74l-21-7c22-71 97-110 168-88z m220 142c0 0 60 53 190 136 131 82 188 97 188 97s-19 46-56 94l-409-258c30-22 59-44 87-69z m-386 227l380 244c-19 12-45 21-83 22l-371-239c22-7 47-16 74-27z m89-38l367 236c-5 0-11 1-17 2-16 3-28 20-48 36l-376-241c23-10 48-21 74-33z m108-56c30-17 61-36 91-57l412 261c-20 25-45 49-74 68l-429-272z m417 279c-12 6-24 11-37 15-45 13-68 9-87 5l-387-249c26-13 54-27 82-43l429 272z m-559 15c-99 28-223-102-236-143 0 0 4 0 13-3l223 146z m-145-168l362 232c-9 0-18-1-27-3-53-9-137-88-169-70-2 1-4 2-6 3l-221-144c15-4 36-10 61-18z m489-374c144 172 367 274 367 274l-1 35c-211-91-371-258-371-258-244 199-577 303-577 303l2-45c290-78 580-309 580-309z m4-39c0 0-162 105-255 167-93 61-331 141-331 141l3-73c278-92 586-329 586-329 163 202 356 295 356 295l2 78c-220-107-361-279-361-279z"/>' +
        '<path style="text-indent:0;text-align:start;line-height:normal;text-transform:none;block-progression:tb;-inkscape-font-specification:Sans" d="M 16 4 C 10.421 4 5.74325 7.833 4.40625 13 L 6.46875 13 C 7.74575 8.947 11.531 6 16 6 C 21.514 6 26 10.486 26 16 C 26 21.514 21.514 26 16 26 C 11.531 26 7.74575 23.053 6.46875 19 L 4.40625 19 C 5.74325 24.167 10.421 28 16 28 C 22.617 28 28 22.617 28 16 C 28 9.383 22.617 4 16 4 z M 15.34375 11.28125 L 13.90625 12.71875 L 16.1875 15 L 4 15 L 4 17 L 16.1875 17 L 13.90625 19.28125 L 15.34375 20.71875 L 19.34375 16.71875 L 20.03125 16 L 19.34375 15.28125 L 15.34375 11.28125 z" overflow="visible" font-family="Sans"/>' +
        '</svg>';
};
G.png = {};

G.png.export = function() {
    return '<img src=""></img>';
};
G.buttontext = {};

G.buttontext.text = function(oSize, text) {
    var size = oSize ? oSize : 30;
    return '<div style="height: ' + size + '!important; width: ' + size + '!important;><h5>' + text ? text : '' + '</h5></div>';
};
G.tabbutton = {};

G.tabbutton.text = function(oSize, text) {
    var size = oSize ? oSize : 30;
    return '<div style="height: ' + size + '!important; width: ' + size + '!important;><h5>' + text ? text : '' + '</h5></div>';
};
G.WMTS = {};
G.WMTS.Tile = function (input) { //輸入參數
    var objectForLayer = {};
    //中研院台灣百年歷史地圖
    var taiwanhTileSet = {
        attribution: 'Map data &copy; <a href="http://gis.sinica.edu.tw/" target="_blank">Academia Sinica</a>',
        errorTileUrl: "/map/images/Error.png"
    };
    var taiwanhWmts = function (layer, format) {
        return "http://gis.sinica.edu.tw/tileserver/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=" + layer + "&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/" + format;
    };

    //國土測繪圖資網路地圖
    var nlscTileSet = {
        attribution: 'Map data &copy; <a href="http://maps.nlsc.gov.tw/" target="_blank">' + LanguageValue.NLSC + '</a>',
        maxZoom: 19,
        opacity: 0.6
    };
    var nlscWmts = function (layer, format) {
        return "http://wmts.nlsc.gov.tw/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=" + layer + "&STYLE=_null&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/" + format;
    };

    switch (input) {
        case "gsm":
            objectForLayer = L.tileLayer("https://mt{s}.google.com/vt/x={x}&y={y}&z={z}&hl=" + LanguageValue.GoogleLanguageCode, {
                subdomains: "012",
                // detectRetina: true,
                attribution: 'Map data: &copy; Google',
                maxZoom: 22
            });
            break;
        case "osm2":
            objectForLayer = L.tileLayer("http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png", {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org" target="_blank">OpenStreetMap</a>'
            });
            break;
        case "gm2":
            objectForLayer = L.tileLayer("http://210.61.12.196:8080/geoserver/gwc/service/gmaps?layers=cache:GEOLOGY&format=image/png&zoom={z}&x={x}&y={y}", {
                tms: false
            }); //20170612更新 From垂頤
            break;
        case "taiwanh1":
            objectForLayer = L.tileLayer(taiwanhWmts("1956_Landuse", "png"), taiwanhTileSet); //1956-臺灣土地利用及林型圖
            break;
        case "taiwanh2":
            objectForLayer = L.tileLayer(taiwanhWmts("AM50K_1944", "png"), taiwanhTileSet); //1956-臺灣土地利用及林型圖
            break;
        case "taiwanh3":
            objectForLayer = L.tileLayer(taiwanhWmts("AMCityPlan_1945", "png"), taiwanhTileSet); //1945-美軍繪製臺灣城市地圖
        case "taiwanh4":
            objectForLayer = L.tileLayer(taiwanhWmts("JM100K_1905", "png"), taiwanhTileSet); //1905-日治臺灣圖-1:100,000
            break;
        case "taiwanh5":
            objectForLayer = L.tileLayer(taiwanhWmts("JM20K_1904", "jpeg"), taiwanhTileSet); //1904-日治臺灣(明治版)-1:20,000
            break;
        case "taiwanh6":
            objectForLayer = L.tileLayer(taiwanhWmts("JM20K_1921", "jpeg"), taiwanhTileSet); //1921-日治臺灣(大正版)-1:20,000
            break;
        case "taiwanh7":
            objectForLayer = L.tileLayer(taiwanhWmts("JM25K_1921", "jpeg"), taiwanhTileSet); //1921-日治地形圖-1:25,000
            break;
        case "taiwanh8":
            objectForLayer = L.tileLayer(taiwanhWmts("JM300K_1924", "jpeg"), taiwanhTileSet); //1924-日治臺灣全圖(第三版)-1:300,000
            break;
        case "taiwanh9":
            objectForLayer = L.tileLayer(taiwanhWmts("JM300K_1939", "png"), taiwanhTileSet); //1924-日治臺灣全圖(第五版)-1:300,000
            break;
        case "taiwanh10":
            objectForLayer = L.tileLayer(taiwanhWmts("JM400K_1899", "png"), taiwanhTileSet); //1899-日治臺灣全圖-1:400,000
            break;
        case "taiwanh11":
            objectForLayer = L.tileLayer(taiwanhWmts("JM50K_1916", "jpeg"), taiwanhTileSet); //1916-日治蕃地地形圖-1:50,000
            break;
        case "taiwanh12":
            objectForLayer = L.tileLayer(taiwanhWmts("JM50K_1920", "png"), taiwanhTileSet); //1920-日治地形圖(總督府土木局)-1:50,000
            break;
        case "taiwanh13":
            objectForLayer = L.tileLayer(taiwanhWmts("JM50K_1924", "jpeg"), taiwanhTileSet); //1924-日治地形圖(陸地測量部)-1:50,000
            break;
        case "taiwanh14":
            objectForLayer = L.tileLayer(taiwanhWmts("TM100K_1987", "png"), taiwanhTileSet); //1987-臺灣地形圖-1:100,000
            break;
        case "taiwanh15":
            objectForLayer = L.tileLayer(taiwanhWmts("TM25K_1989", "jpeg"), taiwanhTileSet); //1989-臺灣經建1版地形圖-1:25,000
            break;
        case "taiwanh16":
            objectForLayer = L.tileLayer(taiwanhWmts("TM25K_1993", "jpeg"), taiwanhTileSet); //1993-臺灣經建2版地形圖-1:25,000
            break;
        case "taiwanh17":
            objectForLayer = L.tileLayer(taiwanhWmts("TM25K_2001", "jpeg"), taiwanhTileSet); //2001-臺灣經建3版地形圖-1:25,000
            break;
        case "taiwanh18":
            objectForLayer = L.tileLayer(taiwanhWmts("TM25K_2003", "jpeg"), taiwanhTileSet); //2003-臺灣經建4版地形圖-1:25,000
            break;
        case "taiwanh19":
            objectForLayer = L.tileLayer(taiwanhWmts("TM50K_1956", "jpeg"), taiwanhTileSet); //1956-臺灣地形圖-1:50,000
            break;
        case "taiwanh20":
            objectForLayer = L.tileLayer(taiwanhWmts("TM50K_1990", "png"), taiwanhTileSet); //1990-臺灣經建1版地形圖-1:50,000
            break;
        case "taiwanh21":
            objectForLayer = L.tileLayer(taiwanhWmts("TM50K_1996", "png"), taiwanhTileSet); //1996-臺灣經建2版地形圖-1:50,000
            break;
        case "taiwanh22":
            objectForLayer = L.tileLayer(taiwanhWmts("TM50K_2002", "png"), taiwanhTileSet); //2002-臺灣經建3版地形圖-1:50,000
            break;
        case "nlsc1":
            //tileLayers.nlsc1 = L.tileLayer(nlscWmts("EMAP", "png"), nlscTileSet); //通用版電子地圖
            objectForLayer = L.tileLayer("http://wmts.nlsc.gov.tw/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=EMAP&STYLE=_null&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png", {
                //tileLayers.nlsc1 = L.tileLayer("http://wmts.nlsc.gov/", {
                attribution_: 'Map data &copy; <a href="http://maps.nlsc.gov.tw/" target="_blank">' + LanguageValue.NLSC + '</a>',
                maxZoom: 19,
                errorTileUrl: "/map/images/error.png"
            });
            //objectForLayer = L.tileLayer(nlscWmts("EMAP", "png"), nlscTileSet); //通用版電子地圖
            break;
        case "nlsc2":
            //tileLayers.nlsc1 = L.tileLayer(nlscWmts("EMAP", "png"), nlscTileSet); //通用版電子地圖
            objectForLayer = L.tileLayer(nlscWmts("LANDSECT", "png"), nlscTileSet); //段籍圖
            break;
        case "nlsc3":
            objectForLayer = L.tileLayer(nlscWmts("LUIMAP", "png"), nlscTileSet); //國土利用調查成果圖
        case "nlsc4":
            objectForLayer = L.tileLayer(nlscWmts("PHOTO2", "png"), nlscTileSet); //正射影像圖(通用版) 
            break;
        case "nlsc5":
            objectForLayer = L.tileLayer(nlscWmts("SCHOOL", "png"), nlscTileSet); //各級學校範圍圖
            break;
        case "nlsc6":
            objectForLayer = L.tileLayer(nlscWmts("Village", "png"), nlscTileSet); //村里界
            break;
        case "nlsc7":
            objectForLayer = L.tileLayer(nlscWmts("TOWN", "png"), nlscTileSet); //鄉鎮市區界
            break;
        case "nlsc8":
            objectForLayer = L.tileLayer(nlscWmts("CITY", "png"), nlscTileSet); //縣市界
            break;
        case "flooding300":  //https://dwgis.ncdr.nat.gov.tw/arcgis/rest/services/ncdr/NCDR_FloodPotentialMaps_300_350_84/MapServer/WMTS/tile/1.0.0/ncdr_NCDR_FloodPotentialMaps_300_350_84/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png"
            objectForLayer = L.tileLayer("https://dwgis.ncdr.nat.gov.tw/arcgis/rest/services/ncdr/NCDR_FloodPotentialMaps_300_350_84/MapServer/WMTS/tile/1.0.0/ncdr_NCDR_FloodPotentialMaps_300_350_84/default/default028mm/{z}/{y}/{x}.png", {
                attribution_: 'Map data &copy; <a href="http://maps.nlsc.gov.tw/" target="_blank">' + LanguageValue.NLSC + '</a>',
                minZoom: 11,
                maxZoom: 17,
                // errorTileUrl: "/map/images/error.png"
            });
            break;
        case "flooding450":
            objectForLayer = L.tileLayer("https://dwgis.ncdr.nat.gov.tw/arcgis/rest/services/ncdr/NCDR_FloodPotentialMaps_450_84/MapServer/WMTS/tile/1.0.0/ncdr_NCDR_FloodPotentialMaps_450_84/default/default028mm/{z}/{y}/{x}.png", {
                attribution_: 'Map data &copy; <a href="http://maps.nlsc.gov.tw/" target="_blank">' + LanguageValue.NLSC + '</a>',
                minZoom: 11,
                maxZoom: 17,
                // errorTileUrl: "/map/images/error.png"
            });
            break;
        case "flooding600":
            objectForLayer = L.tileLayer("https://dwgis.ncdr.nat.gov.tw/arcgis/rest/services/ncdr/NCDR_FloodPotentialMaps_600_84/MapServer/WMTS/tile/1.0.0/ncdr_NCDR_FloodPotentialMaps_600_84/default/default028mm/{z}/{y}/{x}.png", {
                attribution_: 'Map data &copy; <a href="http://maps.nlsc.gov.tw/" target="_blank">' + LanguageValue.NLSC + '</a>',
                minZoom: 11,
                maxZoom: 17,
                // errorTileUrl: "/map/images/error.png"
            });
            break;

    }
    return objectForLayer;
};
var GeoConvert = {};

GeoConvert.emptyGeojson = function() {
	var geojson = {};
	geojson.type = "FeatureCollection";
	geojson.features = [];

	return geojson;
};

GeoConvert.decode = {};
GeoConvert.decode.utf8 = new TextDecoder("utf-8");
GeoConvert.decode.big5 = new TextDecoder("big5");
;
(function(window, document, undefined) {

  //xml2json
  GeoConvert.xml2Json = function(xml, toString) {
    //xml string parser
    var parseXml;

    if (window.DOMParser) {
      parseXml = function(xmlStr) {
        return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
      };
    } else if (typeof window.ActiveXObject != "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
      parseXml = function(xmlStr) {
        var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(xmlStr);
        return xmlDoc;
      };
    } else {
      parseXml = function() {
        return null;
      }
    }

    //check string?
    var xmlDoc;

    if (typeof xml === "string") {
      xmlDoc = parseXml(xml);
    } else if (typeof xml === "object" && xml.xmlVersion) {
      xmlDoc = xml;
    } else {
      throw new Error("Unsupported input type");
    }

    var json = xmlElement2JsonObject(xmlDoc);

    if (toString) {
      var jsonString = JSON.stringify(json);
      return jsonString;
    } else {
      return json;
    }
  };

  function xmlElement2JsonObject(xmlElement) {
    var json = {};

    if (xmlElement.attributes) {
      for (var i = 0, imax = xmlElement.attributes.length; i < imax; i++) {
        var attribute = xmlElement.attributes[i];
        var nodeValue = attribute.nodeValue;
        var value = (!isNaN(parseFloat(nodeValue)) && isFinite(nodeValue)) ? parseFloat(nodeValue) : nodeValue;
        json["@" + attribute.nodeName] = value;
      }
    }

    if (xmlElement.children.length > 0) {
      var sameNameArray = {};
      for (var i = 0, imax = xmlElement.children.length; i < imax; i++) {
        var children = xmlElement.children[i];

        if (children.tagName[0] !== "_") {
          if (json[children.tagName]) {
            if (!sameNameArray[children.tagName]) {
              json[children.tagName] = [json[children.tagName]];
              sameNameArray[children.tagName] = true;
            }
            json[children.tagName].push(xmlElement2JsonObject(children));
          } else {
            json[children.tagName] = xmlElement2JsonObject(children);
            sameNameArray[children.tagName] = false;
          }
        } else {
          if (!sameNameArray[children.tagName]) {
            json = [xmlElement2JsonObject(children)];
            sameNameArray[children.tagName] = true;
          } else {
            json.push(xmlElement2JsonObject(children));
          }
        }
      }
    } else {
      var textContent = xmlElement.textContent;
      var value = (!isNaN(parseFloat(textContent)) && isFinite(textContent)) ? parseFloat(textContent) : textContent;

      if (Object.keys(json).length > 0) {
        json["#"] = value;
      } else {
        json = value;
      }
    }

    return json;
  }

  //json2xml
  GeoConvert.json2Xml = function(json, xmlName, toString) {
    //check string?
    var jsonDoc;

    if (typeof json === "string") {
      jsonDoc = JSON.parse(json);
    } else {
      jsonDoc = json;
    }

    var docName = xmlName.trim() ? xmlName : 'root';
    var xmlDoc = document.implementation.createDocument(null, "create");
    var xml;
    xml = jsonObject2XmlElement(docName, jsonDoc, xmlDoc);

    if (toString) {
      var xmlString = "<?xml version='1.0' encoding='UTF-8'?>" + (new XMLSerializer()).serializeToString(xml);
      return xmlString;
    } else {
      return xml;
    }
  };

  function jsonObject2XmlElement(name, json, xmlDoc) {
    var xml = xmlDoc.createElement(name);

    if (json.forEach) {
      json.forEach(function(child) {
        var element = jsonObject2XmlElement('_array', child, xmlDoc);
        xml.appendChild(element);
      });
    } else if (typeof json === "object") {
      for (var key in json) {
        if (key[0] === "@") {
          var name = key.replace("@", "");

          xml.setAttribute(name, json[key]);
        } else if (key === "#") {
          xml.textContent = json[key];
        } else {
          if (typeof json[key] !== "object") {
            var element = xmlDoc.createElement(key);
            element.textContent = json[key];
            xml.appendChild(element);
          } else {
            if (json[key].forEach && json[key].sameName) {
              json[key].forEach(function(child) {
                var element = jsonObject2XmlElement(key, child, xmlDoc);
                xml.appendChild(element);
              });
            } else {
              var element = jsonObject2XmlElement(key, json[key], xmlDoc);
              xml.appendChild(element);
            }
          }
        }
      }
    } else {
      xml.textContent = json;
    }

    return xml;
  }
})(window, document);
;
(function(window, document, undefined) {
    //kml2geojson
    GeoConvert.kml2Geojson = function(kml, toString) {
        var json;

        if (typeof kml === "string") {
            if (kml.indexOf("kml:") !== -1) {
                var tempKml = kml.replace(/\kml:/gi, "");
                json = GeoConvert.xml2Json(tempKml);
            } else {
                json = GeoConvert.xml2Json(kml);
            }
        } else if (typeof kml === "object" && kml.xmlVersion) {
            json = GeoConvert.xml2Json(kml);
        } else {
            throw new Error("Unsupported input type");
        }

        var geojson = GeoConvert.emptyGeojson();
        var style = {};

        kmlElementHandle("kml", json.kml, geojson, style);

        if (toString) {
            var jsonString = JSON.stringify(geojson);
            return jsonString;
        } else {
            return geojson;
        }
    };

    function kmlElementHandle(tag, contain, geojson, style) {
        switch (tag) {
            case "kml":
            case "Document":
            case "Folder":
                if (!contain.forEach) {
                    var keys = Object.keys(contain);

                    var styleIndex = keys.indexOf("Style");
                    if (styleMapIndex > -1) {
                        keys.splice(styleMapIndex, 1);
                        kmlElementHandle("StyleMap", contain.StyleMap, geojson, style);
                    }

                    var styleMapIndex = keys.indexOf("StyleMap");
                    if (styleIndex > -1) {
                        keys.splice(styleIndex, 1);
                        kmlElementHandle("Style", contain.Style, geojson, style);
                    }

                    keys.forEach(function(c) {
                        kmlElementHandle(c, contain[c], geojson, style);
                    });
                } else {
                    contain.forEach(function(c) {
                        kmlElementHandle(tag, c, geojson, style);
                    });
                }
                break;
            case "Placemark":
                if (contain.forEach) {
                    contain.forEach(function(placemark) {
                        geojson.features.push(placemark2Feature(placemark, style));
                    });
                } else {
                    geojson.features.push(placemark2Feature(contain, style));
                }
                break;
            case "Style":
            case "StyleMap":
                if (contain.forEach) {
                    contain.forEach(function(styleContain) {
                        if (styleContain["@id"]) {
                            style[styleContain["@id"]] = styleContain;
                        }
                    });
                } else {
                    if (contain["@id"]) {
                        style[contain["@id"]] = contain;
                    }
                }
                break;
            case "GroundOverlay":
                if (contain.forEach) {
                    contain.forEach(function(groundOverlay) {
                        geojson.features.push(groundOverlay2Feature(groundOverlay));
                    });
                } else {
                    geojson.features.push(groundOverlay2Feature(contain));
                }
                break;
        }
    }

    function groundOverlay2Feature(groundOverlay) {
        var feature = {};
        feature.type = "Feature";
        feature.properties = {};
        feature.geometry = null;

        if (groundOverlay.name) {
            feature.properties.name = groundOverlay.name;
        }
        if (groundOverlay.description) {
            feature.properties.description = groundOverlay.description;
        }

        if (groundOverlay.Icon && groundOverlay.Icon.href) {
            feature.properties.iconUrl = groundOverlay.Icon.href;
        }
        if (groundOverlay.visibility) {
            feature.properties.opacity = parseFloat(groundOverlay.visibility);
        }

        if (groundOverlay.LatLonBox) {
            latLonBox = groundOverlay.LatLonBox;
            var southWest = [parseFloat(latLonBox.south), parseFloat(latLonBox.west)];
            var northEast = [parseFloat(latLonBox.north), parseFloat(latLonBox.east)];
            var latLngBounds = [southWest, northEast];

            feature.properties.latLngBounds = latLngBounds;
        }

        return feature;
    }

    function placemark2Feature(placemark, style) {
        var feature = {};
        feature.type = "Feature";
        feature.properties = {};
        feature.style = {};

        if (placemark.name) {
            feature.properties.name = placemark.name;
        }
        if (placemark.description) {
            feature.properties.description = placemark.description;
        }

        if (placemark["gx:Track"] || placemark["gx:MultiTrack"]) {
            var geometry = {};
            var coordinates = [];

            var multiTrack = placemark["gx:MultiTrack"];
            var track = multiTrack ? multiTrack["gx:Track"] : placemark["gx:Track"];
            var gxCoord = track["gx:coord"];

            if (gxCoord) {
                gxCoord.forEach(function(pointString) {
                    if (pointString.trim() !== "") {
                        var point = pointString.split(" ");
                        coordinates.push([parseFloat(point[0]), parseFloat(point[1])]);
                    }
                });
            }

            if (track.when) {
                feature.properties.when = track.when;
            }

            if (track.ExtendedData && track.ExtendedData.SchemaData && track.ExtendedData.SchemaData["gx:SimpleArrayData"]) {
                track.ExtendedData.SchemaData["gx:SimpleArrayData"].forEach(function(data) {
                    feature.properties[data["@name"]] = data["gx:value"];
                });
            }

            geometry.type = "LineString";
            geometry.coordinates = coordinates;

            feature.geometry = geometry;
        } else {
            feature.geometry = placemark2Geometry(placemark);
        }

        var geojsonStyle = placemark.Style || {};
        if (placemark.styleUrl) {
            var styleId = placemark.styleUrl.replace("#", "");

            if (style[styleId]) {
                var mStyle;
                var styleId2;

                if (style[styleId].Pair) {
                    style[styleId].Pair.forEach(function(style2) {
                        if (style2.key && style2.key === "normal") {
                            styleId2 = style2.styleUrl.replace("#", "");
                        }
                    });
                    mStyle = style[styleId2];
                } else {
                    mStyle = style[styleId];
                }

                var tempKeys = Object.keys(Object.assign({}, geojsonStyle, mStyle));
                tempKeys.forEach(function(tk) {
                    var type = typeof geojsonStyle[tk];
                    if (type === "object") {
                        geojsonStyle[tk] = Object.assign({}, geojsonStyle[tk], mStyle[tk]);
                    } else if (type === "undefined") {
                        geojsonStyle[tk] = mStyle[tk];
                    }
                });
            }
        }

        for (var styleKey in geojsonStyle) {
            switch (styleKey) {
                case "IconStyle":
                    var iconUrl = geojsonStyle.IconStyle.Icon.href;
                    var scale = geojsonStyle.IconStyle.scale;
                    var color = geojsonStyle.IconStyle.color;

                    if (iconUrl) {
                        if (iconUrl == "typhoon-position.png" || iconUrl == "typhoon.png") {
                            iconUrl = "http://www.geologycloud.tw/map/images/" + iconUrl;                            
                            feature.style.iconUrl = iconUrl;
                            // x = 20;
                            // y = -18.5;
                        } else {
                            feature.style.iconUrl = iconUrl;
                        }
                    }
                    if (scale) {
                        feature.style.scale = parseFloat(scale);
                    }
                    if (color) {
                        color = abgr2Color(color);
                        feature.style.color = color.hex;
                        feature.style.opacity = color.opacity;
                    }
                    if (geojsonStyle.IconStyle.hotSpot) {
                        var hotSpotX = parseFloat(geojsonStyle.IconStyle.hotSpot["@x"]);
                        var hotSpotY = parseFloat(geojsonStyle.IconStyle.hotSpot["@y"]);
                        feature.style.iconAnchor = [hotSpotX, hotSpotY];
                    }
                    break;
                case "LineStyle":
                    var color = abgr2Color(geojsonStyle.LineStyle.color);
                    var width = parseFloat(geojsonStyle.LineStyle.width);

                    if (color) {
                        feature.style.color = color.hex;
                        feature.style.opacity = color.opacity;
                    }
                    if (width) {
                        feature.style.weight = width;
                    }
                    break;
                case "PolyStyle":
                    var color = abgr2Color(geojsonStyle.PolyStyle.color);
                    var fill = parseInt(fill);
                    var stroke = parseInt(geojsonStyle.PolyStyle.outline);

                    if (color) {
                        feature.style.fillColor = color.hex;
                        feature.style.fillOpacity = color.opacity;
                    }
                    if (fill) {
                        feature.style.fill = fill;
                    }
                    if (stroke) {
                        feature.style.stroke = stroke;
                    }
                    break;
            }
        }

        return feature;
    }

    function placemark2Geometry(placemark) {
        var geometry = {};

        if (placemark.Point) {
            if (placemark.Point.forEach) {
                var coordinates = [];
                placemark.Point.forEach(function(p) {
                    var coordinates2 = [];
                    var pointString = p.coordinates.replace(/\t|\n/gi, '');

                    if (pointString.trim() !== "") {
                        var point = pointString.split(",");
                        coordinates2 = [parseFloat(point[0]), parseFloat(point[1])];
                    }
                    coordinates.push(coordinates2);
                });

                geometry.type = "MultiPoint";
                geometry.coordinates = coordinates;
            } else {
                var coordinates = [];
                var pointString = placemark.Point.coordinates.replace(/\t|\n/gi, '');

                if (pointString.trim() !== "") {
                    var point = pointString.split(",");
                    coordinates = [parseFloat(point[0]), parseFloat(point[1])];
                }

                geometry.type = "Point";
                geometry.coordinates = coordinates;
            }
        } else if (placemark.LineString) {
            if (placemark.LineString.forEach) {
                var coordinates = [];
                placemark.LineString.forEach(function(l) {
                    var coordinates2 = [];
                    // var coordinatesString = l.coordinates.replace(/\t|\n/gi, '');
                    var coordinatesString = l.coordinates.trim();

                    coordinatesString.split(/\t|\n|\s/g).forEach(function(pointString) {
                        if (pointString.trim() !== "") {
                            var point = pointString.split(",");
                            coordinates2.push([parseFloat(point[0]), parseFloat(point[1])]);
                        }
                    });
                    coordinates.push(coordinates2);
                });

                geometry.type = "MultiLineString";
                geometry.coordinates = coordinates;
            } else {
                var coordinates = [];
                // var coordinatesString = placemark.LineString.coordinates.replace(/\t|\n/gi, '');
                var coordinatesString = placemark.LineString.coordinates.trim();

                coordinatesString.split(/\t|\n|\s/g).forEach(function(pointString) {
                    if (pointString.trim() !== "") {
                        var point = pointString.split(",");
                        coordinates.push([parseFloat(point[0]), parseFloat(point[1])]);
                    }
                });

                geometry.type = "LineString";
                geometry.coordinates = coordinates;
            }
        } else if (placemark.Polygon) {
            if (placemark.Polygon.forEach) {
                var coordinates = [];

                placemark.Polygon.forEach(function(polygon) {
                    var coordinates2 = boundarys2Coordinates(polygon);
                    coordinates.push(coordinates2);
                });

                geometry.type = "MultiPolygon";
                geometry.coordinates = coordinates;
            } else {
                var coordinates = boundarys2Coordinates(placemark.Polygon);

                geometry.type = "Polygon";
                geometry.coordinates = coordinates;
            }
        } else if (placemark.MultiGeometry) {
            var multiGeometry = placemark.MultiGeometry;
            if (Object.keys(multiGeometry).length > 1) {
                var geometries = [];

                for (var type in multiGeometry) {
                    if (multiGeometry[type].forEach) {
                        multiGeometry[type].forEach(function(tempGeometry) {
                            var tempPlacemark = {};
                            tempPlacemark[type] = tempGeometry;
                            geometries.push(placemark2Geometry(tempPlacemark));
                        });
                    } else {
                        var tempPlacemark = {};
                        tempPlacemark[type] = multiGeometry[type];
                        geometries.push(placemark2Geometry(tempPlacemark));
                    }
                }

                geometry.type = "GeometryCollection";
                geometry.geometries = geometries;
            } else {
                geometry = placemark2Geometry(multiGeometry);
            }
        }

        return geometry;
    }

    function boundary2Coordinates(boundary) {
        var boundaryCoordinates = [];
        // var coordinatesString = boundary.LinearRing.coordinates.replace(/\t|\n/gi, '');
        var coordinatesString = boundary.LinearRing.coordinates.trim();

        coordinatesString.split(/\t|\n|\s/g).forEach(function(pointString) {
            if (pointString.trim() !== "") {
                var point = pointString.split(",");
                boundaryCoordinates.push([parseFloat(point[0]), parseFloat(point[1])]);
            }
        });
        return boundaryCoordinates;
    }

    function boundarys2Coordinates(polygon) {
        var coordinates = [];

        ['outerBoundaryIs', 'innerBoundaryIs'].forEach(function(boundaryIs) {
            var boundarys = polygon[boundaryIs];
            if (boundarys) {
                var boundaryCoordinates;
                if (boundarys.forEach) {
                    boundarys.forEach(function(boundary) {
                        boundaryCoordinates = boundary2Coordinates(boundary);
                        coordinates.push(boundaryCoordinates);
                    });
                } else {
                    boundaryCoordinates = boundary2Coordinates(boundarys);
                    coordinates.push(boundaryCoordinates);
                }
            }
        });
        return coordinates;
    }

    function abgr2Color(abgr) {
        var color = {};
        if (typeof abgr === "string" && abgr.length === 8) {
            color.hex = "#" + abgr.slice(6, 8) + abgr.slice(4, 6) + abgr.slice(2, 4);
            color.opacity = Math.round(parseInt(abgr.slice(0, 2), 16) / 255 * 100) / 100;
        } else {
            color.hex = "#000";
            color.opacity = 1;
        }
        return color;
    }

    //geojson2kml
    GeoConvert.geojson2Kml = function(json, toString) {
        //check string?
        var geojson;

        if (typeof json === "string") {
            geojson = JSON.parse(json);
        } else {
            geojson = json;
        }

        var kmljson = emptyKmljson();
        var placemark = [];
        var style = [];
        placemark.sameName = true;

        if (geojson.type !== "Feature" && geojson.type !== "FeatureCollection") {
            geojson = {
                type: "Feature",
                geometry: geojson,
                properties: {}
            };
        }

        geojsonElementHandle(geojson, placemark, style);
        kmljson.Document.Style = geojsonStyle2KmlStyle(style);
        kmljson.Document.Placemark = placemark;

        var kml = GeoConvert.json2Xml(kmljson, 'kml');

        if (toString) {
            var kmlString = "<?xml version='1.0' encoding='UTF-8'?>" + (new XMLSerializer()).serializeToString(kml);
            return kmlString;
        } else {
            return kml;
        }
    };

    function emptyKmljson() {
        var kmljson = {};
        kmljson["@xmlns"] = "http://www.opengis.net/kml/2.2";
        kmljson["@xmlns:gx"] = "http://www.google.com/kml/ext/2.2";
        kmljson["@xmlns:kml"] = "http://www.opengis.net/kml/2.2";
        kmljson["@xmlns:atom"] = "http://www.w3.org/2005/Atom";
        kmljson.Document = {};

        return kmljson;
    }

    function geojsonElementHandle(gObject, placemark, style) {
        switch (gObject.type) {
            case "Point":
            case "LineString":
            case "Polygon":
                var type = gObject.type;
                if (placemark[type]) {
                    var tempPlacemark = geometry2Placemark(type, gObject.coordinates);

                    if (!placemark[type].push) {
                        placemark[type] = [placemark[type]];
                        placemark[type].sameName = true;
                    }
                    placemark[type].push(tempPlacemark);
                } else {
                    placemark[type] = geometry2Placemark(type, gObject.coordinates);
                }
                break;
            case "MultiPoint":
            case "MultiLineString":
            case "MultiPolygon":
                var type = gObject.type.replace("Multi", "");
                placemark.MultiGeometry = {};
                gObject.coordinates.forEach(function(coordinates) {
                    geojsonElementHandle({
                        type: type,
                        coordinates: coordinates
                    }, placemark.MultiGeometry);
                });
                break;
            case "GeometryCollection":
                placemark.MultiGeometry = {};
                gObject.geometries.forEach(function(geometry) {
                    geojsonElementHandle(geometry, placemark.MultiGeometry);
                });
                break;
            case "Feature":
                var tempPlacemark = {};
                geojsonElementHandle(gObject.geometry, tempPlacemark);
                if (gObject.properties.name) {
                    tempPlacemark.name = gObject.properties.name;
                }
                if (gObject.properties.description) {
                    tempPlacemark.description = gObject.properties.description;
                }
                var styleId = featureStyle(gObject, style);
                tempPlacemark.styleUrl = styleId;
                placemark.push(tempPlacemark);
                break;
            case "FeatureCollection":
                gObject.features.forEach(function(feature) {
                    geojsonElementHandle(feature, placemark, style);
                });
                break;
        }
    }

    function featureStyle(gObject, style) {
        var tempStyle = Object.assign({}, gObject.style);
        var styleId = 0;

        style.forEach(function(s, index) {
            var addStyle = false;
            for (var t in tempStyle) {
                if (tempStyle[t] !== s[t]) {
                    addStyle = true;
                }
            }

            if (!addStyle) {
                styleId = (index + 1);
            }
        });

        if (styleId === 0) {
            style.push(tempStyle);
            styleId = style.length;
        }

        return "custom" + styleId;
    }

    function geometry2Placemark(type, coordinates) {
        var placemark = {};
        switch (type) {
            case "Point":
                placemark = {};
                placemark.coordinates = coordinates.join();
                break;
            case "LineString":
                placemark = {};
                placemark.tessellate = 1;
                placemark.coordinates = coordinates.join(' ');
                break;
            case "Polygon":
                placemark = {};
                placemark.tessellate = 1;
                placemark.outerBoundaryIs = {};
                placemark.outerBoundaryIs.LinearRing = {};
                placemark.outerBoundaryIs.LinearRing.coordinates = coordinates[0].join(' ');

                coordinates.shift();
                coordinates.forEach(function(coordinates) {
                    placemark.innerBoundaryIs = {};
                    placemark.innerBoundaryIs.LinearRing = {};
                    placemark.innerBoundaryIs.LinearRing.coordinates = coordinates.join(' ');
                });
                break;
        }
        return placemark;
    }

    function geojsonStyle2KmlStyle(style) {
        var chart = {};
        chart.stroke = "outline";
        chart.fill = "fill";

        var kStyle = style.map(function(style1, index) {
            var tempStyle = {};
            tempStyle["@id"] = "custom" + (index + 1);

            for (var s in style1) {
                switch (s) {
                    case "iconUrl":
                    case "iconAnchor":
                    case "scale":
                        if (!tempStyle.IconStyle) {
                            tempStyle.IconStyle = {};
                        }
                        break;
                    case "color":
                    case "weight":
                        if (!tempStyle.LineStyle) {
                            tempStyle.LineStyle = {};
                        }
                        break;
                    case "stroke":
                    case "fill":
                    case "fillColor":
                        if (!tempStyle.PolyStyle) {
                            tempStyle.PolyStyle = {};
                        }
                        break;
                }

                switch (s) {
                    case "iconUrl":
                        tempStyle.IconStyle.Icon = {};
                        tempStyle.IconStyle.Icon.href = style1.iconUrl;
                        break;
                    case "iconAnchor":
                        tempStyle.IconStyle.hotSpot = {};
                        tempStyle.IconStyle.hotSpot["@x"] = style1.iconAnchor[0];
                        tempStyle.IconStyle.hotSpot["@y"] = style1.iconAnchor[1];
                        tempStyle.IconStyle.hotSpot["@xunits"] = "pixels";
                        tempStyle.IconStyle.hotSpot["@yunits"] = "pixels";
                        break;
                    case "scale":
                        tempStyle.IconStyle.scale = style1.scale;
                        break;
                    case "color":
                        tempStyle.LineStyle.color = color2Abgr(style1.color, style1.opacity);
                        break;
                    case "weight":
                        tempStyle.LineStyle.width = style1.weight;
                        break;
                    case "stroke":
                        tempStyle.PolyStyle.outline = style1.stroke;
                    case "fill":
                        tempStyle.PolyStyle.fill = style1.fill;
                        break;
                    case "fillColor":
                        tempStyle.PolyStyle.color = color2Abgr(style1.fillColor, style1.fillOpacity);
                        break;
                }
            }
            return tempStyle;
        });

        kStyle.sameName = true;
        return kStyle;
    }

    function color2Abgr(color, opacity) {
        color = color.replace("#", "");
        opacity = opacity ? opacity : 1;
        var a = parseInt(opacity * 255).toString(16);
        var abgr = a + color.slice(4, 6) + color.slice(2, 4) + color.slice(0, 2);
        return abgr;
    }
})(window, document);

;
(function(window, document, undefined) {
  //kmz2geojsons. Depends on JSZip.
  GeoConvert.kmz2Geojsons = function(kmz, callback) {
    if (JSZip) {
      var count = 0;
      var zip = new JSZip();

      var kmls = [];
      var imgs = {};

      zip.loadAsync(kmz)
        .then(function(result) {
          // for (var f in zip.files) {
          Object.keys(zip.files).forEach(function(f){
            count++;

            var ext = zip.file(f).name.split(".").pop();
            if (ext === "kml") {
              // you now have every files contained in the loaded zip
              result.file(f).async("string").then(function success(content) {
                kmls.push(content);
                finishUnzip();
              }, function error(e) {
                // handle the error
                count--;
              });
            } else if (ext === "png" || ext === "jpg") {
              result.file(f).async("base64").then(function success(content) {
                var base64 = "data:image/" + ext + ";base64,";
                imgs[f] = base64 + content;

                finishUnzip();
              }, function error(e) {
                // handle the error
                count--;
              });
            } else {
              count--;
            }
          });
          // }
        });
    }

    function finishUnzip() {
      count--;
      if (count === 0) {
        var geojsons = [];
        kmls.forEach(function(kml){
          var geojson = GeoConvert.kml2Geojson(kml);
          geojson.features.forEach(function(feature){
            if (feature.style && feature.style.iconUrl && imgs[feature.style.iconUrl]) {
              feature.style.iconUrl = imgs[feature.style.iconUrl];
            }
          });

          geojsons.push(geojson);
        });

        callback && callback(geojsons);
      }
    }
  };
})(window, document);
;
(function(window, document, undefined) {
  //gpx2geojson
  GeoConvert.gpx2Geojson = function(gpx, toString) {
    var json;

    if (typeof gpx === "string") {
      json = GeoConvert.xml2Json(gpx);
    } else if (typeof gpx === "object" && gpx.xmlVersion) {
      json = GeoConvert.xml2Json(gpx);
    } else {
      throw new Error("Unsupported input type");
    }

    var geojson = GeoConvert.emptyGeojson();
    gpxElementHandle("gpx", json.gpx, geojson);

    if (toString) {
      var jsonString = JSON.stringify(geojson);
      return jsonString;
    } else {
      return geojson;
    }
  };

  function gpxElementHandle(tag, contain, geojson) {
    if (tag === "gpx") {
      for (var c in contain) {
        gpxElementHandle(c, contain[c], geojson);
      }
    } else {
      var gpxDataHandle;
      switch (tag) {
        case "wpt":
          gpxDataHandle = waypoint2Features;
          break;
        case "trk":
          gpxDataHandle = trackpoint2Features;
          break;
        case "rte":
          gpxDataHandle = route2Features;
          break;
      }

      if (gpxDataHandle) {
        if (contain.forEach) {
          contain.forEach(function(c) {
            geojson.features.push(gpxDataHandle(c));
          });
        } else {
          geojson.features.push(gpxDataHandle(contain));
        }
      }
    }
  }

  function waypoint2Features(contain) {
    var feature = {};
    feature.type = "Feature";
    feature.properties = {};
    feature.properties.name = contain.name;
    feature.properties.cmt = contain.cmt;
    feature.properties.desc = contain.desc;
    feature.properties.time = contain.time;

    feature.geometry = {};
    feature.geometry.type = "Point";

    var coordinates = [contain["@lon"], contain["@lat"]];
    feature.geometry.coordinates = coordinates;

    return feature;
  }

  function trackpoint2Features(contain) {
    var feature = {};
    feature.type = "Feature";
    feature.properties = {};
    feature.properties.name = contain.name;

    feature.geometry = {};
    var coordinates;
    if (contain.trkseg && contain.trkseg.trkpt) {
      var trkpts = contain.trkseg.trkpt;
      if (trkpts.forEach) {
        feature.geometry.type = "LineString";
        coordinates = [];
        trkpts.forEach(function(trkpt) {
          var point = [trkpt["@lon"], trkpt["@lat"]];
          coordinates.push(point);
        });
      } else {
        feature.geometry.type = "Point";
        coordinates = [trkpts["@lon"], trkpts["@lat"]];
      }
    }
    feature.geometry.coordinates = coordinates;

    return feature;
  }

  function route2Features(contain) {
    var feature = {};
    feature.type = "Feature";
    feature.properties = {};
    feature.properties.name = contain.name;

    feature.geometry = {};
    var coordinates;
    if (contain.rtept) {
      var rtepts = contain.rtept;
      if (rtepts.forEach) {
        feature.geometry.type = "LineString";
        coordinates = [];
        rtepts.forEach(function(trkpt) {
          var point = [trkpt["@lon"], trkpt["@lat"]];
          coordinates.push(point);
        });
      } else {
        feature.geometry.type = "Point";
        coordinates = [rtepts["@lon"], rtepts["@lat"]];
      }
    }
    feature.geometry.coordinates = coordinates;

    return feature;
  }

  //geojson2kml
  GeoConvert.geojson2Gpx = function(json, toString) {
    //check string?
    var geojson;

    if (typeof json === "string") {
      geojson = JSON.parse(json);
    } else {
      geojson = json;
    }

    var gpxjson = emptyGpxjson();
    var waypoint = [];
    var route = [];
    waypoint.sameName = true;
    route.sameName = true;

    if (geojson.type !== "Feature" && geojson.type !== "FeatureCollection") {
      geojson = {
        type: "Feature",
        geometry: geojson,
        properties: {}
      };
    }

    geojsonElementHandle(geojson, waypoint, route);
    gpxjson.wpt = waypoint;
    gpxjson.rte = route;

    var gpx = GeoConvert.json2Xml(gpxjson, 'gpx');

    if (toString) {
      var gpxString = "<?xml version='1.0' encoding='UTF-8'?>" + (new XMLSerializer()).serializeToString(gpx);
      return gpxString;
    } else {
      return gpx;
    }
  };

  function emptyGpxjson() {
    var gpxjson = {};
    gpxjson["@xmlns"] = "http://www.topografix.com/GPX/1/1";
    gpxjson["@version"] = "1.1";
    gpxjson["@creator"] = "GeoConvert";

    gpxjson.metadata = {};
    gpxjson.metadata.name = "Geojson to GPX";

    return gpxjson;
  }

  function geojsonElementHandle(gObject, waypoint, route, properties) {
    switch (gObject.type) {
      case "Point":
        var wpt = point2Waypoint(gObject.coordinates);
        wpt.name = properties.name ? properties.name : "";
        waypoint.push(wpt);
        break;
      case "LineString":
        var rte = lineString2Route(gObject.coordinates);
        rte.name = properties.name ? properties.name : "";
        route.push(rte);
        break;
      case "MultiPoint":
      case "MultiLineString":
        var type = gObject.type.replace("Multi", "");
        gObject.coordinates.forEach(function(coordinates) {
          geojsonElementHandle({
            type: type,
            coordinates: coordinates
          }, waypoint, route, properties);
        });
        break;
      case "GeometryCollection":
        gObject.geometries.forEach(function(geometry) {
          geojsonElementHandle(geometry, waypoint, route, properties);
        });
        break;
      case "Feature":
        geojsonElementHandle(gObject.geometry, waypoint, route, gObject.properties);
        break;
      case "FeatureCollection":
        gObject.features.forEach(function(feature) {
          geojsonElementHandle(feature, waypoint, route);
        });
        break;
    }
  }

  function point2Waypoint(coordinates) {
    var waypoint = {};
    waypoint["@lon"] = coordinates[0];
    waypoint["@lat"] = coordinates[1];

    return waypoint;
  }

  function lineString2Route(coordinates) {
    var route = {};
    route.rtept = [];
    route.rtept.sameName = true;
    coordinates.forEach(function(coordinates) {
      var rtept = {};
      rtept["@lon"] = coordinates[0];
      rtept["@lat"] = coordinates[1];
      route.rtept.push(rtept);
    });

    return route;
  }
})(window, document);
;
(function(window, document, undefined) {
	//dbase field type
	var dBaseFieldType = {
		"N": "Number",
		"C": "Character", // binary
		"L": "Logical",
		"D": "Date",
		"M": "Memo", // binary
		"F": "Floating point",
		"B": "Binary",
		"G": "General",
		"P": "Picture",
		"Y": "Currency",
		"T": "DateTime",
		"I": "Integer",
		"V": "VariField",
		"X": "Variant",
		"@": "Timestamp",
		"O": "Double",
		"+": "Autoincrement"
	};

	//shapefile2Geojson. shapefile need contain .shp, .dbf.
	//shp & dbf are arrayBuffer.
	GeoConvert.shapefile2Geojson = function(file, toString) {
		var geojson = shapefileHandle(file,toString);

		if (toString) {
			var jsonString = JSON.stringify(geojson);
			return jsonString;
		} else {
			return geojson;
		}
	};

	function shapefileHandle(file, src) {
		if (file.shp && file.dbf) {
			var geojson = GeoConvert.emptyGeojson();

			//prj
			var projection = file.prj ? file.prj :src;

			//encoding
			var encoding = file.encoding;

			//shp
			readShpBuffer(file.shp, geojson, projection);
			//dbf
			readDbfBuffer(file.dbf, geojson, encoding);

			return geojson;
		} else {
			throw new Error("need complete shapefile");
		}
	}

	function Transitions(fromProjection, toProjection) {
		// this.fromProjection = fromProjection;
		// this.toProjection = toProjection;
		if(fromProjection.spatialReference == "TWD97"){
    		this.fromProjection = G.proj4.twd97;	
    	}
    	else if(fromProjection.spatialReference == "TWD67"){
    		this.fromProjection = G.proj4.twd67;	
    	}
    	else{
    		this.fromProjection = G.proj4.wgs84;	
    	}        
        //this.toProjection = toProjection;
        this.toProjection = "G.proj4.wgs84";
	}

	Transitions.prototype.trans = function(coordinates) {
		return proj4(this.fromProjection).inverse(coordinates);
		//return proj4(this.fromProjection, this.toProjection, coordinates);
	}

	function readShpBuffer(arrayBuffer, geojson, projection) {
		var dataView = new DataView(arrayBuffer);
		var byteLength = dataView.byteLength;

		//Main File Header
		//File Length
		var fileLength = dataView.getInt32(24);

		//Shape Type
		var shapeType = dataView.getInt32(32, true);

		//Bounding Box
		var xmin = dataView.getFloat64(36, true);
		var ymin = dataView.getFloat64(44, true);
		var xmax = dataView.getFloat64(52, true);
		var ymax = dataView.getFloat64(60, true);

		// var zmin = dataView.getFloat64(68, true);
		// var zmax = dataView.getFloat64(76, true);
		// var mmin = dataView.getFloat64(84, true);
		// var mmax = dataView.getFloat64(92, true);

		var transitions = projection && !/GCS_WGS_1984|WGS84/g.test(projection) ? new Transitions(projection, proj4.WGS84) : transitions;
		geojson.bbox = readBoxRecord(dataView, 36, transitions);

		//Record
		var byteOffset = 100;
		while (byteOffset < byteLength) {
			var result = readShpFileRecord(dataView, byteOffset, transitions);
			geojson.features.push(result.feature);
			byteOffset = result.byteOffset;
		}
	}

	function readShpFileRecord(dataView, byteOffset, transitions) {
		var result = {};
		var feature = {};
		feature.type = "Feature";

		//Record Number
		var recordNumber = dataView.getInt32(byteOffset);

		//Content Length
		var contentLength = dataView.getInt32(byteOffset + 4);

		//Shape Type
		var shapeType = dataView.getInt32(byteOffset + 8, true);

		byteOffset += 12;

		var readRecord;
		switch (shapeType) {
			case 0: //Null Shape
				break;

			case 1: //Point
			case 11: //PointZ
			case 21: //PointM

				readRecord = readPointRecord;
				break;

			case 3: //PolyLine
			case 13: //PolyLineZ
			case 23: //PolyLineM
				readRecord = readPolylineRecord;
				break;

			case 5: //Polygon
			case 15: //PolygonZ
			case 25: //PolygonM
				readRecord = readPolygonRecord;
				break;

			case 8: //MultiPoint
			case 18: //MultiPointZ
				readRecord = readMultiPointRecord;
				break;

			case 28: //MultiPointM
				break;

			case 31: //MultiPatch
				break;
			default:
				break;
		}

		if (readRecord) {
			var geometry = {};
			var record = readRecord(dataView, byteOffset, transitions);
			geometry.type = record.type;
			geometry.coordinates = record.coordinates;

			if (record.box) feature.bbox = record.box;
			feature.geometry = geometry;
		}

		result.feature = feature;

		//The content length for a record is the length of the record contents section measured in
		//16-bit words. Each record, therefore, contributes (4 + content length) 16-bit words
		//toward the total length of the file, as stored at Byte 24 in the file header.
		result.byteOffset = byteOffset + contentLength * 2 - 4;
		return result;
	}

	//box type
	function readBoxRecord(dataView, byteOffset, transitions) {
		var xmin = dataView.getFloat64(byteOffset, true);
		var ymin = dataView.getFloat64(byteOffset + 8, true);
		var xmax = dataView.getFloat64(byteOffset + 16, true);
		var ymax = dataView.getFloat64(byteOffset + 24, true);

		var box;
		if (transitions) {
			box = transitions.trans([xmin, ymin]).concat(transitions.trans([xmax, ymax]));
		} else {
			box = [xmin, ymin, xmax, ymax];
		}

		return box;
	}

	//point type
	function readPointRecord(dataView, byteOffset, transitions) {
		var record = {};

		var x = dataView.getFloat64(byteOffset, true);
		var y = dataView.getFloat64(byteOffset + 8, true);
		byteOffset += 16;
		record.type = "Point";
		record.coordinates = transitions ? transitions.trans([x, y]) : [x, y];

		return record;
	}

	//multipoint type
	function readMultiPointRecord(dataView, byteOffset, transitions) {
		var record = {};

		var box = readBoxRecord(dataView, byteOffset, transitions);
		var numPoints = dataView.getInt32(byteOffset + 32, true);
		var points = [];
		var coordinates = [];

		byteOffset = byteOffset + 36;
		for (var i = 0; i < numPoints; i++) {
			var x = dataView.getFloat64(byteOffset, true);
			var y = dataView.getFloat64(byteOffset + 8, true);

			var point = transitions ? transitions.trans([x, y]) : [x, y];
			points.push(point);
			byteOffset += 16;
		}

		record.type = "MultiPoint";
		record.box = box;
		record.coordinates = points;

		return record;
	}

	//pointM type
	function readPointMRecord(dataView, byteOffset, transitions) {
		var record = {};

		var x = dataView.getFloat64(byteOffset, true);
		var y = dataView.getFloat64(byteOffset + 8, true);
		// var m = dataView.getFloat64(byteOffset + 16, true);
		byteOffset += 24;
		record.type = "Point";
		record.coordinates = transitions ? transitions.trans([x, y]) : [x, y];

		return record;
	}

	//pointZ type
	function readPointZRecord(dataView, byteOffset, transitions) {
		var record = {};

		var x = dataView.getFloat64(byteOffset, true);
		var y = dataView.getFloat64(byteOffset + 8, true);
		// var z = dataView.getFloat64(byteOffset + 16, true);
		// var m = dataView.getFloat64(byteOffset + 24, true);
		byteOffset += 32;
		record.type = "Point";
		record.coordinates = transitions ? transitions.trans([x, y]) : [x, y];

		return record;
	}

	//polyline type
	function readPolylineRecord(dataView, byteOffset, transitions) {
		var record = {};

		var box = readBoxRecord(dataView, byteOffset, transitions);
		var numParts = dataView.getInt32(byteOffset + 32, true);
		var numPoints = dataView.getInt32(byteOffset + 36, true);
		var parts = [];
		var points = [];
		var coordinates = [];

		for (var i = 0; i < numParts; i++) {
			var part = dataView.getInt32(byteOffset + 40 + 4 * i, true) - 1;
			parts.push(part);
		}
		parts.push(numPoints - 1);

		byteOffset = byteOffset + 40 + 4 * numParts;
		for (var i = 0; i < numPoints; i++) {
			var x = dataView.getFloat64(byteOffset, true);
			var y = dataView.getFloat64(byteOffset + 8, true);

			var point = transitions ? transitions.trans([x, y]) : [x, y];
			points.push(point);
			byteOffset += 16;

			if (parts.indexOf(i) !== -1) {
				coordinates.push(points);
				points = [];
			}
		}

		record.box = box;
		record.numPoints = numPoints;

		if (numParts === 1) {
			record.type = "LineString";
			record.coordinates = coordinates[0];
		} else {
			record.type = "MultiLineString";
			record.coordinates = coordinates;
		}

		return record;
	}

	//polygon type
	function readPolygonRecord(dataView, byteOffset, transitions) {
		var record = {};

		var box = readBoxRecord(dataView, byteOffset, transitions);
		var numParts = dataView.getInt32(byteOffset + 32, true);
		var numPoints = dataView.getInt32(byteOffset + 36, true);
		var parts = [];
		var points = [];
		var coordinates = [];
		var rings = [];

		var prevX = null;
		var prevY = null;
		var checkCounterClockwise = 0;

		for (var i = 0; i < numParts; i++) {
			var part = dataView.getInt32(byteOffset + 40 + 4 * i, true) - 1;
			parts.push(part);
		}
		parts.push(numPoints - 1);

		byteOffset = byteOffset + 40 + 4 * numParts;
		for (var i = 0; i < numPoints; i++) {
			var x = dataView.getFloat64(byteOffset, true);
			var y = dataView.getFloat64(byteOffset + 8, true);

			var point = transitions ? transitions.trans([x, y]) : [x, y];
			points.push(point);
			byteOffset += 16;

			//check polygon is hole?
			//http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order
			if (!prevX || !prevY) {
				// [prevX, prevY] = [x, y];
				prevX = x;
				prevY = y;
			}
			checkCounterClockwise = checkCounterClockwise + (x - prevX) * (y + prevY);
			// [prevX, prevY] = [x, y];
			prevX = x;
			prevY = y;

			if (parts.indexOf(i) !== -1) {
				coordinates.push(points);

				if (checkCounterClockwise >= 0) {
					rings.push(coordinates);
				} else {
					rings[rings.length - 1] = rings[rings.length - 1].concat(coordinates);
				}

				points = [];
				coordinates = [];
				checkCounterClockwise = 0;
				// [prevX, prevY] = [null, null];
				prevX = null;
				prevY = null;
			}
		}

		record.box = box;
		record.numPoints = numPoints;

		if (numParts === 1) {
			record.type = "Polygon";
			record.coordinates = rings[0];
		} else {
			record.type = "MultiPolygon";
			record.coordinates = rings;
		}

		return record;
	}

	function readDbfBuffer(arrayBuffer, geojson, encoding) {
		var dataView = new DataView(arrayBuffer);
		var byteLength = dataView.byteLength;

		//Main File Header
		var type = dataView.getInt8(0);
		var numRecords = dataView.getInt32(4, true);
		var headerLength = dataView.getInt16(8, true);
		var recordLength = dataView.getInt16(10, true);

		var decode;
		var codePage = encoding || dataView.getInt8(29);
		switch (codePage) {
			case 0x4F: //big-5
			case "0x4F":
				decode = GeoConvert.decode.big5;
				break;
			default: //utf-8
				decode = GeoConvert.decode.utf8;
				break;
		}

		if (type !== 0x03) {
			throw new Error("File has unknown/unsupported dBase version:" + type);
		}

		//Fidld Descriptions
		var byteOffset = 32;
		var fields = [];
		while (dataView.getUint8(byteOffset) !== 0x0D) {
			var field = {};
			field.name = decode.decode(arrayBuffer.slice(byteOffset, byteOffset + 10)).replace(/\u0000/g, "");
			field.type = dBaseFieldType[decode.decode(arrayBuffer.slice(byteOffset + 11, byteOffset + 12))];
			field.fieldLength = dataView.getUint8(byteOffset + 16);
			field.decimals = dataView.getUint8(byteOffset + 17);
			fields.push(field);

			byteOffset += 32;
		}

		//Record
		var numFields = fields.length;
		for (var i = 0; i < numRecords; i++) {
			var record = {};
			byteOffset = headerLength + i * recordLength;
			//skip delete code
			byteOffset += 1;
			for (var j = 0; j < numFields; j++) {
				var recordField = fields[j];
				var value = decode.decode(arrayBuffer.slice(byteOffset, byteOffset + recordField.fieldLength)).trim();
				record[recordField.name] = value;
				byteOffset += recordField.fieldLength;
			}
			geojson.features[i].properties = record;
		}
	}
})(window, document);
;
(function(window, document, undefined) {
    //code index
    var codeIndex = {
        "1": "text",
        "2": "name",
        "5": "handle",
        "6": "linetypeName",
        "7": "textStyleName",
        "8": "layerName",
        "10": "lowerLeftCorner",
        "11": "upperRightCorner",
        "12": "centerDcs",
        "13": "snapBasePoint",
        "14": "snapSpacing",
        "15": "gridSpacing",
        "16": "viewDirectionFromTarget",
        "17": "viewTarget",
        "39": "thickness",
        "48": "linetypeScale",
        "50": "textRotation",
        "51": "textOblique",
        "60": "visibility",
        "62": "colorNumber",
        "70": "closed"
    };


    //dxf2Geojson. file is dxf text.
    GeoConvert.dxf2Geojson = function(file, toString) {
        var geojson = dxfHandle(file, toString);

        if (toString) {
            var jsonString = JSON.stringify(geojson);
            return jsonString;
        } else {
            return geojson;
        }
    };

    function Transitions(fromProjection, toProjection) {
    	if(fromProjection.spatialReference == "TWD97"){
    		this.fromProjection = G.proj4.twd97;	
    	}
    	else if(fromProjection.spatialReference == "TWD67"){
    		this.fromProjection = G.proj4.twd67;	
    	}
    	else{
    		this.fromProjection = G.proj4.wgs84;	
    	}                
        this.toProjection = "G.proj4.wgs84";
    }

    Transitions.prototype.trans = function(coordinates) {    	    	
    	return proj4(this.fromProjection).inverse(coordinates);
        //return proj4(this.fromProjection, this.toProjection, coordinates);
    }

    function dxfHandle(file, src) {
        if (file.dxf !== undefined) {
            var geojson = GeoConvert.emptyGeojson();

            //prj
            var projection = (file.prj) ? (file.prj) : (src);

            var transitions = projection && !/GCS_WGS_1984|WGS84/g.test(projection) ? new Transitions(projection, proj4.WGS84) : transitions;

            //dxf
            var dxf = readDxfText(file.dxf);

            //geojson
            var geojson = dxfObject2Geojson(dxf, transitions);

            return geojson;
        } else {
            throw new Error("need dxf file");
        }
    }

    function readDxfText(dxfText) {
        var dxfArray = dxfText.split(/\r\n|\r|\n/g);
        var dxf = {};

        // HEADER
        var headerStart = dxfArray.indexOf("HEADER");
        var headerEnd = dxfArray.indexOf("ENDSEC", headerStart) + 1;
        var headerArray = dxfArray.slice(headerStart, headerEnd);
        dxf.header = readDxfHeader(headerArray);

        // TABLES
        var tablesStart = dxfArray.indexOf("TABLES");
        var tablesEnd = dxfArray.indexOf("ENDSEC", tablesStart) + 1;
        var tablesArray = dxfArray.slice(tablesStart, tablesEnd);
        dxf.tables = readDxfTables(tablesArray);

        // BLOCKS
        var blocksStart = dxfArray.indexOf("BLOCKS");
        var blocksEnd = dxfArray.indexOf("ENDSEC", blocksStart) + 1;
        var blocksArray = dxfArray.slice(blocksStart, blocksEnd);
        dxf.blocks = readDxfBlocks(blocksArray);

        // ENTITIES
        var entitiesStart = dxfArray.indexOf("ENTITIES");
        var entitiesEnd = dxfArray.indexOf("ENDSEC", entitiesStart) + 1;
        var entitiesArray = dxfArray.slice(entitiesStart, entitiesEnd);
        dxf.entities = readDxfEntities(entitiesArray);

        return dxf;
    }

    //origin point of dxf
    function readDxfPoints(data, start, x, y, z) {
        var points = {};
        points.x = readGroupValue(x, data[start]);
        points.y = readGroupValue(y, data[start + 2]);

        if (z !== undefined) {
            points.z = readGroupValue(z, data[start + 4]);
        }
        return points;
    }

    // //point of geojson
    // function readDxfPoints(data, start, x, y, z) {
    // 	var x = readGroupValue(x, data[start]);
    // 	var y = readGroupValue(y, data[start + 2]);
    // 	var points = [x, y];

    // 	return points;
    // }

    function readDxfHeader(headerArray) {
        var imax = headerArray.length;
        var i = 0;
        var header = {};

        while (i < imax) {
            var code = headerArray[i].trim();
            if (code === "9") {
                var key = headerArray[i + 1];
                var valueCode = headerArray[i + 2].trim();
                if (valueCode === "10") {
                    var points = {};
                    var start = i + 3;
                    if (headerArray[i + 6].trim() === "30") {
                        points = readDxfPoints(headerArray, start, 10, 20, 30);;
                        i = i + 8;
                    } else {
                        points = readDxfPoints(headerArray, start, 10, 20);
                        i = i + 6;
                    }
                    header[key] = points;
                } else {
                    header[key] = readGroupValue(parseInt(valueCode), headerArray[i + 3]);
                    i = i + 4;
                }
            } else {
                i++;
            }
        }

        return header;
    }

    function readDxfTable(tableArray, index) {
        var length = tableArray.length - 2;
        var table = {};
        var code, value, name;

        while (index < length) {
            code = tableArray[index].trim();
            value = tableArray[index + 1].trim();

            switch (code) {
                case "0":
                    var start = index + 2;
                    var end = tableArray.indexOf(name, start) + 1 || length;
                    var children = tableArray.slice(start, end - 2);
                    table[value] = table[value] || [];
                    table[value].push(readDxfTable(children, 0));
                    index = end - 4;
                    break;
                case "2":
                    name = value;
                    table.name = value;
                    break;
                case "3":
                    table.description = value;
                    break;
                case "5":
                    table.handle = value;
                    break;
                case "10":
                case "11":
                case "12":
                case "13":
                case "14":
                case "15":
                    var start = index + 1;
                    var x = parseInt(code);
                    table[codeIndex[code]] = readDxfPoints(tableArray, start, x, x + 10);
                    break;
                case "16":
                case "17":
                    var start = index + 1;
                    var x = parseInt(code);
                    table[codeIndex[code]] = readDxfPoints(tableArray, start, x, x + 10, x + 20);
                    break;
                case "40":
                    table.patternLength = parseFloat(value);
                    break;
                case "49":
                    table.elements.push(parseFloat(value));
                    break;
                case "62":
                    table.color = parseInt(value);
                    break;
                case "73":
                    table.elements = [];
                    break;
                case "330":
                case "360":
                    table.ownerHandle = value;
                    break;
            }
            index = index + 2;
        }
        return table;
    }

    function readDxfTables(tablesArray) {
        var imax = tablesArray.length;
        var i = 0;
        var tables = {};

        while (i < imax) {
            var tableStart = tablesArray.indexOf("TABLE", i);
            var tableEnd = tablesArray.indexOf("ENDTAB", tableStart) + 1;

            if (tableEnd !== 0) {
                var tableArray = tablesArray.slice(tableStart, tableEnd);
                tables[tablesArray[tableStart + 2]] = readDxfTable(tableArray, 1);
                i = tableEnd;
            } else {
                i = imax + 1;
            }
        }

        return tables;
    }

    function readDxfBlock(blockArray, index) {
        var length = blockArray.length - 2;
        var block = {};
        var code, value;

        while (index < length) {
            code = blockArray[index].trim();
            value = blockArray[index + 1].trim();

            switch (code) {
                case "0":
                    var end = blockArray.indexOf("  0", index + 2) + 1 || length;
                    var children = blockArray.slice(index, end - 1);

                    block.entities = block.entities || [];
                    block.entities.push(readDxfEntity(children, 0));
                    index = end - 3;
                    break;
                case "1":
                    block.xrefName = value;
                    break;
                case "2":
                    block.name = value;
                    break;
                case "3":
                    block.blockName = value;
                    break;
                case "5":
                    block.handle = value;
                    break;
                case "8":
                    block.layerName = value;
                    break;
                case "10":
                    var start = index + 1;
                    block.basePoint = readDxfPoints(blockArray, start, 10, 20, 30);
                    break;
                case "330":
                    block.ownerHandle = value;
                    break;
                case "360":
                    table.ownerHandle = value;
                    break;
            }

            index = index + 2;
        }
        return block;
    }

    function readDxfBlocks(blocksArray) {
        var imax = blocksArray.length;
        var i = 0;
        var blocks = {};

        while (i < imax) {
            var blockStart = blocksArray.indexOf("BLOCK", i);
            var blockEnd = blocksArray.indexOf("ENDBLK", blockStart) + 1;

            if (blockEnd !== 0) {
                var blockArray = blocksArray.slice(blockStart, blockEnd);

                block = readDxfBlock(blockArray, 1);
                blocks[block.blockName] = block;
                i = blockEnd;
            } else {
                i = imax + 1;
            }
        }

        return blocks;
    }

    function readDxfEntity(entityArray, index) {
        var length = entityArray.length;
        var entity = {};
        var code, value, type;
        var edgeType = false;

        while (index < length) {
            code = entityArray[index].trim();
            value = entityArray[index + 1].trim();

            switch (code) {
                case "0":
                    type = value;
                    entity.entityType = value;
                    break;
                case "1":
                case "5":
                case "6":
                case "7":
                case "8":
                    entity[codeIndex[code]] = value;
                    break;
                case "10":
                    var start = index + 1;
                    switch (type) {
                        case "HATCH":
                            if (edgeType) {
                                var vertices = entity.multiVertices[entity.multiVertices.length - 1];
                                if (entity.verticesNumber > vertices.length) {
                                    var point = readDxfPoints(entityArray, start, 10, 20);
                                    var lastPoint = vertices[vertices.length - 1];
                                    if (lastPoint === undefined || (lastPoint.x !== point.x && lastPoint.y !== point.y)) {
                                        vertices.push(point);
                                    }
                                }
                            }
                            break;
                        case "LWPOLYLINE":
                            entity.vertices = entity.vertices || [];
                            entity.vertices.push(readDxfPoints(entityArray, start, 10, 20));
                            break;
                        case "POINT":
                        case "MTEXT":
                        case "XLINE":
                            entity.point = readDxfPoints(entityArray, start, 10, 20, 30);
                            break;
                        case "TEXT":
                        case "LINE":
                            entity.startPoint = readDxfPoints(entityArray, start, 10, 20, 30);
                            break;
                    }

                    break;
                case "11":
                    var start = index + 1;
                    switch (type) {
                        case "HATCH":
                            if (edgeType) {
                                var vertices = entity.multiVertices[entity.multiVertices.length - 1];
                                vertices.push(readDxfPoints(entityArray, start, 11, 21));
                            }
                            edgeType = false;
                            break;
                        case "TEXT":
                        case "LINE":
                            entity.endPoint = readDxfPoints(entityArray, start, 10, 20, 30);
                            break;
                    }

                    break;
                case "39":
                case "48":
                case "50":
                case "51":
                    entity[codeIndex[code]] = parseFloat(value);
                    break;
                case "40":
                    switch (type) {
                        case "TEXT":
                            entity.textHeight = parseFloat(value);
                            break;
                        case "ARC":
                        case "CIRCLE":
                            entity.radius = parseFloat(value);
                            break;
                    }
                    break;
                case "60":
                case "62":
                case "70":
                    entity[codeIndex[code]] = parseInt(value);
                    break;
                case "72":
                    if (value === "1" || value === "0") {
                        edgeType = true;
                    }
                    break;
                case "91":
                    entity.multiVertices = [];
                    break;
                case "93":
                    entity.verticesNumber = parseInt(value);
                    entity.multiVertices.push([]);
                    break;
                case "330":
                    entity.ownerHandle = value;
                    break;
            }

            index = index + 2;
        }
        return entity;
    }

    function readDxfEntities(entitiesArray) {
        var imax = entitiesArray.length;
        var i = 0;
        var entities = [];

        while (i < imax) {
            var entityStart = entitiesArray.indexOf("  0", i);
            var entityEnd = entitiesArray.indexOf("  0", entityStart + 1);

            if (entityEnd !== -1) {
                var entityArray = entitiesArray.slice(entityStart, entityEnd);

                entity = readDxfEntity(entityArray, 0);
                entities.push(entity);
                i = entityEnd;
            } else {
                i = imax + 1;
            }
        }

        return entities;
    }

    function readGroupValue(code, value) {
        if (code <= 9) {
            return value;
        } else if (code >= 10 && code <= 59) {
            return parseFloat(value);
        } else if (code >= 60 && code <= 99) {
            return parseInt(value);
        } else if (code >= 100 && code <= 109) {
            return value;
        } else if (code >= 110 && code <= 149) {
            return parseFloat(value);
        } else if (code >= 160 && code <= 179) {
            return parseInt(value);
        } else if (code >= 210 && code <= 239) {
            return parseFloat(value);
        } else if (code >= 270 && code <= 289) {
            return parseInt(value);
        } else if (code >= 290 && code <= 299) {
            return !!parseInt(value);
        } else if (code >= 300 && code <= 369) {
            return value;
        } else if (code >= 370 && code <= 389) {
            return parseInt(value);
        } else if (code >= 390 && code <= 399) {
            return value;
        } else if (code >= 400 && code <= 409) {
            return parseInt(value);
        } else if (code >= 410 && code <= 419) {
            return value;
        } else if (code >= 420 && code <= 429) {
            return parseInt(value);
        } else if (code >= 430 && code <= 439) {
            return value;
        } else if (code >= 440 && code <= 459) {
            return parseInt(value);
        } else if (code >= 460 && code <= 469) {
            return parseFloat(value);
        } else if (code >= 470 && code <= 481) {
            return value;
        } else if (code === 999) {
            return value;
        } else if (code >= 1000 && code <= 1009) {
            return value;
        } else if (code >= 1010 && code <= 1059) {
            return parseFloat(value);
        } else if (code >= 1060 && code <= 1071) {
            return parseInt(value);
        } else {
            return value;
        }
    }

    function dxf2GeojsonPoint(point, transitions) {
        var point = transitions ? transitions.trans([point.x, point.y]) : [point.x, point.y];
        return point;
    }

    function dxf2GeojsonPolyline(polyline, transitions) {
        var lineString = [];
        if (polyline === undefined)
            var cc = 123;
        polyline.forEach(function(point) {
            lineString.push(dxf2GeojsonPoint(point, transitions));
        });
        return lineString;
    }

    function dxfEntity2Feature(entity, transitions) {
        var geometry = {};
        switch (entity.entityType) {
            case "ARC":
                break;
            case "CIRCLE":
                break;
            case "INSERT":
                break;
            case "TEXT":
                geometry.type = "Point";
                geometry.coordinates = dxf2GeojsonPoint(entity.startPoint, transitions);
                break;
            case "LINE":
                geometry.type = "LineString";
                geometry.coordinates = dxf2GeojsonPolyline([entity.startPoint, entity.endPoint], transitions);
                break;
            case "LWPOLYLINE":
                geometry.type = "LineString";
                geometry.coordinates = dxf2GeojsonPolyline(entity.vertices, transitions);
                if (entity.closed === 1) {
                    geometry.coordinates.push(geometry.coordinates[0]);
                }
                break;
            case "HATCH":
                geometry.type = "Polygon";
                geometry.coordinates = [];
                entity.multiVertices.forEach(function(vertices) {
                    var coordinates = dxf2GeojsonPolyline(vertices, transitions);
                    coordinates.push(coordinates[0]);
                    geometry.coordinates.push(coordinates);
                });
                break;
            default:
                break;
        }

        if (geometry.type !== undefined) {
            var feature = {};
            feature.type = "Feature";
            feature.geometry = geometry;
            feature.properties = {};
            feature.style = {};

            [
                "text",
                "textHeight",
                "textStyleName",
                "layerName",
                "entityType"
            ].forEach(function(name) {
                if (entity[name] !== undefined) {
                    feature.properties[name] = entity[name];
                }
            });

            return feature;
        }
    }

    function dxfObject2Geojson(dxf, transitions) {
        //console.log(dxf);

        var geojson = GeoConvert.emptyGeojson();

        //blocks
        for (var key in dxf.blocks) {
            var block = dxf.blocks[key];
            var entities = block.entities;

            if (entities !== undefined) {
                entities.forEach(function(entity) {
                    var feature = dxfEntity2Feature(entity, transitions);
                    if (feature !== undefined) {
                        geojson.features.push(feature);
                    }
                });
            }
        }

        //entities
        dxf.entities.forEach(function(entity) {
            var feature = dxfEntity2Feature(entity, transitions);
            if (feature !== undefined) {
                geojson.features.push(feature);
            }
        });

        return geojson;
    }
})(window, document);

G.converter = {};
// create a new feature collection parent object
G.converter.emptyGeojson = function() {
    return {
        type: 'FeatureCollection',
        features: []
    };
};

//shapefile(files) to geojson object
G.converter.shapefileToGeojson = function(data, info) {
    // return G.converter.fileToGeojson('shp', data, info);
    return GeoConvert.shapefile2Geojson(data, info);
};

//dxf(file) to geojson object
G.converter.dxfToGeojson = function(data, info) {
    return GeoConvert.dxf2Geojson(data, info);
    //return G.converter.fileToGeojson('dxf', data, info);
};

//kmz(file) to geojson object
G.converter.kmzToGeojson = function(data, callback) {
    GeoConvert.kmz2Geojsons(data, function(geojson) {
        callback(geojson);
    });
};

//kml(string) to geojson object
G.converter.kmlToGeojson = function(data) {
    return GeoConvert.kml2Geojson(data);
};

G.converter.gpxToGeojson = function(data) {
	return GeoConvert.gpx2Geojson(data);
    //return G.converter.xmlToGeojson.gpx(data);
};

/**
 * 轉換成geojson
 * @param {String} type 輸入的資料的類型
 * @param {} data 輸入的資料. shp為{shp,shx,dbf} data. dxf為dxf data. kmz為 kmz data. kml,gpx為string
 * @param {} info 輸入的資料的相關資訊,如座標系統,callback function. 部分格式會用到
 * @return {Object} geojson
 */
G.converter.toGeojson = function(type, data, callback) {
    var geojson;
    switch (type) {
        case 'dxf':
            geojson = this.dxfToGeojson(data, callback);
            break;
        case 'gpx':
            geojson = this.gpxToGeojson(data);
            break;
        case 'kml':
            geojson = this.kmlToGeojson(data);
            break;
        case 'kmz':
            geojson = this.kmzToGeojson(data, callback);
            break;
        case 'shp':
            geojson = this.shapefileToGeojson(data, callback);
            break;
        default:
            geojson = this.emptyGeojson();
            break;
    }
    return geojson;
};

/*\
|*|
|*|    JXON framework - Copyleft 2011 by Mozilla Developer Network
|*|
|*|    Revision #1 - September 5, 2014
|*|
|*|    https://developer.mozilla.org/en-US/docs/JXON
|*|
|*|    This framework is released under the GNU Public License, version 3 or later.
|*|    http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
\*/

G.converter.JXON = new(function() {

    const
        sValProp = "keyValue",
        sAttrProp = "keyAttributes",
        sAttrsPref = "@",
        /* you can customize these values */
        aCache = [],
        rIsNull = /^\s*$/,
        rIsBool = /^(?:true|false)$/i;

    function parseText(sValue) {
        if (rIsNull.test(sValue)) {
            return null;
        }
        if (rIsBool.test(sValue)) {
            return sValue.toLowerCase() === "true";
        }
        if (isFinite(sValue)) {
            return parseFloat(sValue);
        }
        if (isFinite(Date.parse(sValue))) {
            return new Date(sValue);
        }
        return sValue;
    }

    function EmptyTree() {}

    EmptyTree.prototype.toString = function() {
        return "null";
    };

    EmptyTree.prototype.valueOf = function() {
        return null;
    };

    function objectify(vVal) {
        return vVal === null ? new EmptyTree() : vVal instanceof Object ? vVal : new vVal.constructor(vVal);
    }

    function createObjTree(oParentNode, nVerb, bFreeze, bNesteAttr) {

        const
            nLevelStart = aCache.length,
            bChildren = oParentNode.hasChildNodes(),
            bAttributes = oParentNode.hasAttributes(),
            bHighVerb = Boolean(nVerb & 2);

        var
            sProp, vContent, nLength = 0,
            sCollectedTxt = "",
            vResult = bHighVerb ? {} : /* put here the default value for empty nodes: */ true;

        if (bChildren) {
            for (var oNode, nItem = 0; nItem < oParentNode.childNodes.length; nItem++) {
                oNode = oParentNode.childNodes.item(nItem);
                if (oNode.nodeType === 4) {
                    sCollectedTxt += oNode.nodeValue;
                } /* nodeType is "CDATASection" (4) */
                else if (oNode.nodeType === 3) {
                    sCollectedTxt += oNode.nodeValue.trim();
                } /* nodeType is "Text" (3) */
                else if (oNode.nodeType === 1 && !oNode.prefix) {
                    aCache.push(oNode);
                } /* nodeType is "Element" (1) */
            }
        }

        const nLevelEnd = aCache.length,
            vBuiltVal = parseText(sCollectedTxt);

        if (!bHighVerb && (bChildren || bAttributes)) {
            vResult = nVerb === 0 ? objectify(vBuiltVal) : {};
        }

        for (var nElId = nLevelStart; nElId < nLevelEnd; nElId++) {
            sProp = aCache[nElId].nodeName.toLowerCase();
            vContent = createObjTree(aCache[nElId], nVerb, bFreeze, bNesteAttr);
            if (vResult.hasOwnProperty(sProp)) {
                if (vResult[sProp].constructor !== Array) {
                    vResult[sProp] = [vResult[sProp]];
                }
                vResult[sProp].push(vContent);
            } else {
                vResult[sProp] = vContent;
                nLength++;
            }
        }

        if (bAttributes) {

            const
                nAttrLen = oParentNode.attributes.length,
                sAPrefix = bNesteAttr ? "" : sAttrsPref,
                oAttrParent = bNesteAttr ? {} : vResult;

            for (var oAttrib, nAttrib = 0; nAttrib < nAttrLen; nLength++, nAttrib++) {
                oAttrib = oParentNode.attributes.item(nAttrib);
                oAttrParent[sAPrefix + oAttrib.name.toLowerCase()] = parseText(oAttrib.value.trim());
            }

            if (bNesteAttr) {
                if (bFreeze) {
                    Object.freeze(oAttrParent);
                }
                vResult[sAttrProp] = oAttrParent;
                nLength -= nAttrLen - 1;
            }

        }

        if (nVerb === 3 || (nVerb === 2 || nVerb === 1 && nLength > 0) && sCollectedTxt) {
            vResult[sValProp] = vBuiltVal;
        } else if (!bHighVerb && nLength === 0 && sCollectedTxt) {
            vResult = vBuiltVal;
        }

        if (bFreeze && (bHighVerb || nLength > 0)) {
            Object.freeze(vResult);
        }

        aCache.length = nLevelStart;

        return vResult;

    }

    function loadObjTree(oXMLDoc, oParentEl, oParentObj) {

        var vValue, oChild;

        if (oParentObj.constructor === String || oParentObj.constructor === Number || oParentObj.constructor === Boolean) {
            oParentEl.appendChild(oXMLDoc.createTextNode(oParentObj.toString())); /* verbosity level is 0 or 1 */
            if (oParentObj === oParentObj.valueOf()) {
                return;
            }
        } else if (oParentObj.constructor === Date) {
            oParentEl.appendChild(oXMLDoc.createTextNode(oParentObj.toGMTString()));
        }

        for (var sName in oParentObj) {
            vValue = oParentObj[sName];
            if (isFinite(sName) || vValue instanceof Function) {
                continue;
            } /* verbosity level is 0 */
            if (sName === sValProp) {
                if (vValue !== null && vValue !== true) {
                    oParentEl.appendChild(oXMLDoc.createTextNode(vValue.constructor === Date ? vValue.toGMTString() : String(vValue)));
                }
            } else if (sName === sAttrProp) { /* verbosity level is 3 */
                for (var sAttrib in vValue) {
                    oParentEl.setAttribute(sAttrib, vValue[sAttrib]);
                }
            } else if (sName.charAt(0) === sAttrsPref) {
                oParentEl.setAttribute(sName.slice(1), vValue);
            } else if (vValue.constructor === Array) {
                for (var nItem = 0; nItem < vValue.length; nItem++) {
                    oChild = oXMLDoc.createElement(sName);
                    loadObjTree(oXMLDoc, oChild, vValue[nItem]);
                    oParentEl.appendChild(oChild);
                }
            } else {
                oChild = oXMLDoc.createElement(sName);
                if (vValue instanceof Object) {
                    loadObjTree(oXMLDoc, oChild, vValue);
                } else if (vValue !== null && vValue !== true) {
                    oChild.appendChild(oXMLDoc.createTextNode(vValue.toString()));
                }
                oParentEl.appendChild(oChild);
            }
        }

    }

    /* Uncomment the following code if you want to enable the .appendJXON() method for *all* the "element" objects! */

    /*

  Element.prototype.appendJXON = function (oObjTree) {
    loadObjTree(document, this, oObjTree);
    return this;
  };

  */

    this.build = function(oXMLParent, nVerbosity /* optional */ , bFreeze /* optional */ , bNesteAttributes /* optional */ ) {
        const nVerbMask = arguments.length > 1 && typeof nVerbosity === "number" ? nVerbosity & 3 : /* put here the default verbosity level: */ 1;
        return createObjTree(oXMLParent, nVerbMask, bFreeze || false, arguments.length > 3 ? bNesteAttributes : nVerbMask === 3);
    };

    this.unbuild = function(oObjTree, sNamespaceURI /* optional */ , sQualifiedName /* optional */ , oDocumentType /* optional */ ) {
        const oNewDoc = document.implementation.createDocument(sNamespaceURI || null, sQualifiedName || "", oDocumentType || null);
        loadObjTree(oNewDoc, oNewDoc, oObjTree);
        return oNewDoc;
    };

})();

//geojson(object) to kml string
G.converter.geojsonToKml = function(data) {
    var geojson = data;

    function pointType(geometry, style) {
        var tempHtml = document.createElement('div');
        tempHtml.innerHTML = style.html;
        var tempMarker = tempHtml.firstElementChild;
        var className = tempMarker.firstChild.className;
        var color = (tempMarker.style.color) ? '&color=%23' + G.color.rgbToHex(tempMarker.style.color) : '&color=%23000000';
        var direct = G.util.number(tempMarker.firstElementChild.style.transform);
        var scale = Math.abs(Math.cos((90 + Number(direct)) * Math.PI / 180)) + Math.abs(Math.sin((90 + Number(direct)) * Math.PI / 180));

        direct = direct === 0 ? '' : '&direct=' + direct;
        color = color === '&color=%23000000' ? '' : color;

        switch (className) {
            case 'fa fa-child':
            case 'fa fa-dot-circle-o':
            case 'fa fa-map-marker':
            case 'fa fa-plane':
                style.iconUrl = 'http://www.geologycloud.tw/map/utils/imgGet?name=' + G.util.remove(className, 'fa fa-') + direct + color;
                break;
            case 'fa geo-icon-A101':
                style.iconUrl = 'http://www.geologycloud.tw/map/utils/imgGet?name=' + G.util.remove(className, 'fa geo-icon-') + direct + color;
                break;
            case 'fa geo-icon-A201':
            case 'fa geo-icon-A301':
            case 'fa geo-icon-A401':
                style.iconUrl = 'http://www.geologycloud.tw/map/utils/imgGet?name=' + G.util.remove(className, 'fa geo-icon-') + direct + color + '&dip=' + tempMarker.children[1].textContent;
                break;
        }
        var anchor = 18 * scale;
        style.iconAnchor = [anchor, anchor];

        var place_style = {
            placemark: {
                LookAt: {
                    longitude: geometry.coordinates[0],
                    latitude: geometry.coordinates[1],
                    altitude: 0,
                    range: 5000,
                    tilt: 0,
                    heading: 0,
                    altitudeMode: 'absolute'
                },
                Point: {
                    coordinates: geometry.coordinates.join(',')
                }
            },
            style: {
                'IconStyle': {
                    scale: 1,
                    Icon: {},
                    hotSpot: {
                        '@xunits': 'pixels',
                        '@yunits': 'pixels'
                    }
                }
            }
        };

        if (style === 'default') {
            place_style.style.IconStyle.Icon.href = '/map/javascripts/lib/images/marker-icon.png';
            place_style.style.IconStyle.hotSpot['@x'] = 12;
            place_style.style.IconStyle.hotSpot['@y'] = 41;
        } else {
            place_style.style.IconStyle.Icon.href = style.iconUrl;
            place_style.style.IconStyle.hotSpot['@x'] = style.iconAnchor[0];
            place_style.style.IconStyle.hotSpot['@y'] = style.iconAnchor[1];
        }
        return place_style;
    }

    function linestringType(geometry, style) {
        var place_style = {
            style: {
                'LineStyle': {
                    color: G.color.hexToAbgr(style.color, style.opacity),
                    width: style.weight
                }
            }
        };

        var coordinates = [];
        for (var j = 0, jmax = geometry.coordinates.length; j < jmax; j++) {
            var coordinate = geometry.coordinates[j].join(',');
            coordinates.push(coordinate);
        }

        place_style.placemark = {
            LineString: {
                coordinates: coordinates.join(' ')
            }
        };
        return place_style;
    }

    function polygonType(geometry, style) {
        var fillcolor = (style.fillColorCode) ? 'cc000000' : G.color.hexToAbgr(style.fillColor, style.fillOpacity),
            place_style = {
                style: {
                    'LineStyle': {
                        color: G.color.hexToAbgr(style.color, style.opacity),
                        width: style.weight
                    },
                    'PolyStyle': {
                        color: fillcolor
                    }
                }
            };

        //geometry set
        var coordinates = [];
        for (var j = 0, jmax = geometry.coordinates[0].length; j < jmax; j++) {
            var coordinate = geometry.coordinates[0][j].join(',');
            coordinates.push(coordinate);
        }

        place_style.placemark = {
            Polygon: {
                outerBoundaryIs: {
                    LinearRing: {
                        coordinates: coordinates.join(' ')
                    }
                }
            }
        };
        return place_style;
    }

    var kmlDocument = {
        StyleMap: [],
        Style: [],
        Placemark: []
    };

    geojson.features.forEach(function(feature, index) {
        var styleId = 'Style' + index;
        var stylemapId = 'StyleMap' + index;

        kmlDocument.StyleMap.push({
            '@id': stylemapId,
            'Pair': [{
                key: 'normal',
                styleUrl: '#' + styleId
            }, {
                key: 'highlight',
                styleUrl: '#' + styleId
            }]
        });

        var ps;
        switch (feature.geometry.type) {
            case 'Point':
                ps = pointType(feature.geometry, feature.style);
                break;
            case 'LineString':
                ps = linestringType(feature.geometry, feature.style);
                break;
            case 'Polygon':
                ps = polygonType(feature.geometry, feature.style);
                break;
        }
        ps.style['@id'] = styleId;
        ps.placemark.name = 'placemark' + index;
        ps.placemark.styleUrl = '#' + stylemapId;

        kmlDocument.Style.push(ps.style);
        kmlDocument.Placemark.push(ps.placemark);
    });

    var kml = G.converter.JXON.unbuild({
        kml: {
            '@xmlns': 'http://www.opengis.net/kml/2.2',
            '@xmlns:gx': 'http://www.google.com/kml/ext/2.2',
            '@xmlns:kml': 'http://www.opengis.net/kml/2.2',
            '@xmlns:atom': 'http://www.w3.org/2005/Atom',
            'Document': kmlDocument
        }
    });

    return '<?xml version="1.0" encoding="UTF-8"?>' + (new XMLSerializer()).serializeToString(kml);
};

/**
 * 轉換成kml(如只有geojson to kml可不用G.converter.toGeojson, 反之須要有G.converter.toGeojson)
 * @param {String} type 輸入的資料的類型
 * @param {} data 輸入的資料. shp為{shp,shx,dbf} data. dxf為dxf data. kmz為 kmz data. kml,gpx為string
 * @param {} info 輸入的資料的相關資訊,如座標系統,callback function. 部分格式會用到
 * @return {string} kml string
 */
G.converter.toKml = function(type, data, info) {
    var kml;
    switch (type) {
        case 'dxf':
        case 'gpx':
        case 'shp':
            kml = G.converter.geojsonToKml(G.converter.toGeojson(type, data, info));
            break;
        case 'geojson':
            kml = G.converter.geojsonToKml(data);
            break;
        default:
            kml = G.converter.emptyKml();
            break;
    }
    return kml;
};
/**
 * G.Control Class(For Create Map Platform Control)
 * @return {Object} this - G.Control Object
 */
G.Control = L.Control.extend({
	_createButton: function(html, title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		var stop = L.DomEvent.stopPropagation;

		L.DomEvent
			.on(link, 'click', stop)
			.on(link, 'mousedown', stop)
			.on(link, 'dblclick', stop)
			.on(link, 'click', L.DomEvent.preventDefault)
			.on(link, 'click', fn, context)
			.on(link, 'click', this._refocusOnMap, context);

		return link;
	}
});

G.control = {};
/**
 * G.Control.Zoom Class(For Create Zoom Control)
 * @return {Object} this - G.Control.Zoom Object
 */
G.control.Zoom = L.Control.Zoom.extend({
	options: {
		position: 'topleft',
		zoomInText: '<i class="fa fa-plus"></i>',
		zoomInTitle: '放大',
		zoomOutText: '<i class="fa fa-minus"></i>',
		zoomOutTitle: '縮小'
	},

	onAdd: function(map) {
		var zoomName = 'geocloud-control-zoom';
		var container = L.DomUtil.create('div', zoomName + ' geocloud-bar');

		this._map = map;

		this._zoomInButton = this._createButton(
			this.options.zoomInText, this.options.zoomInTitle,
			zoomName + '-in', container, this._zoomIn, this);
		this._zoomOutButton = this._createButton(
			this.options.zoomOutText, this.options.zoomOutTitle,
			zoomName + '-out', container, this._zoomOut, this);

		this._updateDisabled();
		map.on('zoomend zoomlevelschange', this._updateDisabled, this);

		return container;
	}
});

G.control.zoom = function (options) {
	return new G.control.Zoom(options);
};
/**
 * G.Control.Geolocation Class(For Create Geolocation Control)
 * @return {Object} this - G.Control.Geolocation Object
 */
G.control.Geolocation = G.Control.extend({
	options: {
		position: 'topleft'
	},

	onAdd: function(map) {
		var container = L.DomUtil.create('div', 'geocloud-bar');

		this._map = map;
		this._button = this._createButton('<i class="fa fa-location-arrow"></i>', '顯示我的位置', '', container, this.geolocation, this);

		return container;
	},

	geolocation: function() {
		if (navigator.geolocation) {
			var map = this._map;

			navigator.geolocation.getCurrentPosition(function(position) {
				var latlng = [position.coords.latitude, position.coords.longitude];
				var marker = L.marker(latlng, {
					icon: L.divIcon({
						className: 'geocloud-marker-icon',
						iconSize: [24, 24],
						iconAnchor: [12, 12],
						popupAnchor: [0, 0],
						html: '<i class="fa fa-location-arrow"></i>'
					})
				}).addTo(map);

				var popupContent = [
					'我的位置',
					'經度：' + latlng[1].toFixed(4),
					'緯度：' + latlng[0].toFixed(4),
					G.ui.layerRemoveButton(marker, map)
				];
				marker.bindPopup(G.ui.popupContent(popupContent)).openPopup();
	        	map.setView(latlng, 16);
			});

		} else {
			alert("抱歉，你的瀏覽器不支援此功能");
		}
	}
});

G.control.geolocation = function(options) {
	return new G.control.Geolocation(options);
};
/**
 * G.Control.StreetView Class(For Create Google Map Street View Control)
 * @return {Object} this - G.Control.StreetView Object
 */
G.control.StreetView = G.Control.extend({
    options: {
        position: 'topleft'
    },

    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'geocloud-bar');
        var viewContainer = L.DomUtil.create('div', '');
        var button = this._createButton('<i class="fa fa-street-view"></i>', '街景服務', 'geocloud-control-streetview', container, this.streetview, this);
        var dialog = this._createDialog(viewContainer);
        container.style.clear = 'none';

        var marker = L.marker([0, 0], {
            icon: L.divIcon({
                className: 'geocloud-streetview-marker-icon',
                iconSize: [24, 24],
                iconAnchor: [12, 23],
                popupAnchor: [0, 0],
                html: '<i class="fa fa-2x fa-street-view"></i>'
            }),
            draggable: true
        });

        var markerDragStart = this.markerDragStart.bind(this);
        var markerDragEnd = this.markerDragEnd.bind(this);

        marker.on('dragstart', markerDragStart);
        marker.on('dragend', markerDragEnd);

        this._map = map;
        this._button = button;
        this._viewContainer = viewContainer;
        this._dialog = dialog;
        this._streetPosMarker = marker;

        return container;
    },

    _createButton: function(html, title, className, container, fn, context) {
        var link = L.DomUtil.create('a', className, container);
        link.innerHTML = html;
        link.href = '#';
        link.title = title;

        var stop = L.DomEvent.stopPropagation;

        L.DomEvent
            .on(link, 'click', stop)
            .on(link, 'mousedown', stop)
            .on(link, 'dblclick', stop)
            .on(link, 'click', L.DomEvent.preventDefault)
            .on(link, 'mousedown', L.DomEvent.preventDefault)
            .on(link, 'mousedown', fn, context)
            .on(link, 'mousedown', this._refocusOnMap, context);

        return link;
    },

    _createDialog: function(container) {
        var self = this;
        var dialog = $(container).dialog({
            height: 400,
            width: 400,
            position: {
                my: 'left+36 bottom+36',
                at: 'left+36 bottom+36',
                of: window
            },
            show: {
                effect: "clip",
                duration: 500
            },
            hide: {
                effect: "clip",
                duration: 500
            },
            beforeClose: function() {
                var cc = self;
            },
            autoOpen: false
        });

        return dialog;
    },

    streetview: function(e) {
        var map = this._map;
        var marker = this._streetPosMarker;

        var latlng = map.layerPointToLatLng(L.point(e.x, e.y));

        var mousemove = function(evt) {
            var pos = evt.latlng;
            marker.setLatLng((evt.latlng));
        };
        var mouseup = function(evt) {
            map.off('mouseup', mouseup);
            map.off('mousemove', mousemove);
            marker.fire('dragend');
        };

        marker.setLatLng(latlng).addTo(map);
        map.addLayer(this.options.tile);

        map.on('mouseup', mouseup);
        map.on('mousemove', mousemove);
    },

    markerDragStart: function(e) {
        this._map.addLayer(this.options.tile);
    },

    markerDragEnd: function(e) {
        var self = this;
        var map = self._map;
        var pos = e.target.getLatLng();
        var marker = self._streetPosMarker;
        var panorama = self._panorama;
        var dialog = self._dialog;

        map.removeLayer(self.options.tile);
        dialog.dialog('open');

        if (!panorama) {
            panorama = new google.maps.StreetViewPanorama(self._viewContainer, {
                position: new google.maps.LatLng(pos.lat, pos.lng),
                pov: {
                    heading: 270,
                    pitch: 0
                },
                visible: true
            });

            google.maps.event.addListener(panorama, 'position_changed', function() {
                var pos = panorama.getPosition();
                marker.setLatLng([pos.lat(), pos.lng()]);

                var title = (panorama.getLocation().description) ? panorama.getLocation().description : LanguageValue.StreetViewDescription;
                dialog.dialog("option", "title", title);
            });

            self._panorama = panorama;
        } else {
            panorama.setPosition(new google.maps.LatLng(pos.lat, pos.lng));
        }

        window.setTimeout(function() {
            if (panorama.getStatus() !== 'OK') {
                marker._icon.style.transition = '1s';
                swal({
                    title: LanguageValue.StreetViewNoData,
                    text: LanguageValue.StreetViewNoDataDescription,
                    type: "warning"
                });
                if (self.lastView) {
                    if (self.lastView.lat == 0 && self.lastView.lng == 0) {
                        map.removeLayer(marker);
                        marker._icon.style.transition = '';
                    } else {
                        marker.setLatLng([self.lastView.lat, self.lastView.lng]);
                        window.setTimeout(function() {
                            marker._icon.style.transition = '';
                        }, 1100);
                    }

                }

            } else {
                marker._icon.style.transition = '0s';
                dialog.dialog("option", "title", panorama.getLocation().description);
                self.lastView = L.latLng(pos.lat, pos.lng);
            }
            // G.map.removeLayer(G.tileLayers.gvm);
        }, 500);
    }
});

G.control.streetview = function(options) {
    return new G.control.StreetView(options);
};

/**
 * G.Control.Dropbox Class(For Create Dropbox Login Control)
 * @return {Object} this - G.Control.Dropbox Object
 */
G.control.Dropbox = G.Control.extend({
	options: {
		position: 'topleft'
	},

	onAdd: function(map) {
		var container = L.DomUtil.create('div', 'geocloud-bar');

		this._map = map;
		this._button = this._createButton('<i class="fa fa-dropbox"></i>', '登入Dropbox', '', container, this.dropbox, this);

		return container;
	},

	dropbox: function() {
		dropbox_authorize();		
		OnDragStart(this);
	}
});

function OnDragStart(e){
		if(e.dataTransfer){
			var textData = e.dataTransfer.getData("Text");		
			if(textData&&textData.length){
				e.dataTransfer.clearData();				
			}
			// else{
			// 	for(var i=0;i<textData.length;i++){

			// 	}
			// }
		}
	}

G.control.dropbox = function(options) {
	return new G.control.Dropbox(options);
};
/**
 * G.Control.Geocoding Class(For Create Geocoding Control)
 * @return {Object} this - G.Control.Geocoding Object
 */
G.control.Geocoding = G.Control.extend({
    options: {
        position: 'topleft'
    },

    onAdd: function(map) {
        var geocodingName = 'geocloud-control-geocoding';
        var container = L.DomUtil.create('div', geocodingName + ' geocloud-bar');
        var searchButton = this._createButton('<i class="fa fa-search"></i>', '搜尋', 'geocloud-control-geocoding-search', container, this.search, this);
        var barContainer = L.DomUtil.create('div', 'geocloud-control-geocoding-barContainer', container);
        var bar = L.DomUtil.create('div', 'geocloud-control-geocoding-bar', barContainer);
        var listConainer = L.DomUtil.create('div', 'geocloud-control-geocoding-listContainer', container);
        var list = L.DomUtil.create('div', 'geocloud-control-geocoding-list list-group', listConainer);
        container.style.zIndex = 100;

        L.DomEvent.disableClickPropagation(container)
            .disableScrollPropagation(container);

        this._map = map;
        this._searchButton = searchButton;
        this._list = list;

        this._addressIcon = this._createSpan('<i class="fa fa-map-marker"></i>', 'address', bar);
        // this._coordinateIcon = this._createSpan('<i class="fa fa-map-pin"></i>', 'coordinate', bar);
        // this._phoneIcon = this._createSpan('<i class="fa fa-phone"></i>', 'phone', bar);


        //搜尋欄
        var input = this._createInput(bar, container);
        this._input = input;

        // // google autocomplete api
        // google.maps.event.addDomListener(window, 'load', function() {
        //  var autocomplete = new google.maps.places.Autocomplete(input);

        //  google.maps.event.addListener(autocomplete, 'place_changed', function() {
        //      input.focus();
        //      searchButton.click();
        //  });
        // });

        return container;
    },

    _createSpan: function(html, className, container) {
        var span = L.DomUtil.create('span', className, container);
        span.innerHTML = html;
        return span;
    },

    _createInput: function(bar, container) {
        var input = L.DomUtil.create('input', '', bar);
        input.type = 'text';
        input.placeholder = LanguageValue.GeoSearchingPlaceholder;
        input.addEventListener("focus", function() {
            container.classList.add('active');
        });
        input.addEventListener("blur", function() {
            container.classList.remove('active');
        });
        input.addEventListener("keyup", function(event) {
            event.preventDefault();
            if (event.keyCode === 13) {
                
            }
        });
        return input;
    },

    _createListButton: function(latlng, address, type, self) {
        var button = document.createElement('button');
        button.className = "list-group-item";
        button.innerHTML = '<i class="fa fa-map-marker-alt geocloud-control-geocoding-' + type + '"></i>';
        button.appendChild(document.createTextNode(address));

        var self = (self) ? self : this;
        var map = self._map;
        button.addEventListener('click', function() {
            var marker = L.marker(latlng, {
                icon: L.divIcon({
                    className: 'geocloud-marker-icon2',
                    iconSize: [24, 24],
                    iconAnchor: [12, 24],
                    popupAnchor: [0, 0],
                    html: '<i class="fa fa-map-pin fa-2x"></i>'
                })
            }).addTo(map);
            map.panTo(latlng);

            var popupContent = [
                '地址定位結果：',
                address,
                '經度：' + latlng[1].toFixed(4),
                '緯度：' + latlng[0].toFixed(4),
                G.ui.layerRemoveButton(marker, map)
            ];
            marker.bindPopup(G.ui.popupContent(popupContent)).openPopup();
        });
        return button;
    },

    _createListAlert: function(alert) {
        var div = document.createElement('div');
        div.className = "list-group-item";
        div.textContent = alert;
        return div;
    },

    search: function() {
        var searchInfo = this._input.value;
        this._list.innerHTML = "";

        // [this._addressIcon, this._coordinateIcon, this._phoneIcon].forEach(function(icon) {
        //  icon.classList.remove('active');
        // });

        if (searchInfo.trim() !== '') {
            //座標資訊
            // if (/^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/.test(searchInfo)) {
            //  this.searchCoordinate(searchInfo);
            // }
            //電話資訊
            // else if (!isNaN(searchInfo.replace(/[\-\(\)]/g, ''))) {
            //  this.searchPhone(searchInfo);
            // }
            //地址查詢  
            // else {
            //  this.searchAddress(searchInfo);
            // }
            this.searchAddress(searchInfo);
        }
    },

    searchAddress: function(address, self) {
        var self = (self) ? self : this;
        self._addressIcon.classList.add('active');

        var googleApi = 'https://maps.googleapis.com/maps/api/geocode/json?sensor=false&region=tw&language=' + LanguageValue.GoogleLanguageCode + '&address=' + address;
        var tgosApi = '/data/tgos_match_address?address=' + address;
        // var tgosApi = 'https://www.geologycloud.tw/map/utils/tgos?address=' + address;
        // var landMarkApi = '/landmark?s=' + address;
        var landMarkApi = 'https://www.geologycloud.tw/landmark?s=' + address;

        var list = self._list;
        var createListButton = self._createListButton;

        // $.when($.ajax(tgosApi), $.ajax(landMarkApi)).done(function(tajax, lajax) {
        // $.when($.ajax(tgosApi), $.ajax(landMarkApi)).done(function(gajax, tajax, lajax) {
        $.when($.ajax(googleApi), $.ajax(tgosApi), $.ajax(landMarkApi)).done(function(gajax, tajax, lajax) {
            var googleResult = gajax[0];
            var tgosResult = tajax[0];
            var landMarkResult = lajax[0];

            if (typeof landMarkResult === "object" && landMarkResult.mark && landMarkResult.mark.length !== 0) {
                landMarkResult.mark.forEach(function(result) {
                    var addr = result.landmark;
                    var lat = parseFloat(result.y);
                    var lng = parseFloat(result.x);

                    list.appendChild(createListButton([lat, lng], addr, 'landmark', self));
                });
            }

            if (tajax[1] === "success" && tgosResult.AddressList && tgosResult.AddressList.length !== 0) {
                tgosResult.AddressList.forEach(function(result) {
                    var addr = result.FULL_ADDR;
                    var lat = result.Y;
                    var lng = result.X;

                    list.appendChild(createListButton([lat, lng], addr, 'tgos', self));
                });
            }

            // if (gajax[1] === "success" && googleResult.results && googleResult.results.length !== 0) {
            //  googleResult.results.forEach(function(result) {
            //      var checkCountry = false;
            //      result.address_components.forEach(function(component) {
            //          if (component.short_name.toLocaleLowerCase() == 'tw') {
            //              checkCountry = true;
            //          }
            //      });

            //      if (checkCountry) {
            //          var addr = result.formatted_address;
            //          var lat = result.geometry.location.lat;
            //          var lng = result.geometry.location.lng;

            //          list.appendChild(createListButton([lat, lng], addr, 'google', self));
            //      }
            //  });

            //  $.ajax({
            //      method: "POST",
            //      url: "/map/utils/geocodinguse",
            //      async: true,
            //      data: {
            //          api: "google",
            //          result: JSON.stringify(googleResult),
            //          address: address
            //      }
            //  });
            // }

            if (list.children.length === 0) {
                list.appendChild(self._createListAlert(LanguageValue.NoResult));
            }
        });
    },

    searchCoordinate: function(searchInfo) {
        // this._coordinateIcon.classList.add('active');

        var latlng = searchInfo.split(',');
        var lat = Number(latlng[0]);
        var lng = Number(latlng[1]);
        var list = this._list;
        var createListButton = this._createListButton;

        if (lat <= 90 && lat >= -90 && lng <= 180 && lng >= -180) {
            list.appendChild(createListButton([lat, lng], searchInfo, 'latlng', this));
        } else if (lng <= 90 && lng >= -90 && lat <= 180 && lat >= -180) {
            searchInfo = latlng[1] + ',' + latlng[0];
            list.appendChild(createListButton([lng, lat], searchInfo, 'latlng', this));
        }
        this.searchAddress(searchInfo);
    },

    // 電話搜尋
    searchPhone: function(tln) {
        // this._phoneIcon.classList.add('active');

        var phoneApi = '/map/utils/phone?tln=' + tln;
        var input = this._input;
        var searchAddress = this.searchAddress;
        var self = this;

        $.ajax({
            url: phoneApi,
            async: true,
            dataType: "json"
        }).done(function(json) {
            var address = json.gAddress,
                name = json.gName;

            if (address !== '') {
                input.value = LanguageValue.CHYPResult + "： " + name;
                setTimeout(function() {
                    input.value = address;
                    searchAddress(address, self);
                }, 1000);
            } else {
                list.appendChild(self._createListAlert(LanguageValue.CHYPNoResult));
            }
        });
    }
});

G.control.geocoding = function(options) {
    return new G.control.Geocoding(options);
};
/**
 * G.Control.ExtraData Class(For Create Extra Data Control(Drag & Drop))
 * @return {Object} this - G.Control.ExtraData Object
 */
G.control.ExtraData = G.Control.extend({
    options: {
        position: 'topleft'
    },

    onAdd: function(map) {
        var self = this;
        var container = L.DomUtil.create('div', 'geocloud-control-extradata geocloud-bar');
        var button = self._createButton('<i class="fa fa-list"></i>', LanguageValue.ExtradataDragDataToMap, '', container, self.extradata, self);
        var listConainer = L.DomUtil.create('div', 'geocloud-control-extradata-listContainer', container);
        var list = L.DomUtil.create('div', 'geocloud-control-extradata-list', listConainer);

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableClickPropagation(listConainer).disableScrollPropagation(listConainer);

        self._map = map;
        self._gmap = self.options.gmap;
        self._button = button;
        self._overLayers = self.options.overLayers;
        self._container = container;
        self._list = list;

        listConainer.addEventListener('dragover', function(e) {
            list.classList.add('active');
        });

        listConainer.addEventListener('dragleave', function(e) {
            list.classList.remove('active');
        });

        listConainer.addEventListener('drop', self.dropOnListConainer.bind(self));
        map.getContainer().addEventListener('drop', self.dropOnMapConainer.bind(self), false);

        //資料
        self._Rain.data(self);
        self._Earthquake.data(self);
        self._Dropbox.data(self);
        //self.Earthquake();

        //remove draggable marker
        ['movestart', 'move', 'popupopen', 'click'].forEach(function(eventName) {
            map.on(eventName, function() {
                self.clearDraggableMarker();
            });
        });

        return container;
    },

    clearDraggableMarker: function() {
        var self = this;
        G.util.each(self._container.querySelectorAll('.geocloud-marker-draggable'), function(el) {
            el.remove();
        });
    },

    extradata: function() {

    },

    _dragFolder: function(name, title, number) {
        var self = this;
        var area = L.DomUtil.create('div', 'geocloud-drag-area', self._list);
        var folder = L.DomUtil.create('div', 'geocloud-drag-folder folder-' + name, area);
        folder.title = title;
        if (name == "Dropbox") {
            folder.id = name + "_" + number;
        } else {
            folder.id = name;
        }
        folder.draggable = true;
        folder.addEventListener("dragstart", function(e) {
            e.dataTransfer.setData("text", [e.target.id, 'list', 'folder'].join(','));
        });
        return folder;
    },

    _dragElement: function(name, title, symbol, foldernumber) {
        var self = this;
        if (G.util.contain(name, "Dropbox")) {
            var container = L.DomUtil.create('div', 'geocloud-drag-icon ' + 'icon-' + name + ' Dropbox_' + foldernumber);
        } else {
            var container = L.DomUtil.create('div', 'geocloud-drag-icon ' + 'icon-' + name);
        }

        var icon = L.DomUtil.create('i', 'fa ' + symbol, container);
        icon.id = ' Dropbox_' + foldernumber;
        container.title = title;
        container.draggable = true;
        container.addEventListener("dragstart", function(e) {
            e.dataTransfer.setData("text", [name, 'list', 'element', icon.id].join(','));
        });

        var stop = L.DomEvent.stopPropagation;
        L.DomEvent.on(container, 'dragstart', stop);
        return container;
    },

    _createDragMarker: function(name, target, self, layer, contextmenu) {
        var container = self._container;
        var originMarker = target._icon;
        var marker = document.createElement('div');

        marker.className = originMarker.className;
        marker.classList.remove('leaflet-marker-icon');
        marker.classList.add('geocloud-marker-draggable');
        marker.innerHTML = originMarker.innerHTML;
        marker.style.position = 'absolute';
        marker.style.marginLeft = originMarker.style.marginLeft;
        marker.style.marginTop = originMarker.style.marginTop;
        marker.style.width = originMarker.style.width;
        marker.style.height = originMarker.style.height;
        marker.draggable = true;

        var temp1point = self._map.latLngToContainerPoint(target.getLatLng());
        var offsetLeft = container.offsetLeft;
        var offsetTop = container.offsetTop;
        marker.style.left = (temp1point.x - offsetLeft) + 'px';
        marker.style.top = (temp1point.y - offsetTop) + 'px';
        container.appendChild(marker);

        marker.addEventListener('click', function() {
            this.remove();
            layer.openPopup();
        });

        // marker.addEventListener('mouseout', function() {
        //  this.remove();
        // });

        if (contextmenu) {
            marker.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                this.remove();
                layer.fire('contextmenu', {
                    latlng: layer.getLatLng(),
                    originalEvent: e
                })
            });
        }

        marker.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData("text", [name, 'map', 'Dropbox_' + contextmenu].join(','));
        });
    },

    dropOnMapConainer: function(e) {
        var self = this;
        var map = self._map;
        var list = self._list;
        var overLayers = self._overLayers;

        e.stopPropagation();
        e.preventDefault();

        if (e.dataTransfer.types[0] === 'text/plain') {
            var data = e.dataTransfer.getData('text').split(',');
            var name = data[0];
            if (data[1] === 'list') {
                if (data[2] === 'folder') {
                    //var folder = list.querySelector('.folder-' + name)
                    var folder = list.querySelector('#' + name)
                    G.util.each(folder.children, function(el) {
                        var subName1 = G.util.remove(el.className, 'geocloud-drag-icon icon-');
                        var subName = G.util.remove(subName1, ' ' + name);
                        // map.addLayer(overLayers[subName]);

                        if (G.util.removeNumber(subName) === 'DropboxA' || G.util.removeNumber(subName) === 'DropboxP') {
                            var clusterName = G.util.remove(subName, ['A', 'P']);
                            overLayers[clusterName].addLayer(overLayers[subName]);
                        } else {
                            map.addLayer(overLayers[subName]);
                        }
                    });
                    folder.innerHTML = '';
                } else if (data[2] === 'element') {
                    if (G.util.removeNumber(name) === 'DropboxA' || G.util.removeNumber(name) === 'DropboxP') {
                        var clusterName = G.util.remove(name, ['A', 'P']);
                        overLayers[clusterName].addLayer(overLayers[name]);
                    } else {
                        map.addLayer(overLayers[name]);
                    }
                    list.querySelector('.icon-' + name).remove();
                }
                if (name.indexOf('Rain') !== -1 && map.hasLayer(overLayers.RainVoronoi)) {
                    self._Rain.voronoi(map, overLayers);
                }
            }
        }

        map.scrollWheelZoom.enable();
    },

    dropOnListConainer: function(e) {
        var self = this;
        var map = self._map;
        var overLayers = self._overLayers;
        e.stopPropagation();
        e.preventDefault();

        var data = e.dataTransfer.getData("text").split(',');
        var name = data[0];

        if (data[1] === 'map') {
            self.clearDraggableMarker();

            if (name.indexOf('Earthquake') !== -1) {
                map.removeLayer(self._overLayers[name]);
                self._list.querySelector('.folder-Earthquake').appendChild(self._Earthquake.dragElements[name]);
            } else if (name.indexOf('Rain') !== -1) {
                var folder = self._list.querySelector('.folder-Rain');
                map.removeLayer(self._overLayers[name]);
                folder.appendChild(self._Rain.dragElements[name]);

                if (folder.childElementCount !== 3) {
                    if (map.hasLayer(overLayers.RainVoronoi)) {
                        self._Rain.voronoi(map, overLayers);
                    }
                } else {
                    map.removeLayer(overLayers.RainVoronoi);
                }
            } else if (name.indexOf('Dropbox') !== -1) {
                if (G.util.removeNumber(name) === 'DropboxA' || G.util.removeNumber(name) === 'DropboxP') {
                    // map.fire("click", {
                    //     latlng: map.layerPointToLatLng([0, 0]),
                    //     layerPoint: {
                    //         x: 0,
                    //         y: 0
                    //     }
                    // });
                    map.fire("moveend");

                    var clusterName = G.util.remove(name, ['A', 'P']);
                    overLayers[clusterName].removeLayer(overLayers[name]);
                } else {
                    map.removeLayer(self._overLayers[name]);
                }
                self._list.querySelector('#' + data[2]).appendChild(self._Dropbox.dragElements[name]);
            }
        }
        self._list.classList.remove('active');
    },

    _Rain: {
        // type of rain warning
        mode: 'realtime',

        style: function(feature, latlng) {
            var fromUnit = feature.properties.FromUnit;
            var warningCode = this.mode === 'realtime' ? feature.properties.warningNow : feature.properties.warning;
            var warning = warningCode !== 0 ? 'icon-RainWarning' + warningCode : '';

            var fontsize;
            var iconSize;
            var iconAnchor;
            if (warningCode == 4) {
                fontsize = 24;
                iconSize = [24, 28];
                iconAnchor = [12, 14];
            } else if (warningCode == 3) {
                fontsize = 21;
                iconSize = [21, 25];
                iconAnchor = [10, 12];
            } else if (warningCode == 2) {
                fontsize = 18;
                iconSize = [18, 22];
                iconAnchor = [9, 11];
            } else {
                fontsize = 15;
                iconSize = [15, 18];
                iconAnchor = [7, 9];
            }

            return L.marker(latlng, {
                icon: L.divIcon({
                    className: ['geocloud-marker-icon2', 'icon-Rain' + fromUnit, warning].join(' '),
                    iconSize: iconSize,
                    iconAnchor: iconAnchor,
                    html: '<i class="fa fa-tint" style="font-size: ' + fontsize + 'px;"></i>'
                })
            });
        },

        reset: function(overLayers) {
            var self = this;
            [
                "CWB",
                "SWCB",
                "EPA"
            ].forEach(function(unit) {
                overLayers["Rain" + unit].eachLayer(function(layer) {
                    var marker = self.style(layer.feature);
                    layer.setIcon(marker.options.icon);
                });
            });
        },

        data: function(self) {
            var map = self._map;
            var gmap = self._gmap;
            var overLayers = self._overLayers;
            var setting = this;
            // var rainApi = G.apiUrl + 'rainlastdata?all=true';
            //var rainApi = 'http://www.geologycloud.tw/data/zh-tw/rainlastdata?all=true';
            var rainApi = '/data/zh-tw/rainlastdata?all=true';
            var folder = self._dragFolder('Rain', '雨量站資料', '');

            $.ajax({
                url: rainApi,
                async: true,
                dataType: "json"
            }).done(function(geojson) {
                var modalArea = gmap.chartModal.area;

                var datepicker = L.DomUtil.create('div', 'datepicker-area');
                var rainchart = L.DomUtil.create('div', '');

                var datevalue = {};
                datepicker.appendChild(document.createTextNode('起始時間:'));
                datevalue.dateStart = L.DomUtil.create('input', '', datepicker);
                datepicker.appendChild(document.createTextNode('~結束時間:'));
                datevalue.dateEnd = L.DomUtil.create('input', '', datepicker);

                [datevalue.dateStart, datevalue.dateEnd].forEach(function(el) {
                    el.type = 'date';
                });
                var rainchartButton = G.ui.create('button', 'geocloud-button geocloud-theme2', '查詢', datepicker);
                rainchartButton.addEventListener('click', function() {
                    rainchart.innerHTML = '';

                    if (!isNaN(Date.parse(datevalue.dateStart.value)) && !isNaN(Date.parse(datevalue.dateEnd.value))) {
                        var checkDateRange = (Date.parse(datevalue.dateEnd.value) - Date.parse(datevalue.dateStart.value)) / (1000 * 60 * 60); //算出差多少小時
                        // alert("兩個時間差距為" + Math.floor(checkDateRange/ 3600000) + "小時 ");
                        if (checkDateRange > 0) {
                            $.ajax({
                                // url: G.apiUrl + "raindata?SiteId=" + this.value + "&startdate=" + dateStart.value + "&enddate=" + dateEnd.value,
                                // url: "http://www.geologycloud.tw/data/zh-tw/raindata?SiteId=" + this.value + "&startdate=" + dateStart.value + "&enddate=" + dateEnd.value,
                                url: "/data/zh-tw/raindata?SiteId=" + this.value + "&startdate=" + datevalue.dateStart.value + "&enddate=" + datevalue.dateEnd.value,
                                // url: "/data/zh-tw/raindata?SiteId=" + this.value,
                                async: true,
                                dataType: "json"
                            }).done(function(json) {
                                var getData = json.data;

                                if (getData.length > 0) {
                                    var data = []; //DataCreationDate
                                    if (checkDateRange < (24 * 8)) { //ㄧ天 &ㄧ星期  24* 6 *天
                                        for (var i = 0; i < (checkDateRange * 6); i++) {
                                            var getdate = new Date(parseInt(i) * 1000 * 60 * 10 + Date.parse(datevalue.dateStart.value)); //10min
                                            var dateobject = {
                                                RF10min: null,
                                                RF1hr: null,
                                                RF3hr: null,
                                                RF6hr: null,
                                                RF12hr: null,
                                                RF24hr: null,
                                                RainNow: null,
                                                DataCreationDate: G.time.yyyyMMddhms(getdate, '-')
                                            };
                                            data.push(dateobject);
                                        }
                                        getData.forEach(function(d) {
                                            var numdate = (Date.parse(d.DataCreationDate) - Date.parse(datevalue.dateStart.value)) / 1000 / 60 / 10;
                                            data[numdate] = d;
                                        });
                                        rainchart.appendChild(G.chart.barchart(data, LanguageValue.ExtradataRain10minsMM, "tenMin")); //10min
                                    } else if (checkDateRange < (24 * 32)) { //ㄧ個月 24 *天
                                        for (var i = 0; i < (checkDateRange); i++) {
                                            var getdate = new Date(parseInt(i) * 1000 * 60 * 60 + Date.parse(datevalue.dateStart.value)); //10min
                                            var dateobject = {
                                                RF10min: null,
                                                RF1hr: null,
                                                RF3hr: null,
                                                RF6hr: null,
                                                RF12hr: null,
                                                RF24hr: null,
                                                RainNow: null,
                                                DataCreationDate: G.time.yyyyMMddhms(getdate, '-')
                                            };
                                            data.push(dateobject);
                                        }
                                        getData.forEach(function(d) {
                                            var numdate = ((Date.parse(d.DataCreationDate) - Date.parse(datevalue.dateStart.value)) / 1000 / 60 / 10) / 6;
                                            data[numdate] = d;
                                        });
                                        rainchart.appendChild(G.chart.barchart(data, LanguageValue.ExtradataRain1HrMM, "oneHour")); //1hr
                                    } else if (checkDateRange < (24 * 366)) { //ㄧ年  2 *天
                                        for (var i = 0; i < (checkDateRange / 12); i++) {
                                            var getdate = new Date(parseInt(i) * 1000 * 60 * 60 * 12 + Date.parse(datevalue.dateStart.value)); //10min
                                            var dateobject = {
                                                RF10min: null,
                                                RF1hr: null,
                                                RF3hr: null,
                                                RF6hr: null,
                                                RF12hr: null,
                                                RF24hr: null,
                                                RainNow: null,
                                                DataCreationDate: G.time.yyyyMMddhms(getdate, '-')
                                            };
                                            data.push(dateobject);
                                        }
                                        getData.forEach(function(d) {
                                            var numdate = ((Date.parse(d.DataCreationDate) - Date.parse(datevalue.dateStart.value)) / 1000 / 60 / 10) / 6 / 12;
                                            data[numdate] = d;
                                        });
                                        rainchart.appendChild(G.chart.barchart(data, LanguageValue.ExtradataRain12HrsMM, "twHour")); //12hr
                                    } else { //ㄧ年以上  1 * 天
                                        for (var i = 0; i < (checkDateRange / 24); i++) {
                                            var getdate = new Date(parseInt(i) * 1000 * 60 * 60 * 24 + Date.parse(datevalue.dateStart.value)); //10min
                                            var dateobject = {
                                                RF10min: null,
                                                RF1hr: null,
                                                RF3hr: null,
                                                RF6hr: null,
                                                RF12hr: null,
                                                RF24hr: null,
                                                RainNow: null,
                                                DataCreationDate: G.time.yyyyMMddhms(getdate, '-')
                                            };
                                            data.push(dateobject);
                                        }
                                        getData.forEach(function(d) {
                                            var numdate = ((Date.parse(d.DataCreationDate) - Date.parse(datevalue.dateStart.value)) / 1000 / 60 / 10) / 6 / 24;
                                            data[numdate] = d;
                                        });
                                        rainchart.appendChild(G.chart.barchart(data, LanguageValue.ExtradataRain24HrsMM, "tfHour")); //24hr
                                    }
                                } else {
                                    rainchart.innerHTML = LanguageValue.NoData;
                                }
                            }).error(function() {
                                rainchart.innerHTML = LanguageValue.NoData;
                            });

                        } else {
                            rainchart.innerHTML = '時間格式錯誤，請再檢查一次。';
                        }

                    } else {
                        rainchart.innerHTML = '時間格式錯誤，請再檢查一次。';
                    }
                });
                setting.datepicker = datepicker;
                setting.rainchart = rainchart;
                setting.dragElements = {};

                var features = geojson.features;
                [
                    "CWB",
                    "SWCB",
                    "EPA"
                ].forEach(function(unit) {
                    var name = "Rain" + unit;
                    var subGeojson = G.converter.emptyGeojson();

                    features.forEach(function(feature) {
                        if (feature.properties.FromUnit === unit) {
                            var warning = 0;
                            var warningNow = 0;

                            if (feature.properties.RF24hr >= 500) {
                                warning = 4;
                            } else if (feature.properties.RF24hr >= 350) {
                                warning = 3;
                            } else if (feature.properties.RF24hr >= 200 || feature.properties.RF3hr >= 100) {
                                warning = 2;
                            } else if (feature.properties.RF24hr >= 80 || feature.properties.RF1hr >= 40) {
                                warning = 1;
                            } else if (feature.properties.RF1hr === null) {
                                warning = -1;
                            }

                            if (feature.properties.RF10min > 15) {
                                warningNow = 4;
                            } else if (feature.properties.RF10min > 10) {
                                warningNow = 3;
                            } else if (feature.properties.RF10min > 5) {
                                warningNow = 2;
                            } else if (feature.properties.RF10min > 0) {
                                warningNow = 1;
                            } else if (feature.properties.RF10min === null) {
                                warningNow = -1;
                            }

                            feature.properties.warning = warning;
                            feature.properties.warningNow = warningNow;
                            subGeojson.features.push(feature);
                        }
                    });

                    overLayers[name] = L.geoJson(subGeojson, {
                        onEachFeature: function(feature, layer) {
                            var popupContent = [
                                LanguageValue.ExtradataStationNo + "：" + feature.properties.SiteId,
                                LanguageValue.ExtradataStationName + "：" + feature.properties.SiteName,
                                LanguageValue.ExtradataStationAddress + "：" + feature.properties.SiteAddress,
                                LanguageValue.ExtradateSetupUnit + "：" + feature.properties.DataCreationUnit,
                                LanguageValue.ExtradateSetupUnit + "：" + feature.properties.FromUnit
                            ];

                            //chart
                            var button = document.createElement('button');
                            button.className = 'geocloud-button geocloud-theme3';
                            button.textContent = '累計雨量圖';
                            button.addEventListener('click', function() {
                                gmap.chartModal.changeContentTitle('『' + feature.properties.SiteName + '』雨量站');
                                modalArea.innerHTML = '';
                                rainchartButton.value = feature.properties.SiteId;
                                datevalue.dateStart.value = G.time.yyyyMMdd(G.time.week1ago, '-');
                                datevalue.dateEnd.value = G.time.yyyyMMdd(G.time.today, '-');
                                modalArea.appendChild(setting.datepicker);
                                modalArea.appendChild(setting.rainchart);
                                gmap.modal.show(gmap.chartModal);
                                rainchartButton.click();
                            });

                            popupContent.push(button);
                            layer.bindPopup(G.ui.popupContent(popupContent));

                            //layer.bindPopup(popupContent.join('<br>'));

                            layer.on('mouseover', function(e) {
                                self._createDragMarker(name, this, self, layer, true);
                            });

                            layer.on('contextmenu', function(e) {
                                L.popup({
                                        className: 'geocloud-contextmenu'
                                    })
                                    .setLatLng(layer.getLatLng())
                                    .setContent(setting.contextmenu)
                                    .openOn(map);
                            });
                        },
                        pointToLayer: setting.style
                    });

                    var dragElement = self._dragElement(name, unit + '資料', 'fa-tint', '');
                    setting.dragElements[name] = dragElement;
                    folder.appendChild(dragElement);
                });
                overLayers.RainVoronoi = L.geoJson();
            });

            //context menu          
            var radioArea = L.DomUtil.create('div', 'geocloud-contextmenu-rain');
            G.ui.create('div', 'title', '資料類型', radioArea);
            var realtimeRadio = G.ui.create('span', 'fa radio active', '即時雨量', radioArea);
            var historyRadio = G.ui.create('span', 'fa radio', '歷史雨量', radioArea);
            G.ui.create('div', 'title', '雨量圖', radioArea);
            var voronoiCheck = G.ui.create('span', 'fa checkbox', '徐昇法', radioArea);
            realtimeRadio.setAttribute('data-value', 'realtime');
            historyRadio.setAttribute('data-value', 'history');
            [realtimeRadio, historyRadio].forEach(function(el) {
                el.addEventListener('click', function() {
                    setting.mode = el.getAttribute('data-value');
                    el === realtimeRadio ? historyRadio.classList.remove('active') : realtimeRadio.classList.remove('active');
                    if (!el.classList.contains('active')) {
                        el.classList.add('active');

                        if (map.hasLayer(overLayers.RainVoronoi)) {
                            setting.voronoi(map, overLayers);
                        }
                    }
                    setting.reset(overLayers);
                });
            });
            voronoiCheck.addEventListener('click', function() {
                this.classList.toggle('active');
                if (this.classList.contains('active')) {
                    setting.voronoi(map, overLayers);
                    map.addLayer(overLayers.RainVoronoi);
                } else {
                    map.removeLayer(overLayers.RainVoronoi);
                }
            });
            setting.contextmenu = radioArea;
        },

        voronoi: function(map, overLayers) {
            var self = this;
            var raindata = [];
            var raindataLat = [];
            var raindataLng = [];
            var raingeojson = {
                "type": "FeatureCollection",
                "features": []
            };

            ["CWB", "SWCB", "EPA"].forEach(function(unit) {
                var unitdata = overLayers["Rain" + unit];
                if (map.hasLayer(unitdata)) {
                    unitdata.eachLayer(function(layer) {
                        var geojson = layer.toGeoJSON();
                        var coordinates = geojson.geometry.coordinates;
                        raindata.push(coordinates);
                        raindataLat.push(coordinates[1]);
                        raindataLng.push(coordinates[0]);
                        raingeojson.features.push(geojson);
                    });
                }
            });

            var voronoi = d3.geom.voronoi().clipExtent([
                [Math.min.apply(Math, raindataLng) - 0.2, Math.min.apply(Math, raindataLat) - 0.2],
                [Math.max.apply(Math, raindataLng) + 0.2, Math.max.apply(Math, raindataLat) + 0.2]
            ]);

            var results = voronoi(raindata);
            for (var i = 0, imax = raingeojson.features.length; i < imax; i++) {
                if (results[i]) {
                    raingeojson.features[i].geometry = {
                        "type": "Polygon",
                        "coordinates": [results[i]]
                    };
                }
            }

            raingeojson.features = raingeojson.features.filter(function(feature) {
                if (feature.geometry.type === 'Polygon') {
                    return true;
                } else {
                    return false;
                }
            });

            overLayers.RainVoronoi.clearLayers().addData(raingeojson);

            overLayers.RainVoronoi.setStyle(function(feature, latlng) {
                var color;
                var warningCode = self.mode === 'realtime' ? feature.properties.warningNow : feature.properties.warning;
                switch (warningCode) {
                    case 0:
                        color = '#FFF';
                        break;
                    case 1:
                        color = '#FFEB3B';
                        break;
                    case 2:
                        color = '#F44336';
                        break;
                    case 3:
                        color = '#FF9800';
                        break;
                    case 4:
                        color = '#E91E63';
                        break;
                    default:
                        color = '#000';
                        break;
                }

                return {
                    weight: 0.5,
                    color: '#9E9E9E',
                    opacity: 1,
                    fillColor: color,
                    fillOpacity: 0.4
                };
            });
        }
    },

    _Earthquake: {
        data: function(self) {
            var overLayers = self._overLayers;
            var setting = this;
            var earthquakeApi = G.apiUrl + 'Earthquake?all=true';
            var folder = self._dragFolder('Earthquake', '地震資料', '');

            $.ajax({
                url: earthquakeApi,
                async: true,
                dataType: 'json'
            }).done(function(geojson) {
                var features = geojson.features;
                var featureCollection = {
                    EarthquakeTM: {
                        type: 'FeatureCollection',
                        features: []
                    },
                    EarthquakeM1A: {
                        type: 'FeatureCollection',
                        features: []
                    },
                    EarthquakeM2A: {
                        type: 'FeatureCollection',
                        features: []
                    }
                };

                features.forEach(function(feature) {
                    var eqDate = new Date(feature.properties.EQDateTime);
                    if (eqDate > G.time.month1ago) {
                        featureCollection.EarthquakeTM.features.push(feature);
                    } else if (eqDate > G.time.month2ago) {
                        featureCollection.EarthquakeM1A.features.push(feature);
                    } else {
                        featureCollection.EarthquakeM2A.features.push(feature);
                    }
                });

                setting.dragElements = {};

                [
                    ['EarthquakeTM', '地震資料(1個月內)'],
                    ['EarthquakeM1A', '地震資料(2個月內)'],
                    ['EarthquakeM2A', '地震資料(2個月前)']
                ].forEach(function(el) {
                    var name = el[0];
                    var title = el[1];

                    overLayers[name] = L.geoJson(featureCollection[name], {
                        onEachFeature: function(feature, layer) {
                            var date = feature.properties.EQDateTime.split(" ")[0].split("-"),
                                time = feature.properties.EQDateTime.split(" ")[1].split(":");
                            var cwblink = date[1] + date[2] + time[0] + time[1] + (feature.properties.ML * 10) + feature.properties.EQID.slice(-3);

                            var popupContent = '地震編號：' + feature.properties.EQID + '<a target="_blank" href="http://www.cwb.gov.tw/V7/earthquake/Data/detailData/EC' + cwblink +
                                '/detail_frameset.htm">詳細資料</a>' + '<br>' + '地震深度：' + feature.properties.Depth + '<br>' + '相對位置：' + feature.properties.LocationDescription +
                                '<br>' + '地震規模：' + feature.properties.ML + '<br>' + '地震時間：' + feature.properties.EQDateTime + '<br>' + '各地區震度：' + '<br>';
                            var LocationIntensity = feature.properties.LocationIntensity,
                                liContent = '<div style="max-height: 200px; overflow-y: auto;"><table class="table table-bordered"><thead><tr><th>縣市名稱</th><th>最大震度</th></tr></thead>';
                            for (var i = 0, imax = LocationIntensity.length; i < imax; i++) {
                                var county = LocationIntensity[i]["縣市名稱"],
                                    intensity = LocationIntensity[i]["最大震度"];
                                liContent += "<tr><td>" + county + "</td><td>" + intensity + "</td></tr>";
                            }
                            liContent += "</table></div>";
                            layer.bindPopup(popupContent + liContent);

                            layer.on('mouseover', function(e) {
                                self._createDragMarker(name, this, self, layer);
                            });
                        },
                        pointToLayer: function(feature, latlng) {
                            var ML = feature.properties.ML,
                                iconSize, iconAnchor, fontsize, iconType;

                            if (ML <= 4) {
                                fontsize = "";
                                iconSize = [11, 12];
                                iconAnchor = [6, 6];
                            } else if (ML > 4 && ML <= 5) {
                                fontsize = "fa-lg";
                                iconSize = [14, 12];
                                iconAnchor = [7, 6];
                            } else if (ML > 5 && ML <= 6) {
                                fontsize = "fa-2x";
                                iconSize = [21, 24];
                                iconAnchor = [11, 12];
                            } else if (ML > 6) {
                                fontsize = "fa-3x";
                                iconSize = [31, 36];
                                iconAnchor = [16, 18];
                            }

                            var eqdate = new Date(feature.properties.EQDateTime);
                            if (eqdate > G.time.month1ago) {
                                iconType = "icon-EarthquakeTM";
                            } else if (eqdate > G.time.month2ago) {
                                iconType = "icon-EarthquakeM1A";
                            } else {
                                iconType = "icon-EarthquakeM2A";
                            }

                            return L.marker(latlng, {
                                icon: L.divIcon({
                                    className: 'geocloud-marker-icon2 ' + iconType,
                                    iconSize: iconSize,
                                    iconAnchor: iconAnchor,
                                    html: '<i class="fa fa-certificate ' + fontsize + '"></i>'
                                })
                            });
                        }
                    });

                    var dragElement = self._dragElement(name, title, 'fa-certificate');
                    setting.dragElements[name] = dragElement;
                    folder.appendChild(dragElement);
                });
            });
        }
    },

    _Dropbox: {
        count: 0,

        data: function(self) {
            if (G.Dropbox) {
                var map = self._map;
                var gmap = self._gmap;
                var mapCssSeletor = '.geocloud-' + gmap.GeocloudId;
                var overLayers = self._overLayers;
                var setting = this;
                var folder = self._dragFolder('Dropbox', 'Dropbox', '');
                setting.folderCount = 0;

                var DropboxA = {
                    set: function(count, foldernumber, feature, layer) {
                        var direct = Number(feature.properties.Direct) % 360;
                        var dip = Number(feature.properties.Angle);
                        var directInfo = direct + '°';
                        var dipInfo = dip + '°';

                        var popupContent = '傾向(dip direction)：' + directInfo + '<br>傾角(dip angle)：' + dipInfo + '<br>時間：' + feature.properties.Time;
                        layer.bindPopup(popupContent);

                        layer.on('mouseover', function(e) {
                            self._createDragMarker('Dropbox' + count + 'A', this, self, layer, foldernumber);
                        });
                    },
                    style: function(count, feature, latlng) {
                        var direct = parseFloat(-feature.properties.Direct) * (Math.PI / 180);
                        var s = -14;
                        var top = Math.cos(direct) * s + 10;
                        var left = Math.sin(direct) * s + 8;

                        return L.marker(latlng, {
                            icon: L.divIcon({
                                iconSize: [40, 40],
                                iconAnchor: [20, 20],
                                className: 'geocloud-draw-marker-icon ' + 'icon-Dropbox' + count + 'A',
                                html: '<div><i class="fa geo-icon-' + feature.properties.Code + '" style="transform:rotate(' + feature.properties.Direct + 'deg);"></i>' +
                                    '<span style="top:' + top + 'px;left:' + left + 'px;">' + feature.properties.Angle + '</span></div>'
                            }),
                            draggable: true
                        });
                    }
                };

                var DropboxP = {
                    set: function(count, foldernumber, feature, layer) {
                        var src = feature.properties.src;
                        var load = '<span class="fa fa-camera-retro fa-spin fa-5x"></span>';
                        var img = '<img class="fancybox" src="' + src + '" alt="' + feature.properties.caption + '"style="max-width: 260px!important; max-height: 260px!important; border: 3px solid #28b62c;" />';
                        if (feature.properties.caption) {
                            var popupContent = '<div style="width: 260px; height: 260px; text-align: center; line-height: 260px;" onClick = "openimage()">' + img + '</div><br>' +
                                '描述：' + feature.properties.caption + '<br>' + '時間：' + feature.properties.Time;
                        } else {
                            var popupContent = '<div style="width: 260px; height: 260px; text-align: center; line-height: 260px;" onClick = "openimage()">' + img + '</div><br>' +
                                '時間：' + feature.properties.Time;
                        }

                        layer.bindPopup(popupContent);

                        layer.on('mouseover', function(e) {
                            self._createDragMarker('Dropbox' + count + 'P', this, self, layer, foldernumber);
                        });
                    },
                    style: function(count, feature, latlng) {
                        var src = feature.properties.thumbnails;
                        var anchor;
                        var size;
                        return L.marker(latlng, {
                            icon: L.divIcon({
                                iconSize: [40, 40],
                                iconAnchor: [20, 20],
                                className: '' + 'icon-Dropbox' + count + 'P',
                                html: '<img src="' + src + '" style="max-width: 40px!important; max-height: 40px!important; display: inline-block;" />'
                            }),
                            draggable: true
                        });
                    }
                };

                setting.dragElements = {};

                G.Dropbox.GeologyCompass(function(files) {
                    if (files) {
                        var list = files.data;
                        list.forEach(function(dproject) {
                            dropbox_getFolderData(dproject, function(data) {
                                setting.folderCount++;
                                var folderCountNum = setting.folderCount;
                                var name = dproject.name.split("/");
                                var folder = self._dragFolder('Dropbox', name[1], folderCountNum);
                                //var folder = self._dragFolder('Dropbox', 'Dropbox');
                                var dfiles = data.data;

                                var pictureUrl = {};
                                var attitudeLink;
                                var picturelistLink;
                                var traversemapLinks = [];
                                var traversegpxLinks = [];

                                dfiles.forEach(function(dfile) {
                                    var dfilesName = G.Dropbox.getFileName(dfile.name);
                                    switch (dfilesName) {
                                        case 'attitude.cvj':
                                            attitudeLink = dfile.url;
                                            break;
                                        case 'picturelist.cvj':
                                            picturelistLink = dfile.url;
                                            break;
                                        case 'traversemap.cvj':
                                            //traversemapLinks.push(dfile.url);
                                            traversemapLinks.push({ "name": dfile.name, "url": dfile.url });
                                            break;
                                        case 'traversemap.gpx':
                                            //traversegpxLinks.push(dfile.url);
                                            traversegpxLinks.push({ "name": dfile.name, "url": dfile.url });
                                            break;
                                        case 'gps.cvj':
                                            //traversemapLinks.push(dfile.url);
                                            traversemapLinks.push({ "name": dfile.name, "url": dfile.url });
                                            break;
                                        case 'gps.gpx':
                                            //traversegpxLinks.push(dfile.url);
                                            traversegpxLinks.push({ "name": dfile.name, "url": dfile.url });
                                            break;
                                    }

                                    if (G.util.getFileExtension(dfilesName) === 'jpg') {
                                        //var name = G.util.remove(dfilesName, ".jpg");
                                        var name = G.Dropbox.getImgName(dfile.name);
                                        pictureUrl[name] = {
                                            url: dfile.url,
                                            thumbnails: dfile.thumbnails
                                        };
                                    }
                                });

                                var projName = G.util.remove(dproject.name, "GeologyCompass/");
                                var projColor = G.color.random();

                                //位態、照片
                                if (attitudeLink && picturelistLink) {
                                    $.when($.ajax({
                                        url: attitudeLink,
                                        dataType: "json"
                                    }), $.ajax({
                                        url: picturelistLink,
                                        dataType: "json"
                                    })).done(function(aJson, pJson) {
                                        setting.count++;
                                        var className = 'Dropbox' + setting.count;
                                        var clusterColor = G.color.hexToRgba(projColor, 0.5);

                                        G.stylesheet.addRule(['A', 'P'].map(function(el) {
                                            return mapCssSeletor + ' .icon-' + className + el;
                                        }).join(','), 'color:' + projColor + ';');
                                        G.stylesheet.addRule('.cluster-icon-' + className, 'background-color:' + clusterColor + ';');
                                        G.stylesheet.addRule('.cluster-icon-' + className + ' div', 'background-color:' + clusterColor + ';');

                                        var clusterLayer = L.markerClusterGroup({
                                            showCoverageOnHover: false,
                                            iconCreateFunction: function(cluster) {
                                                var childCount = cluster.getChildCount();
                                                return L.divIcon({
                                                    html: '<div><span>' + childCount + '</span></div>',
                                                    className: 'marker-cluster cluster-icon-' + className,
                                                    iconSize: L.point(40, 40)
                                                });
                                            }
                                        }).addTo(map);

                                        var aGeojson = aJson[0];
                                        var pGeojson = pJson[0];

                                        var projName = G.util.remove(dproject.name, "GeologyCompass/");

                                        for (var i = 0, imax = pGeojson.features.length; i < imax; i++) {
                                            if (pictureUrl[pGeojson.features[i].properties.name]) {
                                                pGeojson.features[i].properties.src = pictureUrl[pGeojson.features[i].properties.name].url;
                                                pGeojson.features[i].properties.thumbnails = pictureUrl[pGeojson.features[i].properties.name].thumbnails;
                                            }

                                        }

                                        var aMarkers = L.geoJson(aGeojson, {
                                            onEachFeature: DropboxA.set.bind(this, setting.count, folderCountNum),
                                            pointToLayer: DropboxA.style.bind(this, setting.count)
                                        });
                                        var pMarkers = L.geoJson(pGeojson, {
                                            onEachFeature: DropboxP.set.bind(this, setting.count, folderCountNum),
                                            pointToLayer: DropboxP.style.bind(this, setting.count)
                                        });

                                        overLayers[className] = clusterLayer;
                                        overLayers[className + 'A'] = aMarkers;
                                        overLayers[className + 'P'] = pMarkers;

                                        var dragElementA = self._dragElement(className + 'A', projName + '-位態資料', 'cgs-icon-attitude', folderCountNum);
                                        setting.dragElements[className + 'A'] = dragElementA;
                                        folder.appendChild(dragElementA);

                                        var dragElementP = self._dragElement(className + 'P', projName + '-相片資料', 'cgs-icon-photo', folderCountNum);
                                        setting.dragElements[className + 'P'] = dragElementP;
                                        folder.appendChild(dragElementP);
                                    });
                                } else if (attitudeLink) {
                                    $.ajax({
                                        url: attitudeLink,
                                        async: true,
                                        dataType: "json"
                                    }).done(function(geojson) {
                                        setting.count++;
                                        var className = 'Dropbox' + setting.count;
                                        var clusterColor = G.color.hexToRgba(projColor, 0.5);

                                        G.stylesheet.addRule(mapCssSeletor + ' .icon-' + className + 'A', 'color:' + projColor + ';');
                                        G.stylesheet.addRule('.cluster-icon-' + className, 'background-color:' + clusterColor + ';');
                                        G.stylesheet.addRule('.cluster-icon-' + className + ' div', 'background-color:' + clusterColor + ';');

                                        var clusterLayer = L.markerClusterGroup({
                                            showCoverageOnHover: false,
                                            iconCreateFunction: function(cluster) {
                                                var childCount = cluster.getChildCount();
                                                return L.divIcon({
                                                    html: '<div><span>' + childCount + '</span></div>',
                                                    className: 'marker-cluster cluster-icon-' + className,
                                                    iconSize: L.point(40, 40)
                                                });
                                            }
                                        }).addTo(map);

                                        var aMarkers = L.geoJson(geojson, {
                                            onEachFeature: DropboxA.set.bind(this, setting.count, folderCountNum),
                                            pointToLayer: DropboxA.style.bind(this, setting.count)
                                        });

                                        overLayers[className] = clusterLayer;
                                        overLayers[className + 'A'] = aMarkers;

                                        var dragElementA = self._dragElement(className + 'A', projName + '-位態資料', 'cgs-icon-attitude', folderCountNum);
                                        setting.dragElements[className + 'A'] = dragElementA;
                                        folder.appendChild(dragElementA);
                                    });
                                } else if (picturelistLink) {
                                    $.ajax({
                                        url: picturelistLink,
                                        async: true,
                                        dataType: "json"
                                    }).done(function(geojson) {
                                        setting.count++;
                                        var className = 'Dropbox' + setting.count;
                                        var clusterColor = G.color.hexToRgba(projColor, 0.5);

                                        G.stylesheet.addRule(mapCssSeletor + ' .icon-' + className + 'P', 'color:' + projColor + ';');
                                        G.stylesheet.addRule('.cluster-icon-' + className, 'background-color:' + clusterColor + ';');
                                        G.stylesheet.addRule('.cluster-icon-' + className + ' div', 'background-color:' + clusterColor + ';');

                                        for (var i = 0, imax = geojson.features.length; i < imax; i++) {
                                            if (pictureUrl[geojson.features[i].properties.name]) {
                                                geojson.features[i].properties.src = pictureUrl[geojson.features[i].properties.name].url;
                                                geojson.features[i].properties.thumbnails = pictureUrl[geojson.features[i].properties.name].thumbnails;
                                            }
                                        }

                                        var clusterLayer = L.markerClusterGroup({
                                            showCoverageOnHover: false,
                                            iconCreateFunction: function(cluster) {
                                                var childCount = cluster.getChildCount();
                                                return L.divIcon({
                                                    html: '<div><span>' + childCount + '</span></div>',
                                                    className: 'marker-cluster cluster-icon-' + className,
                                                    iconSize: L.point(40, 40)
                                                });
                                            }
                                        }).addTo(map);

                                        var pMarkers = L.geoJson(geojson, {
                                            onEachFeature: DropboxP.set.bind(this, setting.count, folderCountNum),
                                            pointToLayer: DropboxP.style.bind(this, setting.count)
                                        });

                                        overLayers[className] = clusterLayer;
                                        overLayers[className + 'P'] = pMarkers;

                                        var dragElementP = self._dragElement(className + 'P', projName + '-相片資料', 'cgs-icon-photo', folderCountNum);
                                        setting.dragElements[className + 'P'] = dragElementP;
                                        folder.appendChild(dragElementP);
                                    });
                                }

                                //測路線圖
                                traversemapLinks.forEach(function(traversemapLink) {
                                    if (traversemapLink) {
                                        $.ajax({
                                            url: traversemapLink.url,
                                            async: true,
                                            dataType: "json"
                                        }).done(function(json) {
                                            if (json) {
                                                if (json.type && json.type == "FeatureCollection") {
                                                    setting.count++;
                                                    var className = 'Dropbox' + setting.count + 'T';
                                                    G.stylesheet.addRule(mapCssSeletor + ' .icon-' + className, 'color:' + projColor + ';');
                                                    var latlngs = [
                                                        [json.features[0].geometry.coordinates[1], json.features[0].geometry.coordinates[0]]
                                                    ];
                                                    var start,
                                                        traverse; //軌跡點
                                                    // var traverse_line;//新加圖層_軌跡線
                                                    var popupContent;
                                                    var markersGroup = new L.FeatureGroup();
                                                    var pointNumber = json.features.length;
                                                    var j = 0;
                                                    for (var i = 0; i < pointNumber; i++) {
                                                        if (json.features[i].properties.Accuracy < 20) { //設定精度條件

                                                            latlngs[j] = L.latLng(json.features[i].geometry.coordinates[1], json.features[i].geometry.coordinates[0]);
                                                            //latlngs.push(L.latLng(json.features[i].geometry.coordinates[1], json.features[i].geometry.coordinates[0]));

                                                            // var tmppoint = L.latLng(json.features[i].geometry.coordinates[1], json.features[i].geometry.coordinates[0]);
                                                            // latlngs[i] = json.features[i];
                                                            traverse = L.circleMarker(latlngs[j], {
                                                                //draggable: true,
                                                                radius: 2,
                                                                fillColor: "#ff7800",
                                                                color: '#E91E63',
                                                                weight: 2,
                                                                opacity: 1,
                                                                fillOpacity: 0.5,
                                                                options: {
                                                                    "Accuracy": json.features[i].properties.Accuracy,
                                                                    "Speed": json.features[i].properties.Speed,
                                                                    "popupContent": popupContent
                                                                }
                                                                //,draggable: true                                              
                                                            });
                                                            // onEachFeature: G.overLayers.set.DropboxP.set,
                                                            // pointToLayer: G.overLayers.set.DropboxP.style
                                                            var cc = new Date(json.features[i].properties.Time);
                                                            pointDate = cc.getFullYear() + "-" + cc.getMonth() + "-" + cc.getDate() + " " + cc.getHours() + ":" + cc.getMinutes() + ":" + cc.getSeconds();
                                                            popupContent = "精度(Accuracy)：" + json.features[i].properties.Accuracy + "m<br>" + "速度(Speed)：" + json.features[i].properties.Speed + "m/s<br>" + "方向(Bearing)：" + json.features[i].properties.Bearing + "<br>" + "高度(Altitude)：" + json.features[i].properties.GPS_Altitude + "m<br>" + "時間：" + pointDate;
                                                            traverse.bindPopup(popupContent);
                                                            markersGroup.addLayer(traverse);
                                                            j++;
                                                            //markers.addLayer(traverse_line);
                                                        }

                                                    }
                                                    // traverse_line = L.polyline(latlngs, {//新增
                                                    // color: '#FF68FF',//淺粉紅色
                                                    // weight: 2,
                                                    // opacity: 1
                                                    // });                                                  

                                                    if (json.features && start == null) {
                                                        // start = L.marker(latlngs[0], {
                                                        //     // start = L.marker([latlngs[1], latlngs[0]], {
                                                        //     icon: L.divIcon({
                                                        //         className: "icon-DropboxT" + G.extradata.dropbox.count + " fa fa-map-marker fa-2x",
                                                        //         iconSize: [18, 31],
                                                        //         iconAnchor: [9, 30]
                                                        //     }),
                                                        //     draggable: true
                                                        // });
                                                        var start = L.marker(latlngs[0], {
                                                            icon: L.divIcon({
                                                                className: 'geocloud-marker-icon2 ' + 'icon-' + className,
                                                                iconSize: [16, 20],
                                                                iconAnchor: [8, 20],
                                                                html: '<i class="fa fa-map-signs fa-lg"></i>'
                                                            }),
                                                            draggable: true
                                                        });


                                                    }
                                                    start.bindPopup('軌跡點圖起點');
                                                    // layer.on('mouseover', function(e) {
                                                    //     self._createDragMarker('Dropbox' + setting.count + 'T', this, self, layer);
                                                    // });
                                                    start.on('mouseover', function(e) {
                                                        //self._createDragMarker('Dropbox' + setting.count + 'T', this, self, start);
                                                        self._createDragMarker(className, this, self, start, folderCountNum);
                                                    });

                                                    // var traverse = L.polyline(latlngs, {
                                                    //     color: projColor,
                                                    //     weight: 2,
                                                    //     opacity: 1
                                                    // });
                                                    traverse.bindPopup('軌跡點圖');

                                                    overLayers[className] = L.layerGroup([markersGroup, start]);

                                                    var dragElement = self._dragElement(className, projName + '-軌跡點圖', 'fa-map-signs', folderCountNum);
                                                    setting.dragElements[className] = dragElement;
                                                    folder.appendChild(dragElement);


                                                } else {
                                                    setting.count++;
                                                    var className = 'Dropbox' + setting.count + 'T';
                                                    G.stylesheet.addRule(mapCssSeletor + ' .icon-' + className, 'color:' + projColor + ';');

                                                    //var proj4js = G.proj4js;
                                                    var proj4js = G.proj4;
                                                    var latlngs = [
                                                        [json.start[1], json.start[0]]
                                                    ];
                                                    var stepLength = json.stepLength;

                                                    var last = proj4(G.proj4.twd97).forward([json.start[0], json.start[1]]);
                                                    var testpoint = proj4(G.proj4.twd97).inverse([last[0], last[1]]);

                                                    json.data.forEach(function(data) {
                                                        var x = last[0] + stepLength * data.steps * Math.sin(data.degree * (Math.PI / 180)),
                                                            y = last[1] + stepLength * data.steps * Math.cos(data.degree * (Math.PI / 180));

                                                        var point = proj4(G.proj4.twd97).inverse([x, y]);
                                                        latlngs.push([point[1], point[0]]);
                                                        last = proj4(G.proj4.twd97).forward([point[0], point[1]]);
                                                    });

                                                    var start = L.marker(latlngs[0], {
                                                        icon: L.divIcon({
                                                            className: 'geocloud-marker-icon2 ' + 'icon-' + className,
                                                            iconSize: [16, 20],
                                                            iconAnchor: [8, 20],
                                                            html: '<i class="fa fa-map-signs fa-lg"></i>'
                                                        }),
                                                        draggable: true
                                                    });
                                                    start.bindPopup('測路線圖起點');
                                                    start.on('mouseover', function(e) {
                                                        // self._createDragMarker('Dropbox' + setting.count + 'T', this, self, start);
                                                        self._createDragMarker(className, this, self, start, folderCountNum);
                                                    });

                                                    var traverse = L.polyline(latlngs, {
                                                        color: projColor,
                                                        weight: 2,
                                                        opacity: 1
                                                    });
                                                    traverse.bindPopup('測路線圖');

                                                    overLayers[className] = L.layerGroup([traverse, start]);

                                                    var dragElement = self._dragElement(className, projName + '-測路線圖', 'fa-map-signs', folderCountNum);
                                                    setting.dragElements[className] = dragElement;
                                                    folder.appendChild(dragElement);
                                                }

                                            }
                                        });
                                    }
                                });

                                //測路線圖gpx
                                traversegpxLinks.forEach(function(traversegpxLink) {
                                    if (traversegpxLink) {
                                        $.ajax({
                                            url: traversegpxLink.url,
                                            async: true,
                                            dataType: "xml"
                                        }).done(function(xml) {
                                            setting.count++;
                                            var className = 'Dropbox' + setting.count + 'TG';
                                            G.stylesheet.addRule(mapCssSeletor + ' .icon-' + className, 'color:' + projColor + ';');

                                            var geojson = G.converter.toGeojson('gpx', xml);

                                            var start, traverse;
                                            geojson.features.forEach(function(feature) {
                                                if (feature.geometry.type === 'Point') {
                                                    start = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
                                                        icon: L.divIcon({
                                                            className: 'geocloud-marker-icon2 ' + 'icon-' + className,
                                                            iconSize: [20, 24],
                                                            iconAnchor: [10, 12],
                                                            html: '<i class="fa fa-globe fa-2x"></i>'
                                                        }),
                                                        draggable: true
                                                    });
                                                    start.bindPopup('測路線圖GPX起點');
                                                } else {
                                                    traverse = L.geoJson(feature, {
                                                        style: {
                                                            color: projColor,
                                                            weight: 2,
                                                            opacity: 1
                                                        }
                                                    });
                                                }


                                                if (!start) {
                                                    start = L.marker([feature.geometry.coordinates[0][1], feature.geometry.coordinates[0][0]], {
                                                        icon: L.divIcon({
                                                            className: 'geocloud-marker-icon2 ' + 'icon-' + className,
                                                            iconSize: [20, 24],
                                                            iconAnchor: [10, 12],
                                                            html: '<i class="fa fa-globe fa-2x"></i>'
                                                        }),
                                                        draggable: true
                                                    });
                                                    //traceName = geturlName(traversegpx.name, "gps");
                                                    start.bindPopup('軌跡GPX起點');
                                                }

                                            });
                                            start.on('mouseover', function(e) {
                                                //self._createDragMarker('Dropbox' + setting.count + 'TG', this, self, start);
                                                self._createDragMarker(className, this, self, start, folderCountNum);
                                            });

                                            overLayers[className] = L.layerGroup([traverse, start]);

                                            var dragElement = self._dragElement(className, projName + '-路線圖GPX', 'fa-globe', folderCountNum);
                                            setting.dragElements[className] = dragElement;
                                            folder.appendChild(dragElement);
                                        });
                                    }
                                });
                            });
                        });
                    }
                });
            }
        }
    }
});

function openimage() {
    //CreatImgBox(document.querySelector(".fancybox").src);
    $.colorbox({
        title: document.querySelector(".fancybox").alt,
        href: document.querySelector(".fancybox").src,
        scalePhotos: true,
        maxWidth: window.innerWidth,
        maxHeight: window.innerHeight,
        innerWidth: window.innerWidth - '20px',
        innerHeight: window.innerHeight - '20px',
        padding: '1%',
        close: "close"
            //closeButton:false
    });
    // $(".fancybox").fancybox({
    //     openEffect  : 'elastic',
    //     closeEffect : 'elastic',
    //     width       : '70%',
    //     height      : '70%'
    // });
};
G.control.extradata = function(options) {
    return new G.control.ExtraData(options);
};

/**
 * G.Control.Scale Class(For Create Scale Control)
 * @return {Object} this - G.Control.Scale Object
 */
G.control.Scale = G.Control.extend({
	options: {
		position: 'bottomright'
		// position: 'bottomleft'
	},

	onAdd: function(map) {
		var container = L.DomUtil.create('div', 'leaflet-control-attribution');

		this._map = map;

		var span = document.createElement('div');
		span.textContent = LanguageValue.ScaleBar + " =  1 : 2,114,654";

		container.appendChild(span);

		map.on("moveend", function(e) {
			var latitude = map.getCenter().lat,
				zoom = map.getZoom(),
				scale = (96 * 39.37 * 156543.04 * Math.cos(latitude * (Math.PI / 180)) / Math.pow(2, zoom)),
				scaleBar = LanguageValue.ScaleBar + " = 1 : " + G.util.numberWithCommas(Math.round(scale));

			span.textContent = scaleBar;
		});
		return container;
	}
});

G.control.scale = function(options) {
	return new G.control.Scale(options);
};
/**
 * G.Control.Position Class(For Create Mousemove Position Control)
 * @return {Object} this - G.Control.Position Object
 */
G.control.Position = G.Control.extend({
	options: {
		position: 'bottomright'
		// position: 'bottomleft'
	},

	onAdd: function(map) {
		var container = L.DomUtil.create('div', 'geocloud-control-position leaflet-control-attribution');
		var positionWGS84 = L.DomUtil.create('div', 'geocloud-control-position-wgs84', container);
		var positionTWD97 = L.DomUtil.create('div', 'geocloud-control-position-twd97', container);
		var positionTWD67 = L.DomUtil.create('div', 'geocloud-control-position-twd67', container);
		positionWGS84.textContent = '『WGS84』' + LanguageValue.Longitude + ':, ' + LanguageValue.Latitude + ':';

		[positionWGS84, positionTWD97, positionTWD67].forEach(function(el) {
			el.addEventListener("click", function() {
				var parent = el.parentNode;
				parent.insertBefore(el, parent.firstChild);
			});
		});

		this._map = map;

		map.on("mousemove", function(e) {
			var xy = [e.latlng.lng, e.latlng.lat];
			var wgs84 = "『WGS84』" + LanguageValue.Longitude + ":" + e.latlng.lng.toFixed(4) + ", " + LanguageValue.Latitude + ":" + e.latlng.lat.toFixed(4);
			var p97 = G.proj4.twd97.forward(xy);
			var p67 = G.proj4.twd67.forward(xy);
			var twd97 = "『TWD97』X:" + p97[0].toFixed(0) + ", Y:" + p97[1].toFixed(0);
			var twd67 = "『TWD67』X:" + p67[0].toFixed(0) + ", Y:" + p67[1].toFixed(0);
			positionWGS84.textContent = wgs84;
			positionTWD97.textContent = twd97;
			positionTWD67.textContent = twd67;

			// var proj4js = G.proj4js;
			// var wgs84 = "『WGS84』" + LanguageValue.Longitude + ":" + e.latlng.lng.toFixed(4) + ", " + LanguageValue.Latitude + ":" + e.latlng.lat.toFixed(4);
			// var p97 = new Proj4js.Point(e.latlng.lng, e.latlng.lat);
			// var p67 = new Proj4js.Point(e.latlng.lng, e.latlng.lat);
			// Proj4js.transform(proj4js.wgs84, proj4js.twd97, p97);
			// var twd97 = "『TWD97』X:" + p97.x.toFixed(0) + ", Y:" + p97.y.toFixed(0);
			// Proj4js.transform(proj4js.wgs84, proj4js.twd67, p67);
			// var twd67 = "『TWD67』X:" + p67.x.toFixed(0) + ", Y:" + p67.y.toFixed(0);
			// positionWGS84.textContent = wgs84;
			// positionTWD97.textContent = twd97;
			// positionTWD67.textContent = twd67;
		});

		return container;
	}
});

G.control.position = function(options) {
	return new G.control.Position(options);
};
/**
 * G.Control.Menu Class(For Create Menu Button Control)
 * @return {Object} this - G.Control.Menu Object
 */
G.control.Menu = G.Control.extend({
    options: {
        position: 'topright'
    },

    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'geocloud-control-menu');
        container.style.float = 'left';

        this._map = map;
        this._container = container;
        this._menuContent = {};

        return container;
    },

    _menu: [],

    _selectMenu: function(e) {
        var target = e.currentTarget;

        this._menu.forEach(function(el) {
            // if (el === target) {
            //  el.classList.toggle('active');
            // } else {
            //  el.classList.remove('active');
            // }
            if (el === target) {
                el.classList.toggle('active');
            }
        });
    },

    _addMenu: function(html, title) {
        var menu = this._createButton(html, title, '', this._container, this._selectMenu, this);
        this._menu.push(menu);
        return menu;
    },

    // createMenuControl: function(title, iconClass, menuContent, contentClass, menuEvent) {
    createMenuControl: function(title, icon, menuContent, contentClass, menuEvent) {
        var self = this;
        //menu content
        var content;
        if (contentClass) {
            content = L.DomUtil.create('div', 'content geocloud-menuContent-' + contentClass, menuContent._contents);
            content.style.display = 'none';
            content.innerHTML = '<div class="contentTitle">' + title + '<span class="close">x</span></div>' + content.innerHTML
            // $('.' + 'geocloud-menuContent-' + contentClass + ' ')

            //         $(widgetNAME).removeClass("is-view");
            //         $(toggleName).removeClass("is-active");
            self._menuContent[contentClass] = content;
        }

        //menu button
        // var menuButton = self._addMenu('<i class="' + iconClass + '"></i>', title);
        var menuButton = icon ? self._addMenu(icon, title) : L.DomUtil.create('button', '', null)

        menuEvent && menuButton.addEventListener('click', menuEvent);
        // span click
        $($(content).find('.close')[0]).on('click', function() {
            var menuContainer = menuButton;
            var menuContentContainer = menuContent.getContainer();
            if (menuContainer.classList.contains('active')) {
                menuContainer.classList.remove('active');
            } else {
                menuContainer.classList.add('active');
            }

            if (menuContainer.classList.contains('active')) {
                menuContentContainer.classList.add('active');
            } else {
                menuContentContainer.classList.remove('active');
            }

            if (content.style.display == 'none')
                content.style.display = '';
            else
                content.style.display = 'none';

        })
        // menu click
        menuContent && menuButton.addEventListener('click', function() {
            var menuContainer = self.getContainer();
            var menuContentContainer = menuContent.getContainer();
            if (this.classList.contains('active')) {
                menuContainer.classList.add('active');
                menuContentContainer.classList.add('active');
            } else {
                menuContainer.classList.remove('active');
                menuContentContainer.classList.remove('active');
            }

            if (content.style.display == 'none')
                content.style.display = '';
            else
                content.style.display = 'none';
        });

        return content;
    },

    createStaticMenuButton: function(title, icon, menuEvent) {
        var self = this;

        //menu button
        var menuButton = icon ? self._addMenu(icon, title) : L.DomUtil.create('button', '', null)
        // menuButton.classList.add('static');

        menuEvent && menuButton.addEventListener('click', menuEvent);
        return menuButton
    }
});

G.control.menu = function(options) {
    return new G.control.Menu(options);
};
/**
 * G.Control.MenuContent Class(For Create Menu Content Control)
 * @return {Object} this - G.Control.MenuContent Object
 */
G.control.MenuContent = G.Control.extend({
	options: {
		position: 'topright'
	},

	onAdd: function(map) {
		var self = this;
		var container = L.DomUtil.create('div', 'geocloud-control-menuContent');
		// var gears = L.DomUtil.create('div', 'gears', container);
		var contents = L.DomUtil.create('div', 'contents', container);
		// var closeButton = this._createButton('<i class="fa fa-close fa-lg"></i>', '關閉', '', gears, self._closeMenuContent, self);
		// var tackButton = this._createButton('<i class="fa fa-thumb-tack fa-lg"></i>', '自動隱藏', '', gears, self._toggleTackFloat, self);
		// closeButton.style.right = '0px';
		// tackButton.style.right = '22px';

		L.DomEvent.disableClickPropagation(container)
			.disableScrollPropagation(container);

		self._map = map;
		self._contents = contents;
		// self._closeButton = closeButton;
		// self._tackButton = tackButton;

		// map.on('click', function(e) {
		// 	if (tackButton.classList.contains("float")) {
		// 		self._closeMenuContent();
		// 	}
		// });

		return container;
	},

	_closeMenuContent: function() {
		if (this._menu.getContainer().querySelector('.active')) {
			this._menu.getContainer().querySelector('.active').click();
		}
	},

	_toggleTackFloat: function() {
		this._tackButton.classList.toggle('float');
	}
});

G.control.menucontent = function(options) {
	return new G.control.MenuContent(options);
};
/**
 * G.Control.Tab Class(For Create Tab Button Control)
 * @return {Object} this - G.Control.Tab Object
 */
G.control.Tab = G.Control.extend({
    options: {
        position: 'bottomleft'
    },

    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'geocloud-control-tab');
        container.style.float = 'left';

        this._map = map;
        this._container = container;
        this._tabContent = {};

        return container;
    },

    _tab: [],

    _selectTab: function(e) {
        var target = e.currentTarget;

        this._tab.forEach(function(el) {
            if (el === target) {
                el.classList.toggle('active');
            } else {
                el.classList.remove('active');
            }
        });
    },

    _addTab: function(html, title) {
        var tab = this._createButton(html, title, '', this._container, this._selectTab, this);
        this._tab.push(tab);
        return tab;
    },

    // createTabControl: function(title, iconClass, tabContent, contentClass, tabEvent) {
    createTabControl: function(title, icon, tabContent, contentClass, tabEvent) {
        var self = this;
        //tab content
        var content;
        if (contentClass) {
            content = L.DomUtil.create('div', 'content geocloud-tabContent-' + contentClass, tabContent._contents);
            content.style.display = 'none';

            self._tabContent[contentClass] = content;
        }

        //tab button
        // var tabButton = self._addTab('<i class="' + iconClass + '"></i>', title);
        var tabButton = self._addTab(icon, title);
        tabButton.id = 'TabControl' + contentClass;

        tabEvent && tabButton.addEventListener('click', tabEvent);
        tabContent && tabButton.addEventListener('click', function() {
            if (contentClass == 'DengueSummary' || contentClass == 'MeaslesSummary') {
                $('.geocloud-control-tabContent').addClass('geocloud-control-tabContent-higher')
                $('.geocloud-control-tab').addClass('geocloud-control-tab-higher')
            } else {
                $('.geocloud-control-tabContent').removeClass('geocloud-control-tabContent-higher')
                $('.geocloud-control-tab').removeClass('geocloud-control-tab-higher')
            }

            // .geocloud-control-tabContentHigher 

            var tabContainer = self.getContainer();
            var tabContentContainer = tabContent.getContainer();
            if (this.classList.contains('active')) {
                tabContainer.classList.add('active');
                tabContentContainer.classList.add('active');
            } else {
                tabContainer.classList.remove('active');
                tabContentContainer.classList.remove('active');
            }

            // tabContentContainer.getContainer().style['height'] = tabContent.style['height'] //'600px'

            G.util.each(tabContentContainer.querySelectorAll('.content'), function(el) {
                el.style.display = 'none';
            });
            content.style.display = '';
        });

        return content;
    }
});

G.control.tab = function(options) {
    return new G.control.Tab(options);
};
/**
 * G.Control.TabContent Class(For Create Tab Content Control)
 * @return {Object} this - G.Control.TabContent Object
 */
G.control.TabContent = G.Control.extend({
	options: {
		position: 'bottomleft'
	},

	onAdd: function(map) {
		var self = this;
		var container = L.DomUtil.create('div', 'geocloud-control-tabContent');
		var gears = L.DomUtil.create('div', 'gears', container);
		var contents = L.DomUtil.create('div', 'contents', container);
		var closeButton = this._createButton('<i class="fa fa-close fa-lg"></i>', '關閉', '', gears, self._closeTabContent, self);
		var tackButton = this._createButton('<i class="fa fa-thumb-tack fa-lg"></i>', '自動隱藏', '', gears, self._toggleTackFloat, self);
		closeButton.style.right = '0px';
		tackButton.style.right = '22px';

		L.DomEvent.disableClickPropagation(container)
			.disableScrollPropagation(container);

		self._map = map;
		self._contents = contents;
		self._closeButton = closeButton;
		self._tackButton = tackButton;

		map.on('click', function(e) {
			if (tackButton.classList.contains("float")) {
				self._closeTabContent();
			}
		});

		return container;
	},

	_closeTabContent: function() {
		if (this._tab.getContainer().querySelector('.active')) {
			this._tab.getContainer().querySelector('.active').click();
		}
	},

	_toggleTackFloat: function() {
		this._tackButton.classList.toggle('float');
	}
});

G.control.tabcontent = function(options) {
	return new G.control.TabContent(options);
};
G.layerBar = {};

/**
 * Create Layer Bar 圖層控制元件組
 * @param {String} name - 圖層名稱
 * @param {DOM} container - 要新增於的對象
 * @param {Object} gmap - G.Map Object
 * @param {Object} data - Geocloud Data
 * @param {Object} display - 圖層是否預設開啟
 * @param {Object} display_legend - 圖例是否開啟
 * @param {Object} display_zoom - 自動移動圖層是否開啟
 * @return {DOM} bar - Create DOM
 */
G.layerBar.controller = function (name, container, gmap, data, display_layer, display_legend, display_zoom, display_delete) {
    var barName = LanguageValue['Geo' + name] || name;
    var sLayersList = gmap.sortLayersList;

    // var vtLayer = /Attitude|CGPS|RealEstate|DengueCase|BucketRecord|Rainfall/gi.test(name) ? false : true;
    // var vtLayer = /DengueReport|Rainfall/gi.test(name) ? false : true;
    var vtLayer = true;
    var group = container.area ? container.area.className.replace("area layer-group-", "") : container;
    //if(G.)
    var bar = G.ui.layerBar(name, container.area, barName, group, G.layerBar.createLayer(name, gmap, data, vtLayer));
    var button = bar.querySelector('a');
    var bulb = bar.querySelector('i');

    var div_btn_zoom = L.DomUtil.create('div', 'zoom_area', bar);
    div_btn_zoom.style.display = 'none';
    var legendArea = L.DomUtil.create('div', '', bar);
    legendArea.style.display = 'none';

    button.addEventListener("click", function () {
        if (this.classList.contains('active')) {
            div_btn_zoom.style.display = '';
            this.querySelector('i').style.color = slider.value != 1 ? 'rgba(255, 255, 0, ' + slider.value + ')' : '';
        } else {
            sliderArea.style.display = 'none';
            legendArea.style.display = 'none';
            div_btn_zoom.style.display = 'none';
            this.querySelector('i').style.color = '';
        }
    });

    var btn_opacity = L.DomUtil.create('span', '', div_btn_zoom);
    btn_opacity.textContent = "[" + LanguageValue.Opcity + "]";
    btn_opacity.style.cursor = "pointer";
    btn_opacity.addEventListener("click", function () {
        G.ui.toggleEvent(sliderArea);
    });

    if (display_legend === true) {
        G.legend.show(group, name, legendArea);
        var btn_legend = L.DomUtil.create('span', '', div_btn_zoom);
        btn_legend.textContent = " [" + LanguageValue.Legend + "]";
        btn_legend.style.cursor = "pointer";
        btn_legend.addEventListener("click", function () {
            G.ui.toggleEvent(legendArea);
        });
    }
    if (display_zoom === true) {
        var btn_zoom = L.DomUtil.create('span', '', div_btn_zoom);
        btn_zoom.textContent = " [" + LanguageValue.ZoomIn + "]";
        btn_zoom.style.cursor = "pointer";
        btn_zoom.addEventListener("click", function () {
            var getBounds = G.util.polylineFindBound(data[1].features);
            if (getBounds.num > 0) {
                G.ui.layerZoom(gmap, getBounds);
            } else {
                alert(LanguageValue.ErrorNote);
                btn_zoom.style.display = "none";
            }
        });
    }
    if (display_delete === true) {
        var btn_delete = L.DomUtil.create('span', '', div_btn_zoom);
        btn_delete.textContent = " [" + LanguageValue.Delete + "]";
        btn_delete.style.cursor = "pointer";
        btn_delete.addEventListener("click", function () {
            var layerGroup = gmap.vectorTileLayers[name];
            gmap.mainMap.removeLayer(layerGroup); //圖面上刪除
            var click_delete = this;
            var click_li = click_delete.parentNode.parentNode;
            var click_ul = click_li.parentNode;
            if (this.innerHTML == " [" + LanguageValue.Delete + "]") {
                click_ul.removeChild(click_li);
                // gmap.sortLayersList.InputFile.removeChild(click_li);
                // gmap.sortLayersList.InputFile[0].getAttribute("layer-name")

            }
        });
    }
    // export
    if (true) {
        var btn_export = L.DomUtil.create('span', '', div_btn_zoom);
        btn_export.textContent = " [ JSON ]";
        btn_export.style.cursor = "pointer";
        btn_export.addEventListener("click", function () {
            // var layerGroup = gmap.vectorTileLayers[name];
            var layerGeojson = G.converter.emptyGeojson();
            layerGeojson.features = data[1].features;
            var blob = new Blob([JSON.stringify(layerGeojson)], {
                type: "text/plain;charset=utf-8"
            });
            saveAs(blob, name + ".json");
        });
    }
    if (true) {
        var btn_export = L.DomUtil.create('span', '', div_btn_zoom);
        btn_export.textContent = " [ KML ]";
        btn_export.style.cursor = "pointer";
        btn_export.addEventListener("click", function () {
            // var layerGroup = gmap.vectorTileLayers[name];
            var layerGeojson = G.converter.emptyGeojson();
            layerGeojson.features = data[1].features;
            var drawKml = GeoConvert.geojson2Kml(layerGeojson, true);
            // var drawKml = G.converter.toKml('geojson', layerGeojson);
            var blob = new Blob([drawKml], {
                type: "text/plain;charset=utf-8"
            });
            saveAs(blob, name + ".kml");
        });
    }

    var sliderArea = L.DomUtil.create('div', 'slider-area', bar);
    var sliderTitle = L.DomUtil.create('span', '', sliderArea);
    sliderTitle.textContent = LanguageValue.Opaque + '：100%';
    var slider = G.ui.slider(1, 0, 1, 0.1, function () {
        var alpha = this.value;
        sliderTitle.textContent = LanguageValue.Opaque + '：' + (parseFloat(alpha) * 100).toFixed(0) + '%';
        bulb.style.color = 'rgba(255, 255, 0, ' + alpha + ')';
    }, G.layerBar.sliderEvent(name, gmap, vtLayer));
    slider.addEventListener("click", function (e) {
        e.stopPropagation();
    });
    slider.addEventListener("mousedown", function (e) {
        e.stopPropagation();
    });
    sliderArea.style.display = 'none';
    sliderArea.appendChild(slider);

    if (container.style) {
        container.style.display = '';
    }
    if (sLayersList[group]) {
        sLayersList[group].push(bar);
    }

    if (display_layer) {
        button.click();
    }
}
G.layerBar.createDiseaseLayer = function (name, gmap, data, isDisplay) {
    var map = gmap.mainMap;
    if (data && data[0]) {
        switch (data[0]) {
            // case 'json':
            //     break;
            case 'heatmap':
                var geojson = data[1];
                var pointData = {
                    max: 10,
                    data: []
                };
                geojson.features.forEach(function (feature) {
                    pointData.data.push({
                        lng: feature.geometry.coordinates[0],
                        lat: feature.geometry.coordinates[1],
                        count: 1
                    })
                });
                var cfg = {
                    // radius should be small ONLY if scaleRadius is true (or small radius is intended)
                    // if scaleRadius is false it will be the constant radius used in pixels
                    "radius": .08,
                    "maxOpacity": .6,
                    // scales the radius based on map zoom
                    "scaleRadius": true,
                    // if set to false the heatmap uses the global maximum for colorization
                    // if activated: uses the data maximum within the current map boundaries 
                    //   (there will always be a red spot with useLocalExtremas true)
                    // "useLocalExtrema": true,
                    // which field name in your data represents the latitude - default "lat"
                    latField: 'lat',
                    // which field name in your data represents the longitude - default "lng"
                    lngField: 'lng',
                    // which field name in your data represents the data value - default "value"
                    valueField: 'count'
                };

                var heatmapLayer = new HeatmapOverlay(cfg);
                heatmapLayer.setData(pointData);
                if (gmap.vectorTileLayers[name]) {
                    gmap.mainMap.removeLayer(gmap.vectorTileLayers[name]);
                }
                gmap.vectorTileLayers[name] = heatmapLayer;
                if (isDisplay) {
                    gmap.vectorTileLayers[name]._el.style.display = '';
                } else {
                    gmap.vectorTileLayers[name]._el.style.display = 'none';
                    // gmap.mainMap.removeLayer(gmap.vectorTileLayers[name]);
                }
                break;
            default:
                var geojson = data[0] === 'json' ? data[1] : geobuf.decode(data[1]);
                if (geojson) {
                    var tileIndex = geojsonvt(geojson, G.geo.tile.options);
                    tileIndex.outOfBounds = {};
                    tileIndex.outOfBounds.checked = {};


                    var sLayerzIndex = 0;
                    Object.keys(gmap.sortLayersList).forEach(function (key) {
                        sLayerzIndex = sLayerzIndex + gmap.sortLayersList[key].length;
                    });
                    // console.log(yy);
                    var zIndex = sLayerzIndex; //gmap.layerOptions.geo.length +   


                    var canvasTile = G.vectorTile.canvasTile(tileIndex, name, zIndex, map);
                    gmap.vectorTileLayers[name] = canvasTile;
                    G.geo.tile.indices[name] = tileIndex;
                    if (isDisplay) {
                        gmap.vectorTileLayers[name].getContainer().style.display = '';
                    } else {
                        gmap.vectorTileLayers[name].getContainer().style.display = 'none';
                        // gmap.mainMap.removeLayer(gmap.vectorTileLayers[name]);
                    }
                }
                break;

        }
    }
};

G.layerBar.createDiseaseLayerBar = function (name, container, gmap, vtLayerName, isDisplay) {
    var barName = LanguageValue['Geo' + name] || name;
    var bar = G.ui.layerBar(name, container.area, barName, 'layerlist', function (e) {
        var vtLayer = gmap.vectorTileLayers[vtLayerName];
        if (vtLayer) {
            if (this.classList.contains("active")) {
                if (vtLayer.getContainer) {
                    vtLayer.getContainer().style.display = '';
                }
                else if (vtLayer._el) {
                    vtLayer._el.style.display = '';
                }
            } else {
                if (vtLayer.getContainer) {
                    vtLayer.getContainer().style.display = 'none';
                }
                else if (vtLayer._el) {
                    vtLayer._el.style.display = 'none';
                }
                // console.log('關關');
            }
        }
    });

    var button = bar.querySelector('a');
    var bulb = bar.querySelector('i');
    if (isDisplay) {
        button.click();
    }

    bar.enable = function () {
        button.classList.addClass("active");
        var vtLayer = gmap.vectorTileLayers[vtLayerName];
        if (vtLayer) {
            vtLayer.getContainer().style.display = '';
        }
    }

    bar.disable = function () {
        button.classList.removeClass("active");
        var vtLayer = gmap.vectorTileLayers[vtLayerName];
        if (vtLayer) {
            vtLayer.getContainer().style.display = 'none';
        }
    }

    return bar;
};

/**
 * Get Geocloud Layer Slider Event
 * @param {String} name - Menu Control
 * @param {Object} gmap - G.Map Object
 * @param {Boolean} vtLayer - is vector tile layer?
 * @return {Function} event - slider event
 */
G.layerBar.sliderEvent = function (name, gmap, vtLayer) { //container
    if (vtLayer) {
        return function () {
            var layerGroup = gmap.vectorTileLayers[name];
            var alpha = this.value;
            layerGroup.getContainer().style.opacity = alpha;
            layerGroup.opacity = alpha;
        };
    } else {
        return function () {
            var layerGroup = gmap.overLayers[name];
            var alpha = this.value;
            var tempFeature = layerGroup.getLayers()[0].feature;
            var style = G.geo.set[name].style(tempFeature);
            var setOpacity = {
                opacity: style.opacity * alpha
            };
            if (style.fillOpacity) {
                setOpacity.fillOpacity = style.fillOpacity * alpha;
            }
            layerGroup.setStyle(setOpacity);
            layerGroup.opacity = alpha;
        };
    }
};

/**
 * Get Geocloud Create Geo Layer
 * @param {String} name - Menu Control
 * @param {Object} gmap - G.Map Object
 * @param {Object} data - Geocloud Data
 * @param {Boolean} vtLayer - is vector tile layer?
 * @return {Function} event - create event
 */
G.layerBar.createLayer = function (name, gmap, data, vtLayer) {
    var map = gmap.mainMap;

    if (vtLayer) {
        return function (e) {
            var geojson = data[0] === 'json' ? data[1] : geobuf.decode(data[1]);
            if (geojson) {
                var tileIndex = geojsonvt(geojson, G.geo.tile.options);
                tileIndex.outOfBounds = {};
                tileIndex.outOfBounds.checked = {};
                var sLayerzIndex = 0;
                Object.keys(gmap.sortLayersList).forEach(function (key) {
                    sLayerzIndex = sLayerzIndex + gmap.sortLayersList[key].length;
                });
                // console.log(yy);
                var zIndex = sLayerzIndex; //gmap.layerOptions.geo.length +                
                var canvasTile = G.vectorTile.canvasTile(tileIndex, name, zIndex, map);
                gmap.vectorTileLayers[name] = canvasTile;
                G.geo.tile.indices[name] = tileIndex;
                // create a one-time event
                // remove event
                e.target.removeEventListener(e.type, arguments.callee);
                e.target.addEventListener("click", G.layerBar.bulbEvent(this, name, gmap, vtLayer));
            }
        };
    } else {
        return function (e) {
            var info = {};
            info.name = name;
            info.gmap = gmap;

            var geojson = data[0] === 'json' ? data[1] : geobuf.decode(data[1]);
            var onEachFeature = G.geo.set[name].set ? G.geo.set[name].set.bind(info) : G.geo.onEachFeature.bind(info);
            var rawLayer = L.geoJson(geojson, {
                onEachFeature: onEachFeature,
                style: G.geo.set[name].style,
                pointToLayer: G.geo.set[name].style
            });
            var layer = G.geo.set[name].process ? G.geo.set[name].process(rawLayer, gmap) : rawLayer;
            map.addLayer(layer);
            layer.opacity = 1;
            gmap.overLayers[name] = layer;

            e.target.removeEventListener(e.type, arguments.callee);
            e.target.addEventListener("click", G.layerBar.bulbEvent(this, name, gmap, vtLayer));
        };
    }
};

/**
 * Get Geocloud Geo Layer Bulb Button Event
 * @param {String} name - Menu Control
 * @param {Object} gmap - G.Map Object
 * @param {Boolean} vtLayer - is vector tile layer?
 * @return {Function} event - bulb button Event
 */
G.layerBar.bulbEvent = function (el, name, gmap, vtLayer) {
    var map = gmap.mainMap;

    if (vtLayer) {
        var layerGroup = gmap.vectorTileLayers[name];
        return function () {
            if (el.classList.contains("active")) {
                layerGroup.getContainer().style.display = '';
            } else {
                layerGroup.getContainer().style.display = 'none';
            }
        };
    } else {
        var layerGroup = gmap.overLayers[name];
        return function () {
            if (el.classList.contains("active")) {
                map.addLayer(layerGroup);
                map.fire("moveend");
            } else {
                map.removeLayer(layerGroup);
            }
        };
    }
};

G.layerBar.createbmlist = function (name, year, container, gmap, layerlist, bbox) {
    var barName = '名稱:' + name;
    var bar = G.ui.layerBar(name, container.area, barName, 'list');

    var button = bar.querySelector('a');
    button.addEventListener("click", function () {
        if (this.classList.contains('active')) {
            mymap.mainMap.fitBounds([
                [bbox.split(',')[1], bbox.split(',')[0]],
                [bbox.split(',')[3], bbox.split(',')[2]]
            ]);
            area = this.parentElement.parentElement;
            layer_list = layerlist.split(',');
            for (var i = 0; i < $('.geocloud-menuContent-geo .geocloud-layerBar').length; i++) {
                if ($('.geocloud-menuContent-geo .geocloud-layerBar')[i].querySelector('a').classList == "active") { $('.geocloud-menuContent-geo .geocloud-layerBar')[i].querySelector('a').click() }
            }
            for (var i = 0; i < layer_list.length; i++) {
                for (var j = 0; j < $('.geocloud-menuContent-geo .geocloud-layerBar').length; j++) {
                    if ($('.geocloud-menuContent-geo .geocloud-layerBar')[j].childNodes[0].innerText == layer_list[i]) { $('.geocloud-menuContent-geo .geocloud-layerBar')[j].querySelector('a').click() }
                }
            }
            for (var i = 0; i < area.childNodes.length; i++) {
                if (this.parentElement != area.childNodes[i]) {
                    area.childNodes[i].querySelector('a').classList.remove('active')
                }
            }
        } else {
            this.querySelector('i').style.color = '';
            if (checkAns.style.display == 'block') G.ui.toggleEvent(checkAns);
        }
    });

    var btn_success = L.DomUtil.create('span', '', bar);
    btn_success.textContent = "[ 刪除 ]";
    btn_success.style.cursor = "pointer";
    btn_success.style = "cursor: pointer;position: absolute;right: 16px;";
    btn_success.addEventListener("click", function (e) {
        checkTitle.textContent = '確定刪除?';
        if (checkAns.style.display == 'none') G.ui.toggleEvent(checkAns);
    });
    var checkAns = L.DomUtil.create('div', 'check-area', bar);
    var checkTitle = L.DomUtil.create('span', '', checkAns);
    checkAns.style.display = 'none';


    var check_success = L.DomUtil.create('span', '', checkAns);
    check_success.textContent = "   [ 是 ]   ";
    check_success.style.color = 'green';
    check_success.style.cursor = "pointer";
    check_success.addEventListener("click", function (e) {
        //刪除該項列表
        var click_delete = this;
        var click_li = click_delete.parentNode.parentNode;
        var click_ul = click_li.parentNode;
        click_ul.removeChild(click_li);
        $.ajax({
            type: 'post',
            url: '/map/delbmlist',
            async: true,
            data: {
                name: name,
                year: year,
                bbox: bbox,
            }
        })
    });
    var check_cancel = L.DomUtil.create('span', '', checkAns);
    check_cancel.textContent = "   [ 否 ]";
    check_cancel.style.color = 'red';
    check_cancel.style.cursor = "pointer";
    check_cancel.addEventListener("click", function (e) {
        G.ui.toggleEvent(checkAns);
    });


    if (container.style) {
        container.style.display = '';
    }
};
var GeoLegendIndex = {};
//斷層、摺皺、位態 須補圖片
GeoLegendIndex.Stratum = {}, GeoLegendIndex.Stratum25 = {}, GeoLegendIndex.TectonicElement50 = {},
    GeoLegendIndex.Fault = {}, GeoLegendIndex.Fault25 = {}, GeoLegendIndex.Fault50 = {}, GeoLegendIndex.Fold = {}, GeoLegendIndex.Fold50 = {},
    GeoLegendIndex.CoalSeam = {}, GeoLegendIndex.Attitude = {};
GeoLegendIndex.TectonicElement50 = [
    ['T110', '構造通谷（位於基盤上之對衝斷層谷，緊依大陸與島弧間之縫合線，兩側斷層均左移）(W1)'],
    ['T121', '超基性火成岩(W2a)'],
    ['T122', '酸性深成岩，片麻岩及混合岩(W2b)'],
    ['T123', '片岩及大理岩(W2c)'],
    ['T130', '上衝板岩帶（始新世至中新世次等地槽岩層，在新第三紀經以剪切褶皺為主之變動）(W3)'],
    ['T140', '上新－更新世混同層及較新沈積物（隨同上衝板岩帶上升）(W4)'],
    ['T151', '弧間槽谷(W5a)'],
    ['T152', '弧前槽谷(W5b)'],
    ['T160', '內緣褶皺衝斷帶（中新世次等地槽岩層，在更新世經以曲滑褶皺為主之變動，全體形成逆衝及（或）俯衝斷片之疊瓦狀構造）(W6)'],
    ['T171', '中新世至更新世岩層（一部分為弗立希式細碎屑岩）(W7a)'],
    ['T172', '更新世岩層（大部分為牟拉斯式粗碎屑岩）(W7b)'],
    ['T180', '更新世安山岩（代表島弧岩漿活動）(W8)'],
    ['T191', '台地礫石層或沖積層(W9a)'],
    ['T192', '更新世洪流式玄武岩(W9b)'],
    ['T210', '中新世及較新安山岩及閃長岩（代表島弧岩漿活動）(E1)'],
    ['T220', '沿海褶皺衝斷帶（中新世及上新世優等地槽之火山岩質與弗立希式岩層，在上新－更新世經以曲滑褶皺為主之變動，全體形成逆衝斷片之疊瓦狀構造）(E2)'],
    ['T230', '上新－更新世含綠色火成岩之混同層（代表大陸與島弧間之縫合線）(E3)']
];
GeoLegendIndex.Stratum25 = [
    ['0010', '三峽群及其相當地層', '砂岩，頁岩', '中新世晚期', 'Ms'],
    ['0011', '三峽群及其相當地層', '玄武岩質凝灰岩及岩流', '中新世晚期', 'tu'],
    ['0020', '大南灣層，米崙層', '泥岩，粉砂岩，砂岩及礫石', '更新世', 'Q1'],
    ['0041', '大港口層，奇美層', '頁岩，粉砂岩，砂岩', '中新世晚期－上新世', 'MPs'],
    ['0042', '大港口層，奇美層', '礫岩', '中新世晚期－上新世', 'MPc'],
    ['0080', '西村層，新高層', '千枚岩，板岩，夾砂岩', '始新世', 'Eh'],
    ['0090', '利吉層，墾丁層', '泥岩夾各類外來岩塊', '上新世－更新世', 'PQl'],
    ['0100', '卓蘭層及其相當地層', '砂岩，泥岩，頁岩', '上新世', 'P2'],
    ['0101', '卓蘭層及其相當地層', '石灰岩', '上新世', 'ls'],
    ['0120', '野柳群及其相當地層', '砂岩，頁岩', '中新世早期', 'My'],
    ['0121', '野柳群及其相當地層', '玄武岩質凝灰岩及岩流', '中新世早期', 'tu'],
    ['0130', '瑞芳群及其相當地層', '砂岩，頁岩', '中新世中期', 'Mj'],
    ['0131', '瑞芳群及其相當地層', '玄武岩質凝灰岩及岩流', '中新世中期', 'tu'],
    ['0132', '瑞芳群及其相當地層', '石灰岩', '中新世中期', 'ls'],
    ['0140', '錦水頁岩及其相當地層', '頁岩，砂質頁岩，泥岩', '上新世', 'P1'],
    ['0161', '頭嵙山層及其相當地層', '砂岩，泥岩，頁岩', '上新世－更新世', 'PQs'],
    ['0162', '頭嵙山層及其相當地層', '礫岩', '上新世－更新世', 'PQc'],
    ['1110', '大桶山層', '硬頁岩，砂頁岩，砂岩', '漸新世－中新世', 'OM2'],
    ['1111', '大桶山層', '火山岩', '漸新世－中新世', 'v'],
    ['1230', '四稜砂岩', '石英岩，板岩，煤質頁岩', '始新世－漸新世', 'EO'],
    ['1340', '卑南山礫岩', '礫岩', '上新世－更新世', 'PQp'],
    ['1420', '恆春石灰岩', '石灰岩礁', '更新世', 'Q2'],
    ['1490', '乾溝層', '硬頁岩，板岩，千枚岩', '漸新世－中新世', 'OM1'],
    ['1530', '都巒山層', '集塊岩，凝灰質砂岩', '中新世早期', 'Mt'],
    ['1535', '都巒山層', '石灰岩', '中新世早期', 'ls'],
    ['1660', '澳底層', '砂岩，頁岩，煤質頁岩', '漸新世－中新世', 'OM3'],
    ['1730', '廬山層', '硬頁岩，板岩，千枚岩', '中新世', 'Ml'],
    ['1731', '廬山層', '火山岩', '中新世', 'v'],
    ['5023', '大南澳片岩', '混合岩', '古生代晚期－中生代', 'PM2'],
    ['5024', '大南澳片岩', '黑色片岩', '古生代晚期－中生代', 'PM5'],
    ['5025', '大南澳片岩', '黑色片岩，綠色片岩，矽質片岩', '古生代晚期－中生代', 'PM4'],
    ['5026', '大南澳片岩', '變質石灰岩', '古生代晚期－中生代', 'PM3'],
    ['6020', '沖積層', 'null', '現代', 'Q6'],
    ['6041', '隆起珊瑚礁', '石灰岩礁', '現代', 'Q5'],
    ['6050', '紅土臺地堆積', '紅土，礫石，土，砂', '更新世', 'Q3'],
    ['6060', '臺地堆積', '礫石，土，砂', '更新世', 'Q4'],
    ['7010', '安山岩', '安山岩', '更新世', 'α4'],
    ['7030', '玄武岩', '玄武岩', '更新世', 'β'],
    ['7062', '安山岩質碎屑岩', '安山岩質碎屑岩', '中新世', 'α2'],
    ['7063', '安山岩質碎屑岩', '安山岩質碎屑岩', '更新世', 'α3'],
    ['7095', '石英斑岩', '石英斑岩', '先第三紀', 'γ'],
    ['7901', '輝長岩，橄欖岩，玄武岩，蛇紋岩，集塊岩（外來岩塊為主）', '輝長岩，橄欖岩，玄武岩，蛇紋岩，集塊岩（外來岩塊為主）', '時代不詳', 'ω1'],
    ['9020', '蛇紋岩及基性火成岩', '蛇紋岩及基性火成岩', '先第三紀', 'ω2']

];
GeoLegendIndex.Stratum = [
    ['0060', '眉溪砂岩', '厚層細粒砂岩夾硬頁岩', '始新世(?)─漸新世(?)', 'Ms'],
    ['1070', '大南灣層', '泥岩，粉砂岩，頁岩及砂岩互層，夾礫石層', '更新世', 'Tn'],
    ['1020', '八里灣層', '薄層砂岩及頁岩互層，泥岩', '上新世－更新世', 'Pw'],
    ['1021', '八里灣層', '安山岩質崩移岩塊', '上新世早期－更新世早期', 'b'],
    ['1022', '八里灣層', '砂岩', '上新世晚期－更新世早期', 's'],
    ['1023', '八里灣層', '泥岩夾礫岩', '上新世早期－更新世早期', 'c'],
    ['1024', '八里灣層', '礫岩', '上新世早期－更新世早期', 'Pls'],
    ['1025', '八里灣層水璉礫岩段', '礫岩', '上新世－更新世', 'Pws'],
    ['1030', '十八重溪層', '板岩與薄層砂岩或粉砂岩互層', '始新世', 'Sp'],
    ['1040', '三錐層', '石英雲母片岩，千枚岩，雲母石英岩及綠色片岩', '古生代或中生代', 'Sh'],
    ['1050', '上福基砂岩', '白色砂岩夾頁岩', '中新世', 'Sf'],
    ['1060', '大社層', '厚層泥岩間夾砂岩與礫岩岭', '更新世', 'Ts'],
    ['1061', '大社層', '鳳山石灰岩，生物泥粒岩或粒泥岩及生物泥礫岩或礫泥岩', '更新世', 'Tsf'],
    ['1080', '大禹嶺層', '板岩、千枚岩及變質砂岩', '中新世', 'Ty'],
    ['1110', '大桶山層', '硬頁岩夾泥質砂岩', '漸新世', 'Tt'],
    ['1111', '大桶山層', '安山岩質凝灰岩', '漸新世', 'tu'],
    ['1130', '大寮層', '塊狀砂岩及頁岩', '中新世', 'Tl'],
    ['1132', '大寮層', '玄武岩質凝灰岩及岩流', '中新世', 'tu'],
    ['1135', '大寮層', '塊狀砂岩', '中新世', 'ss'],
    ['1140', '中嶺層', '硬頁岩或板岩，偶夾薄層變質砂岩', '始新世', 'Cl'],
    ['1150', '中壢層', '紅土，礫石，砂及粘土', '更新世', 'Ch'],
    ['1160', '五指山層', '砂岩及頁岩互層，夾礫石質砂岩', '漸新世', 'Wc'],
    ['1170', '巴陵層', '硬頁岩，板岩夾砂岩', '漸新世', 'Pl'],
    ['1171', '巴陵層', '凝灰岩及安山岩質岩流', '漸新世', 'α'],
    ['1180', '木山層', '砂岩及頁岩互層，含煤層', '中新世', 'Ms'],
    ['1190', '出磺坑層', '砂岩及頁岩互層', '中新世', 'Ch'],
    ['1200', '六龜層', '礫岩、砂岩、砂質頁岩和泥岩', '更新世', 'Lk'],
    ['1210', '北寮層', '塊狀砂岩夾頁岩', '中新世', 'Pe'],
    ['1211', '北寮砂岩', '砂岩夾薄層頁岩', '中新世', 'Pl'],
    ['1212', '北寮頁岩', '頁岩和砂質頁岩', '上新世─更新世', 'Pa'],
    ['1220', '古亭坑層', '泥岩', '上新世─更新世', 'Gt'],
    ['1221', '古亭坑層', '半屏山石灰岩，生物泥粒岩及礁灰岩體', '上新世─更新世', 'Gtp'],
    ['1222', '古亭坑層', '高雄石灰岩，生物粒泥岩及礁灰岩體', '上新世─更新世', 'Gtk'],
    ['1224', '古亭坑層', '砂岩', '上新世─更新世', 's'],
    ['1225', '古亭坑層', 'alt：砂泥岩互層', '中新世晚期至更新世', 'alt'],
    ['1226', '古亭坑層', 'gtc：雞南山透鏡體，厚層砂岩、砂泥岩互層、礫岩及石灰岩', '中新世晚期至更新世', 'Gtc'],
    ['1227', '古亭坑層', 'gtl：龍船透鏡體，厚層砂岩及砂泥岩互層', '中新世晚期至更新世', 'Gtl'],
    ['1230', '四稜砂岩', '厚層或塊狀白色中至極粗粒石英質砂岩或礫岩及硬頁岩', '漸新世', 'Sl'],
    ['1240', '四道溝層', '珊瑚礁、藻類礁、紅壤', '上新世－更新世', 'St'],
    ['1260', '玉里層', '變質砂岩，斑點片岩', '古生代或中生代', 'Yl'],
    ['1261', '玉里層虎頭山段', '石英雲母片岩夾薄層綠色片岩', '古生代晚期－中生代（？）', 'Ylh'],
    ['1262', '玉里層紅葉段', '雲母片岩、千枚岩夾綠色片岩', '古生代晚期－中生代（？）', 'Yly'],
    ['1263', '玉里層瑞穗段', '斑點片岩夾薄層綠色片岩與蛇紋岩岩塊', '古生代晚期－中生代（？）', 'Ylr'],
    ['1270', '石底層', '砂岩及頁岩互層，含煤層', '中新世', 'St'],
    ['1271', '石底層', '塊狀白砂岩', '中新世', 'ss'],
    ['1280', '旭溫泉層', '珊瑚礁、藻類礁、紅壤', '上新世－更新世', 'Hw'],
    ['1290', '米崙礫岩', '礫石、砂及泥', '更新世', 'Ml'],
    ['1300', '西村層', '硬頁岩與變質砂岩之薄互層', '始新世', 'Ht'],
    ['1310', '利吉層', '泥岩夾有各種不同的外來岩塊', '更新世晚期', 'Lc'],
    ['1311', '利吉層', '所夾之石灰岩', '中新世─晚更新世', 'lm'],
    ['1312', '利吉層', '所夾之安山岩', '中新世─晚更新世', 'an'],
    ['1313', '利吉層', '所夾之砂岩', '中新世─晚更新世', 'ss'],
    ['1315', '利吉層', '所夾之玄武岩', '中新世─晚更新世', 'b'],
    ['1316', '利吉層', '所夾之蛇紋岩', '中新世─晚更新世', 'sp'],
    ['1317', '利吉層', '所夾之輝長岩', '中新世─晚更新世', 'gb'],
    ['1320', '牡丹層', '頁岩和薄砂頁岩互層，夾有厚層砂礫岩透鏡體', '中新世中晚期－晚期', 'Mt'],
    ['1321', '牡丹層石門礫岩', '砂質礫岩', '中新世中晚期－晚期', 'Mtk'],
    ['1322', '牡丹層里龍山砂岩', '厚層砂岩間夾礫岩', '中新世中晚期－晚期', 'Mtl'],
    ['1323', '牡丹層獅子頭砂岩', '砂岩，底部含礫', '中新世中晚期－晚期', 'Mts'],
    ['1324', '牡丹層樂水砂岩', '厚層砂岩及砂頁岩互層', '中新世中晚期－晚期', 'Mtg'],
    ['1340', '卑南山礫岩', '礫岩夾砂岩', '晚更新世', 'Pn'],
    ['1350', '店子湖層', '紅土，礫石，砂及砂與粉砂之透鏡體', '更新世', 'Tz'],
    ['1360', '東坑層', '砂岩及頁岩互層，含煤層', '中新世', 'Te'],
    ['1370', '林口層', '礫石及砂，夾砂及粉砂凸鏡體', '更新世', 'Lk'],
    ['1371', '林口層', '紅土及砂', '更新世', 'lt'],
    ['1380', '南莊層', '砂岩及頁岩互層，含煤層', '中新世', 'Nc'],
    ['1381', '南莊層', '玄武岩質凝灰岩及岩流', '中新世', 'tu'],
    ['1390', '南港層', '塊狀砂岩，粉砂岩及頁岩', '中新世', 'Nk'],
    ['1391', '南港層', '玄武岩質凝灰岩', '中新世', 'tu'],
    ['1395', '南港層', '塊狀砂岩夾頁岩', '中新世', 'ss'],
    ['1400', '南勢崙砂岩', '厚層砂岩、泥質砂岩間夾有厚層的薄砂、頁岩互層，及厚層炭質頁岩夾砂岩層', '上新世', 'Ns'],
    ['1410', '南蘇澳層', '板岩、厚層變質砂岩與板岩之互層', '始新世－漸新世', 'Ns'],
    ['1421', '恆春石灰岩（石灰岩）', '顆粒石灰岩及黏結石灰岩', '更新世', 'Hcl'],
    ['1422', '恆春石灰岩（粉砂岩）', '粉砂岩及泥岩', '更新世', 'Hcs'],
    ['1430', '桂竹林層', '砂岩及頁岩互層', '中新世', 'Kc'],
    ['1431', '桂竹林層二鬮段', '砂岩及砂質頁岩互層', '中新世', 'Kce'],
    ['1432', '桂竹林層十六份頁岩段', '頁岩', '中新世─上新世', 'Kcs'],
    ['1433', '桂竹林層大埔段', '砂岩及頁岩', '中新世', 'Kct'],
    ['1434', '桂竹林層大窩砂岩段', '泥質砂岩，砂岩及頁岩互層', '中新世－上新世', 'Kct'],
    ['1435', '桂竹林層魚藤坪砂岩段', '泥質砂岩，粉砂岩及頁岩', '中新世－上新世', 'Kcy'],
    ['1436', '桂竹林層關刀山砂岩段', '塊狀砂岩，粉砂岩及頁岩', '中新世－上新世', 'Kck'],
    ['1440', '桃園層', '紅土，礫石，砂及粘土', '更新世', 'Ty'],
    ['1450', '竹頭崎層', '泥質砂岩、泥質砂岩與頁岩互層', '上新世', 'Ct'],
    ['1451', '琉球嶼石灰岩', '珊瑚礁，貝類及有孔蟲等遺骸', '更新世中期－晚期', 'Ll'],
    ['1452', '琉球嶼泥岩', '泥岩，夾少許薄層粉砂岩', '上新世', 'Lm'],
    ['1470', '蚊子坑層', '硬頁岩夾泥質砂岩', '漸新世', 'Wt'],
    ['1480', '馬鞍山層', '泥岩及粉砂岩和頁岩互層', '上新世早期－更新世早期', 'Ma'],
    ['1500', '崙山層', '板岩', '中生代（？）', 'Ls'],
    ['1521', '茅埔頁岩', '頁岩夾薄層砂岩', '上新世', 'Mp'],
    ['1530', '都鑾山層', '火山岩流，火山角礫岩與再積性火山碎屑岩', '中新世－上新世', 'Th'],
    ['1531', '都鑾山層石門火山角礫岩', '火山熔岩流與火山角礫岩', '中新世－上新世', 'Tsm'],
    ['1533', '都鑾山層石梯坪凝灰岩', '火山角礫岩，凝灰岩與中酸凝灰岩', '中新世－上新世', 'Tst'],
    ['1534', '都鑾山層鱉溪段', '再積性火山碎屑岩，凝灰質砂岩與石灰岩質礫岩', '中新世－上新世', 'Tph'],
    ['1540', '港口石灰岩', '抱球藻、有孔蟲與珊瑚石灰岩', '上新世', 'Kk'],
    ['1550', '黑岩山層', '板岩、千枚岩、變質砂岩及變質石灰岩', '始新世', 'Hs'],
    ['1570', '達見砂岩', '厚層塊狀白色中至粗粒石英砂岩及板岩互層，夾綠色岩', '始新世(?)', 'Tc'],
    ['1580', '壽山石灰岩', '珊瑚石灰岩岩塊', '更新世', 'Ss'],
    ['1590', '碧綠層', '千枚岩、變質砂岩及變質燧石', '中生代晚期－古新世（？）', 'Pl'],
    ['1600', '碧靈頁岩', '頁岩夾砂岩', '中新世', 'Pi'],
    ['1610', '舞鶴礫岩', '礫岩、砂與紅土', '更新世晚期', 'Wh'],
    ['1620', '蓋仔寮頁岩', '頁岩，夾薄層砂岩', '上新世', 'Kz'],
    ['1631', '潮州層', '板岩偶夾透鏡狀砂岩體', '中新世中期', 'Ccs'],
    ['1632', '潮州層', '厚層變質砂岩', '中新世', 's'],
    ['1640', '隘寮腳層', '粉砂岩和頁岩薄互層', '上新世', 'Al'],
    ['1641', '隘寮腳層', '所夾之石灰岩', '上新世', 'null'],
    ['1650', '墾丁層', '泥岩及各種外來岩塊', '中新世晚期－更新世', 'Kt'],
    ['1660', '澳底層', '砂岩，頁岩互層', '中新世', 'At'],
    ['1661', '澳底層枋腳段', '砂岩及頁岩，白砂岩含煤層', '中新世', 'Atf'],
    ['1662', '澳底層媽崗段', '砂岩及頁岩', '中新世', 'Atm'],
    ['1670', '蕃薯寮層', '砂岩及頁岩互層與泥岩', '上新世', 'Fs'],
    ['1691', '頭嵙山層', '砂岩、粉砂岩、頁岩之互層，偶夾薄層礫岩', '更新世', 'Tk1'],
    ['1692', '頭嵙山層', '礫岩，間夾薄層泥質粉砂岩', '更新世', 'Tk2'],
    ['1693', '頭嵙山層火炎山礫岩段', '礫石夾砂岩之透鏡體', '更新世', 'Tkh'],
    ['1694', '頭嵙山層香山段', '砂岩、泥岩、砂頁岩互層', '更新世', 'TKs'],
    ['1700', '龍洞砂岩', '石英岩，礫岩', '漸新世', 'Lt'],
    ['1710', '嶺口礫岩', '厚層礫岩與泥岩互層，偶夾席狀或透鏡狀砂岩', '更新世', 'Lk'],
    ['1720', '鵝鑾鼻層', '紅土含砂及礫', '更新世', 'Op'],
    ['1730', '廬山層', '板岩、硬頁岩，夾薄層變質砂岩及變質砂岩與板岩薄互層', '中新世早期至中期', 'Ls'],
    ['1732', '廬山層', '厚層變質砂岩', '中新世', 's'],
    ['1733', '廬山層仁澤段', '硬頁岩、硬頁岩與變質砂岩之薄互層', '中新世中期', 'Lsj'],
    ['1734', '廬山層清水湖段', '板岩或千枚岩，偶夾薄層變質砂岩', '中新世中期', 'Lsc'],
    ['1735', '廬山層清水湖段', '厚層變質砂岩，偶夾薄層板岩', '中新世中期', 'Lscs'],
    ['1740', '蘇澳層', '板岩及硬頁岩，偶夾薄層變質砂岩', '中新世', 'Sa'],
    ['1751', '鹽水坑頁岩', '塊狀頁岩，偶夾薄層粉砂岩', '上新世', 'Ys'],
    ['1760', '觀音山層', '砂岩及泥岩互層，上部夾礫岩層', '更新世', 'Ky'],
    ['1761', '觀音山砂岩', '砂岩及頁岩', '中新世', 'Ky'],
    ['1770', '湖西層', '砂質泥岩、海貝化石', '更新世', 'Hs'],
    ['1780', '小門嶼層', '石灰岩、鐵石英砂岩', '更新世', 'Sm'],
    ['1791', '澎湖層', '玄武岩', '中新世', 'Phb'],
    ['1792', '澎湖層', '砂岩、泥岩、砂泥岩薄互層', '中新世', 'Phs'],
    ['1793', '澎湖層', '火山凝灰角礫岩', '中新世', 'Pht'],
    ['1800', '福隆園層', '砂岩及頁岩', '中新世', 'Fl'],
    ['1810', '猴洞坑層', '粉砂岩及頁岩', '中新世', 'Hd'],
    ['1820', '石門村層', '厚層細粒砂岩，頁岩及砂、頁岩互層', '中新世', 'Sm'],
    ['1831', '大坑層炭寮地段', '厚層頁岩夾粉砂岩，砂頁岩互層', '中新世', 'Tnt'],
    ['1832', '大坑層十四股段', '粉紅色細至中粒石英砂岩夾粉砂岩、頁岩互層', '中新世', 'Tns'],
    ['1840', '水長流層', '硬頁岩與板岩', '漸新世', 'Sc'],
    ['1850', '白冷層', '石英質砂岩、板岩', '始新世', 'Ep'],
    ['1851', '白冷層梅子林段', '厚層石英砂岩夾硬頁岩', '漸新世', 'Plm'],
    ['1852', '白冷層裡冷段', '砂岩，板岩互層', '漸新世', 'Pll'],
    ['1853', '白冷層東卯段', '厚層塊狀白色中至粗粒石英砂岩及板岩互層', '漸新世', 'Plt'],
    ['1854', '白冷層', '厚層硬頁岩', '始新世─漸新世', 'Pls'],
    ['1855', '白冷層上段', '厚層變質砂岩，夾板岩及碳質頁岩', '早期至中期始新世', 'Plu'],
    ['1856', '白冷層中段', '板岩、變質砂岩與板岩互層', '早期至中期始新世', 'Plm'],
    ['1857', '白冷層下段', '厚層石英岩及變質砂岩、夾板岩及變質凝灰質砂岩', '早期至中期始新世', 'Pll'],
    ['1880', '紅花子層', '厚層細砂岩或粉砂岩、細砂岩及粉砂岩厚互層', '中新世', 'Hh'],
    ['1891', '三民頁岩', '頁岩及頁岩夾薄層粉砂岩', '中新世', 'Si'],
    ['1901', '樟山層上段', '硬頁岩偶夾薄層砂岩', '中新世', 'Csu'],
    ['1902', '樟山層下段', '板岩偶夾薄層砂岩', '中新世', 'Csl'],
    ['1910', '汶水層', '砂岩與頁岩互層', '漸新世─中新世', 'Ws'],
    ['1920', '粗窟層', '薄至厚層粉泥質砂岩與硬頁岩互層', '漸新世', 'Tsk'],
    ['1930', '深坑砂岩', '厚砂岩及頁岩，含化石富集層', '中新世', 'Sk'],
    ['1940', '樟湖坑頁岩', '厚層頁岩夾薄砂岩', '中新世', 'Ch'],
    ['1950', '石門層', '厚層砂岩及頁岩，偶夾薄互層與化石富集層', '中新世', 'Sm'],
    ['1960', '炭寮地頁岩', '厚層頁岩偶夾薄層砂岩', '中新世', 'Tl'],
    ['1970', '十四股層', '砂岩及頁岩薄互層，夾數層厚砂岩', '始新世─中新世', 'Ss'],
    ['1980', '粗坑層', '頁岩夾砂岩，含凝灰質透鏡體與海綠石層', '始新世─漸新世', 'Ts'],
    ['1990', '佳陽層', '板岩夾薄層粉砂岩', '始新世(?)', 'Cy'],
    ['2000', '玉山主山層', '石英岩質砂岩、硬頁岩及其互層', '始新世─漸新世', 'Ys'],
    ['2010', '六雙層', '粉砂岩、砂岩與頁岩互層', '更新世', 'Lh'],
    ['2020', '二重溪層', '泥岩、砂岩、砂質頁岩及薄層粗砂岩夾薄層礫岩', '更新世', 'Ec'],
    ['2030', '崁下寮層', '泥岩及砂質頁岩', '更新世', 'Kh'],
    ['2031', '崁下寮層', '所夾之珊瑚石灰岩', '更新世', 'null'],
    ['2040', '六重溪層', '粉砂岩、砂質頁岩及泥質砂岩', '上新世－更新世', 'Lu'],
    ['2050', '沄水溪層', '頁岩、砂質頁岩', '上新世', 'Yh'],
    ['2051', '沄水溪層', '所夾之石灰岩', '上新世', 'null'],
    ['2060', '玉井頁岩', '泥岩夾砂岩', '更新世', 'Yc'],
    ['2071', '崎頂層大坑尾段', '砂岩夾頁岩', '更新世', 'Cit'],
    ['2072', '崎頂層過嶺段', '砂岩及頁岩互層', '更新世', 'Ciu'],
    ['2073', '崎頂層岡子林段', '泥岩夾砂岩', '更新世', 'Cik'],
    ['2074', '崎頂層上段', '厚層砂岩，夾薄層泥岩', '更新世', 'Ciu'],
    ['2075', '崎頂層下段', '砂泥岩互層夾石灰岩', '更新世', 'Cil'],
    ['2076', '崎頂層下段', '砂泥岩互層夾石灰岩', '更新世', 'lm'],
    ['2080', '鳥嘴層', '泥質砂岩、砂質頁岩及厚砂岩組成，偶夾鈣質結核', '上新世', 'Nt'],
    ['2090', '中崙層', '頁岩，砂質頁岩', '中新世至上新世', 'Cn'],
    ['2110', '眉溪砂岩', '厚層變質砂岩與薄層板岩的互層', '中新世早期至中期', 'Mh'],
    ['2120', '金門層', '砂岩，夾黏土及礫', '早期第三紀－中新世', 'Km'],
    ['2130', '古樓層', '板岩、變質砂岩夾石灰岩', '始新世', 'Gl'],
    ['2141', '臺南層', '（砂嘴及砂灘沉積物）：砂', '全新世', 'Tf-sb'],
    ['2142', '臺南層', '（三角洲沉積物）：以砂為主偶夾薄泥', '全新世', 'Tf-dd'],
    ['2143', '臺南層', '（潟湖沉積物）：以泥及粉砂為主', '全新世', 'Tf-ld'],
    ['2150', '紅水坑礫岩', '礫岩，夾砂岩透鏡體', '更新世', 'Hk'],
    ['2160', '大岡山石灰岩', '珊瑚礁石灰岩', '更新世', 'Tg'],
    ['2170', '烏山層', '厚層砂岩與薄層頁岩互層', '中新世晚期至上新世早期', 'Wu'],
    ['4011', '小蘭嶼安山岩', '凝灰角礫岩與後火山堆積', '上新世－更新世', 'sla'],
    ['4012', '小蘭嶼安山岩', '黑雲母－角閃石安山岩熔岩流', '上新世－更新世', 'slb'],
    ['4020', '楓樹山角閃岩', '角閃岩或角閃石片岩', '古生代晚期－中生代', 'Fs'],
    ['4031', '綠島安山岩阿眉山火山角礫岩', '以玄武岩及基性安山岩為主之火山角礫岩，夾雜凝灰角礫岩及凝灰岩', '上新世－更新世', 'lta'],
    ['4032', '綠島安山岩牛子山安山岩', '角閃石安山岩', '上新世－更新世', 'ltb'],
    ['4033', '綠島安山岩公館安山岩', '黑雲母－角閃石安山岩', '上新世－更新世', 'ltc'],
    ['4034', '綠島安山岩火燒山安山岩', '角閃石安山岩', '上新世－更新世', 'ltd'],
    ['4041', '蘭嶼安山岩龍頭岩火山角礫岩', '以輝石－角閃石安山岩為主的火山角礫岩', '上新世－更新世', 'lya'],
    ['4042', '蘭嶼安山岩東清安山岩', '角閃石－輝石安山岩熔岩流', '上新世－更新世', 'lyb'],
    ['4043', '蘭嶼安山岩饅頭山安山岩', '角閃石安山岩熔岩流', '上新世－更新世', 'lyc'],
    ['4044', '蘭嶼安山岩雙獅岩火山角礫岩', '以角閃石－輝石安山岩為主的火山角礫岩', '上新世－更新世', 'lyd'],
    ['4050', '花嶼火山雜岩', '變質安山岩、玄武岩質岩脈、流紋岩質岩脈、石英安山岩質岩脈、火山碎屑沉積岩', '中生代', 'Hvc'],
    ['4060', '烈嶼玄武岩', '玄武岩質熔岩流', '中新世', 'Ly'],
    ['4070', '田埔花崗岩', '細粒花崗岩', '早期白堊紀', 'Tpu'],
    ['4080', '斗門花崗岩', '花崗岩，含鐵鎂質包體', '早期白堊紀', 'Dm'],
    ['5010', '九曲大理岩', '層狀大理岩', '晚古生代至中生代（？）', 'Cu'],
    ['5030', '天長大理岩', '透鏡狀大理岩體', '中生代晚期－古新世（？）', 'Tc'],
    ['5040', '白楊片岩', '綠色片岩、矽質片岩、層狀大理岩', '晚古生代至中生代（？）', 'Py'],
    ['5041', '白楊片岩', '變質基性岩透鏡體', '古生代晚期－中生代（？）', 'Pyb'],
    ['5042', '白楊片岩', '所夾之硬綠泥石岩透鏡體', '晚古生代至中生代（？）', 'chd'],
    ['5050', '谷園片岩', '千枚岩、雲母片岩、石英雲母片岩', '古生代晚期－中生代（？）', 'Ky'],
    ['5060', '東澳片岩', '石墨片岩或石英雲母片岩', '古生代晚期', 'Ta'],
    ['5061', '東澳片岩', '大理岩', '古生代晚期', 'Tam'],
    ['5062', '東澳片岩', '角閃岩', '古生代晚期', 'Taa'],
    ['5070', '武塔片岩', '石墨片岩與石英雲母片岩', '二疊紀', 'Wt'],
    ['5071', '武塔片岩', '大理岩與綠泥石片岩', '二疊紀', 'Wtm'],
    ['5072', '武塔片岩', '綠泥石片岩', '二疊紀', 'Wtc'],
    ['5073', '武塔片岩', '變質燧石層與石英片岩', '二疊紀', 'Wtq'],
    ['5080', '南澳嶺片岩', '石英片岩或副片麻岩', '中生代', 'Na'],
    ['5090', '飯包尖山片麻岩', '片麻岩', '中生代晚期', 'Fp'],
    ['5100', '源頭山片麻岩', '片麻岩及變質似花岡岩類', '白堊紀', 'Yt'],
    ['5110', '漢本大理岩', '厚層層狀大理岩', '古生代', 'Hp'],
    ['5120', '馬里層', '厚層變質砂岩', '始新世或更早', 'MI'],
    ['5130', '紅葉層', '黑色板岩偶夾變質砂岩', '始新世或更早', 'Hy'],
    ['5131', '紅葉層', '所夾之輝綠岩脈', '始新世或更早', 'd'],
    ['5140', '開南岡片麻岩', '片麻岩', '晚古生代至中生代（？）', 'Kg'],
    ['5150', '得克利片麻岩', '片麻岩及花崗片麻岩', '晚古生代至中生代（？）', 'Tr'],
    ['5160', '成功片麻岩', '英雲閃長岩質片麻岩，含角閃岩脈', '早期白堊紀', 'Cg'],
    ['5170', '太武山花崗片麻岩', '花崗片麻岩', '早期白堊紀', 'Tws'],
    ['5180', '金龜山片岩', '白雲母石英片岩', '古生代－早期白堊紀', 'Ki'],
    ['5190', '虎頭山片岩', '石英片岩、石英岩及雲母石英片岩', '古生代晚期至中生代(？)', 'Hu'],
    ['5200', '森榮片岩', '雲母片岩與雲母石英片岩及綠泥石片岩', '古生代晚期至中生代(？)', 'Sj'],
    ['5201', '森榮片岩', '所夾之變質基性岩(mb)', '古生代晚期至中生代(？)', 'mb'],
    ['5210', '瑞穗片岩', '納長石雲母片岩與綠泥石片岩', '古生代晚期至中生代(？)', 'Js'],
    ['5211', '瑞穗片岩', '所夾之蛇紋岩(sp)', '古生代晚期至中生代(？)', 'sp'],
    ['5220', '紅葉片岩', '石英雲母片岩、石英片岩', '古生代晚期至中生代(？)', 'Hn'],
    ['5230', '大觀片岩', '糜嶺岩化的石英雲母片岩及雲母片岩', '古生代晚期至中生代(？)', 'Dg'],
    ['5231', '大觀片岩', '所夾之變質基性岩(mb)', '古生代晚期至中生代(？)', 'mb'],
    ['5232', '大觀片岩', '所夾之大理岩(m)', '古生代晚期至中生代(？)', 'm'],
    ['5240', '高嶺片岩', '石英雲母片岩與雲母片岩及綠泥石片岩', '古生代晚期至中生代(？)', 'Ka'],
    ['5241', '高嶺片岩', '所夾之蛇紋岩(sp)', '古生代晚期至中生代(？)', 'sp'],
    ['5242', '高嶺片岩', '所夾之大理岩(m)', '古生代晚期至中生代(？)', 'm'],
    ['5250', '望溪大理岩', '厚層大理岩，夾綠泥石片岩與變質燧石', '古生代晚期至中生代(？)', 'Wi'],
    ['6010', '砂丘', '砂', '全新世', 's'],
    ['6011', '古砂丘', '砂，粉砂', '全新世', 'so'],
    ['6020', '沖積層', '礫石，砂及粘土', '全新世', 'a'],
    ['6021', '沖積層及崖錐堆積層', '礫石、砂、泥', '全新世', 'a'],
    ['6022', '沖積層', '氾濫平原堆積，以泥為主', '全新世晚期至現代', 'a-f'],
    ['6023', '沖積層', '河道、舊河道，舊河口堆積，以砂及礫石為主', '全新世晚期至現代', 'a-ch'],
    ['6024', '外海砂洲', '中至細砂', '全新世晚期至現代', 'o'],
    ['6040', '珊瑚礁', '珊瑚礁', '全新世', 'c'],
    ['6041', '隆起珊瑚礁', '珊瑚礁、砂及礫', '晚更新世', 'r'],
    ['6050', '紅土臺地', '紅土，礫石，砂及黏土', '更新世', 'l'],
    ['6051', '紅土礫石層', '紅土化之礫石，砂及泥', '更新世', 'g'],
    ['6060', '臺地堆積層', '砂，礫石及泥', '全新世', 't'],
    ['6061', '海相階地堆積層', '砂與礫石', '全新世', 'tm'],
    ['6062', '陸相階地堆積層', '砂與礫石', '全新世', 'tn'],
    ['6063', '臺地堆積層', '礫石、砂、泥及紅土', '更新世', 'tb'],
    ['6064', '盆地堆積層', '礫石、砂、泥及泥炭', '更新世', 'b'],
    ['6070', '山麓緩斜面堆積物', '礫石，砂及黏土', '更新世－全新世', 'ps'],
    ['6110', '泥火山堆積層', '泥岩為主', '全新世', 'amv'],
    ['7005', '火成岩類', '火山岩屑', '更新世', 'vd'],
    ['7010', '火成岩類', '安山岩', '更新世', 'ad'],
    ['701B', '火山岩類', '橄欖石普通輝石安山岩', '更新世', 'aao'],
    ['701C', '火成岩類', '石英安山岩', '更新世', 'da'],
    ['7011', '火山岩類', '紫蘇輝石黑雲母角閃石安山岩', '更新世', 'ahby'],
    ['7012', '火山岩流', '含角閃石兩輝石安山岩', '更新世', 'aph'],
    ['7013', '火山岩流', '含橄欖石角閃石輝石安山岩', '更新世', 'apho'],
    ['7014', '火山岩流', '角閃石安山岩', '更新世', 'ah'],
    ['7015', '火山岩類', '角閃石兩輝石安山岩', '更新世', 'aph'],
    ['7016', '火山岩類', '兩輝石安山岩', '更新世', 'ap'],
    ['7017', '火山岩流', '兩輝石角閃石安山岩', '更新世', 'ahp'],
    ['7018', '火山岩流', '普通輝石角閃石安山岩', '更新世', 'aha'],
    ['7019', '火山岩類', '紫蘇輝石角閃石安山岩', '更新世', 'ahy'],
    ['7030', '火山岩流', '玄武岩', '更新世', 'b'],
    ['7034', '火山岩類', '普通輝石橄欖石玄武岩', '更新世', 'boa'],
    ['7065', '樟山層上段', '玄武岩質火成碎屑岩和熔岩流', '中新世', 'b'],
    ['7081', '火成岩類', '安山岩質集塊岩', '更新世', 'ag'],
    ['7091', '火成岩類', '煌斑岩', '更新世', 'lp'],
    ['7100', '火山岩類', '凝灰角礫岩', '更新世', 'tb'],
    ['7101', '凝灰角礫岩', '上部凝灰角礫岩', '更新世', 'tbu'],
    ['7102', '凝灰角礫岩', '大屯山凝灰角礫岩', '更新世', 'tbt'],
    ['7103', '凝灰角礫岩', '下部凝灰角礫岩', '更新世', 'tbl']
];
GeoLegendIndex.Fault = [
    ['B101', '斷層'],
    ['B102', '掩覆斷層'],
    ['B201', '橫移斷層(箭頭示相對運動方向)'],
    ['B202', '橫移斷層'],
    ['B211', '橫移斷層(箭頭示相對移動方向)'],
    ['B212', '逆衝右向平移斷層'],
    ['B301', '正斷層(短線示降側)'],
    ['B401', '逆斷層(鋸齒示上昇側)'],
    ['B402', '高角度逆斷層'],
    ['B411', '逆斷層(鋸齒示上昇側)'],
    ['B412', '高角度逆斷層'],
    ['B901', '地震斷層(箭頭示水平位移方向,短線示降側,虛線示推測或掩覆部份)']
];
GeoLegendIndex.Fault25 = [
    ['B101', '斷層'],
    ['B102', '掩覆斷層'],
    ['B201', '橫移斷層(箭頭示相對運動方向)'],
    ['B211', '橫移斷層(箭頭示相對移動方向)'],
    ['B301', '正斷層(短線示降側)'],
    ['B401', '逆斷層(鋸齒示上昇側)'],
    ['B411', '逆斷層(鋸齒示上昇側)']
];
GeoLegendIndex.Fault50 = [
    ['B101', '斷層'],
    ['B102', '掩覆斷層'],
    ['B201', '橫移斷層(箭頭示相對運動方向)'],
    ['B211', '橫移斷層(箭頭示相對移動方向)'],
    ['B301', '正斷層(短線示降側)'],
    ['B401', '逆斷層(鋸齒示上昇側)'],
    ['B402', '高角度逆斷層'],
    ['B411', '逆斷層(鋸齒示上昇側)'],
    ['B412', '高角度逆斷層']
];
GeoLegendIndex.Fold = [
    ['C002', '掩覆褶皺'],
    ['C101', '背斜'],
    ['C102', '掩覆褶皺'],
    ['C121', '倒轉背斜'],
    ['C141', '複背斜軸'],
    ['C142', '複背斜軸'],
    ['C301', '向斜'],
    ['C302', '掩覆褶皺'],
    ['C321', '倒轉向斜'],
    ['C341', '複向斜軸'],
    ['C342', '複向斜軸']
];
GeoLegendIndex.Fold50 = [
    ['C101', '背斜'],
    ['C102', '掩覆褶皺'],
    ['C301', '向斜'],
    ['C302', '掩覆褶皺']
];

GeoLegendIndex.CoalSeam = [
    ['E101', '煤層'],
    ['E102', '煤層（虛線示推測部份）']
];
GeoLegendIndex.Attitude = [
    ['A101', '水平岩層'],
    ['A201', '層理之走向及傾斜'],
    ['A301', '倒轉層理之走向及傾斜'],
    ['A401', '層理走向及傾斜'],
    ['A501', '岩脈位態']
];

G.legend = {

};
G.legend.show = function(group, Name, Container) {
    switch (Name) {
        //Geo
        case "ActiveFault":
            G.legend.ActiveFault(Container);
            break;
        case "ActiveFaultBuffer100":
            G.legend.ActiveFaultBuffer(Container);
            break;
        case "Attitude":
            G.legend.Attitude(Container);
            break;
        case "CoalSeam":
            G.legend.line(Container, "#FF0000", "煤層");
            break;
        case "Discontinuity50":
            G.legend.dot_line(Container, "#000", "不連續面", [5, 6]);
            break;
        case "Fault50":
        case "Fault25":
        case "Fault":
            G.legend.line(Container, "#000000", "斷層");
            break;
        case "Fold50":
        case "Fold":
            G.legend.line(Container, "#FF0000", "褶皺");
            break;
        case "Stratum25":
        case "Stratum":
            G.legend.Stratum(Name, Container);
            break;
        case "TectonicElement50":
            G.legend.TectonicElement(Name, Container);
            break;

            //Other
        case "CGPS":
            G.legend.dot(Container, "#E91E63", "GPS連續觀測站");
            break;
        case "DipSlope":
            G.legend.cube(Container, "#F44336", "順向坡");
            break;
        case "Drill":
            G.legend.dot(Container, "#FF5722", "工程地質鑽孔");
            break;
        case "EarthquakeH":
            G.legend.Earthquake(Container);
            break;
        case "HotSpring":
            G.legend.HotSpring(Container);
            break;
        case "MapZone":
            G.legend.cube(Container, "#9E9E9E", "圖幅區域");
            break;
        case "RealEstate":
            G.legend.Houseinfo(Container);
            break;


        case "DebrisFlowDeposition":
            G.legend.cube(Container, "#F44336", "土石流堆積區");
            break;
        case "DebrisFlowFan":
            G.legend.cube(Container, "#673AB7", "土石流扇狀地");
            break;
        case "DebrisFlowTrack":
            G.legend.cube(Container, "#009688", "土石流流動區");
            break;
        case "RockFall":
            G.legend.cube(Container, "#795548", "土石流落石區域");
            break;
        case "RockMassStrength":
            G.legend.RockMassStrength(Container);
            break;
        case "RockMassClassification":
            G.legend.RockMassClassification(Container);
        case "BucketRecord":
            G.legend.BucketRecord(Container);
            break;
        case "Rainfall":
            G.legend.Rainfall(Container);
            break;
        case "Rainfall_IDW":
            G.legend.cube(Container, "#F44336", "雨量站(IDW)");
            // G.legend.Rainfall_IDW(Container);
            break;
    }
}
//通用型
G.legend.dot = function(Container, color, name) {
    var div = {};
    div.dot = L.DomUtil.create('div', 'legend-area', Container);
    div.dot.style.margin = "6px";
    div.dot.style.marginLeft = "20px";
    div.mark = L.DomUtil.create('div', 'fa fa-circle', div.dot);
    div.mark.style.color = color;
    div.word = L.DomUtil.create('span', '', div.dot);
    div.word.style.marginLeft = "20px";
    div.word.textContent = name;
};
G.legend.line = function(Container, color, name) {
    var div = {};
    div.line = L.DomUtil.create('div', 'legend-area', Container);
    div.line.style.margin = "6px";
    div.line.style.marginLeft = "20px";
    div.table = {};
    div.table.table = L.DomUtil.create('table', '', div.line); // div.table.table.textContent = "活動斷層";
    div.table.tr = L.DomUtil.create('tr', '', div.table.table);
    div.table.tr.td1 = L.DomUtil.create('td', 'legend-icon', div.table.tr);
    div.table.tr.td2 = L.DomUtil.create('td', 'legend-word', div.table.tr);
    div.table.tr.mark = L.DomUtil.create('div', '', div.table.tr.td1);
    div.table.tr.mark.innerHTML = "<svg height='20' width='40'>  <line x1='0' y1='13' x2='40' y2='7' style='stroke:" + color + ";stroke-width:2;stroke-linecap:round' /></svg>";
    div.table.tr.word = L.DomUtil.create('span', '', div.table.tr.td2);
    div.table.tr.word.style.marginLeft = "10px";
    div.table.tr.word.textContent = name;
};
G.legend.dot_line = function(Container, color, name, dot) {
    var div = {};
    div.line = L.DomUtil.create('div', 'legend-area', Container);
    div.line.style.margin = "6px";
    div.line.style.marginLeft = "20px";
    div.table = {};
    div.table.table = L.DomUtil.create('table', '', div.line); // div.table.table.textContent = "活動斷層";
    div.table.tr = L.DomUtil.create('tr', '', div.table.table);
    div.table.tr.td1 = L.DomUtil.create('td', 'legend-icon', div.table.tr);
    div.table.tr.td2 = L.DomUtil.create('td', 'legend-word', div.table.tr);
    div.table.tr.mark = L.DomUtil.create('div', '', div.table.tr.td1);
    div.table.tr.mark.innerHTML = "<svg height='20' width='40'>  <line x1='0' y1='13' x2='40' y2='7' style='stroke:" + color + ";stroke-width:2;stroke-linecap:round;stroke-dasharray:" + dot[0] + "," + dot[1] + "' /></svg>";
    div.table.tr.word = L.DomUtil.create('span', '', div.table.tr.td2);
    div.table.tr.word.style.marginLeft = "10px";
    div.table.tr.word.textContent = name;
};
G.legend.cube = function(Container, color, name) {
    var div = {};
    div.cube = L.DomUtil.create('div', 'legend-area', Container);
    div.cube.style.margin = "6px";
    div.cube.style.marginLeft = "15px";
    div.mark = L.DomUtil.create('div', 'legend-pattern', div.cube);
    div.mark.style.backgroundColor = color;
    div.mark.style.opacity = "0.4";
    div.word = L.DomUtil.create('span', '', div.cube);
    div.word.style.marginLeft = "10px";
    div.word.textContent = name;
};
//單一對應
G.legend.ActiveFault = function(Container) {
    var div = {};

    div.RockMassStrength = L.DomUtil.create('div', 'legend-area', Container);
    div.RockMassStrength.style.margin = "6px";
    div.RockMassStrength.style.marginLeft = "20px";

    div.table = {};
    div.table.table = L.DomUtil.create('table', '', div.RockMassStrength);
    // div.table.table.textContent = "活動斷層";

    var ActiveFaultClass = ["第一類", "第二類"];
    var ActiveFaultColor = ["#F44336", "#FFC107"];
    for (var i = 0; i < ActiveFaultClass.length; i++) {
        div.table.tr = L.DomUtil.create('tr', '', div.table.table);
        div.table.tr.td1 = L.DomUtil.create('td', 'legend-icon', div.table.tr);
        div.table.tr.td2 = L.DomUtil.create('td', 'legend-word', div.table.tr);
        div.table.tr.mark = L.DomUtil.create('div', '', div.table.tr.td1);
        div.table.tr.mark.innerHTML = "<svg height='20' width='40'>  <line x1='0' y1='13' x2='40' y2='7' style='stroke:" + ActiveFaultColor[i] + ";stroke-width:2;stroke-linecap:round' /></svg>";

        div.table.tr.word = L.DomUtil.create('span', '', div.table.tr.td2);
        div.table.tr.word.style.marginLeft = "10px";
        div.table.tr.word.textContent = ActiveFaultClass[i];
    }
};
G.legend.ActiveFaultBuffer = function(Container) {
    var div = {};

    div.RockMassStrength = L.DomUtil.create('div', 'legend-area', Container);
    div.RockMassStrength.style.margin = "6px";
    div.RockMassStrength.style.marginLeft = "20px";

    div.table = {};
    div.table.table = L.DomUtil.create('table', '', div.RockMassStrength);
    // div.table.table.textContent = "活動斷層";

    var ActiveFaultClass = ["第一類", "第二類"];
    var ActiveFaultColor = ["#F44336", "#FFC107"];
    for (var i = 0; i < ActiveFaultClass.length; i++) {
        div.table.tr = L.DomUtil.create('tr', '', div.table.table);
        div.table.tr.td1 = L.DomUtil.create('td', 'legend-icon', div.table.tr);
        div.table.tr.td2 = L.DomUtil.create('td', 'legend-word', div.table.tr);
        div.table.tr.mark = L.DomUtil.create('div', '', div.table.tr.td1);
        div.table.tr.mark.innerHTML = "<svg height='20' width='40'>  <line x1='0' y1='13' x2='40' y2='7' style='stroke:" + ActiveFaultColor[i] + ";stroke-width:6;stroke-linecap:round' /></svg>";

        div.table.tr.word = L.DomUtil.create('span', '', div.table.tr.td2);
        div.table.tr.word.style.marginLeft = "10px";
        div.table.tr.word.textContent = ActiveFaultClass[i];
    }
};
G.legend.Attitude = function(Container) {
    var div = {};
    div.attitude = L.DomUtil.create('div', 'legend-area', Container);
    div.attitude.style.margin = "6px";
    div.attitude.style.marginLeft = "10px";
    // div.attitude.textContent = "位態";
    div.table = {};
    div.table.table = L.DomUtil.create('table', '', div.attitude);
    var tableName = ["層理之走向及傾斜", "倒轉層理之走向及傾斜"];
    var tableIcon = ["fa fa-4x geo-icon-A201", "fa fa-4x geo-icon-A301"];
    for (var i = 0; i < tableName.length; i++) {
        div.table.tr = L.DomUtil.create('tr', '', div.table.table);
        div.table.tr.td1 = L.DomUtil.create('td', 'legend-icon', div.table.tr);
        div.table.tr.td2 = L.DomUtil.create('td', 'legend-word', div.table.tr);
        div.table.tr.mark = L.DomUtil.create('div', tableIcon[i], div.table.tr.td1);
        div.table.tr.mark.style.color = "#000";
        div.table.tr.mark.style.transform = "rotate(160deg)";
        div.table.tr.word = L.DomUtil.create('span', '', div.table.tr.td2);
        div.table.tr.word.textContent = tableName[i];
    }
};
G.legend.Earthquake = function(Container) {
    var div = {};
    div.earthquake = L.DomUtil.create('div', 'legend-area', Container);
    div.earthquake.style.margin = "6px";
    div.earthquake.style.marginLeft = "20px";

    div.table1 = {};
    div.table1.table = L.DomUtil.create('table', '', div.earthquake);
    div.table1.table.textContent = LanguageValue.ThemeEarthquakeTime;
    var table1Name = [LanguageValue.ThemeEarthquakeIn1Month, LanguageValue.ThemeEarthquakeIn2Month, LanguageValue.ThemeEarthquakeBefore2Month, LanguageValue.ThemeEarthquakeHistory];
    var table1Color = ["#ef2929", "#FF851B", "#28b62c", "#28b62c"];
    for (var i = 0; i < table1Name.length; i++) {
        div.table1.tr = L.DomUtil.create('tr', '', div.table1.table);
        div.table1.tr.td1 = L.DomUtil.create('td', 'legend-icon', div.table1.tr);
        div.table1.tr.td2 = L.DomUtil.create('td', 'legend-word', div.table1.tr);
        div.table1.tr.mark = L.DomUtil.create('div', 'fa fa-certificate', div.table1.tr.td1);
        div.table1.tr.mark.style.color = table1Color[i];
        div.table1.tr.word = L.DomUtil.create('span', '', div.table1.tr.td2);
        div.table1.tr.word.textContent = table1Name[i];
    }

    div.table2 = {};
    div.table2.table = L.DomUtil.create('table', '', div.earthquake);
    div.table2.table.textContent = LanguageValue.ThemeEarthquakeMagnitude;
    var table2Name = [LanguageValue.ThemeEarthquakeUnder4, "4~5", "5~6", LanguageValue.ThemeEarthquakeUpper6];
    var table2Size = ["fa-2x", "fa-3x", "fa-4x", "fa-5x"];
    for (var j = 0; j < table2Name.length; j++) {
        div.table2.tr = L.DomUtil.create('tr', '', div.table2.table);
        div.table2.tr.td1 = L.DomUtil.create('td', 'legend-icon', div.table2.tr);
        div.table2.tr.td2 = L.DomUtil.create('td', 'legend-word', div.table2.tr);
        div.table2.tr.mark = L.DomUtil.create('div', "fa " + table2Size[j] + " fa-circle legend-earthquake", div.table2.tr.td1);
        div.table2.tr.word = L.DomUtil.create('span', '', div.table2.tr.td2);
        div.table2.tr.word.textContent = table2Name[j];
    }
};
G.legend.Houseinfo = function(Container) {
    var div = {};
    div.earthquake = L.DomUtil.create('div', 'legend-area', Container);
    div.earthquake.style.margin = "6px";
    div.earthquake.style.marginLeft = "20px";
    div.earthquake.textContent = "不動產交易金額";

    div.table = {};
    div.table.table = L.DomUtil.create('table', '', div.earthquake);
    var tableName = ["10萬/坪 以下", "10~20萬/坪", "20~30萬/坪", "30~40萬/坪", "40萬/坪 以上"];
    var tableColor = ["#03A9F4", "#4CAF50", "#CDDC39", "#FF9800", "#F44336"];
    for (var i = 0; i < tableName.length; i++) {
        div.table.tr = L.DomUtil.create('tr', '', div.table.table);
        div.table.tr.td1 = L.DomUtil.create('td', 'legend-icon', div.table.tr);
        div.table.tr.td2 = L.DomUtil.create('td', 'legend-word', div.table.tr);
        div.table.tr.mark = L.DomUtil.create('div', 'cgs-icon-house', div.table.tr.td1);
        div.table.tr.mark.style.color = tableColor[i];
        div.table.tr.word = L.DomUtil.create('span', '', div.table.tr.td2);
        div.table.tr.word.textContent = tableName[i];
    }
};
G.legend.HotSpring = function(Container) {
    var div = {};
    div.HotSpring = L.DomUtil.create('div', 'legend-area', Container);
    div.HotSpring.style.margin = "6px";
    div.HotSpring.style.marginLeft = "20px";
    div.mark = L.DomUtil.create("img", '', div.HotSpring);
    div.mark.src = "/" + LanguageValue.FolderName + "/stylesheets/images/geologics/HotSpring.png";
    div.mark.style.width = "20px";
    div.word = L.DomUtil.create('span', '', div.HotSpring);
    div.word.style.marginLeft = "15px";
    div.word.textContent = "溫泉";
};
G.legend.BucketRecord = function(Container) {
    var div = {};
    div.BucketRecord = L.DomUtil.create('div', 'legend-area', Container);
    div.BucketRecord.style.margin = "6px";
    div.BucketRecord.style.marginLeft = "20px";
    div.word = L.DomUtil.create('span', '', div.BucketRecord);
    div.word.style.marginLeft = "15px";
    // div.word.textContent = "誘卵桶";
};
G.legend.Rainfall = function(Container) {
    var div = {};
    div.Rainfall = L.DomUtil.create('div', 'legend-area', Container);
    div.Rainfall.style.margin = "6px";
    div.Rainfall.style.marginLeft = "20px";
    div.word = L.DomUtil.create('span', '', div.Rainfall);
    div.word.style.marginLeft = "15px";
};
G.legend.Rainfall_IDW = function(Container) {
    var div = {};
    div.Rainfall = L.DomUtil.create('div', 'legend-area', Container);
    div.Rainfall.style.margin = "6px";
    div.Rainfall.style.marginLeft = "20px";
    div.word = L.DomUtil.create('span', '', div.Rainfall);
    div.word.style.marginLeft = "15px";
};
G.legend.RockMassStrength = function(Container) {
    var div = {};
    div.RockMassStrength = L.DomUtil.create('div', 'legend-area', Container);
    div.RockMassStrength.style.margin = "6px";
    div.RockMassStrength.style.marginLeft = "20px";

    div.table = {};
    div.table.table = L.DomUtil.create('table', '', div.RockMassStrength);
    div.table.table.textContent = "岩體強度";
    var RockClass = ["A", "B", "C", "D", "E", "F", "G", "H", "null"];
    var RockColor = ['rgb(233, 255, 190)', 'rgb(233, 255, 190)', 'rgb(255, 255, 190)', 'rgb(255, 255, 190)', 'rgb(255, 234, 190)', 'rgb(255, 234, 190)', 'rgb(255, 234, 190)', 'rgb(255, 190, 190)', '#aaa'];
    for (var i = 0; i < RockClass.length; i++) {
        div.table.tr = L.DomUtil.create('tr', '', div.table.table);
        div.table.tr.td1 = L.DomUtil.create('td', 'legend-icon', div.table.tr);
        div.table.tr.td2 = L.DomUtil.create('td', 'legend-word', div.table.tr);
        div.table.tr.mark = L.DomUtil.create('div', 'legend-pattern', div.table.tr.td1);
        div.table.tr.mark.style.backgroundColor = RockColor[i];
        div.table.tr.mark.style.opacity = "0.6";
        div.table.tr.word = L.DomUtil.create('span', '', div.table.tr.td2);
        div.table.tr.word.textContent = RockClass[i];
    }
};
G.legend.RockMassClassification = function(Container) {
    var div = {};
    div.RockMassClassification = L.DomUtil.create('div', 'legend-area', Container);
    div.RockMassClassification.style.margin = "6px";
    div.RockMassClassification.style.marginLeft = "20px";

    div.table = {};
    div.table.table = L.DomUtil.create('table', '', div.RockMassClassification);
    div.table.table.textContent = "岩體分類";
    var RockClass = ["I", "II", "III", "IV", "V", "VI", "VII", "null"];
    var RockColor = ['rgb(168, 168, 0)', 'rgb(112, 168, 0)', 'rgb(209, 255, 115)', 'rgb(233, 255, 190)', 'rgb(255, 255, 190)', 'rgb(255, 234, 190)', 'rgb(255, 190, 190)', '#aaa'];
    for (var i = 0; i < RockClass.length; i++) {
        div.table.tr = L.DomUtil.create('tr', '', div.table.table);
        div.table.tr.td1 = L.DomUtil.create('td', 'legend-icon', div.table.tr);
        div.table.tr.td2 = L.DomUtil.create('td', 'legend-word', div.table.tr);
        div.table.tr.mark = L.DomUtil.create('div', 'legend-pattern', div.table.tr.td1);
        div.table.tr.mark.style.backgroundColor = RockColor[i];
        div.table.tr.mark.style.opacity = "0.6";
        div.table.tr.word = L.DomUtil.create('span', '', div.table.tr.td2);
        div.table.tr.word.textContent = RockClass[i];
    }
};
G.legend.Stratum = function(Name, Container) {
    var legendArea = L.DomUtil.create('div', 'legend-area', Container);
    if (GeoLegendIndex[Name] && GeoLegendIndex[Name].length > 0) {
        var geo_table = L.DomUtil.create('table', '', legendArea);
        GeoLegendIndex[Name].forEach(function(number, index3) {
            G.color.patternList.forEach(function(imgList, index) {
                imgList.forEach(function(img, index2) {
                    if (number[0] == img) {
                        var tr = L.DomUtil.create('tr', '', geo_table);
                        var td1 = L.DomUtil.create('td', '', tr);
                        var td2 = L.DomUtil.create('td', 'legend-word', tr);
                        var pattern_geo = L.DomUtil.create('div', 'legend-pattern', td1);
                        pattern_geo.title = "Code: " + number[0] + ", Note: " + number[2] + " (" + number[4] + ")";
                        pattern_geo.style.background = "url('/" + LanguageValue.FolderName + "/stylesheets/images/geologics/Stratum" + index + ".png') center no-repeat";
                        pattern_geo.style.backgroundPosition = '0px ' + -90 * index2 + 'px';
                        var pattern_words = L.DomUtil.create('span', '', td2);
                        pattern_words.textContent = number[1];
                    }
                });
            });
        });
    } else {
        legendArea.textContent = "建置中";
    }
};
G.legend.TectonicElement = function(Name, Container) {
    var legendArea = L.DomUtil.create('div', 'legend-area', Container);
    if (GeoLegendIndex[Name] && GeoLegendIndex[Name].length > 0) {
        var geo_table = L.DomUtil.create('table', '', legendArea);
        GeoLegendIndex[Name].forEach(function(number, index3) {
            G.color.patternList.forEach(function(imgList, index) {
                imgList.forEach(function(img, index2) {
                    if (number[0] == img) {
                        var tr = L.DomUtil.create('tr', '', geo_table);
                        var td1 = L.DomUtil.create('td', '', tr);
                        var td2 = L.DomUtil.create('td', 'legend-word', tr);
                        var pattern_geo = L.DomUtil.create('div', 'legend-pattern', td1);
                        pattern_geo.title = "Code:" + number[0];
                        pattern_geo.style.background = "url('/" + LanguageValue.FolderName + "/stylesheets/images/geologics/Stratum" + index + ".png') center no-repeat";
                        pattern_geo.style.backgroundPosition = '0px ' + -90 * index2 + 'px';
                        var pattern_words = L.DomUtil.create('span', '', td2);
                        pattern_words.textContent = number[1];
                    }
                });
            });
        });
    } else {
        legendArea.textContent = "建置中";
    }
};
var CreateFormBtnIndex = {};
CreateFormBtnIndex.buttonList = {}, CreateFormBtnIndex.ColorList = {}, CreateFormBtnIndex.LayerListName = {}, CreateFormBtnIndex.LayerList = {}, CreateFormBtnIndex.LayerList.GeoList = {},
    CreateFormBtnIndex.LayerList.TileList = {}, CreateFormBtnIndex.LayerList.SensitiveareaList = {}, CreateFormBtnIndex.LayerList.LiquefactionList = {};

// https://tympanus.net/codrops/2013/10/15/animated-checkboxes-and-radio-buttons-with-svg
CreateFormBtnIndex.buttonList = [ //增加中文選項
    ["Geo", "地質資料圖層"],
    ["Tile", "圖臺底圖圖層"],
    ["Sensitivearea", "地質敏感區圖層"],
    ["Liquefaction", "土壤液化圖層"],
    ["StreetView", "街景服務"],
    ["GeologuComprass", "地質羅盤串接服務"],
    ["Extra", "雨量地震串接服務"],
    ["Sorting", "圖層排序服務"],
    ["Draw", "手繪圖層服務"],
    ["Io", "匯入/匯出圖層服務"],
    ["Map3d", "三維立體服務"]
    // ["Feedback","民眾信箱"],
    // ["Information","其他訊息"],
];

CreateFormBtnIndex.ColorList = [ //設定三種顏色


];
CreateFormBtnIndex.LayerListName = [
        ["GeoList", "地質資料圖層"],
        ["TileList", "圖臺底圖服務"],
        ["SensitiveareaList", "地質敏感區圖層"],
        ["LiquefactionList", "土壤液化圖層"]
    ]
    //圖示使用眼睛開關，連動第一部分，有才出現
CreateFormBtnIndex.LayerList.GeoList = [ //增加中文選項
    ['MapZone', LanguageValue.GeoSheet],
    ['TectonicElement50', LanguageValue.GeoTectionicElement50],
    ['Stratum25', LanguageValue.GeoStratum25],
    ['Stratum', LanguageValue.GeoStratum],
    ['ActiveFault', LanguageValue.GeoActiveFault],
    ['ActiveFaultBuffer100', LanguageValue.GeoActiveFaultBuffer100],
    ['DipSlope', LanguageValue.GeoDipSlope],
    ['Discontinuity50', LanguageValue.GeoDiscontinuity50],
    ['Fault50', LanguageValue.GeoFault50],
    ['Fault25', LanguageValue.GeoFault25],
    ['Fault', LanguageValue.GeoFault],
    ['Fold50', LanguageValue.GeoFold50],
    ['Fold', LanguageValue.GeoFold],
    ['CoalSeam', LanguageValue.GeoCoalSeam],
    ['Drill', LanguageValue.GeoDrill],
    ['CGPS', LanguageValue.GeoCGPS],
    ['HotSpring', LanguageValue.GeoHotSpring],
    ['RealEstate', LanguageValue.GeoRealEstate],
    ['Attitude', LanguageValue.GeoAttitude],
    ['Earthquake', LanguageValue.GeoEarthquakeH],
    ['DebrisFlowDeposition', LanguageValue.GeoDebrisFlowDeposition],
    ['DebrisFlowFan', LanguageValue.GeoDebrisFlowFan],
    ['DebrisFlowTrack', LanguageValue.GeoDebrisFlowTrack],
    ['RockFall', LanguageValue.GeoRockFall]
];

// var TileThemeList = [

// ];
CreateFormBtnIndex.LayerList.TileList = [
    ['google', 'Google'], //街景+正射影像
    ['nlsc', '通用電子地圖'], //街景+正射影像
    ['osm', 'OpenStreetMap'], //街景+正射影像

    ['TileTaiwanH1', LanguageValue.TileTaiwanH1],
    ['TileTaiwanH2', LanguageValue.TileTaiwanH2],
    ['TileTaiwanH3', LanguageValue.TileTaiwanH3],
    ['TileTaiwanH4', LanguageValue.TileTaiwanH4],
    ['TileTaiwanH5', LanguageValue.TileTaiwanH5],
    ['TileTaiwanH6', LanguageValue.TileTaiwanH6],
    ['TileTaiwanH7', LanguageValue.TileTaiwanH7],
    ['TileTaiwanH8', LanguageValue.TileTaiwanH8],
    ['TileTaiwanH9', LanguageValue.TileTaiwanH9],
    ['TileTaiwanH10', LanguageValue.TileTaiwanH10],
    ['TileTaiwanH11', LanguageValue.TileTaiwanH11],
    ['TileTaiwanH12', LanguageValue.TileTaiwanH12],
    ['TileTaiwanH13', LanguageValue.TileTaiwanH13],
    ['TileTaiwanH14', LanguageValue.TileTaiwanH14],
    ['TileTaiwanH15', LanguageValue.TileTaiwanH15],
    ['TileTaiwanH16', LanguageValue.TileTaiwanH16],
    ['TileTaiwanH17', LanguageValue.TileTaiwanH17],
    ['TileTaiwanH18', LanguageValue.TileTaiwanH18],
    ['TileTaiwanH19', LanguageValue.TileTaiwanH19],
    ['TileTaiwanH20', LanguageValue.TileTaiwanH20],
    ['TileTaiwanH21', LanguageValue.TileTaiwanH21],
    ['TileTaiwanH22', LanguageValue.TileTaiwanH22],

    ['TileNLSC2', LanguageValue.TileNLSC2],
    ['TileNLSCLandUse', LanguageValue.TileNLSCLandUse],
    ['TileNLSC5', LanguageValue.TileNLSC5],
    ['TileNLSC6', LanguageValue.TileNLSC6],
    ['TileNLSC8', LanguageValue.TileNLSC8],
    ['TileNLSC7', LanguageValue.TileNLSC7],
];

CreateFormBtnIndex.LayerList.SensitiveareaList = [ //使用類別
    ['SA_L', LanguageValue.GeoSA_L],
    ['SA_G', LanguageValue.GeoSA_G],
    ['SA_H', LanguageValue.GeoSA_H],
    ['SA_F', LanguageValue.GeoSA_F]
    // ['open', '政府開放資料']
];

CreateFormBtnIndex.LayerList.LiquefactionList = [ //使用縣市分別
    ['Taipei', '臺北盆地(臺北市及新北市)'],
    ['Hsinchu', '新竹縣及新竹市'],
    ['Tainan', '臺南市'],
    ['Kaohsiung', '高雄市'],
    ['Pinton', '屏東縣'],
    ['Yilan', '宜蘭縣'],
    ['Taichung', '臺中市'],
    ['Chunhua', '彰化縣'],
    ['Yunlin', '雲林縣'],
    ['Chiayi', '嘉義縣']
    // ['open', '政府開放資料']
];
