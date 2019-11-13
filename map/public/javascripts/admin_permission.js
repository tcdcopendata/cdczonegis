list_all_account()

function list_all_account() {
    $.ajax({
        url: "/map/admin/permission/list_under_user",
        async: true,
        dataType: 'json',
        cache: false
    }).done(function(result) {
        $("#list_all_account tr").remove();
        var tbody = document.getElementById("list_all_account");
        var col = ["USER_NAME", "ORGANIZATION_NAME", "EMAIL", "USER_TYPE_NAME", "USER_STATUS"]
        for (var i = 0; i < result.length; i++) {
            var tr = document.createElement("tr");
            var td_first = document.createElement("td");
            tr.appendChild(td_first);
            for (var j = 0; j < col.length; j++) {
                var td = document.createElement("td");
                if (col[j] == "USER_STATUS") {
                    if (result[i][col[j]] == 1)
                        td.innerHTML = '<span class="badge badge-success">啟用</span>'
                    else if (result[i][col[j]] == 0)
                        td.innerHTML = '<span class="badge badge-danger">停用</span>'
                    else if (result[i][col[j]] == -1)
                        td.innerHTML = '<span class="badge badge-warning">未審核</span>'
                    tr.appendChild(td);
                } else {
                    td.textContent = result[i][col[j]]
                    tr.appendChild(td);
                }


                // else {

                //     /*
                //     null 待審核=>允許、不允許
                //     1 已審核=>刪除權限
                //     2 不允許
                //     3 權限已刪除
                //     */
                //     var allow_button = document.createElement("button");
                //     allow_button.className="btn btn-w-m btn-success";
                //     allow_button.textContent="允許"
                //     allow_button.setAttribute("onclick","update_acccount_status(1,"+result[i].app_id+")")
                //     allow_button.setAttribute("style","margin-right:10px");
                //     var reject_button = document.createElement("button");
                //     reject_button.className="btn btn-w-m btn-warning";
                //     reject_button.textContent="拒絕"
                //     reject_button.setAttribute("onclick","update_acccount_status(2,"+result[i].app_id+")")
                //     var delete_button = document.createElement("button");
                //     delete_button.className="btn btn-w-m btn-danger";
                //     delete_button.textContent="刪除權限"
                //     delete_button.setAttribute("onclick","update_acccount_status(3,"+result[i].app_id+")")

                //     var td_button = document.createElement("td");
                //     if(result[i][col[j]]==null || result[i][col[j]]=="null")
                //     {
                //         td.textContent = "待審核"
                //         tr.appendChild(td);                        
                //         td_button.appendChild(allow_button);
                //         td_button.appendChild(reject_button);
                //         tr.appendChild(td_button)
                //     }
                //     else if(result[i][col[j]]=="1")
                //     {
                //         td.textContent = "已審核"
                //         tr.appendChild(td);
                //         td_button.appendChild(delete_button);
                //         tr.appendChild(td_button)
                //     }
                //     else if(result[i][col[j]]=="2")
                //     {
                //         td.textContent = "拒絕"
                //         tr.appendChild(td);
                //         tr.appendChild(td_button)
                //     }
                //     else if(result[i][col[j]]=="3")
                //     {
                //         td.textContent = "權限已刪除"
                //         tr.appendChild(td);
                //         tr.appendChild(td_button)
                //     }                    
                // }
            }
            var td_button = document.createElement("td");
            var btn_edit = document.createElement("button");
            btn_edit.className = "btn btn-primary";
            // btn_edit.className = "btn btn-w-m btn-primary";
            btn_edit.textContent = LanguageValue.Admin.Permission.ButtontextEdit;
            // btn_edit.addEventListener("click", function() {
            //     console.log('hahaha')
            //     modal_edit(result[i])
            // })
            btn_edit.onclick = modal_edit
            btn_edit.object = result[i]
            td_button.appendChild(btn_edit);
            tr.appendChild(td_button);
            tbody.appendChild(tr);
        }
    })
}

function modal_create() {
    $('#modal_create').modal()
}

function modal_edit() {
    // ["USER_NAME", "ORGANIZATION_NAME", "EMAIL", "USER_TYPE_NAME", "USER_STATUS"]
    var detail = $(this)[0].object
    $('#modal_edit').modal()
    $('#txt_name').val(detail.USER_NAME)
    $('#txt_email').val(detail.EMAIL)
    $('#textSelectedUnit_value').text(detail.ORGANIZATION_ID)
    $('#textSelectedUnit').text(detail.ORGANIZATION_NAME)
    $('#txt_tel').val(detail.TEL)
    switch (detail.USER_TYPE_ID) {
        case "1":
            $('#btn_type').html('一般使用者<span class="caret"></span>')
            break;
        case "2":
            $('#btn_type').html('決策人員<span class="caret"></span>')
            break;
        case "3":
            $('#btn_type').html('管理員<span class="caret"></span>')
            break;
    }
    if (detail.USER_STATUS === 1) {
        $('#chk_status').prop("checked", true)
    } else {
        $('#chk_status').prop("checked", false)
    }


    $('#btn_delete').click(function() {
        swal({
            title: "確認刪除？",
            text: "確定刪除此使用者? (此動作無法還原)",
            icon: "warning",
            // confirmButtonColor: "#DD6B55",
            confirmButtonText: "確定",
            cancelButtonText: "取消",
            buttons: true,
            // dangerMode: true
        }).then(function(isDelete) {
            if (isDelete) {
                var postdata = {}
                postdata.USER_ID = detail.USER_ID
                $.ajax({
                    url: '/map/admin/permission/delete_user',
                    async: false,
                    dataType: 'json',
                    cache: false,
                    method: 'POST',
                    data: postdata
                }).done(function(result) {
                    if (result.error) {
                        swal({
                            title: "錯誤",
                            text: "資料刪除錯誤（" + result.errorMsg + "）",
                            icon: "warning",
                        });
                    } else {
                        list_all_account()
                        $('#modal_edit').modal('hide')
                    }
                })
            } else {

            }
        })
    })
    $('#btn_edit_confirm').unbind()
    $('#btn_edit_confirm').click(function() {
        var typeID = 2
        switch ($('#btn_type').text()) {
            case "一般使用者":
                typeID = 1
                break;
            case "決策人員":
                typeID = 2
                break;
            case "管理員":
                typeID = 3
                break;
        }
        var organ_id;
        if(selectItem!=undefined){
            organ_level=selectItem.ORGANIZATION_LEVEL;
            organ_id=selectItem.ORGANIZATION_ID;
        }else{
            organ_id=parseInt($("#textSelectedUnit_value").text());
            organ_level=parseInt($("#textSelectedUnit_level").text());
        }
        var postdata = {
            USER_ID: detail.USER_ID,
            USER_NAME: $('#txt_name').val(),
            EMAIL: $('#txt_email').val(),
            ORGANIZATION_NAME: $('#textSelectedUnit').text(),
            ORGANIZATION_ID: organ_id,
            ORGANIZATION_LEVEL:organ_level,
            TEL: $('#txt_tel').val(),
            USER_TYPE_NAME: $('#btn_type').text(),
            USER_TYPE_ID: typeID,
            USER_STATUS: $('#chk_status').prop("checked") ? 1 : 0
        }
        $.ajax({
            url: '/map/admin/permission/update_user',
            async: false,
            dataType: 'json',
            cache: false,
            method: 'POST',
            data: postdata
        }).done(function(result) {
            if (result.error) {
                swal({
                    title: "錯誤",
                    text: "資料修改錯誤（" + result.errorMsg + "）",
                    icon: "warning",
                });
            } else {
                swal({
                    title: "更新成功",
                    text: "資料更新成功！",
                    icon: "success",
                });
                list_all_account()
            }
        })
    })
}

function setType(type) {
    switch (type) {
        case "1":
            $('#btn_type').html('一般使用者<span class="caret"></span>')
            break;
        case "2":
            $('#btn_type').html('決策人員<span class="caret"></span>')
            break;
        case "3":
            $('#btn_type').html('管理員<span class="caret"></span>')
            break;
    }
}