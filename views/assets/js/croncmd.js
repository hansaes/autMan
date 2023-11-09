$(function () {

    // 设置card-body的初始高度
    $(".table-container").height($(window).height() - 2 * $(".card-toolbar").outerHeight() - 1);

    // 监听窗口大小改变事件
    $(window).on("resize", function () {
        // 设置card-body的高度为窗口高度减去card-toolbar的高度
        $(".table-container").height($(window).height() - 2 * $(".card-toolbar").outerHeight() - 1);
    });

    $('.search-bar .dropdown-menu a').click(function () {
        var field = $(this).data('field') || '';
        $('#search-field').val(field);
        $('#search-btn').html($(this).text() + ' <span class="caret"></span>');
    });



    autFillRows()

    //为搜索框的回车事件添加监听
    $("#searchInput").on("keydown", function (event) {
        if (event.keyCode === 13) { // 检查是否按下了回车键
            //alert("按钮回车键")
            event.preventDefault(); // 阻止默认行为，这里是阻止提交表单
            autSearchRows(event); // 调用搜索函数
        }
    });
});

function autSearchRows(event) {
    event.preventDefault(); // 阻止表单的默认提交行为
    const inputValue = $("#searchInput").val(); // 获取输入框的值
    //alert(`正在搜索：${inputValue}`); // 执行搜索操作，这里用console输出结果
    autFillRows(inputValue)
    //$("#searchInput").val(''); // 将输入框中的值清空
}

//获取搬运规则并显示
function autFillRows(searchvalue) {
    if (!searchvalue) {
        searchvalue = $("#searchInput").val() ? $("#searchInput").val() : ""
    }
    //alert(searchvalue)
    $.get("/croncmds?searchValue=" + searchvalue, function (response) {
        console.log(response)
        if (response.code == 200 && response.data) {
            obj = response.data;
            html = ""
            for (var i = 0; i < obj.length; i++) {
                html += "<tr>" +
                    `<td>
                    <label class="lyear-checkbox checkbox-primary">
                      <input type="checkbox" name="ids_${obj[i].id}" value="${obj[i].id}"><span></span>
                    </label>
                  </td>`+
                    `<td>${i + 1}</td>
                    <td class='truncate' data-toggle='tooltip' data-placement='bottom'>${obj[i].cron}</td>
                    <td>${obj[i].next_running_time}</td>` +
                    "<td class='truncate' data-toggle='tooltip' data-placement='bottom'>" + obj[i].cmd + "</td>" +
                    "<td>" + obj[i].to_self + "</td>" +
                    "<td class='truncate' data-toggle='tooltip' data-placement='bottom'>" + obj[i].to_others + "</td>" +
                    "<td class='truncate' data-toggle='tooltip' data-placement='bottom'>" + obj[i].memo + "</td>" +
                    "<td>" + `<div class="btn-group">
                      <a class="btn btn-xs btn-default" href="#!" title="编辑" data-toggle="modal" data-target="#myModal" onclick="autFillModalForm('${obj[i].id}')"><i class="mdi mdi-pencil"></i></a>
                      <a class="btn btn-xs btn-default" href="#!" title="运行" data-toogle-"tooltip" onclick="autRunRow('${obj[i].id}')"><i class="mdi mdi-play"></i></a>
                      <a class="btn btn-xs btn-default" href="#!" title="删除" data-toggle="tooltip" onclick="autDelRow('${obj[i].id}')"><i class="mdi mdi-window-close"></i></a>
              </div></td>`+
                    "</tr>"
            }
            $("#datasets").html(html);
            $(".truncate").hover(
                function () {
                    $(this).attr("data-toggle", 'tooltip');
                    $(this).attr("data-placement", 'bottom');
                    $(this).attr("title", $(this).text());
                },
                function () {
                    $(this).removeAttr("title");
                    $(this).removeAttr("data-toggle");
                    $(this).removeAttr("data-placement");
                }
            );
        } else {
            //alert("无数据记录")
            html = "<tr><td colspan=\"7\">无数据记录</td></tr>"
            $("#datasets").html(html);
        }
    });
}

//用于左上角删除多个勾选的按钮
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
                    //alert("[" + ids.join(",") + "]")
                    // 创建Ajax请求
                    $.ajax({
                        url: '/croncmds', // 请求URL
                        type: 'DELETE', // 请求方法
                        dataType: 'json', // 返回的数据类型
                        data: "[" + ids.join(",") + "]", // 提交的数据
                        success: function (response) { // 请求成功的回调函数
                            console.log('Success:', response);
                            if (response.code == 200) {
                                //重新加载数据
                                autFillRows()
                                //取消勾选
                                $("#check-all").prop("checked", false);
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

// 依次运行多个勾选的按钮
function autRunRows() {
    $.alert({
        title: '提示框',
        content: '确定运行？',
        buttons: {
            confirm: {
                text: '确认',
                btnClass: 'btn-primary',
                action: function () {
                    //$.alert('你点击了确认!');
                    var ids = $('input[name^="ids_"]:checked').map(function () {
                        return parseInt($(this).val());
                    }).get(); // 将所有值添加到一个数组中

                    // 如果没有选中任何 checkbox，则返回
                    if (ids.length === 0) {
                        return;
                    }
                    //alert("[" + ids.join(",") + "]")
                    // 创建Ajax请求
                    $.ajax({
                        type: "PUT",
                        url: "/croncmds/run",
                        data: JSON.stringify(ids),
                        success: function () {
                            lightyear.notify('运行成功', 'success', 1000, 'mdi mdi-emoticon-happy', 'top', 'center');
                        },
                        error: function () {
                            lightyear.notify('运行失败', 'danger', 1000, 'mdi mdi-emoticon-sad', 'top', 'center');
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
                        url: "/croncmds",
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

//运行单行
function autRunRow(id) {
    $.alert({
        title: '提示框',
        content: '确定运行？',
        buttons: {
            confirm: {
                text: '确认',
                btnClass: 'btn-primary',
                action: function () {
                    //$.alert('你点击了确认!');
                    $.ajax({
                        type: "PUT",
                        url: "/croncmds/run",
                        data: "[" + id + "]",
                        success: function () {
                            lightyear.notify('运行成功', 'success', 1000, 'mdi mdi-emoticon-happy', 'top', 'center');
                        },
                        error: function () {
                            lightyear.notify('运行失败', 'danger', 1000, 'mdi mdi-emoticon-sad', 'top', 'center');
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

//提交模态表单
function autSubmitModalForm() {
    // 对表单遍历
    var formData = {};
    $("#modal").find("input[type=number]").each(function () {
        formData[$(this).attr("name")] = parseInt($(this).val());
    });
    $("#modal").find("input[type=text], textarea, input[type=email]").each(function () {
        formData[$(this).attr("name")] = $(this).val();
    });
    $("#modal").find("input[type=checkbox]").each(function () {
        formData[$(this).attr("name")] = $(this).is(":checked");
    });
    if ($("#is_image_url").is(":checked") && /^http/.test(formData["cmd"])) {
        formData["cmd"] = "[CQ:image,file=" + formData["cmd"] + "]"
    }
    console.log(formData);
    method = "POST"
    if (formData["id"] > 0) {
        method = "PUT"
    }
    //先获取数据
    $.ajax({
        url: '/croncmds', // 请求URL
        type: method, // 请求方法
        dataType: 'json', // 返回的数据类型
        data: JSON.stringify(formData), // 提交的数据
        contentType: "application/json; charset=utf-8",
        success: function (response) { // 请求成功的回调函数
            console.log(response);
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
    $.get("/croncmds/" + id, function (response) {
        console.log(response)
        // 将 JSON 数据设置为表单值
        jsonData = response.data;//解析成对象
        $.each(jsonData, function (key, value) {
            var selector = "[name='" + key + "']";
            var $element = $(selector);
            if (key == "cmd" && value.startsWith("[CQ:image,file=")) {
                $("#is_image_url").prop("checked", true);
                $("#cmd").val(value.replace("[CQ:image,file=", "").replace("]", ""));
            } else if ($.isPlainObject(value)) {
                $element.val(JSON.stringify(value).replace(/^{|}$/g, ""));
            } else if ($element.is(":radio")) {
                $element.prop("checked", true);
            } else if ($element.is(":checkbox")) {
                $element.prop("checked", parseBool(value.toString()));
            } else {
                $element.val(value);
            }
        });
    });
}
