$(function () {
    // 设置card-body的初始高度
    $(".table-container").height($(window).height() - 3 * $(".card-toolbar").outerHeight() - 15);

    // 监听窗口大小改变事件
    $(window).on("resize", function () {
        // 设置card-body的高度为窗口高度减去card-toolbar的高度
        $(".table-container").height($(window).height() - 3 * $(".card-toolbar").outerHeight() - 15);
    });

    $('.search-bar .dropdown-menu a').click(function () {
        var field = $(this).data('field') || '';
        $('#search-field').val(field);
        $('#search-btn').html($(this).text() + ' <span class="caret"></span>');
    });

    //加载列表
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
    console.log(`正在搜索：${inputValue}`); // 执行搜索操作，这里用console输出结果
    autFillRows(inputValue)
    //$("#searchInput").val(''); // 将输入框中的值清空
}

//获取搬运规则并显示
function autFillRows(searchvalue, func) {
    if (!searchvalue) {
        searchvalue = $("#searchInput").val() ? $("#searchInput").val() : ""
    }
    //alert(searchvalue)
    var timestamp = new Date().getTime();
    $.get(`/envs?searchValue=${searchvalue}&t=${timestamp}`, function (response, status) {
        if (response.code == 200) {
            obj = response.data;
            html = ""
            if (obj && obj.length >= 0) {
                for (var i = 0; i < obj.length; i++) {
                    //备注
                    remarks = obj[i].remarks ? obj[i].remarks : ""
                    status = obj[i].status ? `<button class="btn btn-danger btn-xs" onclick="toggle(this,${obj[i].id})">已禁用</button>` : `<button class="btn btn-primary btn-xs" onclick="toggle(this,${obj[i].id})">已启用</button>`

                    html += "<tr>" +
                        `<td>
                          <label class="lyear-checkbox checkbox-primary">
                            <input type="checkbox" name="ids_${obj[i].id}" value="${obj[i].id}"><span></span>
                          </label>
                        </td>
                        <td>${i + 1}</td>
                        <td>${obj[i].name}</td>
                        <td class='truncate' data-toggle='tooltip' data-placement='bottom'>${obj[i].value}</td>
                        <td>${remarks}</td>
                        <td>${outputTime(new Date(obj[i].updatedAt))}</td>
                        <td>${status}</td>
                        <td><div class="btn-group">
                            <a class="btn btn-xs btn-default" href="#!" title="编辑" data-toggle="modal" data-target="#myModal" onclick="autFillModalForm(${obj[i].id});$('.modal-footer').show();"><i class="mdi mdi-pencil"></i></a>
                            <a class="btn btn-xs btn-default example-p-1" href="#!" title="删除" onclick="autDelRow(`+ (obj[i].id) + `)"><i class="mdi mdi-window-close"></i></a>
                            </div>
                        </td>
                        </tr>`
                }
            }
            //$("#datasets").append(html)
            $("#check-all").attr("checked", false)
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
            //回调函数
            if (func) {
                func()
            }
        }
    });
}

//变量的启用与关闭
function toggle(element, id) {
    $.ajax({
        type: "PUT",
        url: "/envs/toggle",
        dataType: 'json',
        data: JSON.stringify([id]),
        contentType: 'application/json',
        success: function (response) {
            console.log(response)
            if (response.code == 200) {
                lightyear.notify("操作成功", 'success', 1000);
                //修改按钮的状态
                if ($(element).hasClass("btn-primary")) {
                    $(element).removeClass("btn-primary")
                    $(element).addClass("btn-danger")
                    $(element).text("已禁用")
                } else {
                    $(element).removeClass("btn-danger")
                    $(element).addClass("btn-primary")
                    $(element).text("已启用")
                }
            } else {
                lightyear.notify("操作失败", 'danger', 3000);
            }
        }
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
                        url: '/envs', // 请求URL
                        type: 'DELETE', // 请求方法
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
                        url: "/envs",
                        data: "[" + id + "]",
                        contentType: 'application/json',
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
    $("#modal").find("input[type=text], textarea, input[type=email]").val('');
    $("#modal").find("input[type=checkbox]").attr("checked", false);
    $('.modal-footer').show();
}

//提交模态表单
function autSubmitModalForm() {
    // 对表单进行序列化，获取表单数据
    var obj = {
        id: $("#id").val() ? parseInt($("#id").val()) : 0,
        name: $("#name").val(),
        value: $("#value").val(),
        remarks: $("#remarks").val(),
    }
    var formData
    var type
    if (obj.id > 0) {
        type = 'PUT'
        formData = obj
    } else {
        type = 'POST'
        formData = [obj]
    }
    data = JSON.stringify(formData)
    console.log(type + "：" + data)
    //先获取数据
    $.ajax({
        url: '/envs', // 请求URL
        type: type, // 请求方法
        dataType: 'json', // 返回的数据类型
        data: data, // 提交的数据
        contentType: 'application/json',
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
    timestamp = new Date().getTime();
    //先获取数据
    $.get(`/envs/${id}?t=${timestamp}`, function (response, status) {
        // 将 JSON 数据设置为表单值
        jsonData = response.data;//解析成对象
        $.each(jsonData, function (key, value) {
            var selector = "[name='" + key + "']";
            var $element = $(selector);

            if ($.isPlainObject(value)) {
                $element.val(JSON.stringify(value).replace(/^{|}$/g, ""));
            } else if ($element.is(":radio")) {
                $(`input[type="radio"][value="${value}"]`).prop('checked', true);
            } else if ($element.is(":checkbox")) {
                $element.prop("checked", parseBool(value.toString()));
            } else {
                $element.val(value);
            }


        });
    });
}

//启用
function autEnableRows() {
    var ids = $('input[name^="ids_"]:checked').map(function () {
        return parseInt($(this).val());
    }).get(); // 将所有值添加到一个数组中

    // 如果没有选中任何 checkbox，则返回
    if (ids.length === 0) {
        return;
    }
    // 创建Ajax请求
    $.ajax({
        url: '/envs/enable', // 请求URL
        type: 'PUT', // 请求方法
        dataType: 'json', // 返回的数据类型
        data: JSON.stringify(ids), // 提交的数据
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
        return parseInt($(this).val());
    }).get(); // 将所有值添加到一个数组中

    // 如果没有选中任何 checkbox，则返回
    if (ids.length === 0) {
        return;
    }

    // 创建Ajax请求
    $.ajax({
        url: '/envs/disable', // 请求URL
        type: 'PUT', // 请求方法
        dataType: 'json', // 返回的数据类型
        data: JSON.stringify(ids), // 提交的数据
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

    //绑定拖拽
    $("#drag-table tbody").sortable();
}

function parseBool(str) {
    // 将字符串转换为小写
    str = str.toLowerCase();

    // 检查字符串是否等于 true、yes、1 或 on
    return (str === "true" || str === "yes" || str === "1" || str === "on");
}

function outputTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}