var express = require('express');
var formidable = require('formidable');
var path = require('path');
var request = require('request');
var sizeOf = require('image-size');
var util = require('util');
var xml2js = require('xml2js');
var router = express.Router();
// var geologicsFolder = require("../config").geologicsFolder;
var geologicsFolder = path.join(__dirname, 'public', 'stylesheets', 'images', 'geologics');
var fs = require('fs');
var saveApiRecord = require('../app/use_record.js');
var https = require('https');

var langZhtw = require('../public/language/map/zh-tw');

router.use(function(req, res, next) {
	for (var key in req.query) {
		req.query[key.toLowerCase()] = req.query[key];
	}
	next();
});

//use edge.js call csharp
// var edge = require('edge');
// var fileHandler = {
// 	toGeojson: edge.func(path.join(__dirname, '../files/csharp/FileHanding.dll')),
// 	unzipKmz: edge.func(path.join(__dirname, '../files/csharp/UnzipKmz.dll')),
// 	markerLayer: edge.func(path.join(__dirname, '../files/csharp/MarkerLayer.dll')),
// 	markerGet: edge.func(path.join(__dirname, '../files/csharp/MarkerGet.dll'))
// };
var fileHandler = {
	toGeojson: function() {

	},
	unzipKmz: function() {

	},
	markerLayer: function() {

	},
	markerGet: function() {
		
	}
};

//xml2js setting
var parser = {
	xml: new xml2js.Parser(),
	html: new xml2js.Parser({
		strict: false
	})
};

//tgos setting
var tgos = function() {
	return {
		//應用程式識別碼(APPId) 實由使用者向TGOS申請
		oAPPId: "CvaOtAkG1cn4TKbMojFVD4tO+whYsZUp/eM9jMRHu4g4YxJOaSBhiQ==",
		//應用程式介接驗證碼(APIKey)由使用者向TGOS申請
		oAPIKey: "cGEErDNy5yNr14zbsE/4GSfiGP5i3PuZR8Qzi9zgMqwgdmnbXh2hSeYwbYeiPgCtC8iqPc/E8q8ALtL/062xGWYQrc+6WZZrULAlaogsJ88/ZUJcQfd8mO1rwSE5Ha7hYvmOsczyMsX+rHnevTqYljHISrcAzsuunvII8BEh2goyH1jgYPCwbzomumfdLu86zHlrcWjjB0e4TsYCWDwF33HbgzAdrInUxCHqMcv2ilrp/Icf0pf3b5NGCbJw8eKa5ER0sA5pe0DGfjjfvLsAu/oi+qobFFQbcBGTAZ3yDeSy1yfSRouM3p3S/RX2Bgb54+kaZWHI22huyflH2gNqoiduJG8o15P3Pm7NYHs4B/ecCTD0not92w==",
		//坐標系統(SRS)EPSG:4326(WGS84)國際通用, EPSG:3825 (TWD97TM119) 澎湖及金馬適用,EPSG:3826 (TWD97TM121) 台灣地區適用,EPSG:3827 (TWD67TM119) 澎湖及金馬適用,EPSG:3828 (TWD67TM121) 台灣地區適用
		oSRS: "EPSG:4326",
		//0:最近門牌號機制,1:單雙號機制,2:[最近門牌號機制]+[單雙號機制]
		oFuzzyType: 0,
		//回傳的資料格式，允許傳入的代碼為：JSON、XML
		oResultDataType: "JSON",
		//模糊比對回傳門牌號的許可誤差範圍，輸入格式為正整數，如輸入 0 則代表不限制誤差範圍
		oFuzzyBuffer: 0,
		//是否只進行完全比對，允許傳入的值為：true、false，如輸入 true ，模糊比對機制將不被使用
		oIsOnlyFullMatch: "false",
		//是否鎖定縣市，允許傳入的值為：true、false，如輸入 true ，則代表查詢結果中的 [縣市] 要與所輸入的門牌地址中的 [縣市] 完全相同
		oIsLockCounty: "false",
		//是否鎖定鄉鎮市區，允許傳入的值為：true、false，如輸入 true ，則代表查詢結果中的 [鄉鎮市區] 要與所輸入的門牌地址中的 [鄉鎮市區] 完全相同
		oIsLockTown: "false",
		//是否鎖定村里，允許傳入的值為：true、false，如輸入 true ，則代表查詢結果中的 [村里] 要與所輸入的門牌地址中的 [村里] 完全相同
		oIsLockVillage: "false",
		//是否鎖定路段，允許傳入的值為：true、false，如輸入 true ，則代表查詢結果中的 [路段] 要與所輸入的門牌地址中的 [路段] 完全相同
		oIsLockRoadSection: "false",
		//是否鎖定巷，允許傳入的值為：true、false，如輸入 true ，則代表查詢結果中的 [巷] 要與所輸入的門牌地址中的 [巷] 完全相同
		oIsLockLane: "false",
		//是否鎖定弄，允許傳入的值為：true、false，如輸入 true ，則代表查詢結果中的 [弄] 要與所輸入的門牌地址中的 [弄] 完全相同
		oIsLockAlley: "false",
		//是否鎖定地區，允許傳入的值為：true、fals，如輸入 true ，則代表查詢結果中的 [地區] 要與所輸入的門牌地址中的 [地區] 完全相同
		oIsLockArea: "false",
		//號之、之號是否視為相同，允許傳入的值為：true、false
		oIsSameNumber_SubNumber: "false",
		//號之、之號是否視為相同，允許傳入的值為：true、false
		oCanIgnoreVillage: "true",
		//號之、之號是否視為相同，允許傳入的值為：true、false
		oCanIgnoreNeighborhood: "true",
		//號之、之號是否視為相同，允許傳入的值為：true、false
		oReturnMaxCount: 3
	}
};

//tgos api
// router.get('/tgos', function(req, res) {
// 	var address = req.query.address;
// 	var param = new tgos();
// 	param.oAddress = address;
// 	request.post({
// 		url: 'http://addr.tgos.nat.gov.tw/addrws/v30/QueryAddr.asmx/QueryAddr',
// 		form: param
// 	}, function(error, response, body) {
// 		if (error) {
// 			responseResult(error, {}, res);
// 		} else {
// 			parser.xml.parseString(body, function(err, result) {
// 				var resResult;
// 				try {
// 					resResult = JSON.parse(result.string['_']);
// 				} catch (e) {
// 					resResult = {};
// 				}
// 				responseResult(Object.getOwnPropertyNames(resResult).length === 0, resResult, res);

// 				var ip = req.ip.replace('::ffff:', '');
// 				saveApiRecord.saveGeocoding(address, 'tgos', resResult, ip);
// 			});
// 		}
// 	});
// });
router.get('/tgos', function(req, res) {
	var address = req.query.address;
	if (address && address.trim() !== '') {
		request.get('http://210.61.8.198/address/tgos?address=' + encodeURIComponent(address),
			function(error, response, body) {				
				if (error) {
					responseResult(error, {}, res);
				} else {					
					try {
						resResult = JSON.parse(body);
					} catch (e) {
						resResult = {};
					}
					responseResult(Object.getOwnPropertyNames(resResult).length === 0, resResult, res);

					var ip = req.ip.replace('::ffff:', '');
					saveApiRecord.saveGeocoding(address, 'tgos', resResult, ip);
				}
			});
	} else {
		responseResult(true, {}, res);
	}
});

// router.post('/geocodinguse', function(req, res) {
// 	if (req.body.api === 'google') {
// 		var address = req.body.address;
// 		var result = req.body.result;
// 		var ip = req.ip.replace('::ffff:', '');
// 		saveApiRecord.saveGeocoding(address, 'google', result, ip);
// 	}
// 	var response = {
// 		status: 200,
// 		success: 'Successfully'
// 	}
// 	res.end(JSON.stringify(response));
// });

//中華黃頁 抓取數值
router.get('/phone_http', function(req, res) {
	var tln = req.query.tln;
	request('https://www.iyp.com.tw/phone.php?phone=' + tln,
		function(error, response, body) {
			if (!error && response.statusCode == 200) {
				parser.html.parseString(body, function(err, result) {
					var resResult;
					try {
						var name = result.HTML.BODY[0].DIV[0].SECTION[0].DIV[0].SECTION[0].OL[0].LI[0].H3[0].A[0].$.TITLE;
						var info = result.HTML.BODY[0].DIV[0].SECTION[0].DIV[0].SECTION[0].OL[0].LI[0].UL[0].LI[1].SPAN[1].$['GO-MAP'].split('=');
						resResult = {
							gName: name,
							gAddress: info[info.length - 1]
						};
					} catch (e) {
						resResult = {
							gName: '',
							gAddress: ''
						};
					}
					responseResult(err, resResult, res);
				});
			} else {
				responseResult(error, {}, res);
			}
		});
});

router.get('/phone', function (req, res) {
    var tln = req.query.tln;
    var options = {
        host: 'www.iyp.com.tw',
        port: 443,
        path: '/phone.php?phone=' + tln,
        method: 'GET',
        headers: {
            accept: '*/*',
            'User-Agent': 'Mozilla/5.0'
        }
    };

    var getReq = https.get(options, function (response) {
        console.log("\nstatus code: ", response.statusCode);
        var body;
        response.on('data', function (data) {
            body += data;
        });

        response.on('end', function () {
            //console.log(body);

            parser.html.parseString(body, function (err, result) {
                var resResult;
                try {
                    var name = result.HTML.BODY[0].DIV[0].SECTION[0].DIV[0].SECTION[0].OL[0].LI[0].H3[0].A[0].$.TITLE;
                    var info = result.HTML.BODY[0].DIV[0].SECTION[0].DIV[0].SECTION[0].OL[0].LI[0].UL[0].LI[1].SPAN[1].$['GO-MAP'].split('=');
                    resResult = {
                        gName: name,
                        gAddress: info[info.length - 1]
                    };
                } catch (e) {
                    resResult = {
                        gName: '',
                        gAddress: ''
                    };
                }
                responseResult(err, resResult, res);
            });


        });

        response.on('error', function (err) {
            responseResult(err, {}, res);
        });
    });

    //end the request
    //getReq.write("");
    //getReq.end();


});

//filehanding
router.post('/filehanding', function(req, res) {
	var form = new formidable.IncomingForm();
	form.uploadDir = path.join(__dirname, '../tempfiles');
	form.keepExtensions = true;

	form.parse(req, function(err, fields, files) {
		var type = req.query.type;
		var spatialreference = req.query.spatialreference;
		if (type == "shp" && files.shp && files.dbf) {
			var fileInfo = {
				type: "shp",
				shp: files.shp.path,
				dbf: files.dbf.path,
				sr: spatialreference
			};

			fileHandler.toGeojson(fileInfo, function(error, result) {
				responseResult(error, result, res);

				// fs.unlink(files.shp.path);
				// fs.unlink(files.dbf.path);
			});
		} else if (type == "dxf" && files.dxf) {
			var fileInfo = {
				type: "dxf",
				dxf: files.dxf.path,
				sr: spatialreference
			};

			fileHandler.toGeojson(fileInfo, function(error, result) {
				responseResult(error, result, res);

				// fs.unlink(files.dxf.path);
			});
		} else {
			responseResult(true, {}, res);
		}
	});
});
router.post('/urlfilehanding', function(req, res) {
	var form = new formidable.IncomingForm();
	//form.uploadDir = path.join(__dirname, '../tempfiles');
	//form.keepExtensions = true;

	form.parse(req, function(err, fields, files) {
		var type = req.query.type;
		var spatialreference = req.query.spatialreference;
		if (type == "shp" && fields.shp && fields.dbf) {
			var fileInfo = {
				type: "shp",
				shp: fields.shp,
				dbf: fields.dbf,
				sr: spatialreference,
				filepath: "url"
			};

			fileHandler.toGeojson(fileInfo, function(error, result) {
				responseResult(error, result, res);
			});
		} else if (type == "dxf" && fields.dxf) {
			var fileInfo = {
				type: "dxf",
				dxf: fields.dxf,
				sr: spatialreference,
				filepath: "url"
			};

			fileHandler.toGeojson(fileInfo, function(error, result) {
				responseResult(error, result, res);
			});
		} else {
			responseResult(true, {}, res);
		}
	});
});
//unzipKmz
router.post('/unzipKmz', function(req, res) {
	var form = new formidable.IncomingForm();
	form.uploadDir = path.join(__dirname, '../tempfiles');
	form.keepExtensions = true;

	form.parse(req, function(err, fields, files) {
		if (files.kmz) {
			var fileInfo = {
				kmz: files.kmz.path,
			};

			fileHandler.unzipKmz(fileInfo, function(error, result) {
				responseResult(error, result, res);
			});
		} else {
			responseResult(true, {}, res);
		}
	});
});

//markerLayer
router.post('/markerLayer', function(req, res) {
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		var fileInfo;
		try {
			JSON.parse(fields.info);
			fileInfo = {
				json: fields.info,
				dir: geologicsFolder
			};
		} catch (e) {
			res.writeHead(404);
			res.end();
		}

		if (fileInfo) {
			fileHandler.markerLayer(fileInfo, function(error, result) {
				responseResult(error, result, res);
			});
		} else {
			responseResult(true, {}, res);
		}
	});
});

//GeoUtils
router.post('/geoUtils', function(req, res) {
	res.writeHead(404);
	res.end();
});

//imgSize
router.get('/imgSize', function(req, res) {
	var url = (req.query.url) ? req.query.url : '';
	url = decodeURIComponent(url);

	imgSzie({
		url: url,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36'
		}
	}, function(err, dimensions, length) {
		if (err) {
			dimensions = {
				"width": 36,
				"height": 36,
				"type": null
			};
		}
		responseResult(null, dimensions, res);
	});
});

function imgSzie(options, done) {

	var opts;

	if (options && typeof options === 'object') {
		opts = util._extend({}, options);
		opts.encoding = null;
	} else if (options && typeof options === 'string') {
		opts = {
			uri: options
		};
	} else {
		throw new Error('You should provide an URI or a "request" options object.');
	}

	var req = request(opts);

	req.on('response', function(response) {

		var buffer = new Buffer([]);
		var dimensions;
		var imageTypeDetectionError;

		response
			.on('data', function(chunk) {
				buffer = Buffer.concat([buffer, chunk]);
				try {
					dimensions = sizeOf(buffer);
				} catch (e) {
					imageTypeDetectionError = e;
					return;
				}
				req.abort();
			})
			.on('error', function(err) {
				return done(err);
			})
			.on('end', function() {
				if (!dimensions) {
					return done(imageTypeDetectionError);
				}
				return done(null, dimensions, buffer.length);
			});

	});

	// Prevent maxRedirects exceptions from being thrown
	// Callback was already called in 'return done(imageTypeDetectionError)'
	req.on('error', function(err) {});

}

//imgGet
router.all('/imgGet', function(req, res) {
	var info = {
		name: req.query.name,
		direct: req.query.direct,
		dip: req.query.dip,
		color: req.query.color,
		dir: geologicsFolder
	};

	fileHandler.markerGet(info, function(error, result) {
		res.writeHead(200, {
			'Content-Type': 'image/png'
		});
		res.end(result);
	});
});

function responseResult(error, result, res) {
	var response = (error) ? '{"message":"error"}' : JSON.stringify(result);
	res.writeHead(200, {
		'Content-Type': 'application/json; charset=utf-8'
	});
	res.end(response, 'utf-8');
}

/*Get Preview canvas image*/
router.get(['/CreateForm', '/CreateForm/:data'], function(req, res, next) {
    console.log("11111111111");
    var uri_dec = JSON.parse(req.params.data);   
    res.render("theme/pages/newmap.ejs", {        
        config: uri_dec,
        Language: langZhtw
    });
    console.log(res);
    res.end("router");
});

router.post('/SentData', function(req, res, next) {    
    var data = JSON.parse(req.body.data);   
    // console.log(data);    
    res.render("theme/pages/newmap.ejs", {        
        config: data,
        Language: langZhtw
    });
    // console.log(res);
    res.end();
});



module.exports = router;
