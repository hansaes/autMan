var cronId//当前日志的cronid

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


    var intervalId//日志不间断请求的id

    //绑定日志模态框的显示和隐藏事件
    $('#logModal').on('show.bs.modal', function () {
        console.log('模态框显示了');
        $("#log-datasets").html("正在加载日志...")

        //不间断的请求日志
        intervalId = setInterval(function () {
            $.ajax({
                url: `/crons/${cronId}/log?t=` + Date.now(), // 请求URL
                type: 'GET', // 请求方法
                success: function (response) { // 请求成功的回调函数
                    console.log('Success:', response);
                    if (response.code == 200) {
                        str = response.data.replace(/\n/g, '<br>');
                        $("#log-datasets").html(str)
                    }
                },
                error: function (xhr, status, error) { // 请求失败的回调函数
                    console.log('Error:', error);
                }
            });
        }, 1000);
    });

    $('#logModal').on('hide.bs.modal', function () {
        console.log('模态框隐藏了');
        clearInterval(intervalId)
    });
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
    console.log("查询定时任务：" + searchvalue)
    timestamp = new Date().getTime()
    $.get(`/crons?searchValue=${searchvalue}&t=${timestamp}`, function (response, status) {
        //显示加载动画
        lightyear.loading('show');
        console.log(response)
        if (response.code == 200) {
            obj = response.data;
            html = ""
            if (obj && obj.length >= 0) {
                //按照最后运行时间排序
                obj.sort(function (a, b) {
                    return b.last_running_time - a.last_running_time;
                });
                //把新增的排在前面
                obj.sort(function (a, b) {
                    return b.created - a.created;
                });
                //把禁用的排在后面
                obj.sort(function (a, b) {
                    return a.isDisabled - b.isDisabled;
                });
                //把置顶的排在前面
                obj.sort(function (a, b) {
                    return b.isPinned - a.isPinned;
                });
                //排序，把正在运行的排到前面
                obj.sort(function (a, b) {
                    return a.status - b.status;
                });


                //显示
                for (var i = 0; i < obj.length; i++) {
                    //最后运行时间
                    let lastRunningTime = "-"
                    if (obj[i].last_running_time) {
                        lastRunningTime = new Date(obj[i].last_running_time).toLocaleString()
                    }
                    //状态
                    let status = ""
                    if (obj[i].status == 0) {//运行中
                        status = `<button class="btn btn-info btn-xs"><i class="mdi mdi-spin mdi-chemical-weapon"></i> 运行中</button>`
                    } else if (obj[i].isDisabled) {//禁用
                        status = `<button class="btn btn-danger btn-xs"><i class="mdi mdi-close-circle-outline"></i> 已禁用</button>`
                    } else if (obj[i].status == 1) {//空闲
                        status = `<button class="btn btn-default btn-xs"><i class="mdi mdi-clock"></i> 空闲中</button>`
                    }

                    //操作
                    let operation = ""
                    if (obj[i].status == 0) {
                        operation = `<a href="#!" title="停止" onclick="autMoveRow(${obj[i].id},'stop',this)"><i class="mdi mdi-stop-circle-outline"></i></a>`
                    } else {
                        operation = `<a href="#!" title="运行" onclick="autMoveRow(${obj[i].id},'run',this)"><i class="mdi mdi-play-circle-outline"></i></a>`
                    }

                    //上次执行时长
                    let seconds = "-"
                    if (obj[i].last_execution_time) {
                        seconds = formatMilliseconds(obj[i].last_execution_time)
                    }

                    //禁用状态
                    let name, nable, icon = ""
                    if (obj[i].isDisabled == 1) {
                        name = "启用"
                        nable = "enable"
                        icon = "mdi-check"
                    } else if (obj[i].isDisabled == 0) {
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
                        <td class='truncate' data-toggle='tooltip' data-placement='bottom'>${topIcon}</td>
                        <td><a href='#!' data-toggle="modal" data-target="#codeModal" onclick='codeModal(this)'>${obj[i].command}</a></td>
                        <td class='truncate' data-toggle='tooltip' data-placement='bottom'>${obj[i].schedule}</td>
                        <td>${lastRunningTime}</td>
                        <td>${seconds}</td>
                        <td>${obj[i].next_running_time}</td>
                        <td id="status_${obj[i].id}">${status}</td>
                        <td>
                            <div class="btn-group" id="operation_${obj[i].id}">
                                ${operation}
                                <a href="#!" title="日志" id="realtimelog" data-toggle="modal" data-target="#logModal" onclick="cronId=${obj[i].id};"><i class="mdi mdi-file-outline"></i></a>
                                <a href="javascript:void(0)" data-toggle="dropdown"><i class="mdi mdi-menu"></i></a>
                                <ul class="dropdown-menu dropdown-menu-right">
                                    <li><a href="#!" data-toggle="modal" data-target="#myModal" onclick="autFillModalForm(${obj[i].id});$('.modal-footer').show();"><i class="mdi mdi-pencil"></i>编辑</a></li>
                                    <li><a href="#!" onclick="autMoveRow(${obj[i].id},'${nable}')"><i class="mdi ${icon}"></i>${name}</a></li>
                                    <li><a href="#!" title="${topName}" onclick="autMoveRow(${obj[i].id},'${top}')"><i class="mdi mdi-pin"></i>${topName}</a></li>
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
            //关闭加载动画
            lightyear.loading('hide');
            //执行回调函数
            if (func) {
                func()
            }
        }
    });
}

function codeModal(element) {
    //获取element中的内容
    let code = $(element).html()
    arr = code.split("/");
    nodeName = arr[1];
    parentName = arr[0];
    console.log(nodeName, parentName)
    //请求后台获取代码
    $.ajax({
        'url': `/scripts/${nodeName}?path=${parentName}`,
        'type': 'GET',
        'success': function (data) {
            if (data.code == 200) {
                // 在此处处理返回的数据
                $("#codeModalLabel").html(`${nodeName}`)
                $("#code-datasets").html(data.data.replace(/\n/g, "<br>").replace(/\s/g, "&nbsp;"));
            }
        },
        'error': function (xhr, status, error) {
            console.log('Error:', error);
        },
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

                    //加载动画
                    lightyear.loading('show');

                    // 创建Ajax请求
                    $.ajax({
                        url: '/crons', // 请求URL
                        type: 'DELETE', // 请求方法
                        dataType: 'json', // 返回的数据类型
                        data: JSON.stringify(ids), // 提交的数据
                        success: function (response) { // 请求成功的回调函数
                            console.log('Success:', response);
                            if (response.code == 200) {
                                autFillRows()
                                //关闭动画
                                lightyear.loading('hide');
                            }
                        },
                        error: function (xhr, status, error) { // 请求失败的回调函数
                            console.log('Error:', error);
                            //关闭动画
                            lightyear.loading('hide');
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
                    //$.console.log('你点击了确认!');
                    $.ajax({
                        type: "DELETE",
                        url: "/crons",
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
    //清空modal_cron_rule这个表单下所有的input值
    //console.log("清空modal_cron_rule这个表单下所有的input值")
    $("#modal").find("input[type=text], textarea, input[type=email]").val('');
    $("#modal").find("input[type=checkbox]").attr("checked", false);
    $('.modal-footer').show();
}

//提交模态表单
function autSubmitModalForm() {
    // 对表单进行序列化，获取表单数据
    // 对表单进行序列化，获取表单数据
    var formData = {
        id: $("#id").val() ? parseInt($("#id").val()) : 0,
        name: $("#name").val(),
        command: $("#command").val(),
        schedule: $("#schedule").val(),
        timeout: $("#timeout").val(),
        labels: $('#labels').val().split(','),
        status: 1,
    }
    console.log(JSON.stringify(formData))
    var type = 'POST'
    if (formData.id > 0) {
        type = 'PUT'
    }
    //先获取数据
    $.ajax({
        url: '/crons', // 请求URL
        type: type, // 请求方法
        data: JSON.stringify(formData), // 提交的数据
        contentType: 'application/json',
        success: function (response) { // 请求成功的回调函数
            console.log('响应：', response);
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
    $.get(`/crons/${id}?t=${timestamp}`, function (response, status) {
        // 将 JSON 数据设置为表单值
        jsonData = response.data;//解析成对象
        $.each(jsonData, function (key, value) {
            var selector = "[name='" + key + "']";
            var $element = $(selector);
            if ($element.hasClass("js-tags-input") && $.isArray(value)) {//如果是标签组件
                $element.importTags(value.join(","));//导入标签
            } else if ($.isPlainObject(value)) {//如果是对象
                $element.val(JSON.stringify(value).replace(/^{|}$/g, ""));
            } else if ($element.is(":radio")) {//如果是单选框
                $(`input[type="radio"][value="${value}"]`).prop('checked', true);
            } else if ($element.is(":checkbox")) {//如果是复选框
                $element.prop("checked", parseBool(value.toString()));
            } else {//其他
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
        return;
    }
    //console.log(ids)

    // 创建Ajax请求
    $.ajax({
        url: '/crons/enable', // 请求URL
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
        url: '/crons/disable', // 请求URL
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

//操作规则
function autMoveRow(id, upordown, element) {
    switch (upordown) {
        case "run":
            console.log("运行")
            $.ajax({
                url: '/crons/run', // 请求URL
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
                        //autFillRows()
                    } else {
                        lightyear.notify('运行失败', 'danger', 3000);
                    }
                },
                error: function (xhr, status, error) { // 请求失败的回调函数
                    console.log('Error:', error);
                    lightyear.notify('运行失败', 'danger', 3000);
                }
            });
            break;
        case "stop":
            console.log("停止")
            $.ajax({
                url: '/crons/stop', // 请求URL
                type: 'PUT', // 请求方法
                dataType: 'json', // 返回的数据类型
                data: JSON.stringify([id]), // 提交的数据
                contentType: 'application/json',
                success: function (response) { // 请求成功的回调函数
                    console.log('Success:', response);
                    if (response.code == 200) {
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
                    lightyear.notify('停止失败', 'danger', 3000);
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
                url: '/crons', // 请求URL
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
        default://unpin、pin、enable、disable
            $.ajax({
                url: `/crons/${upordown}`, // 请求URL
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


function formatMilliseconds(milliseconds) {
    if (milliseconds < 1000) {
        return `${milliseconds}毫秒`
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