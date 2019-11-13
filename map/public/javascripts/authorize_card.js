var formData = {
    cardType: "",
    id: "",
    name: "",
    data: "",
    signature: "",
    authData: "",
    op: "",
    empID: "",
    method: "check_card",
}

function initUI() {
    // $('#tab_loginType a:last').tab('show')
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("href");
    });
    $('a[data-toggle="tab"]').click(function (e) {
        $('.tab_loginType').removeClass('active')
        $(e.target).parent().addClass('active')

        $('.panel_loginType').hide()
        var target = $(e.target).attr("href");
        $(target).show()
    })

    $('#select_cardType').change(function () {
        if ($('#select_cardType')[0].value == "HC")
            $('#text_pass').show()
        else
            $('#text_pass').hide()
    })

    getCardLoginVariable();
}

initUI()

function getCardLoginVariable() {
    $.ajax({
        url: '/map/authorize_card_variable',
        async: false,
        dataType: 'json',
        cache: false,
        method: 'POST'
    }).done(function (result) {
        if (result.error) {} else {
            if (result.success) {
                formData.authData = result.authdata
                formData.data = formData.authData
            } else {

            }
        }
    })
}

function formData_submit(formData) {
    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    formData.authData = formData.data
    $.ajax({
        url: '/map/authorize_check',
        async: false,
        dataType: 'json',
        cache: false,
        method: 'POST',
        headers: {
            'CSRF-Token': token
        },
        data: formData
    }).done(function (result) {
        if (result.success) {
            location.href = '/map'
        } else {
            if (result.err) {
                swal({
                    title: "錯誤",
                    text: "讀卡機登入錯誤（" + result.errorMsg + "）",
                    icon: "warning",
                });
            }
        }
    })
}

//<input type="hidden" id="authData"  runat="server"/>
//<input type="hidden" name="signature" value=""/>
//<input type="hidden" name="id" value=""/>
//<input type="hidden" name="empID" value=""/>
//<input type="hidden" name="name" value=""/>
//<input type="hidden" name="pass2" value=""/>
//<input type="hidden" id="op"  runat="server"/>
var isIE = true;

if ((navigator.userAgent.indexOf("MSIE") == -1 && navigator.userAgent.indexOf("Trident/") == -1)) {
    isIE = false;
}

var installErrorGPKIMsg = "您的電腦無自然人憑證卡元件，請參考卡片元件下載說明。";
var installErrorHCAMsg = "您的電腦無醫事人員卡及健保卡元件，請參考卡片元件下載說明。";
var installErrorHCACSMsg = "您的電腦無健保卡機讀醫事人員卡元件，請參考卡片元件下載說明。";
var authProcessingMsg = "<font color=#434343><strong>認證中，請稍後......</strong></font>";

var sGPKICode =
    '<OBJECT' +
    ' classid="CLSID:3C232DA1-E9AC-4C74-A792-2A686F7315EE"' +
    ' codebase="https://urmsso.cdc.gov.tw/changing/FSGPKICryptATL.cab#version=2,1,13,302"' +
    ' width=0' +
    ' height=0' +
    ' onerror="installErrorGPKI()"' +
    ' id="fsgpkicrypt"' +
    '>' +
    '</OBJECT>';

var sHCACode =
    '<OBJECT' +
    ' classid="CLSID:BB76BF14-7D3D-48CA-8824-42CA1A8FB040"' +
    ' codebase="https://urmsso.cdc.gov.tw/changing/FSHCAATL.cab#version=2,2,15,726"' +
    ' width=0' +
    ' height=0' +
    ' onerror="installErrorHCA()"' +
    ' id="fshca"' +
    '>' +
    '</OBJECT>';

var sHCACSCode =
    '<OBJECT' +
    ' classid="CLSID:9E031C0E-1474-4A46-8104-A881DFDB0F9A"' +
    ' codebase="https://urmsso.cdc.gov.tw/changing/CGHCACSAPIATL.cab#Version=1,1,15,506"' +
    //' codebase="CGHCACSAPIATL.cab#Version=1,1,15,506"' +
    ' width=0' +
    ' height=0' +
    ' onerror="installErrorHCACS()"' +
    ' id="cghcacs"' +
    '>' +
    '</OBJECT>';

function el(id) {
    if (document.getElementById) {
        return document.getElementById(id);
    }
    return false;
}

function installErrorGPKI() {
    el("errorDisplay").innerHTML = installErrorGPKIMsg;
}

function installErrorHCA() {
    el("errorDisplay").innerHTML = installErrorHCAMsg;
}

function installErrorHCACS() {
    el("errorDisplay").innerHTML = installErrorHCACSMsg;
}

function InstallServiSign() {
    var ChromeSetupFile = 'https://urmsso.cdc.gov.tw/changing/CDCPKI_Setup.exe';

    var r = confirm("您的系統尚未安裝疾管署安控元件，請按[確定]下載安裝檔，並執行安裝!");
    if (r == true) {
        location.href = ChromeSetupFile;
    } else {
        alert("您選擇取消安裝，系統將無法使用卡片!");
    }
}

function checkField(obj) {
    var temp = obj;
    var chksapos = false;
    for (var i = 0; i < temp.length; i++) {
        begin = temp.indexOf("'");
        if (begin != -1) {
            if (chksapos && begin > 0) {
                return true;
            } else {
                chksapos = true;
                temp = temp.substring(begin + 1, temp.length);
            }
        }
    }
}

function checkATL() {
    el("errorDisplay").innerHTML = authProcessingMsg;
    var cardType = $('#select_cardType')[0].value
    formData.cardType = cardType

    if (cardType == "HC") { //健保卡
        if (checkField($('#text_pass')[0].value)) {
            alert("欄位若要用撇號('),請用連續兩個撇號('')");
            $('#text_pass')[0].focus();
            $('#text_pass')[0].select();
            el("errorDisplay").innerHTML = "";
            return;
        }

        if ($('#text_pass')[0].value == "") { //健保卡
            alert("請輸入健保卡密碼");
            $('#text_pass')[0].focus();
            $('#text_pass')[0].select();
            el("errorDisplay").innerHTML = "";
            return;
        }
    }

    if (cardType == "MOICA" || cardType == "CHUNGHWA") { //自然人憑證卡或職員卡
        if (isIE)
            el("div_pluginArea").innerHTML = sGPKICode;
    } else if (cardType == "HC" || cardType == "HPC") { //健保卡或醫事人員卡
        if (isIE)
            el("div_pluginArea").innerHTML = sHCACode;
    } else if (cardType == "HPCCS") { //醫事人員卡-健保專屬讀卡機
        if (isIE)
            el("div_pluginArea").innerHTML = sHCACSCode;
    }

    setTimeout('signData()', 10);
}

// ================  ================
var FS_KU_DIGITAL_SIGNATURE = 0x0080;
var FS_FLAG_SUBJECT_COMMON_NAME = 0x00010000;
var iGPKICount = 0; //避免第一次下載元件出現installErrorGPKI()
var iHCACount = 0; //避免第一次下載元件出現installErrorHCA()

// 轉星星
function transPassword(pass) {
    var temp = "*";
    var pass2 = "";

    for (var i = 0; i < pass.length; i++) {
        pass2 += temp;
    }
    return pass2;
}

function signData() {
    el("errorDisplay").innerHTML = "";
    var cardType = $('#select_cardType')[0].value

    if (cardType == "MOICA") {
        if (isIE) {
            MOICAsign();
        } else {
            MOICAsignServi();
        }
    } else if (cardType == "HPC") {
        if (isIE) {
            HPCsign();
        } else {
            HPCsignServi();
        }
    } else if (cardType == "HC") {
        if (isIE) {
            HCread();
        } else {
            HCreadServi();
        }
    } else if (cardType == "CHUNGHWA") {
        if (isIE) {
            CHUNGHWAsign();
        } else {
            CHUNGHWAsignServi();
        }
    } else if (cardType == "HPCCS") {
        if (isIE) {
            HPCCSsign();
        } else {
            HPCCSsignServi();
        }
    }
}

// 自然人憑證 (IE)
function MOICAsign() {
    try {
        var flags = FS_KU_DIGITAL_SIGNATURE;
        var certs = fsgpkicrypt.FSGPKI_EnumCerts(flags);

        if (certs == null) {
            alert(errorMsg(fsgpkicrypt.get_lastError()));
            alert(fsgpkicrypt.get_lastError());
            return;
        }

        var x509certs = certs.toArray();
        var strX509Cert = x509certs[0];

        //身分證後4碼
        var tailOfCitizenID = fsgpkicrypt.GPKI_GetTailOfCitizenID(strX509Cert, 0);

        if (fsgpkicrypt.get_lastError() != 0) {
            return;
        }


        formData.id = tailOfCitizenID;

        //姓名
        //憑證取得主旨中的 CN
        var cn = fsgpkicrypt.FSCAPICertGetSubject(strX509Cert, FS_FLAG_SUBJECT_COMMON_NAME);
        if (fsgpkicrypt.get_lastError() != 0) {
            formData.name = "";
            return;
        } else {
            formData.name = cn;
        }


        //簽章
        var pincode = "";
        //用 CG_ALGOR_SHA256 的演算法
        var iHashFlag = 0x04;

        // formData.data = "test";
        //var SignData = fsgpkicrypt.FSGPKI_SignData( "", form.data.value , 0 );
        var SignData = fsgpkicrypt.GPKI_SignData("", formData.data, 0, iHashFlag);


        if (fsgpkicrypt.get_lastError() == 0) {
            formData.signature = SignData;
            //alert("MOICA Sign Success=" + SignData);
            formData_submit(formData);
        } else {
            formData.signature = "";
            alert("(" + fsgpkicrypt.get_lastError() + ") " + errorMsg(fsgpkicrypt.get_lastError()));
            return;
        }
    } catch (e) {
        if (iGPKICount > 1) {
            installErrorGPKI();
            iGPKICount = 0;
        } else if (iGPKICount == 0) {
            el("errorDisplay").innerHTML = "請在安裝完自然人憑證卡元件之後，重新按下登入鈕";
            iGPKICount++;
        }
    }
}

// 自然人憑證 非IE)
function MOICAsignServi(form) {
    var cggpkicrypt = null;
    try {
        cggpkicrypt = getCGGPKICryptATLADPTObj();
        if (cggpkicrypt == undefined) {
            InstallServiSign();
            return;
        }
    } catch (e) {
        InstallServiSign();
        return;
    }


    var CG_KU_DIGITAL_SIGNATURE = 0x0080; //自然人-簽章憑證
    var CG_KU_DATA_ENCIPHERMENT = 0x0010; //自然人-加解密憑證
    var flags = CG_KU_DIGITAL_SIGNATURE;

    try {
        var certs = cggpkicrypt.GPKI_EnumCerts(flags);
        if (typeof (certs) == "undefined" || certs == null || certs.length == 0) {
            var errorCode = parseInt(cggpkicrypt.get_lastError());
            alert(errorMsg(errorCode));
            return;
        }

        var x509certs = certs.toArray();
        var strX509Cert = x509certs[0];

        //身分證後4碼
        var tailOfCitizenID = cggpkicrypt.GPKI_GetTailOfCitizenID(strX509Cert, 0);

        if (cggpkicrypt.get_lastError() != 0) {
            return;
        }


        formData.id = tailOfCitizenID;


        //姓名
        //憑證取得主旨中的 CN
        var cn = cggpkicrypt.CAPICertGetSubject(strX509Cert, FS_FLAG_SUBJECT_COMMON_NAME);
        if (cggpkicrypt.get_lastError() != 0) {
            formData.name = "";
            return;
        } else {
            formData.name = cn;
        }


        //簽章
        var pincode = "";
        //用 CG_ALGOR_SHA256 的演算法
        var iHashFlag = 0x04;

        var SignData = cggpkicrypt.GPKI_SignData(pincode, formData.data, "MS950", 0, iHashFlag);

        if (cggpkicrypt.get_lastError() == 0) {
            formData.signature = SignData;
            //alert("MOICA Sign Success=" + SignData);
            formData_submit(formData);
        } else {
            formData.signature = "";
            alert("(" + cggpkicrypt.get_lastError() + ") " + errorMsg(cggpkicrypt.get_lastError()));
            return;
        }
    } catch (e) {
        alert(e);
        if (iGPKICount > 1) {
            installErrorGPKI();
            iGPKICount = 0;
        } else if (iGPKICount == 0) {
            el("errorDisplay").innerHTML = "請在安裝完自然人憑證卡元件之後，重新按下登入鈕";
            iGPKICount++;
        }
    }
}
/* 
 * fshca return define
 */

var FSCARD_RTN_SUCCESS = 0;
var FSCARD_RTN_CONNECT_FAIL = 3001;
var FSCARD_RTN_SELECT_APPLET_FAIL = 3002;
var FSCARD_RTN_ESTABLISH_CONTEXT_FAIL = 3003;
var FSCARD_RTN_CARD_ABSENT = 3005;
var FSCARD_RTN_TRANSMIT_ERROR = 3006;
var FSCARD_RTN_GET_DATA_ERROR = 3007;
var FSCARD_RTN_LOGIN_FAIL = 3008;
var FSCARD_RTN_READERS_BUFFER_FAIL = 3009;
var FSCARD_RTN_GET_READERS_FAIL = 3010;
var FSCARD_RTN_NO_READER = 3011;
var FSCARD_RTN_MEMALLOC_ERROR = 3012;
var FSCARD_RTN_LIST_READERS_ERROR = 3013;
var FSCARD_RTN_CHAR2WCHAR_ERROR = 3014;
var FSCARD_RTN_WCHAR2CHAR_ERROR = 3015;
var FSCARD_RTN_INVALID_PARAM = 3016;
var FSCARD_RTN_LIB_EXPIRE = 3017;
var FSCARD_RTN_GEN_PKCS7_FAIL = 3018;
var FSCARD_RTN_DATA_HASH_ERROR = 3019;
var FSCARD_RTN_PIN_LOCK = 3021;
var FSCARD_RTN_UNKNOWN_ERROR = 3999;
/*
    GPKI return define  
*/
var FSGPKI_RTN_CONNECT_FAIL = 9056;
var FSGPKI_RTN_ESTABLISH_CONTEXT_FAIL = 9057;
var FSGPKI_RTN_LOGIN_CANCEL = 5070;
var FSGPKI_RTN_PIN_INCORRECT = 9039;
var FSGPKI_RTN_PIN_LOCK = 9043;

// 醫事人員卡 (IE)
function HPCsign(form) {
    try {
        var allReader = fshca.FSHCA_GetReaderNames(0);
        var rtn;

        if (allReader == null) {
            //alert("找不到可使用的讀卡機!");
        } else {
            var readers = allReader.toArray();
            for (var i = 0; i < readers.length; i++) {
                //alert("readers1[i]="+readers[i]);
                rtns = fshca.FSHCA_HPCBasicDataByReader(readers[i], 0);
                if (fshca.FSHCA_GetErrorCode() == FSCARD_RTN_SUCCESS) {
                    //alert("FSHCA_HPCBasicData run success");
                    infos = rtns.toArray();

                    formData.id = infos[4];
                    formData.name = infos[0];
                    //簽章
                    //alert("readers2[i]="+readers[i]);
                    var iHashFlag = 0x04;
                    var SignData = fshca.HCA_SignByReader(readers[i], "", formData.data, 0, iHashFlag);
                    if (fshca.FSHCA_GetErrorCode() == FSCARD_RTN_SUCCESS) {
                        formData.signature = SignData;
                        //alert("HPC Sign Success");
                        formData_submit(formData);
                        break;
                    } else {
                        formData.signature = "";
                        alert("(" + fshca.FSHCA_GetErrorCode() + ") " + errorMsg(fshca.FSHCA_GetErrorCode()));
                        return;
                    }
                } else if (fshca.FSHCA_GetErrorCode() != 0 && i + 1 == readers.length) {
                    alert("(" + fshca.FSHCA_GetErrorCode() + ")" + errorMsg(fshca.FSHCA_GetErrorCode()));
                    return;
                }
            }
        }
    } catch (e) {
        if (iHCACount > 1) {
            installErrorHCA();
            iHCACount = 0;
        } else if (iHCACount == 0) {
            el("errorDisplay").innerHTML = "請在安裝完醫事人員卡及健保卡元件之後，重新按下登入鈕";
            iHCACount++;
        }
    }
}

// 醫事人員卡 (非IE)
function HPCsignServi(form) {
    var cghca = null;
    try {
        cghca = getCGHCAATLADPTObj();
        if (cghca == undefined) {
            InstallServiSign();
            return;
        }
    } catch (e) {
        InstallServiSign();
        return;
    }

    try {
        var allReader = cghca.HCA_GetReaderNames(0);
        var rtn;

        if (allReader == null) {
            //alert("找不到可使用的讀卡機!");
        } else {
            var readers = allReader.toArray();
            for (var i = 0; i < readers.length; i++) {
                //alert("readers1[i]="+readers[i]);
                rtns = cghca.HCA_HPCBasicDataByReader(readers[i], 0);
                if (cghca.HCA_GetErrorCode() == FSCARD_RTN_SUCCESS) {
                    //alert("FSHCA_HPCBasicData run success");
                    infos = rtns.toArray();

                    formData.id = infos[4];
                    formData.name = infos[0];
                    //簽章
                    //alert("readers2[i]="+readers[i]);
                    var iHashFlag = 0x04;
                    var SignData = cghca.HCA_SignByReader(readers[i], "", formData.data, 0, iHashFlag);
                    if (cghca.HCA_GetErrorCode() == FSCARD_RTN_SUCCESS) {
                        formData.signature = SignData;
                        //alert("HPC Sign Success");
                        formData_submit(formData);
                        break;
                    } else {
                        formData.signature = "";
                        alert("(" + cghca.HCA_GetErrorCode() + ") " + errorMsg(cghca.HCA_GetErrorCode()));
                        return;
                    }
                } else if (cghca.HCA_GetErrorCode() != 0 && i + 1 == readers.length) {
                    alert("(" + cghca.HCA_GetErrorCode() + ")" + errorMsg(cghca.HCA_GetErrorCode()));
                    return;
                }
            }
        }
    } catch (e) {
        if (iHCACount > 1) {
            installErrorHCA();
            iHCACount = 0;
        } else if (iHCACount == 0) {
            el("errorDisplay").innerHTML = "請在安裝完醫事人員卡及健保卡元件之後，重新按下登入鈕";
            iHCACount++;
        }
    }
}

// 健保卡 (IE)
function HCread(form) {
    try {
        var allReader = fshca.FSHCA_GetReaderNames(0);
        var rtn;

        if (allReader == null) {
            alert("找不到可使用的讀卡機!");
        } else {
            var readers = allReader.toArray();
            for (var i = 0; i < readers.length; i++) {
                rtns = fshca.FSHCA_GetHCBasicDataByReader(readers[i], 0);
                if (fshca.FSHCA_GetErrorCode() == FSCARD_RTN_SUCCESS) {
                    //alert("FSHCA_HCBasicData run success");
                    infos = rtns.toArray();
                    formData.id = infos[2];
                    formData.name = infos[1];
                    formData_submit(formData);
                    break;
                } else if (fshca.FSHCA_GetErrorCode() != 0 && i + 1 == readers.length) {
                    alert("(" + fshca.FSHCA_GetErrorCode() + ")" + errorMsg(fshca.FSHCA_GetErrorCode()));
                    return;
                }
            }
        }
    } catch (e) {
        if (iHCACount > 1) {
            installErrorHCA();
            iHCACount = 0;
        } else if (iHCACount == 0) {
            el("errorDisplay").innerHTML = "請在安裝完醫事人員卡及健保卡元件之後，重新按下登入鈕";
            iHCACount++;
        }
    }
}

// 健保卡 (非IE)
function HCreadServi(form) {
    var cghca = null;
    try {
        cghca = getCGHCAATLADPTObj();
        if (cghca == undefined) {
            InstallServiSign();
            return;
        }
    } catch (e) {
        InstallServiSign();
        return;
    }

    try {
        var allReader = cghca.HCA_GetReaderNames(0);
        var rtn;

        if (allReader == null) {
            alert("找不到可使用的讀卡機!");
        } else {
            var readers = allReader.toArray();
            for (var i = 0; i < readers.length; i++) {
                rtns = cghca.HCA_GetHCBasicDataByReader(readers[i], 0);
                if (cghca.HCA_GetErrorCode() == FSCARD_RTN_SUCCESS) {
                    //alert("FSHCA_HCBasicData run success");
                    infos = rtns.toArray();
                    formData.id = infos[2];
                    formData.name = infos[1];
                    formData_submit(formData);
                    break;
                } else if (cghca.HCA_GetErrorCode() != 0 && i + 1 == readers.length) {
                    alert("(" + cghca.HCA_GetErrorCode() + ")" + errorMsg(cghca.HCA_GetErrorCode()));
                    return;
                }
            }
        }
    } catch (e) {
        if (iHCACount > 1) {
            installErrorHCA();
            iHCACount = 0;
        } else if (iHCACount == 0) {
            el("errorDisplay").innerHTML = "請在安裝完醫事人員卡及健保卡元件之後，重新按下登入鈕";
            iHCACount++;
        }
    }
}

// 醫事人員卡(健保專屬讀卡機) (IE)
function HPCCSsign(form) {
    try {
        var HPC = cghcacs.CGHCACS_GetHPCBasicData(0, 0);
        if (cghcacs.CGHCACS_GetErrorCode() == 0) {
            infos = HPC.toArray();
            formData.id = infos[4];
            formData.name = infos[0];
        } else {
            alert("err:" + cghcacs.CGHCACS_GetErrorCode() + "  " + errorMsg(cghcacs.CGHCACS_GetErrorCode()));
            return;
        }

        //簽章
        //alert("readers2[i]="+readers[i]);
        var iHashFlag = 0x04;
        var pincode = "";
        var SignData = cghcacs.CGHCACS_Sign(0, pincode, formData.data, 0, iHashFlag);

        if (cghcacs.CGHCACS_GetErrorCode() == FSCARD_RTN_SUCCESS) {
            formData.signature = SignData;
            //alert("HPC Sign Success");
            formData_submit(formData);
        } else {
            formData.signature = "";
            alert("(" + cghcacs.CGHCACS_GetErrorCode() + ") " + errorMsg(cghcacs.CGHCACS_GetErrorCode()));
            return;
        }
    } catch (e) {
        if (iHCACount > 1) {
            installErrorHCA();
            iHCACount = 0;
        } else if (iHCACount == 0) {
            el("errorDisplay").innerHTML = "請在安裝完醫事人員卡及健保卡元件之後，重新按下登入鈕";
            iHCACount++;
        }
    }
}

// 醫事人員卡(健保專屬讀卡機) (非IE)
function HPCCSsignServi(form) {
    var cghcacs = null;
    try {
        cghcacs = getCGHCACSAPIATLADPTObj();
        if (cghcacs == undefined) {
            InstallServiSign();
            return;
        }
    } catch (e) {
        InstallServiSign();
        return;
    }


    try {
        var HPC = cghcacs.CGHCACS_GetHPCBasicData(0, 0);
        if (cghcacs.CGHCACS_GetErrorCode() == 0) {
            infos = HPC.toArray();
            formData.id = infos[4];
            formData.name = infos[0];
        } else {
            alert("err:" + cghcacs.CGHCACS_GetErrorCode() + "  " + errorMsg(cghcacs.CGHCACS_GetErrorCode()));
            return;
        }

        //簽章
        //alert("readers2[i]="+readers[i]);
        var iHashFlag = 0x04;
        var pincode = "999999";
        var SignData = cghcacs.CGHCACS_Sign(0, pincode, formData.data, 0, iHashFlag);

        if (cghcacs.CGHCACS_GetErrorCode() == FSCARD_RTN_SUCCESS) {
            formData.signature = SignData;
            //alert("HPC Sign Success");
            formData_submit(formData);
        } else {
            formData.signature = "";
            alert("(" + cghcacs.CGHCACS_GetErrorCode() + ") " + errorMsg(cghcacs.CGHCACS_GetErrorCode()));
            return;
        }
    } catch (e) {
        if (iHCACount > 1) {
            installErrorHCA();
            iHCACount = 0;
        } else if (iHCACount == 0) {
            el("errorDisplay").innerHTML = "請在安裝完醫事人員卡及健保卡元件之後，重新按下登入鈕";
            iHCACount++;
        }
    }
}

// CDC員工證 (IE)
function CHUNGHWAsign(form) {
    try {
        var flags = FS_KU_DIGITAL_SIGNATURE;
        var certs = fsgpkicrypt.FSGPKI_EnumCerts(flags);
        if (certs == null) {
            alert("errorCode:" + fsgpkicrypt.get_lastError() + "errorMsg:" + errorMsg(fsgpkicrypt.get_lastError()));
            return;
        }

        var x509certs = certs.toArray();
        var strX509Cert = x509certs[0];

        //姓名
        //憑證取得主旨中的 CN
        var cn = fsgpkicrypt.FSCAPICertGetSubject(strX509Cert, FS_FLAG_SUBJECT_COMMON_NAME);
        if (fsgpkicrypt.get_lastError() != 0) {
            formData.name = "";
            return;
        } else {
            formData.name = cn;
        }
        //員工編號
        //憑證取得員工編號
        var SubjectDirectoryAttrs = "2.16.886.1.100.2.202";
        var empid = fsgpkicrypt.GPKI_CertGetSubjectDirectoryAttrs(strX509Cert, SubjectDirectoryAttrs, 0);
        if (fsgpkicrypt.get_lastError() != 0) {
            formData.empID = "";
            return;
        } else {
            formData.empID = empid;
        }



        //簽章
        var pincode = "";

        var SignData = fsgpkicrypt.FSGPKI_SignData("", formData.data, 0);

        if (fsgpkicrypt.get_lastError() == 0) {
            formData.signature = SignData;
            //alert("CHUNGHWA Sign Success=" + SignData);
            formData_submit(formData);
        } else {
            formData.signature = "";
            alert("(" + fsgpkicrypt.get_lastError() + ") " + errorMsg(fsgpkicrypt.get_lastError()));
            return;
        }
    } catch (e) {
        if (iGPKICount > 1) {
            installErrorGPKI();
            iGPKICount = 0;
        } else if (iGPKICount == 0) {
            el("errorDisplay").innerHTML = "請在安裝完員工憑證卡元件之後，重新按下登入鈕";
            iGPKICount++;
        }
    }
}

// CDC員工證 (非IE)
function CHUNGHWAsignServi(form) {
    var cggpkicrypt = null;
    try {
        cggpkicrypt = getCGGPKICryptATLADPTObj();
        if (cggpkicrypt == undefined) {
            InstallServiSign();
            return;
        }
    } catch (e) {
        InstallServiSign();
        return;
    }
    try {
        var flags = FS_KU_DIGITAL_SIGNATURE;
        var certs = cggpkicrypt.GPKI_EnumCerts(flags);
        if (typeof (certs) == "undefined" || certs == null || certs.length == 0) {
            var errorCode = parseInt(cggpkicrypt.get_lastError());
            alert(errorMsg(errorCode));
            alert(errorCode);
            return;
        }

        var x509certs = certs.toArray();
        var strX509Cert = x509certs[0];

        //姓名
        //憑證取得主旨中的 CN
        var cn = cggpkicrypt.CAPICertGetSubject(strX509Cert, FS_FLAG_SUBJECT_COMMON_NAME);
        if (cggpkicrypt.get_lastError() != 0) {
            formData.name = "";
            return;
        } else {
            formData.name = cn;
        }
        //員工編號
        //憑證取得員工編號
        var SubjectDirectoryAttrs = "2.16.886.1.100.2.202";
        var empid = cggpkicrypt.GPKI_CertGetSubjectDirectoryAttrs(strX509Cert, SubjectDirectoryAttrs, 0);
        if (cggpkicrypt.get_lastError() != 0) {
            formData.empID = "";
            return;
        } else {
            formData.empID = empid;
        }



        //簽章
        var pincode = "";
        //用 SHA256 的演算法
        var iHashFlag = 0x04;
        var SignData = cggpkicrypt.GPKI_SignData(pincode, formData.data, "MS950", 0, iHashFlag);

        if (cggpkicrypt.get_lastError() == 0) {
            formData.signature = SignData;
            //alert("CHUNGHWA Sign Success=" + SignData);
            formData_submit(formData);
        } else {
            formData.signature = "";
            alert("(" + cggpkicrypt.get_lastError() + ") " + errorMsg(cggpkicrypt.get_lastError()));
            return;
        }
    } catch (e) {
        if (iGPKICount > 1) {
            installErrorGPKI();
            iGPKICount = 0;
        } else if (iGPKICount == 0) {
            el("errorDisplay").innerHTML = "請在安裝完員工憑證卡元件之後，重新按下登入鈕";
            iGPKICount++;
        }
    }
}

//function changeCardType(selected) {
//    try {
//        if (selected == "HC") {

//            el('pwdOrName').innerHTML = "第二層密碼";
//            el('IDOrEmpID').innerHTML = "身分證號碼";

//            if (isIE) {
//                el('installHCA').innerHTML = sHCACode;
//            }
//            //var objtxt = document.getElementById('textfield');
//            //alert(objtxt.value);
//            el('textfield').readOnly = false;
//            el('textfield').style.border = 'thin solid';
//            el('textfield').value = "";
//            el('textfield').focus();

//            el('IDOrEmpID').readOnly = true;
//            el('IDOrEmpID').style.border = '0px';
//            el('IDOrEmpID').value = "";
//        } else if (selected == "MOICA") {

//            el('pwdOrName').innerHTML = "姓　　　名";
//            el('IDOrEmpID').innerHTML = "身分證號碼";
//            if (isIE) {
//                el('installGPKI').innerHTML = sGPKICode;
//            }
//            el('textfield').readOnly = true;
//            el('textfield').style.border = '0px';
//            el('textfield').value = "";

//            el('IDOrEmpID').readOnly = true;
//            el('IDOrEmpID').style.border = '0px';
//            el('IDOrEmpID').value = "";

//        } else if (selected == "HPC") {

//            el('pwdOrName').innerHTML = "姓　　　名";
//            el('IDOrEmpID').innerHTML = "身分證號碼";
//            if (isIE) {
//                el('installHCA').innerHTML = sHCACode;
//            }
//            el('textfield').readOnly = true;
//            el('textfield').style.border = '0px';
//            el('textfield').value = "";

//            el('IDOrEmpID').readOnly = true;
//            el('IDOrEmpID').style.border = '0px';
//            el('IDOrEmpID').value = "";

//        } else if (selected == "CHUNGHWA") {

//            el('pwdOrName').innerHTML = "姓　　　名";
//            el('IDOrEmpID').innerHTML = "員工編號";
//            if (isIE)
//                el('installGPKI').innerHTML = sGPKICode;

//            el('textfield').readOnly = false;
//            el('textfield').style.border = '0px';
//            el('textfield').value = "";

//            el('IDOrEmpID').readOnly = true;
//            el('IDOrEmpID').style.border = '0px';
//            el('IDOrEmpID').value = "";

//        } else if (selected == "HPCCS") {

//            el('pwdOrName').innerHTML = "姓　　　名";
//            el('IDOrEmpID').innerHTML = "身分證號碼";

//            if (isIE)
//                el('installHCACS').innerHTML = sHCACSCode;

//            el('textfield').readOnly = true;
//            el('textfield').style.border = '0px';
//            el('textfield').value = "";

//            el('IDOrEmpID').readOnly = true;
//            el('IDOrEmpID').style.border = '0px';
//            el('IDOrEmpID').value = "";

//        }
//    } catch (e) {
//        alert("網頁反應不正常，請點選瀏覽器上方：重新整理選項");
//    }
//}