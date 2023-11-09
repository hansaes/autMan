$(function () {
    // 设置card-body的初始高度
    $(".table-container").height($(window).height() - 3 * $(".card-toolbar").outerHeight() - 31);

    // 监听窗口大小改变事件
    $(window).on("resize", function () {
        // 设置card-body的高度为窗口高度减去card-toolbar的高度
        $(".table-container").height($(window).height() - 3 * $(".card-toolbar").outerHeight() - 31);
    });

    //搜索栏
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

    //设置开关
    vars = ['auto_scan_varlink', 'ignore_varlink_notify', 'varlink_remove_duplicates', 'auto_add_varlink', 'varlink_with_from']
    vars.forEach(function (item, index, array) {
        $.get(`/system/jd_cookie-${item}`, function (response) {
            if (response.data == "true") {
                $(`#${item}`).html("开")
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
                //alert(JSON.stringify(response))
                // 处理成功响应
                if (resp.data == "true") {
                    $(`#${id}`).html("开")
                    $(`#${id}`).parent().parent().removeClass("btn-secondary").addClass("btn-info")
                } else {
                    $(`#${id}`).html("关")
                    $(`#${id}`).parent().parent().removeClass("btn-info").addClass("btn-secondary")
                }

                lightyear.loading('hide');
                lightyear.notify('修改成功', 'success', 1000);
                //console.log(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // 处理错误响应
                lightyear.loading('hide');
                lightyear.notify(textStatus + ": " + errorThrown, 'danger', 3000);
                //console.log(textStatus + ": " + errorThrown);
            },
        });
    })
}

//获取搬运规则并显示
function autFillRows(searchvalue) {
    if (!searchvalue) {
        searchvalue = $("#searchInput").val()?$("#searchInput").val():""
    }
    //alert(searchvalue)
    $.get("/varlinks?searchValue=" + searchvalue, function (response) {
        console.log(response)
        if (response.code == 200 && response.data) {
            obj = response.data;
            html = ""
            for (var i = 0; i < obj.length; i++) {
                let qlswitch = ""
                if (obj[i].on) {
                    qlswitch = "checked"
                }
                if (obj[i].listen == "") {
                    obj[i].listen = "-"
                } else {
                    //将逗号全部替换为换行符
                    obj[i].listen = obj[i].listen.replace(/,/g, "<br>")
                }
                //变量
                let varients = []
                for (var j = 0; j < obj[i].var_key_maps.length; j++) {
                    if (obj[i].var_key_maps[j].var) {
                        varients.push(obj[i].var_key_maps[j].var)
                    }
                }
                let vars = varients.join(",")

                html += "<tr>" +
                    `<td>
                      <label class="lyear-checkbox checkbox-primary">
                        <input type="checkbox" name="ids_${obj[i].id}" value="${obj[i].id}"><span></span>
                      </label>
                    </td>`+
                    "<td>" + (obj[i].id) + "</td>" +//name
                    "<td class='truncate' data-toggle='tooltip' data-placement='bottom'>" + obj[i].name + "</td>" +//开关状态
                    "<td>" + `<label class="lyear-switch switch-solid switch-primary">
                    <input type="checkbox" `+ qlswitch + ` name="switch_` + (obj[i].id) + `" id="switch_` + (obj[i].id) + `" onchange="autHandleCheckboxChangeEvent(this)">
                    <span></span>
                </label>` + "</td>" +
                    "<td>" + obj[i].link + "</td>" +
                    `<td class='truncate' data-toggle='tooltip' data-placement='bottom'>${vars}</td>
                    <td class='truncate' data-toggle='tooltip' data-placement='bottom'>${obj[i].listen}</td>
                    <td><div class="btn-group">
                        <a class="btn btn-xs btn-default" href="#!" title="编辑" data-toggle="modal" data-target="#myModal" onclick="autFillModalForm(`+ (obj[i].id) + `);$('.modal-footer').show();"><i class="mdi mdi-pencil"></i></a>
                        <a class="btn btn-xs btn-default example-p-1" href="#!" title="删除" onclick="autDelRow(`+ (obj[i].id) + `)"><i class="mdi mdi-window-close"></i></a>
                        </div>
                    </td>
                    </tr>`
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
            $("#datasets").html("");
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
            url: "/varlinks/enable",
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
            url: "/varlinks/disable",
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
function autDelRows() {
    var ids = $('input[name^="ids_"]:checked').map(function () {
        return $(this).val();
    }).get(); // 将所有值添加到一个数组中

    // 如果没有选中任何 checkbox，则返回
    if (ids.length === 0) {
        lightyear.notify("未选择行，请先勾选行", "danger", "3000")
        return;
    }

    $.alert({
        title: '提示框',
        content: '确定删除？',
        buttons: {
            confirm: {
                text: '确认',
                btnClass: 'btn-primary',
                action: function () {
                    lightyear.loading('show');
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
                        url: '/varlinks', // 请求URL
                        type: 'DELETE', // 请求方法
                        dataType: 'json', // 返回的数据类型
                        data: "[" + ids.join(",") + "]", // 提交的数据
                        success: function (response) { // 请求成功的回调函数
                            console.log('Success:', response);
                            if (response.code == 200) {
                                autFillRows()
                                lightyear.loading('hide');
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
                        url: "/varlinks",
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
    //清空modal_varlink_rule这个表单下所有的input值
    //alert("清空modal_varlink_rule这个表单下所有的input值")
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
        url: '/varlinks', // 请求URL
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
    $.get("/varlinks?id=" + id, function (response) {
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
        //具有特点的
        $("#var1").val(jsonData.var_key_maps[0].var)
        $("#key1").val(jsonData.var_key_maps[0].key)
        $("#var2").val(jsonData.var_key_maps[1].var)
        $("#key2").val(jsonData.var_key_maps[1].key)
        $("#convar1").val(jsonData.con_key_maps[0].var)
        $("#conkey1").val(jsonData.con_key_maps[0].key)
    });
}

//启用规则
function autEnableRows() {
    var ids = $('input[name^="ids_"]:checked').map(function () {
        return $(this).val();
    }).get(); // 将所有值添加到一个数组中

    // 如果没有选中任何 checkbox，则返回
    if (ids.length === 0) {
        lightyear.notify("未选择行，请先勾选行", "danger", "3000")
        return;
    }
    //alert(ids)

    // 创建Ajax请求
    $.ajax({
        url: '/varlinks/enable', // 请求URL
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

//禁用规则
function autDisableRows() {
    var ids = $('input[name^="ids_"]:checked').map(function () {
        return $(this).val();
    }).get(); // 将所有值添加到一个数组中

    // 如果没有选中任何 checkbox，则返回
    if (ids.length === 0) {
        lightyear.notify("未选择行，请先勾选行", "danger", "3000")
        return;
    }

    // 创建Ajax请求
    $.ajax({
        url: '/varlinks/disable', // 请求URL
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

//监听
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
                        url: `/varlinks/listen?listen=${name}`,
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
                            autFillRows()
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