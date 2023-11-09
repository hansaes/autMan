$(function () {
    $('.search-bar .dropdown-menu a').click(function () {
        var field = $(this).data('field') || '';
        $('#search-field').val(field);
        $('#search-btn').html($(this).text() + ' <span class="caret"></span>');
    });
});

$(document).ready(function () {
    //为搜索框的回车事件添加监听
    $("#searchInput").on("keydown", function (event) {
        if (event.keyCode === 13) { // 检查是否按下了回车键
            //alert("按钮回车键")
            event.preventDefault(); // 阻止默认行为，这里是阻止提交表单
            autSearchRows(event,autFillTable); // 调用搜索函数
        }
    });
})

//右上角的搜索
function autSearchRows(event, autFillTable) {
    event.preventDefault(); // 阻止表单的默认提交行为
    const inputValue = $("#searchInput").val(); // 获取输入框的值
    console.log(`正在搜索：${inputValue}`); // 执行搜索操作，这里用console输出结果
    autFillTable(inputValue)
    $("#searchInput").val(''); // 将输入框中的值清空
}

//处理表格中的开关
function autHandleCheckboxChangeEvent(checkbox, path) {
    ids = "[" + checkbox.id.split("_")[1] + "]"
    //alert(ids)
    if (checkbox.checked) {
        // 当前 checkbox 被选中
        $.ajax({
            type: "PUT",
            url: `/${path}/enable`,
            data: ids,
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                if (response.success) {
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
            url: `/${path}/disable`,
            data: ids,
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                if (response.success) {
                    lightyear.notify('禁用成功', 'success', 3000);
                } else {
                    lightyear.notify('禁用失败', 'danger', 1000);
                }
            },
        })
    }
}

//用于左上角删除大按钮
function autDelRows(path) {
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
                        url: `/${path}`, // 请求URL
                        type: 'DELETE', // 请求方法
                        dataType: 'json', // 返回的数据类型
                        data: "[" + ids.join(",") + "]", // 提交的数据
                        success: function (response) { // 请求成功的回调函数
                            console.log('Success:', response);
                            if (response.success) {
                                autFillTable()
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
function autDelRow(id, path, autFillTable) {
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
                        url: `/${path}`,
                        data: "[" + id + "]",
                        success: function () {
                            autFillTable()
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
    //清空modal_varrule_rule这个表单下所有的input值
    //alert("清空modal_varrule_rule这个表单下所有的input值")
    $("#modal").find("input[type=text], textarea, input[type=email]").val('');
    $("#modal").find("input[type=checkbox]").attr("checked", false);
    $('.modal-footer').show();
}

//提交模态表单
function autSubmitModalForm(path, autFillTable) {
    // 对表单进行序列化，获取表单数据
    var formData = $("#modal").serialize();
    //alert(JSON.stringify(formData))
    //先获取数据
    $.ajax({
        url: `/${path}`, // 请求URL
        type: 'POST', // 请求方法
        dataType: 'json', // 返回的数据类型
        data: formData, // 提交的数据
        success: function (response) { // 请求成功的回调函数
            if (response.success) {
                lightyear.notify('保存成功', 'success', 3000);
                autFillTable()
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
function autFillModalForm(id, path) {
    //先获取数据
    $.get(`/${path}?id=${id}`, function (data, status) {
        // 将 JSON 数据设置为表单值
        //alert(JSON.stringify(data))
        jsonData = JSON.parse(data.data);//解析成对象
        $.each(jsonData, function (key, value) {
            var selector = "[name='" + key + "']";
            var $element = $(selector);

            if ($.isPlainObject(value)) {
                $element.val(JSON.stringify(value).replace(/^{|}$/g, ""));
            } else if ($element.is(":radio")) {
                $(`input[name='${key}'][value='${value}']`).prop("checked", true);
            } else if ($element.is(":checkbox")) {
                $element.prop("checked", parseBool(value.toString()));
            } else {
                $element.val(value);
            }
        });
    });
}

//启用规则
function autEnableRows(path, autFillTable) {
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
        url: `/${path}/enable`, // 请求URL
        type: 'PUT', // 请求方法
        dataType: 'json', // 返回的数据类型
        data: "[" + ids.join(",") + "]", // 提交的数据
        contentType: 'application/json',
        success: function (response) { // 请求成功的回调函数
            console.log('Success:', response);
            if (response.success) {
                autFillTable()
            }
        },
        error: function (xhr, status, error) { // 请求失败的回调函数
            console.log('Error:', error);
        }
    });
}

//禁用规则
function autDisableRows(path, autFillTable) {
    var ids = $('input[name^="ids_"]:checked').map(function () {
        return $(this).val();
    }).get(); // 将所有值添加到一个数组中

    // 如果没有选中任何 checkbox，则返回
    if (ids.length === 0) {
        return;
    }

    // 创建Ajax请求
    $.ajax({
        url: `/${path}/disable`, // 请求URL
        type: 'PUT', // 请求方法
        dataType: 'json', // 返回的数据类型
        data: "[" + ids.join(",") + "]", // 提交的数据
        contentType: 'application/json',
        success: function (response) { // 请求成功的回调函数
            console.log('Success:', response);
            if (response.success) {
                autFillTable()
            }
        },
        error: function (xhr, status, error) { // 请求失败的回调函数
            console.log('Error:', error);
        }
    });
}

//上移
function autMoveRow(id, path, upordown, autFillTable) {
    switch (upordown) {
        case "upward":
            //alert("上移")
            $.ajax({
                url: `/${path}/upward`, // 请求URL
                type: 'PUT', // 请求方法
                dataType: 'json', // 返回的数据类型
                data: "[" + id + "]", // 提交的数据
                contentType: 'application/json',
                success: function (response) { // 请求成功的回调函数
                    //alert('Success:', response);
                    if (response.success) {
                        autFillTable()
                    }
                },
                error: function (xhr, status, error) { // 请求失败的回调函数
                    console.log('Error:', error);
                }
            });
            break;
        case "downward":
            $.ajax({
                url: `/${path}/downward`, // 请求URL
                type: 'PUT', // 请求方法
                dataType: 'json', // 返回的数据类型
                data: "[" + id + "]", // 提交的数据
                contentType: 'application/json',
                success: function (response) { // 请求成功的回调函数
                    console.log('Success:', response);
                    if (response.success) {
                        autFillTable()
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

//向下拉框中填充青龙容器项
function autFillSelectQinglongItems(selectors){
    //填充modal 容器========================================
    $.get("/qinglong", function (response) {
        if (response.success) {
            //alert(response.data)
            qls = JSON.parse(response.data);//解析成对象
            var options = []
            for (var i = 0; i < qls.length; i++) {
                options.push(
                    { value: qls[i].name, text: qls[i].name }
                );
            }
            //var selects = [$("#ql"), $("#jv_from"), $("#fen_to"), $("#sync_to")]
            for (var i = 0; i < selectors.length; i++) {
                autFillSelectItems(selectors[i], options)
            }
        }
    });
}

//填充select的选项
function autFillSelectItems(selector, options) {
    selector.empty()
    for (i = 0; i < options.length; i++) {
        selector.append($('<option>', options[i]));
    }
}

//字符串转bool
function parseBool(str) {
    // 将字符串转换为小写
    str = str.toLowerCase();
    // 检查字符串是否等于 true、yes、1 或 on
    return (str === "true" || str === "yes" || str === "1" || str === "on");
}