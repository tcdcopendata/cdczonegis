init()

function init() {
    $(document).ready(function() {
        $('.footable').footable();
        $('.footable2').footable();
    })
}

list_all_tiles()

function list_all_tiles() {
    $.ajax({
        url: "/map/admin/permission/list_tile",
        async: true,
        dataType: 'json',
        cache: false
    }).done(function(result) {
        $("#list_all_tile tr").remove();
        var tbody = document.getElementById("list_all_tile");
        var col = ["Name", "FunctionName", "Source", "DataCount", "Format", "Frequency", "Table", "DateCreate", "Description", "DateUpdate", "Enable"]
        for (var i = 0; i < result.length; i++) {
            var tr = document.createElement("tr")
            var rows = []
            for (var j = 0; j < col.length; j++) {
                var td = document.createElement("td");
                switch (col[j]) {
                    case "Enable":
                        if (result[i][col[j]] == 1)
                            td.textContent = '啟用';
                        else
                            td.textContent = '停用';
                        tr.appendChild(td);
                        break;
                    case "DateCreate":
                    case "DateUpdate":
                        var date = new Date(result[i][col[j]]);
                        // date.setUTCHours(8)
                        td.textContent = date ? date.toLocaleDateString() : '';
                        tr.appendChild(td);
                        break;
                    default:
                        td.textContent = result[i][col[j]]
                        tr.appendChild(td);
                        break;
                }
            }
            var td_button = document.createElement("td");
            var btn_edit = document.createElement("button");
            btn_edit.className = "btn btn-primary";
            btn_edit.textContent = LanguageValue.Admin.Permission.ButtontextEdit;
            btn_edit.onclick = modal_edit
            btn_edit.object = result[i]
            td_button.appendChild(btn_edit);
            tr.appendChild(td_button);
            tbody.appendChild(tr);
        }
        $('#table_tile').trigger('footable_initialize')
    })
}

function modal_create() {
    $('#modal_create').modal()

    $('#txt_create_functionname').val('')
    $('#txt_create_name').val('')
    $('#txt_create_source').val('')
    $('#txt_create_format').val('')
    $('#txt_create_frequency').val('')
    $('#txt_create_table').val('')
    $('#txt_create_description').val('')
    $('#chk_create_status').prop("checked", true)

    $('#btn_create_confirm').unbind()
    $('#btn_create_confirm').click(function() {
        var postdata = {
            Name: $('#txt_create_name').val(),
            Source: $('#txt_create_source').val(),
            Format: $('#txt_create_format').val(),
            Frequency: $('#txt_create_frequency').val(),
            Table: $('#txt_create_table').val(),
            Description: $('#txt_create_description').val(),
            Enable: $('#chk_create_status').prop("checked") ? 1 : 0,
            FunctionName: $('#txt_create_functionname').val()
        }
        $.ajax({
            url: '/map/admin/permission/create_tile',
            async: false,
            dataType: 'json',
            cache: false,
            method: 'POST',
            data: postdata
        }).done(function(result) {
            if (result.error) {
                swal({
                    title: "錯誤",
                    text: "圖層資料新增錯誤（" + result.errorMsg + "）",
                    icon: "warning",
                });
            } else {
                swal({
                    title: "新增成功",
                    text: "圖層資料新增成功！",
                    icon: "success",
                });
                list_all_tiles()
                $('#modal_create').modal('hide')
            }
        })
    })
}

function modal_edit() {
    // ["Name", "FunctionName", "Source", "DataCount", "Format", "Frequency", "Table", "DateCreate", "Description", "DateUpdate", "Enable"]
    $('#modal_edit').modal()
    var detail = $(this)[0].object
    $('#txt_name').val(detail.Name)
    $('#txt_source').val(detail.Source)
    $('#txt_format').val(detail.Format)
    $('#txt_frequency').val(detail.Frequency)
    $('#txt_table').val(detail.Table)
    $('#txt_description').val(detail.Description)
    if (detail.Enable == "1") {
        $('#chk_status').prop("checked", true)
    } else {
        $('#chk_status').prop("checked", false)
    }

    $('#btn_delete').click(function() {
        swal({
            title: "確認刪除？",
            text: "確定刪除此圖層介接資訊? (此動作無法還原)",
            icon: "warning",
            confirmButtonText: "確定",
            cancelButtonText: "取消",
            buttons: true,
        }).then(function(isDelete) {
            if (isDelete) {
                var postdata = {}
                postdata.ID = detail.ID
                $.ajax({
                    url: '/map/admin/permission/delete_tile',
                    async: false,
                    dataType: 'json',
                    cache: false,
                    method: 'POST',
                    data: postdata
                }).done(function(result) {
                    if (result.error) {
                        swal({
                            title: "錯誤",
                            text: "圖層資料刪除錯誤（" + result.errorMsg + "）",
                            icon: "warning",
                        });
                    } else {
                        list_all_tiles()
                        $('#modal_edit').modal('hide')
                    }
                })
            } else {

            }
        })
    })
    $('#btn_edit_confirm').unbind()
    $('#btn_edit_confirm').click(function() {
        // [req.body.Name, req.body.Source, req.body.Format, req.body.Frequency, req.body.Table, req.body.Description, req.body.Enable, req.body.ID]
        var postdata = {
            ID: detail.ID,
            Name: $('#txt_name').val(),
            Source: $('#txt_source').val(),
            Format: $('#txt_format').val(),
            Frequency: $('#txt_frequency').val(),
            Table: $('#txt_table').val(),
            Description: $('#txt_description').val(),
            Enable: $('#chk_status').prop("checked") ? 1 : 0
        }
        $.ajax({
            url: '/map/admin/permission/update_tile',
            async: false,
            dataType: 'json',
            cache: false,
            method: 'POST',
            data: postdata
        }).done(function(result) {
            if (result.error) {
                swal({
                    title: "錯誤",
                    text: "圖層資料更新錯誤（" + result.errorMsg + "）",
                    icon: "warning",
                });
            } else {
                swal({
                    title: "更新成功",
                    text: "圖層資料更新成功！",
                    icon: "success",
                });
                list_all_tiles()
            }
        })
    })
}