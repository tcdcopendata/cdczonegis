const CachedFs = require('cachedfs');
const fs = new CachedFs();
var path = require('path')

function boundary(type) {
    var jsonPath = path.join(__dirname, '..', '..', 'geojson', 'boundary_' + type + '.geojson');
    var geojson = JSON.parse(fs.readFileSync(jsonPath));
    return geojson;
}

function getSprayRecord() {
    var jsonPath = path.join(__dirname, '..', '..', 'geojson', 'tainanspary2018.json');
    var geojson = JSON.parse(fs.readFileSync(jsonPath));
    return geojson;
}

function getRiskSpatial(req, res) {
    var jsonPath = path.join(__dirname, '..', '..', 'geojson', 'gwre_20190702.geojson');
    var geojson = JSON.parse(fs.readFileSync(jsonPath));
    res.send(geojson);
}

function getRiskMST(req, res) {
    var jsonPath = path.join(__dirname, '..', '..', 'geojson', 'mst_polygonResults.geojson');
    var geojson = JSON.parse(fs.readFileSync(jsonPath));
    res.send(geojson);
}

const boundaryCitys = boundary('city');
const boundaryDists = boundary('dist');
const boundaryVillages = boundary('village');
// const tainanspray2018 = getSprayRecord();

// 行政界: 縣市界
var getCity = function (req, res) {
    if (req.query && req.query.city) {
        var features = boundaryCitys.features.filter(function (obj) {
            return obj.properties.COUNTY === req.query.city;
        })

        var result = {};
        result.type = 'FeatureCollection';
        result.features = features;
        res.send(result);
    } else {
        res.send(boundaryCitys);
    }
}

// 行政界: 鄉鎮市區界
var getDist = function (req, res) {
    if (req.query && req.query.city && req.query.dist) {
        var features = boundaryDists.features.filter(function (obj) {
            return obj.properties.COUNTY === req.query.city &&
                obj.properties.TOWN === req.query.dist;
        })

        var result = {};
        result.type = 'FeatureCollection';
        result.features = features;
        res.send(result);
    } else if (req.query && req.query.city) {
        var features = boundaryDists.features.filter(function (obj) {
            return obj.properties.COUNTY === req.query.city;
        })

        var result = {};
        result.type = 'FeatureCollection';
        result.features = features;
        res.send(result);
    } else {
        res.send(boundaryDists);
    }
}

// 行政界: 村里界
var getVillage = function (req, res) {
    if (req.query && req.query.city && req.query.dist && req.query.village) {
        var features = boundaryVillages.features.filter(function (obj) {
            return obj.properties.COUNTY === req.query.city &&
                obj.properties.TOWN === req.query.dist &&
                obj.properties.VILLAGE === req.query.village
        })

        var result = {};
        result.type = 'FeatureCollection';
        result.features = features;
        res.send(result);
    } else if (req.query.city && req.query.dist) {
        var features = boundaryVillages.features.filter(function (obj) {
            return obj.properties.COUNTY === req.query.city &&
                obj.properties.TOWN === req.query.dist
        })

        var result = {};
        result.type = 'FeatureCollection';
        result.features = features;
        res.send(result);
    } else if (req.query.city) {
        var features = boundaryVillages.features.filter(function (obj) {
            return obj.properties.COUNTY === req.query.city
        })

        var result = {};
        result.type = 'FeatureCollection';
        result.features = features;
        res.send(result);
    } else {
        res.send(boundaryVillages);
    }
}

module.exports = {
    boundary,
    boundaryCitys,
    boundaryDists,
    boundaryVillages,
    getCity,
    getDist,
    getVillage,
    getRiskSpatial,
    getRiskMST
    // tainanspray2018
};