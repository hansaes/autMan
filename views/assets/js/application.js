var appObj = {
    "name": "应用名称",
    "app_id": "应用ID",
    "app_secret": "应用密钥",
    "auth_cron": "定时任务",
    "auth_env": "环境变量",
    "auth_cfg": "配置文件",
    "auth_sub": "订阅管理",
    "auth_dep": "依赖管理",
    "auth_log": "日志管理",
    "auth_script": "脚本管理",
    "auth_sys": "系统管理",
}

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
            //console.log("按钮回车键")
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
    $("#searchInput").val(''); // 将输入框中的值清空
}

//获取规则并显示
function autFillRows(searchvalue) {
    if (!searchvalue) {
        searchvalue = ""
    }
    //console.log(searchvalue)
    $.get("/application", function (response, status) {
        //显示加载动画
        lightyear.loading('show');
        console.log(response)
        if (response.code == 200) {
            html = ""
            if (response.data && response.data.length >= 0) {
                //显示
                for (var i = 0; i < response.data.length; i++) {
                    auth = ""
                    $.each(response.data[i], function (key, value) {
                        if (value === true) {
                            auth += `<button class="btn btn-xs bg-primary" disabled>${appObj[key]}</button> `
                        }
                    });

                    html += "<tr>" +
                        `<td>${response.data[i].name}</td>
                        <td>${response.data[i].app_id}</td>
                        <td>${response.data[i].app_secret}</td>
                        <td>${auth}</td>
                        <td>
                            <div class="btn-group" id="operation_${response.data[i].id}">
                                <a class="btn btn-xs btn-default" href="#!" title="编辑" data-toggle="modal" data-target="#myModal" onclick="autFillModalForm(${response.data[i].id})"><i class="mdi mdi-pencil"></i></a>
                                <a class="btn btn-xs btn-default" href="#!" title="删除" onclick="autDelRow(${response.data[i].id})"><i class="mdi mdi-window-close"></i></a>
                            </div>
                        </td>
                    </tr>`
                }
            }
            $("#datasets").html(html);
            //关闭加载动画
            lightyear.loading('hide');
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
                    $.ajax({
                        type: "DELETE",
                        url: "/application",
                        contentType: "application/json",
                        data: JSON.stringify([id]),
                        success: function () {
                            autFillRows()
                        }
                    })
                }
            },
            cancel: {
                text: '取消',
                action: function () {
                    //$.console.log('你点击了取消!');
                }
            }
        }
    });
}

//清空模态表单
function autClearModalForm() {
    //清空modal_cron_rule这个表单下所有的input值
    //console.log("清空modal_cron_rule这个表单下所有的input值")
    $("#modal").find("input[type=text], textarea, input[type=email]").val('');
    $("#modal").find("input[type=checkbox]").attr("checked", false);
    $('.modal-footer').show();
}

//提交模态表单
function autSubmitModalForm() {
    //遍历modal表单，将input text的值转为字符串，
    var formData = {}
    $("#modal").find("input[type=text], textarea, input[type=email]").each(function () {
        formData[$(this).attr("name")] = $(this).val()
    });
    //将number的值转为int
    $("#modal").find("input[type=number]").each(function () {
        formData[$(this).attr("name")] = parseInt($(this).val())
    });
    //将checkbox的值转为bool,
    $("#modal").find("input[type=checkbox]").each(function () {
        formData[$(this).attr("name")] = $(this).is(':checked') ? true : false
    });

    console.log(JSON.stringify(formData))

    //先获取数据
    $.ajax({
        url: '/application', // 请求URL
        type: 'POST', // 请求方法
        contentType: 'application/json',
        data: JSON.stringify(formData), // 提交的数据
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
    $.get("/application?id=" + id, function (response, status) {
        // 将 JSON 数据设置为表单值
        if (response.data.length > 0) {
            data = response.data[0]
            console.log(data)
            $.each(data, function (key, value) {
                var selector = "[name='" + key + "']";
                var $element = $(selector);
                if ($.isPlainObject(value)) {
                    $element.val(JSON.stringify(value).replace(/^{|}$/g, ""));
                } else if ($element.is(":radio")) {
                    $(`input[type="radio"][value="${value}"]`).prop('checked', true);
                } else if ($element.is(":checkbox")) {
                    $element.prop("checked", value);
                } else {
                    $element.val(value);
                }
            });
        }
    });
}

function parseBool(str) {
    // 将字符串转换为小写
    str = str.toLowerCase();

    // 检查字符串是否等于 true、yes、1 或 on
    return (str === "true" || str === "yes" || str === "1" || str === "on");
}
