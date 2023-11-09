$(function () {
    $('.search-bar .dropdown-menu a').click(function () {
        var field = $(this).data('field') || '';
        $('#search-field').val(field);
        $('#search-btn').html($(this).text() + ' <span class="caret"></span>');
    });
});

$(document).ready(function () {
    autFillRows()

    //为搜索框的回车事件添加监听
    $("#searchInput").on("keydown", function (event) {
        if (event.keyCode === 13) { // 检查是否按下了回车键
            //alert("按钮回车键")
            event.preventDefault(); // 阻止默认行为，这里是阻止提交表单
            autSearchRows(event); // 调用搜索函数
        }
    });
})

function autSearchRows(event) {
    event.preventDefault(); // 阻止表单的默认提交行为
    const inputValue = $("#searchInput").val(); // 获取输入框的值
    console.log(`正在搜索：${inputValue}`); // 执行搜索操作，这里用console输出结果
    autFillRows(inputValue)
    //$("#searchInput").val(''); // 将输入框中的值清空
}

//获取搬运规则并显示
function autFillRows(searchvalue) {
    if (!searchvalue) {
        searchvalue = $("#searchInput").val()?$("#searchInput").val():""
    }
    //alert(searchvalue)
    $.get("/qinglong?searchValue=" + searchvalue, function (response) {
        //alert(JSON.stringify(data))
        if (response.code==200) {
            obj = response.data;
            html = ""
            for (var i = 0; i < obj.length; i++) {
                let qlswitch = ""
                if (obj[i].disable) {
                    qlswitch = "checked"
                }
                let qldefault = ""
                if (obj[i].default) {
                    qldefault = "checked"
                }

                html += "<tr>" +
                    `<td>
                      <label class="lyear-checkbox checkbox-primary">
                        <input type="checkbox" name="ids_${obj[i].id}" value="${obj[i].id}"><span></span>
                      </label>
                    </td>`+
                    "<td>" + (obj[i].id) + "</td>" +//name
                    "<td>" + obj[i].name + "</td>" +//开关状态
                    "<td>" + `<label class="lyear-switch switch-solid switch-primary">
                    <input type="checkbox" `+ qlswitch + ` name="switch_${obj[i].id}" id="switch_${obj[i].id}" onchange="autHandleCheckboxChangeEvent(this)">
                    <span></span>
                </label>` + "</td>" +
                    "<td>" + obj[i].host + "</td>" +
                    "<td>" + obj[i].client_id + "</td>" +//开关状态
                    "<td>" + obj[i].client_secret + "</td>" +//开关状态
                    "<td>" + `<label class="lyear-switch switch-solid switch-primary">
                    <input type="checkbox" `+ qldefault + ` name="default_` + (obj[i].id) + `" id="default_` + (obj[i].id) + `" onchange="autHandleCheckboxChangeEvent(this)">
                    <span></span>
                </label>` + "</td>" +
                    "<td>" + obj[i].remarks + "</td>" +//备注状态
                    "<td>" + `<div class="btn-group">
                        <a class="btn btn-xs btn-default" href="#!" title="编辑" data-toggle="modal" data-target="#myModal" onclick="autFillModalForm(${obj[i].id});$('.modal-footer').show();"><i class="mdi mdi-pencil"></i></a>
                        <a class="btn btn-xs btn-default" href="#!" title="上移" onclick="autMoveRow(${obj[i].id},'upward')"><i class="mdi mdi-arrow-up-bold"></i></a>
                        <a class="btn btn-xs btn-default" href="#!" title="下移" onclick="autMoveRow(${obj[i].id},'downward')"><i class="mdi mdi-arrow-down-bold"></i></a>
                        <a class="btn btn-xs btn-default" href="#!" title="连接测试" onclick="autMoveRow(${obj[i].id},'test')"><i class="mdi mdi-test-tube"></i></a>
                        <a class="btn btn-xs btn-default example-p-1" href="#!" title="删除" onclick="autDelRow(`+ (obj[i].id) + `)"><i class="mdi mdi-window-close"></i></a>
                </div></td>`+
                    "</tr>"
            }
            //$("#datasets").append(html)
            $("#check-all").attr("checked", false)
            $("#datasets").html(html);
        }
    });
}

//处理表格中的开关和默认
function autHandleCheckboxChangeEvent(checkbox) {
    oper = checkbox.id.split("_")[0]
    if (oper == "switch") {//是否禁用
        if (checkbox.checked) {
            oper = "disable"
        } else {
            oper = "enable"
        }
    } else if (oper == "default") {//是否设置为默认
        if (checkbox.checked) {
            oper = "default"
        } else {
            oper = "nondefault"
        }
    } else {
        return
    }
    ids = "[" + checkbox.id.split("_")[1] + "]"
    //alert(ids)

    $.ajax({
        type: "PUT",
        url: `/qinglong/${oper}`,
        data: ids,
        dataType: 'json',
        contentType: 'application/json',
        success: function (response) {
            if (response.code==200) {
                lightyear.notify(`操作成功`, 'success', 1000);
            } else {
                lightyear.notify(`操作失败`, 'danger', 3000);
            }
        },
    })

}

//用于左上角删除大按钮
function autDelRows() {
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
                        url: '/qinglong', // 请求URL
                        type: 'DELETE', // 请求方法
                        dataType: 'json', // 返回的数据类型
                        data: "[" + ids.join(",") + "]", // 提交的数据
                        success: function (response) { // 请求成功的回调函数
                            console.log('Success:', response);
                            if (response.code==200) {
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
                        url: "/qinglong",
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
    //清空modal_qinglong_rule这个表单下所有的input值
    //alert("清空modal_qinglong_rule这个表单下所有的input值")
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
        url: '/qinglong', // 请求URL
        type: 'POST', // 请求方法
        dataType: 'json', // 返回的数据类型
        data: formData, // 提交的数据
        success: function (response) { // 请求成功的回调函数
            if (response.code==200) {
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
    $.get("/qinglong?id=" + id, function (response) {
        // 将 JSON 数据设置为表单值
        jsonData = response.data;//解析成对象
        $.each(jsonData, function (key, value) {
            var selector = "[name='" + key + "']";
            var $element = $(selector);

            if ($.isPlainObject(value)) {
                $element.val(JSON.stringify(value).replace(/^{|}$/g, ""));
            } else {
                $element.val(value);
            }

            if ($element.is(":radio")) {
                $element.prop("checked", true);
            }
            if ($element.is(":checkbox")) {
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
        return;
    }
    //alert(ids)

    // 创建Ajax请求
    $.ajax({
        url: '/qinglong/enable', // 请求URL
        type: 'PUT', // 请求方法
        dataType: 'json', // 返回的数据类型
        data: "[" + ids.join(",") + "]", // 提交的数据
        contentType: 'application/json',
        success: function (response) { // 请求成功的回调函数
            console.log('Success:', response);
            if (response.code==200) {
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
        return;
    }

    // 创建Ajax请求
    $.ajax({
        url: '/qinglong/disable', // 请求URL
        type: 'PUT', // 请求方法
        dataType: 'json', // 返回的数据类型
        data: "[" + ids.join(",") + "]", // 提交的数据
        contentType: 'application/json',
        success: function (response) { // 请求成功的回调函数
            console.log('Success:', response);
            if (response.code==200) {
                autFillRows()
            }
        },
        error: function (xhr, status, error) { // 请求失败的回调函数
            console.log('Error:', error);
        }
    });
}

//上移
function autMoveRow(id, upordown) {
    switch (upordown) {
        case "upward":
            //alert("上移")
            $.ajax({
                url: '/qinglong/upward', // 请求URL
                type: 'PUT', // 请求方法
                dataType: 'json', // 返回的数据类型
                data: "[" + id + "]", // 提交的数据
                contentType: 'application/json',
                success: function (response) { // 请求成功的回调函数
                    //alert('Success:', response);
                    if (response.code==200) {
                        autFillRows()
                    }
                },
                error: function (xhr, status, error) { // 请求失败的回调函数
                    console.log('Error:', error);
                }
            });
            break;
        case "downward":
            $.ajax({
                url: '/qinglong/downward', // 请求URL
                type: 'PUT', // 请求方法
                dataType: 'json', // 返回的数据类型
                data: "[" + id + "]", // 提交的数据
                contentType: 'application/json',
                success: function (response) { // 请求成功的回调函数
                    console.log('Success:', response);
                    if (response.code==200) {
                        autFillRows()
                    }
                },
                error: function (xhr, status, error) { // 请求失败的回调函数
                    console.log('Error:', error);
                }
            });
            break;
        case "test":
            //alert("青龙测试")
            $.ajax({
                url: '/qinglong/test', // 请求URL
                type: 'PUT', // 请求方法
                dataType: 'json', // 返回的数据类型
                data: "[" + id + "]", // 提交的数据
                contentType: 'application/json',
                success: function (response) { // 请求成功的回调函数
                    console.log('Success:', response);
                    //alert(JSON.stringify(response))
                    if (response.code==200) {
                        lightyear.notify("连接正常", 'success', 3000)
                    }else{
                        lightyear.notify("连接异常", 'danger', 3000)
                    }
                },
                error: function (xhr, status, error) { // 请求失败的回调函数
                    console.log('Error:', error);
                }
            });
            break;
        default:
            break;
    }
}