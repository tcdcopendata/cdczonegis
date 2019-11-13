var pg = require("pg");
var connectString = require("../config").postgres + 'ApiRecord';

module.exports.save = saveUseRecord;
module.exports.saveGeocoding = saveGeocodingUse;

function saveUseRecord(req, res, api, success) {
    var ip = req.ip.replace('::ffff:', '');
    var referer = (req.headers.referer) ? req.headers.referer : ip;

    var client = new pg.Client(connectString);
    client.connect(function(err) {
        if (err) {
            //return console.error('could not connect to postgres', err);
            res.writeHead(500);
            res.end();
        } else {
            client.query('SELECT geocloud_view_record($1, $2, $3);', [api, referer, ip], function(err, result) {
                if (err) {
                    //return console.error('error running query', err);
                    res.writeHead(500);
                    res.end();
                } else {
                    success();
                }
                client.end();
            });
        }
    });
}

function saveGeocodingUse(address, api, result) {
    try {
        var x;
        var y;

        if (api == 'tgos') {
            x = parseFloat(result.AddressList[0].X);
            y = parseFloat(result.AddressList[0].Y);
        } else if (api == 'google') {
            result = JSON.parse(result);
            x = parseFloat(result.results[0].geometry.location.lng);
            y = parseFloat(result.results[0].geometry.location.lat);
        }

        var geojson = {
            "type": "Point",
            "coordinates": [x, y]
        };

        var client = new pg.Client(connectString);
        client.connect(function(err) {
            if (err) {
                console.log(err);
            } else {
                client.query('INSERT INTO "GeocodingUse" ("Address", "GeocodingApi", "Result", geom) values ($1, $2, $3, ST_SetSRID(ST_GeomFromGeoJSON($4), 4326));', [address, api, JSON.stringify(result), JSON.stringify(geojson)], function(err, result) {
                    if (err) {
                        console.log(err);
                    }
                    client.end();
                });
            }
        });
    } catch (e) {

    }
}