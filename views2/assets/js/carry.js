$(function () {
    //搜索框的下拉菜单
    $('.search-bar .dropdown-menu a').click(function () {
        var field = $(this).data('field') || '';
        $('#search-field').val(field);
        $('#search-btn').html($(this).text() + ' <span class="caret"></span>');
    });

    //全加载
    autFillCarryRules()

    //为搜索框的回车事件添加监听
    $("#searchInput").on("keydown", function (event) {
        if (event.keyCode === 13) { // 检查是否按下了回车键
            //alert("按钮回车键")
            event.preventDefault(); // 阻止默认行为，这里是阻止提交表单
            autSearchCarryRules(event); // 调用搜索函数
        }
    });
});

function autSearchCarryRules(event) {
    event.preventDefault(); // 阻止表单的默认提交行为
    const inputValue = $("#searchInput").val(); // 获取输入框的值
    console.log(`正在搜索：${inputValue}`); // 执行搜索操作，这里用console输出结果
    autFillCarryRules(inputValue)
    //$("#searchInput").val(''); // 将输入框中的值清空
}

//获取搬运规则并显示
function autFillCarryRules(searchvalue) {
    if (!searchvalue) {
        searchvalue = $("#searchInput").val() ? $("#searchInput").val() : ""
    }
    //alert(searchvalue)
    $.get("/carry?searchValue=" + searchvalue, function (response, status) {
        //alert(data)
        if (response.code == 200 && response.data) {
            obj = response.data;
            html = ""
            for (var i = 0; i < obj.length; i++) {
                let carry_switch = ""
                if (obj[i].on) {
                    carry_switch = "checked"
                }

                html += "<tr>" +
                    `<td>
                      <label class="lyear-checkbox checkbox-primary">
                        <input type="checkbox" name="ids_`+ obj[i].id + `" value="` + obj[i].id + `"><span></span>
                      </label>
                    </td>`+
                    "<td>" + obj[i].id + "</td>" +//name
                    "<td>" + obj[i].name + "</td>" +//开关状态
                    "<td>" + `<label class="lyear-switch switch-solid switch-primary">
                    <input type="checkbox" `+ carry_switch + ` name="switch_` + obj[i].id + `" id="switch_` + obj[i].id + `" onchange="autHandleCheckboxChangeEvent(this)">
                    <span></span>
                </label>` + "</td>" +
                    "<td>" + obj[i].carry_from + "</td>" +
                    "<td>" + obj[i].carry_to + "</td>" +
                    "<td>" + `<div class="btn-group">
                        <a class="btn btn-xs btn-default" href="#!" title="编辑" data-toggle="modal" data-target="#myModal" onclick="autFillModalForm(`+ obj[i].id + `);$('.modal-footer').show();"><i class="mdi mdi-pencil"></i></a>
                        <a class="btn btn-xs btn-default example-p-1" href="#!" title="删除" onclick="autDelCarryRule(`+ obj[i].id + `)"><i class="mdi mdi-window-close"></i></a>
                </div></td>`+
                    "</tr>"
            }
            //$("#datasets").append(html)
            $("#check-all").attr("checked", false)
            $("#datasets").html(html);
        } else {
            html = "<tr><td colspan=\"7\">无数据记录</td></tr>"
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
            url: "/carry/enable",
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
            url: "/carry/disable",
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
function autDelCarryRules() {
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
                        url: '/carry', // 请求URL
                        type: 'DELETE', // 请求方法
                        dataType: 'json', // 返回的数据类型
                        data: "[" + ids.join(",") + "]", // 提交的数据
                        success: function (response) { // 请求成功的回调函数
                            console.log('Success:', response);
                            if (response.code == 200) {
                                autFillCarryRules()
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
function autDelCarryRule(id) {
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
                        url: "/carry",
                        data: "[" + id + "]",
                        success: function () {
                            autFillCarryRules()
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
    //清空modal_carry_rule这个表单下所有的input值
    //alert("清空modal_carry_rule这个表单下所有的input值")
    $("#carry_modal").find("input[type=text], textarea, input[type=email]").val('');
    $("#carry_modal").find("input[type=checkbox]").attr("checked", false);
    $('.modal-footer').show();
}

//提交模态表单
function autSubmitModalForm() {
    formData = serializaJson($("#carry_modal :input"))
    console.log(formData);
    //先获取数据
    $.ajax({
        url: '/carry', // 请求URL
        type: 'POST', // 请求方法
        dataType: 'json', // 返回的数据类型
        data: formData, // 提交的数据
        contentType: 'application/json',
        success: function (response) { // 请求成功的回调函数
            if (response.code == 200) {
                lightyear.notify('保存成功', 'success', 3000);
                autFillCarryRules()
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
    timestamp = new Date().getTime()
    $.get(`/carry/${id}?t=${timestamp}`, fillForm);
}

//启用规则
function autEnableCarryRules() {
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
        url: '/carry/enable', // 请求URL
        type: 'PUT', // 请求方法
        dataType: 'json', // 返回的数据类型
        data: "[" + ids.join(",") + "]", // 提交的数据
        contentType: 'application/json',
        success: function (response) { // 请求成功的回调函数
            console.log('Success:', response);
            if (response.code == 200) {
                autFillCarryRules()
            }
        },
        error: function (xhr, status, error) { // 请求失败的回调函数
            console.log('Error:', error);
        }
    });
}

//禁用规则
function autDisableCarryRules() {
    var ids = $('input[name^="ids_"]:checked').map(function () {
        return $(this).val();
    }).get(); // 将所有值添加到一个数组中

    // 如果没有选中任何 checkbox，则返回
    if (ids.length === 0) {
        return;
    }

    // 创建Ajax请求
    $.ajax({
        url: '/carry/disable', // 请求URL
        type: 'PUT', // 请求方法
        dataType: 'json', // 返回的数据类型
        data: "[" + ids.join(",") + "]", // 提交的数据
        contentType: 'application/json',
        success: function (response) { // 请求成功的回调函数
            console.log('Success:', response);
            if (response.code == 200) {
                autFillCarryRules()
            }
        },
        error: function (xhr, status, error) { // 请求失败的回调函数
            console.log('Error:', error);
        }
    });
}