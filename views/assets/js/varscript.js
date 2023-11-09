$(function () {
    // 设置card-body的初始高度
    $(".table-container").height($(window).height() - 3 * $(".card-toolbar").outerHeight() - 31);

    // 监听窗口大小改变事件
    $(window).on("resize", function () {
        // 设置card-body的高度为窗口高度减去card-toolbar的高度
        $(".table-container").height($(window).height() - 3 * $(".card-toolbar").outerHeight() - 31);
    });

    //搜索框
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

    //设置智能开关
    vars = ['auto_add_varscript', 'global_silent', 'ignore_varscript_notify']
    vars.forEach(function (item, index, array) {
        $.get(`/system/jd_cookie-${item}`, function (response) {
            console.log(response)
            if (response.data == "true") {
                $(`#${item}`).html("开")
                //祖父节点变换css
                $(`#${item}`).parent().parent().removeClass("btn-secondary").addClass("btn-info")
            } else {
                $(`#${item}`).html("关")
                $(`#${item}`).parent().parent().removeClass("btn-info").addClass("btn-secondary")
            }
        })
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
function autFillRows(searchvalue) {
    if (!searchvalue) {
        searchvalue = $("#searchInput").val() ? $("#searchInput").val() : ""
    }
    //alert(searchvalue)
    $.get("/varscripts?searchValue=" + searchvalue, function (response) {
        console.log(response)
        if (response.code == 200 && response.data) {
            obj = response.data;
            html = ""
            if (obj) {
                for (var i = 0; i < obj.length; i++) {
                    let qlswitch, qlsilent
                    if (obj[i].on) {
                        qlswitch = "checked"
                    }
                    if (obj[i].silent) {
                        qlsilent = "checked"
                    }
                    html += `<tr>
                        <td>
                          <label class="lyear-checkbox checkbox-primary">
                            <input type="checkbox" name="ids_${obj[i].id}" value="${obj[i].id}">
                            <span></span>
                          </label>
                        </td>
                        <td>${obj[i].id}</td>
                        <td class='truncate' data-toggle='tooltip' data-placement='bottom'>${obj[i].name}</td>
                        <td><label class="lyear-switch switch-solid switch-primary">
                            <input type="checkbox" `+ qlswitch + ` name="switch_` + (obj[i].id) + `" id="switch_` + (obj[i].id) + `" onchange="autHandleCheckboxChangeEvent(this)">
                            <span></span>
                            </label>
                        </td>
                        <td><label class="lyear-switch switch-solid switch-primary">
                            <input type="checkbox" `+ qlsilent + ` name="silent_` + (obj[i].id) + `" id="silent_` + (obj[i].id) + `" onchange="autHandleCheckboxChangeEvent(this)">
                            <span></span>
                            </label>
                        </td>
                        <td class='truncate' data-toggle='tooltip' data-placement='bottom'>${obj[i].vars}</td>
                        <td class='truncate' data-toggle='tooltip' data-placement='bottom'>${obj[i].script}</td>
                        <td class='truncate' data-toggle='tooltip' data-placement='bottom'>${obj[i].vess}</td>
                        <td class='truncate' data-toggle='tooltip' data-placement='bottom'>${obj[i].listen}</td>
                        <td>${obj[i].timeout ? obj[i].timeout : '-'}</td>
                        <td><div class="btn-group">
                            <a class="btn btn-xs btn-default" href="#!" title="编辑" data-toggle="modal" data-target="#myModal" onclick="autFillModalForm(`+ (obj[i].id) + `);$('.modal-footer').show();"><i class="mdi mdi-pencil"></i></a>
                            <a class="btn btn-xs btn-default example-p-1" href="#!" title="删除" onclick="autDelRow(`+ (obj[i].id) + `)"><i class="mdi mdi-window-close"></i></a>
                            </div>
                        </td>
                        </tr>`
                }
            }
            //alert(html)
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
            $("#datasets").html("");
        }
    });
}

//处理表格中的开关
function autHandleCheckboxChangeEvent(checkbox) {
    oper = checkbox.id.split("_")[0]
    switch (oper) {
        case "switch":
            if (checkbox.checked) {
                oper = "enable"
            } else {
                oper = "disable"
            }
            break;
        case "silent":
            if (checkbox.checked) {
                oper = "silent"
            } else {
                oper = "notify"
            }
            break;
    }
    ids = "[" + checkbox.id.split("_")[1] + "]"
    //alert(ids)
    $.ajax({
        type: "PUT",
        url: `/varscripts/${oper}`,
        data: ids,
        dataType: 'json',
        contentType: 'application/json',
        success: function (response) {
            if (response.code == 200) {
                lightyear.notify("操作成功", 'success', 3000);
            } else {
                lightyear.notify(response.msg, 'danger', 1000);
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
                        url: '/varscripts', // 请求URL
                        type: 'DELETE', // 请求方法
                        dataType: 'json', // 返回的数据类型
                        data: "[" + ids.join(",") + "]", // 提交的数据
                        success: function (response) { // 请求成功的回调函数
                            console.log('Success:', response);
                            autFillRows()
                            // 取消勾选所有checkbox
                            $('#check-all').prop('checked', false)
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
                        url: "/varscripts",
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
    //清空modal_varscript_rule这个表单下所有的input值
    //alert("清空modal_varscript_rule这个表单下所有的input值")
    $("#modal").find("input[type=text], textarea, input[type=email]").val('');
    $("#modal").find("input[type=checkbox]").attr("checked", false);
    $('.modal-footer').show();
}

//提交模态表单
function autSubmitModalForm() {
    // 对表单进行序列化，获取表单数据
    var formData = $("#modal").serialize();
    //alert(JSON.stringify(formData))
    //先获取数据
    $.ajax({
        url: '/varscripts', // 请求URL
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
    $.get("/varscripts?id=" + id, function (response) {
        // 将 JSON 数据设置为表单值
        jsonData = response.data;//解析成对象
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
        url: '/varscripts/enable', // 请求URL
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

//关闭静默
function autNotifyRows() {
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
        url: '/varscripts/notify', // 请求URL
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

//开户静默
function autSilentRows() {
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
        url: '/varscripts/silent', // 请求URL
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

//禁用
function autDisableRows() {
    //alert("禁用选中")
    var ids = $('input[name^="ids_"]:checked').map(function () {
        return $(this).val();
    }).get(); // 将所有值添加到一个数组中

    // 如果没有选中任何 checkbox，则返回
    if (ids.length === 0) {
        return;
    }

    // 创建Ajax请求
    $.ajax({
        url: '/varscripts/disable', // 请求URL
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

//设置统一监听群
function autListenRows() {
    //alert("禁用选中")
    var ids = $('input[name^="ids_"]:checked').map(function () {
        return $(this).val();
    }).get(); // 将所有值添加到一个数组中

    // 如果没有选中任何 checkbox，则返回
    if (ids.length === 0) {
        lightyear.notify("未选择行，请先勾选行", "danger", "3000")
        return;
    }

    $.confirm({
        title: '提示',
        content: '' +
            '<form action="" class="formName">' +
            '<div class="form-group">' +
            '<label>请输入监听群</label>' +
            `<input type="text" placeholder="请输入监听群,多群英文逗号隔开" class="listen form-control" required />` +
            '</div>' +
            '</form>',
        buttons: {
            formSubmit: {
                text: '提交',
                btnClass: 'btn-blue',
                action: function () {
                    var name = this.$content.find('.listen').val();
                    //alert(name)
                    // if (!name) {
                    //     $.alert('请输入监听群');
                    //     return false;
                    // }
                    //$.alert('您的姓名是： ' + name);
                    $.ajax({
                        type: "PUT",
                        url: `/varscripts/listen?listen=${name}`,
                        data: "[" + ids.join(",") + "]", // 提交的数据,
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function (response) {
                            //alert(JSON.stringify(response))
                            // 处理成功响应
                            lightyear.notify('修改成功', 'success', 1000);
                            $('#check-all').prop('checked', false)
                            $('input[name^="ids_"]:checked').prop('checked', false);
                            //console.log(response);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            // 处理错误响应
                            lightyear.notify(textStatus + ": " + errorThrown, 'danger', 3000);
                            //console.log(textStatus + ": " + errorThrown);
                        }
                    });
                }
            },
            cancel: {
                text: '取消'
            },
        },
        onContentReady: function () {
            var jc = this;
            this.$content.find('form').on('submit', function (e) {
                e.preventDefault();
                jc.$$formSubmit.trigger('click');
            });
        }
    });
}

//设置统一容器
function autVesRows() {
    //alert("禁用选中")
    var ids = $('input[name^="ids_"]:checked').map(function () {
        return $(this).val();
    }).get(); // 将所有值添加到一个数组中

    // 如果没有选中任何 checkbox，则返回
    if (ids.length === 0) {
        lightyear.notify("未选择行，请先勾选行", "danger", "3000")
        return;
    }

    $.confirm({
        title: '提示',
        content: '' +
            '<form action="" class="formName">' +
            '<div class="form-group">' +
            '<label>请输入青龙容器名称</label>' +
            `<input type="text" placeholder="请输入青龙容器名,多个青龙名英文逗号隔开" class="ves form-control" required />` +
            '</div>' +
            '</form>',
        buttons: {
            formSubmit: {
                text: '提交',
                btnClass: 'btn-blue',
                action: function () {
                    var name = this.$content.find('.ves').val();
                    //alert(name)
                    // if (!name) {
                    //     $.alert('请输入监听群');
                    //     return false;
                    // }
                    //$.alert('您的姓名是： ' + name);
                    $.ajax({
                        type: "PUT",
                        url: `/varscripts/vess?vess=${name}`,
                        data: "[" + ids.join(",") + "]", // 提交的数据,
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function (response) {
                            if (response.code == 200) {
                                //alert(JSON.stringify(response))
                                // 处理成功响应
                                lightyear.notify('修改成功', 'success', 1000);
                                // 取消勾选所有checkbox
                                $('#check-all').prop('checked', false)
                                $('input[name^="ids_"]:checked').prop('checked', false);
                                //刷新页面
                                autFillRows()
                                //console.log(response);
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            // 处理错误响应
                            lightyear.notify(textStatus + ": " + errorThrown, 'danger', 3000);
                            //console.log(textStatus + ": " + errorThrown);
                        }
                    });
                }
            },
            cancel: {
                text: '取消'
            },
        },
        onContentReady: function () {
            var jc = this;
            this.$content.find('form').on('submit', function (e) {
                e.preventDefault();
                jc.$$formSubmit.trigger('click');
            });
        }
    });
}

//排除变量函数
function autExcludeVars() {
    //ajax获取原来的设置
    $.ajax({
        type: "GET",
        url: `/buckets?bucket=jd_cookie&key=exclude_exports`,
        success: function (response) {
            console.log(response)
            $.confirm({
                title: '提示',
                content: '' +
                    '<form action="" class="formName">' +
                    '<div class="form-group">' +
                    '<label>请填写排除变量</label>' +
                    `<textarea class="form-control" name="exclude_exports" rows="5">${response.data[0].kvs[0].value}</textarea>` +
                    '</div>' +
                    '</form>',
                buttons: {
                    formSubmit: {
                        text: '提交',
                        btnClass: 'btn-blue',
                        action: function () {
                            var excExports = this.$content.find('textarea[name="exclude_exports"]').val();
                            var data = {};
                            data[`bucket`] = "jd_cookie"
                            data[`key`] = "exclude_exports"
                            data[`value`] = excExports;
                            console.log(data)
                            $.ajax({
                                type: "POST",
                                url: `/buckets`,
                                data: data, // 提交的数据,
                                success: function (response) {
                                    console.log(response)
                                    lightyear.notify('修改成功', 'success', 1000);
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    // 处理错误响应
                                    lightyear.notify(textStatus + ": " + errorThrown, 'danger', 3000);
                                    console.log(textStatus + ": " + errorThrown);
                                }
                            });
                        }
                    },
                    cancel: {
                        text: '取消'
                    },
                },
                onContentReady: function () {
                    var jc = this;
                    this.$content.find('form').on('submit', function (e) {
                        e.preventDefault();
                        jc.$$formSubmit.trigger('click');
                    });
                }
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // 处理错误响应
            lightyear.notify(textStatus + ": " + errorThrown, 'danger', 3000);
            console.log(textStatus + ": " + errorThrown);
        }
    });

}

//变量存储在“配置文件”还是“环境变量”统一容器
function autIsCfgRows() {
    //alert("禁用选中")
    var ids = $('input[name^="ids_"]:checked').map(function () {
        return $(this).val();
    }).get(); // 将所有值添加到一个数组中

    // 如果没有选中任何 checkbox，则返回
    if (ids.length === 0) {
        lightyear.notify("未选择行，请先勾选行", "danger", "3000")
        return;
    }

    $.confirm({
        title: '提示',
        content: '' +
            '<form action="" class="formName">' +
            '<div class="form-group">' +
            '<label>请选择洞察变量存储位置</label>' +
            `<label class="lyear-radio radio-primary m-t-10">
                <input type="radio" name="is_cfg" value="false" checked>
                <span>环境变量</span>
            </label>
            <label class="lyear-radio radio-primary m-t-10">
                <input type="radio" name="is_cfg" value="true">
                <span>配置文件</span>
            </label>` +
            '</div>' +
            '</form>',
        buttons: {
            formSubmit: {
                text: '提交',
                btnClass: 'btn-blue',
                action: function () {
                    var name = this.$content.find('input[name="is_cfg"]:checked').val();;
                    //alert(name)
                    // if (!name) {
                    //     $.alert('请输入监听群');
                    //     return false;
                    // }
                    //$.alert('您的姓名是： ' + name);
                    $.ajax({
                        type: "PUT",
                        url: `/varscripts/iscfg?iscfg=${name}`,
                        data: "[" + ids.join(",") + "]", // 提交的数据,
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function (response) {
                            //alert(JSON.stringify(response))
                            // 处理成功响应
                            lightyear.notify('修改成功', 'success', 1000);
                            $('#check-all').prop('checked', false)
                            $('input[name^="ids_"]:checked').prop('checked', false);
                            //console.log(response);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            // 处理错误响应
                            lightyear.notify(textStatus + ": " + errorThrown, 'danger', 3000);
                            //console.log(textStatus + ": " + errorThrown);
                        }
                    });
                }
            },
            cancel: {
                text: '取消'
            },
        },
        onContentReady: function () {
            var jc = this;
            this.$content.find('form').on('submit', function (e) {
                e.preventDefault();
                jc.$$formSubmit.trigger('click');
            });
        }
    });
}

//反转参数值
function autToggleButton(id, bucket, param) {
    $.get(`/system/${bucket}-${param}`, function (resp) {
        if (resp.data == "true") {
            resp.data = "false"
        } else {
            resp.data = "true"
        }
        //alert(resp)
        var data = {};
        data[`${bucket}-${param}`] = resp.data

        $.ajax({
            type: "POST",
            url: "/system/params",
            data: data,
            success: function (response) {
                console.log(response)
                // 处理成功响应
                if (response.data == "true") {
                    $(`#${id}`).html("开")
                    $(`#${id}`).parent().parent().removeClass("btn-secondary").addClass("btn-info")
                } else {
                    $(`#${id}`).html("关")
                    $(`#${id}`).parent().parent().removeClass("btn-info").addClass("btn-secondary")
                }

                lightyear.loading('hide');
                lightyear.notify('修改成功', 'success', 3000);
                //console.log(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // 处理错误响应
                lightyear.loading('hide');
                lightyear.notify(textStatus + ": " + errorThrown, 'danger', 1000);
                //console.log(textStatus + ": " + errorThrown);
            },
        });
    })
}