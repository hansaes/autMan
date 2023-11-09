$(document).ready(function () {
    autFillRows()
})

//ck识别
function autFillRows(searchvalue) {
    if (!searchvalue) {
        searchvalue = $("#searchInput").val() ? $("#searchInput").val() : ""
    }
    //alert(searchvalue)
    $.get("/varckmaps?searchValue=" + searchvalue, function (response) {
        //alert(JSON.stringify(data))
        if (response.code == 200 && response.data) {
            obj = response.data;
            html = ""
            for (var i = 0; i < obj.length; i++) {
                let qlswitch = ""
                if (obj[i].on) {//启用
                    qlswitch = "checked"
                }
                let envars = ''
                if (obj[i].env_vars && obj[i].env_vars.length > 0) {
                    envars = obj[i].env_vars.join(",")
                }
                let uniquekeys = ''
                if (obj[i].ck_unique_keys && obj[i].ck_unique_keys.length > 0) {
                    uniquekeys = obj[i].ck_unique_keys.join(",")
                }

                html += `<tr>
                    <td>
                      <label class="lyear-checkbox checkbox-primary">
                        <input type="checkbox" name="ids_${obj[i].id}" value="${obj[i].id}"><span></span>
                      </label>
                    </td>`+
                    "<td>" + (obj[i].id) + "</td>" +//name
                    "<td>" + obj[i].note + "</td>" +//开关状态
                    "<td>" + `<label class="lyear-switch switch-solid switch-primary">
                    <input type="checkbox" ${qlswitch} name="switch_${obj[i].id}" id="switch_${obj[i].id}" onchange="autHandleCheckboxChangeEvent(this,'varckmap')">
                    <span></span>
                </label>` + "</td>" +
                    `<td>${envars}</td>
                    <td>${uniquekeys}</td>` +
                    "<td>" + obj[i].main_key + "</td>" +//开关状态
                    "<td>" + obj[i].vss + "</td>" +//开关状态
                    "<td>" + `<div class="btn-group">
                        <a class="btn btn-xs btn-default" href="#!" title="编辑" data-toggle="modal" data-target="#myModal" onclick="autFillModalForm(${obj[i].id},'varckmap');$('.modal-footer').show();"><i class="mdi mdi-pencil"></i></a>
                        <a class="btn btn-xs btn-default example-p-1" href="#!" title="删除" onclick="autDelRow(${obj[i].id},'varckmap',autFillRows)"><i class="mdi mdi-window-close"></i></a>
                </div></td>`+
                    "</tr>"
            }
            //alert(html)
            $("#check-all").attr("checked", false)
            $("#datasets").html(html);
        } else {
            $("#check-all").attr("checked", false)
            html = `<tr><td colspan="9" style="text-align: center;">暂无数据</td></tr>`
            $("#datasets").html(html);
        }
    });
}

//处理表格中的开关
function autHandleCheckboxChangeEvent(checkbox) {
    ids = "[" + checkbox.id.split("_")[1] + "]"
    //alert(ids)
    if (checkbox.checked) {
        // 当前 checkbox 被选中
        $.ajax({
            type: "PUT",
            url: "/varckmaps/enable",
            data: ids,
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                if (response.code == 200) {
                    lightyear.notify('启用成功', 'success', 3000);
                } else {
                    lightyear.notify('启用失败', 'danger', 1000);
                }
            },
        })
    } else {
        //alert("当前 checkbox 被取消选中")
        // 当前 checkbox 被取消选中
        $.ajax({
            type: "PUT",
            url: "/varckmaps/disable",
            data: ids,
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                if (response.code == 200) {
                    lightyear.notify('禁用成功', 'success', 3000);
                } else {
                    lightyear.notify('禁用失败', 'danger', 1000);
                }
            },
        })
    }
}

//用于左上角删除大按钮
function autDelRows() {
    var ids = $('input[name^="ids_"]:checked').map(function () {
        return $(this).val();
    }).get(); // 将所有值添加到一个数组中

    // 如果没有选中任何 checkbox，则返回
    if (ids.length === 0) {
        lightyear.notify("未选择行，请先勾选行", "danger", "3000")
        return;
    }

    $.alert({
        title: '提示框',
        content: '确定删除？',
        buttons: {
            confirm: {
                text: '确认',
                btnClass: 'btn-primary',
                action: function () {
                    //$.alert('你点击了确认!');
                    var ids = $('input[name^="ids_"]:checked').map(function () {
                        return $(this).val();
                    }).get(); // 将所有值添加到一个数组中

                    // 如果没有选中任何 checkbox，则返回
                    if (ids.length === 0) {
                        return;
                    }

                    // 创建Ajax请求
                    $.ajax({
                        url: '/varckmaps', // 请求URL
                        type: 'DELETE', // 请求方法
                        dataType: 'json', // 返回的数据类型
                        data: "[" + ids.join(",") + "]", // 提交的数据
                        success: function (response) { // 请求成功的回调函数
                            console.log('Success:', response);
                            if (response.code == 200) {
                                autFillRows()
                            }
                        },
                        error: function (xhr, status, error) { // 请求失败的回调函数
                            console.log('Error:', error);
                        }
                    });
                }
            },
            cancel: {
                text: '取消',
                action: function () {
                    //$.alert('你点击了取消!');
                }
            }
        }
    });
}

//用于表格每行的结尾操作按钮
function autDelRow(id) {
    $.alert({
        title: '提示框',
        content: '确定删除？',
        buttons: {
            confirm: {
                text: '确认',
                btnClass: 'btn-primary',
                action: function () {
                    //$.alert('你点击了确认!');
                    $.ajax({
                        type: "DELETE",
                        url: "/varckmaps",
                        data: "[" + id + "]",
                        success: function () {
                            autFillRows()
                        }
                    })
                }
            },
            cancel: {
                text: '取消',
                action: function () {
                    //$.alert('你点击了取消!');
                }
            }
        }
    });
}

//清空模态表单
function autClearModalForm() {
    //清空modal_varlink_rule这个表单下所有的input值
    //alert("清空modal_varlink_rule这个表单下所有的input值")
    $("#modal").find("input[type=text], textarea, input[type=email]").val('');
    $("#modal").find("input[type=checkbox]").attr("checked", false);
    $('.modal-footer').show();
}

//提交模态表单
function autSubmitModalForm() {
    // 对表单进行序列化，获取表单数据
    var formData = $("#modal").serialize();
    console.log(JSON.stringify(formData))
    //先获取数据
    $.ajax({
        url: '/varckmaps', // 请求URL
        type: 'POST', // 请求方法
        dataType: 'json', // 返回的数据类型
        data: formData, // 提交的数据
        success: function (response) { // 请求成功的回调函数
            if (response.code == 200) {
                lightyear.notify('保存成功', 'success', 3000);
                autFillRows()
            } else {
                lightyear.notify('保存失败', 'danger', 1000);
            }
        },
        error: function (xhr, status, error) { // 请求失败的回调函数
            console.log('Error:', error);
        }
    });
}

//填充模态表单
function autFillModalForm(id) {
    //先获取数据
    $.get("/varckmaps?id=" + id, function (response) {
        // 将 JSON 数据设置为表单值
        jsonData = response.data;//解析成对象
        $.each(jsonData, function (key, value) {
            var selector = "[name='" + key + "']";
            var $element = $(selector);

            if ($.isPlainObject(value)) {//如果是对象
                $element.val(JSON.stringify(value).replace(/^{|}$/g, ""));
            } else {
                $element.val(value);
            }

            if ($element.is(":radio")) {//如果是单选框
                $element.prop("checked", true);
            }
            if ($element.is(":checkbox")) {//如果是复选框
                $element.prop("checked", parseBool(value.toString()));
            }
        });
    });
}

//启用规则
function autEnableRows() {
    var ids = $('input[name^="ids_"]:checked').map(function () {
        return $(this).val();
    }).get(); // 将所有值添加到一个数组中

    // 如果没有选中任何 checkbox，则返回
    if (ids.length === 0) {
        lightyear.notify("未选择行，请先勾选行", "danger", "3000")
        return;
    }
    //alert(ids)

    // 创建Ajax请求
    $.ajax({
        url: '/varckmaps/enable', // 请求URL
        type: 'PUT', // 请求方法
        dataType: 'json', // 返回的数据类型
        data: "[" + ids.join(",") + "]", // 提交的数据
        contentType: 'application/json',
        success: function (response) { // 请求成功的回调函数
            console.log('Success:', response);
            if (response.code == 200) {
                autFillRows()
            }
        },
        error: function (xhr, status, error) { // 请求失败的回调函数
            console.log('Error:', error);
        }
    });
}

//禁用规则
function autDisableRows() {
    var ids = $('input[name^="ids_"]:checked').map(function () {
        return $(this).val();
    }).get(); // 将所有值添加到一个数组中

    // 如果没有选中任何 checkbox，则返回
    if (ids.length === 0) {
        lightyear.notify("未选择行，请先勾选行", "danger", "3000")
        return;
    }

    // 创建Ajax请求
    $.ajax({
        url: '/varckmaps/disable', // 请求URL
        type: 'PUT', // 请求方法
        dataType: 'json', // 返回的数据类型
        data: "[" + ids.join(",") + "]", // 提交的数据
        contentType: 'application/json',
        success: function (response) { // 请求成功的回调函数
            console.log('Success:', response);
            if (response.code == 200) {
                autFillRows()
            }
        },
        error: function (xhr, status, error) { // 请求失败的回调函数
            console.log('Error:', error);
        }
    });
}
