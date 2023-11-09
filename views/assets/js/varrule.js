$(document).ready(function () {
    $('.search-bar .dropdown-menu a').click(function () {
        var field = $(this).data('field') || '';
        $('#search-field').val(field);
        $('#search-btn').html($(this).text() + ' <span class="caret"></span>');
    });

    //为搜索框的回车事件添加监听
    $("#searchInput").on("keydown", function (event) {
        if (event.keyCode === 13) { // 检查是否按下了回车键
            //alert("按钮回车键")
            event.preventDefault(); // 阻止默认行为，这里是阻止提交表单
            autSearchRows(event, autFillTable); // 调用搜索函数
        }
    });

    //表格填充==============================================
    autFillTable()

    //填充modal 主容器========================================
    $.get("/qinglong", function (response) {
        if (response.code == 200) {
            //alert(response.data)
            qls = response.data;//解析成对象
            var items = []
            for (var i = 0; i < qls.length; i++) {
                items.push(
                    { value: qls[i].name, text: qls[i].name }
                );
            }
            var selects = [$("#ql"), $("#jv_from"), $("#fen_to"), $("#sync_to")]
            for (var i = 0; i < selects.length; i++) {
                autFillSelectItems(selects[i], items)
            }
        }
    });

    $("#ql").change(function () {
        //alert("容器改变")
        var qlName = $("#ql").val()
        $.get("/qinglong", function (response) {
            if (response.code == 200) {
                //alert(response.data)
                qls = response.data;//解析成对象
                var items = []
                for (var i = 0; i < qls.length; i++) {
                    //不包含主容器
                    if (qls[i].name == qlName) {
                        continue
                    }
                    items.push(
                        { value: qls[i].name, text: qls[i].name }
                    );
                }
                //填充聚合源和分配目标容器
                var selects = [$("#jv_from"), $("#fen_to")]
                for (var i = 0; i < selects.length; i++) {
                    autFillSelectItems(selects[i], items)
                }
                autFillSelectItems($("#sync_to"), items)
            }
        });
    })

    //填充容器的规则==============================================
    var styleItems = []
    for (i = 1; i <= 7; i++) {
        styleItems.push(
            { value: i, text: autGetRuleNameByStyleID(i) }
        )
    }
    autFillSelectItems($("#style"), styleItems)
    $('#style').change(function () {
        //整理modal
        autCheckModalRule()
    });

    //填充分配原则===========================================
    var fenRules = {
        0: "平均",
        1: "先后",
        2: "随机"
    }
    var fenItems = []
    for (i = 0; i < 3; i++) {
        fenItems.push(
            { value: i, text: fenRules[i] + "规则" || '' }
        )
    }
    autFillSelectItems($("#fen_to_rule"), fenItems)

    //填充同步规则============================================
    var syncRules = {
        1: "无偿赠送",
        2: "严格同步",
    }
    var syncItems = []
    for (i = 1; i <= 2; i++) {
        syncItems.push(
            { value: i, text: syncRules[i] + "规则" || '' }
        )
    }
    autFillSelectItems($("#sync_to_rule"), syncItems)
    //绑定容器规则修改事件
})

//右上角的搜索
function autSearchRows(event, autFillTable) {
    event.preventDefault(); // 阻止表单的默认提交行为
    const inputValue = $("#searchInput").val(); // 获取输入框的值
    console.log(`正在搜索：${inputValue}`); // 执行搜索操作，这里用console输出结果
    autFillTable(inputValue)
    //$("#searchInput").val(''); // 将输入框中的值清空
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
                if (response.code == 200) {
                    lightyear.notify('启用成功', 'success', 3000);
                } else {
                    lightyear.notify('启用失败', 'danger', 1000);
                }
            },
        })
    } else {
        $.ajax({
            type: "PUT",
            url: `/${path}/disable`,
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
                            if (response.code == 200) {
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
                    $.ajax({
                        type: "DELETE",
                        url: `/${path}`,
                        data: JSON.stringify([id]),
                        contentType: 'application/json',
                        success: function (response) {
                            console.log(response)
                            if (response.code == 200) {
                                autFillTable()
                            }
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
    $("select").val([])
    //新增界面
    $("#head_pins").parent().parent().hide()
    $("#jv_from").parent().parent().hide()
    $("#fen_to").parent().parent().hide()
    $("#fen_to_rule").parent().parent().hide()
    $("#sync_to").parent().parent().hide()
    $("#sync_to_rule").parent().parent().hide()
    $("#max_num").parent().parent().hide()
    $("#turn_num").parent().parent().hide()
}

//提交模态表单
function autSubmitModalForm(path, autFillTable) {
    // 对表单进行序列化，获取表单数据
    var formData = {
        id: $('#id').val() ? parseInt($('#id').val()) : 0,
        on: $('#on').is(':checked'),
        cron: $('#cron').val(),
        ql: $('#ql').val(),
        style: $('#style').val() ? parseInt($('#style').val()) : 0,
        env_name: $('#env_name').val(),
        main_key: $('#main_key').val(),
        head_pins: $('#head_pins').val().split(","),
        jv_from: $('#jv_from').val() ? $('#jv_from').val() : [],
        fen_to: $('#fen_to').val() ? $('#fen_to').val() : [],
        fen_to_rule: $('#fen_to_rule').val() ? parseInt() : 0,
        sync_to: $('#sync_to').val() ? $('#sync_to').val() : [],
        sync_to_rule: $('#sync_to_rule').val() ? parseInt($('#sync_to_rule').val()) : 0,
        max_num: $('#max_num').val() ? parseInt($('#max_num').val()) : 0,
        turn_num: $('#turn_num').val() ? parseInt($('#turn_num').val()) : 0,
    };

    console.log(formData)
    method = "PUT"
    if (formData.id == 0) {
        method = "POST"
    }

    //先获取数据
    $.ajax({
        url: `/${path}`, // 请求URL
        type: method, // 请求方法
        data: JSON.stringify(formData), // 提交的数据
        contentType: 'application/json',
        success: function (response) { // 请求成功的回调函数
            if (response.code == 200) {
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
    $.get(`/${path}/${id}`, function (response) {
        console.log(response)
        jsonData = response.data;//解析成对象
        $.each(jsonData, function (key, value) {
            var selector = "[name='" + key + "']";
            var $element = $(selector);
            if ($element.is(":radio")) {
                $element.prop("checked", true);
            } else if ($element.is(":checkbox")) {
                $element.prop("checked", parseBool(value.toString()));
            } else {
                $element.val(value);
            }
        });
        //根据容器类型对modal界面进行调整
        autCheckModalRule()
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
            if (response.code) {
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
            if (response.code == 200) {
                autFillTable()
            }
        },
        error: function (xhr, status, error) { // 请求失败的回调函数
            console.log('Error:', error);
        }
    });
}

//操作，记录id，路由路径，操作类型，填充表格函数
function autMoveRow(id, path, upordown, autFillTable) {
    switch (upordown) {
        default:
            console.log(`/${path}/${upordown}`);
            $.ajax({
                url: `/${path}/${upordown}`, // 请求URL
                type: 'PUT', // 请求方法
                dataType: 'json', // 返回的数据类型
                data: "[" + id + "]", // 提交的数据
                contentType: 'application/json',
                success: function (response) { // 请求成功的回调函数
                    console.log('Success:', response);
                    if (response.code == 200) {
                        autFillTable()
                        lightyear.notify('成功', 'success', 1000);
                    } else {
                        lightyear.notify('失败', 'danger', 3000);
                    }
                },
                error: function (xhr, status, error) { // 请求失败的回调函数
                    console.log('Error:', error);
                    lightyear.notify('失败', 'danger', 3000);
                }
            });
            break;

    }
}

//根据类型设置相应的界面
function autCheckModalRule() {
    switch ($("#style").val()) {
        case ('1')://聚合容器
            $("#head_pins").parent().parent().show()
            $("#jv_from").parent().parent().show()
            $("#fen_to").parent().parent().hide()
            $("#fen_to_rule").parent().parent().hide()
            $("#sync_to").parent().parent().hide()
            $("#sync_to_rule").parent().parent().hide()
            $("#max_num").parent().parent().hide()
            $("#turn_num").parent().parent().hide()
            break;
        case ("2")://分配主动容器
            $("#head_pins").parent().parent().hide()
            $("#jv_from").parent().parent().hide()
            $("#fen_to").parent().parent().show()
            $("#fen_to_rule").parent().parent().show()
            $("#sync_to").parent().parent().hide()
            $("#sync_to_rule").parent().parent().hide()
            $("#max_num").parent().parent().hide()
            $("#turn_num").parent().parent().hide()
            break;
        case ("3")://同步容器
            $("#head_pins").parent().parent().hide()
            $("#jv_from").parent().parent().hide()
            $("#fen_to").parent().parent().hide()
            $("#fen_to_rule").parent().parent().hide()
            $("#sync_to").parent().parent().show()
            $("#sync_to_rule").parent().parent().show()
            $("#max_num").parent().parent().hide()
            $("#turn_num").parent().parent().hide()
            break;
        case ("4")://普惠容器
            $("#head_pins").parent().parent().show()
            $("#jv_from").parent().parent().hide()
            $("#fen_to").parent().parent().hide()
            $("#fen_to_rule").parent().parent().hide()
            $("#sync_to").parent().parent().hide()
            $("#sync_to_rule").parent().parent().hide()
            $("#max_num").parent().parent().hide()
            $("#turn_num").parent().parent().show()
            break;
        case ("5")://专用容器
            $("#head_pins").parent().parent().hide()
            $("#jv_from").parent().parent().hide()
            $("#fen_to").parent().parent().hide()
            $("#fen_to_rule").parent().parent().hide()
            $("#sync_to").parent().parent().hide()
            $("#sync_to_rule").parent().parent().hide()
            $("#max_num").parent().parent().hide()
            $("#turn_num").parent().parent().hide()
            break;
        case ("6")://被分配容器
            $("#head_pins").parent().parent().show()
            $("#jv_from").parent().parent().hide()
            $("#fen_to").parent().parent().hide()
            $("#fen_to_rule").parent().parent().hide()
            $("#sync_to").parent().parent().hide()
            $("#sync_to_rule").parent().parent().hide()
            $("#max_num").parent().parent().show()
            $("#turn_num").parent().parent().hide()
            break;
        case ("7")://普通容器
            $("#head_pins").parent().parent().show()
            $("#jv_from").parent().parent().hide()
            $("#fen_to").parent().parent().hide()
            $("#fen_to_rule").parent().parent().hide()
            $("#sync_to").parent().parent().hide()
            $("#sync_to_rule").parent().parent().hide()
            $("#max_num").parent().parent().show()
            $("#turn_num").parent().parent().hide()
            break;
    }
}

//通过id获取东芝规则的名字
function autGetRuleNameByStyleID(num) {
    const ctn = {
        1: "聚合",
        2: "分母",
        3: "同步",
        4: "普惠",
        5: "专用",
        6: "分子",
        7: "普通",
    }
    return ctn[num] + "规则" || '';
}

//获取规则并显示
function autFillTable(searchvalue) {
    if (!searchvalue) {
        searchvalue = $("#searchInput").val() ? $("#searchInput").val() : ""
    }
    t = new Date().getTime()
    $.get("/varrules?searchValue=" + searchvalue + "&t=" + t, function (response) {
        console.log(response)
        if (response.code == 200 && response.data) {
            obj = response.data;
            html = ""
            for (var i = 0; i < obj.length; i++) {
                let rowswitch = ""
                //规则开关
                if (obj[i].on) {
                    rowswitch = "checked"
                }
                //关联容器
                qls = ""
                if (obj[i].style == 3) {//同步
                    qls = obj[i].sync_to.join(",")
                } else if (obj[i].style == 2) {//分配
                    qls = obj[i].fen_to.join(",")
                } else if (obj[i].style == 1) {//聚合
                    qls = obj[i].jv_from.join(",")
                }
                html += "<tr>" +
                    `<td>
                      <label class="lyear-checkbox checkbox-primary">
                        <input type="checkbox" name="ids_${obj[i].id}" value="${obj[i].id}"><span></span>
                      </label>
                    </td>
                    <td>${i + 1}</td>
                    <td>${obj[i].ql}</td>
                    <td>
                        <label class="lyear-switch switch-solid switch-primary">
                        <input type="checkbox" ${rowswitch} name="switch_${obj[i].id}" id="switch_${obj[i].id}" onchange="autHandleCheckboxChangeEvent(this,'varrules')">
                        <span></span> </label>
                    </td>
                    <td>${autGetRuleNameByStyleID(parseInt(obj[i].style))}</td>
                    <td>${qls ? qls : "-"}</td>
                    <td>${obj[i].env_name}</td>
                    <td>${obj[i].main_key}</td>
                    <td>${obj[i].cron}</td>
                    <td>${obj[i].next_running_time}</td>
                    <td>
                        <div class="btn-group">
                        <a class="btn btn-xs btn-default" href="#!" title="编辑" data-toggle="modal" data-target="#myModal" onclick="autFillModalForm(${obj[i].id},'varrules')"><i class="mdi mdi-pencil"></i></a>
                        <a class="btn btn-xs btn-default" href="#!" title="运行" onclick="autMoveRow('${obj[i].id}','varrules','run',autFillTable)"><i class="mdi mdi-play"></i></a>
                        <a class="btn btn-xs btn-default" href="#!" title="上移" onclick="autMoveRow('${obj[i].id}','varrules','upward',autFillTable)"><i class="mdi mdi-arrow-up-bold"></i></a>
                        <a class="btn btn-xs btn-default" href="#!" title="下移" onclick="autMoveRow('${obj[i].id}','varrules','downward',autFillTable)"><i class="mdi mdi-arrow-down-bold"></i></a>
                        <a class="btn btn-xs btn-default example-p-1" href="#!" title="删除" onclick="autDelRow(${obj[i].id},'varrules',autFillTable)"><i class="mdi mdi-window-close"></i></a>
                        </div></td>
                    </tr>`
            }
            $("#check-all").attr("checked", false)
            $("#datasets").html(html);
        }
    });
}

//填充select的选项，第一个参数为元素，第二个参数为选项
function autFillSelectItems(select, options) {
    select.empty()
    for (i = 0; i < options.length; i++) {
        select.append($('<option>', options[i]));
    }
}

