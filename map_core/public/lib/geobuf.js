(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.geobuf = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = decode;

var keys, values, lengths, dim, e;

var geometryTypes = ['Point', 'MultiPoint', 'LineString', 'MultiLineString',
                      'Polygon', 'MultiPolygon', 'GeometryCollection'];

function decode(pbf) {
    dim = 2;
    e = Math.pow(10, 6);
    lengths = null;

    keys = [];
    values = [];
    var obj = pbf.readFields(readDataField, {});
    keys = null;

    return obj;
}

function readDataField(tag, obj, pbf) {
    if (tag === 1) keys.push(pbf.readString());
    else if (tag === 2) dim = pbf.readVarint();
    else if (tag === 3) e = Math.pow(10, pbf.readVarint());

    else if (tag === 4) readFeatureCollection(pbf, obj);
    else if (tag === 5) readFeature(pbf, obj);
    else if (tag === 6) readGeometry(pbf, obj);
}

function readFeatureCollection(pbf, obj) {
    obj.type = 'FeatureCollection';
    obj.features = [];
    return pbf.readMessage(readFeatureCollectionField, obj);
}

function readFeature(pbf, feature) {
    feature.type = 'Feature';
    return pbf.readMessage(readFeatureField, feature);
}

function readGeometry(pbf, geom) {
    return pbf.readMessage(readGeometryField, geom);
}

function readFeatureCollectionField(tag, obj, pbf) {
    if (tag === 1) obj.features.push(readFeature(pbf, {}));

    else if (tag === 13) values.push(readValue(pbf));
    else if (tag === 15) readProps(pbf, obj);
}

function readFeatureField(tag, feature, pbf) {
    if (tag === 1) feature.geometry = readGeometry(pbf, {});

    else if (tag === 11) feature.id = pbf.readString();
    else if (tag === 12) feature.id = pbf.readSVarint();

    else if (tag === 13) values.push(readValue(pbf));
    else if (tag === 14) feature.properties = readProps(pbf, {});
    else if (tag === 15) readProps(pbf, feature);
}

function readGeometryField(tag, geom, pbf) {
    if (tag === 1) geom.type = geometryTypes[pbf.readVarint()];

    else if (tag === 2) lengths = pbf.readPackedVarint();
    else if (tag === 3) readCoords(geom, pbf, geom.type);
    else if (tag === 4) {
        geom.geometries = geom.geometries || [];
        geom.geometries.push(readGeometry(pbf, {}));
    }
    else if (tag === 13) values.push(readValue(pbf));
    else if (tag === 15) readProps(pbf, geom);
}

function readCoords(geom, pbf, type) {
    if (type === 'Point') geom.coordinates = readPoint(pbf);
    else if (type === 'MultiPoint') geom.coordinates = readLine(pbf, true);
    else if (type === 'LineString') geom.coordinates = readLine(pbf);
    else if (type === 'MultiLineString') geom.coordinates = readMultiLine(pbf);
    else if (type === 'Polygon') geom.coordinates = readMultiLine(pbf, true);
    else if (type === 'MultiPolygon') geom.coordinates = readMultiPolygon(pbf);
}

function readValue(pbf) {
    var end = pbf.readVarint() + pbf.pos,
        value = null;

    while (pbf.pos < end) {
        var val = pbf.readVarint(),
            tag = val >> 3;

        if (tag === 1) value = pbf.readString();
        else if (tag === 2) value = pbf.readDouble();
        else if (tag === 3) value = pbf.readVarint();
        else if (tag === 4) value = -pbf.readVarint();
        else if (tag === 5) value = pbf.readBoolean();
        else if (tag === 6) value = JSON.parse(pbf.readString());
    }
    return value;
}

function readProps(pbf, props) {
    var end = pbf.readVarint() + pbf.pos;
    while (pbf.pos < end) props[keys[pbf.readVarint()]] = values[pbf.readVarint()];
    values = [];
    return props;
}

function readPoint(pbf) {
    var end = pbf.readVarint() + pbf.pos,
        coords = [];
    while (pbf.pos < end) coords.push(pbf.readSVarint() / e);
    return coords;
}

function readLinePart(pbf, end, len, closed) {
    var i = 0,
        coords = [],
        p, d;

    var prevP = [];
    for (d = 0; d < dim; d++) prevP[d] = 0;

    while (len ? i < len : pbf.pos < end) {
        p = [];
        for (d = 0; d < dim; d++) {
            prevP[d] += pbf.readSVarint();
            p[d] = prevP[d] / e;
        }
        coords.push(p);
        i++;
    }
    if (closed) coords.push(coords[0]);

    return coords;
}

function readLine(pbf) {
    return readLinePart(pbf, pbf.readVarint() + pbf.pos);
}

function readMultiLine(pbf, closed) {
    var end = pbf.readVarint() + pbf.pos;
    if (!lengths) return [readLinePart(pbf, end, null, closed)];

    var coords = [];
    for (var i = 0; i < lengths.length; i++) coords.push(readLinePart(pbf, end, lengths[i], closed));
    lengths = null;
    return coords;
}

function readMultiPolygon(pbf) {
    var end = pbf.readVarint() + pbf.pos;
    if (!lengths) return [[readLinePart(pbf, end, null, true)]];

    var coords = [];
    var j = 1;
    for (var i = 0; i < lengths[0]; i++) {
        var rings = [];
        for (var k = 0; k < lengths[j]; k++) rings.push(readLinePart(pbf, end, lengths[j + 1 + k], true));
        j += lengths[j] + 1;
        coords.push(rings);
    }
    lengths = null;
    return coords;
}

},{}],2:[function(require,module,exports){
'use strict';

module.exports = encode;

var keys, keysNum, dim, e,
    maxPrecision = 1e6;

var geometryTypes = {
    'Point': 0,
    'MultiPoint': 1,
    'LineString': 2,
    'MultiLineString': 3,
    'Polygon': 4,
    'MultiPolygon': 5,
    'GeometryCollection': 6
};

function encode(obj, pbf) {
    keys = {};
    keysNum = 0;
    dim = 0;
    e = 1;

    analyze(obj);

    e = Math.min(e, maxPrecision);
    var precision = Math.ceil(Math.log(e) / Math.LN10);

    var keysArr = Object.keys(keys);

    for (var i = 0; i < keysArr.length; i++) pbf.writeStringField(1, keysArr[i]);
    if (dim !== 2) pbf.writeVarintField(2, dim);
    if (precision !== 6) pbf.writeVarintField(3, precision);

    if (obj.type === 'FeatureCollection') pbf.writeMessage(4, writeFeatureCollection, obj);
    else if (obj.type === 'Feature') pbf.writeMessage(5, writeFeature, obj);
    else pbf.writeMessage(6, writeGeometry, obj);

    keys = null;

    return pbf.finish();
}

function analyze(obj) {
    var i, key;

    if (obj.type === 'FeatureCollection') {
        for (i = 0; i < obj.features.length; i++) analyze(obj.features[i]);
        for (key in obj) if (key !== 'type' && key !== 'features') saveKey(key);

    } else if (obj.type === 'Feature') {
        analyze(obj.geometry);
        for (key in obj.properties) saveKey(key);
        for (key in obj) {
            if (key !== 'type' && key !== 'id' && key !== 'properties' && key !== 'geometry') saveKey(key);
        }

    } else {
        if (obj.type === 'Point') analyzePoint(obj.coordinates);
        else if (obj.type === 'MultiPoint') analyzePoints(obj.coordinates);
        else if (obj.type === 'GeometryCollection') {
            for (i = 0; i < obj.geometries.length; i++) analyze(obj.geometries[i]);
        }
        else if (obj.type === 'LineString') analyzePoints(obj.coordinates);
        else if (obj.type === 'Polygon' || obj.type === 'MultiLineString') analyzeMultiLine(obj.coordinates);
        else if (obj.type === 'MultiPolygon') {
            for (i = 0; i < obj.coordinates.length; i++) analyzeMultiLine(obj.coordinates[i]);
        }

        for (key in obj) {
            if (key !== 'type' && key !== 'id' && key !== 'coordinates' && key !== 'arcs' &&
                key !== 'geometries' && key !== 'properties') saveKey(key);
        }
    }
}

function analyzeMultiLine(coords) {
    for (var i = 0; i < coords.length; i++) analyzePoints(coords[i]);
}

function analyzePoints(coords) {
    for (var i = 0; i < coords.length; i++) analyzePoint(coords[i]);
}

function analyzePoint(point) {
    dim = Math.max(dim, point.length);

    // find max precision
    for (var i = 0; i < point.length; i++) {
        while (Math.round(point[i] * e) / e !== point[i] && e < maxPrecision) e *= 10;
    }
}

function saveKey(key) {
    if (keys[key] === undefined) keys[key] = keysNum++;
}

function writeFeatureCollection(obj, pbf) {
    for (var i = 0; i < obj.features.length; i++) {
        pbf.writeMessage(1, writeFeature, obj.features[i]);
    }
    writeProps(obj, pbf, true);
}

function writeFeature(feature, pbf) {
    pbf.writeMessage(1, writeGeometry, feature.geometry);

    if (feature.id !== undefined) {
        if (typeof feature.id === 'number' && feature.id % 1 === 0) pbf.writeSVarintField(12, feature.id);
        else pbf.writeStringField(11, feature.id);
    }

    if (feature.properties) writeProps(feature.properties, pbf);
    writeProps(feature, pbf, true);
}

function writeGeometry(geom, pbf) {
    pbf.writeVarintField(1, geometryTypes[geom.type]);

    var coords = geom.coordinates;

    if (geom.type === 'Point') writePoint(coords, pbf);
    else if (geom.type === 'MultiPoint') writeLine(coords, pbf, true);
    else if (geom.type === 'LineString') writeLine(coords, pbf);
    else if (geom.type === 'MultiLineString') writeMultiLine(coords, pbf);
    else if (geom.type === 'Polygon') writeMultiLine(coords, pbf, true);
    else if (geom.type === 'MultiPolygon') writeMultiPolygon(coords, pbf);
    else if (geom.type === 'GeometryCollection') {
        for (var i = 0; i < geom.geometries.length; i++) pbf.writeMessage(4, writeGeometry, geom.geometries[i]);
    }

    writeProps(geom, pbf, true);
}

function writeProps(props, pbf, isCustom) {
    var indexes = [],
        valueIndex = 0;

    for (var key in props) {
        if (isCustom) {
            if (key === 'type' || key === 'id' || key === 'coordinates' || key === 'arcs' ||
                key === 'geometries' || key === 'properties') continue;
            else if (props.type === 'FeatureCollection') {
                if (key === 'features') continue;
            } else if (props.type === 'Feature') {
                if (key === 'id' || key === 'properties' || key === 'geometry') continue;
            }
        }
        pbf.writeMessage(13, writeValue, props[key]);
        indexes.push(keys[key]);
        indexes.push(valueIndex++);
    }
    pbf.writePackedVarint(isCustom ? 15 : 14, indexes);
}

function writeValue(value, pbf) {
    var type = typeof value;

    if (type === 'string') pbf.writeStringField(1, value);
    else if (type === 'boolean') pbf.writeBooleanField(5, value);
    else if (type === 'object') pbf.writeStringField(6, JSON.stringify(value));
    else if (type === 'number') {
        if (value % 1 !== 0) pbf.writeDoubleField(2, value);
        else if (value >= 0) pbf.writeVarintField(3, value);
        else pbf.writeVarintField(4, -value);
    }
}

function writePoint(point, pbf) {
    var coords = [];
    for (var i = 0; i < dim; i++) coords.push(Math.round(point[i] * e));
    pbf.writePackedSVarint(3, coords);
}

function writeLine(line, pbf) {
    var coords = [];
    populateLine(coords, line);
    pbf.writePackedSVarint(3, coords);
}

function writeMultiLine(lines, pbf, closed) {
    var len = lines.length,
        i;
    if (len !== 1) {
        var lengths = [];
        for (i = 0; i < len; i++) lengths.push(lines[i].length - (closed ? 1 : 0));
        pbf.writePackedVarint(2, lengths);
        // TODO faster with custom writeMessage?
    }
    var coords = [];
    for (i = 0; i < len; i++) populateLine(coords, lines[i], closed);
    pbf.writePackedSVarint(3, coords);
}

function writeMultiPolygon(polygons, pbf) {
    var len = polygons.length,
        i, j;
    if (len !== 1 || polygons[0].length !== 1) {
        var lengths = [len];
        for (i = 0; i < len; i++) {
            lengths.push(polygons[i].length);
            for (j = 0; j < polygons[i].length; j++) lengths.push(polygons[i][j].length - 1);
        }
        pbf.writePackedVarint(2, lengths);
    }

    var coords = [];
    for (i = 0; i < len; i++) {
        for (j = 0; j < polygons[i].length; j++) populateLine(coords, polygons[i][j], true);
    }
    pbf.writePackedSVarint(3, coords);
}

function populateLine(coords, line, closed) {
    var i, j,
        len = line.length - (closed ? 1 : 0);
    for (i = 0; i < len; i++) {
        for (j = 0; j < dim; j++) coords.push(Math.round((line[i][j] - (i ? line[i - 1][j] : 0)) * e));
    }
}

},{}],3:[function(require,module,exports){
'use strict';

exports.encode = require('./encode');
exports.decode = require('./decode');

},{"./decode":1,"./encode":2}]},{},[3])(3)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImRlY29kZS5qcyIsImVuY29kZS5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBkZWNvZGU7XG5cbnZhciBrZXlzLCB2YWx1ZXMsIGxlbmd0aHMsIGRpbSwgZTtcblxudmFyIGdlb21ldHJ5VHlwZXMgPSBbJ1BvaW50JywgJ011bHRpUG9pbnQnLCAnTGluZVN0cmluZycsICdNdWx0aUxpbmVTdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICdQb2x5Z29uJywgJ011bHRpUG9seWdvbicsICdHZW9tZXRyeUNvbGxlY3Rpb24nXTtcblxuZnVuY3Rpb24gZGVjb2RlKHBiZikge1xuICAgIGRpbSA9IDI7XG4gICAgZSA9IE1hdGgucG93KDEwLCA2KTtcbiAgICBsZW5ndGhzID0gbnVsbDtcblxuICAgIGtleXMgPSBbXTtcbiAgICB2YWx1ZXMgPSBbXTtcbiAgICB2YXIgb2JqID0gcGJmLnJlYWRGaWVsZHMocmVhZERhdGFGaWVsZCwge30pO1xuICAgIGtleXMgPSBudWxsO1xuXG4gICAgcmV0dXJuIG9iajtcbn1cblxuZnVuY3Rpb24gcmVhZERhdGFGaWVsZCh0YWcsIG9iaiwgcGJmKSB7XG4gICAgaWYgKHRhZyA9PT0gMSkga2V5cy5wdXNoKHBiZi5yZWFkU3RyaW5nKCkpO1xuICAgIGVsc2UgaWYgKHRhZyA9PT0gMikgZGltID0gcGJmLnJlYWRWYXJpbnQoKTtcbiAgICBlbHNlIGlmICh0YWcgPT09IDMpIGUgPSBNYXRoLnBvdygxMCwgcGJmLnJlYWRWYXJpbnQoKSk7XG5cbiAgICBlbHNlIGlmICh0YWcgPT09IDQpIHJlYWRGZWF0dXJlQ29sbGVjdGlvbihwYmYsIG9iaik7XG4gICAgZWxzZSBpZiAodGFnID09PSA1KSByZWFkRmVhdHVyZShwYmYsIG9iaik7XG4gICAgZWxzZSBpZiAodGFnID09PSA2KSByZWFkR2VvbWV0cnkocGJmLCBvYmopO1xufVxuXG5mdW5jdGlvbiByZWFkRmVhdHVyZUNvbGxlY3Rpb24ocGJmLCBvYmopIHtcbiAgICBvYmoudHlwZSA9ICdGZWF0dXJlQ29sbGVjdGlvbic7XG4gICAgb2JqLmZlYXR1cmVzID0gW107XG4gICAgcmV0dXJuIHBiZi5yZWFkTWVzc2FnZShyZWFkRmVhdHVyZUNvbGxlY3Rpb25GaWVsZCwgb2JqKTtcbn1cblxuZnVuY3Rpb24gcmVhZEZlYXR1cmUocGJmLCBmZWF0dXJlKSB7XG4gICAgZmVhdHVyZS50eXBlID0gJ0ZlYXR1cmUnO1xuICAgIHJldHVybiBwYmYucmVhZE1lc3NhZ2UocmVhZEZlYXR1cmVGaWVsZCwgZmVhdHVyZSk7XG59XG5cbmZ1bmN0aW9uIHJlYWRHZW9tZXRyeShwYmYsIGdlb20pIHtcbiAgICByZXR1cm4gcGJmLnJlYWRNZXNzYWdlKHJlYWRHZW9tZXRyeUZpZWxkLCBnZW9tKTtcbn1cblxuZnVuY3Rpb24gcmVhZEZlYXR1cmVDb2xsZWN0aW9uRmllbGQodGFnLCBvYmosIHBiZikge1xuICAgIGlmICh0YWcgPT09IDEpIG9iai5mZWF0dXJlcy5wdXNoKHJlYWRGZWF0dXJlKHBiZiwge30pKTtcblxuICAgIGVsc2UgaWYgKHRhZyA9PT0gMTMpIHZhbHVlcy5wdXNoKHJlYWRWYWx1ZShwYmYpKTtcbiAgICBlbHNlIGlmICh0YWcgPT09IDE1KSByZWFkUHJvcHMocGJmLCBvYmopO1xufVxuXG5mdW5jdGlvbiByZWFkRmVhdHVyZUZpZWxkKHRhZywgZmVhdHVyZSwgcGJmKSB7XG4gICAgaWYgKHRhZyA9PT0gMSkgZmVhdHVyZS5nZW9tZXRyeSA9IHJlYWRHZW9tZXRyeShwYmYsIHt9KTtcblxuICAgIGVsc2UgaWYgKHRhZyA9PT0gMTEpIGZlYXR1cmUuaWQgPSBwYmYucmVhZFN0cmluZygpO1xuICAgIGVsc2UgaWYgKHRhZyA9PT0gMTIpIGZlYXR1cmUuaWQgPSBwYmYucmVhZFNWYXJpbnQoKTtcblxuICAgIGVsc2UgaWYgKHRhZyA9PT0gMTMpIHZhbHVlcy5wdXNoKHJlYWRWYWx1ZShwYmYpKTtcbiAgICBlbHNlIGlmICh0YWcgPT09IDE0KSBmZWF0dXJlLnByb3BlcnRpZXMgPSByZWFkUHJvcHMocGJmLCB7fSk7XG4gICAgZWxzZSBpZiAodGFnID09PSAxNSkgcmVhZFByb3BzKHBiZiwgZmVhdHVyZSk7XG59XG5cbmZ1bmN0aW9uIHJlYWRHZW9tZXRyeUZpZWxkKHRhZywgZ2VvbSwgcGJmKSB7XG4gICAgaWYgKHRhZyA9PT0gMSkgZ2VvbS50eXBlID0gZ2VvbWV0cnlUeXBlc1twYmYucmVhZFZhcmludCgpXTtcblxuICAgIGVsc2UgaWYgKHRhZyA9PT0gMikgbGVuZ3RocyA9IHBiZi5yZWFkUGFja2VkVmFyaW50KCk7XG4gICAgZWxzZSBpZiAodGFnID09PSAzKSByZWFkQ29vcmRzKGdlb20sIHBiZiwgZ2VvbS50eXBlKTtcbiAgICBlbHNlIGlmICh0YWcgPT09IDQpIHtcbiAgICAgICAgZ2VvbS5nZW9tZXRyaWVzID0gZ2VvbS5nZW9tZXRyaWVzIHx8IFtdO1xuICAgICAgICBnZW9tLmdlb21ldHJpZXMucHVzaChyZWFkR2VvbWV0cnkocGJmLCB7fSkpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0YWcgPT09IDEzKSB2YWx1ZXMucHVzaChyZWFkVmFsdWUocGJmKSk7XG4gICAgZWxzZSBpZiAodGFnID09PSAxNSkgcmVhZFByb3BzKHBiZiwgZ2VvbSk7XG59XG5cbmZ1bmN0aW9uIHJlYWRDb29yZHMoZ2VvbSwgcGJmLCB0eXBlKSB7XG4gICAgaWYgKHR5cGUgPT09ICdQb2ludCcpIGdlb20uY29vcmRpbmF0ZXMgPSByZWFkUG9pbnQocGJmKTtcbiAgICBlbHNlIGlmICh0eXBlID09PSAnTXVsdGlQb2ludCcpIGdlb20uY29vcmRpbmF0ZXMgPSByZWFkTGluZShwYmYsIHRydWUpO1xuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdMaW5lU3RyaW5nJykgZ2VvbS5jb29yZGluYXRlcyA9IHJlYWRMaW5lKHBiZik7XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ011bHRpTGluZVN0cmluZycpIGdlb20uY29vcmRpbmF0ZXMgPSByZWFkTXVsdGlMaW5lKHBiZik7XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ1BvbHlnb24nKSBnZW9tLmNvb3JkaW5hdGVzID0gcmVhZE11bHRpTGluZShwYmYsIHRydWUpO1xuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdNdWx0aVBvbHlnb24nKSBnZW9tLmNvb3JkaW5hdGVzID0gcmVhZE11bHRpUG9seWdvbihwYmYpO1xufVxuXG5mdW5jdGlvbiByZWFkVmFsdWUocGJmKSB7XG4gICAgdmFyIGVuZCA9IHBiZi5yZWFkVmFyaW50KCkgKyBwYmYucG9zLFxuICAgICAgICB2YWx1ZSA9IG51bGw7XG5cbiAgICB3aGlsZSAocGJmLnBvcyA8IGVuZCkge1xuICAgICAgICB2YXIgdmFsID0gcGJmLnJlYWRWYXJpbnQoKSxcbiAgICAgICAgICAgIHRhZyA9IHZhbCA+PiAzO1xuXG4gICAgICAgIGlmICh0YWcgPT09IDEpIHZhbHVlID0gcGJmLnJlYWRTdHJpbmcoKTtcbiAgICAgICAgZWxzZSBpZiAodGFnID09PSAyKSB2YWx1ZSA9IHBiZi5yZWFkRG91YmxlKCk7XG4gICAgICAgIGVsc2UgaWYgKHRhZyA9PT0gMykgdmFsdWUgPSBwYmYucmVhZFZhcmludCgpO1xuICAgICAgICBlbHNlIGlmICh0YWcgPT09IDQpIHZhbHVlID0gLXBiZi5yZWFkVmFyaW50KCk7XG4gICAgICAgIGVsc2UgaWYgKHRhZyA9PT0gNSkgdmFsdWUgPSBwYmYucmVhZEJvb2xlYW4oKTtcbiAgICAgICAgZWxzZSBpZiAodGFnID09PSA2KSB2YWx1ZSA9IEpTT04ucGFyc2UocGJmLnJlYWRTdHJpbmcoKSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gcmVhZFByb3BzKHBiZiwgcHJvcHMpIHtcbiAgICB2YXIgZW5kID0gcGJmLnJlYWRWYXJpbnQoKSArIHBiZi5wb3M7XG4gICAgd2hpbGUgKHBiZi5wb3MgPCBlbmQpIHByb3BzW2tleXNbcGJmLnJlYWRWYXJpbnQoKV1dID0gdmFsdWVzW3BiZi5yZWFkVmFyaW50KCldO1xuICAgIHZhbHVlcyA9IFtdO1xuICAgIHJldHVybiBwcm9wcztcbn1cblxuZnVuY3Rpb24gcmVhZFBvaW50KHBiZikge1xuICAgIHZhciBlbmQgPSBwYmYucmVhZFZhcmludCgpICsgcGJmLnBvcyxcbiAgICAgICAgY29vcmRzID0gW107XG4gICAgd2hpbGUgKHBiZi5wb3MgPCBlbmQpIGNvb3Jkcy5wdXNoKHBiZi5yZWFkU1ZhcmludCgpIC8gZSk7XG4gICAgcmV0dXJuIGNvb3Jkcztcbn1cblxuZnVuY3Rpb24gcmVhZExpbmVQYXJ0KHBiZiwgZW5kLCBsZW4sIGNsb3NlZCkge1xuICAgIHZhciBpID0gMCxcbiAgICAgICAgY29vcmRzID0gW10sXG4gICAgICAgIHAsIGQ7XG5cbiAgICB2YXIgcHJldlAgPSBbXTtcbiAgICBmb3IgKGQgPSAwOyBkIDwgZGltOyBkKyspIHByZXZQW2RdID0gMDtcblxuICAgIHdoaWxlIChsZW4gPyBpIDwgbGVuIDogcGJmLnBvcyA8IGVuZCkge1xuICAgICAgICBwID0gW107XG4gICAgICAgIGZvciAoZCA9IDA7IGQgPCBkaW07IGQrKykge1xuICAgICAgICAgICAgcHJldlBbZF0gKz0gcGJmLnJlYWRTVmFyaW50KCk7XG4gICAgICAgICAgICBwW2RdID0gcHJldlBbZF0gLyBlO1xuICAgICAgICB9XG4gICAgICAgIGNvb3Jkcy5wdXNoKHApO1xuICAgICAgICBpKys7XG4gICAgfVxuICAgIGlmIChjbG9zZWQpIGNvb3Jkcy5wdXNoKGNvb3Jkc1swXSk7XG5cbiAgICByZXR1cm4gY29vcmRzO1xufVxuXG5mdW5jdGlvbiByZWFkTGluZShwYmYpIHtcbiAgICByZXR1cm4gcmVhZExpbmVQYXJ0KHBiZiwgcGJmLnJlYWRWYXJpbnQoKSArIHBiZi5wb3MpO1xufVxuXG5mdW5jdGlvbiByZWFkTXVsdGlMaW5lKHBiZiwgY2xvc2VkKSB7XG4gICAgdmFyIGVuZCA9IHBiZi5yZWFkVmFyaW50KCkgKyBwYmYucG9zO1xuICAgIGlmICghbGVuZ3RocykgcmV0dXJuIFtyZWFkTGluZVBhcnQocGJmLCBlbmQsIG51bGwsIGNsb3NlZCldO1xuXG4gICAgdmFyIGNvb3JkcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3Rocy5sZW5ndGg7IGkrKykgY29vcmRzLnB1c2gocmVhZExpbmVQYXJ0KHBiZiwgZW5kLCBsZW5ndGhzW2ldLCBjbG9zZWQpKTtcbiAgICBsZW5ndGhzID0gbnVsbDtcbiAgICByZXR1cm4gY29vcmRzO1xufVxuXG5mdW5jdGlvbiByZWFkTXVsdGlQb2x5Z29uKHBiZikge1xuICAgIHZhciBlbmQgPSBwYmYucmVhZFZhcmludCgpICsgcGJmLnBvcztcbiAgICBpZiAoIWxlbmd0aHMpIHJldHVybiBbW3JlYWRMaW5lUGFydChwYmYsIGVuZCwgbnVsbCwgdHJ1ZSldXTtcblxuICAgIHZhciBjb29yZHMgPSBbXTtcbiAgICB2YXIgaiA9IDE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGhzWzBdOyBpKyspIHtcbiAgICAgICAgdmFyIHJpbmdzID0gW107XG4gICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgbGVuZ3Roc1tqXTsgaysrKSByaW5ncy5wdXNoKHJlYWRMaW5lUGFydChwYmYsIGVuZCwgbGVuZ3Roc1tqICsgMSArIGtdLCB0cnVlKSk7XG4gICAgICAgIGogKz0gbGVuZ3Roc1tqXSArIDE7XG4gICAgICAgIGNvb3Jkcy5wdXNoKHJpbmdzKTtcbiAgICB9XG4gICAgbGVuZ3RocyA9IG51bGw7XG4gICAgcmV0dXJuIGNvb3Jkcztcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBlbmNvZGU7XG5cbnZhciBrZXlzLCBrZXlzTnVtLCBkaW0sIGUsXG4gICAgbWF4UHJlY2lzaW9uID0gMWU2O1xuXG52YXIgZ2VvbWV0cnlUeXBlcyA9IHtcbiAgICAnUG9pbnQnOiAwLFxuICAgICdNdWx0aVBvaW50JzogMSxcbiAgICAnTGluZVN0cmluZyc6IDIsXG4gICAgJ011bHRpTGluZVN0cmluZyc6IDMsXG4gICAgJ1BvbHlnb24nOiA0LFxuICAgICdNdWx0aVBvbHlnb24nOiA1LFxuICAgICdHZW9tZXRyeUNvbGxlY3Rpb24nOiA2XG59O1xuXG5mdW5jdGlvbiBlbmNvZGUob2JqLCBwYmYpIHtcbiAgICBrZXlzID0ge307XG4gICAga2V5c051bSA9IDA7XG4gICAgZGltID0gMDtcbiAgICBlID0gMTtcblxuICAgIGFuYWx5emUob2JqKTtcblxuICAgIGUgPSBNYXRoLm1pbihlLCBtYXhQcmVjaXNpb24pO1xuICAgIHZhciBwcmVjaXNpb24gPSBNYXRoLmNlaWwoTWF0aC5sb2coZSkgLyBNYXRoLkxOMTApO1xuXG4gICAgdmFyIGtleXNBcnIgPSBPYmplY3Qua2V5cyhrZXlzKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5c0Fyci5sZW5ndGg7IGkrKykgcGJmLndyaXRlU3RyaW5nRmllbGQoMSwga2V5c0FycltpXSk7XG4gICAgaWYgKGRpbSAhPT0gMikgcGJmLndyaXRlVmFyaW50RmllbGQoMiwgZGltKTtcbiAgICBpZiAocHJlY2lzaW9uICE9PSA2KSBwYmYud3JpdGVWYXJpbnRGaWVsZCgzLCBwcmVjaXNpb24pO1xuXG4gICAgaWYgKG9iai50eXBlID09PSAnRmVhdHVyZUNvbGxlY3Rpb24nKSBwYmYud3JpdGVNZXNzYWdlKDQsIHdyaXRlRmVhdHVyZUNvbGxlY3Rpb24sIG9iaik7XG4gICAgZWxzZSBpZiAob2JqLnR5cGUgPT09ICdGZWF0dXJlJykgcGJmLndyaXRlTWVzc2FnZSg1LCB3cml0ZUZlYXR1cmUsIG9iaik7XG4gICAgZWxzZSBwYmYud3JpdGVNZXNzYWdlKDYsIHdyaXRlR2VvbWV0cnksIG9iaik7XG5cbiAgICBrZXlzID0gbnVsbDtcblxuICAgIHJldHVybiBwYmYuZmluaXNoKCk7XG59XG5cbmZ1bmN0aW9uIGFuYWx5emUob2JqKSB7XG4gICAgdmFyIGksIGtleTtcblxuICAgIGlmIChvYmoudHlwZSA9PT0gJ0ZlYXR1cmVDb2xsZWN0aW9uJykge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgb2JqLmZlYXR1cmVzLmxlbmd0aDsgaSsrKSBhbmFseXplKG9iai5mZWF0dXJlc1tpXSk7XG4gICAgICAgIGZvciAoa2V5IGluIG9iaikgaWYgKGtleSAhPT0gJ3R5cGUnICYmIGtleSAhPT0gJ2ZlYXR1cmVzJykgc2F2ZUtleShrZXkpO1xuXG4gICAgfSBlbHNlIGlmIChvYmoudHlwZSA9PT0gJ0ZlYXR1cmUnKSB7XG4gICAgICAgIGFuYWx5emUob2JqLmdlb21ldHJ5KTtcbiAgICAgICAgZm9yIChrZXkgaW4gb2JqLnByb3BlcnRpZXMpIHNhdmVLZXkoa2V5KTtcbiAgICAgICAgZm9yIChrZXkgaW4gb2JqKSB7XG4gICAgICAgICAgICBpZiAoa2V5ICE9PSAndHlwZScgJiYga2V5ICE9PSAnaWQnICYmIGtleSAhPT0gJ3Byb3BlcnRpZXMnICYmIGtleSAhPT0gJ2dlb21ldHJ5Jykgc2F2ZUtleShrZXkpO1xuICAgICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAob2JqLnR5cGUgPT09ICdQb2ludCcpIGFuYWx5emVQb2ludChvYmouY29vcmRpbmF0ZXMpO1xuICAgICAgICBlbHNlIGlmIChvYmoudHlwZSA9PT0gJ011bHRpUG9pbnQnKSBhbmFseXplUG9pbnRzKG9iai5jb29yZGluYXRlcyk7XG4gICAgICAgIGVsc2UgaWYgKG9iai50eXBlID09PSAnR2VvbWV0cnlDb2xsZWN0aW9uJykge1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IG9iai5nZW9tZXRyaWVzLmxlbmd0aDsgaSsrKSBhbmFseXplKG9iai5nZW9tZXRyaWVzW2ldKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvYmoudHlwZSA9PT0gJ0xpbmVTdHJpbmcnKSBhbmFseXplUG9pbnRzKG9iai5jb29yZGluYXRlcyk7XG4gICAgICAgIGVsc2UgaWYgKG9iai50eXBlID09PSAnUG9seWdvbicgfHwgb2JqLnR5cGUgPT09ICdNdWx0aUxpbmVTdHJpbmcnKSBhbmFseXplTXVsdGlMaW5lKG9iai5jb29yZGluYXRlcyk7XG4gICAgICAgIGVsc2UgaWYgKG9iai50eXBlID09PSAnTXVsdGlQb2x5Z29uJykge1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IG9iai5jb29yZGluYXRlcy5sZW5ndGg7IGkrKykgYW5hbHl6ZU11bHRpTGluZShvYmouY29vcmRpbmF0ZXNbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChrZXkgaW4gb2JqKSB7XG4gICAgICAgICAgICBpZiAoa2V5ICE9PSAndHlwZScgJiYga2V5ICE9PSAnaWQnICYmIGtleSAhPT0gJ2Nvb3JkaW5hdGVzJyAmJiBrZXkgIT09ICdhcmNzJyAmJlxuICAgICAgICAgICAgICAgIGtleSAhPT0gJ2dlb21ldHJpZXMnICYmIGtleSAhPT0gJ3Byb3BlcnRpZXMnKSBzYXZlS2V5KGtleSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGFuYWx5emVNdWx0aUxpbmUoY29vcmRzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKyspIGFuYWx5emVQb2ludHMoY29vcmRzW2ldKTtcbn1cblxuZnVuY3Rpb24gYW5hbHl6ZVBvaW50cyhjb29yZHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykgYW5hbHl6ZVBvaW50KGNvb3Jkc1tpXSk7XG59XG5cbmZ1bmN0aW9uIGFuYWx5emVQb2ludChwb2ludCkge1xuICAgIGRpbSA9IE1hdGgubWF4KGRpbSwgcG9pbnQubGVuZ3RoKTtcblxuICAgIC8vIGZpbmQgbWF4IHByZWNpc2lvblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9pbnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgd2hpbGUgKE1hdGgucm91bmQocG9pbnRbaV0gKiBlKSAvIGUgIT09IHBvaW50W2ldICYmIGUgPCBtYXhQcmVjaXNpb24pIGUgKj0gMTA7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzYXZlS2V5KGtleSkge1xuICAgIGlmIChrZXlzW2tleV0gPT09IHVuZGVmaW5lZCkga2V5c1trZXldID0ga2V5c051bSsrO1xufVxuXG5mdW5jdGlvbiB3cml0ZUZlYXR1cmVDb2xsZWN0aW9uKG9iaiwgcGJmKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvYmouZmVhdHVyZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcGJmLndyaXRlTWVzc2FnZSgxLCB3cml0ZUZlYXR1cmUsIG9iai5mZWF0dXJlc1tpXSk7XG4gICAgfVxuICAgIHdyaXRlUHJvcHMob2JqLCBwYmYsIHRydWUpO1xufVxuXG5mdW5jdGlvbiB3cml0ZUZlYXR1cmUoZmVhdHVyZSwgcGJmKSB7XG4gICAgcGJmLndyaXRlTWVzc2FnZSgxLCB3cml0ZUdlb21ldHJ5LCBmZWF0dXJlLmdlb21ldHJ5KTtcblxuICAgIGlmIChmZWF0dXJlLmlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBmZWF0dXJlLmlkID09PSAnbnVtYmVyJyAmJiBmZWF0dXJlLmlkICUgMSA9PT0gMCkgcGJmLndyaXRlU1ZhcmludEZpZWxkKDEyLCBmZWF0dXJlLmlkKTtcbiAgICAgICAgZWxzZSBwYmYud3JpdGVTdHJpbmdGaWVsZCgxMSwgZmVhdHVyZS5pZCk7XG4gICAgfVxuXG4gICAgaWYgKGZlYXR1cmUucHJvcGVydGllcykgd3JpdGVQcm9wcyhmZWF0dXJlLnByb3BlcnRpZXMsIHBiZik7XG4gICAgd3JpdGVQcm9wcyhmZWF0dXJlLCBwYmYsIHRydWUpO1xufVxuXG5mdW5jdGlvbiB3cml0ZUdlb21ldHJ5KGdlb20sIHBiZikge1xuICAgIHBiZi53cml0ZVZhcmludEZpZWxkKDEsIGdlb21ldHJ5VHlwZXNbZ2VvbS50eXBlXSk7XG5cbiAgICB2YXIgY29vcmRzID0gZ2VvbS5jb29yZGluYXRlcztcblxuICAgIGlmIChnZW9tLnR5cGUgPT09ICdQb2ludCcpIHdyaXRlUG9pbnQoY29vcmRzLCBwYmYpO1xuICAgIGVsc2UgaWYgKGdlb20udHlwZSA9PT0gJ011bHRpUG9pbnQnKSB3cml0ZUxpbmUoY29vcmRzLCBwYmYsIHRydWUpO1xuICAgIGVsc2UgaWYgKGdlb20udHlwZSA9PT0gJ0xpbmVTdHJpbmcnKSB3cml0ZUxpbmUoY29vcmRzLCBwYmYpO1xuICAgIGVsc2UgaWYgKGdlb20udHlwZSA9PT0gJ011bHRpTGluZVN0cmluZycpIHdyaXRlTXVsdGlMaW5lKGNvb3JkcywgcGJmKTtcbiAgICBlbHNlIGlmIChnZW9tLnR5cGUgPT09ICdQb2x5Z29uJykgd3JpdGVNdWx0aUxpbmUoY29vcmRzLCBwYmYsIHRydWUpO1xuICAgIGVsc2UgaWYgKGdlb20udHlwZSA9PT0gJ011bHRpUG9seWdvbicpIHdyaXRlTXVsdGlQb2x5Z29uKGNvb3JkcywgcGJmKTtcbiAgICBlbHNlIGlmIChnZW9tLnR5cGUgPT09ICdHZW9tZXRyeUNvbGxlY3Rpb24nKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2VvbS5nZW9tZXRyaWVzLmxlbmd0aDsgaSsrKSBwYmYud3JpdGVNZXNzYWdlKDQsIHdyaXRlR2VvbWV0cnksIGdlb20uZ2VvbWV0cmllc1tpXSk7XG4gICAgfVxuXG4gICAgd3JpdGVQcm9wcyhnZW9tLCBwYmYsIHRydWUpO1xufVxuXG5mdW5jdGlvbiB3cml0ZVByb3BzKHByb3BzLCBwYmYsIGlzQ3VzdG9tKSB7XG4gICAgdmFyIGluZGV4ZXMgPSBbXSxcbiAgICAgICAgdmFsdWVJbmRleCA9IDA7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gcHJvcHMpIHtcbiAgICAgICAgaWYgKGlzQ3VzdG9tKSB7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSAndHlwZScgfHwga2V5ID09PSAnaWQnIHx8IGtleSA9PT0gJ2Nvb3JkaW5hdGVzJyB8fCBrZXkgPT09ICdhcmNzJyB8fFxuICAgICAgICAgICAgICAgIGtleSA9PT0gJ2dlb21ldHJpZXMnIHx8IGtleSA9PT0gJ3Byb3BlcnRpZXMnKSBjb250aW51ZTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHByb3BzLnR5cGUgPT09ICdGZWF0dXJlQ29sbGVjdGlvbicpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSAnZmVhdHVyZXMnKSBjb250aW51ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcHMudHlwZSA9PT0gJ0ZlYXR1cmUnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2lkJyB8fCBrZXkgPT09ICdwcm9wZXJ0aWVzJyB8fCBrZXkgPT09ICdnZW9tZXRyeScpIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHBiZi53cml0ZU1lc3NhZ2UoMTMsIHdyaXRlVmFsdWUsIHByb3BzW2tleV0pO1xuICAgICAgICBpbmRleGVzLnB1c2goa2V5c1trZXldKTtcbiAgICAgICAgaW5kZXhlcy5wdXNoKHZhbHVlSW5kZXgrKyk7XG4gICAgfVxuICAgIHBiZi53cml0ZVBhY2tlZFZhcmludChpc0N1c3RvbSA/IDE1IDogMTQsIGluZGV4ZXMpO1xufVxuXG5mdW5jdGlvbiB3cml0ZVZhbHVlKHZhbHVlLCBwYmYpIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcblxuICAgIGlmICh0eXBlID09PSAnc3RyaW5nJykgcGJmLndyaXRlU3RyaW5nRmllbGQoMSwgdmFsdWUpO1xuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdib29sZWFuJykgcGJmLndyaXRlQm9vbGVhbkZpZWxkKDUsIHZhbHVlKTtcbiAgICBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JykgcGJmLndyaXRlU3RyaW5nRmllbGQoNiwgSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcbiAgICBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAodmFsdWUgJSAxICE9PSAwKSBwYmYud3JpdGVEb3VibGVGaWVsZCgyLCB2YWx1ZSk7XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlID49IDApIHBiZi53cml0ZVZhcmludEZpZWxkKDMsIHZhbHVlKTtcbiAgICAgICAgZWxzZSBwYmYud3JpdGVWYXJpbnRGaWVsZCg0LCAtdmFsdWUpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gd3JpdGVQb2ludChwb2ludCwgcGJmKSB7XG4gICAgdmFyIGNvb3JkcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGltOyBpKyspIGNvb3Jkcy5wdXNoKE1hdGgucm91bmQocG9pbnRbaV0gKiBlKSk7XG4gICAgcGJmLndyaXRlUGFja2VkU1ZhcmludCgzLCBjb29yZHMpO1xufVxuXG5mdW5jdGlvbiB3cml0ZUxpbmUobGluZSwgcGJmKSB7XG4gICAgdmFyIGNvb3JkcyA9IFtdO1xuICAgIHBvcHVsYXRlTGluZShjb29yZHMsIGxpbmUpO1xuICAgIHBiZi53cml0ZVBhY2tlZFNWYXJpbnQoMywgY29vcmRzKTtcbn1cblxuZnVuY3Rpb24gd3JpdGVNdWx0aUxpbmUobGluZXMsIHBiZiwgY2xvc2VkKSB7XG4gICAgdmFyIGxlbiA9IGxpbmVzLmxlbmd0aCxcbiAgICAgICAgaTtcbiAgICBpZiAobGVuICE9PSAxKSB7XG4gICAgICAgIHZhciBsZW5ndGhzID0gW107XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykgbGVuZ3Rocy5wdXNoKGxpbmVzW2ldLmxlbmd0aCAtIChjbG9zZWQgPyAxIDogMCkpO1xuICAgICAgICBwYmYud3JpdGVQYWNrZWRWYXJpbnQoMiwgbGVuZ3Rocyk7XG4gICAgICAgIC8vIFRPRE8gZmFzdGVyIHdpdGggY3VzdG9tIHdyaXRlTWVzc2FnZT9cbiAgICB9XG4gICAgdmFyIGNvb3JkcyA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykgcG9wdWxhdGVMaW5lKGNvb3JkcywgbGluZXNbaV0sIGNsb3NlZCk7XG4gICAgcGJmLndyaXRlUGFja2VkU1ZhcmludCgzLCBjb29yZHMpO1xufVxuXG5mdW5jdGlvbiB3cml0ZU11bHRpUG9seWdvbihwb2x5Z29ucywgcGJmKSB7XG4gICAgdmFyIGxlbiA9IHBvbHlnb25zLmxlbmd0aCxcbiAgICAgICAgaSwgajtcbiAgICBpZiAobGVuICE9PSAxIHx8IHBvbHlnb25zWzBdLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICB2YXIgbGVuZ3RocyA9IFtsZW5dO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGxlbmd0aHMucHVzaChwb2x5Z29uc1tpXS5sZW5ndGgpO1xuICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHBvbHlnb25zW2ldLmxlbmd0aDsgaisrKSBsZW5ndGhzLnB1c2gocG9seWdvbnNbaV1bal0ubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgICAgcGJmLndyaXRlUGFja2VkVmFyaW50KDIsIGxlbmd0aHMpO1xuICAgIH1cblxuICAgIHZhciBjb29yZHMgPSBbXTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IHBvbHlnb25zW2ldLmxlbmd0aDsgaisrKSBwb3B1bGF0ZUxpbmUoY29vcmRzLCBwb2x5Z29uc1tpXVtqXSwgdHJ1ZSk7XG4gICAgfVxuICAgIHBiZi53cml0ZVBhY2tlZFNWYXJpbnQoMywgY29vcmRzKTtcbn1cblxuZnVuY3Rpb24gcG9wdWxhdGVMaW5lKGNvb3JkcywgbGluZSwgY2xvc2VkKSB7XG4gICAgdmFyIGksIGosXG4gICAgICAgIGxlbiA9IGxpbmUubGVuZ3RoIC0gKGNsb3NlZCA/IDEgOiAwKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGRpbTsgaisrKSBjb29yZHMucHVzaChNYXRoLnJvdW5kKChsaW5lW2ldW2pdIC0gKGkgPyBsaW5lW2kgLSAxXVtqXSA6IDApKSAqIGUpKTtcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuZW5jb2RlID0gcmVxdWlyZSgnLi9lbmNvZGUnKTtcbmV4cG9ydHMuZGVjb2RlID0gcmVxdWlyZSgnLi9kZWNvZGUnKTtcbiJdfQ==
