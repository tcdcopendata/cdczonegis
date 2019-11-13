var objOrg = {};
var selectLevel, selectCity, selectUnit, selectItem;

function selectDropdownLevel(level) {
    if (selectLevel != level) {
        selectLevel = level;
        selectCity = null;
        selectUnit = null;
        $("#btnOrgLevel").html(selectLevel + '<span class="caret"></span>');
        $("#btnOrgLevel").val(selectLevel);

        $('#btnOrgCity').html('行政區<span class="caret"></span>');
        $('#selectDropdownCity').html('');
        $('#btnOrgUnit').html('機關單位<span class="caret"></span>');
        $('#selectDropdownUnit').html('');

        if ($("#btnOrgLevel").val() == '衛生所') {
            $('#divDropdownCity').show();
            $('#divDropdownUnit').hide();
            Object.keys(objOrg[selectLevel]).forEach(function (city) {
                $('#selectDropdownCity').append('<li><a href = "#">' + city + '</a></li >');
            });
        } else {
            $('#divDropdownCity').hide();
            $('#divDropdownUnit').show();
            Object.keys(objOrg[selectLevel]).forEach(function (unit) {
                $('#selectDropdownUnit').append('<li><a href = "#">' + unit + '</a></li >');
            });
        }

        $('#textSelectedUnit').html('請選擇機關單位');
        $('#textSelectedUnit').css('color', 'red');
        selectItem = null;
    }
}
function selectDropdownCity(city) {
    if (selectCity != city) {
        selectCity = city;
        selectUnit = null;
        $("#btnOrgCity").html(selectCity + '<span class="caret"></span>');
        $("#btnOrgCity").val(selectCity);

        $('#btnOrgUnit').html('機關單位<span class="caret"></span>');
        $('#selectDropdownUnit').html('');

        $('#divDropdownUnit').show();
        Object.keys(objOrg[selectLevel][selectCity]).forEach(function (unit) {
            $('#selectDropdownUnit').append('<li><a href = "#">' + unit + '</a></li >');
        });

        $('#textSelectedUnit').html('請選擇機關單位');
        $('#textSelectedUnit').css('color', 'red');
        selectItem = null;
    }
}
function selectDropdownUnit(unit) {
    if (selectUnit != unit) {
        selectUnit = unit;
        $('#btnOrgUnit').html(unit + '<span class="caret"></span>');

        $('#textSelectedUnit').html(unit);
        $('#textSelectedUnit').css('color', 'black');
        if (selectLevel == '衛生所') {
            selectItem = objOrg[selectLevel][selectCity][selectUnit];
        } else {
            selectItem = objOrg[selectLevel][selectUnit];
        }
    }
}

function userOrgList() {
    $.get({
        url: '/map/authorize/get_organization',
        async: false,
        dataType: 'json'
    }).done(function (result) {
        if (result.error) {
            swal({
                title: "取得權限列表錯誤",
                text: result.errorMsg,
                icon: "warning",
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "確定",
            })
        } else {
            objOrg['全國'] = {};
            objOrg['區管中心'] = {};
            objOrg['衛生局'] = {};
            objOrg['衛生所'] = {};
            result.forEach(function (item) {
                switch (item['ORGANIZATION_LEVEL']) {
                    case 1:
                        objOrg['全國'][item.ORGANIZATION_NAME] = item;
                        break;
                    case 2:
                        objOrg['區管中心'][item.ORGANIZATION_NAME] = item;
                        break;
                    case 3:
                        objOrg['衛生局'][item.ORGANIZATION_NAME] = item;
                        break;
                    case 4:
                        if (!objOrg['衛生所'][item.CITY]) {
                            objOrg['衛生所'][item.CITY] = {};
                        }
                        objOrg['衛生所'][item.CITY][item.ORGANIZATION_NAME] = item;
                        break;
                }
            });
            console.log(objOrg);
        }
    })
}

function user_apply() {
    var error_content = ""
    if ($("#txt_userid").val() == "") {
        error_content += "身分證為必填!\n"
    }
    if (checkTwID($("#txt_userid").val()) == false) {
        error_content += "身分證格式錯誤!\n"
    }
    if ($("#txt_name").val() == "") {
        error_content += "姓名為必填!\n"
    }
    if ($("#txt_email").val() == "") {
        error_content += "E-mail為必填!\n"
    }
    if (!selectItem) {
        error_content += "機關單位為必填!\n"
    }
    // if ($("#txt_organization").val() == "") {
    //     error_content += "機關單位為必填!\n"
    // }
    if (error_content != "") {
        swal({
            title: "填寫錯誤",
            text: error_content,
            icon: "warning",
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "確定",
        })
    } else {
        var postdata = {
            name: $("#txt_name").val(),
            userid: $("#txt_userid").val(),
            // organization: $("#txt_organization").val(),
            organization_id: selectItem.ORGANIZATION_ID,
            organization_name: selectItem.ORGANIZATION_NAME,
            organization_rno: $("#txt_org_rno").val(),
            email: $("#txt_email").val(),
            tel: $("#txt_tel").val()
        }
        $.post({
            url: '/map/authorize/user_apply',
            async: false,
            dataType: 'json',
            cache: false,
            data: postdata
        }).done(function (result) {
            if (result.error) {
                swal({
                    title: "申請錯誤",
                    text: result.errorMsg,
                    icon: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "確定",
                })
            } else {
                swal({
                    title: "完成申請",
                    text: "申請已完成，接下來將會自動下載帳號申請書，請填寫並送交權責單位開通帳號。",
                    icon: "success",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "確定",
                }).then(function () {
                    user_data_clean();
                    // window.open('/map/assets/doc/帳號申請書.docx', '_blank');
                    setWordFile()
                })
            }
        })
    }
}

function setWordFile(){
    var postdata={
        app_name:$("#txt_name").val(),
        app_organization:$("#textSelectedUnit").text(),
        app_email:$("#txt_email").val(),
        app_id:$("#txt_userid").val(),
        app_phone:$("#txt_tel").val()
    };
    $.post({
        url: '/map/user/wordFile',
        async: false,
        dataType: 'json',
        cache: false,
        data: postdata
    }).done(function (result) {
        $("#applybutton").remove();
        var link = document.createElement("button");
        // link.id="downloadwordFile";
        // link.download = "申請表";
        // link.href = "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64," + result.content;
        // $("#downloadwordFile").click();
        // $("#download").append(link);
        $("#download").append("<button id=\"downloadwordFile\" class=\"btn btn-warning\" onclick=\"location.href='data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,"+result.content+"'\" type='button'>按此下載申請表</button>");
        $("#downloadwordFile").click();
    })

}
function user_data_clean() {
    $("#txt_name").val("")
    $("#txt_userid").val("")
    // $("#txt_organization").val("")
    selectDropdownLevel('全國');
    $("#txt_email").val("")
    $("#txt_tel").val("")
}

function checkTwID(id) {
    //建立字母分數陣列(A~Z)
    var city = new Array(
        1, 10, 19, 28, 37, 46, 55, 64, 39, 73, 82, 2, 11,
        20, 48, 29, 38, 47, 56, 65, 74, 83, 21, 3, 12, 30
    )
    id = id.toUpperCase();
    // 使用「正規表達式」檢驗格式
    if (id.search(/^[A-Z](1|2)\d{8}$/i) == -1) {
        //alert('基本格式錯誤');
        return false;
    } else {
        //將字串分割為陣列(IE必需這麼做才不會出錯)
        id = id.split('');
        //計算總分
        var total = city[id[0].charCodeAt(0) - 65];
        for (var i = 1; i <= 8; i++) {
            total += eval(id[i]) * (9 - i);
        }
        //補上檢查碼(最後一碼)
        total += eval(id[9]);
        //檢查比對碼(餘數應為0);
        return ((total % 10 == 0));
    }
}