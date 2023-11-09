//当前日志的cronid
var subId

$(function () {
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

    var intervalId; // 保存定时器的ID

    //绑定日志模态框的显示和隐藏事件
    $('#logModal').on('show.bs.modal', function () {
        console.log('模态框显示了');
        $("#log-datasets").html("正在加载日志...")

        //不间断的请求日志
        intervalId = setInterval(function () {
            $.ajax({
                url: `/subscriptions/${subId}/log?t=` + Date.now(), // 请求URL
                type: 'GET', // 请求方法
                success: function (response) { // 请求成功的回调函数
                    console.log('Success:', response);
                    if (response.code == 200) {
                        str = response.data.replace(/\n/g, '<br>');
                        //$("#logModal .modal-body").html(data)
                        // if (response.data.cron.status == 1 && $(".modal-title").html() != `<i class="mdi mdi-spin mdi-chemical-weapon"></i>日志`) {
                        //     $(".modal-title").html(`<i class="mdi mdi-spin mdi-chemical-weapon"></i> ${response.data.cron.name}`)
                        // } else if (response.data.cron.status == 0) {
                        //     $(".modal-title").html(`${response.data.cron.name}`)
                        // }
                        $("#log-datasets").html(str)
                    }
                },
                error: function (xhr, status, error) { // 请求失败的回调函数
                    console.log('Error:', error);
                }
            });
        }, 1000);
    });

    //绑定日志模态框的显示和隐藏事件
    $('#logModal').on('hide.bs.modal', function () {
        console.log('模态框隐藏了');
        clearInterval(intervalId)
    });

    //绑定名称为type的radio的选择事件
    $("input[name='type']").change(function () {
        if ($(this).val() == "public-repo") {//选择公开仓库
            shows = ["branch", "whitelist", "blacklist"]
            hides = ["pull_option", "pull_type.private_key", "pull_type.username", "pull_type.password"]
        } else if ($(this).val() == "private-repo") {//选择私有仓库
            shows = ["branch", "pull_option", "pull_type.private_key", "pull_type.username", "pull_type.password", "whitelist", "blacklist"]
            hides = []
        } else if ($(this).val() == "file") {//选择单个文件
            shows = []
            hides = ["branch", "pull_option", "pull_type.private_key", "pull_type.username", "pull_type.password", "whitelist", "blacklist"]
        }
        for (var i = 0; i < shows.length; i++) {
            //for属性为branch的元素显示
            $("label[for='" + shows[i] + "']").parent().show()
        }
        for (var i = 0; i < hides.length; i++) {
            //for属性为branch的元素隐藏
            $("label[for='" + hides[i] + "']").parent().hide()
        }
    })

    //绑定名称为pull_option的radio的选择事件
    $("input[name='pull_option']").change(function () {
        if ($(this).val() == "ssh-key") {//选择拉取全部
            //for属性为private_key的元素隐藏
            $("label[for='private_key']").parent().show()
            //for属性为username的元素隐藏
            $("label[for='username']").parent().hide()
            //for属性为password的元素隐藏
            $("label[for='password']").parent().hide()
        } else if ($(this).val() == "user-pwd") {//选择拉取白名单
            //for属性为private_key的元素隐藏
            $("label[for='private_key']").parent().hide()
            //for属性为username的元素隐藏
            $("label[for='username']").parent().show()
            //for属性为password的元素隐藏
            $("label[for='password']").parent().show()
        }
    })

    //定时类型的选择事件
    $("input[name='schedule_type']").change(function () {
        if ($(this).val() == "crontab") {
            //for属性为private_key的元素隐藏
            $("label[for='schedule']").parent().show()
            //for属性为username的元素隐藏
            $("label[for='interval']").parent().hide()
        } else if ($(this).val() == "interval") {
            //for属性为private_key的元素隐藏
            $("label[for='schedule']").parent().hide()
            //for属性为username的元素隐藏
            $("label[for='interval']").parent().show()
        }
    })

    //选择公开仓库
    $("input[name='type'][value='public-repo']").prop("checked", true).trigger("change")
    //选择pull_option为user-pwd
    $("input[name='pull_option'][value='user-pwd']").prop("checked", true).trigger("change")
    //选择定时类型为crontab
    $("input[name='schedule_type'][value='crontab']").prop("checked", true).trigger("change")

});


function autSearchRows(event) {
    event.preventDefault(); // 阻止表单的默认提交行为
    const inputValue = $("#searchInput").val(); // 获取输入框的值
    console.log(`正在搜索：${inputValue}`); // 执行搜索操作，这里用console输出结果
    autFillRows(inputValue)
    //$("#searchInput").val(''); // 将输入框中的值清空
}

//获取规则并显示
function autFillRows(searchvalue, func) {
    if (!searchvalue) {
        searchvalue = $("#searchInput").val() ? $("#searchInput").val() : ""
    }
    //console.log(searchvalue)
    timestamp = new Date().getTime()
    $.get(`/subscriptions?searchValue=${searchvalue}&t=${timestamp}`, function (response) {
        console.log(response)
        if (response.code == 200) {
            obj = response.data;
            html = ""
            if (obj && obj.length >= 0) {
                //排序，把正在运行的排到前面
                obj.sort(function (a, b) {
                    return b.status - a.status;
                })
                //把置顶的排在前面
                obj.sort(function (a, b) {
                    return b.isPinned - a.isPinned;
                });

                for (var i = 0; i < obj.length; i++) {
                    //状态
                    let status
                    if (obj[i].status == 1) {
                        status = `<button class="btn btn-info btn-xs"><i class="mdi mdi-spin mdi-loading"></i> 运行中</button>`
                    } else if (obj[i].isDisabled) {
                        status = `<button class="btn btn-danger btn-xs"><i class="mdi mdi-close-circle-outline"></i> 已禁用</button>`
                    } else if (obj[i].status == 0) {
                        status = `<button class="btn btn-default btn-xs"><i class="mdi mdi-clock"></i> 空闲中</button>`
                    }

                    //操作
                    let opertion = `<a href="#!" title="运行" onclick="autMoveRow(${obj[i].id},'run',this)"><i class="mdi mdi-play-circle-outline"></i></a>`
                    if (obj[i].status != 0) {
                        opention = `<a href="#!" title="停止" onclick="autMoveRow(${obj[i].id},'stop',this)"><i class="mdi mdi-stop-circle-outline"></i></a>`
                    }

                    //禁用状态
                    let name, nable, icon = ""
                    if (obj[i].isDisabled) {
                        name = "启用"
                        nable = "enable"
                        icon = "mdi-check"
                    } else {
                        name = "禁用"
                        nable = "disable"
                        icon = "mdi-block-helper"
                    }

                    //置顶状态
                    let topName, top, topIcon = ""
                    if (obj[i].isPinned) {
                        topName = "取消置顶"
                        top = "unpin"
                        //名称前面加图标
                        topIcon = `<i class="mdi mdi-pin"></i>${obj[i].name}`
                    } else {
                        topName = "置顶"
                        top = "pin"
                        //名称
                        topIcon = `${obj[i].name}`
                    }


                    html += "<tr>" +
                        `<td>
                          <label class="lyear-checkbox checkbox-primary">
                            <input type="checkbox" name="ids_${obj[i].id}" value="${obj[i].id}"><span></span>
                          </label>
                        </td>
                        <td>${i + 1}</td>
                        <td>${topIcon}</td>
                        <td>${obj[i].url}</td>
                        <td>${obj[i].branch}</td>
                        <td>${obj[i].schedule}</td>
                        <td id="status_${obj[i].id}">${status}</td>
                        <td>
                            <div class="btn-group" id="operation_${obj[i].id}">
                                ${opertion}
                                <a href="#!" title="日志" id="realtimelog" data-toggle="modal" data-target="#logModal" onclick="subId=${obj[i].id};"><i class="mdi mdi-file-outline"></i></a>
                                <a href="javascript:void(0)" data-toggle="dropdown"><i class="mdi mdi-menu"></i></a>
                                <ul class="dropdown-menu dropdown-menu-right">
                                    <li><a href="#!" data-toggle="modal" data-target="#myModal" onclick="autFillModalForm(${obj[i].id});$('.modal-footer').show();"><i class="mdi mdi-pencil"></i>编辑</a></li>
                                    <li><a href="#!" onclick="autMoveRow(${obj[i].id},'${nable}')"><i class="mdi ${icon}"></i>${name}</a></li>
                                    <li><a href="#!" title="删除" onclick="autDelRow(`+ (obj[i].id) + `)"><i class="mdi mdi-window-close"></i>删除</a></li>
                                </ul>
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
        } else {
            $("#datasets").html("")
        }

        //执行回调函数
        func && func()
    });
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
                    //$.console.log('你点击了确认!');
                    var ids = $('input[name^="ids_"]:checked').map(function () {
                        return parseInt($(this).val());
                    }).get(); // 将所有值添加到一个数组中

                    // 如果没有选中任何 checkbox，则返回
                    if (ids.length === 0) {
                        return;
                    }
                    timestamp = new Date().getTime()
                    // 创建Ajax请求
                    $.ajax({
                        url: `/subscriptions`, // 请求URL
                        type: 'DELETE', // 请求方法
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
                    timestamp = new Date().getTime()
                    //$.console.log('你点击了确认!');
                    $.ajax({
                        type: "DELETE",
                        url: "/subscriptions",
                        data: JSON.stringify([id]),
                        contentType: "application/json",
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
    //清空modal_sub_rule这个表单下所有的input值
    //console.log("清空modal_sub_rule这个表单下所有的input值")
    $("#modal").find("input[type=text], textarea, input[type=email],input[type=number]").val('');
    $("#modal").find("input[type=checkbox]").attr("checked", false);
    $('.modal-footer').show();
}

//提交模态表单
function autSubmitModalForm() {
    // 对表单进行序列化，获取表单数据
    var formData = {
        "id": $("#modal").find("input[name='id']").val() ? parseInt($("#modal").find("input[name='id']").val()) : 0,
        "name": $("#modal").find("input[name='name']").val(),
        "type": $("#modal").find("input[name='type']:checked").val(),
        "url": $("#modal").find("input[name='url']").val(),
        "branch": $("#modal").find("input[name='branch']").val(),
        "schedule": $("#modal").find("input[name='schedule']").val(),
        "pull_option": $("#modal").find("input[name='pull_option']:checked").val(),
        "pull_type": {
            "private_key": $("#modal").find("textarea[name='pull_type.private_key']").val(),
            "username": $("#modal").find("input[name='pull_type.username']").val(),
            "password": $("#modal").find("input[name='pull_type.password']").val(),
        },
        "whitelist": $("#modal").find("input[name='whitelist']").val(),
        "blacklist": $("#modal").find("input[name='blacklist']").val(),
        "dependences": $("#modal").find("input[name='dependences']").val(),
        "extensions": $("#modal").find("input[name='extensions']").val(),
        "proxy": $("#modal").find("input[name='proxy']").val(),
        "autoAddCron": $("#modal").find("input[name='autoAddCron']").is(':checked') ? 1 : 0,//是否自动添加定时任务
        "autoDelCron": $("#modal").find("input[name='autoDelCron']").is(':checked') ? 1 : 0,//是否自动删除定时任务
    }

    console.log(formData)

    method = "POST"
    if (formData.id > 0) {
        method = "PUT"
    }

    //先获取数据
    $.ajax({
        url: '/subscriptions', // 请求URL
        type: method, // 请求方法
        data: JSON.stringify(formData), // 提交的数据
        contentType: 'application/json',
        success: function (response) { // 请求成功的回调函数
            console.log('Success:', response);
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
    timestamp = new Date().getTime()
    //先获取数据
    $.get(`/subscriptions/${id}?t=${timestamp}`, function (response, status) {
        // 将 JSON 数据设置为表单值
        jsonData = response.data;//解析成对象
        console.log(jsonData)
        $.each(jsonData, function (key, value) {
            var selector = "[name='" + key + "']";
            var $element = $(selector);
            if ($.isPlainObject(value)) {
                //console.log(key, value)
                $.each(value, function (subkey, subvalue) {
                    var subselector = "[name='" + key + "." + subkey + "']";
                    var $subelement = $(subselector);
                    if ($subelement.is(":checkbox")) {
                        $subelement.prop("checked", parseBool(subvalue.toString()));
                    } else if ($element.is(":radio")) {
                        $(`input[type="radio"][value="${value}"]`).prop('checked', true);
                    } else {
                        $subelement.val(subvalue);
                    }
                });
            } else if ($element.is(":radio")) {
                //console.log(key, value)
                $("input[name='" + key + "'][value='" + value + "']").prop('checked', true).trigger("change");
            } else if ($element.is(":checkbox")) {
                //console.log(key, value)
                $element.prop("checked", parseBool(value.toString()));
            } else {
                //console.log(key, value)
                $element.val(value);
            }
        });
    });
}

//启用规则
function autEnableRows() {
    var ids = $('input[name^="ids_"]:checked').map(function () {
        return parseInt($(this).val());
    }).get(); // 将所有值添加到一个数组中

    // 如果没有选中任何 checkbox，则返回
    if (ids.length === 0) {
        lightyear.notify('请选择要启用的规则', 'danger', 1000);
        return;
    }
    //console.log(ids)

    // 创建Ajax请求
    $.ajax({
        url: '/subscriptions/enable', // 请求URL
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
        lightyear.notify('请选择要禁用的规则', 'danger', 1000);
        return;
    }

    // 创建Ajax请求
    $.ajax({
        url: '/subscriptions/disable', // 请求URL
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

//操作规则
function autMoveRow(id, upordown, element) {
    switch (upordown) {
        case "run":
            console.log("运行")
            $.ajax({
                url: '/subscriptions/run', // 请求URL
                type: 'PUT', // 请求方法
                dataType: 'json', // 返回的数据类型
                data: JSON.stringify([id]), // 提交的数据
                contentType: 'application/json',
                success: function (response) { // 请求成功的回调函数
                    console.log('Success:', response);
                    if (response.code == 200) {
                        //lightyear.notify('运行成功', 'success', 3000);
                        //修改状态
                        $("#status_" + id).html(`<button class="btn btn-info btn-xs"><i class="mdi mdi-spin mdi-chemical-weapon"></i> 运行中</button>`)
                        //修改操作
                        $(element).attr('onclick', `autMoveRow(${id}, 'stop', this)`)
                        element.title = "停止"
                        $(element).html(`<i class="mdi mdi-stop-circle-outline"></i>`)
                    } else {
                        lightyear.notify('运行失败', 'danger', 1000);
                    }
                },
                error: function (xhr, status, error) { // 请求失败的回调函数
                    console.log('Error:', error);
                    lightyear.notify('运行失败', 'danger', 1000);
                }
            });
            break;
        case "stop":
            console.log("停止")
            $.ajax({
                url: '/subscriptions/stop', // 请求URL
                type: 'PUT', // 请求方法
                dataType: 'json', // 返回的数据类型
                data: JSON.stringify([id]), // 提交的数据
                contentType: 'application/json',
                success: function (response) { // 请求成功的回调函数
                    //console.log('Success:', response);
                    if (response.code == 200) {
                        //lightyear.notify('停止成功', 'success', 3000);
                        //修改状态
                        $("#status_" + id).html(`<button class="btn btn-warning btn-xs"><i class="mdi mdi-clock"></i> 已停止</button>`)
                        //修改操作
                        $(element).attr('onclick', `autMoveRow(${id}, 'run', this)`)
                        element.title = "运行"
                        $(element).html(`<i class="mdi mdi-play-circle-outline"></i>`)
                    } else {
                        lightyear.notify('停止失败', 'danger', 3000);
                    }
                },
                error: function (xhr, status, error) { // 请求失败的回调函数
                    console.log('Error:', error);
                    lightyear.notify('停止失败', 'danger', 1000);
                }
            });
            break;
        case "edit":
            //console.log("编辑")
            autFillModalForm(id)
            break;
        case "delete":
            //console.log("删除")
            $.ajax({
                url: '/subscriptions', // 请求URL
                type: 'DELETE', // 请求方法
                dataType: 'json', // 返回的数据类型
                data: JSON.stringify([id]), // 提交的数据
                contentType: 'application/json',
                success: function (response) { // 请求成功的回调函数
                    //console.log('Success:', response);
                    if (response.code == 200) {
                        autFillRows()
                    }
                },
                error: function (xhr, status, error) { // 请求失败的回调函数
                    console.log('Error:', error);
                }
            });
            break;
        default:
            $.ajax({
                url: `/subscriptions/${upordown}`, // 请求URL
                type: 'PUT', // 请求方法
                dataType: 'json', // 返回的数据类型
                data: JSON.stringify([id]), // 提交的数据
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
}

function parseBool(str) {
    // 将字符串转换为小写
    str = str.toLowerCase();

    // 检查字符串是否等于 true、yes、1 或 on
    return (str === "true" || str === "yes" || str === "1" || str === "on");
}

//格式化毫秒
function formatMilliseconds(milliseconds) {
    if (milliseconds < 1000) {
        return `${milliseconds.toString}毫秒`
    }
    let seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) {
        return `${seconds}秒`
    }
    let minutes = Math.floor(seconds / 60);
    seconds %= 60;
    if (minutes < 60) {
        return `${minutes}分${seconds}秒`
    }
    let hours = Math.floor(minutes / 60);
    minutes %= 60;

    return `${hours.toString()}时${minutes.toString()}分${seconds.toString()}秒`;
}