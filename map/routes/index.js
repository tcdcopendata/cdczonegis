var express = require('express');
var session = require('express-session');
var csrf = require('csurf');
var csrfProtection = csrf({
    cookie: true
});
var bodyParser = require('body-parser');
var parseForm = bodyParser.urlencoded({ extended: false });
var langZhtw = require('../public/language/map/zh-tw');
var langEn = require('../public/language/map/en');
var router = express.Router();
var request = require('request');

var api = require('../api/api');

var pg = require('pg');
var config = require("../config");
var connectionString = config.postgres;

var soap = require('soap');
var fs = require('fs');
var path = require('path');
var markdown = require("markdown").markdown;
var multer  = require('multer')
var upload = multer()
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser({
    explicitArray: false,
    ignoreAttrs: true
})

var urlEgov = 'https://www.cp.gov.tw/gsp2ws/rsmediator01.asmx?WSDL';
var urlUrm = 'https://urmsso.cdc.gov.tw/URM_WS/SSOService.svc?wsdl';
var tokenUrm = 'zone';
var urlUrm2= 'https://urm2.cdc.gov.tw/URM_WS/SSOService.svc?wsdl';

function checkLanguage(req) {
    var lang = langZhtw;
    if (req && req.query && req.query.lang) {
        switch (req.query.lang.toLowerCase()) {
            case 'zh-tw':
                return langZhtw;
            case 'en':
                return langEn;
        }
    }
    return lang;
}

/* GET home page. */
// router.get('/', function(req, res, next) {
//     if (!req.session || !req.session.userid) {
//         res.redirect('/map/authorize');
//         return;
//     }
//     res.render('index', {
//         Language: checkLanguage(req),
//         User: {
//             username: req.session.username,
//             userid: req.session.userid,
//             email: req.session.email,
//             permission: req.session.permission
//         }
//     });
// });

router.get('/', function (req, res, next) {
    if (req.url == "/") {
        res.redirect('./map/dengue/zh-tw');
    } else {
        res.redirect('./dengue/zh-tw' + req.url);
    }
});

var arrayDiseases = ['dengue'];
// var arrayDiseases = ['dengue', 'measles'];
arrayDiseases.forEach(function (disease) {
    router.get(['/' + disease, '/' + disease + '/:lang'], function (req, res, next) {
        // console.log('喔齁喔齁' + req.url);
        if (!req.session || !req.session.userid) {
            req.session.redirect_url = '/map' + req.url;
            res.redirect('/map/authorize');
            return;
        }
        var lang = 'zh-tw';
        if (req.params.lang) {
            lang = req.params.lang;
        } else {
            res.redirect('/map/' + disease + '/' + lang);
        }

        var langpack = langZhtw;
        switch (lang) {
            case 'zh-tw':
                langpack = langZhtw;
                break;
            case 'en':
                langpack = langEn;
                break;
        }
        var user = {
            Language: langpack,
            User: {
                username: req.session.username,
                userid: req.session.userid,
                org_name: req.session.org_name,
                org_id: req.session.org_id,
                org_level: req.session.org_level,
                email: req.session.email,
                permission: req.session.permission,
                regional: req.session.regional,
                city: req.session.city,
                dist: req.session.dist,
                xmin: req.session.xmin,
                xmax: req.session.xmax,
                ymin: req.session.ymin,
                ymax: req.session.ymax
            }
        };
        res.render('index_' + disease, user);
    });
});



// router.get('/zh-tw', function(req, res, next) {
//     if (!req.session || !req.session.userid) {
//         res.redirect('/map/authorize');
//         return;
//     }
//     res.render('index', {
//         Language: langZhtw,
//         User: {
//             username: req.session.username,
//             userid: req.session.userid,
//             email: req.session.email,
//             permission: req.session.permission,
//             regional: req.session.regional,
//             city: req.session.city,
//             dist: req.session.dist
//         }
//     });
// });

// router.get('/en', function(req, res, next) {
//     if (!req.session || !req.session.userid) {
//         res.redirect('/map/authorize');
//         return;
//     }
//     res.render('index', {
//         Language: langEn,
//         User: {
//             username: req.session.username,
//             userid: req.session.userid,
//             email: req.session.email,
//             permission: req.session.permission
//         }
//     });
// });

// 驗證頁面
router.get('/authorize', csrfProtection, function (req, res, next) {
    req.session.backURL = req.header('Referer') || '/';
    // console.log('backURL: ' + req.session.backURL);
    // 檢查egov登入
    if (req.body) {
        // if (req.body.
    }
    if (req.session && req.session.username) {
        if (req.session && req.session.redirect_url != null) {
            res.redirect(req.session.redirect_url);
        } else if (req.session.backURL && req.session.backURL != '/') {
            res.redirect(req.session.backURL);
        } else {
            res.redirect('/map/dengue');
        }
    }
    if (req.query && req.query.error) {
        var strError = '';
        switch (req.query.error) {
            case 'invalid':
                if (req.query.errorMsg)
                    strError = decodeURI(req.query.errorMsg);
                else
                    strError = "驗證失敗，請重新登入。";
                break;
            case 'notfound':
                strError = "系統無此使用者，請申請。";
                break;
            case 'novalue':
                strError = "回傳值為空，請重新輸入資訊。";
                break;
            default:
                strError = "請重新登入。";
                break;
        }
        res.render('authorize', {
            error: strError,
            csrfToken: req.csrfToken()
        });
    } else {
        res.render('authorize', {
            csrfToken: req.csrfToken()
        });
    }
});

// router.post('/authorize_card', function(req, res, next) {
// });

// 登出
router.all('/deauthorize', function (req, res, next) {
    req.session.destroy();
    res.redirect('/map/authorize');
});

router.post('/authorize_check', csrfProtection, function (req, res, next) {
    if (req.body) {
        switch (req.body.method) {
            case 'check_normal':
                authorize_check_normal(req, res);
                break;
            case 'check_urm':
                authorize_check_urm(req, res);
                break;
            case 'check_egov':
                // authorize_check_egov(req, res);
                res.redirect('https://www.cp.gov.tw/portal/Clogin.aspx?ReturnUrl=' + encodeURI('https://zone.cdc.gov.tw/map/authorize_check_egov') + '&level=1');
                break;
            case 'check_card':
                authorize_check_card(req, res)
                break;
        }
    } else {
        res.redirect('/map/authorize?error=novalue');
    }
})

function authorize_check_normal(req, res) {
    console.log('authorize_check_normal');
    authorize_check_permission(req.body.name, req, res);
}

function authorize_check_urm(req, res) {
    console.log('authorize_check_urm');
    if (!req.body) {
        res.redirect('/map/authorize?error=invalid&errorMsg=' + encodeURI('URM重新導向(協定錯誤？)'));
        res.end();
        return;
    }
    if (req.body.SSOKEY) {
        var SSOKEY = req.body.SSOKEY
        soap.createClient(urlUrm, function (err, client) {
            if (err != null) {
                console.log('URM登入失敗：' + err);
                res.redirect('/map/authorize?error=invalid&errorMsg=' + encodeURI('URM登入失敗'));
            } else {
                client.CALL_USERINF({
                    SSOKEY: SSOKEY
                }, function (err, result) {
                    if (err != null) {
                        console.log('URM登入失敗：' + err);
                        res.redirect('/map/authorize?error=invalid&errorMsg=' + encodeURI('URM登入失敗'));
                    } else {
                        xmlParser.parseString(result.CALL_USERINFResult, function (err, result) {
                            if (!result.URMDOC.ERRORMSG) {
                                var USER_PID = result.URMDOC.CONTENT.DATA.USER_PID;
                                authorize_check_permission(USER_PID, req, res);
                            } else {
                                console.log('URM訊息：' + result.URMDOC.ERRORMSG);
                                res.redirect('/map/authorize?error=invalid&errorMsg=' + encodeURI('URM登入失敗：' + result.URMDOC.ERRORMSG));
                            }
                        });
                    }
                })
            }
        })
    } else {
        soap.createClient(urlUrm, function (err, client) {
            client.CryptoHASH({
                CONTENT: req.body.pass
            }, function (err, result) {
                var xml = "";
                xml = "<URMDOC>" +
                    "<CONDITION>" +
                    "<SYS_ID>" + tokenUrm + "</SYS_ID>" +
                    "<USER_ID_TYPE>1</USER_ID_TYPE>" +
                    "<USER_ID>" + req.body.name + "</USER_ID>" +
                    "<USER_PWD>" + result.CryptoHASHResult + "</USER_PWD>" +
                    "<ORG></ORG>" +
                    "<ORG_ZONE_SEQ></ORG_ZONE_SEQ>" +
                    "</CONDITION>" +
                    "</URMDOC>";
                client.CALL_USER({
                    QRY_XML: xml
                }, function (err, result) {
                    var SSOKEY;
                    xmlParser.parseString(result.CALL_USERResult, function (err, result) {
                        
                        if(result.URMDOC.ERRORMSG)
                        {
                            console.log('URM訊息：' + result.URMDOC.ERRORMSG);
                            res.redirect('/map/authorize?error=invalid&errorMsg=' + encodeURI('URM登入失敗：' + result.URMDOC.ERRORMSG));
                            return
                        }else{
                            SSOKEY = result.URMDOC.EXECRESULT
                            client.CALL_USERINF({
                                SSOKEY: SSOKEY
                            }, function (err, result) {
                                xmlParser.parseString(result.CALL_USERINFResult, function (err, result) {
                                    if (!result.URMDOC.ERRORMSG) {
                                        var USER_PID = result.URMDOC.CONTENT.DATA.USER_PID;
                                        console.log('USER_PID: ' + USER_PID);
                                        authorize_check_permission(USER_PID, req, res);
                                    } else {
                                        console.log('URM訊息：' + result.URMDOC.ERRORMSG);
                                        res.redirect('/map/authorize?error=invalid&errorMsg=' + encodeURI('URM登入失敗：' + result.URMDOC.ERRORMSG));
                                    }
                                });
                            })
                        }
                    });
                })
            });
        });
    }
}



function authorize_check_egov(req, res) {
    console.log('authorize_check_egov');
    var OID = '2.16.886.101.20003.20065.20021';
    var SID = 'APP0001897';
    //先檢查導入的post有沒有回傳 或是redirect回來
    if (req.body && req.body['twGovT1']) {
        console.log('egov twGovT1: ' + req.body['twGovT1']);
        soap.createClient(urlEgov, function (err, client) {
            var sheader = {
                AuthHeader: {
                    ServiceID: SID,
                    Token1: req.body['twGovT1']
                }
            };
            client.addSoapHeader(sheader, "", "tns", "http://cp.gov.tw/gsp2");
            client.GetProfileColumns2({}, function (err, result) {
                result = result.GetProfileColumns2Result;
                console.log('egov result: ' + JSON.stringify(result));
                if (result.Code == 0) {
                    var uid = '';
                    for (var x = 0; x < result.Result.ProfileColumns.Item.length; x++) {
                        if (result.Result.ProfileColumns.Item[x].Key == 'uid') {
                            uid = result.Result.ProfileColumns.Item[x].Value;
                        }
                    }

                    authorize_check_permission(uid, req, res);
                } else {
                    res.redirect('/map/authorize?error=invalid&errorMsg=' + encodeURI('e政府登入失敗：' + result.Message + '(' + result.Code + ')')); //
                }
            });
        });
    }
}

function authorize_check_card(req, res) {
    console.log('authorize_check_card');
    if (req.body) {
        // 檢查資料
        // 進入內網的卡片驗證伺服器IIS跳板
        var options = {
            url: '',
            form: {
                authData: req.body.authData,
                signature: req.body.signature,
                cardType: req.body.cardType,
                id: req.body.id,
                name: req.body.name,
                empID: req.body.empID,
                pass2: req.body.pass2
            }
        };
        // console.log('authorize_check_card:options: ' + JSON.stringify(options))
        request.post(options, function (post_err, post_res, post_body) {
            console.log('讀卡機驗證結束');
            if (post_err) {
                res.send({
                    err: true,
                    errorMsg: '驗證伺服器驗證錯誤: ' + post_err
                });
                return console.log('讀卡機驗證失敗 errorMsg: ' + post_err);
            }
            // console.log('authorize_check_card result: ' + JSON.stringify(post_res.body))

            // console.log('post_res.body: ' + post_res.body)
            // console.log('post_res.body.id: ' + post_res.body.id)
            // console.log('post_res.body.name: ' + post_res.body.name)
            var user_id = JSON.parse(post_res.body)['id']
            var user_name = JSON.parse(post_res.body)['name']
            try {
                authorize_check_permission_card(user_id, user_name, req, res)
            } catch (err) {
                res.send({
                    err: true,
                    errorMsg: '讀卡系統登入失敗，或遺失使用者ID或名稱 (' + err + ')'
                });
            }
        });
    }
}

// 連線到IIS進行卡片驗證拿參數
router.post('/authorize_card_variable', function (req, res, next) {
    var options = {
        url: ''
    };
    request.post(options, function (post_err, post_res, post_body) {
        if (post_err) {
            res.send({
                err: true,
                errorMsg: '驗證伺服器驗證錯誤: ' + post_err
            });
            return
        }
        var result = {};
        if (post_res.body.length > 0) {
            console.log('post_res.body: ' + post_res.body);
            result = JSON.parse(post_res.body);
        }
        res.send(result);
    });
})

function authorize_check_permission(USER_PID, req, res) {
    var pgString = connectionString + config.db.cdczonegis;
    var pgClient = new pg.Client(pgString);
    pgClient.connect();
    var strSql = 'SELECT users.*, user_organization.* FROM users LEFT JOIN user_organization ON users."ORGANIZATION_ID" = user_organization."ORGANIZATION_ID" WHERE "USER_ID" = $1 AND "USER_STATUS"=1;';
    var sqlParmeter = [USER_PID];
    pgClient.query(strSql, sqlParmeter, function (err, row) {
        pgClient.end();
        if (err) {
            console.log(err)
            // callback(err, null);
            res.redirect('/map/authorize?error=invalid&errorMsg=' + encodeURI(err));
        } else {
            if (row.rowCount > 0) {
                var user = {};
                user.id = row.rows[0]["ID"];
                user.userid = row.rows[0]["USER_ID"];
                user.username = row.rows[0]["USER_NAME"];
                user.permission = row.rows[0]["USER_TYPE_ID"];
                user.org_name = row.rows[0]["ORGANIZATION_NAME"];
                user.org_id = row.rows[0]["ORGANIZATION_ID"];
                user.org_level = row.rows[0]["ORGANIZATION_LEVEL"];
                user.email = row.rows[0]["EMAIL"];
                user.regional = row.rows[0]["REGIONAL"];
                user.city = row.rows[0]["CITY"];
                user.dist = row.rows[0]["DIST"];
                user.xmin = row.rows[0]["XMIN"];
                user.ymin = row.rows[0]["YMIN"];
                user.xmax = row.rows[0]["XMAX"];
                user.ymax = row.rows[0]["YMAX"];

                req.session.useruid = user.id;
                req.session.userid = user.userid;
                req.session.username = user.username;
                req.session.permission = user.permission;
                req.session.org_name = user.org_name;
                req.session.org_id = user.org_id;
                req.session.org_level = user.org_level;
                req.session.email = user.email;
                req.session.regional = user.regional;
                req.session.city = user.city;
                req.session.dist = user.dist;
                req.session.xmin = user.xmin;
                req.session.ymin = user.ymin;
                req.session.xmax = user.xmax;
                req.session.ymax = user.ymax;

                req.session.loginstatus = '登入成功(一般登入)';
                api.sys.sysLogLogin(req, res);
                // if (req.session.backURL && req.session.backURL != '/') {
                //     res.redirect(req.session.backURL);
                // } else {
                // res.redirect('/map/');
                if (req.session && req.session.redirect_url != null) {
                    res.redirect(req.session.redirect_url);
                } else {
                    res.redirect('/map/');
                }
                // }
            } else {
                req.session.loginstatus = '登入失敗(一般登入，查無此使用者' + USER_PID + ')';
                api.sys.sysLogLogin(req, res);

                var error = {
                    error: '查無此使用者'
                };
                res.redirect('/map/authorize?error=invalid&errorMsg=' + encodeURI(error.error));
            }
        }
    });
}

function authorize_check_permission_card(USER_ID, USER_NAME, req, res) {
    console.log('USER_ID: ' + USER_ID)
    console.log('USER_NAME: ' + USER_NAME)
    var pgString = connectionString + config.db.cdczonegis;
    var pgClient = new pg.Client(pgString);
    pgClient.connect();
    var strSql = 'SELECT users.*, user_organization.* FROM users LEFT JOIN user_organization ON users."ORGANIZATION_ID" = user_organization."ORGANIZATION_ID" WHERE "USER_ID" LIKE \'%\' || $1 AND "USER_NAME" = $2 AND "USER_STATUS"=1;';

    // var strSql = 'SELECT * FROM users WHERE "USER_ID" LIKE \'%\' || $1;';
    console.log('strSql: ' + strSql)
    var sqlParmeter = [USER_ID, USER_NAME];
    // var sqlParmeter = [USER_ID];
    pgClient.query(strSql, sqlParmeter, function (err, row) {
        pgClient.end();
        if (err) {
            res.send({
                err: true,
                errorMsg: 'Postgres查詢錯誤(' + err + ')'
            });
        } else {
            if (row.rowCount > 0) {
                var user = {};
                user.id = row.rows[0]["ID"];
                user.userid = row.rows[0]["USER_ID"];
                user.username = row.rows[0]["USER_NAME"];
                user.permission = row.rows[0]["USER_TYPE_ID"];
                user.org_name = row.rows[0]["ORGANIZATION_NAME"];
                user.org_id = row.rows[0]["ORGANIZATION_ID"];
                user.org_level = row.rows[0]["ORGANIZATION_LEVEL"];
                user.email = row.rows[0]["EMAIL"];
                user.regional = row.rows[0]["REGIONAL"];
                user.city = row.rows[0]["CITY"];
                user.dist = row.rows[0]["DIST"];
                user.xmin = row.rows[0]["XMIN"];
                user.ymin = row.rows[0]["YMIN"];
                user.xmax = row.rows[0]["XMAX"];
                user.ymax = row.rows[0]["YMAX"];

                req.session.useruid = user.id;
                req.session.userid = user.userid;
                req.session.username = user.username;
                req.session.permission = user.permission;
                req.session.org_name = user.org_name;
                req.session.org_id = user.org_id;
                req.session.org_level = user.org_level;
                req.session.email = user.email;
                req.session.regional = user.regional;
                req.session.city = user.city;
                req.session.dist = user.dist;
                req.session.xmin = user.xmin;
                req.session.ymin = user.ymin;
                req.session.xmax = user.xmax;
                req.session.ymax = user.ymax;

                req.session.loginstatus = '登入成功(讀卡機登入)';
                api.sys.sysLogLogin(req, res);
                res.send({
                    success: true,
                });
                // if (req.session.backURL && req.session.backURL != '/') {
                //     res.redirect(req.session.backURL);
                // } else {
                //     res.redirect('/map/');
                // }
            } else {
                req.session.loginstatus = '登入失敗(讀卡機登入，查無此使用者' + USER_PID + ')';
                api.sys.sysLogLogin(req, res);

                console.log('沒有找到喔')
                res.send({
                    err: true,
                    errorMsg: '查無此使用者'
                });
            }
        }
    });
}

// 使用urm登入資訊驗證
router.all('/authorize_check_urm', function (req, res) {
    authorize_check_urm(req, res);
});

// 使用egov登入資訊驗證
router.all('/authorize_check_egov', function (req, res) {
    authorize_check_egov(req, res);
});

// 頁面：使用者註冊
router.all('/user_apply', function (req, res) {

    res.render('user_apply');

});


router.get('/user_apply_from_urm', function (req, res) {
    res.render("user_apply_urm", {
        name: "吳振宏",
        userPID : "A129581183",
        email: "tony86119@hotmail.com",
        orgRNO : "3345678",
        txttel: "0926930218"
    })
})

function CALL_userinfo(SSOKEY, callback) {
    soap.createClient(urlUrm, function (err, client) {
        if (err != null) {
            callback(err)
        } else {
            console.log("call_userInfo success!")
            client.CALL_USERINF({
                SSOKEY: SSOKEY
            }, function (err, result) {
                if (err != null) {
                    console.log("call_userinfo err!"+err)
                    callback(err,result)
                } else {
                    console.log("call_userinfo result!"+result)
                    xmlParser.parseString(result.CALL_USERINFResult, function (err, result) {
                        if (result.URMDOC.ERRORMSG!='') {
                            //將資料填入表單
                            console.log(result)
                            callback(err,result)
                        } else {
                            err = result.URMDOC.ERRORMSG
                            console.log(err)
                            callback(err,result)
                        }
                    });
                }
            })
        }
    })
}
function CALL_organization(SSOKEY, callback) {
    console.log("call_organization")
    soap.createClient(urlUrm, function (err, client) {
        if (err != null) {
            console.log('URM登入失敗：' + err);
            res.redirect('/map/authorize?error=invalid&errorMsg=' + encodeURI('URM登入失敗'));
        } else {
            console.log("createClient success!")
            // var xml = "<URMDOC>" +
            //     "<CONDITION>" +
            //     "<QTYPE>" + "1" +
            //     "</QTYPE>" +
            //     "</CONDITION>" +
            //     "</URMDOC>";
            client.CALL_USERWK({
                SSOKEY: SSOKEY
            }, function (err, result) {
                if(err){
                    console.log(err)
                }else{
                    console.log("CALL_USERWK success!")
                    xmlParser.parseString(result.CALL_USERWKResult, function (err, result) {
                        if (err) {
                            console.log(err)
                            callback(err,result)
                        }else if(result.URMDOC.CONTENT.DATA.ORG_GID){
                            console.log("1:"+JSON.stringify(result))
                            result.ORG_RNO      = result.URMDOC.CONTENT.DATA.ORG_GID
                            result.ORG_ZONE_SEQ = result.URMDOC.CONTENT.DATA.ORG_ZONE_SEQ
                            callback(err,result)
                        }else if(result.URMDOC.CONTENT.DATA.ORG_HID){
                            console.log("2:"+JSON.stringify(result))
                            result.ORG_RNO      = result.URMDOC.CONTENT.DATA.ORG_HID
                            result.ORG_ZONE_SEQ = result.URMDOC.CONTENT.DATA.ORG_ZONE_SEQ
                            callback(err,result)
                        }else if(result.URMDOC.CONTENT.DATA.ORG_ID){
                            console.log("3:"+JSON.stringify(result))
                            result.ORG_RNO      = result.URMDOC.CONTENT.DATA.ORG_ID
                            result.ORG_ZONE_SEQ = result.URMDOC.CONTENT.DATA.ORG_ZONE_SEQ
                            callback(err,result)
                        }
                        else{
                            console.log("4:"+JSON.stringify(result))
                            result = result.URMDOC.ERRORMSG
                            callback(err,result)
                        }
                        
                    });
                }
            })
        }
    })
}

function setAccount(SSOKEY, USER_ID, ORG, ORG_ZONE_SEQ, AUTH_FLAG, callback) {
    var xml = "<URMDOC>" +
        "<CONDITION>" +
        "<USER_ID_TYPE>" + "2" + "</USER_ID_TYPE>"+
        "<USER_ID>" + USER_ID +"</USER_ID>"+
        "<ORG>" + ORG + "</ORG>"+
        "<ORG_ZONE_SEQ>" + ORG_ZONE_SEQ + "</ORG_ZONE_SEQ>"+
        "<AUTHORITY_FLAG>" + AUTH_FLAG + "</AUTHORITY_FLAG>"+
        "</CONDITION>" +
        "</URMDOC>";
        console.log(xml)
    soap.createClient(urlUrm, function (err, client) {
        if (err != null) {
            console.log('URM登入失敗：' + err);
            res.redirect('/map/authorize?error=invalid&errorMsg=' + encodeURI('URM登入失敗'));
        } else {
            client.SETACCOUNT_AP({
                SSOKEY: SSOKEY,
                QRY_XML: xml
            }, function (err, result) {
                xmlParser.parseString(result.SETACCOUNT_APResult, function (err, result) {
                    if (err) {
                        console.log(err)
                        callback(err, result)
                    }
                    if (result.URMDOC.ERRORMSG) {
                        err = result.URMDOC.ERRORMSG;
                        callback(err, result);
                    } else {
                        result = result.URMDOC.EXECRESULT;
                        callback(err, result)
                    }
                });
            })
        }
    })
}

router.post('/user_apply_from_urm',upload.array(), function (req, res) {
    var userInfomation={};
    if (!req.body.SSOKEY) {
        console.log("系統介接異常！");
        res.render("404")
        return
    }
    var SSOKEY = req.body.SSOKEY;
    console.log(SSOKEY);
    CALL_userinfo(SSOKEY, function (err, result) {
        if (err) {
            console.log("系統無法獲取使用者資訊！錯誤訊息如下:" + err);
            res.redirect('/map/authorize?error=invalid&errorMsg=' + encodeURI('URM登入失敗：' + err));
        return
        }else{
            var userinfo=result;
            CALL_organization(SSOKEY, function (err, result) {
                if (err) {
                    console.log("系統無法獲取機構代碼！"+err);
                    res.redirect('/map/authorize?error=invalid&errorMsg=' + encodeURI('URM登入失敗：' +"系統無法獲取機構代碼！"+ err));
                    return
                }else{
                    var ORG_ZONE_SEQ=result.ORG_ZONE_SEQ;
                    var ORG_RNO = result.ORG_RNO;
                    console.log({
                        name: userinfo.URMDOC.CONTENT.DATA.USER_NAME,
                        userPID: userinfo.URMDOC.CONTENT.DATA.PID,
                        email: userinfo.URMDOC.CONTENT.DATA.USER_MAIL1,
                        txttel: userinfo.URMDOC.CONTENT.DATA.USER_TEL,
                        orgRNO: ORG_RNO
                    })
                    req.session.ORG_ZONE_SEQ = ORG_ZONE_SEQ;
                    req.session.ssokey_id = SSOKEY;
                    res.render("user_apply_urm", {
                        name: userinfo.URMDOC.CONTENT.DATA.USER_NAME,
                        userPID: userinfo.URMDOC.CONTENT.DATA.PID,
                        email: userinfo.URMDOC.CONTENT.DATA.USER_MAIL1,
                        txttel: userinfo.URMDOC.CONTENT.DATA.USER_TEL,
                        orgRNO: ORG_RNO
                    })
                }
            })
        }
    })
});

// 驗證使用者註冊資訊
router.post('/authorize/user_apply', function (req, res) {
    var result = {}
    var pgString = connectionString + config.db.cdczonegis;
    var pgClient = new pg.Client(pgString);
    if (req.body) {
        // 先確認身分證字號使否已被使用
        var strSql = 'SELECT * FROM users WHERE "USER_ID" = $1;';
        var sqlParmeter = [req.body.userid];
        pgClient.connect();
        pgClient.query(strSql, sqlParmeter, function (err, row) {
            if (err) {
                result.error = "sql_failed"
                result.errorMsg = "資料庫搜尋失敗，請確認網路環境是否正常。"
                res.send(result)
            } else {
                if (row.rowCount > 0) {
                    pgClient.end();
                    result.error = "user_exists"
                    result.errorMsg = "該身分證字號已被使用。"
                    res.send(result)
                } else {
                    // 繼續 //新增org_rno
                    //向URM設定應用程式使用權限
                    SSOKEY=req.session.ssokey_id
                    setAccount(SSOKEY, req.body.userid, req.body.organization_rno, req.session.ORG_ZONE_SEQ, "A", function (err, result) {
                        if (err) {
                            console.log(err)
                            res.redirect('/map/authorize?error=invalid&errorMsg=' + encodeURI('URM登入失敗：' + err));
                        }else{
                            console.log(result)
                            strSql = 'INSERT INTO users ("USER_ID", "USER_NAME", "EMAIL", "USER_TYPE_ID", "USER_TYPE_NAME", "ORGANIZATION_ID", "ORGANIZATION_NAME", "TEL", "USER_STATUS") VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);';
                            sqlParmeter = [req.body.userid, req.body.name, req.body.email, 2, '決策人員', req.body.organization_id, req.body.organization_name, req.body.tel, 0];
                            pgClient.query(strSql, sqlParmeter, function (err, row) {
                                pgClient.end();
                                if (err) {
                                    console.log(err)
                                    result.error = "sql_failed"
                                    result.errorMsg = "資料新增失敗。"
                                } else {
                                    result.success = true
                                }
                                res.send(result)
                            })
                        }
                        
                    })
                }
            }
        });
    } else {
        result.error = "protocol_failed"
        result.errorMsg = "協定失敗，遺失主體。"
        res.send(result)
    }
});

router.get('/authorize/get_organization', function (req, res, next) {
    var pgString = connectionString + config.db.cdczonegis;
    var pgClient = new pg.Client(pgString);
    pgClient.connect();
    var strSql = 'SELECT * FROM user_organization ORDER BY "ORGANIZATION_LEVEL","ORGANIZATION_ID";';
    pgClient.query(strSql, function (err, row) {
        // pgClient.end();
        if (err) {
            res.send([]);
        } else {
            if (row.rowCount > 0) {
                res.send(row.rows);
            } else {
                res.send([]);
            }
        }
    });
})

router.get('/dashboard', function (req, res, next) {
    if (!req.session || !req.session.userid) {
        res.redirect('/map/authorize');
        return;
    }
    res.render('dashboard');
});

// 主題圖功能 user theme
// router.all("/theme_create", function(req, res, next) {
//     //     data = req.body;
//     //     username = req.session.username;
//     //     if (username) {
//     //         connectPostgres('cdczonegis', `INSERT INTO public.bookmark("user",name,layer,year,bbox) VALUES('${username}','${data.name}','${data.layer}','${data.year}','${data.bbox}');`, '',
//     //             function(result) {
//     //                 res.end();
//     //             });
//     //     } else { res.end('false'); }
// });

// router.all("/theme_delete", function(req, res, next) {
//     //     data = req.body;
//     //     username = req.session.username;
//     //     connectPostgres('cdczonegis', `DELETE FROM public.bookmark where "user" = '${username}' and name = '${data.name}' and bbox = '${data.bbox}' and year = '${data.year}';`, '',
//     //         function(result) {
//     //             res.end();
//     //         });
// });

//theme列表
router.all("/theme", function (req, res, next) {
    if (req.session && req.session.userid) {
        var userid = req.session.userid;
        var pgString = connectionString + config.db.cdczonegis;
        var pgClient = new pg.Client(pgString);
        pgClient.connect();
        var strSql = 'SELECT * FROM user_theme WHERE "USER_ID" = $1;';
        var sqlParmeter = [];
        sqlParmeter.push(userid);
        pgClient.query(strSql, sqlParmeter, function (err, row) {
            pgClient.end();
            if (err) {
                res.send([]);
            } else {
                // var data = row.rows;
                // res.writeHead(200, {
                //     'Content-Type': 'application/json; charset=utf-8'
                // });
                // res.end(JSON.stringify({
                //     data: data
                // }), 'utf-8');
                if (row.rowCount > 0) {
                    res.send(row.rows);
                } else {
                    res.send([]);
                }
            }
        });
    } else {
        res.send([]);
    }
    // connectPostgres('cdczonegis',`SELECT name,layer,year,bbox FROM public.bookmark WHERE "user" = '${username}' `, '',
    //     function(result) {
    //         data = result.rows;
    //         res.writeHead(200, {
    //             'Content-Type': 'application/json; charset=utf-8'
    //         });
    //         res.end(JSON.stringify({
    //             data: data
    //         }), 'utf-8');
    //     });
});

router.post('/user/settings', function (req, res, next) {
    var pgString = connectionString + config.db.cdczonegis;
    var pgClient = new pg.Client(pgString);
    pgClient.connect();
    var strSql = 'SELECT * FROM user_settings WHERE "USER_ID" = $1;';
    var sqlParmeter = [req.body.USER_ID];
    pgClient.query(strSql, sqlParmeter, function (err, row) {
        // pgClient.end();
        if (err) {
            res.send([]);
        } else {
            if (row.rowCount > 0) {
                res.send(row.rows);
            } else {
                // pgClient.connect();
                var strSqlInsert = 'INSERT INTO user_settings ("USER_ID") VALUES ($1);';
                var sqlParmeterInsert = [req.body.USER_ID]
                pgClient.query(strSqlInsert, sqlParmeterInsert, function (err, row) {
                    if (err) { } else { }
                })
                res.send([]);
            }
        }
    });
});

router.post('/user/settings/update_map', function (req, res, next) {
    var result = {}
    var pgString = connectionString + config.db.cdczonegis;
    var pgClient = new pg.Client(pgString);
    pgClient.connect();
    var strSql = 'UPDATE user_settings SET "USER_MAP"=$1, "USER_SETTING"=$2 WHERE "USER_ID"=$3;';
    var sqlParmeter = [req.body.USER_MAP, req.body.USER_SETTING, req.body.USER_ID]
    console.log(sqlParmeter)
    pgClient.query(strSql, sqlParmeter, function (err, row) {
        pgClient.end();
        if (err) {
            result.error = "sql_failed"
            result.errorMsg = "資料修改失敗。(" + err + ")"
        } else {
            result.success = true
        }
        res.send(result);
    });
})

router.all('/dropbox/file', function (req, res, next) { })

router.all('/dropbox/thumbnail', function (req, res, next) { })

router.post('/log', function (req, res, next) {

})

router.all('/information', function (req, res, next) {
    var mdPath = path.join(__dirname, '..', 'public', 'assets', 'doc', 'Info.md'); //'../public/assets/doc/Info.md'
    var strMD = fs.readFileSync(mdPath, "utf8");
    console.log(strMD);
    var strHTML = markdown.toHTML(strMD, 'Maruku');
    res.send({
        html: strHTML
    });
})


router.post('/user/wordFile',function(req,res){
    if (req.body) {
        var data=req.body
    }
    //prepare
        var JSZip = require('jszip');
        var Docxtemplater = require('docxtemplater');


        //Load the docx file as a binary
        var content = fs.readFileSync("../map/public/assets/doc/template_for_apply.docx", "binary");
        var zip = new JSZip(content);
        var doc = new Docxtemplater();
        doc.loadZip(zip);
    //convert data format
        var date_format;
        var TW_date = new Date();
        TW_date.setHours(TW_date.getHours() + 8);
        TW_date = new Date(TW_date).toISOString()

        var year = (parseInt(TW_date.substring(0, 4)) - 1911).toString();
        var month = (TW_date.substring(5, 7)).toString();
        var day = TW_date.substring(8, 10);
        date_format = year + "年" + month + "月" + day + "日"
    //set data
        var id = data.app_id;
        id = id.substring(0,6) + "****";
    //set the templateVariables
        doc.setData({
        app_name: data.app_name,
        app_organization: data.app_organization,
        app_email: data.app_email,
        app_date: date_format,
        app_id: id,
        app_phone: data.app_phone
    })
    try {
        // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
        doc.render()
    }
    catch (error) {
        var e = {
            message: error.message,
            name: error.name,
            stack: error.stack,
            properties: error.properties,
        }
        console.log(JSON.stringify({ error: e }));
        // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
        throw error;
    }

    var buf = doc.getZip()
        .generate({ type: 'base64' });
    var result={result:"success",content:buf}
    res.send(result);

    // var buf = doc.getZip()
    // .generate({type: 'nodebuffer'});

    // // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
    // fs.writeFileSync(path.resolve("../map/public/assets/doc/", 'output.docx'), buf);
    // var filename = path.basename("../map/public/assets/doc/output.docx");
    // res.setHeader('Content-disposition', 'attachment; filename=' +filename);
    // res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    // var filePath = "../map/public/assets/doc/"; // Or format the path using the `id` rest param
    // var fileName = "output.docx"; // The default name the browser will use

    // res.download(filePath + fileName);
    
})

module.exports = router;